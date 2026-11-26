import { DOCUMENT } from '@angular/common';
import { Service, effect, inject, signal } from '@angular/core';

export type WallpaperMode = 'off' | 'waves' | 'rain';
export type CrtMode = 'off' | 'subtle' | 'strong';
export type IconSize = 's' | 'm' | 'l';
export type IconStyle = 'color' | 'mono';

export interface Settings {
  readonly wallpaper: WallpaperMode;
  readonly crt: CrtMode;
  readonly iconSize: IconSize;
  readonly iconStyle: IconStyle;
}

export const DEFAULT_SETTINGS: Settings = {
  wallpaper: 'waves',
  crt: 'subtle',
  iconSize: 'm',
  iconStyle: 'color',
};

const STORAGE_KEY = 'jx.settings.v1';

const OPTIONS: { readonly [K in keyof Settings]: readonly Settings[K][] } = {
  wallpaper: ['off', 'waves', 'rain'],
  crt: ['off', 'subtle', 'strong'],
  iconSize: ['s', 'm', 'l'],
  iconStyle: ['color', 'mono'],
};

function read(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<
      Record<string, unknown>
    >;
    const pick = <K extends keyof Settings>(key: K): Settings[K] =>
      (OPTIONS[key] as readonly unknown[]).includes(raw[key])
        ? (raw[key] as Settings[K])
        : DEFAULT_SETTINGS[key];
    return {
      wallpaper: pick('wallpaper'),
      crt: pick('crt'),
      iconSize: pick('iconSize'),
      iconStyle: pick('iconStyle'),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Preferências visuais do "sistema": papel de parede Matrix, CRT e ícones.
 * Ficam salvas no navegador e viram atributos `data-*` no `<html>`, que o
 * CSS usa. O papel de parede é lido pelos componentes que o desenham.
 */
@Service()
export class SettingsService {
  readonly settings = signal<Settings>(read());
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const current = this.settings();
      const root = this.document.documentElement;
      root.setAttribute('data-crt', current.crt);
      root.setAttribute('data-icon-size', current.iconSize);
      root.setAttribute('data-icon-style', current.iconStyle);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      } catch {
        // Sem armazenamento: vale só nesta visita.
      }
    });
  }

  set<K extends keyof Settings>(key: K, value: Settings[K]): void {
    this.settings.update((current) => ({ ...current, [key]: value }));
  }

  reset(): void {
    this.settings.set(DEFAULT_SETTINGS);
  }
}
