import { TestBed } from '@angular/core/testing';
import { CalcService } from './calc.service';

describe('CalcService', () => {
  let service: CalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should build match id from team names', () => {
    expect(service.getMatchId('Germany', 'Scotland')).toBe('Germ:Scot');
  });
});
