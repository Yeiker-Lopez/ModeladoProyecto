import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/_entitys/usuario.entity';
import { In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { TipoUsuario } from 'src/_entitys/tipo-usuario.entity';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';


@Injectable()
export class UsuarioService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
        @InjectRepository(TipoUsuario) private readonly tipoUsuarioRepo: Repository<TipoUsuario>,

    ) { }

    private generarClaveAleatoria(longitud: number = 8): string {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: longitud }, () => caracteres.charAt(Math.floor(Math.random() * caracteres.length))).join('');
    }

    async verificarPassword(usuarioId: number, PasswordIngresada: string): Promise<{ message: string }> {
        const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });

        if (!usuario) {
            throw new NotFoundException({ message: 'Usuario no encontrado' });
        }

        const esValida = await bcrypt.compare(PasswordIngresada, usuario.clave);

        if (!esValida) {
            return { message: 'Contraseña incorrecta' };
        }

        return { message: 'Contraseña correcta' };
    }

    async actualizarPassword(usuarioId: number, nuevaPassword: string): Promise<{ message: string }> {

        const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });

        if (!usuario) {
            throw new NotFoundException({ message: 'Usuario no encontrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const nuevaClaveEncriptada = await bcrypt.hash(nuevaPassword, salt);

        usuario.clave = nuevaClaveEncriptada;
        await this.usuarioRepo.save(usuario);


        return { message: 'Contraseña actualizada con éxito' };
    }

    async crearUsuario(data: {
        nombres: string;
        apellidos: string;
        correo: string;
        tipoUsuarioId: number;
    }): Promise<Usuario> {
        const { nombres, apellidos, correo, tipoUsuarioId } = data;

        const existente = await this.usuarioRepo.findOne({ where: [ { correo }] });
        if (existente) {
            throw new ConflictException('Ya existe un usuario con esa cédula o correo.');
        }

        const tipoUsuario = await this.tipoUsuarioRepo.findOne({ where: { id: tipoUsuarioId } });
        if (!tipoUsuario) {
            throw new BadRequestException('Tipo de usuario no válido.');
        }

        const claveTemporal = this.generarClaveAleatoria(10);
        const claveEncriptada = await bcrypt.hash(claveTemporal, 10);

        const nuevoUsuario = this.usuarioRepo.create({
            correo,
            clave: claveEncriptada,
            tipoUsuario,
        });

        const usuarioGuardado = await this.usuarioRepo.save(nuevoUsuario);

        return usuarioGuardado;
    }

    async generarClaveTemporalYEnviar(usuarioId: number): Promise<{ message: string }> {
        const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });

        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const claveTemporal = this.generarClaveAleatoria(10);
        const claveEncriptada = await bcrypt.hash(claveTemporal, 10);

        usuario.clave = claveEncriptada;
        await this.usuarioRepo.save(usuario);

        const baseLink = 'http://localhost:4200/login';
        await this.enviarCredencialesCorreo(
            usuario.correo,
            claveTemporal,
            baseLink
        );

        return { message: 'Nueva clave temporal generada y enviada por correo' };
    }

  private async enviarCredencialesCorreo(email: string, clave: string, link: string) {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: '',// ubicar correo
                pass: '',// ubicar contrase;a
            },
        });

        const imagePath = path.resolve(process.cwd(), 'assets', 'logoEH.png');
        console.log('Ruta de la imagen usada:', imagePath);

        if (!fs.existsSync(imagePath)) {
            console.error('La imagen no existe en la ruta:', imagePath);
            throw new Error('La imagen para el correo no fue encontrada.');
        }
        console.log('clave: '+clave);

        const mailOptions = {
            from: '', // ubicar correo
            to: email,
            subject: 'Cuenta creada - EntertainHub',
            html: `
                <div style="font-family: Arial, sans-serif; color: #2E4A62; line-height: 1.6; text-align: center;">
                    <img src="cid:logoHeader" alt="Logo EntertainHub" style="width: 200px; margin-bottom: 20px;">
                    <h1 style="color: #7b2cbf;">Bienvenido a EntertainHub</h1>
                    <p>Se ha creado su cuenta de acceso a nuestra plataforma. A continuación encontrará sus credenciales de acceso:</p>
                    <div style="background-color: #f0e7ff; padding: 15px; margin: 20px auto; border-radius: 8px; width: 80%; text-align: center;">
                        <p style="margin: 0; color: #2E4A62"><strong>Usuario:</strong> ${email}</p>
                        <p style="margin: 0; color: #2E4A62"><strong>Contraseña temporal:</strong> ${clave}</p>
                    </div>
                    <p>Le recomendamos cambiar su contraseña al primer ingreso para mantener la seguridad de su cuenta.</p>
                    <div style="background-color: #f0e7ff; padding: 15px; margin: 20px auto; border-radius: 8px; width: 80%; text-align: center;">
                        <p style="margin: 0; color: #2E4A62;">Haga clic en el siguiente enlace para iniciar sesión:</p>
                        <a href="${link}" style="display: inline-block; margin: 10px auto; padding: 12px 20px; font-size: 16px; background-color: #7b2cbf; color: #fff; text-decoration: none; border-radius: 4px;">Iniciar Sesión</a>
                    </div>
                    <p style="margin-top: 30px;">Si tiene problemas, copie y pegue la siguiente URL en su navegador:</p>
                    <p style="word-wrap: break-word; color: #2E4A62;">${link}</p>
                    <p style="margin-top: 30px;">Atentamente, <br><strong>EntertainHub</strong></p>
                </div>
            `,
            attachments: [
                {
                    filename: 'logoEH.png',
                    path: imagePath,
                    cid: 'logoHeader',
                },
            ],
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Credenciales enviadas a ${email} con éxito.`);
        } catch (error) {
            console.error('Error al enviar las credenciales:', error);
            throw new Error('No se pudo enviar el correo con las credenciales.');
        }
    }
}
