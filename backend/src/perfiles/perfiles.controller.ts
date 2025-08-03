import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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

  @Get('por-tipo/:tipo')
  getContenidoPorTipo(@Param('tipo') tipo: string) {
    return this.perfilesService.obtenerPorTipo(tipo);
  }

  @Post('validar-pin')
  validarPinPerfil(@Body() body: { perfilId: number; pin: string }) {
    return this.perfilesService.validarPinPerfil(body.perfilId, body.pin);
  }

  @Patch(':id/actualizar-pin')
  actualizarPinPerfil(
    @Param('id') id: number,
    @Body() body: { nuevoPin: string }
  ) {
    return this.perfilesService.actualizarPinPerfil(+id, body.nuevoPin);
  }


  @Get('playlist/:id')
  async obtenerPlaylistsPorPerfil(@Param('id') perfilId: number) {
    return this.perfilesService.obtenerPlaylistsPorPerfil(+perfilId);
  }

  @Get('dashboard/:perfilId')
  async dashboardAnalitico(@Param('perfilId') perfilId: number) {
    return this.perfilesService.obtenerDashboardAnalitico(+perfilId);
  }

  @Get('recomendaciones/:perfilId')
  async recomendacionesDesdePlaylists(@Param('perfilId') perfilId: number) {
    return this.perfilesService.obtenerRecomendacionesDesdePlaylists(+perfilId);
  }

}
