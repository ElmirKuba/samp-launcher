import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { timer } from 'rxjs';
import { FilesAngularService } from '../services/files-check.service';

/** Валидатор проверки файлов SAMP сборки по URL */
export function remoteSAMPFilesValidator(
  service: FilesAngularService
): AsyncValidatorFn {
  return (
    control: AbstractControl<string>
  ): Observable<ValidationErrors | null> => {
    const value = control.value;

    // Если поле пустое, не выполняем проверку (оставляем это Validators.required)
    if (!value) {
      return of(null);
    }

    // Проверяем, является ли значение валидным URL
    try {
      new URL(value);
    } catch (e) {
      return of({ invalidUrl: true });
    }

    // Выполняем запрос к version.json с небольшой задержкой (debounce)
    return timer(500).pipe(
      switchMap(async () => await service.checkRemoteSAMPFiles(value)),
      map((response) => (response ? null : { versionNotFound: true }))
    );
  };
}

/** Валидатор проверки файла по URL */
export function remoteFileValidator(
  service: FilesAngularService
): AsyncValidatorFn {
  return (
    control: AbstractControl<string>
  ): Observable<ValidationErrors | null> => {
    const value = control.value;

    // Если поле пустое, не выполняем проверку (оставляем это Validators.required)
    if (!value) {
      return of(null);
    }

    // Проверяем, является ли значение валидным URL
    try {
      new URL(value);
    } catch (e) {
      return of({ invalidUrl: true });
    }

    // Выполняем запрос к version.json с небольшой задержкой (debounce)
    return timer(500).pipe(
      switchMap(async () => await service.checkRemoteCrossoverFile(value)),
      map((response) => (response ? null : { versionNotFound: true }))
    );
  };
}
