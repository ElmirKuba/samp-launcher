"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPC_ELECTRON_IDENTIFIERS = void 0;
/** Идентификаторы событий для icpMain */
exports.IPC_ELECTRON_IDENTIFIERS = {
    /** Файловое взаимодействие */
    fileInteraction: {
        /** Проверка доступности удаленного файла по URL */
        electronCheckRemoteFileFromURL: 'check-remote-file-from-url',
        /** Скачивание файла по URL */
        electronDownloadFileWithProgress: 'download-file-with-progress',
        /** Отмена скачивания файла по URL */
        electronCancelDownloadFile: 'cancel-download-file',
        /** Прогресс загрузки */
        electronDownloadProgress: 'download-progress',
        /** Загрузка завершилась успешно */
        electronDownloadCompleteSuccess: 'download-complete-success',
        /** Загрузка завершилась/прервалась с ошибкой */
        electronDownloadProcessError: 'download-process-error',
    },
};
//# sourceMappingURL=ipc-identifiers.js.map