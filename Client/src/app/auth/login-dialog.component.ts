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
    <h2 mat-dialog-title>Prihlásenie</h2>
    <mat-dialog-content>
      <p>Pre odoslanie tiketu sa prihlás.</p>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Používateľské meno</mat-label>
        <input matInput [(ngModel)]="username" name="username" />
      </mat-form-field>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Heslo</mat-label>
        <input matInput type="password" [(ngModel)]="password" name="password" />
      </mat-form-field>
      @if (error) {
        <p class="error">Nesprávne prihlasovacie údaje.</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Zrušiť</button>
      <button mat-raised-button color="primary" (click)="login()">Prihlásiť</button>
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
  error = false;

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private auth: AuthService
  ) {}

  async login(): Promise<void> {
    this.error = false;
    const ok = await this.auth.login(this.username.trim(), this.password);
    if (ok) {
      this.dialogRef.close(true);
    } else {
      this.error = true;
    }
  }
}
