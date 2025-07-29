import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';
import { Perfil } from './perfil.entity';

@Entity()
export class MetricaUso {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Perfil, perfil => perfil.metricas)
    perfil: Perfil;

    @Column()
    tipo: 'audio' | 'video';

    @Column({ type: 'date' })
    fecha: Date;

    @Column()
    tiempoReproduccion: number; // en segundos
}
