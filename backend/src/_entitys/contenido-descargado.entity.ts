import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';
import { Perfil } from './perfil.entity';
import { Contenido } from './contenido.entity';

@Entity()
export class ContenidoDescargado {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Perfil, p => p.descargados)
    perfil: Perfil;

    @ManyToOne(() => Contenido, c => c.descargadoPor)
    contenido: Contenido;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;
}
