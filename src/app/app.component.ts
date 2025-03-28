import { Component, OnInit } from '@angular/core';
import { ElectronService } from './core/services/electron.service';
import { APP_CONFIG } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  activeTabIndex = 0;

  constructor(private electronService: ElectronService) {
    console.log('AppComponent init');
    console.log('APP_CONFIG', APP_CONFIG);
    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }

  ngOnInit(): void {
    //
  }

  onTabChange(index: number): void {
    this.fetchTabData();

    this.activeTabIndex = index;
  }

  private fetchTabData(): void {}
}
