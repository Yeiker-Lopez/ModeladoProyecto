import { Body, Controller, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        correo: { type: 'string', example: 'usuario@correo.com' },
        clave: { type: 'string', example: '123456' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  async login(@Body() data: { correo: string; clave: string }) {
    const result = await this.authService.login(data.correo, data.clave);

    if ('success' in result && result.success === false) {
      return result;
    }

    return result;
  }

  @Post('refresh/:id')
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID del usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1...' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Token actualizado' })
  async refreshToken(
    @Param('id') userId: number,
    @Body() data: { refreshToken: string },
  ) {
    return this.authService.refreshToken(userId, data.refreshToken);
  }

  @Post('logout/:id')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  async logout(@Param('id') usuarioId: number) {
    return this.authService.logout(usuarioId);
  }
}
