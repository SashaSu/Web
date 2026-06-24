import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../shared/components/table/table.component';
import { TableColumn, TableData } from '../../shared/models/table-config';

interface Employee {
  id: string;
  name: string;
  profession: string;
  salary: number;
}

@Component({
  selector: 'app-employees',
  imports: [CommonModule, TableComponent],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class Employees {
  columns: TableColumn[] = [
    { key: 'id', title: 'ID', minWidth: '150px' },
    { key: 'name', title: 'Имя', minWidth: '150px' },
    { key: 'profession', title: 'Профессия', minWidth: '150px' },
    { key: 'salary', title: 'Зарплата', type: 'number', minWidth: '120px' },
  ];

  employees: Employee[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Иван Петров',
      profession: 'Официант',
      salary: 35000
    },
    {
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      name: 'Мария Сидорова',
      profession: 'Повар',
      salary: 50000
    },
    {
      id: 'e4d909c2-90d0-11eb-8dcd-0242ac120003',
      name: 'Алексей Козлов',
      profession: 'Менеджер',
      salary: 45000
    }
  ];

  addEmployee() {
    const newEmployee: Employee = {
      id: this.generateGuid(),
      name: 'Новый сотрудник',
      profession: 'Должность',
      salary: 30000
    };
    this.employees.push(newEmployee);
  }

  onDataChange(data: TableData[]) {
    this.employees = data as Employee[];
    this.saveChanges();
  }

  saveChanges() {
    console.log('Изменения сохранены:', this.employees);
  }

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
