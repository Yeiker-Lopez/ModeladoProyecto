import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from 'src/_entitys/usuario.entity';

type ResultadoValidacion =
    | { success: true; usuario: Usuario }
    | { success: false; message: string };


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
        private readonly jwtService: JwtService,

    ) { }


    async validarUsuario(correo: string, clave: string): Promise<ResultadoValidacion> {
        const usuario = await this.usuarioRepo.findOne({ where: { correo: correo }, relations: ['tipoUsuario'] });

        if (!usuario) {
            return {
                success: false,
                message: 'El usuario no existe'
            };
        }

        const claveValida = await bcrypt.compare(clave, usuario.clave);
        if (!claveValida) {
            return {
                success: false,
                message: 'Contraseña incorrecta'
            };
        }


        return { success: true, usuario };
    }



    async login(
        correo: string,
        clave: string,
    ): Promise<
        | { success: false; message: string }
        | { message: string; accessToken: string; refreshToken: string }
    > {
        const resultado = await this.validarUsuario(correo, clave);

        if (!('usuario' in resultado)) {
            return { success: false, message: resultado.message };
        }

        const usuario = resultado.usuario;



        // Payload para el token
        const payload = {
            sub: usuario.id,
            correo: usuario.correo,
            tipo_usuario: {
                id: usuario.tipoUsuario.id,
                nombre: usuario.tipoUsuario.nombre,
            },
        };

        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '1d' });

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        usuario.refreshToken = hashedRefreshToken;
        await this.usuarioRepo.save(usuario);




        return {
            message: 'Inicio de sesión exitoso',
            accessToken,
            refreshToken,
        };
    }


    async refreshToken(
        userId: number,
        refreshToken: string
    ): Promise<{ message: string; accessToken: string }> {
        const usuario = await this.usuarioRepo.findOne({
            where: { id: userId },
            relations: ['tipoUsuario'],
        });

        if (!usuario || !usuario.refreshToken) {
            throw new UnauthorizedException({ message: 'No se encontró un token de actualización válido' });
        }

        const tokenValido = await bcrypt.compare(refreshToken, usuario.refreshToken);
        if (!tokenValido) {
            throw new UnauthorizedException({ message: 'Token de actualización inválido' });
        }

        let decoded: any;
        try {
            decoded = this.jwtService.decode(refreshToken);
        } catch {
            throw new UnauthorizedException({ message: 'Token inválido o malformado' });
        }

        const payload = {
            sub: usuario.id,
            correo: usuario.correo,
            tipo_usuario: {
                id: usuario.tipoUsuario.id,
                nombre: usuario.tipoUsuario.nombre,
            },
        };

        const newAccessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

        return {
            message: 'Nuevo token de acceso generado',
            accessToken: newAccessToken,
        };
    }

    async logout(usuarioId: number): Promise<{ message: string }> {
        const usuario = await this.usuarioRepo.findOne({
            where: { id: usuarioId },
        });

        if (!usuario) {
            throw new NotFoundException('No se encontró al usuario');
        }

        await this.usuarioRepo.update(usuarioId, { refreshToken: '' });

        return { message: 'Sesión cerrada exitosamente' };
    }
}
