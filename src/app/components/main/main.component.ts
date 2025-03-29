import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    const storeTemp = this.storageService.getAllData();

    console.log('______________________________');
    console.log('storageService::', {
      'URL загрузки файла Crossover': storeTemp.downloadURLOfCrossover,
      'URL загрузки файлов GTA SAMP сборки':
        storeTemp.downloadURLOfGTASanAndreasFiles,
      'Элементы пути до папки GTA San Andreas в MacOS и в бутылке Crossover':
        storeTemp.folderPathElementsOfGTASanAndreasFiles,
      'Наименование бутылки Crossover': storeTemp.nameBottleCrossover,
      'Ник игрока': storeTemp.nickNameSAMP,
      'Массив данных серверов для игры': storeTemp.serverAdresses,
    });
    console.log('system::', {
      'Путь до домашней директории пользователя MacOS':
        this.storageService.getHomeDir(),
      'Имя пользователя MacOS': this.storageService.getUserName(),
      'Путь до данных samp-launcher': this.storageService.getAppDataPath(),
      'Путь до основного файла настроек samp-launcher':
        this.storageService.getConfigPath(),
      'Шаблон OS для бутылки Crossover':
        this.storageService.getTemplateOSCrossover(),
      'Описание для бутылки Crossover':
        this.storageService.getDescriptionOSCrossover(),
    });
    console.log('______________________________');
  }
}
