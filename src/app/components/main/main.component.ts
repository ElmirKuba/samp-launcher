import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { Subscription } from 'rxjs';
import { InstallCrossoverService } from '../../services/install-crossover.service';
import { CrossoverMaintenanceStatus } from '../../interfaces/crossover.interface';
import { MaintenanceCrossoverService } from '../../services/maintenance-crossover.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit, OnDestroy {
  /** Результат подписи статуса работы Crossover */
  crossoverStatusInstall!: boolean;
  /** Подписант статуса работы Crossover */
  crossoverInstalledSubscription: Subscription | null = null;
  /** Статус обслуживания Crossover к работе */
  protected crossoverStatusMaintenance: CrossoverMaintenanceStatus =
    CrossoverMaintenanceStatus.STATUS_UNDEFINED;
  /** Подписант статуса работы Crossover */
  private crossoverMaintenanceSubscription: Subscription | null = null;
  /** Универсальные статусы обслуживания Crossover */
  protected enumCrossoverMaintenanceStatus = CrossoverMaintenanceStatus;

  constructor(
    private storageService: StorageService,
    private installCrossoverService: InstallCrossoverService,
    private maintenanceCrossoverService: MaintenanceCrossoverService
  ) {}

  ngOnInit(): void {
    if (this.crossoverInstalledSubscription !== null) {
      this.crossoverInstalledSubscription.unsubscribe();
      this.crossoverInstalledSubscription = null;
    }

    this.crossoverInstalledSubscription = this.installCrossoverService
      .getCrossoverStatusInstall()
      .subscribe({
        next: (valueStatus) => {
          this.crossoverStatusInstall = valueStatus;
        },
      });

    if (this.crossoverMaintenanceSubscription !== null) {
      this.crossoverMaintenanceSubscription.unsubscribe();
      this.crossoverMaintenanceSubscription = null;
    }

    this.crossoverMaintenanceSubscription = this.maintenanceCrossoverService
      .getCrossoverStatusMaintenance()
      .subscribe({
        next: (valueStatus) => {
          this.crossoverStatusMaintenance = valueStatus;
        },
      });
  }

  ngOnDestroy(): void {
    if (this.crossoverInstalledSubscription !== null) {
      this.crossoverInstalledSubscription.unsubscribe();
      this.crossoverInstalledSubscription = null;
    }

    if (this.crossoverMaintenanceSubscription !== null) {
      this.crossoverMaintenanceSubscription.unsubscribe();
      this.crossoverMaintenanceSubscription = null;
    }
  }
}
