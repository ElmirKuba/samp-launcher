import { Injectable } from '@angular/core';
import { StorageService } from '../core/services/storage.service';
import {
  CrossOverPreferences,
  ReadPListFileResult,
} from '../interfaces/crossover.interface';
import { ElectronService } from '../core/services/electron.service';
import { cloneDeep } from 'lodash';

@Injectable()
export class WorkingWithCrossoverService {
  constructor(
    private storageService: StorageService,
    private electronService: ElectronService
  ) {}

  /** Запустить проверку работоспособности Crossover */
  public async checkCrossoverStatusReady(): Promise<void> {
    /** Основной конфиг Crossover */
    const crossoverMainConfig = this.storageService.getCrossoverMainConfig();

    const pListFileReaded = await this.readPListFile<CrossOverPreferences>(
      crossoverMainConfig
    );

    if (!pListFileReaded.error) {
      /** Путь до бутылок */
      const bottleDir = pListFileReaded.resultRead!.BottleDir;

      this.storageService.setCrossoverBottlesPath(bottleDir);
    }

    const bottleDir = this.storageService.getCrossoverBottlesPath();

    console.log('>bottleDir<', bottleDir);
  }

  /** Прочитать plist файл */
  public async readPListFile<FileReaded>(
    filePath: string
  ): Promise<ReadPListFileResult<FileReaded>> {
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
            const cloneCrossOverPreferences = cloneDeep(obj[0]);

            resolve(cloneCrossOverPreferences);
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
}
