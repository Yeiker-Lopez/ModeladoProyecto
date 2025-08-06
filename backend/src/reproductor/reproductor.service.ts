import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContenidoDescargado } from 'src/_entitys/contenido-descargado.entity';
import { Contenido } from 'src/_entitys/contenido.entity';
import { HistorialReproduccion } from 'src/_entitys/historial-reproduccion.entity';
import { MetricaUso } from 'src/_entitys/metrica-uso.entity';
import { Perfil } from 'src/_entitys/perfil.entity';
import { PlaylistContenido } from 'src/_entitys/playlist-contenido.entity';
import { Playlist } from 'src/_entitys/playlist.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class ReproductorService {

    constructor(
        @InjectRepository(Contenido) private readonly contenidoRepo: Repository<Contenido>,
        @InjectRepository(Playlist) private readonly playlistRepo: Repository<Playlist>,
        @InjectRepository(ContenidoDescargado) private readonly descargaRepo: Repository<ContenidoDescargado>,
        @InjectRepository(HistorialReproduccion) private readonly historialRepo: Repository<HistorialReproduccion>,
        @InjectRepository(MetricaUso) private readonly metricaRepo: Repository<MetricaUso>,
        @InjectRepository(PlaylistContenido) private readonly playlistContenidoRepo: Repository<PlaylistContenido>,
        @InjectRepository(Perfil) private readonly perfilRepo: Repository<Perfil>,


    ) { }

    async obtenerVistaReproductor(contenidoId: number, playlistId?: number) {
        const contenido = await this.contenidoRepo.findOne({
            where: { id: contenidoId },
            relations: ['recomendacionesOrigen', 'recomendacionesOrigen.sugerido'],
        });

        if (!contenido) {
            throw new NotFoundException('Contenido no encontrado');
        }

        // Obtener recomendaciones
        const recomendaciones = contenido.recomendacionesOrigen.map(r => r.sugerido);

        let playlistNombre: string | null = null;
        let contenidosPlaylist: Contenido[] = [];

        if (playlistId) {
            const playlist = await this.playlistRepo.findOne({
                where: { id: playlistId },
                relations: ['contenidos', 'contenidos.contenido'],
            });

            if (playlist) {
                playlistNombre = playlist.nombre;
                contenidosPlaylist = playlist.contenidos
                    .sort((a, b) => a.orden - b.orden)
                    .map(pc => pc.contenido);
            }
        }

        return {
            contenido,
            recomendaciones,
            playlist: playlistId ? contenidosPlaylist : null,
            playlistNombre: playlistNombre,
        };
    }



    async registrarDescarga(perfilId: number, contenidoId: number) {
        const descarga = this.descargaRepo.create({
            perfil: { id: perfilId },
            contenido: { id: contenidoId },
        });
        return this.descargaRepo.save(descarga);
    }

    async registrarHistorial(perfilId: number, contenidoId: number, duracion: number) {
        const historial = this.historialRepo.create({
            perfil: { id: perfilId },
            contenido: { id: contenidoId },
            duracion,
        });
        return this.historialRepo.save(historial);
    }

    async registrarMetrica(perfilId: number, tipo: 'audio' | 'video', duracion: number) {
        const hoy = new Date();
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

        let metrica = await this.metricaRepo.findOne({
            where: {
                perfil: { id: perfilId },
                tipo,
                fecha,
            },
        });

        if (metrica) {
            metrica.tiempoReproduccion += duracion;
        } else {
            metrica = this.metricaRepo.create({
                perfil: { id: perfilId },
                tipo,
                fecha,
                tiempoReproduccion: duracion,
            });
        }

        return this.metricaRepo.save(metrica);
    }

    async estaDescargado(perfilId: number, contenidoId: number): Promise<boolean> {
        const registro = await this.descargaRepo.findOne({
            where: {
                perfil: { id: perfilId },
                contenido: { id: contenidoId },
            },
        });

        return !!registro; // true si existe, false si no
    }


    async obtenerContenidosDescargados(perfilId: number) {
        const registros = await this.descargaRepo.find({
            where: { perfil: { id: perfilId } },
            relations: ['contenido'],
            order: { fecha: 'DESC' }, // opcional: orden por fecha de descarga
        });

        return registros.map(r => r.contenido);
    }

    async obtenerContenidoPorId(id: number): Promise<Contenido | null> {
        return this.contenidoRepo.findOne({ where: { id } });
    }

    async listarPlaylists(perfilId: number): Promise<{ id: number; nombre: string; portada: string | null }[]> {
        const playlists = await this.playlistRepo
            .createQueryBuilder('playlist')
            .leftJoin(
                PlaylistContenido,
                'pc',
                'pc."playlistId" = playlist.id AND pc."orden" = (' +
                'SELECT MIN(pc2."orden") FROM "playlist_contenido" pc2 WHERE pc2."playlistId" = playlist.id' +
                ')'
            )
            .leftJoin(Contenido, 'contenido', 'contenido.id = pc."contenidoId"')
            .select([
                'playlist.id AS id',
                'playlist.nombre AS nombre',
                'contenido.portada AS portada',
            ])
            .where('playlist."perfilId" = :perfilId', { perfilId })
            .getRawMany();

        return playlists.map(p => ({
            id: p.id,
            nombre: p.nombre,
            portada: p.portada || null,
        }));
    }





    async agregarContenidoAPlaylist(playlistId: number, contenidoId: number) {
        const playlist = await this.playlistRepo.findOneOrFail({ where: { id: playlistId }, relations: ['contenidos'] });
        const contenido = await this.contenidoRepo.findOneOrFail({ where: { id: contenidoId } });

        // Verificamos los tipos de contenido actuales de la playlist
        const contenidosActuales = await this.playlistContenidoRepo.find({
            where: { playlist: { id: playlistId } },
            relations: ['contenido'],
        });

        const tiposActuales = new Set(contenidosActuales.map(pc => pc.contenido.tipo));
        tiposActuales.add(contenido.tipo); // Agregamos el nuevo tipo también

        let nuevoTipo: 'audio' | 'video' | 'mixta' = 'mixta';
        if (tiposActuales.size === 1) {
            nuevoTipo = contenido.tipo as 'audio' | 'video';
        }

        // Si el tipo cambia, actualizar la playlist
        if (playlist.tipo !== nuevoTipo) {
            playlist.tipo = nuevoTipo;
            await this.playlistRepo.save(playlist);
        }

        // Calcular el orden
        const maxOrden = await this.playlistContenidoRepo
            .createQueryBuilder('pc')
            .select('MAX(pc.orden)', 'max')
            .where('pc.playlistId = :playlistId', { playlistId })
            .getRawOne();

        const nuevo = this.playlistContenidoRepo.create({
            playlist,
            contenido,
            orden: (Number(maxOrden?.max) || 0) + 1,
        });

        return this.playlistContenidoRepo.save(nuevo);
    }
    async eliminarContenidoDePlaylist(playlistId: number, contenidoId: number): Promise<void> {
        // 1. Eliminar el contenido de la playlist
        await this.playlistContenidoRepo.delete({
            playlist: { id: playlistId },
            contenido: { id: contenidoId }
        });

        // 2. Obtener los contenidos restantes en la playlist
        const restantes = await this.playlistContenidoRepo.find({
            where: { playlist: { id: playlistId } },
            relations: ['contenido']
        });

        const playlist = await this.playlistRepo.findOneOrFail({ where: { id: playlistId } });

        // 3. Si ya no hay contenidos → eliminar la playlist
        if (restantes.length === 0) {
            await this.playlistRepo.remove(playlist);
            return;
        }

        // 4. Si hay contenidos → recalcular tipo
        const tipos = new Set(restantes.map(r => r.contenido.tipo));

        let nuevoTipo: 'audio' | 'video' | 'mixta';

        if (tipos.size === 1) {
            nuevoTipo = [...tipos][0] as 'audio' | 'video';
        } else {
            nuevoTipo = 'mixta';
        }

        // 5. Actualizar solo si cambia el tipo
        if (playlist.tipo !== nuevoTipo) {
            playlist.tipo = nuevoTipo;
            await this.playlistRepo.save(playlist);
        }
    }



    async crearPlaylist(nombre: string, contenidoId: number, perfilId: number) {
        const contenido = await this.contenidoRepo.findOneOrFail({ where: { id: contenidoId } });
        const perfil = await this.perfilRepo.findOneOrFail({ where: { id: perfilId } });

        const playlist = this.playlistRepo.create({
            nombre,
            tipo: contenido.tipo,
            perfil,
        });

        const nuevaPlaylist = await this.playlistRepo.save(playlist);

        const primero = this.playlistContenidoRepo.create({
            playlist: nuevaPlaylist,
            contenido,
            orden: 1,
        });

        await this.playlistContenidoRepo.save(primero);

        return nuevaPlaylist;
    }

}
