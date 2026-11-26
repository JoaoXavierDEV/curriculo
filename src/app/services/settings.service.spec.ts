import { TestBed } from '@angular/core/testing';
import { DEFAULT_SETTINGS, SettingsService } from './settings.service';

describe('SettingsService', () => {
  beforeEach(() => localStorage.clear());

  it('começa no padrão e reflete no <html>', () => {
    const service = TestBed.inject(SettingsService);
    TestBed.tick();
    expect(service.settings()).toEqual(DEFAULT_SETTINGS);
    expect(document.documentElement.dataset['crt']).toBe('subtle');
  });

  it('salva a escolha e restaura o padrão', () => {
    const service = TestBed.inject(SettingsService);
    service.set('crt', 'strong');
    service.set('iconStyle', 'mono');
    TestBed.tick();
    expect(document.documentElement.dataset['iconStyle']).toBe('mono');
    expect(JSON.parse(localStorage.getItem('jx.settings.v1')!).crt).toBe('strong');
    service.reset();
    expect(service.settings()).toEqual(DEFAULT_SETTINGS);
  });

  it('ignora valores inválidos salvos', () => {
    localStorage.setItem('jx.settings.v1', JSON.stringify({ crt: 'neon', wallpaper: 'rain' }));
    const service = TestBed.inject(SettingsService);
    expect(service.settings().crt).toBe('subtle');
    expect(service.settings().wallpaper).toBe('rain');
  });
});
