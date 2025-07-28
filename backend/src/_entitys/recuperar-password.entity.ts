
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity()
export class RecuperarPassword {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Usuario, (usuario) => usuario.id, { onDelete: 'CASCADE' })
    usuario: Usuario;

    @Column()
    token: string;

    @CreateDateColumn({ type: 'timestamp' })
    creado_en: Date;
}
