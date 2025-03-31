/** Файл version.json */
export interface IVersionFileGTASA {
  /** Наименование сборки SAMP */
  name: string;
  /** Версия GTA SAMP сборки */
  version: number;
  /** Файлы GTA SAMP */
  files: Record<string, IOneGTASAFileItem>;
}

/** Описание одного элемента в свойстве files */
export interface IOneGTASAFileItem {
  /** Хеш файла GTA SA в байтах */
  hash: string;
  /** Размер файла GTA SAMP в байтах */
  size: number;
  /** Версия файла */
  version: number;
}
