const { isArray } = require('lodash');
const fs = require('fs');
const path = require('path');
// const axios = require('axios'); // Не забывайте установить axios
const { createHash } = require('crypto');

/** Описание одного элемента в свойстве files */
interface IOneGTASAFileItem {
  /** Хеш файла GTA SA в байтах */
  hash: string;
  /** Размер файла GTA SAMP в байтах */
  size: number;
  /** Версия файла */
  version: number;
}

/** Папка с файлами сборки GTA-SAMP */
const baseDir = path.join(__dirname, 'GTA_SAMP_FILES');

const resultScan: Record<string, IOneGTASAFileItem> = {};

/** Функция для вычисления SHA-256 хэша файла */
function getFileHash(filePath: string): string {
  const hash = createHash('sha256');
  const fileBuffer = fs.readFileSync(filePath);
  hash.update(fileBuffer);
  return hash.digest('hex');
}

/** Метод сканирования папки */
function scanDirectory(dir: string, relativePath: string = '') {
  const files = fs.readdirSync(dir) as string[];

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const relativeFilePath = path.join(relativePath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      scanDirectory(fullPath, relativeFilePath);
    } else {
      resultScan[relativeFilePath] = {
        size: stats.size,
        hash: getFileHash(fullPath),
        version: 0.1, // Изначальная версия файла
      };
    }
  });
}

scanDirectory(baseDir);
console.log('resultScan::', resultScan);

const jsonData = JSON.stringify(resultScan, null, 2);
fs.writeFileSync(path.join(baseDir, 'version.json'), jsonData, 'utf-8');

// /** Метод для скачивания файла по URL с использованием стрима */
// async function downloadFile(url: string, localPath: string) {
//   const writer = fs.createWriteStream(localPath); // Создаем поток записи в файл
//   const response = await axios.get(url, { responseType: 'stream' }); // Запрашиваем файл как поток
//   response.data.pipe(writer); // Прокачиваем поток данных в файл

//   // Возвращаем промис, который завершается, когда файл полностью записан
//   return new Promise<void>((resolve, reject) => {
//     writer.on('finish', () => {
//       console.log(`Скачан файл: ${localPath}`);
//       resolve();
//     });
//     writer.on('error', (error: any) => {
//       console.error(`Ошибка при скачивании файла: ${localPath}`, error);
//       reject(error);
//     });
//   });
// }

// /** Метод сравнения локального и удаленного файла */
// function isFileOutdated(
//   localFile: IOneGTASAFileItem,
//   remoteFile: IOneGTASAFileItem
// ): boolean {
//   return (
//     localFile.version < remoteFile.version ||
//     localFile.hash !== remoteFile.hash ||
//     localFile.size !== remoteFile.size
//   );
// }

// /** Метод загрузки удаленного version.json */
// async function fetchRemoteVersionJson(): Promise<
//   Record<string, IOneGTASAFileItem>
// > {
//   try {
//     const response = await axios.get('https://example.com/version.json');
//     return response.data;
//   } catch (error) {
//     console.error('Ошибка при загрузке version.json:', error);
//     throw error;
//   }
// }

// /** Основная функция для синхронизации файлов */
// async function syncFiles() {
//   const remoteVersion = await fetchRemoteVersionJson(); // Загружаем version.json с сервера

//   // Локальные файлы
//   if (fs.existsSync(baseDir)) {
//     scanDirectory(baseDir);
//     console.log('Локальная информация о файлах:', resultScan);
//   } else {
//     console.error(`Папка "${baseDir}" не найдена.`);
//     return;
//   }

//   const filesToDownload: string[] = [];

//   // Сравниваем локальные и удаленные файлы
//   for (const fileName in remoteVersion) {
//     const remoteFile = remoteVersion[fileName];
//     const localFile = resultScan[fileName];

//     // Проверяем, если файл отсутствует или отличается
//     if (!localFile || isFileOutdated(localFile, remoteFile)) {
//       console.log(`Файл ${fileName} требует обновления`);
//       filesToDownload.push(fileName);
//     }
//   }

//   if (filesToDownload.length > 0) {
//     console.log(`Файлы для скачивания: ${filesToDownload.join(', ')}`);

//     // Загружаем недостающие файлы
//     for (const fileName of filesToDownload) {
//       const fileUrl = `https://example.com/${fileName}`;
//       const filePath = path.join(baseDir, fileName);
//       await downloadFile(fileUrl, filePath); // Скачиваем с помощью стрима
//     }

//     console.log('Все файлы скачаны и заменены.');
//   } else {
//     console.log('Все файлы актуальны.');
//   }
// }

// // Запускаем процесс синхронизации
// syncFiles();
