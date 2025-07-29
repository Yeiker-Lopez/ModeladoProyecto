import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { TipoSuscripcion } from './tipo-suscripcion.entity';

@Entity()
export class Suscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, u => u.suscripciones)
  usuario: Usuario;

  @ManyToOne(() => TipoSuscripcion, t => t.suscripciones)
  tipoSuscripcion: TipoSuscripcion;

  @Column()
  fechaInicio: Date;

  @Column()
  fechaFin: Date;

  @Column({ default: true })
  activa: boolean;
}
