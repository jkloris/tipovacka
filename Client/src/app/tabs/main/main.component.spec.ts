import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MainComponent } from './main.component';
import { ApiService } from '../../services/api.service';
import { MatDialog } from '@angular/material/dialog';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainComponent],
      providers: [
        {
          provide: ApiService,
          useValue: {
            getLeaderboard: () => of([]),
            getMatches: () => of([]),
          },
        },
        { provide: MatDialog, useValue: { open: () => ({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
