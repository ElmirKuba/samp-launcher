import { Injectable } from '@angular/core';

import { ipcRenderer, webFrame } from 'electron';
import childProcess from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import process from 'process';
import https from 'https';
import child_process from 'child_process';
import util from 'util';
import stream from 'stream';
import extract from 'extract-zip';
import bplist from 'bplist-parser';
import crypto from 'crypto';

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
  /** https */
  https!: typeof https;
  /** child_process */
  child_process!: typeof child_process;
  /** util */
  util!: typeof util;
  /** stream */
  stream!: typeof stream;
  /** extract */
  extract!: typeof extract;
  /** bplist */
  bplist!: typeof bplist;
  /** crypto */
  crypto!: typeof crypto;

  constructor() {
    if (this.isElectron) {
      this.ipcRenderer = (window as any).require('electron').ipcRenderer;
      this.webFrame = (window as any).require('electron').webFrame;

      this.fs = (window as any).require('fs');
      this.os = (window as any).require('os');
      this.path = (window as any).require('path');
      this.process = (window as any).require('process');
      this.https = (window as any).require('https');
      this.child_process = (window as any).require('child_process');
      this.util = (window as any).require('util');
      this.stream = (window as any).require('stream');
      this.extract = (window as any).require('extract-zip');
      this.bplist = (window as any).require('bplist-parser');
      this.crypto = (window as any).require('crypto');

      this.childProcess = (window as any).require('child_process');
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
