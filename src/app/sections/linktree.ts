import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { loadAsciiKit } from '../ui/ascii-kit';
import { LINKTREE } from '../data/profile.data';
import { RevealDirective } from '../ui/reveal.directive';
import { SectionHeading } from '../ui/section-heading';

@Component({
  selector: 'app-linktree',
  imports: [SectionHeading, RevealDirective],
  template: `
    <section class="section" id="links" aria-labelledby="links-title">
      <div class="mx-auto max-w-xl" #column>
        <app-section-heading
          command="ls -la ~/links"
          title="Linktree"
          headingId="links-title"
          lede="Tudo que importa num lugar só. Clica, que não morde."
        />

        <ul class="grid gap-3">
          @for (link of links; track link.id; let i = $index) {
            <li [appReveal]="i">
              <a
                class="tree-link"
                [href]="link.href"
                [attr.target]="link.external ? '_blank' : null"
                [attr.rel]="link.external ? 'noopener noreferrer' : null"
              >
                <span class="tree-tag" aria-hidden="true">[{{ link.tag }}]</span>
                <span class="min-w-0 flex-1">
                  <span class="block font-medium text-fg">{{ link.label }}</span>
                  <span class="block truncate text-xs text-muted">{{ link.handle }}</span>
                </span>
                <span class="tree-arrow" aria-hidden="true">{{ link.external ? '↗' : '→' }}</span>
                @if (link.external) {
                  <span class="sr-only">(abre em nova aba)</span>
                }
              </a>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      isolation: isolate;
      background: var(--color-ground);
    }
    .tree-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-height: 3.75rem;
      padding: 0.7rem 1rem;
      border: 1px solid var(--color-line);
      background: var(--color-surface);
      text-decoration: none;
      transition:
        transform 160ms var(--ease-out),
        border-color 140ms ease,
        background-color 140ms ease;
    }
    .tree-link:active {
      transform: scale(0.985);
    }
    .tree-tag {
      flex: none;
      width: 3.2rem;
      color: var(--color-phosphor);
      font-weight: 700;
      text-align: center;
    }
    .tree-arrow {
      flex: none;
      color: var(--color-faint);
      transition:
        transform 200ms var(--ease-out),
        color 140ms ease;
    }
    @media (hover: hover) and (pointer: fine) {
      .tree-link:hover {
        border-color: var(--color-phosphor-dim);
        background: var(--color-surface-2);
      }
      .tree-link:hover .tree-arrow {
        color: var(--color-phosphor);
        transform: translateX(3px);
      }
    }
  `,
})
export class Linktree {
  protected readonly links = LINKTREE;

  private readonly column = viewChild.required<ElementRef<HTMLElement>>('column');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let destroy: (() => void) | null = null;
    let destroyed = false;

    inject(DestroyRef).onDestroy(() => {
      destroyed = true;
      destroy?.();
    });

    // Chuva de caracteres nas laterais; a coluna de links fica limpa.
    afterNextRender(() => {
      loadAsciiKit()
        .then(({ background, cascade }) => {
          if (destroyed) return;
          const handle = background(host, {
            preset: cascade,
            clear: this.column().nativeElement,
            ink: '--ascii-ink',
            opacity: 0.85,
            cursor: false,
          });
          destroy = () => handle.destroy();
        })
        .catch(() => {
          // Seção sem fundo animado.
        });
    });
  }
}
