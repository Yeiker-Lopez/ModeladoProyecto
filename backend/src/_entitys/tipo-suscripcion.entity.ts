import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Suscripcion } from './suscripcion.entity';

@Entity()
export class TipoSuscripcion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string; // Solo Audio, Solo Video, Combo Premium

    @Column()
    permiteAudio: boolean;

    @Column()
    permiteVideo: boolean;

    @OneToMany(() => Suscripcion, s => s.tipoSuscripcion)
    suscripciones: Suscripcion[];
}
