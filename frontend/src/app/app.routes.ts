import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PermissionsGuard } from './autenticacion/permissions.guard';
import { PerfilesComponent } from './perfiles/perfiles.component';
import { LandingComponent } from './landing/landing.component';

export const routes: Routes = [

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'perfiles', component: PerfilesComponent },
    { path: 'suscripciones', component: LandingComponent },

    { path: '**', redirectTo: 'login', pathMatch: 'full' },

];
