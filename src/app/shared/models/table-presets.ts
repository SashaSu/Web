import { TableColumn } from './table-config';

export const ORDER_STATUS_OPTIONS = [
  { value: 'new', label: 'Новый' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'ready', label: 'Готов' },
  { value: 'completed', label: 'Завершен' },
  { value: 'cancelled', label: 'Отменен' },
];

export const ORDER_COLUMNS: TableColumn[] = [
  { key: 'id', title: 'ID', minWidth: '200px', editable: false },
  { key: 'time', title: 'Время', type: 'datetime', minWidth: '180px' },
  { key: 'status', title: 'Статус', type: 'select', options: ORDER_STATUS_OPTIONS },
];

export const DISH_COLUMNS: TableColumn[] = [
  { key: 'id', title: 'ID', minWidth: '140px', editable: false },
  { key: 'name', title: 'Блюдо', minWidth: '160px' },
  { key: 'price', title: 'Цена', type: 'number', minWidth: '160px' },
  { key: 'calories', title: 'Калории', type: 'number', minWidth: '160px' },
];

export const PRODUCT_COLUMNS: TableColumn[] = [
  { key: 'id', title: 'ID', minWidth: '150px', editable: false },
  { key: 'name', title: 'Название', minWidth: '150px' },
  { key: 'quantity', title: 'Количество', type: 'number', minWidth: '100px', align: 'center' },
  { key: 'expDate', title: 'Срок годности', type: 'date', minWidth: '120px' },
];

