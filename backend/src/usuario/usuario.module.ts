import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from 'src/_entitys/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoUsuario } from 'src/_entitys/tipo-usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, TipoUsuario,])],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule { }
