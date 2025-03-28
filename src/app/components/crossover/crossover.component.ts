import { Component, OnDestroy, OnInit } from '@angular/core';
import { CrossoverService } from '../../services/crossover.service';
import { Subscription } from 'rxjs';

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
}
