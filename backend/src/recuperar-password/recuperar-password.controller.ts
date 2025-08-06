import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { RecuperarPasswordService } from './recuperar-password.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Recuperación de Contraseña')
@Controller('recuperar-password')
export class RecuperarPasswordController {
  constructor(
    private readonly recuperarPasswordService: RecuperarPasswordService,
  ) { }

  @Post('solicitar')
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'usuario@correo.com' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Correo de recuperación enviado' })
  async solicitar(@Body('email') email: string) {
    return this.recuperarPasswordService.solicitarRecuperacion(email);
  }

  @Post('validar-token')
  @ApiOperation({ summary: 'Validar token de recuperación' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'abc123token' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Token válido' })
  async validarToken(@Body('token') token: string) {
    return this.recuperarPasswordService.validarToken(token);
  }

  @Patch('recuperar')
  @ApiOperation({ summary: 'Cambiar contraseña usando token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'abc123token' },
        nuevaClave: { type: 'string', example: 'NuevaClaveSegura123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada con éxito' })
  async cambiar(
    @Body('token') token: string,
    @Body('nuevaClave') nuevaClave: string,
  ) {
    return this.recuperarPasswordService.updatePasswordWithToken(
      token,
      nuevaClave,
    );
  }

  @Patch(':id/validar-contrasena')
  @ApiOperation({ summary: 'Validar contraseña actual del usuario' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contrasena: { type: 'string', example: 'claveActual123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Contraseña válida' })
  async validarContrasena(
    @Param('id') idUsuario: number,
    @Body('contrasena') contrasena: string,
  ) {
    return this.recuperarPasswordService.validarContrasenaActual(
      idUsuario,
      contrasena,
    );
  }

  @Patch(':id/cambiar-contrasena')
  @ApiOperation({ summary: 'Cambiar contraseña desde el perfil' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contrasenaActual: { type: 'string', example: 'claveActual123' },
        nuevaContrasena: { type: 'string', example: 'NuevaClaveSegura123' },
        confirmarContrasena: { type: 'string', example: 'NuevaClaveSegura123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada correctamente' })
  async cambiarContrasena(
    @Param('id') idUsuario: number,
    @Body('contrasenaActual') contrasenaActual: string,
    @Body('nuevaContrasena') nuevaContrasena: string,
    @Body('confirmarContrasena') confirmarContrasena: string,
  ) {
    return this.recuperarPasswordService.cambiarContrasenaActual(
      idUsuario,
      contrasenaActual,
      nuevaContrasena,
      confirmarContrasena,
    );
  }
}
