import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';
import { Playlist } from './playlist.entity';
import { Contenido } from './contenido.entity';

@Entity()
export class PlaylistContenido {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Playlist, p => p.contenidos, { onDelete: 'CASCADE' })
    playlist: Playlist;

    @ManyToOne(() => Contenido, c => c.enPlaylists, { onDelete: 'CASCADE' })
    contenido: Contenido;

    @Column()
    orden: number;
}
