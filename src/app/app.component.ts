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
    console.log('APP_CONFIG', APP_CONFIG);
    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
    } else {
      throw new Error('Frontend не приспособлен работать не через Electron!');
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
