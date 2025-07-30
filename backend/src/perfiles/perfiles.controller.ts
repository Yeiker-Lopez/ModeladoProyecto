import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PerfilesService } from './perfiles.service';

@Controller('perfiles')
export class PerfilesController {
  constructor(private readonly perfilesService: PerfilesService) { }

  @Get(':id/usuario')
  async obtenerPerfiles(@Param('id') id: number) {
    return this.perfilesService.obtenerPerfilesPorUsuario(id);
  }
  @Post('validar-pin')
  async validarPin(@Body() body: { perfilId: number; pin: string }) {
    return this.perfilesService.validarPin(body.perfilId, body.pin);
  }

}
