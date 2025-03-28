import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { IStorage } from '../interfaces/storage.interfaces';

/** Модуль для хранения и управления данными приложения, получения к ним доступа, установки и чтения данных */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /** Путь до домашней директории приложения */
  private homeDir: string | null = null;
  /** Имя пользователя MacOS */
  private userName: string | null = null;
  /** Путь до данных samp-launcher */
  private appDataPath: string | null = null;
  /** Путь до основного файла настроек samp-launcher */
  private configPath: string | null = null;
  /** Шаблон OS для бутылки Crossover */
  private templateOSCrossover: string | null = 'win7';
  /** Описание для бутылки Crossover */
  private descriptionOSCrossover: string | null = 'Windows7_32_samp';
  /** Объект для хранения данных из config.json */
  private configData: IStorage = {
    downloadURLOfGTASanAndreasFiles: null,
    downloadURLOfCrossover: null,
    nickNameSAMP: null,
    nameBottleCrossover: null,
    folderPathElementsOfGTASanAndreasFiles: [],
    serverAdresses: [],
  };

  constructor(private electronService: ElectronService) {
    if (!this.electronService.isElectron) {
      return;
    }

    this.initStorage();
  }

  /** Инициализация хранилища настроек приложения */
  private initStorage() {
    this.homeDir = this.electronService.process.env.HOME as string;

    this.userName = this.electronService.process.env.USER as string;

    this.appDataPath = `${this.homeDir}/samp-launcher`;
    this.configPath = `${this.appDataPath}/config.json`;

    if (!this.electronService.fs.existsSync(this.appDataPath)) {
      this.electronService.fs.mkdirSync(this.appDataPath, {
        recursive: true,
      });
    }

    this.loadConfig();
  }

  /** Загружает данные из config.json в память */
  private loadConfig() {
    if (this.electronService.fs.existsSync(this.configPath as string)) {
      /** Сырые данные из config.json */
      const jsonData = this.electronService.fs.readFileSync(
        this.configPath as string,
        'utf-8'
      );

      this.configData = JSON.parse(jsonData) as IStorage;
    } else {
      this.setAllData({
        downloadURLOfGTASanAndreasFiles: null,
        downloadURLOfCrossover: null,
        nickNameSAMP: null,
        nameBottleCrossover: null,
        folderPathElementsOfGTASanAndreasFiles: [],
        serverAdresses: [],
      });
    }
  }

  /** Сохраняет данные из памяти в config.json */
  private saveConfig() {
    const jsonData = JSON.stringify(this.configData, null, 2);

    this.electronService.fs.writeFileSync(
      this.configPath as string,
      jsonData,
      'utf-8'
    );
  }

  /** Получает значение по ключу */
  getValue(key: keyof IStorage): any {
    return this.configData[key];
  }

  /** Устанавливает значение по ключу */
  setValue(key: keyof IStorage, value: any): void {
    this.configData[key] = value;
    this.saveConfig();
  }

  /** Удаляет значение по ключу */
  deleteValue(key: keyof IStorage): void {
    delete this.configData[key];
    this.saveConfig();
  }

  /** Получает все данные из конфига */
  getAllData(): IStorage {
    return this.configData;
  }

  /** Устанавливает все данные конфига */
  setAllData(data: IStorage): void {
    this.configData = data;
    this.saveConfig();
  }
}
