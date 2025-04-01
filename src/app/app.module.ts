import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AppComponent } from './app.component';
import { ElectronService } from './core/services/electron.service';
import { StorageService } from './core/services/storage.service';
import { SettingsComponent } from './components/settings/settings.component';
import { FilesAngularService } from './services/files-check.service';
import { MainComponent } from './components/main/main.component';
import { MatChipsModule } from '@angular/material/chips';
import { InstallCrossoverComponent } from './components/install-crossover/install-crossover.component';
import { InstallCrossoverService } from './services/install-crossover.service';
import { ToastrModule } from 'ngx-toastr';
import { WorkingWithMaintenanceComponent } from './components/maintenance-with-crossover/maintenance-crossover.component';
import { MaintenanceCrossoverService } from './services/maintenance-crossover.service';
import { MaintenanceGameService } from './services/maintenance-game.service';
import { MaintenanceGameComponent } from './components/maintenance-game/maintenance-game.component';
import { GoToGameService } from './services/go-to-game.service';
import { GoToGameComponent } from './components/go-to-game/go-to-game.component';

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    MainComponent,
    InstallCrossoverComponent,
    WorkingWithMaintenanceComponent,
    MaintenanceGameComponent,
    GoToGameComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    MatChipsModule,
    MatListModule,
    MatProgressBarModule,

    ToastrModule.forRoot({
      closeButton: true,
      timeOut: 5000,
      extendedTimeOut: 5000,
      easing: 'ease-in-out',
      easeTime: 500,
      enableHtml: true,
      progressBar: true,
      progressAnimation: 'decreasing',
      toastClass: 'ngx-toastr',
      positionClass: 'toast-top-right',
      titleClass: 'toast-title',
      messageClass: 'toast-message',
      tapToDismiss: true,
    }),
  ],
  providers: [
    provideAnimationsAsync(),
    ElectronService,
    StorageService,

    FilesAngularService,
    InstallCrossoverService,
    MaintenanceCrossoverService,
    MaintenanceGameService,
    GoToGameService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private storageService: StorageService) {}
}
