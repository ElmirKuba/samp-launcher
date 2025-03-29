import { Component, OnInit, signal } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import {
  IServerAdresses,
  IStorage,
} from '../../core/interfaces/storage.interfaces';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { debounceTime } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';

/** Компонент настроек samp-launcher */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  // Разделители для ввода нового чипса

  readonly reactiveKeywordsPathGTASAMP = signal<string[]>([]);

  /** Форма компонента настроек samp-launcher */
  settingsForm = new FormGroup<Record<keyof IStorage, AbstractControl>>({
    /** URL загрузки файлов GTA San Andreas () */
    downloadURLOfGTASanAndreasFiles: new FormControl<string | null>('', {}),
    downloadURLOfCrossover: new FormControl<string | null>('', {}),
    nickNameSAMP: new FormControl<string | null>('', {}),
    nameBottleCrossover: new FormControl<string | null>('', {}),
    folderPathElementsOfGTASanAndreasFiles: new FormControl([], {}),
    serverAdresses: new FormArray([]),
  });

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    const configAppAllData = this.storageService.getAllData();

    this.settingsForm.patchValue({
      downloadURLOfGTASanAndreasFiles:
        configAppAllData.downloadURLOfGTASanAndreasFiles,
      downloadURLOfCrossover: configAppAllData.downloadURLOfCrossover,
      nickNameSAMP: configAppAllData.nickNameSAMP,
      nameBottleCrossover: configAppAllData.nameBottleCrossover,
    });

    this.reactiveKeywordsPathGTASAMP.set([
      ...configAppAllData.folderPathElementsOfGTASanAndreasFiles,
    ]);

    if (configAppAllData.serverAdresses.length > 0) {
      for (const serverAdress of configAppAllData.serverAdresses) {
        this.addServer(serverAdress);
      }
    }

    this.settingsForm.valueChanges.pipe(debounceTime(1000)).subscribe({
      next: (formDatas) => {
        this.storageService.setAllData({
          downloadURLOfGTASanAndreasFiles:
            formDatas.downloadURLOfGTASanAndreasFiles,
          downloadURLOfCrossover: formDatas.downloadURLOfCrossover,
          nickNameSAMP: formDatas.nickNameSAMP,
          nameBottleCrossover: formDatas.nameBottleCrossover,
          serverAdresses: formDatas.serverAdresses,
          folderPathElementsOfGTASanAndreasFiles:
            formDatas.folderPathElementsOfGTASanAndreasFiles,
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

  /** Геттер для массива серверов */
  get serverAdresses(): FormArray {
    return this.settingsForm.controls.serverAdresses as FormArray;
  }

  /** Создает FormGroup для одного сервера */
  private createServerGroup(server?: IServerAdresses): FormGroup {
    return new FormGroup({
      ip: new FormControl(server?.ip || '', []),
      port: new FormControl(server?.port || '', []),
    });
  }

  /** Добавление нового сервера */
  addServer(server?: IServerAdresses): void {
    this.serverAdresses.push(this.createServerGroup(server));
  }

  /** Удаление сервера по индексу */
  removeServer(index: number): void {
    this.serverAdresses.removeAt(index);
  }

  /** Добавить новый элемент пути к месту хранения сборки GTA SAMP */
  addFolderPathElement(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.reactiveKeywordsPathGTASAMP.update((keywords) => [
        ...keywords,
        value,
      ]);
    }

    event.chipInput.clear();
  }

  /** Добавить элемент пути к месту хранения сборки GTA SAMP */
  removeFolderPathElement(keyword: string): void {
    this.reactiveKeywordsPathGTASAMP.update((keywords) => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      return [...keywords];
    });

    this.settingsForm.patchValue({
      folderPathElementsOfGTASanAndreasFiles:
        this.reactiveKeywordsPathGTASAMP(),
    });
  }
}
