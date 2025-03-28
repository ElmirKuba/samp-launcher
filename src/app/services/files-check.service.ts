import { Injectable } from '@angular/core';
import { AxiosAngularService } from '../core/services/axios.service';
import { IVersionFileGTASA } from '../interfaces/gta-sa.interfaces';
import { ElectronService } from '../core/services/electron.service';

/** Сервис для работы с файлами в лаунчере */
@Injectable({
  providedIn: 'root',
})
export class FilesAngularService {
  constructor(
    private axiosService: AxiosAngularService,
    private electronService: ElectronService
  ) {}

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

  /**
   * Скачивает файл с указанного URL и сохраняет его по указанному пути,
   * предоставляя информацию о прогрессе загрузки.
   * @param url URL для скачивания файла
   * @param savePath Путь для сохранения файла
   */
  async downloadFileWithProgress(url: string, savePath: string): Promise<void> {
    try {
      console.log();

      // // Выполняем запрос с помощью axios
      // const response = await axios.get(url, {
      //   responseType: 'arraybuffer', // Получаем данные как массив байтов
      //   onDownloadProgress: (progressEvent) => {
      //     const loaded = progressEvent.loaded; // Сколько байт уже скачано
      //     const total = progressEvent.total || 0; // Максимальный размер файла в байтах

      //     // Обновляем прогресс
      //     this.downloadProgress.next({ loaded, total });
      //     console.log(`Скачано ${loaded} из ${total} байт`);
      //   },
      // });

      // // Сохраняем файл после завершения загрузки
      // this.electronService.fs.writeFileSync(
      //   savePath,
      //   Buffer.from(response.data)
      // );
      // console.log(`Файл успешно сохранен по пути: ${savePath}`);
      // this.downloadProgress.next({
      //   loaded: response.data.byteLength,
      //   total: response.data.byteLength,
      // });
    } catch (error) {
      console.error('Ошибка при скачивании или сохранении файла:', error);
      throw error;
    }
  }
}
