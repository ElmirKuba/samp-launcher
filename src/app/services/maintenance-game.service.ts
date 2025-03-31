import { Injectable } from '@angular/core';
import { StorageService } from '../core/services/storage.service';
import { GameMaintenanceStatus } from '../interfaces/gta-sa.interfaces';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from '../core/services/electron.service';

@Injectable()
export class MaintenanceGameService {
  /** Статус обслуживания игровой сборки */
  private gameStatusMaintenance = new BehaviorSubject<GameMaintenanceStatus>(
    GameMaintenanceStatus.STATUS_UNDEFINED
  );

  constructor(
    private storageService: StorageService,
    private electronService: ElectronService
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
    const downloadURLOfGTASanAndreasFiles = this.storageService.getValue(
      'downloadURLOfGTASanAndreasFiles'
    );

    if (!this.electronService.fs.existsSync(pathToBuildVersionData)) {
      /**
       * Это значит что в том месте в бутылке Crossover где должна лежать сборка GTA SAMP мы не нашли version.json.
       * 1. Взять "downloadURLOfGTASanAndreasFiles" и 'version.json' и вместе их join, назвать например ToBuildVersionData.
       * 2. Взять "ToBuildVersionData" и скачать его, записать по пути где будем хранить сборку GTA SAMP, а именно в "pathToGameBuild".
       * 3. Теперь мы имеем файл 'version.json' в "pathToGameBuild", то есть путь "pathToBuildVersionData" будет корректный.
       * 4. Здесь нас ничего не ждет, снова запускаем "this.checkMaintenanceGame()""
       */
      console.log(1);
    } else {
      /**
       * Это значит что в том месте в бутылке Crossover где должна лежать сборка GTA SAMP мы нашли version.json, то есть путь "pathToBuildVersionData" будет корректный.
       * 1. Читаем version.json по пути "pathToBuildVersionData" в память приложения.
       * 2. Получаем список файлов с помощью возможно Object.entries.
       * 3. Бегаем по списку файлов и смотрим их наличие.
       *    3.1. При отсутствии файла или не совпадения хэша и размера в байтах - кладем этот файл в массив на загрузку.
       *    3.2. Бегаем по массиву на загрузку, если файл есть - удаляем.
       *    3.3. Бегаем по массиву на загрузку, файл соединяем с "downloadURLOfGTASanAndreasFiles", скачиваем и кладем в "pathToGameBuild".
       */
      console.log(2);
    }

    // console.log(
    //   'downloadURLOfGTASanAndreasFiles>>',
    //   downloadURLOfGTASanAndreasFiles
    // );
  }
}
