/** Описание хранилища samp-launcher */
export interface IStorage {
  /** URL загрузки файлов GTA SAMP сборки */
  downloadURLOfGTASanAndreasFiles: string | null;
  /** URL загрузки файла Crossover */
  downloadURLOfCrossover: string | null;
  /** Ник игрока */
  nickNameSAMP: string | null;
}
