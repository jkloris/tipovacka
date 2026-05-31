import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MainComponent} from './tabs/main/main.component'
import {MatTabsModule} from '@angular/material/tabs';
import { RulesComponent } from './tabs/rules/rules.component';
import { FormComponent } from './tabs/form/form.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './services/auth.service';
import { LoginDialogComponent } from './auth/login-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainComponent, MatTabsModule, RulesComponent, FormComponent, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tipovacka';
  protected tabIndex = 1;

  constructor(public auth: AuthService, private dialog: MatDialog) {}

  onTicketSubmit(event: boolean){
    if(event){
      this.tabIndex = 1;
    }
  }

  openLogin(): void {
    this.dialog.open(LoginDialogComponent, { width: '360px' });
  }

  logout(): void {
    this.auth.logout();
  }
}
