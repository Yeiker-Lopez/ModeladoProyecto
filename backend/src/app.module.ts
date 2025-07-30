import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilesModule } from './perfiles/perfiles.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST') as string,
        port: parseInt(config.get<string>('DB_PORT') as string),
        username: config.get<string>('DB_USERNAME') as string,
        password: config.get<string>('DB_PASSWORD') as string,
        database: config.get<string>('DB_NAME') as string,
        entities: [__dirname + '/_entitys/*.entity{.ts,.js}'],
        synchronize: true,
        ssl: config.get<string>('DB_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    PerfilesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }