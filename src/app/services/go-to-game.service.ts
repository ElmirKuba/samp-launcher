import { Injectable } from '@angular/core';
import { StorageService } from '../core/services/storage.service';
import { ElectronService } from '../core/services/electron.service';
import { MaintenanceCrossoverService } from './maintenance-crossover.service';
import { GameMaintenanceStatus } from '../interfaces/gta-sa.interfaces';
import { MaintenanceGameService } from './maintenance-game.service';

@Injectable()
export class GoToGameService {
  constructor(
    private storageService: StorageService,
    private electronService: ElectronService,
    private maintenanceCrossoverService: MaintenanceCrossoverService,
    private maintenanceGameService: MaintenanceGameService
  ) {}

  startSamp(
    ip: string,
    port: string,
    bottleName: string,
    sampPath: string
  ): void {
    /** Путь к инструменту запуска приложения Windows в бутылке */
    const cxstartPath = this.storageService.getCrossoverCxStartExist();

    /** Формируем команду */
    const command = `${cxstartPath} --bottle ${bottleName} "${sampPath}" ${ip}:${port}`;

    this.electronService.process.env.LANG = 'ru_RU.UTF-8';

    this.electronService.childProcess.exec(command, (error) => {
      if (error) {
        console.error(`Ошибка запуска: ${error.message}`);
        alert(`Не удалось запустить SAMP: ${error.message}`);
      } else {
        this.maintenanceGameService.setGameStatusMaintenance(
          GameMaintenanceStatus.READY_FOR_VERIFICATION
        );
      }
    });
  }

  /** Перейти в игру */
  connectToServer(ip: string, port: string) {
    /** Путь до бутылок */
    const crossoverBottlesPath = this.storageService.getCrossoverBottlesPath();
    /** Наименование бутылки Crossover */
    const nameBottleCrossover = this.storageService.getValue<string>(
      'nameBottleCrossover'
    );
    /** Путь до бутылки */
    const bottlePath = this.electronService.path.join(
      crossoverBottlesPath,
      nameBottleCrossover
    );
    /** Путь до файла системного редактора реестра */
    const userRegPath = this.electronService.path.join(bottlePath, 'user.reg');

    /** Crossover`ный заголовок в реестре Windows внутри бутылки для SAMP */
    const crossoverRegeditHeaderForSAMP =
      this.storageService.getCrossoverRegeditHeaderForSAMP();

    this.maintenanceCrossoverService.removeRegistryBlock(
      userRegPath,
      crossoverRegeditHeaderForSAMP
    );

    /** Ник игрока */
    const nickNameSAMP = this.storageService.getValue<string>('nickNameSAMP');
    /** Элементы пути до папки GTA San Andreas в MacOS и в бутылке Crossover */
    const folderPathElementsOfGTASanAndreasFiles = this.storageService.getValue<
      string[]
    >('folderPathElementsOfGTASanAndreasFiles');

    /** Чипсы пути до игровой сборки */
    const pathToGameJoined = folderPathElementsOfGTASanAndreasFiles.reduce(
      (prev: string, curr: string) => {
        return `${prev}\\\\${curr}`;
      }
    );

    /** Путь до игры внутри бутылки Windows в Crossover */
    const windowsPathGame = `C:\\\\${pathToGameJoined}`;

    /** Новый блок для реестра */
    const newBlock = `
[${crossoverRegeditHeaderForSAMP}] ${Math.floor(Date.now() / 1000)}
#time=${Math.floor(Date.now() / 1000).toString(16)}
"ClientID"="Sh27URl0vyZwTfp"
"gta_sa_exe"="${windowsPathGame}\\\\gta_sa.exe"
"PlayerName"="${nickNameSAMP}"
`;

    this.maintenanceCrossoverService.addRegistryBlock(
      userRegPath,
      crossoverRegeditHeaderForSAMP,
      newBlock
    );

    this.startSamp(
      ip,
      port,
      nameBottleCrossover,
      `${windowsPathGame}\\\\samp.exe`
    );
  }
}
