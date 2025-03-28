/** Описание хранилища samp-launcher */
export interface IStorage {
  /** URL загрузки файлов GTA SAMP сборки */
  downloadURLOfGTASanAndreasFiles: string | null;
  /** URL загрузки файла Crossover */
  downloadURLOfCrossover: string | null;
  /** Ник игрока */
  nickNameSAMP: string | null;
  /** Наименование бутылки Crossover */
  nameBottleCrossover: string | null;
  /** Элементы пути до папки GTA San Andreas в MacOS и в бутылке Crossover */
  folderPathElementsOfGTASanAndreasFiles: string[];
  /** Массив данных серверов для игры */
  serverAdresses: IServerAdresses[];
}

/** Описание сервера SAMP для подключения */
export interface IServerAdresses {
  /** IP-Адресс SAMP сервера для подключения */
  ip: string;
  /** Порт SAMP сервера для подключения */
  port: string;
}
