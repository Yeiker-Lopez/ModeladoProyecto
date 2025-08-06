import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PerfilService } from '../services/perfiles.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReproductorService } from '../services/reproductor.service';

@Component({
  selector: 'app-reproductor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reproductor.component.html',
  styleUrl: './reproductor.component.css'
})
export class ReproductorComponent {
  mostrarOverlayPin = false;
  pinActual: string[] = ['', '', '', ''];
  pinNuevo: string[] = ['', '', '', ''];
  pinValidado = false;
  cargandoPin = false;
  cargandoGuardar = false;
  perfilNombre: string = '';
  mensajePin: string = '';
  esErrorPin: boolean = false;
  contenidoId!: number;
  playlistId: number | null = null;
  slug: string = '';
  contenido: any = null;
  recomendaciones: any[] = [];
  playlist: any[] = [];
  duracion: number = 0;
  esDescargado: boolean = false;
  reproduciendoDesde: number = 0;
  playlistss: any[] = [];
  mostrarOverlayPlaylist = false;
  mostrarOverlayCrearPlaylist = false;
  nombreNuevaPlaylist: string = '';

  constructor(private perfilesService: PerfilService, private router: Router, private route: ActivatedRoute, private reproductorService: ReproductorService
  ) { }

  ngOnInit(): void {
    this.cargarPerfil();
    this.route.paramMap.subscribe(params => {
      this.contenidoId = Number(params.get('id'));
      this.modoOffline = this.route.snapshot.queryParamMap.get('offline') === 'true';

      this.obtenerPlaylistIdDesdeQuery();
      this.cargarDatosDelReproductor();
    });
    this.obtenerContenidoIdDesdeRuta();
  }
  abrirOverlayPlaylist(): void {
    const perfilId = JSON.parse(localStorage.getItem('perfilActivo') || '{}')?.perfilId;
    if (!perfilId) return;

    this.reproductorService.getPlaylists(perfilId).subscribe({
      next: (res) => {
        this.playlistss = res;
        this.mostrarOverlayPlaylist = true;
      },
      error: err => console.error('Error al obtener playlists', err)
    });
  }

  cargandoCrearPlaylist = false;
  mensajePlaylist = '';

  cerrarOverlayPlaylist(): void {
    this.mostrarOverlayPlaylist = false;
  }

  abrirOverlayCrearPlaylist(): void {
    this.mostrarOverlayPlaylist = false;
    this.mostrarOverlayCrearPlaylist = true;
  }

  cerrarOverlayCrearPlaylist(): void {
    this.mostrarOverlayCrearPlaylist = false;
    this.nombreNuevaPlaylist = '';
  }
  cargandoPlaylistId: number | null = null;
  mensajeAgregar: string = '';

  agregarAPlaylistExistente(playlistId: number): void {
    this.cargandoPlaylistId = playlistId;
    this.mensajeAgregar = '';

    this.reproductorService.agregarAPlaylist(playlistId, this.contenido.id).subscribe({
      next: () => {
        this.mensajeAgregar = 'Contenido añadido con éxito';
        setTimeout(() => {
          this.mostrarOverlayPlaylist = false;
          this.cargandoPlaylistId = null;
          this.mensajeAgregar = '';
        }, 1000);
      },
      error: err => {
        console.error('Error al agregar a playlist', err);
        this.cargandoPlaylistId = null;
      }
    });
  }
  eliminarDePlaylistActual(contenidoId: number, event: MouseEvent): void {
    event.stopPropagation(); // Evita que se dispare irAContenido

    if (!this.playlistId) return;

    this.reproductorService.eliminarDePlaylist(this.playlistId, contenidoId).subscribe({
      next: () => {
        this.playlist = this.playlist.filter(p => p.id !== contenidoId);
      },
      error: err => console.error('Error al eliminar de la playlist', err)
    });
  }


