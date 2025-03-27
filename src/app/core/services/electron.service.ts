import { Injectable } from '@angular/core';

import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as process from 'process';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import axios from 'axios';
import * as https from 'https';

/**
 * Сервис для работы с API Electron и Node.js в Angular-приложении.
 * Предоставляет доступ к модулям Electron и Node.js, таким как ipcRenderer, fs, os и др.
 * Используется для выполнения задач, требующих взаимодействия с операционной системой или Electron.
 */
@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  /** Объект ipcRenderer для взаимодействия с основным процессом Electron. */
  ipcRenderer!: typeof ipcRenderer;
  /** Объект webFrame для управления фреймами в Electron. */
  webFrame!: typeof webFrame;
  /** Модуль child_process для запуска дочерних процессов. */
  childProcess!: typeof childProcess;
  /** Модуль fs для работы с файловой системой. */
  fs!: typeof fs;
  /** Модуль os для получения информации об операционной системе. */
  os!: typeof os;
  /** Модуль path для работы с путями файлов и директорий. */
  path!: typeof path;
  /** Модуль process для доступа к информации о текущем процессе. */
  process!: typeof process;
  /** axios */
  axios!: typeof axios;
  /** https */
  https!: typeof https;

  constructor() {
    if (this.isElectron) {
      this.ipcRenderer = (window as any).require('electron').ipcRenderer;
      this.webFrame = (window as any).require('electron').webFrame;

      this.fs = (window as any).require('fs');
      this.os = (window as any).require('os');
      this.path = (window as any).require('path');
      this.process = (window as any).require('process');
      this.axios = (window as any).require('axios');
      this.https = (window as any).require('https');

      this.childProcess = (window as any).require('child_process');
      this.childProcess.exec('node -v', (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout:\n${stdout}`);
      });
    }
  }

  /**
   * Проверяет, запущено ли приложение в среде Electron.
   * @returns {boolean} true, если приложение запущено в Electron, иначе false.
   */
  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }
}
