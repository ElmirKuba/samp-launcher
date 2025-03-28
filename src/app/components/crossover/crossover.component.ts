import { Component, OnDestroy, OnInit } from '@angular/core';
import { CrossoverService } from '../../services/crossover.service';
import { Subscription } from 'rxjs';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { FilesAngularService } from '../../services/files-check.service';
import { IDownloadProgress } from '../../interfaces/files.interfaces';

/** Компонент по работе с Crossover */
@Component({
  selector: 'app-crossover',
  templateUrl: './crossover.component.html',
  styleUrl: './crossover.component.scss',
})
export class CrossoverComponent implements OnInit, OnDestroy {
  /** Подписант статуса работы Crossover */
  crossoverStatusSubscription: Subscription | null = null;
  /** Подписант статуса работы Crossover */
  progressDownloadSubscription: Subscription | null = null;
  /** Результат подписи статуса работы Crossover */
  crossoverStatusReady!: boolean;
  /** Значение прогресса (0–100) */
  installationProgress: number = 0;
  /** Сколько скачано в байтах уже */
  loadedProgress: number = 0;
  /** Сколько всего скачать в байтах */
  totalProgress: number = 0;
  /** Режим работы прогресс-бара */
  modeProgress: ProgressBarMode = 'determinate';

  constructor(
    private crossoverService: CrossoverService,
    private filesAngularService: FilesAngularService
  ) {}

  ngOnInit(): void {
    console.log('CrossoverComponent init');

    void this.crossoverService.checkCrossoverStatusReady();

    if (this.crossoverStatusSubscription !== null) {
      this.crossoverStatusSubscription.unsubscribe();
      this.crossoverStatusSubscription = null;
    }

    this.crossoverStatusSubscription = this.crossoverService
      .getCrossoverStatusReady()
      .subscribe({
        next: (valueStatus) => {
          this.crossoverStatusReady = valueStatus;

          if (this.crossoverStatusReady) {
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
            this.installationProgress = Math.round(
              progress.progressDecimal * 100
            );

            this.loadedProgress = progress.loaded;
            this.totalProgress = progress.total;

            console.log(
              'getDownloadProgress subscribe::?',
              Boolean(progress),
              progress,
              `${this.installationProgress}%`
            );

            if (this.installationProgress >= 100) {
              this.modeProgress = 'indeterminate';

              void this.crossoverService.checkCrossoverStatusReady();
            }
          }
        },

        error: (err) => {
          console.error('Download error:', err);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.crossoverStatusSubscription !== null) {
      this.crossoverStatusSubscription.unsubscribe();
      this.crossoverStatusSubscription = null;
    }

    if (this.progressDownloadSubscription !== null) {
      this.progressDownloadSubscription.unsubscribe();
      this.progressDownloadSubscription = null;
    }
  }

  /** Установка Crossover и проверка результата */
  async installAndCheck() {
    const statusDownloadStated =
      await this.crossoverService.downloadCrossoverAndInstall();

    console.log('statusDownloadStated', statusDownloadStated);
  }

  /** Отмена загрузки */
  cancelDownload() {
    this.filesAngularService.cancelDownload();

    void this.crossoverService.checkCrossoverStatusReady();
  }
}
