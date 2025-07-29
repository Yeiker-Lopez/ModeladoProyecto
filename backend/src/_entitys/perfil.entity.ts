import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Playlist } from './playlist.entity';
import { HistorialReproduccion } from './historial-reproduccion.entity';
import { ContenidoDescargado } from './contenido-descargado.entity';
import { MetricaUso } from './metrica-uso.entity';

@Entity()
export class Perfil {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    pin: string;

    @Column('simple-array', { nullable: true })
    preferencias: string[]; // ['rock', 'documentales', ...]

    @ManyToOne(() => Usuario, usuario => usuario.perfiles)
    usuario: Usuario;

    @OneToMany(() => Playlist, p => p.perfil)
    playlists: Playlist[];

    @OneToMany(() => HistorialReproduccion, h => h.perfil)
    historial: HistorialReproduccion[];

    @OneToMany(() => ContenidoDescargado, c => c.perfil)
    descargados: ContenidoDescargado[];

    @OneToMany(() => MetricaUso, m => m.perfil)
    metricas: MetricaUso[];
}
