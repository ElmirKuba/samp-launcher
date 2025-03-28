import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from '../core/services/electron.service';

/** Сервис по работе с Crossover */
@Injectable()
export class CrossoverService {
  /** Статус готовности Crossover к работе */
  private crossoverStatusReady = new BehaviorSubject(false);
  /** Путь к Crossover */
  crossoverPath = '/Applications/CrossOver.app';
  /** Путь к инструменту создания бутылок Crossover */
  crossoverCxBottleExist = `${this.crossoverPath}/Contents/SharedSupport/CrossOver/CrossOver-Hosted Application/cxbottle`;
  /** Путь к инструменту запуска приложения Windows в бутылке */
  crossoverCxStartExist = `${this.crossoverPath}/Contents/SharedSupport/CrossOver/bin/cxstart`;

  constructor(private electronService: ElectronService) {}

  /** Получить поток состояния статуса работы Crossover */
  public getCrossoverStatusReady(): BehaviorSubject<boolean> {
    return this.crossoverStatusReady;
  }

  /** Установить новый статус работы Crossover */
  public setCrossoverStatusReady(newStatus: boolean): void {
    this.crossoverStatusReady.next(newStatus);
  }

  /** Запустить проверку работоспособности Crossover */
  public checkCrossoverStatusReady(): void {
    /** Статус установленности Crossover */
    const checkCrossoverInstallation = this.checkCrossoverInstallation();

    this.setCrossoverStatusReady(checkCrossoverInstallation);

    if (!checkCrossoverInstallation) {
      return;
    }
  }

  /** Проверка установленности Crossover */
  checkCrossoverInstallation(): boolean {
    if (!this.electronService.fs.existsSync(this.crossoverPath)) {
      console.log(`Путь ${this.crossoverPath} не найден.`);
      return false;
    }
    if (!this.electronService.fs.existsSync(this.crossoverCxBottleExist)) {
      console.log(`Путь ${this.crossoverCxBottleExist} не найден.`);
      return false;
    }
    if (!this.electronService.fs.existsSync(this.crossoverCxStartExist)) {
      console.log(`Путь ${this.crossoverCxBottleExist} не найден.`);
      return false;
    }

    return true;
  }
}
