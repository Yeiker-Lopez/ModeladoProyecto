import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { RecuperarPasswordService } from './recuperar-password.service';

@Controller('recuperar-password')
export class RecuperarPasswordController {
  constructor(private readonly recuperarPasswordService: RecuperarPasswordService) { }

  @Post('solicitar')
  async solicitar(@Body('email') email: string) {
    return this.recuperarPasswordService.solicitarRecuperacion(email);
  }

  @Post('validar-token')
  async validarToken(@Body('token') token: string) {
    return this.recuperarPasswordService.validarToken(token);
  }

  @Patch('recuperar')
  async cambiar(
    @Body('token') token: string,
    @Body('nuevaClave') nuevaClave: string,
  ) {
    return this.recuperarPasswordService.updatePasswordWithToken(token, nuevaClave);
  }

  @Patch(':id/validar-contrasena')
  async validarContrasena(
    @Param('id') idUsuario: number,
    @Body('contrasena') contrasena: string
  ) {
    return this.recuperarPasswordService.validarContrasenaActual(idUsuario, contrasena);
  }

  @Patch(':id/cambiar-contrasena')
  async cambiarContrasena(
    @Param('id') idUsuario: number,
    @Body('contrasenaActual') contrasenaActual: string,
    @Body('nuevaContrasena') nuevaContrasena: string,
    @Body('confirmarContrasena') confirmarContrasena: string
  ) {
    return this.recuperarPasswordService.cambiarContrasenaActual(idUsuario, contrasenaActual, nuevaContrasena, confirmarContrasena);
  }
}
