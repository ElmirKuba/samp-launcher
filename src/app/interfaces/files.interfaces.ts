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
  loaded: 262144;
  /** Сколько всего скачать  */
  total: 527888;
  /** Прогресс в десятой части */
  progress: 0.4965901857969872;
  /** Сколько скачано */
  bytes: 262144;
  rate: undefined;
  estimated: undefined;
  event: {
    isTrusted: true;
  };
  lengthComputable: true;
  /** Загрузка в процессе */
  download: true;
}

/** Описаине результата скачивания */
export interface IResultDownloadFile {
  /** Сколько скачано */
  byteLength: number;
  detached: false;
  /** Сколько скачать всего */
  maxByteLength: number;
  resizable: boolean;
}
