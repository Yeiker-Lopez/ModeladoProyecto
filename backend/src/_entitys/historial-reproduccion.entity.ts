import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';
import { Perfil } from './perfil.entity';
import { Contenido } from './contenido.entity';

@Entity()
export class HistorialReproduccion {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Perfil, p => p.historial)
    perfil: Perfil;

    @ManyToOne(() => Contenido, c => c.historial)
    contenido: Contenido;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    @Column()
    duracion: number; // en segundos
}
