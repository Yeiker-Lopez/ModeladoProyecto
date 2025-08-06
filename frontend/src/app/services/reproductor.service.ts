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
export class ReproductorService {
    private apiURL = `${environment.apiUrl}/reproductor`;

    constructor(private http: HttpClient, private router: Router) { }

    getVistaReproductor(id: number, playlistId?: number) {
        const params = playlistId ? `?playlist=${playlistId}` : '';
        return this.http.get(`${this.apiURL}/reproducir/${id}${params}`);
    }


    verificarDescarga(perfilId: number, contenidoId: number) {
        return this.http.get<boolean>(`${this.apiURL}/descargado`, {
            params: { perfilId, contenidoId }
        });
    }
    obtenerDescargasPorPerfil(perfilId: number) {
        return this.http.get<any[]>(`${this.apiURL}/descargados/${perfilId}`);
    }
    registrarMetrica(perfilId: number, tipo: 'audio' | 'video', duracion: number) {
        return this.http.post(`${this.apiURL}/metrica`, {
            perfilId,
            tipo,
            duracion
        });
    }
    registrarHistorial(perfilId: number, contenidoId: number, duracion: number) {
        return this.http.post(`${this.apiURL}/historial`, {
            perfilId,
            contenidoId,
            duracion
        });
    }
    registrarDescarga(perfilId: number, contenidoId: number) {
        return this.http.post(`${this.apiURL}/descargar`, {
            perfilId,
            contenidoId
        });
    }

    descargarArchivo(id: number): void {
        const url = `${this.apiURL}/descargar-archivo/${id}`;

        const a = document.createElement('a');
        a.href = url;
        a.download = '';
        a.target = '_blank';
        a.click();
    }

    getPlaylists(perfilId: number): Observable<{ id: number; nombre: string; portada: string | null }[]> {
        return this.http.get<{ id: number; nombre: string; portada: string | null }[]>(
            `${this.apiURL}/playlists/ver/${perfilId}`
        );
    }


    // 2. Agregar contenido a una playlist existente
    agregarAPlaylist(playlistId: number, contenidoId: number): Observable<any> {
        return this.http.post(`${this.apiURL}/playlists/agregar`, {
            playlistId,
            contenidoId
        });
    }
    eliminarDePlaylist(playlistId: number, contenidoId: number): Observable<void> {
        return this.http.request<void>('delete', `${this.apiURL}/playlists/eliminar`, {
            body: { playlistId, contenidoId }
        });
    }

    // 3. Crear nueva playlist con contenido inicial
    crearPlaylist(nombre: string, contenidoId: number, perfilId: number): Observable<any> {
        return this.http.post(`${this.apiURL}/playlists/crear`, {
            nombre,
            contenidoId,
            perfilId
        });
    }

}
