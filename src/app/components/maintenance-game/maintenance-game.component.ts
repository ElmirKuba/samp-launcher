import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MaintenanceGameService } from '../../services/maintenance-game.service';
import { GameMaintenanceStatus } from '../../interfaces/gta-sa.interfaces';
import { Subscription } from 'rxjs';
import { ProgressBarMode } from '@angular/material/progress-bar';

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
  /** Подписант наименования проверяемого сейчас файла */
  private nameFileCheckProcessSubscription: Subscription | null = null;
  /** Какой файл игровой сборки сейчас проверяется */
  public whichGameBuildFileIsCurrentlyBeingChecked: string | null = null;
  /** Режим работы прогресс-бара */
  modeProgress: ProgressBarMode = 'determinate';
  /** Значение прогресса (0–100) */
  installationProgress: number = 0;

  constructor(
    private maintenanceGameService: MaintenanceGameService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.maintenanceGameService.checkMaintenanceGame();

    if (this.nameFileCheckProcessSubscription !== null) {
      this.nameFileCheckProcessSubscription.unsubscribe();
      this.nameFileCheckProcessSubscription = null;
    }

    if (this.gameMaintenanceSubscription !== null) {
      this.gameMaintenanceSubscription.unsubscribe();
      this.gameMaintenanceSubscription = null;
    }

    this.gameMaintenanceSubscription = this.maintenanceGameService
      .getGameStatusMaintenance()
      .subscribe({
        next: (valueStatus) => {
          this.gameStatusMaintenance = valueStatus;

          if (
            this.gameStatusMaintenance ===
            GameMaintenanceStatus.READY_FOR_VERIFICATION
          ) {
            this.nameFileCheckProcessSubscription = this.maintenanceGameService
              .getWhichGameBuildFileIsCurrentlyBeingChecked()
              .subscribe({
                next: (nameFile) => {
                  this.zone.run(() => {
                    this.whichGameBuildFileIsCurrentlyBeingChecked = nameFile;
                  });
                },
              });
          } else {
            if (this.nameFileCheckProcessSubscription !== null) {
              this.nameFileCheckProcessSubscription.unsubscribe();
              this.nameFileCheckProcessSubscription = null;
            }
          }
        },
      });
  }

  /** Проверяем игру */
  checkGame() {
    this.maintenanceGameService.checkGame();
  }

  /** Скачиваем необходимые файлы */
  async downloadNecessaryFiles() {
    await this.maintenanceGameService.downloadNecessaryFiles();
  }

  ngOnDestroy(): void {
    if (this.gameMaintenanceSubscription !== null) {
      this.gameMaintenanceSubscription.unsubscribe();
      this.gameMaintenanceSubscription = null;
    }

    if (this.nameFileCheckProcessSubscription !== null) {
      this.nameFileCheckProcessSubscription.unsubscribe();
      this.nameFileCheckProcessSubscription = null;
    }
  }
}
