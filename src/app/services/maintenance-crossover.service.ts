import { Injectable } from '@angular/core';
import { StorageService } from '../core/services/storage.service';
import {
  IBottleValid,
  ICrossOverPreferences,
  IReadPListFileResult,
} from '../interfaces/crossover.interface';
import { ElectronService } from '../core/services/electron.service';
import { cloneDeep } from 'lodash';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MaintenanceCrossoverService {
  /** Статус готовности Crossover к работе */
  private crossoverStatusReady = new BehaviorSubject(false);

  constructor(
    private storageService: StorageService,
    private electronService: ElectronService
  ) {}

  /** Запустить проверку работоспособности Crossover */
  public async checkCrossoverStatusReady(): Promise<void> {
    /** Основной конфиг Crossover */
    const crossoverMainConfig = this.storageService.getCrossoverMainConfig();

    /** Попытка прочитать основной конфиг Crossover */
    const pListFileReaded = await this.readPListFile<ICrossOverPreferences>(
      crossoverMainConfig
    );

    if (!pListFileReaded.error) {
      /** Путь до бутылок */
      const bottleDir = pListFileReaded.resultRead!.BottleDir;

      this.storageService.setCrossoverBottlesPath(bottleDir);
    }

    /** Путь до бутылок */
    const bottleDir = this.storageService.getCrossoverBottlesPath();

    /** Наименование бутылки Crossover */
    const nameBottleCrossover = this.storageService.getValue<string>(
      'nameBottleCrossover'
    );

    const validStatusBottle = this.isBottleValid(
      bottleDir,
      nameBottleCrossover
    );
  }

  /** Прочитать plist файл */
  private async readPListFile<FileReaded>(
    filePath: string
  ): Promise<IReadPListFileResult<FileReaded>> {
    try {
      /** Результат парсинга Apple Binary Property List данных в виде JavaScript объекта */
      const resultRead = await new Promise<FileReaded>((resolve, reject) => {
        if (!this.electronService.fs.existsSync(filePath)) {
          reject(new Error('Файл не существует: ' + filePath));
          return;
        }

        void this.electronService.bplist.parseFile<FileReaded>(
          filePath,
          (err, obj) => {
            if (err) {
              reject(new Error('Error reading binary plist: ' + err));
              return;
            }

            /** Результат глубого копирования объекта нулевого элемента массива */
            const cloneICrossOverPreferences = cloneDeep(obj[0]);

            resolve(cloneICrossOverPreferences);
          }
        );
      });

      return {
        error: false,
        resultRead,
      };
    } catch (error) {
      return {
        error: true,
        resultRead: null,
        errorData: error as Error,
      };
    }
  }

  /** Проверяет корректность бутылки для CrossOver */
  private isBottleValid(bottleDir: string, bottleName: string): IBottleValid {
    /** Путь до бутылки */
    const bottlePath = this.electronService.path.join(bottleDir, bottleName);

    if (
      !this.electronService.fs.existsSync(bottlePath) ||
      !this.electronService.fs.lstatSync(bottlePath).isDirectory()
    ) {
      return {
        status: false,
        desc: 'Бутылка ${bottlePath} не существует или не является директорией.',
      };
    }

    /** Путь до файла системного редактора реестра */
    const systemRegPath = this.electronService.path.join(
      bottlePath,
      'system.reg'
    );

    if (
      !this.electronService.fs.existsSync(systemRegPath) ||
      !this.electronService.fs.lstatSync(systemRegPath).isFile()
    ) {
      return {
        status: false,
        desc: `Файл system.reg не найден по пути ${systemRegPath}`,
      };
    }

    /** Путь до диска C */
    const driveCPath = this.electronService.path.join(bottlePath, 'drive_c');

    if (
      !this.electronService.fs.existsSync(driveCPath) ||
      !this.electronService.fs.lstatSync(driveCPath).isDirectory()
    ) {
      return {
        status: false,
        desc: `Директория drive_c не найдена по пути ${driveCPath}`,
      };
    }

    /** Путь до папки с Windows */
    const windowsPath = this.electronService.path.join(driveCPath, 'windows');

    if (
      !this.electronService.fs.existsSync(windowsPath) ||
      !this.electronService.fs.lstatSync(windowsPath).isDirectory()
    ) {
      return {
        status: false,
        desc: `Директория windows не найдена в ${driveCPath}`,
      };
    }

    /** Вариант пути до DosDevices */
    const dosDevicesPath = this.electronService.path.join(
      bottlePath,
      'DosDevices'
    );
    /** Вариант пути до dosdevices */
    const dosDevicesPathLower = this.electronService.path.join(
      bottlePath,
      'dosdevices'
    );

    if (
      !(
        (this.electronService.fs.existsSync(dosDevicesPath) &&
          this.electronService.fs.lstatSync(dosDevicesPath).isDirectory()) ||
        (this.electronService.fs.existsSync(dosDevicesPathLower) &&
          this.electronService.fs.lstatSync(dosDevicesPathLower).isDirectory())
      )
    ) {
      return {
        status: false,
        desc: `Директория DosDevices (или dosdevices) не найдена в ${bottlePath}`,
      };
    }

    /** Вариант пути до cxbottle */
    const configFile = this.electronService.path.join(
      bottlePath,
      'cxbottle.conf'
    );

    if (
      !this.electronService.fs.existsSync(configFile) ||
      !this.electronService.fs.statSync(configFile).isFile()
    ) {
      return {
        status: false,
        desc: `Отсутствует конфигурационный файл: ${configFile}`,
      };
    }

    try {
      const crossoverCxBottleExist =
        this.storageService.getCrossoverCxBottleExist();

      /** Команда для проверки статуса бутылки через службу Crossover */
      const statusCommand = `${crossoverCxBottleExist} --status --bottle "${bottleName}"`;

      /** Результат выполнения команды проверки статуса через службу Crossover */
      const statusOutput = this.electronService.childProcess
        .execSync(statusCommand)
        .toString()
        .trim();

      /** Статус наличия в ответе положительного для нас результата */
      const uptodateStatusBottle = statusOutput.includes('Status=uptodate');

      if (!uptodateStatusBottle) {
        return {
          status: false,
          desc: `Статус бутылки ${bottleName} не является актуальным. Статус: ${statusOutput}`,
        };
      }
    } catch (error) {
      return {
        status: false,
        desc: `Ошибка при выполнении команды для проверки статуса бутылки: ${
          (error as Error).message
        }`,
      };
    }

    return {
      status: true,
      desc: `Бутылка "${bottleName}" валидна`,
    };
  }
}
