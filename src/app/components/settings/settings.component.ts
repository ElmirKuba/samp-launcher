import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { IStorage } from '../../core/interfaces/storage.interfaces';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { debounceTime } from 'rxjs';

/** Компонент настроек samp-launcher */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  /** Форма компонента настроек samp-launcher */
  settingsForm = new FormGroup<Record<keyof IStorage, AbstractControl>>({
    /** URL загрузки файлов GTA San Andreas () */
    downloadURLOfGTASanAndreasFiles: new FormControl('', [Validators.required]),
  });

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    console.log('SettingsComponent init');
    const configAppAllData = this.storageService.getAllData();

    console.log('::storageService::', configAppAllData);

    this.settingsForm.patchValue({
      downloadURLOfGTASanAndreasFiles:
        configAppAllData.downloadURLOfGTASanAndreasFiles,
    });

    this.settingsForm.valueChanges.pipe(debounceTime(1000)).subscribe({
      next: (formDatas) => {
        console.log('::formDatas::', formDatas);

        this.storageService.setAllData({
          downloadURLOfGTASanAndreasFiles:
            formDatas.downloadURLOfGTASanAndreasFiles,
        });
      },
    });
  }

  clerableInput(nameInput: keyof typeof this.settingsForm.controls): void {
    this.settingsForm.patchValue({
      [nameInput]: '',
    });
  }
}
