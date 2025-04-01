"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipc_identifiers_1 = require("./ipc-identifiers");
const electron_file_helper_1 = require("./electron-file.helper");
const electronFileHelper = electron_file_helper_1.ElectronFileHelper.getInstance();
/** Все ICP события */
const allIcpEvents = (win) => {
    /** Регистрируем событие проверки файла по URL на стороне Node.js Electron */
    electron_1.ipcMain.handle(ipc_identifiers_1.IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronCheckRemoteFileFromURL, (event, { url }) => {
        try {
            electronFileHelper.nodeCheckRemoteFileFromURL(url);
            return { success: true, error: null };
        }
        catch (error) {
            return { success: false, error };
        }
    });
    /**
     * Скачивает файл с указанного URL и сохраняет его по указанному пути,
     * предоставляя информацию о прогрессе загрузки.
     * @param url URL для скачивания файла
     * @param savePath Путь для сохранения файла
     * @param nameFile Наименование файла
     */
    electron_1.ipcMain.handle(ipc_identifiers_1.IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronDownloadFileWithProgress, (event_1, _a) => __awaiter(void 0, [event_1, _a], void 0, function* (event, { url, savePath, fullPathWithName, fileNeedToSave }) {
        try {
            const result = yield electronFileHelper.nodeDownloadFileWithProgress(win, url, savePath, fullPathWithName, fileNeedToSave);
            return {
                success: true,
                error: null,
                data: result,
            };
        }
        catch (error) {
            win.webContents.send(ipc_identifiers_1.IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronDownloadProcessError, { error: JSON.parse(JSON.stringify(error)) });
            return {
                success: false,
                error,
                data: null,
            };
        }
    }));
    /**
     * Для отмены текущего процесса скачивания файла.
     * Вызывается с фронтенда (например, по клику на кнопку отмены загрузки).
     */
    electron_1.ipcMain.handle(ipc_identifiers_1.IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronCancelDownloadFile, (event_2, _b) => __awaiter(void 0, [event_2, _b], void 0, function* (event, { pathForFileCrossover }) {
        try {
            electronFileHelper.cancelDownload(win, pathForFileCrossover);
            return { success: true, error: null };
        }
        catch (error) {
            return { success: false, error };
        }
    }));
};
exports.default = allIcpEvents;
//# sourceMappingURL=icp-events.js.map