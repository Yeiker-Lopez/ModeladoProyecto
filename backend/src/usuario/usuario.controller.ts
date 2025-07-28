import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { UsuarioService } from './usuario.service';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) { }


  @Post('verificar-password')
  async verificarPassword(
    @Body('usuarioId') usuarioId: number,
    @Body('password') password: string
  ) {
    return this.usuarioService.verificarPassword(usuarioId, password);
  }

  @Post('actualizar-password')
  async actualizarPassword(
    @Body('usuarioId') usuarioId: number,
    @Body('nuevaPassword') nuevaPassword: string
  ) {
    return this.usuarioService.actualizarPassword(usuarioId, nuevaPassword);
  }

  @Post('crear')
  async crearUsuario(@Body() body: {
    nombres: string;
    apellidos: string;
    correo: string;
    tipoUsuarioId: number;
  }) {
    return this.usuarioService.crearUsuario(body);
  }

  @Post('generar-clave-temporal/:usuarioId')
  async generarClaveTemporal(
    @Param('usuarioId', ParseIntPipe) usuarioId: number
  ) {
    return this.usuarioService.generarClaveTemporalYEnviar(usuarioId);
  }


}

