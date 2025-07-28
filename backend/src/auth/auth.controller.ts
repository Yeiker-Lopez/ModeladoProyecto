import { Body, Controller, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() data: { correo: string; clave: string; }) {
    const result = await this.authService.login(
      data.correo,
      data.clave,
    );

    if ('success' in result && result.success === false) {
      return result;
    }

    return result;
  }


  @Post('refresh/:id')
  async refreshToken(@Param('id') userId: number, @Body() data: { refreshToken: string }) {
    return this.authService.refreshToken(userId, data.refreshToken);
  }

  @Post('logout/:id')
  async logout(@Param('id') usuarioId: number) {
    return this.authService.logout(usuarioId);
  }

}
