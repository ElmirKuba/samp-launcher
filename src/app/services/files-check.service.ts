import { Injectable } from '@angular/core';
import { AxiosAngularService } from '../core/services/axios.service';
import { IVersionFileGTASA } from '../interfaces/gta-sa.interfaces';

/** Сервис для работы с файлами в лаунчере */
@Injectable({
  providedIn: 'root',
})
export class FilesAngularService {
  constructor(private axiosService: AxiosAngularService) {}

  /** Проверка файлов GTA-SA:MP по ссылке */
  async checkRemoteSAMPFiles(url: string) {
    // TODO: Сделать возможность изменения названия "version.json" динамично
    /** URL адрес до файла version.json */
    const versionUrl = `${url}version.json`;

    try {
      /** Результат работы метода get */
      const response = await this.axiosService.get<IVersionFileGTASA>(
        versionUrl
      );
      /** Файлы GTA SAMP */
      const files = response.data.files;

      const arrFiles = Object.entries(files).map(([key, value]) => ({
        fileName: key,
        ...value,
      }));

      if (arrFiles.length > 0) {
        return true;
      }

      return null;
    } catch (error: any) {
      console.error('Файл version.json не найден:', error.message);
      return null;
    }
  }

  /** Проверка доступности удаленного файла по URL */
  async checkRemoteCrossoverFile(url: string) {
    try {
      await this.axiosService.head(url);
      return true;
    } catch (error: any) {
      console.error('Файл архива с Crossover не найден:', error.message);
    }
    return null;
  }
}
