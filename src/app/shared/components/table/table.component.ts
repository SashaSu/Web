import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableColumn, TableData } from '../../models/table-config';
import { UserRole } from '../../models/user-role';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-shared-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  @Input() title = '';
  @Input() addLabel = '+';
  @Input() showAdd = true;
  @Input() role: UserRole = 'admin';
  @Input() columns: TableColumn[] = [];
  
  // Входные данные - сохраняем внутреннюю копию
  private _data: TableData[] = [];
  @Input() 
  set data(value: TableData[]) {
    console.log('📥 [Table] Входные данные получены:', value.length, 'строк');
    if (value.length > 0) {
      // Исправлено: убрано дублирование свойства id
      console.log('📥 [Table] Пример входных данных (первая строка):', value[0]);
      // Если нужно специально подчеркнуть ID:
      console.log('📥 [Table] ID первой строки:', value[0].id);
    }
    // Сохраняем копию для независимого редактирования
    this._data = this.createDeepCopy(value);
    console.log('📥 [Table] Внутренняя копия создана');
  }
  
  get data(): TableData[] {
    return this._data;
  }

  @Output() add = new EventEmitter<void>();
  @Output() dataChange = new EventEmitter<TableData[]>();
  @Output() rowDelete = new EventEmitter<TableData>();

  // состояние контекстного меню
  contextMenuVisible = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuRow: TableData | null = null;

  constructor(private readonly themeService: ThemeService) {}

  get theme() {
    return this.themeService.getTheme(this.role);
  }

  onAdd() {
    console.log('🔵 [Table] onAdd вызван');
    this.add.emit();
    console.log('🟢 [Table] add событие отправлено');
  }

  onSelectChange(row: TableData, col: TableColumn, value: any) {
    console.log('🔵 [Table] onSelectChange:', row.id, col.key, '=', value);
    this.updateRowData(row.id, col.key, value);
    this.emitData();
  }

  onInputChange(row: TableData, col: TableColumn, value: any) {
    console.log('🔵 [Table] onInputChange:', row.id, col.key, '=', value);
    
    const processedValue = col.type === 'number' 
      ? (value === '' ? null : Number(value))
      : value;
    
    this.updateRowData(row.id, col.key, processedValue);
    this.emitData();
  }

  onDateChange(row: TableData, col: TableColumn, value: string) {
    console.log('🔵 [Table] onDateChange:', row.id, col.key, '=', value);
    
    const processedValue = value ? new Date(value) : null;
    this.updateRowData(row.id, col.key, processedValue);
    this.emitData();
  }

  onFieldBlur(row: TableData, col: TableColumn) {
    console.log('🔵 [Table] onFieldBlur:', row.id, col.key, 'значение:', row[col.key]);
    this.emitData();
  }

  trackById(_: number, item: TableData) {
    return item.id ?? item;
  }

  formatDate(value: any, col: TableColumn): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (col.type === 'datetime') {
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  }

  // контекстное меню удаления
  onRowContextMenu(event: MouseEvent, row: TableData) {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuVisible = true;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuRow = row;
  }

  onDeleteRowClick() {
    if (this.contextMenuRow) {
      console.log('🗑️ [Table] Удаление строки с ID:', this.contextMenuRow.id);
      this.rowDelete.emit(this.contextMenuRow);
      this.contextMenuRow = null;
    }
    this.contextMenuVisible = false;
  }

  onContainerClick() {
    if (this.contextMenuVisible) {
      this.contextMenuVisible = false;
      this.contextMenuRow = null;
    }
  }

  // Приватные вспомогательные методы
  
  private updateRowData(rowId: string | number, field: string, value: any): void {
    const idString = String(rowId);
    const rowIndex = this._data.findIndex(item => String(item.id) === idString);
    
    if (rowIndex !== -1) {
      console.log('🔄 [Table] Обновление строки ID:', rowId, field, '=', value);
      console.log('🔄 [Table] Текущая строка до обновления:', this._data[rowIndex]);
      
      // Сохраняем оригинальный ID и другие поля
      const originalRow = this._data[rowIndex];
      const updatedRow = { 
        ...originalRow,  // Копируем все поля оригинальной строки
        [field]: value   // Обновляем только нужное поле
      };
      
      console.log('🔄 [Table] Обновленная строка:', updatedRow);
      
      // Обновляем массив иммутабельно
      this._data = [
        ...this._data.slice(0, rowIndex),
        updatedRow,
        ...this._data.slice(rowIndex + 1)
      ];
      
    } else {
      console.error('🔴 [Table] Строка не найдена ID:', rowId);
      console.error('🔴 [Table] Доступные ID:', this._data.map(d => d.id));
    }
  }

  private emitData() {
    console.log('📤 [Table] emitData вызван, строк:', this._data.length);
    
    // Проверяем ID перед эмитом
    if (this._data.length > 0) {
      console.log('📊 [Table] Проверка ID перед эмитом:');
      const invalidRows = this._data.filter(row => 
        !row.id || String(row.id) === '00000000-0000-0000-0000-000000000000'
      );
      
      if (invalidRows.length > 0) {
        console.error('🔴 [Table] Найдены строки с невалидными ID:', invalidRows.length);
        invalidRows.forEach((row, index) => {
          console.error(`  ${index + 1}. Невалидная строка:`, row);
        });
      } else {
        console.log('✅ [Table] Все ID валидны');
      }
      
      // Логируем первые 2 строки
      console.log('📊 [Table] Пример данных для эмита (первые 2 строки):');
      this._data.slice(0, 2).forEach((row, index) => {
        console.log(`  ${index + 1}.`, row);
      });
    }
    
    // Эмитим глубокую копию с проверкой ID
    const dataToEmit = this.createDeepCopyWithIdCheck(this._data);
    this.dataChange.emit(dataToEmit);
    
    console.log('📤 [Table] Данные эмитнуты родителю');
  }

  private createDeepCopy<T extends { id?: any }>(data: T[]): T[] {
    try {
      const copy = JSON.parse(JSON.stringify(data));
      console.log('✅ [Table] Глубокая копия создана, строк:', copy.length);
      
      // Проверяем копию
      if (copy.length > 0) {
        console.log('✅ [Table] Пример скопированной строки:', copy[0]);
      }
      
      return copy;
    } catch (error) {
      console.error('🔴 [Table] Ошибка создания глубокой копии:', error);
      // Fallback: поверхностная копия с сохранением ID
      return data.map(item => {
        const copy = { ...item };
        // Убедимся что ID сохранен
        if (item.id !== undefined) {
          copy.id = item.id;
        }
        return copy;
      });
    }
  }

  private createDeepCopyWithIdCheck<T extends { id?: any }>(data: T[]): T[] {
    const copy = this.createDeepCopy(data);
    
    // Проверяем ID в копии
    const invalidCopies: number[] = [];
    
    copy.forEach((item, index) => {
      const originalId = data[index]?.id;
      const copyId = item.id;
      
      if (!copyId || String(copyId) === '00000000-0000-0000-0000-000000000000') {
        invalidCopies.push(index);
        console.error(`🔴 [Table] Копия строки ${index} потеряла ID!`, {
          оригиналId: originalId,
          копияId: copyId,
          оригинал: data[index],
          копия: item
        });
        
        // Восстанавливаем ID из оригинала если возможно
        if (originalId) {
          copy[index] = { ...item, id: originalId };
          console.log(`🔄 [Table] Восстановлен ID для строки ${index}:`, originalId);
        }
      }
    });
    
    if (invalidCopies.length > 0) {
      console.error(`🔴 [Table] Всего строк с потерянными ID: ${invalidCopies.length}`);
    }
    
    return copy;
  }

  copyToClipboard(value: any, showNotification: boolean = false) {
    if (value === null || value === undefined) return;
    
    const text = String(value);
    navigator.clipboard.writeText(text).then(() => {
      console.log('🟢 [Table] Скопировано в буфер обмена:', text);
      if (showNotification) {
        console.log(`✅ ID скопирован: ${text}`);
      }
    }).catch(err => {
      console.error('🔴 [Table] Ошибка копирования:', err);
    });
  }
  
  // Метод для отладки
  debugCurrentData() {
    console.log('🔍 [Table] Текущие внутренние данные:');
    this._data.forEach((row, index) => {
      console.log(`  ${index + 1}. ID: ${row.id}`, row);
    });
  }
}