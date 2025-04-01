import { Injectable } from '@angular/core';
import { StorageService } from '../core/services/storage.service';
import {
  GameMaintenanceStatus,
  IOneGTASAFileItem,
} from '../interfaces/gta-sa.interfaces';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from '../core/services/electron.service';
import { FilesAngularService } from './files-check.service';

@Injectable()
export class MaintenanceGameService {
  /** Статус обслуживания игровой сборки */
  private gameStatusMaintenance = new BehaviorSubject<GameMaintenanceStatus>(
    GameMaintenanceStatus.STATUS_UNDEFINED
  );
  /** Файлы сборки GTA SAMP для скачивания */
  private filesGTASAMPForDownload: string[] = [];
  /** Какой файл игровой сборки сейчас проверяется */
  private whichGameBuildFileIsCurrentlyBeingChecked = new BehaviorSubject<
    string | null
  >(null);

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

  /** Получить наименование файла игровой сборки который сейчас проверяется */
  public getWhichGameBuildFileIsCurrentlyBeingChecked(): BehaviorSubject<
    string | null
  > {
    return this.whichGameBuildFileIsCurrentlyBeingChecked;
  }

  /** Установить наименование файла игровой сборки который сейчас проверяется */
  public setWhichGameBuildFileIsCurrentlyBeingChecked(
    nameFile: string | null
  ): void {
    this.whichGameBuildFileIsCurrentlyBeingChecked.next(nameFile);
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

  /** Проверяем игру */
  public checkGame() {
    /** Элементы пути до папки GTA San Andreas в MacOS и в бутылке Crossover */
    const folderPathElementsOfGTASanAndreasFiles = this.storageService.getValue<
      string[]
    >('folderPathElementsOfGTASanAndreasFiles');
    /** Чипсы пути до игровой сборки */
    const pathToGameJoined = folderPathElementsOfGTASanAndreasFiles.reduce(
      (prev: string, curr: string) => {
        return this.electronService.path.join(prev, curr);
      }
    );
    /** Путь до бутылок */
    const crossoverBottlesPath = this.storageService.getCrossoverBottlesPath();
    /** Наименование бутылки Crossover */
    const nameBottleCrossover = this.storageService.getValue(
      'nameBottleCrossover'
    );
    const pathToGameBuild = this.electronService.path.join(
      crossoverBottlesPath,
      nameBottleCrossover as string,
      'drive_c',
      pathToGameJoined
    );
    /** Путь version.json внутри игровой сборки */
    const pathToBuildVersionData = this.electronService.path.join(
      pathToGameBuild,
      'version.json'
    );

    if (!this.electronService.fs.existsSync(pathToBuildVersionData)) {
      this.setGameStatusMaintenance(
        GameMaintenanceStatus.READY_FOR_VERIFICATION
      );
      return;
    }

    /** Сырые данные из version.json */
    const jsonData = this.electronService.fs.readFileSync(
      pathToBuildVersionData,
      'utf-8'
    );

    /** Преобразуем в JSON */
    const readedVersionData = JSON.parse(jsonData) as Record<
      string,
      IOneGTASAFileItem
    >;

    this.filesGTASAMPForDownload = [];

    for (const [name, obj] of Object.entries(readedVersionData)) {
      this.setWhichGameBuildFileIsCurrentlyBeingChecked(name);

      if (
        name.includes('version.json') ||
        name.includes('.DS_Store') ||
        name.includes('.log')
      ) {
        continue;
      }

      /** Путь version.json внутри игровой сборки */
      const pathToIterFileCheck = this.electronService.path.join(
        pathToGameBuild,
        obj.relativePath,
        obj.fileName
      );

      if (!this.electronService.fs.existsSync(pathToIterFileCheck)) {
        this.filesGTASAMPForDownload.push(name);
      } else {
        const hashIterFile =
          this.filesAngularService.getFileHash(pathToIterFileCheck);
        const sizeIterFile =
          this.electronService.fs.statSync(pathToIterFileCheck).size;

        if (obj.hash !== hashIterFile || obj.size !== sizeIterFile) {
          this.electronService.fs.unlinkSync(pathToIterFileCheck);
          this.filesGTASAMPForDownload.push(name);
        }
      }
    }

    this.setWhichGameBuildFileIsCurrentlyBeingChecked(null);

    if (this.filesGTASAMPForDownload.length) {
      this.setGameStatusMaintenance(GameMaintenanceStatus.READY_FOR_DOWNLOAD);
    } else {
      this.setGameStatusMaintenance(GameMaintenanceStatus.SUCCESS);
    }
  }

  /** Проверяем и скачиваем игру */
  async downloadNecessaryFiles() {
    console.log('filesGTASAMPForDownload', this.filesGTASAMPForDownload);
    this.setGameStatusMaintenance(GameMaintenanceStatus.SUCCESS);
    //   this.setGameStatusMaintenance(GameMaintenanceStatus.PROCESS_DOWNLOAD);

    //   /** Путь до бутылок */
    //   const crossoverBottlesPath = this.storageService.getCrossoverBottlesPath();
    //   /** Наименование бутылки Crossover */
    //   const nameBottleCrossover = this.storageService.getValue(
    //     'nameBottleCrossover'
    //   );
    //   /** Элементы пути до папки GTA San Andreas в MacOS и в бутылке Crossover */
    //   const folderPathElementsOfGTASanAndreasFiles = this.storageService.getValue<
    //     string[]
    //   >('folderPathElementsOfGTASanAndreasFiles');
    //   /** Чипсы пути до игровой сборки */
    //   const pathToGameJoined = folderPathElementsOfGTASanAndreasFiles.reduce(
    //     (prev: string, curr: string) => {
    //       return this.electronService.path.join(prev, curr);
    //     }
    //   );
    //   /** Путь до игровой сборки */
    //   const pathToGameBuild = this.electronService.path.join(
    //     crossoverBottlesPath,
    //     nameBottleCrossover as string,
    //     'drive_c',
    //     pathToGameJoined
    //   );
    //   /** URL загрузки файлов GTA SAMP сборки */
    //   const downloadURLOfGTASanAndreasFiles =
    //     this.storageService.getValue<string>('downloadURLOfGTASanAndreasFiles');
    //   /** Путь version.json по URL нахождения игровой сборки */
    //   const toBuildVersionData = this.electronService.path.join(
    //     downloadURLOfGTASanAndreasFiles,
    //     'version.json'
    //   );
    //   /** Путь version.json внутри игровой сборки */
    //   const pathToBuildVersionData = this.electronService.path.join(
    //     pathToGameBuild,
    //     'version.json'
    //   );
    //   /** Сырые данные из version.json */
    //   const jsonData = this.electronService.fs.readFileSync(
    //     pathToBuildVersionData,
    //     'utf-8'
    //   );
    //   /** Преобразуем в JSON */
    //   const readedVersionData = JSON.parse(jsonData) as Record<
    //     string,
    //     IOneGTASAFileItem
    //   >;
    //   /** Читаем удаленный version.json */
    //   const result = await this.filesAngularService.downloadFileWithProgress<
    //     Record<string, IOneGTASAFileItem>
    //   >(toBuildVersionData, pathToGameBuild, null, false);
    //   /** Достаем сами данные */
    //   const dataRemoteBuildVersionData = result!.data;
    //   /** Сначала спредим локальный version.json, потом частично или полностью перезаписываем удаленным version.json */
    //   const mergedLocalBuildVersionDataWithRemoteBuildVersionData = {
    //     ...readedVersionData,
    //     ...dataRemoteBuildVersionData,
    //   };

    //   /** Результат stringify объекта для записи в version.json */
    //   const stringifyJson = JSON.stringify(
    //     mergedLocalBuildVersionDataWithRemoteBuildVersionData,
    //     null,
    //     2
    //   );

    //   if (this.electronService.fs.existsSync(pathToBuildVersionData)) {
    //     this.electronService.fs.unlinkSync(pathToBuildVersionData);
    //   }

    //   this.electronService.fs.writeFileSync(
    //     pathToBuildVersionData,
    //     stringifyJson,
    //     'utf-8'
    //   );

    //   for (const fileToDownload of this.filesGTASAMPForDownload) {
    //     /** Ссылка на удаленный файл для скачивания по URL */
    //     const iterFileRemoteLink = this.electronService.path.join(
    //       downloadURLOfGTASanAndreasFiles,
    //       fileToDownload
    //     );
    //     /** По какому пути локально положить файл с использованием имени и расширения файла */
    //     const localPathToSaveFileWithName = this.electronService.path.join(
    //       pathToGameBuild,
    //       fileToDownload
    //     );

    //     console.log(
    //       'Ссылка на удаленный файл для скачивания по URL:',
    //       iterFileRemoteLink
    //     );
    //     console.log(
    //       'По какому пути локально положить файл с использованием имени и расширения файла',
    //       localPathToSaveFileWithName
    //     );

    //     // void this.filesAngularService.downloadFileWithProgress(
    //     //   iterFileRemoteLink,
    //     //   pathToGameBuild,
    //     //   localPathToSaveFileWithName
    //     // );
    //   }
  }
}
