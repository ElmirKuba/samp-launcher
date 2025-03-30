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
