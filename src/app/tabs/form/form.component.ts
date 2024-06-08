import { Component, EventEmitter, Output } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CalcService } from '../../services/calc.service';
import { CommonModule } from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailService } from '../../services/email.service';
@Component({
  selector: 'app-form',
  standalone: true,
  imports: [MatFormFieldModule, CommonModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {
  @Output() onSubmit: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private fb: FormBuilder, public calcService: CalcService, private emailService: EmailService){}

  form!: FormGroup
  ngOnInit(){
    this.form = this.fb.group({
      yourName: ['', Validators.required],
      winner1: ['', Validators.required],
      topStriker: ['', Validators.required],
      matches: this.fb.group({})
    });

    const matchesGroup = this.form.get('matches') as FormGroup;
    
    this.calcService.getMatches().forEach(match => {
      const matchId = this.calcService.getMatchId(match);
      const matchGroup = this.fb.group({
        homeScore: ['', Validators.required],
        awayScore: ['', Validators.required]
      });

      matchesGroup.addControl(matchId, matchGroup);
    });

  
  }
  
  
  async submit(event: Event){
    
    if(!this.form.valid){
      alert("Invalid form, please fill all the fields!");
      return
    }
    const suc = await this.emailService.sendEmail(event, JSON.stringify(this.form.value) );
    this.onSubmit.emit(suc);
  }


}
