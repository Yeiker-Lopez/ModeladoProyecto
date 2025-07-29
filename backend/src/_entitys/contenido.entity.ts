import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
} from 'typeorm';
import { PlaylistContenido } from './playlist-contenido.entity';
import { HistorialReproduccion } from './historial-reproduccion.entity';
import { ContenidoDescargado } from './contenido-descargado.entity';
import { Recomendacion } from './recomendacion.entity';

@Entity()
export class Contenido {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    titulo: string;

    @Column({ nullable: true })
    descripcion: string;

    @Column()
    tipo: 'audio' | 'video';

    @Column()
    url: string;

    @Column()
    portada: string;

    @Column('simple-array', { nullable: true })
    etiquetas: string[]; // ej. ['drama', 'rock', 'suspenso']

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaRegistro: Date;

    @OneToMany(() => PlaylistContenido, pc => pc.contenido)
    enPlaylists: PlaylistContenido[];

    @OneToMany(() => HistorialReproduccion, h => h.contenido)
    historial: HistorialReproduccion[];

    @OneToMany(() => ContenidoDescargado, d => d.contenido)
    descargadoPor: ContenidoDescargado[];

    @OneToMany(() => Recomendacion, r => r.origen)
    recomendacionesOrigen: Recomendacion[];

    @OneToMany(() => Recomendacion, r => r.sugerido)
    recomendacionesSugerido: Recomendacion[];
}
