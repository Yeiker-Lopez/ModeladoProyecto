import { Module } from '@nestjs/common';
import { RecuperarPasswordService } from './recuperar-password.service';
import { RecuperarPasswordController } from './recuperar-password.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { Usuario } from 'src/_entitys/usuario.entity';
import { RecuperarPassword } from 'src/_entitys/recuperar-password.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecuperarPassword, Usuario]),
    UsuarioModule, ],
  controllers: [RecuperarPasswordController],
  providers: [RecuperarPasswordService],
  exports: [RecuperarPasswordService],
})
export class RecuperarPasswordModule {}
