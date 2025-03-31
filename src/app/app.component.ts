import { Component, OnInit } from '@angular/core';
import { ElectronService } from './core/services/electron.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  activeTabIndex = 0;

  constructor(private electronService: ElectronService) {
    if (!electronService.isElectron) {
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
