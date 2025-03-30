import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root',
})
export class AxiosAngularService {
  constructor(private electronService: ElectronService) {}

  /**
   * Выполнение произвольного запроса с использованием конфигурации Axios
   * @param config Объект конфигурации запроса (метод, URL, данные и т.д.)
   */
  async request<RequestResultData>(config: any) {
    if (!this.electronService.isElectron || !this.electronService.axios) {
      console.error('Electron или Axios недоступны'); // TODO: Избавиться от console.*
      throw new Error('Axios is not available in this environment');
    }

    try {
      const response =
        await this.electronService.axios.request<RequestResultData>(config);
      return response;
    } catch (error: any) {
      console.error('Ошибка выполнения запроса:', error.message); // TODO: Избавиться от console.*
      throw error;
    }
  }

  /**
   * Выполнение GET-запроса
   * @param url URL для запроса
   * @param config Дополнительная конфигурация (опционально)
   */
  async get<RequestResultData>(url: string, config?: any) {
    return this.request<RequestResultData>({ ...config, method: 'GET', url });
  }

  /**
   * Выполнение POST-запроса
   * @param url URL для запроса
   * @param data Данные для отправки
   * @param config Дополнительная конфигурация (опционально)
   */
  async post(url: string, data?: any, config?: any): Promise<any> {
    return this.request({ ...config, method: 'POST', url, data });
  }

  /**
   * Выполнение HEAD-запроса
   * @param url URL для запроса
   * @param config Дополнительная конфигурация (опционально)
   */
  async head<RequestResultData>(url: string, config?: any) {
    try {
      const response = await this.electronService.axios.head<RequestResultData>(
        url,
        config
      );
      return response;
    } catch (error: any) {
      console.error('Ошибка выполнения HEAD-запроса:', error.message); // TODO: Избавиться от console.*
      throw error;
    }
  }

  /**
   * Выполнение PUT-запроса
   * @param url URL для запроса
   * @param data Данные для отправки
   * @param config Дополнительная конфигурация (опционально)
   */
  async put(url: string, data?: any, config?: any): Promise<any> {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  /**
   * Выполнение DELETE-запроса
   * @param url URL для запроса
   * @param config Дополнительная конфигурация (опционально)
   */
  async delete(url: string, config?: any): Promise<any> {
    return this.request({ ...config, method: 'DELETE', url });
  }

  /**
   * Выполнение PATCH-запроса
   * @param url URL для запроса
   * @param data Данные для отправки
   * @param config Дополнительная конфигурация (опционально)
   */
  async patch(url: string, data?: any, config?: any): Promise<any> {
    return this.request({ ...config, method: 'PATCH', url, data });
  }
}
