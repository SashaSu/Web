export interface TableColumn {
  key: string;
  title: string;
  width?: string;
  minWidth?: string;
  sortable?: boolean;
  editable?: boolean;
  type?: 'text' | 'number' | 'date' | 'datetime' | 'select';
  align?: 'left' | 'center' | 'right';
  options?: Array<{ value: any; label: string }>;
}

export interface TableData {
  id: string | number;
  [key: string]: any;
}

export interface TableConfig {
  columns: TableColumn[];
  showHeader?: boolean;
  showActions?: boolean;
  rowClickable?: boolean;
  striped?: boolean;
  bordered?: boolean;
}

