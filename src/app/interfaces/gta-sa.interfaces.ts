/** Описание одного элемента в свойстве files */
export interface IOneGTASAFileItem {
  /** Относительный путь к файлу */
  relativePath: string;
  /** Конкретное наименование файла */
  fileName: string;
  /** Хеш файла GTA SA в байтах */
  hash: string;
  /** Размер файла GTA SAMP в байтах */
  size: number;
  /** Версия файла */
  version: number;
}

/** Универсальные статусы обслуживания игровой сборки */
export enum GameMaintenanceStatus {
  /** Игровая сборка успешно обслужена */
  SUCCESS = 'SUCCESS',
  /** Процесс загрузки файлов */
  PROCESS_DOWNLOAD = 'PROCESS_DOWNLOAD',
  /** Надо скачать файлы сборки (частично или полностью) */
  READY_FOR_DOWNLOAD = 'READY_FOR_DOWNLOAD',
  /** Игровая сборка готова к проверке по version.json */
  READY_FOR_VERIFICATION = 'READY_FOR_VERIFICATION',
  /** Статус обслуживания игровой сборки не известен */
  STATUS_UNDEFINED = 'STATUS_UNDEFINED',
}
