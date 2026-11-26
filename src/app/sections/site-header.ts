import { Component } from '@angular/core';

interface NavItem {
  readonly href: string;
  readonly label: string;
}

@Component({
  selector: 'app-site-header',
  host: { role: 'banner' },
  template: `
    <a
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[70] focus:bg-phosphor focus:px-3 focus:py-2 focus:text-ground"
      href="#conteudo"
      >Pular para o conteúdo</a
    >
    <div class="mx-auto flex h-full max-w-6xl items-center gap-6 px-5 md:px-8">
      <a href="#topo" class="shrink-0 text-sm font-medium text-fg no-underline">
        <span class="text-phosphor">~/</span>joaoxavier.dev
      </a>
      <nav
        aria-label="Seções"
        class="nav-scroll -mr-5 ml-auto overflow-x-auto pr-5 md:mr-0 md:pr-0"
      >
        <ul class="flex items-center gap-1 text-sm">
          @for (item of items; track item.href) {
            <li>
              <a class="nav-link" [href]="item.href">{{ item.label }}</a>
            </li>
          }
        </ul>
      </nav>
    </div>
  `,
  styles: `
    :host {
      position: sticky;
      top: 0;
      z-index: 50;
      display: block;
      height: var(--header-h);
      background: color-mix(in oklab, var(--color-ground) 82%, transparent);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--color-line);
    }
    .nav-scroll {
      scrollbar-width: none;
      mask-image: linear-gradient(
        to right,
        transparent,
        #000 1rem,
        #000 calc(100% - 1.5rem),
        transparent
      );
    }
    .nav-scroll::-webkit-scrollbar {
      display: none;
    }
    .nav-link {
      display: inline-flex;
      align-items: center;
      min-height: 2.75rem;
      padding: 0 0.6rem;
      color: var(--color-muted);
      text-decoration: none;
      white-space: nowrap;
      transition: color 140ms ease;
    }
    .nav-link::before {
      content: './';
      color: var(--color-faint);
    }
    @media (hover: hover) and (pointer: fine) {
      .nav-link:hover {
        color: var(--color-phosphor);
      }
    }
    @media (min-width: 768px) {
      .nav-scroll {
        mask-image: none;
      }
    }
  `,
})
export class SiteHeader {
  protected readonly items: readonly NavItem[] = [
    { href: '#links', label: 'links' },
    { href: '#projetos', label: 'projetos' },
    { href: '#experiencia', label: 'experiência' },
    { href: '#formacao', label: 'formação' },
    { href: '#contato', label: 'contato' },
  ];
}
