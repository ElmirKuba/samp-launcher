import { Injectable } from '@angular/core';
import { StorageService } from '../core/services/storage.service';
import { GameMaintenanceStatus } from '../interfaces/gta-sa.interfaces';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from '../core/services/electron.service';
import { FilesAngularService } from './files-check.service';

@Injectable()
export class MaintenanceGameService {
  /** Статус обслуживания игровой сборки */
  private gameStatusMaintenance = new BehaviorSubject<GameMaintenanceStatus>(
    GameMaintenanceStatus.STATUS_UNDEFINED
  );

  constructor(
    private storageService: StorageService,
    private electronService: ElectronService,
    private filesAngularService: FilesAngularService
  ) {}

  /** Получить поток состояния обслуживания игровой сборки */
  public getGameStatusMaintenance(): BehaviorSubject<GameMaintenanceStatus> {
    return this.gameStatusMaintenance;
  }

  /** Установить новый статус обслуживания игровой сборки */
  public setGameStatusMaintenance(newStatus: GameMaintenanceStatus): void {
    this.gameStatusMaintenance.next(newStatus);
  }

  /** Запустить проверку работоспособности сборки GTA SAMP */
  public checkMaintenanceGame() {
    /** Элементы пути до папки GTA San Andreas в MacOS и в бутылке Crossover */
    const folderPathElementsOfGTASanAndreasFiles = this.storageService.getValue<
      string[]
    >('folderPathElementsOfGTASanAndreasFiles');
    /** Наименование бутылки Crossover */
    const nameBottleCrossover = this.storageService.getValue(
      'nameBottleCrossover'
    );
    /** Путь до бутылок */
    const crossoverBottlesPath = this.storageService.getCrossoverBottlesPath();
    /** Чипсы пути до игровой сборки */
    const pathToGameJoined = folderPathElementsOfGTASanAndreasFiles.reduce(
      (prev: string, curr: string) => {
        return this.electronService.path.join(prev, curr);
      }
    );
    /** Путь до игровой сборки */
    const pathToGameBuild = this.electronService.path.join(
      crossoverBottlesPath,
      nameBottleCrossover as string,
      'drive_c',
      pathToGameJoined
    );

    if (!this.electronService.fs.existsSync(pathToGameBuild)) {
      this.electronService.fs.mkdirSync(pathToGameBuild, {
        recursive: true,
      });
    }

    /** Путь version.json внутри игровой сборки */
    const pathToBuildVersionData = this.electronService.path.join(
      pathToGameBuild,
      'version.json'
    );

    /** URL загрузки файлов GTA SAMP сборки */
    const downloadURLOfGTASanAndreasFiles =
      this.storageService.getValue<string>('downloadURLOfGTASanAndreasFiles');

    if (!this.electronService.fs.existsSync(pathToBuildVersionData)) {
      /** Путь version.json по URL нахождения игровой сборки */
      const toBuildVersionData = this.electronService.path.join(
        downloadURLOfGTASanAndreasFiles,
        'version.json'
      );

      void this.filesAngularService.downloadFileWithProgress(
        toBuildVersionData,
        pathToGameBuild,
        pathToBuildVersionData
      );
    }

    this.setGameStatusMaintenance(GameMaintenanceStatus.READY_FOR_VERIFICATION);
  }

  /** Проверяем и скачиваем игру */
  public checkAndDownloadGame() {
    /**
     * План действий:
     * 1. Прочитать файл version.json в папке сборки GTA SAMP внутри бутылки.
     * 2. Бегаем по файлам и смотрим, если их нет физически, то кидаем в массив для скачивания.
     * 3. Если файл есть физически то смотрим его размер и хэш - отличается? Удаляем файл и кидаем в массив для скачивания.
     * 4. Если в массиве для скачивания есть данные, то скачиваем их.
     */
    console.log('Проверяем и скачиваем игру');

    this.setGameStatusMaintenance(GameMaintenanceStatus.READY_FOR_VERIFICATION);
  }

  // console.log(
  //   'downloadURLOfGTASanAndreasFiles>>',
  //   downloadURLOfGTASanAndreasFiles
  // );
}
