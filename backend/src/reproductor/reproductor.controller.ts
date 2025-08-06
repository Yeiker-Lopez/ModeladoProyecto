import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ReproductorService } from './reproductor.service';
import { HttpService } from '@nestjs/axios';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Reproductor')
@Controller('reproductor')
export class ReproductorController {
  constructor(
    private readonly reproductorService: ReproductorService,
    private readonly httpService: HttpService,
  ) { }

  @Get('reproducir/:id')
  @ApiOperation({ summary: 'Obtener vista de reproductor por contenido' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del contenido' })
  @ApiQuery({ name: 'playlist', required: false, type: Number })
  async obtenerVistaReproductor(
    @Param('id') id: number,
    @Query('playlist') playlistId?: number,
  ) {
    return this.reproductorService.obtenerVistaReproductor(
      +id,
      playlistId ? +playlistId : undefined,
    );
  }

  @Post('metrica')
  @ApiOperation({ summary: 'Registrar métrica de reproducción' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        perfilId: { type: 'number', example: 1 },
        tipo: { type: 'string', enum: ['audio', 'video'], example: 'video' },
        duracion: { type: 'number', example: 120 },
      },
    },
  })
  registrarMetrica(
    @Body()
    body: { perfilId: number; tipo: 'audio' | 'video'; duracion: number },
  ) {
    return this.reproductorService.registrarMetrica(
      body.perfilId,
      body.tipo,
      body.duracion,
    );
  }

  @Post('historial')
  @ApiOperation({ summary: 'Registrar historial de reproducción' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        perfilId: { type: 'number', example: 1 },
        contenidoId: { type: 'number', example: 12 },
        duracion: { type: 'number', example: 300 },
      },
    },
  })
  registrarHistorial(
    @Body()
    body: { perfilId: number; contenidoId: number; duracion: number },
  ) {
    return this.reproductorService.registrarHistorial(
      body.perfilId,
      body.contenidoId,
      body.duracion,
    );
  }

  @Post('descargar')
  @ApiOperation({ summary: 'Registrar descarga de contenido' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        perfilId: { type: 'number', example: 1 },
        contenidoId: { type: 'number', example: 45 },
      },
    },
  })
  registrarDescarga(
    @Body()
    body: { perfilId: number; contenidoId: number },
  ) {
    return this.reproductorService.registrarDescarga(
      body.perfilId,
      body.contenidoId,
    );
  }

  @Get('descargado')
  @ApiOperation({ summary: 'Verificar si un contenido está descargado' })
  @ApiQuery({ name: 'perfilId', type: Number })
  @ApiQuery({ name: 'contenidoId', type: Number })
  async verificarDescarga(
    @Query('perfilId') perfilId: number,
    @Query('contenidoId') contenidoId: number,
  ) {
    return this.reproductorService.estaDescargado(+perfilId, +contenidoId);
  }

  @Get('descargados/:perfilId')
  @ApiOperation({ summary: 'Obtener contenidos descargados por perfil' })
  @ApiParam({ name: 'perfilId', type: Number })
  async obtenerDescargas(@Param('perfilId') perfilId: number) {
    return this.reproductorService.obtenerContenidosDescargados(+perfilId);
  }

  @Get('descargar-archivo/:id')
  @ApiOperation({ summary: 'Descargar archivo por ID de contenido' })
  @ApiParam({ name: 'id', type: Number })
  async descargarArchivo(@Param('id') id: number, @Res() res: Response) {
    const contenido = await this.reproductorService.obtenerContenidoPorId(id);
    if (!contenido) {
      return res.status(404).json({ message: 'Contenido no encontrado' });
    }

    const extension = contenido.tipo === 'audio' ? 'mp3' : 'mp4';
    const fileName = `${contenido.titulo.replace(/\s+/g, '_')}.${extension}`;

    const stream$ = this.httpService.get(contenido.url, {
      responseType: 'stream',
    });
    const response = await lastValueFrom(stream$);

    res.set({
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': 'application/octet-stream',
    });

    response.data.pipe(res);
  }

  @Get('playlists/ver/:perfilId')
  @ApiOperation({ summary: 'Listar playlists de un perfil' })
  @ApiParam({ name: 'perfilId', type: Number })
  listar(@Param('perfilId') perfilId: number) {
    return this.reproductorService.listarPlaylists(+perfilId);
  }

  @Post('playlists/agregar')
  @ApiOperation({ summary: 'Agregar contenido a una playlist' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        playlistId: { type: 'number', example: 3 },
        contenidoId: { type: 'number', example: 12 },
      },
    },
  })
  agregar(
    @Body()
    body: { playlistId: number; contenidoId: number },
  ) {
    return this.reproductorService.agregarContenidoAPlaylist(
      body.playlistId,
      body.contenidoId,
    );
  }

  @Post('playlists/crear')
  @ApiOperation({ summary: 'Crear una nueva playlist' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', example: 'Mis favoritos' },
        contenidoId: { type: 'number', example: 12 },
        perfilId: { type: 'number', example: 1 },
      },
    },
  })
  crear(
    @Body()
    body: { nombre: string; contenidoId: number; perfilId: number },
  ) {
    return this.reproductorService.crearPlaylist(
      body.nombre,
      body.contenidoId,
      body.perfilId,
    );
  }

  @Delete('playlists/eliminar')
  @ApiOperation({ summary: 'Eliminar contenido de una playlist' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        playlistId: { type: 'number', example: 3 },
        contenidoId: { type: 'number', example: 12 },
      },
    },
  })
  async eliminar(
    @Body()
    body: { playlistId: number; contenidoId: number },
  ) {
    return this.reproductorService.eliminarContenidoDePlaylist(
      body.playlistId,
      body.contenidoId,
    );
  }
}
