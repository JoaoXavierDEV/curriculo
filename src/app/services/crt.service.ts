import { Service, effect, signal } from '@angular/core';

const STORAGE_KEY = 'jx.crt';

function readPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

/**
 * Liga e desliga o "monitor CRT" (scanlines, ruído, brilho de fósforo, rastro
 * do cursor). A escolha fica salva no navegador e vira `data-crt` no `<html>`,
 * que o CSS usa para ligar os efeitos.
 */
@Service()
export class CrtService {
  readonly enabled = signal(readPreference());

  constructor() {
    effect(() => {
      const on = this.enabled();
      document.documentElement.dataset['crt'] = on ? 'on' : 'off';
      try {
        localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
      } catch {
        // Sem armazenamento: vale só para esta visita.
      }
    });
  }

  toggle(): void {
    this.enabled.update((on) => !on);
  }
}
