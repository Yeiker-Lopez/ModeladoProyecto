import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class LoginService {
    private apiURL = `${environment.apiUrl}/auth`;

    constructor(private http: HttpClient, private router: Router) { }

    login(correo: string, clave: string): Observable<any> {
        return this.http.post(`${this.apiURL}/login`, { correo, clave });
    }

    refreshToken(userId: number, refreshToken: string): Observable<any> {
        return this.http.post(`${this.apiURL}/refresh/${userId}`, { refreshToken });
    }

    logout(usuarioId: number): Observable<any> {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return this.http.post(`${this.apiURL}/logout/${usuarioId}`, {});
    }

    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    saveTokens(accessToken: string, refreshToken: string) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    isLoggedIn(): boolean {
        return !!this.getAccessToken();
    }

    getUserId(): number | null {
        const token = this.getAccessToken();
        if (!token) return null;

        try {
            const decoded: any = jwtDecode(token);
            return decoded.sub;
        } catch (error) {
            console.error('Error al decodificar el token', error);
            return null;
        }
    }
}
