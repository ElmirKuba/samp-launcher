import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { Subscription } from 'rxjs';
import { InstallCrossoverService } from '../../services/install-crossover.service';

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

  constructor(
    private storageService: StorageService,
    private installCrossoverService: InstallCrossoverService
  ) {}

  ngOnInit(): void {
    const storeTemp = this.storageService.getAllData();

    console.log('______________________________');
    console.log('storageService::', {
      'URL загрузки файлов GTA SAMP сборки':
        storeTemp.downloadURLOfGTASanAndreasFiles,
      'Элементы пути до папки GTA San Andreas в MacOS и в бутылке Crossover':
        storeTemp.folderPathElementsOfGTASanAndreasFiles,
      'Ник игрока': storeTemp.nickNameSAMP,
      'Массив данных серверов для игры': storeTemp.serverAdresses,
    });
    console.log('______________________________');

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
  }

  ngOnDestroy(): void {
    if (this.crossoverInstalledSubscription !== null) {
      this.crossoverInstalledSubscription.unsubscribe();
      this.crossoverInstalledSubscription = null;
    }
  }
}
