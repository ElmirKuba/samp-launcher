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

import { AppComponent } from './app.component';
import { ElectronService } from './core/services/electron.service';
import { StorageService } from './core/services/storage.service';
import { SettingsComponent } from './components/settings/settings.component';
import { FilesAngularService } from './services/files-check.service';
import { AxiosAngularService } from './core/services/axios.service';

@NgModule({
  declarations: [AppComponent, SettingsComponent],
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
  ],
  providers: [
    provideAnimationsAsync(),
    ElectronService,
    StorageService,
    AxiosAngularService,

    FilesAngularService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private storageService: StorageService) {}
}
