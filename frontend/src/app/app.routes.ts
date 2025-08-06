import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PermissionsGuard } from './autenticacion/permissions.guard';
import { PerfilesComponent } from './perfiles/perfiles.component';
import { LandingComponent } from './landing/landing.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { ReproductorComponent } from './reproductor/reproductor.component';

export const routes: Routes = [

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'perfiles', component: PerfilesComponent },
    { path: 'suscripciones', component: LandingComponent },
    { path: 'home', component: HomeComponent },
    { path: 'reproductor/:id/:slug', component: ReproductorComponent },
    { path: '**', redirectTo: 'login', pathMatch: 'full' },

];
