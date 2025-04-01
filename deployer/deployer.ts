const { isArray } = require('lodash');
const fs = require('fs');
const path = require('path');
// const axios = require('axios'); // Не забывайте установить axios
const { createHash } = require('crypto');

/** Описание одного элемента в свойстве files */
interface IOneGTASAFileItem {
  /** Относительный путь к файлу */
  relativePath: string;
  /** Конкретное наименование файла */
  fileName: string;
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
    if (
      file.includes('version.json') ||
      file.includes('.DS_Store') ||
      file.includes('.log')
    ) {
      return;
    }

    const fullPath = path.join(dir, file);
    const relativeFilePath = path.join(relativePath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      scanDirectory(fullPath, relativeFilePath);
    } else {
      resultScan[relativeFilePath] = {
        relativePath,
        fileName: file,
        size: stats.size,
        hash: getFileHash(fullPath),
        version: 0.1, // Изначальная версия файла
      };
    }
  });
}

scanDirectory(baseDir);

const jsonData = JSON.stringify(resultScan, null, 2);
/** Путь version.json внутри игровой сборки */
const pathToBuildVersionData = path.join(baseDir, 'version.json');

if (fs.existsSync(pathToBuildVersionData)) {
  fs.unlinkSync(pathToBuildVersionData);
}

fs.writeFileSync(pathToBuildVersionData, jsonData, 'utf-8');
