import { Component, Input, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { UserRole } from '../../models/user-role';
import { MenuItem } from '../../models/layout-config';
import { ROLE_THEMES } from '../../models/theme-colors';

@Component({
  selector: 'app-role-layout',
  imports: [CommonModule],
  templateUrl: './role-layout.component.html',
  styleUrl: './role-layout.component.scss',
})
export class RoleLayoutComponent implements OnInit {
  @Input() role!: UserRole;
  @Input() menuItems: MenuItem[] = [];
  @Input() defaultSection: string = '';
  @Output() sectionChange = new EventEmitter<string>();

  currentSection = signal<string>('');
  theme = signal(ROLE_THEMES.admin); // Default, will be updated in ngOnInit

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Use provided defaultSection or first menu item
    const initialSection = this.defaultSection || this.menuItems[0]?.key || '';
    this.currentSection.set(initialSection);
    this.theme.set(this.themeService.getTheme(this.role));
    // Only emit if defaultSection was provided (to avoid double emission)
    if (this.defaultSection) {
      this.sectionChange.emit(initialSection);
    }
  }

  showSection(section: string) {
    this.currentSection.set(section);
    this.sectionChange.emit(section);
  }

  logout() {
    this.router.navigate(['/login']);
    console.log('Выход из системы');
  }
}

