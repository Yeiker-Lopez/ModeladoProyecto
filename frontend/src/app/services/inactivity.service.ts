import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

@Injectable({
    providedIn: 'root',
})
export class InactivityService {
    private timeout: any;
    private readonly timeoutLimit = 6 * 60 * 60 * 1000; // 6 horas

    constructor(
        private loginService: LoginService,
        private router: Router,
        private zone: NgZone
    ) { }

    startMonitoring() {
        this.checkInitialInactivity();

        this.resetTimer();

        const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach((event) => {
            window.addEventListener(event, () => this.resetTimer(), true);
        });
    }

    private resetTimer() {
        clearTimeout(this.timeout);

        // Guardar timestamp de última actividad
        localStorage.setItem('lastActivity', Date.now().toString());

        this.timeout = setTimeout(() => this.handleInactivity(), this.timeoutLimit);
    }

    private checkInitialInactivity() {
        const lastActivityStr = localStorage.getItem('lastActivity');
        const lastActivity = lastActivityStr ? parseInt(lastActivityStr, 10) : null;

        if (lastActivity && (Date.now() - lastActivity > this.timeoutLimit)) {
            this.handleInactivity();
        }
    }

    private handleInactivity() {
        const userId = this.loginService.getUserId();
        localStorage.removeItem('lastActivity');
        if (userId) {
            this.loginService.logout(userId).subscribe(() => {
                this.router.navigate(['/login']);
            });
        } else {
            this.router.navigate(['/login']);
        }
    }
}