  crearNuevaPlaylist(): void {
    const perfilId = JSON.parse(localStorage.getItem('perfilActivo') || '{}')?.perfilId;
    if (!this.nombreNuevaPlaylist.trim() || !perfilId) return;

    this.cargandoCrearPlaylist = true;
    this.reproductorService.crearPlaylist(this.nombreNuevaPlaylist.trim(), this.contenido.id, perfilId).subscribe({
      next: () => {
        this.mensajePlaylist = 'Playlist creada con éxito';
        setTimeout(() => {
          this.mostrarOverlayCrearPlaylist = false;
          this.nombreNuevaPlaylist = '';
          this.mensajePlaylist = '';
          this.cargandoCrearPlaylist = false;
        }, 1000);
      },
      error: err => {
        console.error('Error al crear playlist', err);
        this.cargandoCrearPlaylist = false;
      }
    });
  }


  cargarDescargados(): void {
    const perfilId = JSON.parse(localStorage.getItem('perfilActivo') || '{}')?.perfilId;
    this.perfilesService.getContenidosDescargados(perfilId).subscribe({
      next: res => this.contenidosDescargados = res,
      error: err => console.error('Error cargando contenido offline', err)
    });
  }
  cargarPerfil(): void {
    const perfil = JSON.parse(localStorage.getItem('perfilActivo') || '{}');
    this.perfilNombre = perfil?.nombre || 'Perfil';
  }

  obtenerContenidoIdDesdeRuta(): void {
    this.route.paramMap.subscribe(params => {
      this.contenidoId = Number(params.get('id'));
    });
  }

  obtenerPlaylistIdDesdeQuery(): void {
    this.route.queryParamMap.subscribe(query => {
      this.playlistId = query.get('playlist') ? Number(query.get('playlist')) : null;
    });
  }
  playlistNombre: string = '';
  cargarDatosDelReproductor(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      const playlistId = this.route.snapshot.queryParams['playlist'];

      this.reproductorService.getVistaReproductor(id, playlistId).subscribe({
        next: (res: any) => {
          this.contenido = res.contenido;
          this.recomendaciones = res.recomendaciones;
          this.playlist = res.playlist;
          this.playlistNombre = res.playlistNombre;
          const perfil = JSON.parse(localStorage.getItem('perfilActivo') || '{}');
          if (perfil?.perfilId && this.contenido?.id) {
            this.reproductorService.verificarDescarga(perfil.perfilId, this.contenido.id).subscribe({
              next: (res: boolean) => {
                this.esDescargado = res;
              }
            });
          }
          if (this.modoOffline) {
            this.cargarDescargados();
          }

        }
      });
    });
  }
  modoOffline: boolean = false;
  contenidosDescargados: any[] = [];

  descargarContenido(): void {
    const perfilId = JSON.parse(localStorage.getItem('perfilActivo') || '{}')?.perfilId;

    // 1. Descargar desde backend
    this.reproductorService.descargarArchivo(this.contenido.id);

    // 2. Registrar la descarga en la base de datos
    this.reproductorService.registrarDescarga(perfilId, this.contenido.id).subscribe({
      next: () => {
        this.esDescargado = true;
      }
    });
  }

  onMediaPlay(): void {
    this.reproduciendoDesde = Date.now(); // Tiempo inicial
  }

  onMediaEnded(): void {
    const perfilId = JSON.parse(localStorage.getItem('perfilActivo') || '{}')?.perfilId;
    const duracion = Math.floor((Date.now() - this.reproduciendoDesde) / 1000); // segundos

    if (!perfilId || !this.contenido?.id) return;

    // Registrar historial
    this.reproductorService.registrarHistorial(perfilId, this.contenido.id, duracion).subscribe();

    // Registrar métrica
    this.reproductorService.registrarMetrica(perfilId, this.contenido.tipo, duracion).subscribe();
  }
  irHome(): void {
    this.router.navigate(['/home'], {
      queryParams: this.modoOffline ? { offline: 'true' } : {}
    });
  }

  irAContenido(id: number, titulo: string, desdePlaylist: boolean = false): void {
    const slug = titulo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    const queryParams: any = {};

    if (desdePlaylist && this.playlistId) {
      queryParams.playlist = this.playlistId;
    }
    if (this.modoOffline) {
      queryParams.offline = 'true';
    }


    // Primero navegamos a una ruta temporal (sin cambiar la URL)
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      // Luego redirigimos al reproductor con ID y slug
      this.router.navigate([`/reproductor`, id, slug], { queryParams });
    });
  }


  esAudio(): boolean {
    return this.contenido?.tipo === 'audio';
  }

  esVideo(): boolean {
    return this.contenido?.tipo === 'video';
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
