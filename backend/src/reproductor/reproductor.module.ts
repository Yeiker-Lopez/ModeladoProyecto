import { Module } from '@nestjs/common';
import { ReproductorService } from './reproductor.service';
import { ReproductorController } from './reproductor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contenido } from 'src/_entitys/contenido.entity';
import { Playlist } from 'src/_entitys/playlist.entity';
import { Recomendacion } from 'src/_entitys/recomendacion.entity';
import { ContenidoDescargado } from 'src/_entitys/contenido-descargado.entity';
import { MetricaUso } from 'src/_entitys/metrica-uso.entity';
import { HistorialReproduccion } from 'src/_entitys/historial-reproduccion.entity';
import { HttpModule } from '@nestjs/axios'; // <-- IMPORTANTE
import { Perfil } from 'src/_entitys/perfil.entity';
import { PlaylistContenido } from 'src/_entitys/playlist-contenido.entity';

@Module({
  imports: [HttpModule,TypeOrmModule.forFeature([Contenido,Perfil, PlaylistContenido, Playlist, Recomendacion, ContenidoDescargado, MetricaUso, HistorialReproduccion])],

  controllers: [ReproductorController],
  providers: [ReproductorService],
})
export class ReproductorModule { }
