import { BrowserWindow, ipcMain } from 'electron';
import { IPC_ELECTRON_IDENTIFIERS } from './ipc-identifiers';
import { ElectronFileHelper } from './electron-file.helper';

const electronFileHelper = ElectronFileHelper.getInstance();

/** Все ICP события */
const allIcpEvents = (win: BrowserWindow) => {
  /** Регистрируем событие проверки файла по URL на стороне Node.js Electron */
  ipcMain.handle(
    IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronCheckRemoteFileFromURL,
    (event, { url }) => {
      try {
        electronFileHelper.nodeCheckRemoteFileFromURL(url);

        return { success: true, error: null };
      } catch (error) {
        return { success: false, error };
      }
    }
  );

  /**
   * Скачивает файл с указанного URL и сохраняет его по указанному пути,
   * предоставляя информацию о прогрессе загрузки.
   * @param url URL для скачивания файла
   * @param savePath Путь для сохранения файла
   * @param nameFile Наименование файла
   */
  ipcMain.handle(
    IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronDownloadFileWithProgress,
    async (event, { url, savePath, fullPathWithName }) => {
      try {
        await electronFileHelper.nodeDownloadFileWithProgress(
          win,
          url,
          savePath,
          fullPathWithName
        );

        return { success: true, error: null };
      } catch (error) {
        win.webContents.send(
          IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronDownloadProcessError,
          { error: JSON.parse(JSON.stringify(error)) }
        );

        return { success: false, error };
      }
    }
  );

  /**
   * Для отмены текущего процесса скачивания файла.
   * Вызывается с фронтенда (например, по клику на кнопку отмены загрузки).
   */
  ipcMain.handle(
    IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronCancelDownloadFile,
    async (event, { pathForFileCrossover }) => {
      try {
        electronFileHelper.cancelDownload(win, pathForFileCrossover);

        return { success: true, error: null };
      } catch (error) {
        return { success: false, error };
      }
    }
  );
};

export default allIcpEvents;
