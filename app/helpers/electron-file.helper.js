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
exports.ElectronFileHelper = void 0;
const axios_1 = require("axios");
const ipc_identifiers_1 = require("./ipc-identifiers");
const stream_1 = require("stream");
const util_1 = require("util");
const fs = require("fs");
class ElectronFileHelper {
    constructor() {
        this.pipelineAsync = (0, util_1.promisify)(stream_1.pipeline);
        /** Хранит контроллер для отмены запроса */
        this.abortControllerSingleDownloader = null;
        /** Проверка доступности удаленного файла по URL */
        this.nodeCheckRemoteFileFromURL = (url) => __awaiter(this, void 0, void 0, function* () {
            yield axios_1.default.head(url);
        });
        /**
         * Скачивает файл с указанного URL и сохраняет его по указанному пути,
         * предоставляя информацию о прогрессе загрузки.
         * @param win BrowserWindow
         * @param url URL для скачивания файла
         * @param savePath Путь для сохранения файла
         * @param fullPathWithName Путь для сохранения файла с учетом его наименования и расширения
         * @param nameFile Наименование файла
         */
        this.nodeDownloadFileWithProgress = (win, url, savePath, fullPathWithName, nameFile) => __awaiter(this, void 0, void 0, function* () {
            if (fs.existsSync(fullPathWithName)) {
                fs.unlinkSync(fullPathWithName);
            }
            // Отменяем предыдущую загрузку, если она ещё идёт
            if (this.abortControllerSingleDownloader) {
                this.abortControllerSingleDownloader.abort();
            }
            this.abortControllerSingleDownloader = new AbortController();
            /** GET-запрос с responseType: 'stream' */
            const response = yield axios_1.default.get(url, {
                responseType: 'stream',
                signal: this.abortControllerSingleDownloader.signal,
            });
            /** Определяем общий размер */
            const total = parseInt(response.headers['content-length'] || '0', 10);
            /** Сколько загружено будет тут храним */
            let loaded = 0;
            response.data.on('data', (chunk) => {
                loaded += chunk.length;
                win.webContents.send(ipc_identifiers_1.IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronDownloadProgress, { loaded, total });
            });
            if (!fs.existsSync(savePath)) {
                fs.mkdirSync(savePath, {
                    recursive: true,
                });
            }
            yield this.pipelineAsync(response.data, fs.createWriteStream(fullPathWithName));
            win.webContents.send(ipc_identifiers_1.IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronDownloadCompleteSuccess, {});
        });
    }
    /** Возвращает единственный возможный экземпляр */
    static getInstance() {
        if (!ElectronFileHelper.instance) {
            ElectronFileHelper.instance = new ElectronFileHelper();
        }
        return ElectronFileHelper.instance;
    }
    /** Метод для отмены загрузки */
    cancelDownload(win, fullPathWithName) {
        if (this.abortControllerSingleDownloader) {
            this.abortControllerSingleDownloader.abort();
            this.abortControllerSingleDownloader = null;
            if (fs.existsSync(fullPathWithName)) {
                fs.unlinkSync(fullPathWithName);
            }
        }
    }
}
exports.ElectronFileHelper = ElectronFileHelper;
//# sourceMappingURL=electron-file.helper.js.map