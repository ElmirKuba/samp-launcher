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
import {
  remoteFileValidator,
  remoteSAMPFilesValidator,
} from '../../validators/version-validator';
import { FilesAngularService } from '../../services/files-check.service';

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
    downloadURLOfGTASanAndreasFiles: new FormControl<string | null>('', {
      validators: [Validators.required],
      asyncValidators: [remoteSAMPFilesValidator(this.filesAngularService)],
      updateOn: 'change',
    }),
    downloadURLOfCrossover: new FormControl<string | null>('', {
      validators: [Validators.required],
      asyncValidators: [remoteFileValidator(this.filesAngularService)],
      updateOn: 'change',
    }),
    nickNameSAMP: new FormControl<string | null>('', {
      validators: [
        Validators.required, // Ник обязателен
        Validators.pattern(/^[a-zA-Z0-9_]{1,20}$/), // Проверка на длину и символы
      ],
      updateOn: 'change',
    }),
  });

  constructor(
    private storageService: StorageService,
    private filesAngularService: FilesAngularService
  ) {}

  ngOnInit(): void {
    console.log('SettingsComponent init');
    const configAppAllData = this.storageService.getAllData();

    console.log('::storageService::', configAppAllData);

    this.settingsForm.patchValue({
      downloadURLOfGTASanAndreasFiles:
        configAppAllData.downloadURLOfGTASanAndreasFiles,
      downloadURLOfCrossover: configAppAllData.downloadURLOfCrossover,
      nickNameSAMP: configAppAllData.nickNameSAMP,
    });

    // this.settingsForm.controls.downloadURLOfGTASanAndreasFiles.disable();

    this.settingsForm.valueChanges.pipe(debounceTime(1000)).subscribe({
      next: (formDatas) => {
        if (!this.settingsForm.valid) {
          return;
        }

        console.log('::formDatas::', formDatas);

        this.storageService.setAllData({
          downloadURLOfGTASanAndreasFiles:
            formDatas.downloadURLOfGTASanAndreasFiles,
          downloadURLOfCrossover: formDatas.downloadURLOfCrossover,
          nickNameSAMP: formDatas.nickNameSAMP,
        });
      },
    });
  }

  /** Очистка поля ввода по его имени свойства реактивной формы Angular */
  clerableInput(nameInput: keyof typeof this.settingsForm.controls): void {
    this.settingsForm.patchValue({
      [nameInput]: '',
    });
  }
}
