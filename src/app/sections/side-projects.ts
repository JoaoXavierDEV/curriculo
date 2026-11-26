import { Component } from '@angular/core';
import { SIDE_PROJECTS } from '../data/profile.data';
import { RevealDirective } from '../ui/reveal.directive';
import { SectionHeading } from '../ui/section-heading';

@Component({
  selector: 'app-side-projects',
  imports: [SectionHeading, RevealDirective],
  template: `
    <section class="section" id="outros" aria-labelledby="outros-title">
      <app-section-heading
        command="ps aux | grep joao"
        title="Outros projetos"
        headingId="outros-title"
        lede="O que roda em produção quando eu não estou no emprego."
      />

      <ul class="grid gap-6 md:grid-cols-2">
        @for (project of projects; track project.name; let i = $index) {
          <li class="frame side" [appReveal]="i">
            <pre class="ascii side-art" aria-hidden="true">{{ project.art }}</pre>
            <div class="min-w-0">
              <h3 class="side-title">{{ project.name }}</h3>
              <p class="side-desc">{{ project.description }}</p>
              <a class="link" [href]="project.url" target="_blank" rel="noopener noreferrer"
                >{{ project.domain }} <span aria-hidden="true">↗</span
                ><span class="sr-only">(abre em nova aba)</span></a
              >
            </div>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .side {
      display: grid;
      gap: 1.25rem;
      padding: 1.5rem 1.25rem;
    }
    @media (min-width: 640px) {
      .side {
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
      }
    }
    .side-art {
      font-size: 0.78rem;
      line-height: 1.15;
      color: var(--color-phosphor);
      opacity: 0.85;
    }
    .side-title {
      margin: 0;
      font-family: var(--font-display);
      font-weight: 400;
      font-size: 2rem;
      line-height: 1;
    }
    .side-desc {
      margin: 0.5rem 0 0.75rem;
      font-size: 0.86rem;
      color: var(--color-muted);
      text-wrap: pretty;
    }
  `,
})
export class SideProjects {
  protected readonly projects = SIDE_PROJECTS;
}
