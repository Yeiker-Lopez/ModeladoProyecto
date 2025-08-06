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
export class PerfilService {
    private apiURL = `${environment.apiUrl}/perfiles`;

    constructor(private http: HttpClient, private router: Router) { }

    obtenerPerfilesPorUsuario(usuarioId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiURL}/${usuarioId}/usuario`);
    }

    validarPin(perfilId: number, pin: string): Observable<any> {
        return this.http.post(`${this.apiURL}/validar-pin`, {
            perfilId,
            pin
        });
    }

    getContenidoPorTipo(tipo: 'audio' | 'video') {
        return this.http.get<any[]>(`${this.apiURL}/por-tipo/${tipo}`);
    }

    actualizarPin(perfilId: number, nuevoPin: string) {
        return this.http.patch(`${this.apiURL}/${perfilId}/actualizar-pin`, { nuevoPin });
    }

    getPlaylistsPorPerfil(perfilId: number) {
        return this.http.get<any[]>(`${this.apiURL}/playlist/${perfilId}`);
    }

    getDashboardAnalitico(perfilId: number) {
        return this.http.get<any>(`${this.apiURL}/dashboard/${perfilId}`);
    }

    getRecomendacionesDesdePlaylists(perfilId: number) {
        return this.http.get<any[]>(`${this.apiURL}/recomendaciones/${perfilId}`);
    }

    getContenidosDescargados(perfilId: number) {
        return this.http.get<any[]>(`${this.apiURL}/contenido/descargados/${perfilId}`);
    }


}
