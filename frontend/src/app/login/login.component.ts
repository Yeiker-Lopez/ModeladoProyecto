import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  correo: string = '';
  clave: string = '';
  errorMsg: string = '';

  constructor(private loginService: LoginService, private router: Router) { }
  verSuscripciones() {
    this.router.navigate(['/suscripciones']);
  }
  iniciarSesion(): void {
    if (!this.correo || !this.clave) {
      this.errorMsg = 'Ingresa correo y contraseña';
      return;
    }

    this.loginService.login(this.correo, this.clave).subscribe({
      next: (res) => {
        const accessToken = res?.accessToken;
        const refreshToken = res?.refreshToken;

        if (accessToken && refreshToken) {
          this.loginService.saveTokens(accessToken, refreshToken);

          const decoded: any = JSON.parse(atob(res.accessToken.split('.')[1]));
          const tipo = decoded.tipo_usuario.id;
          switch (tipo) {
            case 1:
              this.router.navigate(['/login']);
              break;
            case 2:
              this.router.navigate(['/perfiles']);
              break;
            default:
              this.router.navigate(['/login']);
          }
        } else {
          this.errorMsg = 'Respuesta inválida del servidor';
        }
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Credenciales inválidas';
      }
    });
  }
}
