import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import { Usuario } from 'src/_entitys/usuario.entity';
import { RecuperarPassword } from 'src/_entitys/recuperar-password.entity';
import { UsuarioService } from 'src/usuario/usuario.service';

@Injectable()
export class RecuperarPasswordService {
    constructor(
        private readonly usuariosService: UsuarioService,
        @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
        @InjectRepository(RecuperarPassword) private recuperacionRepo: Repository<RecuperarPassword>,
    ) { }

    async solicitarRecuperacion(email: string): Promise<{ message: string }> {
        const usuario = await this.usuarioRepo.findOne({ where: { correo: email } });

        if (!usuario) {
            console.error('Usuario no encontrado:', email);
            return { message: 'Usuario no encontrado' };
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const recuperacion = new RecuperarPassword();
        recuperacion.usuario = usuario;
        recuperacion.token = token;
        recuperacion.creado_en = expiresAt;
        await this.recuperacionRepo.save(recuperacion);
        const link = `http://localhost:4200/recuperar-clave?token=${token}`;


        
        await this.enviarCorreo(email, link);

        return { message: 'Correo de recuperación enviado' };
    }

    private async enviarCorreo(email: string, link: string) {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: '',// ubicar correo
                pass: '',// ubicar contrase;a
            },
        });
        const imagePath = path.resolve(process.cwd(),'assets', 'logoEH.png');
        console.log('Ruta de la imagen usada:', imagePath);
        if (!fs.existsSync(imagePath)) {
            console.error('La imagen no existe en la ruta:', imagePath);
            throw new Error('La imagen para el correo no fue encontrada.');
        }

        const mailOptions = {
            from: '',//poner correo
            to: email,
            subject: 'Restablecimiento de contraseña - EntertainHub',
            html: `
                <div style="font-family: Arial, sans-serif; color: #2E4A62; line-height: 1.6; text-align: center;">
                    <img src="cid:logoHeader" alt="Logo Clara Barton" style="width: 200px; margin-bottom: 20px;">
                    <h1 style="color: #7b2cbf;">Solicitud para Restablecer Contraseña</h1>
                    <p>Estimado usuario,</p>
                    <p>Hemos recibido una solicitud para restablecer su contraseña. Si no fue usted quien realizó esta solicitud, ignore este mensaje.</p>
                    <div style="background-color: #f0e7ff; padding: 15px; margin: 20px auto; border-radius: 8px; width: 80%; text-align: center;">
                        <p style="margin: 0; color: #2E4A62">Haga clic en el siguiente enlace para restablecer su contraseña:</p>
                        <a href="${link}" style="display: inline-block; margin: 10px auto; padding: 12px 20px; font-size: 16px; background-color: #7b2cbf; color: #fff; text-decoration: none; border-radius: 4px;">Restablecer Contraseña</a>
                    </div>
                    <p>Este enlace expirará en 15 minutos.</p>
                    <p style="margin-top: 30px;">Si tiene problemas, copie y pegue la siguiente URL en su navegador:</p>
                    <p style="word-wrap: break-word; color:rgb(81, 46, 98);">${link}</p>
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
            console.log(`Correo enviado a ${email} con éxito.`);
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            throw new Error('No se pudo enviar el correo de restablecimiento.');
        }
    }

    async validarToken(token: string): Promise<Usuario> {
        const recuperacion = await this.recuperacionRepo.findOne({ where: { token }, relations: ['usuario'] });

        if (!recuperacion || recuperacion.creado_en < new Date()) {
            throw new UnauthorizedException('El token no es válido o ha expirado.');
        }

        return recuperacion.usuario;
    }

    async updatePasswordWithToken(token: string, newPassword: string): Promise<void> {
        const user = await this.validarToken(token);
        if (!user) {
            return;
        }
        console.log("Contraseña antes de actualizarla " + newPassword)
        await this.cambiarContrasena(user.id, newPassword);

        await this.recuperacionRepo.delete({ token });
    }
    async cambiarContrasena(userId: number, newPassword: string): Promise<{ message: string }> {
        const user = await this.usuarioRepo.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        console.log("Contraseña antes de hashearla " + newPassword)



        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.clave = hashedPassword;
        await this.usuarioRepo.save(user);

        


        return { message: 'Contraseña cambiada exitosamente' };
    }

    async validarContrasenaActual(idUsuario: number, contrasenaIngresada: string): Promise<{ valido: boolean; message: string }> {
        const usuario = await this.usuarioRepo.findOne({ where: { id: idUsuario } });

        if (!usuario) {
            return { valido: false, message: 'Usuario no encontrado' };
        }

        const esValida = await bcrypt.compare(contrasenaIngresada, usuario.clave);
        if (!esValida) {
            return { valido: false, message: 'Contraseña incorrecta' };
        }

        return { valido: true, message: 'Contraseña correcta' };
    }

    async cambiarContrasenaActual(
        idUsuario: number,
        contrasenaActual: string,
        nuevaContrasena: string,
        confirmarContrasena: string
    ): Promise<{ message: string }> {
        const usuario = await this.usuarioRepo.findOne({ where: { id: idUsuario } });

        if (!usuario) {
            return { message: 'Usuario no encontrado' };
        }

        const esValida = await bcrypt.compare(contrasenaActual, usuario.clave);
        if (!esValida) {
            return { message: 'La contraseña actual es incorrecta' };
        }

        if (nuevaContrasena !== confirmarContrasena) {
            return { message: 'Las nuevas contraseñas no coinciden' };
        }

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!regex.test(nuevaContrasena)) {
            return {
                message: 'La nueva contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial.'
            };
        }

        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
        usuario.clave = hashedPassword;
        await this.usuarioRepo.save(usuario);

        return { message: 'Contraseña cambiada exitosamente' };
    }


}
