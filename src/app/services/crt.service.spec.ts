import { TestBed } from '@angular/core/testing';
import { CrtService } from './crt.service';

describe('CrtService', () => {
  beforeEach(() => localStorage.clear());

  it('começa ligado e reflete no <html>', () => {
    const crt = TestBed.inject(CrtService);
    TestBed.tick();
    expect(crt.enabled()).toBe(true);
    expect(document.documentElement.dataset['crt']).toBe('on');
  });

  it('alterna e lembra a escolha', () => {
    const crt = TestBed.inject(CrtService);
    crt.toggle();
    TestBed.tick();
    expect(document.documentElement.dataset['crt']).toBe('off');
    expect(localStorage.getItem('jx.crt')).toBe('off');
  });

  it('respeita a escolha salva', () => {
    localStorage.setItem('jx.crt', 'off');
    expect(TestBed.inject(CrtService).enabled()).toBe(false);
  });
});
