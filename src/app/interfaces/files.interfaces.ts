/** Описание состояния загрузки файла */
export interface IDownloadProgress {
  /** Сколько байт загружено сейчас */
  loaded: number;
  /** Сколько загрузить байт всего */
  total: number;
  /** Прогресс в десятой части */
  progressDecimal: number;
}

/** Описание процесса загрузки */
export interface IProcessDownloadFile {
  /** Сколько скачано */
  loaded: number;
  /** Сколько всего скачать  */
  total: number;
  /** Прогресс в десятой части */
  progress: number;
  /** Сколько скачано */
  bytes: number;
  rate: unknown;
  estimated: unknown;
  event: {
    isTrusted: boolean;
  };
  lengthComputable: boolean;
  /** Загрузка в процессе */
  download: boolean;
}

/** Описаине результата скачивания */
export interface IResultDownloadFile {
  /** Сколько скачано */
  byteLength: number;
  detached: boolean;
  /** Сколько скачать всего */
  maxByteLength: number;
  resizable: boolean;
}

/** Статус загрузки файлов */
export enum DownloadFilesStatus {
  /** Файлы загружены успешно */
  SUCCESS_COMPLETE = 'SUCCESS',
  /** Ошибка загрузки файлов */
  ERROR = 'ERROR',
  /** Загрузка файлов в процессе */
  PROCESS = 'PROCESS',
  /** Статус загрузки файлов не известен */
  STATUS_UNDEFINED = 'STATUS_UNDEFINED',
}
