// usuario.entity.ts
import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany
} from 'typeorm';
import { TipoUsuario } from './tipo-usuario.entity';
import { Perfil } from './perfil.entity';
import { Suscripcion } from './suscripcion.entity';

@Entity('usuarios')
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    clave: string;

    @Column({ unique: true })
    correo: string;

    @ManyToOne(() => TipoUsuario, tipo => tipo.usuarios)
    tipoUsuario: TipoUsuario;

    @Column({ nullable: true })
    refreshToken: string;
    
    @OneToMany(() => Perfil, perfil => perfil.usuario)
    perfiles: Perfil[];

    @OneToMany(() => Suscripcion, s => s.usuario)
    suscripciones: Suscripcion[];
}
