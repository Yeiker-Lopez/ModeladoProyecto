import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { LoginService } from '../services/login.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionsGuard implements CanActivate {
    constructor(private loginService: LoginService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const token = this.loginService.getAccessToken();
        const refreshToken = this.loginService.getRefreshToken();

        // Si es login y no hay token, deja pasar
        if (route.routeConfig?.path === 'login') {
            if (!token && !refreshToken) {
                return true;
            }
            if (!token) {
                this.router.navigate(['/login']);
                return false;
            }
            try {
                const decodedToken: any = jwtDecode(token);
                const tipoUsuario = decodedToken?.tipo_usuario?.id;

                if (tipoUsuario === 2) { // Administrador
                    this.router.navigate(['/perfiles']);
                } else if (tipoUsuario === 1) { // Estudiante
                    this.router.navigate(['/administrador']);
                }
                return false;
            } catch (err) {
                console.error('Token inválido en login:', err);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return true; // deja pasar al login
            }
        }

        // Si intenta entrar a otra ruta pero no hay token, lo redirige
        if (!token) {
            this.router.navigate(['/login']);
            return false;
        }

        try {
            jwtDecode(token); // validación mínima
            return true;
        } catch (err) {
            console.error('Token inválido en ruta protegida:', err);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            this.router.navigate(['/login']);
            return false;
        }
    }

}


