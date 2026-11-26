import { Component, computed, inject } from '@angular/core';
import { Settings, SettingsService } from '../services/settings.service';

interface Choice<T> {
  readonly value: T;
  readonly label: string;
}

interface Group<K extends keyof Settings = keyof Settings> {
  readonly key: K;
  readonly title: string;
  readonly hint: string;
  readonly choices: readonly Choice<Settings[K]>[];
}

/**
 * Painel de configurações: aparece no menu Iniciar (desktop) e como app no
 * celular. Cada grupo é um conjunto de rádios de verdade, então funciona com
 * teclado (setas) e leitor de tela.
 */
@Component({
  selector: 'app-settings-panel',
  template: `
    @for (group of groups; track group.key) {
      <fieldset class="group">
        <legend>{{ group.title }}</legend>
        <p class="hint">{{ group.hint }}</p>
        <div class="choices">
          @for (choice of group.choices; track choice.value) {
            <label class="choice">
              <input
                type="radio"
                [name]="'cfg-' + group.key"
                [value]="choice.value"
                [checked]="current()[group.key] === choice.value"
                (change)="pick(group.key, choice.value)"
              />
              <span>{{ choice.label }}</span>
            </label>
          }
        </div>
      </fieldset>
    }
    <button type="button" class="reset" (click)="settings.reset()">↺ restaurar padrão</button>
  `,
  styles: `
    :host {
      display: grid;
      gap: 1rem;
      font-size: 0.8rem;
    }
    .group {
      margin: 0;
      padding: 0;
      border: 0;
    }
    legend {
      padding: 0;
      color: var(--color-fg);
      font-weight: 700;
    }
    legend::before {
      content: '## ';
      color: var(--color-phosphor);
    }
    .hint {
      margin: 0.15rem 0 0.5rem;
      color: var(--color-muted);
      font-size: 0.72rem;
    }
    .choices {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .choice {
      position: relative;
      cursor: pointer;
    }
    .choice input {
      position: absolute;
      opacity: 0;
      inset: 0;
      margin: 0;
      cursor: pointer;
    }
    .choice span {
      display: inline-flex;
      align-items: center;
      min-height: 2.25rem;
      padding: 0 0.75rem;
      border: 1px solid var(--color-line-strong);
      background: var(--color-surface);
      color: var(--color-muted);
      transition:
        border-color 140ms ease,
        color 140ms ease,
        background-color 140ms ease,
        transform 160ms var(--ease-out);
    }
    .choice span::before {
      content: '( ) ';
      white-space: pre;
      color: var(--color-faint);
    }
    .choice input:checked + span {
      border-color: var(--color-phosphor);
      background: rgb(92 240 143 / 0.1);
      color: var(--color-fg);
    }
    .choice input:checked + span::before {
      content: '(•) ';
      color: var(--color-phosphor);
    }
    .choice input:focus-visible + span {
      outline: 2px solid var(--color-phosphor);
      outline-offset: 2px;
    }
    .choice:active span {
      transform: scale(0.97);
    }
    @media (hover: hover) and (pointer: fine) {
      .choice:hover span {
        color: var(--color-fg);
      }
    }
    .reset {
      justify-self: start;
      min-height: 2.25rem;
      padding: 0 0.75rem;
      border: 1px dashed var(--color-line-strong);
      background: transparent;
      color: var(--color-muted);
      font: inherit;
      cursor: pointer;
    }
    @media (hover: hover) and (pointer: fine) {
      .reset:hover {
        color: var(--color-fg);
        border-color: var(--color-muted);
      }
    }
  `,
})
export class SettingsPanel {
  protected readonly settings = inject(SettingsService);
  protected readonly current = computed(() => this.settings.settings());

  protected readonly groups: readonly Group[] = [
    {
      key: 'wallpaper',
      title: 'efeito matrix',
      hint: 'Caracteres animados no papel de parede.',
      choices: [
        { value: 'off', label: 'desligado' },
        { value: 'waves', label: 'ondas' },
        { value: 'rain', label: 'chuva' },
      ],
    },
    {
      key: 'crt',
      title: 'efeito crt',
      hint: 'Linhas de varredura de monitor antigo.',
      choices: [
        { value: 'off', label: 'desligado' },
        { value: 'subtle', label: 'sutil' },
        { value: 'strong', label: 'forte' },
      ],
    },
    {
      key: 'iconSize',
      title: 'ícones: tamanho',
      hint: 'Tamanho dos ícones da área de trabalho.',
      choices: [
        { value: 's', label: 'pequeno' },
        { value: 'm', label: 'médio' },
        { value: 'l', label: 'grande' },
      ],
    },
    {
      key: 'iconStyle',
      title: 'ícones: cor',
      hint: 'Cores das marcas ou tudo em verde fósforo.',
      choices: [
        { value: 'color', label: 'colorido' },
        { value: 'mono', label: 'fósforo' },
      ],
    },
  ] as const satisfies readonly Group[];

  protected pick(key: keyof Settings, value: Settings[keyof Settings]): void {
    this.settings.set(key, value as never);
  }
}
