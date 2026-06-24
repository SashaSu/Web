import { UserRole } from './user-role';

export interface RoleTheme {
  primary: string;
  header: string;
  headerText?: string;
  logoutButton?: string;
  logoutButtonHover?: string;
}

export const ROLE_THEMES: Record<UserRole, RoleTheme> = {
  admin: { 
    primary: '#c62828', 
    header: '#970303', 
    headerText: '#ffffff',
    logoutButton: '#760303',
    logoutButtonHover: '#ce0101'
  },
  chef: { 
    primary: '#b55303', 
    header: '#b55303', 
    headerText: '#ffffff',
    logoutButton: '#763503',
    logoutButtonHover: '#ce6401'
  },
  waiter: { 
    primary: '#036eb5', 
    header: '#036eb5', 
    headerText: '#ffffff',
    logoutButton: '#045e85',
    logoutButtonHover: '#01a5ce'
  },
  manager: { 
    primary: '#008129', 
    header: '#008129', 
    headerText: '#ffffff',
    logoutButton: '#047336',
    logoutButtonHover: '#01ce12'
  },
};

