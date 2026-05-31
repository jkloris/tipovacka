import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CalcService } from '../../services/calc.service';
import { CommonModule } from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { MatchDto } from '../../models/api.models';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../../auth/login-dialog.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [MatFormFieldModule, CommonModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatSelectModule, MatListModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit {
  @Output() onSubmit = new EventEmitter<boolean>();
  constructor(
    private fb: FormBuilder,
    public calcService: CalcService,
    private api: ApiService,
    public auth: AuthService,
    private dialog: MatDialog
  ) {}

  public matches: MatchDto[] = [];
  form!: FormGroup;

  async ngOnInit() {
    this.form = this.fb.group({
      yourName: ['', Validators.required],
      matches: this.fb.group({})
    });

    const matchesGroup = this.form.get('matches') as FormGroup;
    this.matches = await firstValueFrom(this.api.getOpenMatches());

    this.matches.forEach(match => {
      const matchId = match.match_id;
      const matchGroup = this.fb.group({
        homeScore: ['', Validators.required],
        awayScore: ['', Validators.required]
      });
      matchesGroup.addControl(matchId, matchGroup);
    });
  }

  async ensureLoggedIn(): Promise<boolean> {
    if (this.auth.isLoggedIn()) {
      return true;
    }
    const ref = this.dialog.open(LoginDialogComponent, { width: '360px' });
    return (await firstValueFrom(ref.afterClosed())) === true;
  }

  async submit(event: Event) {
    event.preventDefault();

    if (!this.form.valid) {
      alert('Invalid form, please fill all the fields!');
      return;
    }

    if (!(await this.ensureLoggedIn())) {
      return;
    }

    try {
      await firstValueFrom(
        this.api.submitTicket({
          yourName: this.form.value.yourName,
          matches: this.form.value.matches,
        })
      );
      alert('Ticket was submitted successfully!');
      this.onSubmit.emit(true);
    } catch {
      alert('Failed to submit ticket. Please try again.');
    }
  }
}
