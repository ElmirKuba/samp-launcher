import { Injectable } from '@angular/core';
import { ElectronService } from '../core/services/electron.service';
import { BehaviorSubject } from 'rxjs';
import {
  DownloadFilesStatus,
  IDownloadProgress,
} from '../interfaces/files.interfaces';
import { IPC_ELECTRON_IDENTIFIERS } from '../../../app/helpers/ipc-identifiers';
import { StorageService } from '../core/services/storage.service';
import { ToastrService } from 'ngx-toastr';
// import { CrossoverService } from './crossover.service';

/** Сервис для работы с файлами в лаунчере */
@Injectable({
  providedIn: 'root',
})
export class FilesAngularService {
  /** BehaviorSubject для отслеживания прогресса загрузки */
  private downloadProgress = new BehaviorSubject<IDownloadProgress | null>(
    null
  );
  /** BehaviorSubject для отслеживания распаковки Crossover */
  private extractCrossover = new BehaviorSubject<string | null>(null);
  /** BehaviorSubject для отслеживания прогресса загрузки */
  private downloadFilesStatus = new BehaviorSubject<DownloadFilesStatus>(
    DownloadFilesStatus.STATUS_UNDEFINED
  );
  /** Причина ошибки скачивания файлов */
  private reasonErrorDownload: any | null = null;

  constructor(
    private electronService: ElectronService,
    private storageService: StorageService,
    private toastrService: ToastrService // private crossoverService: CrossoverService
  ) {
    this.electronService.ipcRenderer.on(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronDownloadProgress,
      (event, { loaded, total }) => {
        const progressDecimal = total ? Math.floor((loaded / total) * 100) : 0;

        this.setDownloadProgress({ loaded, total, progressDecimal });
      }
    );

    this.electronService.ipcRenderer.on(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronDownloadCompleteSuccess,
      (event, { _ }) => {
        event;
        _;

        this.setDownloadFilesStatus(DownloadFilesStatus.SUCCESS_COMPLETE);
      }
    );

    this.electronService.ipcRenderer.on(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronDownloadProcessError,
      (event: any, { error }) => {
        this.setDownloadFilesStatus(DownloadFilesStatus.ERROR);
        this.setReasonErrorDownload(error);
      }
    );
  }

  /** Проверка доступности удаленного файла по URL */
  async checkRemoteFileFromURL(url: string): Promise<boolean> {
    if (!this.electronService || !this.electronService.ipcRenderer) {
      throw new Error('Electron и/или ipcRenderer не инициализирован(-ы)!');
    }

    const resultHead = await this.electronService.ipcRenderer.invoke(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronCheckRemoteFileFromURL,
      { url }
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return resultHead.success;
  }

  /**
   * Скачивает файл с указанного URL и сохраняет его по указанному пути,
   * предоставляя информацию о прогрессе загрузки.
   * @param url URL для скачивания файла
   * @param savePath Путь для сохранения файла
   * @param fullPathWithName Путь для сохранения файла с учетом его наименования и расширения
   * @param nameFile Наименование файла
   */
  async downloadFileWithProgress(
    url: string,
    savePath: string,
    fullPathWithName: string
  ): Promise<void> {
    try {
      await this.electronService.ipcRenderer.invoke(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        IPC_ELECTRON_IDENTIFIERS.fileInteraction
          .electronDownloadFileWithProgress,
        { url, savePath, fullPathWithName }
      );
    } catch (azaza) {
      //
    }
  }

  /**
   * Метод для отмены текущего процесса скачивания файла.
   * Вызывается с фронтенда (например, по клику на кнопку "Отмена").
   */
  public async cancelDownload(): Promise<void> {
    const pathForFileCrossover = this.storageService.getPathForFileCrossover();

    const resultCancel = await this.electronService.ipcRenderer.invoke(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronCancelDownloadFile,
      { pathForFileCrossover }
    );

    this.setDownloadProgress({
      loaded: 0,
      total: 0,
      progressDecimal: 0,
    });

    if (resultCancel.success) {
      this.toastrService.success(
        'Отмена скачивания файла прошла успешно!',
        'Хорошие новости'
      );
    } else {
      this.toastrService.error(
        'Отмена скачивания файла произошла с ошибкой!',
        'Ошибка при отмене скачивания файла'
      );
    }
  }

  /** Распаковка архива с отслеживанием статуса и состояния */
  async extractArchive(archivePath: string, outputDir: string) {
    try {
      if (!this.electronService.fs.existsSync(outputDir)) {
        this.electronService.fs.mkdirSync(outputDir, {
          recursive: true,
        });
      }

      await this.electronService.extract(archivePath, {
        dir: outputDir,
        onEntry: (entry) => {
          this.setExtractCrossover(entry.fileName);
        },
      });

      this.setExtractCrossover(null);

      this.toastrService.success(
        'Crossover успешно распакован',
        'Хорошие новости'
      );
    } catch (err) {
      this.setExtractCrossover(null);

      this.toastrService.error(
        'Ошибка при распаковке Crossover',
        'Ошибка при работе с Crossover'
      );
    }
  }

  /** Удаление файла по пути */
  public removeFileForPath(path: string) {
    try {
      if (this.electronService.fs.existsSync(path)) {
        this.electronService.fs.unlinkSync(path);
      }
    } catch (error) {}
  }

  /** Получить поток состояния статуса работы Crossover */
  public getDownloadProgress(): BehaviorSubject<IDownloadProgress | null> {
    return this.downloadProgress;
  }

  /** Установить новый статус работы Crossover */
  public setDownloadProgress(newStatus: IDownloadProgress): void {
    this.downloadProgress.next(newStatus);
  }

  /** Получить поток распаковки Crossover */
  public getExtractCrossover(): BehaviorSubject<string | null> {
    return this.extractCrossover;
  }

  /** Установить состояние потока расспаковки Crossover */
  public setExtractCrossover(status: string | null) {
    this.extractCrossover.next(status);
  }

  /** Установить статус загрузки файла */
  public setDownloadFilesStatus(newStatus: DownloadFilesStatus) {
    this.downloadFilesStatus.next(newStatus);
  }

  /** Получить поток статуса загрузки файла */
  public getDownloadFilesStatus(): BehaviorSubject<DownloadFilesStatus> {
    return this.downloadFilesStatus;
  }

  /** Установить причину ошибки скачивания файлов */
  public setReasonErrorDownload(error: any) {
    this.reasonErrorDownload = error;
  }

  /** Получить один раз причину ошибки скачивания файлов */
  public getReasonErrorDownload() {
    const reasonErrorDownload = this.reasonErrorDownload;
    this.reasonErrorDownload = null;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return reasonErrorDownload;
  }
}
