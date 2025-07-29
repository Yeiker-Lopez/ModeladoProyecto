// tipo-usuario.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('tipos_usuario')
export class TipoUsuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string; // 'Administrador' | 'Cliente'

    @OneToMany(() => Usuario, usuario => usuario.tipoUsuario)
    usuarios: Usuario[];
}
