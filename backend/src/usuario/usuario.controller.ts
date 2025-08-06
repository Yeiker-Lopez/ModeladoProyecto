import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Usuarios')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) { }

  @Post('verificar-password')
  @ApiOperation({ summary: 'Verificar contraseña del usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        usuarioId: { type: 'number', example: 1 },
        password: { type: 'string', example: '123456' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Contraseña verificada correctamente' })
  async verificarPassword(
    @Body('usuarioId') usuarioId: number,
    @Body('password') password: string,
  ) {
    return this.usuarioService.verificarPassword(usuarioId, password);
  }

  @Post('actualizar-password')
  @ApiOperation({ summary: 'Actualizar contraseña del usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        usuarioId: { type: 'number', example: 1 },
        nuevaPassword: { type: 'string', example: 'nuevaClave123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada correctamente' })
  async actualizarPassword(
    @Body('usuarioId') usuarioId: number,
    @Body('nuevaPassword') nuevaPassword: string,
  ) {
    return this.usuarioService.actualizarPassword(usuarioId, nuevaPassword);
  }

  @Post('crear')
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        correo: { type: 'string', example: 'nuevo@usuario.com' },
        tipoUsuarioId: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente' })
  async crearUsuario(
    @Body()
    body: {
      correo: string;
      tipoUsuarioId: number;
    },
  ) {
    return this.usuarioService.crearUsuario(body);
  }

  @Post('generar-clave-temporal/:usuarioId')
  @ApiOperation({ summary: 'Generar y enviar clave temporal al usuario' })
  @ApiParam({ name: 'usuarioId', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Clave temporal enviada correctamente' })
  async generarClaveTemporal(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
  ) {
    return this.usuarioService.generarClaveTemporalYEnviar(usuarioId);
  }
}
