import { Component, OnDestroy, OnInit } from '@angular/core';
import { MaintenanceGameService } from '../../services/maintenance-game.service';
import { GameMaintenanceStatus } from '../../interfaces/gta-sa.interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-maintenance-game',
  templateUrl: './maintenance-game.component.html',
  styleUrl: './maintenance-game.component.scss',
})
export class MaintenanceGameComponent implements OnInit, OnDestroy {
  /** Подписант статуса работы игровой сборки */
  private gameMaintenanceSubscription: Subscription | null = null;
  /** Статус обслуживания игровой сборки */
  public gameStatusMaintenance: GameMaintenanceStatus =
    GameMaintenanceStatus.STATUS_UNDEFINED;
  /** Универсальные статусы обслуживания игровой сборки */
  protected enumGameMaintenanceStatus = GameMaintenanceStatus;

  constructor(private maintenanceGameService: MaintenanceGameService) {}

  ngOnInit(): void {
    this.maintenanceGameService.checkMaintenanceGame();

    if (this.gameMaintenanceSubscription !== null) {
      this.gameMaintenanceSubscription.unsubscribe();
      this.gameMaintenanceSubscription = null;
    }

    this.gameMaintenanceSubscription = this.maintenanceGameService
      .getGameStatusMaintenance()
      .subscribe({
        next: (valueStatus) => {
          this.gameStatusMaintenance = valueStatus;
        },
      });
  }

  /** Проверяем и скачиваем игру */
  checkAndDownloadGame() {
    this.maintenanceGameService.checkAndDownloadGame();
  }

  ngOnDestroy(): void {
    if (this.gameMaintenanceSubscription !== null) {
      this.gameMaintenanceSubscription.unsubscribe();
      this.gameMaintenanceSubscription = null;
    }
  }
}
