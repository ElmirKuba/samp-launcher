import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { InstallCrossoverService } from '../../services/install-crossover.service';
import { Subscription } from 'rxjs';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { FilesAngularService } from '../../services/files-check.service';
import { IDownloadProgress } from '../../interfaces/files.interfaces';
import { ElectronService } from '../../core/services/electron.service';
import { IPC_ELECTRON_IDENTIFIERS } from '../../../../app/helpers/ipc-identifiers';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../core/services/storage.service';

/** Компонент по обслуживанию Crossover */
@Component({
  selector: 'app-install-crossover',
  templateUrl: './install-crossover.component.html',
  styleUrl: './install-crossover.component.scss',
})
export class InstallCrossoverComponent implements OnInit, OnDestroy {
  /** Подписант статуса работы Crossover */
  crossoverInstalledSubscription: Subscription | null = null;
  /** Подписант статуса загрузки Crossover */
  progressDownloadSubscription: Subscription | null = null;
  /** Процесс распаковки Crossover */
  processExtractCrossover: Subscription | null = null;
  /** Результат подписи статуса работы Crossover */
  crossoverStatusInstall!: boolean;
  /** Значение прогресса (0–100) */
  installationProgress: number = 0;
  /** Сколько скачано в байтах уже */
  loadedProgress: number = 0;
  /** Сколько всего скачать в байтах */
  totalProgress: number = 0;
  /** Режим работы прогресс-бара */
  modeProgress: ProgressBarMode = 'determinate';
  /** Распаковки Crossover */
  extractCrossover: string | null = null;

  constructor(
    private installCrossoverService: InstallCrossoverService,
    private filesAngularService: FilesAngularService,
    private zone: NgZone,
    private electronService: ElectronService,
    private toastr: ToastrService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    void this.installCrossoverService.checkCrossoverStatusInstall();

    if (this.crossoverInstalledSubscription !== null) {
      this.crossoverInstalledSubscription.unsubscribe();
      this.crossoverInstalledSubscription = null;
    }

    this.crossoverInstalledSubscription = this.installCrossoverService
      .getCrossoverStatusInstall()
      .subscribe({
        next: (valueStatus) => {
          this.crossoverStatusInstall = valueStatus;

          if (this.crossoverStatusInstall) {
            this.modeProgress = 'determinate';
          }
        },
      });

    if (this.progressDownloadSubscription !== null) {
      this.progressDownloadSubscription.unsubscribe();
      this.progressDownloadSubscription = null;
    }

    this.progressDownloadSubscription = this.filesAngularService
      .getDownloadProgress()
      .subscribe({
        next: (progress: IDownloadProgress | null) => {
          if (progress) {
            this.zone.run(() => {
              this.installationProgress = progress.progressDecimal;
              this.loadedProgress = progress.loaded;
              this.totalProgress = progress.total;
            });
          }
        },
      });

    if (this.processExtractCrossover !== null) {
      this.processExtractCrossover.unsubscribe();
      this.processExtractCrossover = null;
    }

    this.processExtractCrossover = this.filesAngularService
      .getExtractCrossover()
      .subscribe({
        next: (state) => {
          this.zone.run(() => {
            this.extractCrossover = state;
          });
        },
      });

    this.electronService.ipcRenderer.on(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronDownloadCompleteSuccess,
      (event, { _ }) => {
        event;
        _;

        this.modeProgress = 'indeterminate';

        void this.installCrossoverService.checkCrossoverStatusInstall();
      }
    );

    this.electronService.ipcRenderer.on(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      IPC_ELECTRON_IDENTIFIERS.fileInteraction.electronDownloadProcessError,
      (event: any, { error }) => {
        this.toastr.error(
          `Скачать файл по ссылке "${error.config.url}" не получилось. Код причины: ${error.message}`,
          'Ошибка работы с Crossover'
        );

        void this.installCrossoverService.checkCrossoverStatusInstall();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.crossoverInstalledSubscription !== null) {
      this.crossoverInstalledSubscription.unsubscribe();
      this.crossoverInstalledSubscription = null;
    }

    if (this.progressDownloadSubscription !== null) {
      this.progressDownloadSubscription.unsubscribe();
      this.progressDownloadSubscription = null;
    }

    if (this.processExtractCrossover !== null) {
      this.processExtractCrossover.unsubscribe();
      this.processExtractCrossover = null;
    }
  }

  /** Установка Crossover и проверка результата */
  async installAndCheck(): Promise<void> {
    await this.installCrossoverService.downloadCrossoverAndInstall();
  }

  /** Отмена загрузки */
  async cancelDownload() {
    await this.filesAngularService.cancelDownload();
    this.filesAngularService.removeFileForPath(
      this.storageService.getCrossoverPath()
    );
  }
}
