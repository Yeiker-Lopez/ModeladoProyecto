import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { Perfil } from './perfil.entity';
import { PlaylistContenido } from './playlist-contenido.entity';

@Entity()
export class Playlist {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    tipo: 'mixta' | 'audio' | 'video';

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaCreacion: Date;

    @ManyToOne(() => Perfil, perfil => perfil.playlists)
    perfil: Perfil;

    @OneToMany(() => PlaylistContenido, pc => pc.playlist)
    contenidos: PlaylistContenido[];
}
