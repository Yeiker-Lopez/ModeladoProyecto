import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Perfil } from 'src/_entitys/perfil.entity';
import { Usuario } from 'src/_entitys/usuario.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class PerfilesService {

    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
        @InjectRepository(Perfil) private readonly perfilRepo: Repository<Perfil>,

    ) { }

    async obtenerPerfilesPorUsuario(usuarioId: number) {
        const usuario = await this.usuarioRepo.findOne({
            where: { id: usuarioId },
            relations: ['perfiles'],
        });

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return usuario.perfiles;
    }

    async validarPin(perfilId: number, pin: string) {
        const perfil = await this.perfilRepo.findOne({
            where: { id: perfilId },
            relations: ['usuario']
        });

        if (!perfil) {
            throw new NotFoundException('Perfil no encontrado');
        }

        if (perfil.pin !== pin) {
            throw new UnauthorizedException('PIN incorrecto');
        }

        // Puedes devolver solo lo necesario:
        return {
            perfilId: perfil.id,
            nombre: perfil.nombre,
            usuarioId: perfil.usuario.id,
            preferencias: perfil.preferencias,
        };
    }


}
