import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PerfilService } from '../services/perfiles.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  mostrarAudio = true;
  mostrarVideo = true;
  constructor(private perfilesService: PerfilService, private router: Router, private route: ActivatedRoute,) { }

  recomendaciones: any[] = [];
  playlists: any[] = [];

  audios: any[] = [];
  videos: any[] = [];
  mostrarOverlayPin = false;
  pinActual: string[] = ['', '', '', ''];
  pinNuevo: string[] = ['', '', '', ''];
  pinValidado = false;
  cargandoPin = false;
  cargandoGuardar = false;
  perfilNombre: string = '';
  mensajePin: string = '';
  esErrorPin: boolean = false;
  dashboard: any = null;
  playlistSeleccionada: any = null;
  mostrarOverlayPlaylist: boolean = false;

  ngOnInit(): void {
    const perfil = JSON.parse(localStorage.getItem('perfilActivo') || '{}');
    const tipoSuscripcion = perfil?.suscripcion?.tipo;

    this.perfilNombre = perfil?.nombre || 'Perfil';

    if (tipoSuscripcion?.permiteAudio) {
      this.perfilesService.getContenidoPorTipo('audio').subscribe({
        next: res => this.audios = res,
        error: err => console.error('Error cargando audios', err)
      });
    }

    if (tipoSuscripcion?.permiteVideo) {
      this.perfilesService.getContenidoPorTipo('video').subscribe({
        next: res => this.videos = res,
        error: err => console.error('Error cargando videos', err)
      });
    }
    const perfilId = perfil?.perfilId;


    this.perfilesService.getDashboardAnalitico(perfilId).subscribe({
      next: res => this.dashboard = res,
      error: err => console.error('Error cargando dashboard', err)
    });


    // Cargar recomendaciones desde playlists
    this.perfilesService.getRecomendacionesDesdePlaylists(perfilId).subscribe({
      next: res => this.recomendaciones = res,
      error: err => console.error('Error cargando recomendaciones', err)
    });

    // Cargar playlists del perfil (con portada del orden 1)
    this.perfilesService.getPlaylistsPorPerfil(perfilId).subscribe({
      next: res => this.playlists = res,
      error: err => console.error('Error cargando playlists', err)
    });

    this.route.paramMap.subscribe(params => {
      this.modoOffline = this.route.snapshot.queryParamMap.get('offline') === 'true';
      this.toggleModoOffline();
    });
  }
  modoOffline: boolean = false;
  contenidosDescargados: any[] = [];

  toggleModoOffline(): void {
    if (this.modoOffline) {
      const perfilId = JSON.parse(localStorage.getItem('perfilActivo') || '{}')?.perfilId;

      this.perfilesService.getContenidosDescargados(perfilId).subscribe({
        next: res => this.contenidosDescargados = res,
        error: err => console.error('Error obteniendo contenido offline', err)
      });
    }
  }

  setModoOffline(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.modoOffline = input.checked;
    this.toggleModoOffline();
  }


  convertirTiempo(segundos: number): string {
    if (!segundos) return '0h 0m';
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    return `${h}h ${m}m`;
  }
  abrirOverlayPlaylist(playlist: any): void {
    this.playlistSeleccionada = playlist;
    this.mostrarOverlayPlaylist = true;
  }

  cerrarOverlayPlaylist(): void {
    this.mostrarOverlayPlaylist = false;
    this.playlistSeleccionada = null;
  }
  reproducirContenidoDesdePlaylist(contenido: any, playlistId: number): void {
    const slug = contenido.titulo.toLowerCase().replace(/\s+/g, '-');
    this.router.navigate(['/reproductor', contenido.id, slug], {
      queryParams: { playlist: playlistId }
    });
  }
  reproducirContenido(contenido: any): void {
    const slug = contenido.titulo.toLowerCase().replace(/\s+/g, '-');
    this.router.navigate(['/reproductor', contenido.id, slug], {
      queryParams: this.modoOffline ? { offline: 'true' } : {}
    });

  }

  cambiarPin(): void {
    this.mostrarOverlayPin = true;
    this.pinActual = ['', '', '', ''];
    this.pinNuevo = ['', '', '', ''];
    this.pinValidado = false;
    this.cargandoPin = false;
    this.cargandoGuardar = false;
  }


  cerrarOverlay(): void {
    this.mostrarOverlayPin = false;
    this.cargandoPin = false;
    this.cargandoGuardar = false;
    this.mensajePin = '';
  }
  handleInput(array: string[], index: number, event: any) {
    const input = event.target;
    const value = input.value;

    if (/^\d$/.test(value)) {
      array[index] = value;
      if (index < 3) {
        const nextInput = input.parentElement.querySelectorAll('input')[index + 1];
        nextInput.focus();
      }
    } else {
      array[index] = '';
    }
  }

  validarPin(): void {
    const pin = this.pinActual.join('');
    if (pin.length !== 4) {
      this.mensajePin = 'PIN incompleto';
      this.esErrorPin = true;
      return;
    }

    this.cargandoPin = true;
    this.mensajePin = '';
    this.esErrorPin = false;

    const perfilId = JSON.parse(localStorage.getItem('perfilActivo') || '{}')?.perfilId;

    this.perfilesService.validarPin(perfilId, pin).subscribe({
      next: () => {
        this.pinValidado = true;
        this.cargandoPin = false;
        this.mensajePin = 'PIN validado';
        this.esErrorPin = false;
      },
      error: () => {
        this.mensajePin = 'PIN incorrecto';
        this.esErrorPin = true;
        this.cargandoPin = false;
      }
    });
  }


  guardarPin(): void {
    const nuevoPin = this.pinNuevo.join('');
    if (nuevoPin.length !== 4) {
      this.mensajePin = 'PIN incompleto';
      this.esErrorPin = true;
      return;
    }

    this.cargandoGuardar = true;
    this.mensajePin = '';
    this.esErrorPin = false;

    const perfilId = JSON.parse(localStorage.getItem('perfilActivo') || '{}')?.perfilId;

    this.perfilesService.actualizarPin(perfilId, nuevoPin).subscribe({
      next: () => {
        this.mensajePin = 'PIN actualizado correctamente';
        this.esErrorPin = false;
        setTimeout(() => this.cerrarOverlay(), 1500); // se mantiene un momento visible
      },
      error: () => {
        this.mensajePin = 'Error al actualizar PIN';
        this.esErrorPin = true;
        this.cargandoGuardar = false;
      }
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  volverAPerfiles(): void {
    localStorage.removeItem('perfilActivo');
    this.router.navigate(['/perfiles']);
  }

}

