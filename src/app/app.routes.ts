import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { AdminLayout} from './admin/admin-layout/admin-layout';
import { ChefLayout} from './chef/chef-layout/chef-layout';
import { WaiterLayout} from './waiter/waiter-layout/waiter-layout';
import { ManagerLayout} from './manager/manager-layout/manager-layout';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    component: Login 
  },
  { 
    path: 'admin', 
    component: AdminLayout,
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  { 
    path: 'chef', 
    component: ChefLayout,
    canActivate: [authGuard, roleGuard],
    data: { role: 'chef' }
  },
  { 
    path: 'waiter', 
    component: WaiterLayout,
    canActivate: [authGuard, roleGuard],
    data: { role: 'waiter' }
  },
  { 
    path: 'manager', 
    component: ManagerLayout,
    canActivate: [authGuard, roleGuard],
    data: { role: 'manager' }
  },
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/login' 
  } 
];
