import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../shared/components/table/table.component';
import { TableColumn, TableData } from '../../shared/models/table-config';

interface Audit {
  id: string;
  name: string;
  quantity: number;
  expDate: Date;
  deleteDate: Date;
}


@Component({
  selector: 'app-audits',
  imports: [CommonModule, TableComponent],
  templateUrl: './audits.html',
  styleUrl: './audits.scss',
})
export class Audits {
  columns: TableColumn[] = [
    { key: 'id', title: 'ID', minWidth: '150px' },
    { key: 'name', title: 'Название', minWidth: '150px' },
    { key: 'quantity', title: 'Количество', type: 'number', align: 'center', minWidth: '100px' },
    { key: 'expDate', title: 'Срок годности', type: 'date', minWidth: '120px' },
    { key: 'deleteDate', title: 'Дата удаления', type: 'date', minWidth: '120px' },
  ];

  audits: Audit[] = [
    {
      id: 'f1a2b3c4-d5e6-7890-fabc-de1234567890',
      name: 'Молоко',
      quantity: 50,
      expDate: new Date('2024-02-01'),
      deleteDate: new Date('2024-01-15')
    },
    {
      id: 'g2h3i4j5-k6l7-8901-ghij-ef2345678901',
      name: 'Хлеб',
      quantity: 100,
      expDate: new Date('2024-01-20'),
      deleteDate: new Date('2024-01-16')
    },
    {
      id: 'h3i4j5k6-l7m8-9012-hijk-fg3456789012',
      name: 'Сыр',
      quantity: 30,
      expDate: new Date('2024-02-15'),
      deleteDate: new Date('2024-01-14')
    },
    {
      id: 'i4j5k6l7-m8n9-0123-ijkl-gh4567890123',
      name: 'Помидоры',
      quantity: 80,
      expDate: new Date('2024-01-25'),
      deleteDate: new Date('2024-01-13')
    }
  ];

  addAudit() {
    const newAudit: Audit = {
      id: this.generateGuid(),
      name: 'Новая запись',
      quantity: 0,
      expDate: new Date(),
      deleteDate: new Date(),
    };
    this.audits.push(newAudit);
  }

  onDataChange(data: TableData[]) {
    this.audits = data as Audit[];
  }

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
