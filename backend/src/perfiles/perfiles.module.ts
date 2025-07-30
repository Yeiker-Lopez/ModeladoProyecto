import { Module } from '@nestjs/common';
import { PerfilesService } from './perfiles.service';
import { PerfilesController } from './perfiles.controller';
import { Perfil } from 'src/_entitys/perfil.entity';
import { Usuario } from 'src/_entitys/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Perfil,])],

  controllers: [PerfilesController],
  providers: [PerfilesService],
})
export class PerfilesModule { }
