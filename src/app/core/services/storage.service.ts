import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { IStorage } from '../interfaces/storage.interfaces';

/** Модуль для хранения и управления данными приложения, получения к ним доступа, установки и чтения данных */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /** Путь до домашней директории пользователя MacOS */
  private homeDir: string | null = null;
  /** Имя пользователя MacOS */
  private userName: string | null = null;
  /** Путь к папке с приложениями MacOS */
  private applicationDir: string = '/Applications';
  /** Путь до данных samp-launcher */
  private appDataPath: string | null = null;
  /** Путь до основного файла настроек samp-launcher */
  private configPath: string | null = null;
  /** Шаблон OS для бутылки Crossover */
  private templateOSCrossover: string | null = 'win7';
  /** Описание для бутылки Crossover */
  private descriptionOSCrossover: string | null = 'Windows7_32_samp';
  /** Путь к скачанному Crossover */
  private pathForFileCrossover: string | null = null;
  /** Имя архива файла Crossover или имя приложения Crossover */
  private crossoverNameFile: string | null = null;
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
    this.configPath = `${this.getAppDataPath()}/config.json`;

    if (!this.electronService.fs.existsSync(this.getAppDataPath() as string)) {
      this.electronService.fs.mkdirSync(this.getAppDataPath() as string, {
        recursive: true,
      });
    }

    this.loadConfig();
  }

  /** Загружает данные из config.json в память */
  private loadConfig() {
    if (this.electronService.fs.existsSync(this.getConfigPath() as string)) {
      /** Сырые данные из config.json */
      const jsonData = this.electronService.fs.readFileSync(
        this.getConfigPath() as string,
        'utf-8'
      );

      this.configData = JSON.parse(jsonData) as IStorage;
    } else {
      this.saveConfig();
    }
  }

  /** Сохраняет данные из памяти в config.json */
  private saveConfig() {
    const jsonData = JSON.stringify(this.configData, null, 2);

    this.electronService.fs.writeFileSync(
      this.getConfigPath() as string,
      jsonData,
      'utf-8'
    );
  }

  /** Получает значение по ключу */
  public getValue<ReturnType>(key: keyof IStorage): ReturnType {
    return this.configData[key] as ReturnType;
  }

  /** Устанавливает значение по ключу */
  public setValue(key: keyof IStorage, value: any): void {
    this.configData[key] = value;
    this.saveConfig();
  }

  /** Удаляет значение по ключу */
  public deleteValue(key: keyof IStorage): void {
    delete this.configData[key];
    this.saveConfig();
  }

  /** Получает все данные из конфига */
  public getAllData(): IStorage {
    return this.configData;
  }

  /** Устанавливает все данные конфига */
  public setAllData(data: IStorage): void {
    this.configData = data;
    this.saveConfig();
  }

  /** Путь до домашней директории пользователя MacOS */
  public getHomeDir() {
    return this.homeDir;
  }

  /** Имя пользователя MacOS */
  public getUserName() {
    return this.userName;
  }

  /** Путь к папке с приложениями MacOS */
  public getApplicationDir() {
    return this.applicationDir;
  }

  /** Путь до данных samp-launcher */
  public getAppDataPath() {
    return this.appDataPath;
  }

  /** Путь до основного файла настроек samp-launcher */
  public getConfigPath() {
    return this.configPath;
  }

  /** Шаблон OS для бутылки Crossover */
  public getTemplateOSCrossover() {
    return this.templateOSCrossover;
  }

  /** Описание для бутылки Crossover */
  public getDescriptionOSCrossover() {
    return this.descriptionOSCrossover;
  }

  /** Получить прямой путь до файла Crossover  */
  public getPathForFileCrossover() {
    return this.pathForFileCrossover;
  }

  /** Установить прямой путь до файла Crossover  */
  public setPathForFileCrossover(path: string) {
    this.pathForFileCrossover = path;
  }

  /** Установить имя Crossover */
  public setCrossoverNameFile(fileName: string) {
    this.crossoverNameFile = fileName;
  }

  /** Получить имя Crossover */
  public getCrossoverNameFile() {
    return this.crossoverNameFile;
  }
}
