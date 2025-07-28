import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from 'src/_entitys/usuario.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;  
        }

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new ForbiddenException('Token no proporcionado');
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = this.jwtService.decode(token) as any;

        if (!decodedToken) {
            throw new ForbiddenException('Token inválido');
        }

        const usuario = await this.usuarioRepo.findOne({
            where: { id: decodedToken.sub },
        });

        if (!usuario) {
            throw new ForbiddenException('Usuario no encontrado');
        }
    

        

        return true;
    }
}
