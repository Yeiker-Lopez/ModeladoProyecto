// usuario.entity.ts
import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany
} from 'typeorm';
import { TipoUsuario } from './tipo-usuario.entity';

@Entity('usuarios')
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombres: string;

    @Column()
    apellidos: string;

    @Column()
    clave: string;

    @Column({ unique: true })
    correo: string;

    @ManyToOne(() => TipoUsuario, tipo => tipo.usuarios)
    tipoUsuario: TipoUsuario;

    @Column({ nullable: true })
    refreshToken: string;

}
