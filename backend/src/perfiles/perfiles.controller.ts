import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PerfilesService } from './perfiles.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Perfiles')
@Controller('perfiles')
export class PerfilesController {
  constructor(private readonly perfilesService: PerfilesService) { }

  @Get(':id/usuario')
  @ApiOperation({ summary: 'Obtener perfiles por ID de usuario' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de perfiles del usuario' })
  async obtenerPerfiles(@Param('id') id: number) {
    return this.perfilesService.obtenerPerfilesPorUsuario(id);
  }

  @Post('validar-pin')
  @ApiOperation({ summary: 'Validar PIN de un perfil' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        perfilId: { type: 'number', example: 1 },
        pin: { type: 'string', example: '1234' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Resultado de validación del PIN' })
  async validarPin(@Body() body: { perfilId: number; pin: string }) {
    return this.perfilesService.validarPin(body.perfilId, body.pin);
  }

  @Get('por-tipo/:tipo')
  @ApiOperation({ summary: 'Obtener perfiles por tipo' })
  @ApiParam({ name: 'tipo', type: String, description: 'Tipo de perfil (ej: Infantil)' })
  @ApiResponse({ status: 200, description: 'Lista de perfiles del tipo indicado' })
  getContenidoPorTipo(@Param('tipo') tipo: string) {
    return this.perfilesService.obtenerPorTipo(tipo);
  }

  @Post('validar-pin')
  @ApiOperation({ summary: 'Validar PIN (duplicado)' }) // ⚠️ Puedes eliminar esta función duplicada si no se usa
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        perfilId: { type: 'number', example: 1 },
        pin: { type: 'string', example: '1234' },
      },
    },
  })
  validarPinPerfil(@Body() body: { perfilId: number; pin: string }) {
    return this.perfilesService.validarPinPerfil(body.perfilId, body.pin);
  }

  @Patch(':id/actualizar-pin')
  @ApiOperation({ summary: 'Actualizar PIN del perfil' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del perfil' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nuevoPin: { type: 'string', example: '5678' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'PIN actualizado correctamente' })
  actualizarPinPerfil(
    @Param('id') id: number,
    @Body() body: { nuevoPin: string },
  ) {
    return this.perfilesService.actualizarPinPerfil(+id, body.nuevoPin);
  }

  @Get('playlist/:id')
  @ApiOperation({ summary: 'Obtener playlists por perfil' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del perfil' })
  @ApiResponse({ status: 200, description: 'Playlists asociadas al perfil' })
  async obtenerPlaylistsPorPerfil(@Param('id') perfilId: number) {
    return this.perfilesService.obtenerPlaylistsPorPerfil(+perfilId);
  }

  @Get('dashboard/:perfilId')
  @ApiOperation({ summary: 'Dashboard analítico del perfil' })
  @ApiParam({ name: 'perfilId', type: Number, description: 'ID del perfil' })
  @ApiResponse({ status: 200, description: 'Datos analíticos del perfil' })
  async dashboardAnalitico(@Param('perfilId') perfilId: number) {
    return this.perfilesService.obtenerDashboardAnalitico(+perfilId);
  }

  @Get('recomendaciones/:perfilId')
  @ApiOperation({ summary: 'Obtener recomendaciones desde playlists' })
  @ApiParam({ name: 'perfilId', type: Number, description: 'ID del perfil' })
  @ApiResponse({ status: 200, description: 'Lista de recomendaciones' })
  async recomendacionesDesdePlaylists(@Param('perfilId') perfilId: number) {
    return this.perfilesService.obtenerRecomendacionesDesdePlaylists(+perfilId);
  }

  @Get('contenido/descargados/:perfilId')
  @ApiOperation({ summary: 'Obtener contenidos descargados por perfil' })
  @ApiParam({ name: 'perfilId', type: Number, description: 'ID del perfil' })
  @ApiResponse({ status: 200, description: 'Contenidos descargados' })
  async obtenerDescargas(@Param('perfilId') perfilId: number) {
    return this.perfilesService.obtenerContenidosDescargados(+perfilId);
  }
}
