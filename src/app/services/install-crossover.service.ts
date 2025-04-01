import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from '../core/services/electron.service';
import { FilesAngularService } from './files-check.service';
import { StorageService } from '../core/services/storage.service';
import { ToastrService } from 'ngx-toastr';

/** Сервис по работе с Crossover */
@Injectable()
export class InstallCrossoverService {
  /** Статус готовности Crossover к работе */
  private crossoverStatusInstall = new BehaviorSubject(false);

  constructor(
    private electronService: ElectronService,
    private filesAngularService: FilesAngularService,
    private storageService: StorageService,
    private toastr: ToastrService
  ) {}

  /** Получить поток состояния статуса работы Crossover */
  public getCrossoverStatusInstall(): BehaviorSubject<boolean> {
    return this.crossoverStatusInstall;
  }

  /** Установить новый статус работы Crossover */
  public setCrossoverStatusInstall(newStatus: boolean): void {
    this.crossoverStatusInstall.next(newStatus);
  }

  /** Запустить проверку работоспособности Crossover */
  public async checkCrossoverStatusInstall(): Promise<void> {
    /** Статус установленности Crossover */
    let status = this.checkCrossoverInstallation();

    if (!status) {
      this.toastr.error(
        'Crossover не установлен, проверяем в кеше скачанных файлов...',
        'Ошибка работы с Crossover'
      );

      /** Статус загруженности Crossover */
      status = this.checkCrossoverDownloaded();

      if (status) {
        this.toastr.success(
          'Crossover успешно скачан!',
          'Хорошие новости с Crossover'
        );

        status = await this.unpackCrossoverFile();
      } else {
        this.toastr.error(
          'Crossover не скачан! Скачайте его!',
          'Ошибка работы с Crossover'
        );
      }
    }

    if (status) {
      this.toastr.success(
        'Crossover готов к обслуживанию!',
        'Хорошие новости с Crossover'
      );
    }

    this.setCrossoverStatusInstall(status);
  }

  /** Проверка установленности Crossover */
  private checkCrossoverInstallation(): boolean {
    const crossoverPath = this.storageService.getCrossoverPath();

    if (!this.electronService.fs.existsSync(crossoverPath)) {
      return false;
    }

    const crossoverCxBottleExist =
      this.storageService.getCrossoverCxBottleExist();

    if (!this.electronService.fs.existsSync(crossoverCxBottleExist)) {
      return false;
    }

    const crossoverCxStartExist =
      this.storageService.getCrossoverCxStartExist();

    if (!this.electronService.fs.existsSync(crossoverCxStartExist)) {
      return false;
    }

    return true;
  }

  /** Проверка скачанного Crossover но еще не установленного */
  private checkCrossoverDownloaded(): boolean {
    const pathForFileCrossover = this.storageService.getPathForFileCrossover();

    if (
      !pathForFileCrossover ||
      !this.electronService.fs.existsSync(pathForFileCrossover)
    ) {
      return false;
    }

    return true;
  }

  /** Скачать и установить Crossover */
  public async downloadCrossoverAndInstall(): Promise<void> {
    /** URL адрес скачивания Crossover */
    const downloadURLOfCrossover = this.storageService.getValue<string>(
      'downloadURLOfCrossover'
    );

    const statusCheckAccess =
      await this.filesAngularService.checkRemoteFileFromURL(
        downloadURLOfCrossover
      );

    if (!statusCheckAccess) {
      this.toastr.error(
        'Файл Crossover не доступен для скачивания!',
        'Файл не доступен для счачивания'
      );

      throw new Error('Файл не доступен для счачивания');
    }

    /** Путь до данных лаунчера */
    const appDataPath = this.storageService.getAppDataPath();

    /** URL скачивания разбили на массив */
    const downsArgsUrl = downloadURLOfCrossover.split('/');

    /** Последний элемент массива то есть имя файла */
    const crossoverNameFile = downsArgsUrl[downsArgsUrl.length - 1];

    /** Путь для сохранения файла */
    const pathForCrossoverFolder = this.electronService.path.resolve(
      appDataPath as string,
      'temp',
      'crossover'
    );

    /** Конкретный путь к файлу Crossover */
    const pathForFileCrossover = this.electronService.path.resolve(
      pathForCrossoverFolder,
      crossoverNameFile
    );

    this.storageService.setCrossoverNameFile(crossoverNameFile);
    this.storageService.setPathForFileCrossover(pathForFileCrossover);

    void this.filesAngularService.downloadFileWithProgress(
      downloadURLOfCrossover,
      pathForCrossoverFolder,
      pathForFileCrossover
    );
  }

  /** Перемещение файла Crossover */
  private async unpackCrossoverFile(): Promise<boolean> {
    this.filesAngularService.removeFileForPath(
      this.storageService.getCrossoverPath()
    );

    /** Путь к скачанному Crossover */
    const pathForFileCrossover = this.storageService.getPathForFileCrossover();

    /** Путь к папке с приложениями MacOS */
    const appDataBinaryFiles = this.storageService.getAppDataBinaryFiles();

    await this.filesAngularService.extractArchive(
      pathForFileCrossover as string,
      appDataBinaryFiles as string
    );

    return true;
  }
}
