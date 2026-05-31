import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainComponent } from './tabs/main/main.component';
import { MatTabsModule } from '@angular/material/tabs';
import { RulesComponent } from './tabs/rules/rules.component';
import { MyTicketComponent } from './tabs/my-ticket/my-ticket.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './services/auth.service';
import { LoginDialogComponent } from './auth/login-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MainComponent,
    MatTabsModule,
    RulesComponent,
    MyTicketComponent,
    MatButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'tipovacka';
  protected tabIndex = 1;

  @ViewChild(MyTicketComponent) myTicket?: MyTicketComponent;

  constructor(public auth: AuthService, private dialog: MatDialog) {}

  onTabChange(index: number): void {
    this.tabIndex = index;
    if (index === 0 && this.auth.isLoggedIn()) {
      this.myTicket?.loadTicket();
    }
  }

  openLogin(): void {
    const ref = this.dialog.open(LoginDialogComponent, { width: '360px' });
    ref.afterClosed().subscribe((ok) => {
      if (ok && this.tabIndex === 0) {
        this.myTicket?.loadTicket();
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
