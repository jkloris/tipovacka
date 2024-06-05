import { Component } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CalcService } from '../../services/calc.service';
import { CommonModule } from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-form',
  standalone: true,
  imports: [MatFormFieldModule, CommonModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {

  constructor(private fb: FormBuilder, public calcService: CalcService){}

  form!: FormGroup
  ngOnInit(){
    this.form = this.fb.group({
      yourName: ['', Validators.required],
      totalWinner: ['', Validators.required],
      bestShooter: ['', Validators.required],
      matches: this.fb.group({})
    });

    const matchesGroup = this.form.get('matches') as FormGroup;
    
    this.calcService.getMatches().forEach(match => {
      const matchId = this.calcService.getMatchId(match);
      const matchGroup = this.fb.group({
        home: [''],
        away: ['']
      });

      matchesGroup.addControl(matchId, matchGroup);
    });

  
  }
  
  submit(){
    console.log(this.form.value)
  }


}
