import axios from 'axios';
import { BrowserWindow } from 'electron';
import { IPC_ELECTRON_IDENTIFIERS } from './ipc-identifiers';
import { pipeline } from 'stream';
import { promisify } from 'util';
import * as fs from 'fs';

export class ElectronFileHelper {
  protected pipelineAsync = promisify(pipeline);
  /** Хранит контроллер для отмены запроса */
  private abortControllerSingleDownloader: AbortController | null = null;
  /** Тут храним экземпляр */
  private static instance: ElectronFileHelper;

  /** Возвращает единственный возможный экземпляр */
  public static getInstance(): ElectronFileHelper {
    if (!ElectronFileHelper.instance) {
      ElectronFileHelper.instance = new ElectronFileHelper();
    }

    return ElectronFileHelper.instance;
  }

  /** Проверка доступности удаленного файла по URL */
  public nodeCheckRemoteFileFromURL = async (url: string) => {
    await axios.head(url);
  };

  /**
   * Скачивает файл с указанного URL и сохраняет его по указанному пути,
   * предоставляя информацию о прогрессе загрузки.
   * @param win BrowserWindow
   * @param url URL для скачивания файла
   * @param savePath Путь для сохранения файла
   * @param fullPathWithName Путь для сохранения файла с учетом его наименования и расширения
   * @param fileNeedToSave Нужно ли сохранять файл или просто прочитать? (По умолчанию сохраняем файл)
   */
  public nodeDownloadFileWithProgress = async (
    win: BrowserWindow,
    url: string,
    savePath: string,
    fullPathWithName: string | null = null,
    fileNeedToSave: boolean = true
  ) => {
    let returnedResolveMethond: Function;

    const returnedPromise = new Promise<any>((resolve) => {
      returnedResolveMethond = resolve;
    });

    if (fullPathWithName && fs.existsSync(fullPathWithName)) {
      fs.unlinkSync(fullPathWithName);
    }

    // Отменяем предыдущую загрузку, если она ещё идёт
    if (this.abortControllerSingleDownloader) {
      this.abortControllerSingleDownloader.abort();
    }

    this.abortControllerSingleDownloader = new AbortController();

    /** GET-запрос с responseType: 'stream' */
    const response = await axios.get(url, {
      responseType: 'stream',
      signal: this.abortControllerSingleDownloader.signal,
    });

    /** Определяем общий размер */
    const total = parseInt(response.headers['content-length'] || '0', 10);
    /** Сколько загружено будет тут храним */
    let loaded = 0;
    /** Данные загруженного файла, если его не надо сохранять */
    let dataChunks: Buffer[] = [];

    response.data.on('data', (chunk: Buffer) => {
      loaded += chunk.length;

      if (fileNeedToSave !== true || !fullPathWithName) {
        dataChunks.push(chunk);
      }

      win.webContents.send(
        IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronDownloadProgress,
        { loaded, total }
      );
    });

    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, {
        recursive: true,
      });
    }

    if (fileNeedToSave === true || fullPathWithName) {
      await this.pipelineAsync(
        response.data,
        fs.createWriteStream(fullPathWithName)
      );

      win.webContents.send(
        IPC_ELECTRON_IDENTIFIERS.fileInteraction
          .electronDownloadCompleteSuccess,
        {}
      );

      returnedResolveMethond(null);
    } else {
      response.data.on('end', () => {
        const fileData = Buffer.concat(dataChunks).toString('utf-8');

        try {
          const parsedData = JSON.parse(fileData);

          win.webContents.send(
            IPC_ELECTRON_IDENTIFIERS.fileInteraction
              .electronDownloadCompleteSuccess,
            { returnData: parsedData }
          );

          returnedResolveMethond(parsedData);
        } catch (error) {
          win.webContents.send(
            IPC_ELECTRON_IDENTIFIERS.fileInteraction
              .electronDownloadCompleteSuccess,
            { returnData: fileData }
          );

          returnedResolveMethond(fileData);
        }
      });
    }

    return await returnedPromise;
  };

  /** Метод для отмены загрузки */
  public cancelDownload(win: BrowserWindow, fullPathWithName: string): void {
    if (this.abortControllerSingleDownloader) {
      this.abortControllerSingleDownloader.abort();
      this.abortControllerSingleDownloader = null;

      if (fs.existsSync(fullPathWithName)) {
        fs.unlinkSync(fullPathWithName);
      }
    }
  }
}
