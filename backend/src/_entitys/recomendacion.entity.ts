import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
} from 'typeorm';
import { Contenido } from './contenido.entity';

@Entity()
export class Recomendacion {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Contenido, c => c.recomendacionesOrigen)
    origen: Contenido;

    @ManyToOne(() => Contenido, c => c.recomendacionesSugerido)
    sugerido: Contenido;
}
