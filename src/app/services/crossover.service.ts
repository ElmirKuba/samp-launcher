import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from '../core/services/electron.service';
import { FilesAngularService } from './files-check.service';
import { StorageService } from '../core/services/storage.service';

/** Сервис по работе с Crossover */
@Injectable()
export class CrossoverService {
  /** Статус готовности Crossover к работе */
  private crossoverStatusReady = new BehaviorSubject(false);
  /** Путь к Crossover */
  crossoverPath = `${this.storageService.getApplicationDir()}/CrossOver.app`;
  /** Путь к инструменту создания бутылок Crossover */
  crossoverCxBottleExist = `${this.crossoverPath}/Contents/SharedSupport/CrossOver/CrossOver-Hosted Application/cxbottle`;
  /** Путь к инструменту запуска приложения Windows в бутылке */
  crossoverCxStartExist = `${this.crossoverPath}/Contents/SharedSupport/CrossOver/bin/cxstart`;

  constructor(
    private electronService: ElectronService,
    private filesAngularService: FilesAngularService,
    private storageService: StorageService
  ) {}

  /** Получить поток состояния статуса работы Crossover */
  public getCrossoverStatusReady(): BehaviorSubject<boolean> {
    return this.crossoverStatusReady;
  }

  /** Установить новый статус работы Crossover */
  public setCrossoverStatusReady(newStatus: boolean): void {
    this.crossoverStatusReady.next(newStatus);
  }

  /** Запустить проверку работоспособности Crossover */
  public checkCrossoverStatusReady(): void {
    /** Статус установленности Crossover */
    let status = this.checkCrossoverInstallation();

    if (!status) {
      status = this.checkCrossoverDownloaded();

      if (status) {
        status = this.unpackCrossoverFile();
      }
    }

    this.setCrossoverStatusReady(status);
  }

  /** Проверка установленности Crossover */
  private checkCrossoverInstallation(): boolean {
    if (!this.electronService.fs.existsSync(this.crossoverPath)) {
      return false;
    }
    if (!this.electronService.fs.existsSync(this.crossoverCxBottleExist)) {
      return false;
    }
    if (!this.electronService.fs.existsSync(this.crossoverCxStartExist)) {
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
  public downloadCrossoverAndInstall(): void {
    /** URL адрес скачивания Crossover */
    const downloadURLOfCrossover = this.storageService.getValue<string>(
      'downloadURLOfCrossover'
    );

    // const statusCheckAccess =
    this.filesAngularService.checkRemoteFileFromURL(downloadURLOfCrossover);

    // if (!statusCheckAccess) {
    //   throw new Error('Файл не доступен для счачивания');
    // }

    // console.log('statusCheckAccess', statusCheckAccess);

    //     // /** Путь до данных лаунчера */
    //     // const appDataPath = this.storageService.getAppDataPath();
    //     // /** URL скачивания разбили на массив */
    //     // const downsArgsUrl = downloadURLOfCrossover.split('/');
    //     // /** Последний элемент массива то есть имя файла */
    //     // const crossoverNameFile = downsArgsUrl[downsArgsUrl.length - 1];
    //     // /** Путь для сохранения файла */
    //     // const pathForCrossoverFolder = this.electronService.path.resolve(
    //     //   appDataPath as string,
    //     //   'temp',
    //     //   'crossover'
    //     // );
    //     // /** Конкретный путь к файлу Crossover */
    //     // const pathForFileCrossover = this.electronService.path.resolve(
    //     //   pathForCrossoverFolder,
    //     //   crossoverNameFile
    //     // );
    //     // this.storageService.setCrossoverNameFile(crossoverNameFile);
    //     // this.storageService.setPathForFileCrossover(pathForFileCrossover);
    //     // void this.filesAngularService.downloadFileWithProgress(
    //     //   downloadURLOfCrossover,
    //     //   pathForCrossoverFolder,
    //     //   crossoverNameFile
    //     // );
  }

  /** Перемещение файла Crossover */
  private unpackCrossoverFile(): boolean {
    //   // // /** Путь к скачанному Crossover */
    //   // const pathForFileCrossover = this.storageService.getPathForFileCrossover();
    //   // // /** Имя архива файла Crossover или имя приложения Crossover */
    //   // // const crossoverNameFile = this.storageService.getCrossoverNameFile();
    //   // // /** Путь к папке с приложениями MacOS */
    //   // // const applicationDir = this.storageService.getApplicationDir();
    //   // // /** Путь назначения куда отнести архив */
    //   // // const destinationPath = this.electronService.path.resolve(
    //   // //   applicationDir,
    //   // //   crossoverNameFile as string
    //   // // );
    //   // /** Путь до данных лаунчера */
    //   // const appDataPath = this.storageService.getAppDataPath();
    //   // /** Путь для сохранения файла */
    //   // const pathForCrossoverFolder = this.electronService.path.resolve(
    //   //   appDataPath as string,
    //   //   'temp',
    //   //   'crossover'
    //   // );

    //   // // crossoverNameFile;
    //   // // applicationDir;
    //   // // destinationPath;
    //   // // appDataPath;

    //   // /** Статус распаковки архива  */
    //   // const statusArchiveUnpacking = await this.filesAngularService.unpackArchive(
    //   //   pathForFileCrossover as string,
    //   //   pathForCrossoverFolder
    //   // );

    //   // ! Сначала переместить и потом распаковать или сначала распаковать и потом переместить?
    //   // ! Попробовать что-то для больших архивов

    //   // /** Статус копирования файла папку с приложениями MacOS */
    //   // const statusCopyFile = this.filesAngularService.copyFileAcrossDevices(
    //   //   pathForFileCrossover as string,
    //   //   destinationPath
    //   // );

    //   // /** Статус распаковки архива внутри папки с приложениями MacOS */
    //   // const statusArchiveUnpacking = this.filesAngularService.unpackArchive(
    //   //   destinationPath,
    //   //   applicationDir
    //   // );

    //   // return statusCopyFile;

    return false;
  }
}
