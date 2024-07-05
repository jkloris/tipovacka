import { Component, EventEmitter, Output } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CalcService } from '../../services/calc.service';
import { CommonModule } from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailService } from '../../services/email.service';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import { Match } from '../../models/match';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [MatFormFieldModule, CommonModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatSelectModule, MatListModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {
  @Output() onSubmit: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private fb: FormBuilder, public calcService: CalcService, private emailService: EmailService){}
  tickets = new FormControl({
    value: this.calcService.getPlayers()[0].ticket,
    disabled: false
  });

  public matches: Match[] =[]
  form!: FormGroup
  ngOnInit(){
    this.form = this.fb.group({
      yourName: ['', Validators.required],
      // winner2: ['', Validators.required],
      // topStriker: ['', Validators.required],
      matches: this.fb.group({})
    });

    const matchesGroup = this.form.get('matches') as FormGroup;
    
    this.calcService.getMatches().forEach(match => {
      if(match.homeScore < 0){

        const matchId = this.calcService.getMatchId(match);
        const matchGroup = this.fb.group({
          homeScore: ['', Validators.required],
          awayScore: ['', Validators.required]
        });
        
        matchesGroup.addControl(matchId, matchGroup);
        this.matches.push(match)
      } 
    });
    
    console.log(this.matches)
  
  }
  
  
  async submit(event: Event){
    
    if(!this.form.valid){
      alert("Invalid form, please fill all the fields!");
      return
    }
    this.onSubmit.emit(true);
    const suc = await this.emailService.sendEmail(event, JSON.stringify(this.form.value) );
  }


  getMatches(){
    let matches: Match[] = [];
    for(const [key, value] of Object.entries(this.form.get('matches')?.value)){

      matches.push(new Match(key.split(':')[0], key.split(':')[1]))
    }
    return matches
  }

}
