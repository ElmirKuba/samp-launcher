import { Component, OnDestroy, OnInit } from '@angular/core';
import { GoToGameService } from '../../services/go-to-game.service';
import { StorageService } from '../../core/services/storage.service';
import { IServerAdresses } from '../../core/interfaces/storage.interfaces';

@Component({
  selector: 'app-go-to-game',
  templateUrl: './go-to-game.component.html',
  styleUrl: './go-to-game.component.scss',
})
export class GoToGameComponent implements OnInit, OnDestroy {
  serverAdresses: IServerAdresses[] = [];

  constructor(
    private goToGameService: GoToGameService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    /** Массив данных серверов для игры */
    this.serverAdresses =
      this.storageService.getValue<IServerAdresses[]>('serverAdresses');
  }

  ngOnDestroy(): void {}

  /** Перейти в игру */
  playOnServer(server: IServerAdresses): void {
    this.goToGameService.connectToServer(server.ip, server.port);
  }
}
