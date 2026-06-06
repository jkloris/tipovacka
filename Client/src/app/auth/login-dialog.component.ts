import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ registerMode ? 'Registrácia' : 'Prihlásenie' }}</h2>
    <mat-dialog-content>
      <p *ngIf="!registerMode">Pre odoslanie tiketu sa prihlás.</p>
      <p *ngIf="registerMode">Zaregistruj nový účet a počkaj na potvrdenie administrátorom.</p>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Používateľské meno</mat-label>
        <input matInput [(ngModel)]="username" name="username" />
      </mat-form-field>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Heslo</mat-label>
        <input matInput type="password" [(ngModel)]="password" name="password" />
      </mat-form-field>
      <p *ngIf="error" class="error">{{ errorMessage }}</p>
      <p *ngIf="success" class="success">Registrácia bola odoslaná. Čakajte na schválenie.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Zrušiť</button>
      <button mat-button (click)="toggleMode()">
        {{ registerMode ? 'Máte účet? Prihlásiť' : 'Zaregistrovať sa' }}
      </button>
      <button mat-raised-button color="primary" (click)="submit()">
        {{ registerMode ? 'Registrovať' : 'Prihlásiť' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
        display: block;
      }
      .error {
        color: #c62828;
      }
    `,
  ],
})
export class LoginDialogComponent {
  username = '';
  password = '';
  registerMode = false;
  error = false;
  success = false;
  errorMessage = '';

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private auth: AuthService
  ) {}

  toggleMode(): void {
    this.registerMode = !this.registerMode;
    this.error = false;
    this.success = false;
    this.errorMessage = '';
  }

  async submit(): Promise<void> {
    this.error = false;
    this.success = false;
    this.errorMessage = '';

    if (this.registerMode) {
      const ok = await this.auth.register(this.username.trim(), this.password);
      if (ok) {
        this.success = true;
      } else {
        this.error = true;
        this.errorMessage = 'Registrácia sa nepodarila. Skúste iné meno.';
      }
      return;
    }

    const ok = await this.auth.login(this.username.trim(), this.password);
    if (ok) {
      this.dialogRef.close(true);
    } else {
      this.error = true;
      this.errorMessage = 'Nesprávne prihlasovacie údaje.';
    }
  }
}
