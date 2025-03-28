import { Injectable } from '@angular/core';
import { AxiosAngularService } from '../core/services/axios.service';
import { IVersionFileGTASA } from '../interfaces/gta-sa.interfaces';
import { ElectronService } from '../core/services/electron.service';
import { BehaviorSubject } from 'rxjs';
import {
  IDownloadProgress,
  IProcessDownloadFile,
  IResultDownloadFile,
} from '../interfaces/files.interfaces';

/** Сервис для работы с файлами в лаунчере */
@Injectable({
  providedIn: 'root',
})
export class FilesAngularService {
  /** BehaviorSubject для отслеживания прогресса загрузки */
  private downloadProgress = new BehaviorSubject<IDownloadProgress | null>(
    null
  );
  /** Хранит контроллер для отмены запроса */
  private abortController: AbortController | null = null;

  constructor(
    private axiosService: AxiosAngularService,
    private electronService: ElectronService
  ) {}

  /** Проверка файлов GTA-SA:MP по ссылке */
  async checkRemoteSAMPFiles(url: string) {
    // TODO: Сделать возможность изменения названия "version.json" динамично
    /** URL адрес до файла version.json */
    const versionUrl = `${url}version.json`;

    try {
      /** Результат работы метода get */
      const response = await this.axiosService.get<IVersionFileGTASA>(
        versionUrl
      );
      /** Файлы GTA SAMP */
      const files = response.data.files;

      const arrFiles = Object.entries(files).map(([key, value]) => ({
        fileName: key,
        ...value,
      }));

      if (arrFiles.length > 0) {
        return true;
      }

      return null;
    } catch (error: any) {
      console.error('Файл version.json не найден:', error.message);
      return null;
    }
  }

  /** Проверка доступности удаленного файла по URL */
  async checkRemoteFileFromURL(url: string): Promise<boolean> {
    try {
      await this.axiosService.head(url);
      return true;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Скачивает файл с указанного URL и сохраняет его по указанному пути,
   * предоставляя информацию о прогрессе загрузки.
   * @param url URL для скачивания файла
   * @param savePath Путь для сохранения файла
   */
  async downloadFileWithProgress(
    url: string,
    savePath: string,
    nameFile: string = url.split('/')[url.split('/').length - 1]
  ): Promise<void> {
    try {
      this.abortController = new AbortController();

      if (!this.electronService.fs.existsSync(savePath)) {
        this.electronService.fs.mkdirSync(savePath, {
          recursive: true,
        });
      }

      /** Путь с учетом названия файла и его расширения для сохранения */
      const pathForFile = this.electronService.path.resolve(savePath, nameFile);

      /** Выполняем запрос с помощью axios */
      const response = await this.electronService.axios.get<
        Buffer & IResultDownloadFile
      >(url, {
        responseType: 'arraybuffer',
        signal: this.abortController.signal,
        onDownloadProgress: (progressEvent: any) => {
          const tempProgressEvent = progressEvent as IProcessDownloadFile;
          const loaded = tempProgressEvent.loaded;
          const total = tempProgressEvent.total || 0;
          const progress = tempProgressEvent.progress;

          this.setDownloadProgress({
            loaded,
            total,
            progressDecimal: progress,
          });
        },
      });

      this.electronService.fs.writeFileSync(
        pathForFile,
        Buffer.from(response.data)
      );

      console.log(`Файл успешно сохранен по пути: ${savePath}`);

      this.setDownloadProgress({
        loaded: response.data.byteLength,
        total: response.data.maxByteLength,
        progressDecimal: 1,
      });
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.message === 'canceled') {
        console.log('Скачивание было отменено пользователем.');
      } else {
        console.error('Ошибка при скачивании файла:', error.message);
      }
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Метод для отмены текущего процесса скачивания файла.
   * Вызывается с фронтенда (например, по клику на кнопку "Отмена").
   */
  public cancelDownload(): void {
    if (this.abortController) {
      this.abortController.abort();

      this.abortController = null;

      this.setDownloadProgress({
        loaded: 0,
        total: 0,
        progressDecimal: 0,
      });
    }
  }

  /** Получить поток состояния статуса работы Crossover */
  public getDownloadProgress(): BehaviorSubject<IDownloadProgress | null> {
    return this.downloadProgress;
  }

  /** Установить новый статус работы Crossover */
  public setDownloadProgress(newStatus: IDownloadProgress): void {
    this.downloadProgress.next(newStatus);
  }

  /** Метод копирования файла */
  copyFileAcrossDevices(sourcePath: string, destinationPath: string): boolean {
    console.log('sourcePath 11:', sourcePath);
    console.log('destinationPath 11:', destinationPath);

    try {
      this.electronService.fs.copyFileSync(sourcePath, destinationPath);
      return true;
    } catch (err) {
      console.error('Ошибка при копировании файла:', err);
      return false;
    }
  }

  /** Распаковка архива */
  async unpackArchive(archivePath: string, destinationPath: string) {
    try {
      await this.electronService.decompress(archivePath, destinationPath);
      console.log(`Архив успешно распакован в: ${destinationPath}`);
      return true;
    } catch (error) {
      console.error('Ошибка при распаковке архива:', error);
      return false;
    }
  }
}
