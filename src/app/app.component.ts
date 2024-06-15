import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MainComponent} from './tabs/main/main.component'
import {MatTabsModule} from '@angular/material/tabs';
import { RulesComponent } from './tabs/rules/rules.component';
import { FormComponent } from './tabs/form/form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainComponent, MatTabsModule, RulesComponent, FormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tipovacka';
  protected tabIndex = 1;

  onTicketSubmit(event: boolean){
    if(event){
      this.tabIndex = 1;
    }
  }
}
