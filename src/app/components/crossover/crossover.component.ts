import { Component, OnDestroy, OnInit } from '@angular/core';
import { CrossoverService } from '../../services/crossover.service';
import { Subscription } from 'rxjs';
import { ProgressBarMode } from '@angular/material/progress-bar';

/** Компонент по работе с Crossover */
@Component({
  selector: 'app-crossover',
  templateUrl: './crossover.component.html',
  styleUrl: './crossover.component.scss',
})
export class CrossoverComponent implements OnInit, OnDestroy {
  /** Подписант статуса работы Crossover */
  crossoverStatusSubscription: Subscription | null = null;
  /** Результат подписи статуса работы Crossover */
  crossoverStatusReady!: boolean;
  /** Значение прогресса (0–100) */
  installationProgress: number = 0;
  /** Режим работы прогресс-бара */
  modeProgress: ProgressBarMode = 'determinate';

  constructor(private crossoverService: CrossoverService) {}

  ngOnInit(): void {
    console.log('CrossoverComponent init');

    this.crossoverService.checkCrossoverStatusReady();

    if (this.crossoverStatusSubscription !== null) {
      this.crossoverStatusSubscription.unsubscribe();
      this.crossoverStatusSubscription = null;
    }

    this.crossoverStatusSubscription = this.crossoverService
      .getCrossoverStatusReady()
      .subscribe({
        next: (valueStatus) => {
          this.crossoverStatusReady = valueStatus;
        },
      });
  }

  ngOnDestroy(): void {
    if (this.crossoverStatusSubscription !== null) {
      this.crossoverStatusSubscription.unsubscribe();
      this.crossoverStatusSubscription = null;
    }
  }

  /** Установка Crossover и проверка результата */
  installAndCheck() {
    this.crossoverService.downloadCrossoverAndInstall();

    // this.installationProgress = 0;

    // const interval = setInterval(() => {
    //   this.installationProgress += 10;
    //   if (this.installationProgress >= 100) {
    //     clearInterval(interval);
    //     this.modeProgress = 'indeterminate';
    //   }
    // }, 300);
  }
}
