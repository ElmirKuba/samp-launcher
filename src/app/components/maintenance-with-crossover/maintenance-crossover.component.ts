import { Component, OnDestroy, OnInit } from '@angular/core';
import { MaintenanceCrossoverService } from '../../services/maintenance-crossover.service';
import { Subscription } from 'rxjs';
import { CrossoverMaintenanceStatus } from '../../interfaces/crossover.interface';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-maintenance-crossover',
  templateUrl: './maintenance-crossover.component.html',
  styleUrl: './maintenance-crossover.component.scss',
})
export class WorkingWithMaintenanceComponent implements OnInit, OnDestroy {
  /** Подписант статуса работы Crossover */
  private crossoverMaintenanceSubscription: Subscription | null = null;
  /** Статус обслуживания Crossover к работе */
  protected crossoverStatusMaintenance: CrossoverMaintenanceStatus =
    CrossoverMaintenanceStatus.STATUS_UNDEFINED;
  /** Универсальные статусы обслуживания Crossover */
  protected enumCrossoverMaintenanceStatus = CrossoverMaintenanceStatus;
  /** Наименование бутылки Crossover */
  protected nameBottleCrossover: string | null = null;

  constructor(
    private maintenanceCrossoverService: MaintenanceCrossoverService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    /** Наименование бутылки Crossover */
    this.nameBottleCrossover = this.storageService.getValue<string>(
      'nameBottleCrossover'
    );

    void this.maintenanceCrossoverService.checkCrossoverStatusInstall();

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

  /** Создать бутылку Crossover */
  protected async createBottleCrossover() {
    await this.maintenanceCrossoverService.attemptCreateBottleCrossover();
  }

  ngOnDestroy(): void {
    //
  }
}
