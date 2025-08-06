import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContenidoDescargado } from 'src/_entitys/contenido-descargado.entity';
import { Contenido } from 'src/_entitys/contenido.entity';
import { HistorialReproduccion } from 'src/_entitys/historial-reproduccion.entity';
import { MetricaUso } from 'src/_entitys/metrica-uso.entity';
import { Perfil } from 'src/_entitys/perfil.entity';
import { Playlist } from 'src/_entitys/playlist.entity';
import { Recomendacion } from 'src/_entitys/recomendacion.entity';
import { Usuario } from 'src/_entitys/usuario.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class PerfilesService {

    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
        @InjectRepository(Perfil) private readonly perfilRepo: Repository<Perfil>,
        @InjectRepository(Contenido) private readonly contenidoRepo: Repository<Contenido>,
        @InjectRepository(Recomendacion) private readonly recomendacionRepo: Repository<Recomendacion>,
        @InjectRepository(MetricaUso) private readonly metricaRepo: Repository<MetricaUso>,
        @InjectRepository(Playlist) private readonly playlistRepo: Repository<Playlist>,
        @InjectRepository(ContenidoDescargado) private readonly descargaRepo: Repository<ContenidoDescargado>,
        @InjectRepository(HistorialReproduccion) private readonly historialRepo: Repository<HistorialReproduccion>,

    ) { }

    async obtenerPerfilesPorUsuario(usuarioId: number) {
        const usuario = await this.usuarioRepo.findOne({
            where: { id: usuarioId },
            relations: ['perfiles'],
        });

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return usuario.perfiles;
    }

    async validarPin(perfilId: number, pin: string) {
        const perfil = await this.perfilRepo.findOne({
            where: { id: perfilId },
            relations: ['usuario', 'usuario.suscripciones', 'usuario.suscripciones.tipoSuscripcion']
        });

        if (!perfil) {
            throw new NotFoundException('Perfil no encontrado');
        }

        if (perfil.pin !== pin) {
            throw new UnauthorizedException('PIN incorrecto');
        }

        // Buscar suscripción activa
        const suscripcionActiva = perfil.usuario.suscripciones.find(s => s.activa);

        return {
            perfilId: perfil.id,
            nombre: perfil.nombre,
            usuarioId: perfil.usuario.id,
            preferencias: perfil.preferencias,
            suscripcion: suscripcionActiva
                ? {
                    id: suscripcionActiva.id,
                    fechaInicio: suscripcionActiva.fechaInicio,
                    fechaFin: suscripcionActiva.fechaFin,
                    activa: suscripcionActiva.activa,
                    tipo: suscripcionActiva.tipoSuscripcion
                        ? {
                            id: suscripcionActiva.tipoSuscripcion.id,
                            nombre: suscripcionActiva.tipoSuscripcion.nombre,
                            permiteAudio: suscripcionActiva.tipoSuscripcion.permiteAudio,
                            permiteVideo: suscripcionActiva.tipoSuscripcion.permiteVideo
                        }
                        : null
                }
                : null
        };
    }

    async obtenerPorTipo(tipo: string): Promise<Contenido[]> {
        return this.contenidoRepo.find({
            where: { tipo: tipo as 'audio' | 'video' },
            order: { fechaRegistro: 'DESC' },
        });

    }

    async validarPinPerfil(perfilId: number, pin: string): Promise<boolean> {
        const perfil = await this.perfilRepo.findOne({ where: { id: perfilId } });

        if (!perfil) {
            throw new NotFoundException('Perfil no encontrado');
        }

        if (perfil.pin !== pin) {
            throw new UnauthorizedException('PIN incorrecto');
        }

        return true;
    }

    async actualizarPinPerfil(perfilId: number, nuevoPin: string): Promise<Perfil> {
        const perfil = await this.perfilRepo.findOne({ where: { id: perfilId } });

        if (!perfil) {
            throw new NotFoundException('Perfil no encontrado');
        }

        perfil.pin = nuevoPin;

        return this.perfilRepo.save(perfil);
    }

    async obtenerDashboardAnalitico(perfilId: number) {
        const [metricas, total, historial] = await Promise.all([
            this.metricaRepo.find({
                where: { perfil: { id: perfilId } },
            }),
            this.metricaRepo
                .createQueryBuilder('metrica')
                .select('SUM(metrica.tiempoReproduccion)', 'total')
                .where('metrica.perfilId = :perfilId', { perfilId })
                .getRawOne(),
            this.historialRepo.find({
                where: { perfil: { id: perfilId } },
                relations: ['contenido'],
            }),
        ]);

        const totalAudio = metricas.filter(m => m.tipo === 'audio').length;
        const totalVideo = metricas.filter(m => m.tipo === 'video').length;

        const hoy = new Date();
        const hace7 = new Date();
        hace7.setDate(hoy.getDate() - 7);

        const hace14 = new Date();
        hace14.setDate(hoy.getDate() - 14);

        const ultimaSemana = metricas.filter(m => new Date(m.fecha) >= hace7);
        const semanaAnterior = metricas.filter(m =>
            new Date(m.fecha) >= hace14 && new Date(m.fecha) < hace7
        );

        const incremento = semanaAnterior.length
            ? (((ultimaSemana.length - semanaAnterior.length) / semanaAnterior.length) * 100).toFixed(1)
            : '100';

        // Agrupar historial por contenido
        const duracionPorContenido: Record<number, { titulo: string; tipo: 'audio' | 'video'; duracion: number }> = {};

        for (const item of historial) {
            const id = item.contenido.id;
            if (!duracionPorContenido[id]) {
                duracionPorContenido[id] = {
                    titulo: item.contenido.titulo,
                    tipo: item.contenido.tipo,
                    duracion: 0,
                };
            }
            duracionPorContenido[id].duracion += item.duracion;
        }

        // Encontrar audio y video más reproducidos
        const contenidos = Object.values(duracionPorContenido);

        const audioTop = contenidos
            .filter(c => c.tipo === 'audio')
            .sort((a, b) => b.duracion - a.duracion)[0];

        const videoTop = contenidos
            .filter(c => c.tipo === 'video')
            .sort((a, b) => b.duracion - a.duracion)[0];

        return {
            totalAudio,
            totalVideo,
            tiempoTotal: Number(total.total || 0),
            incrementoSemanal: `${incremento}%`,
            audioMasReproducido: audioTop
                ? { titulo: audioTop.titulo, duracion: audioTop.duracion }
                : null,
            videoMasReproducido: videoTop
                ? { titulo: videoTop.titulo, duracion: videoTop.duracion }
                : null,
        };
    }


    async obtenerRecomendacionesDesdePlaylists(perfilId: number) {
        const playlists = await this.playlistRepo.find({
            where: { perfil: { id: perfilId } },
            relations: ['contenidos', 'contenidos.contenido'],
        });

        const contenidoIds = playlists.flatMap(pl =>
            pl.contenidos.map(pc => pc.contenido.id)
        );

        if (contenidoIds.length === 0) return [];

        const recomendados = await this.recomendacionRepo
            .createQueryBuilder('reco')
            .leftJoinAndSelect('reco.sugerido', 'contenido')
            .where('reco.origenId IN (:...ids)', { ids: contenidoIds })
            .getMany();

        // Usamos un Map para eliminar duplicados por contenido.id
        const contenidosUnicos = new Map<number, any>();

        for (const r of recomendados) {
            const c = r.sugerido;
            if (!contenidosUnicos.has(c.id)) {
                contenidosUnicos.set(c.id, {
                    id: c.id,
                    titulo: c.titulo,
                    descripcion: c.descripcion,
                    portada: c.portada,
                    tipo: c.tipo,
                    url: c.url,
                });
            }
        }

        return Array.from(contenidosUnicos.values());
    }


    async obtenerPlaylistsPorPerfil(perfilId: number) {
        const playlists = await this.playlistRepo.find({
            where: { perfil: { id: perfilId } },
            relations: ['contenidos', 'contenidos.contenido'],
            order: { fechaCreacion: 'DESC' },
        });

        return playlists.map(pl => {
            // Ordenar los contenidos por "orden" de forma ascendente
            const contenidosOrdenados = [...pl.contenidos].sort((a, b) => a.orden - b.orden);
            const portadaPrincipal = contenidosOrdenados[0]?.contenido?.portada || null;

            return {
                id: pl.id,
                nombre: pl.nombre,
                tipo: pl.tipo,
                fechaCreacion: pl.fechaCreacion,
                portada: portadaPrincipal,
                contenidos: contenidosOrdenados.map(pc => ({
                    id: pc.contenido.id,
                    titulo: pc.contenido.titulo,
                    descripcion: pc.contenido.descripcion,
                    tipo: pc.contenido.tipo,
                    url: pc.contenido.url,
                    portada: pc.contenido.portada,
                    orden: pc.orden,
                }))
            };
        });
    }


    async obtenerContenidosDescargados(perfilId: number): Promise<Contenido[]> {
        const registros = await this.descargaRepo.find({
            where: { perfil: { id: perfilId } },
            relations: ['contenido'],
            order: { fecha: 'DESC' }, // opcional: últimos primero
        });

        return registros.map(r => r.contenido);
    }

}
