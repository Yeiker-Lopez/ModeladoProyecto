import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PerfilService } from '../services/perfiles.service';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-perfiles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfiles.component.html',
  styleUrls: ['./perfiles.component.css']
})
export class PerfilesComponent implements OnInit {
  perfiles: any[] = [];
  overlayVisible = false;
  selectedProfileId: number | null = null;
  selectedProfileName: string = '';
  pinDigits: string[] = ['', '', '', ''];
  errorMsg: string = '';
  loading = false;

  constructor(private router: Router, private perfilesService: PerfilService, private loginService: LoginService) { }

  ngOnInit(): void {
    const usuarioId = this.loginService.getUserId();

    if (!usuarioId) {
      this.errorMsg = 'No se pudo obtener el usuario';
      return;
    }

    this.perfilesService.obtenerPerfilesPorUsuario(usuarioId).subscribe({
      next: (res) => {
        this.perfiles = res;
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar los perfiles';
      }
    });
  }

  openPinOverlay(profile: any): void {
    this.selectedProfileId = profile.id;
    this.selectedProfileName = profile.nombre;
    this.overlayVisible = true;
    this.errorMsg = '';
    this.pinDigits = ['', '', '', ''];
    setTimeout(() => {
      const firstInput = document.getElementById('digit0') as HTMLInputElement;
      if (firstInput) firstInput.focus();
    }, 0);
  }

  closeOverlay(): void {
    this.overlayVisible = false;
    this.pinDigits = ['', '', '', ''];
    this.errorMsg = '';
    this.loading = false;
  }

  handleInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value.length === 1 && index < 3) {
      const nextInput = document.getElementById(`digit${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  }

  validatePin(): void {
    if (this.selectedProfileId == null) return;

    const pin = this.pinDigits.join('');
    if (pin.length !== 4) {
      this.errorMsg = 'Ingresa los 4 dígitos';
      return;
    }

    this.loading = true;
    this.perfilesService.validarPin(this.selectedProfileId, pin).subscribe({
      next: (perfilValidado) => {
        localStorage.setItem('perfilActivo', JSON.stringify(perfilValidado));
        this.router.navigate(['/home']);
      },
      error: () => {
        this.errorMsg = 'PIN incorrecto';
        this.loading = false;
        this.pinDigits = ['', '', '', ''];
        const firstInput = document.getElementById('digit0') as HTMLInputElement;
        if (firstInput) firstInput.focus();
      }
    });
  }
}
