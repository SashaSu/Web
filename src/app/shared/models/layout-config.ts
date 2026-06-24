export interface MenuItem {
  key: string;
  label: string;
}

export interface LayoutConfig {
  role: string;
  menuItems: MenuItem[];
  defaultSection: string;
}

