import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MyTicketComponent } from './my-ticket.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';

describe('MyTicketComponent', () => {
  let component: MyTicketComponent;
  let fixture: ComponentFixture<MyTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTicketComponent],
      providers: [
        {
          provide: ApiService,
          useValue: {
            getMyTicket: () =>
              of({
                winner1: '',
                top_scorer: '',
                player_name: 'Test',
                editable_matches: [],
              }),
          },
        },
        { provide: AuthService, useValue: { isLoggedIn: () => true } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyTicketComponent);
    component = fixture.componentInstance;
    await component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
