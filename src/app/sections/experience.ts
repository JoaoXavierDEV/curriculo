import { Component } from '@angular/core';
import { EXPERIENCE } from '../data/profile.data';
import { RevealDirective } from '../ui/reveal.directive';
import { SectionHeading } from '../ui/section-heading';

@Component({
  selector: 'app-experience',
  imports: [SectionHeading, RevealDirective],
  template: `
    <section class="section" id="experiencia" aria-labelledby="experiencia-title">
      <app-section-heading
        command="tree ~/carreira"
        title="Experiência"
        headingId="experiencia-title"
        lede="Onde eu passei os dias escrevendo C#, Angular e resolvendo coisa que ninguém queria resolver."
      />

      <ol class="grid gap-10">
        @for (job of jobs; track job.slug; let i = $index) {
          <li class="job" [appReveal]="i">
            <div class="job-head">
              <h3 class="job-company">
                <span class="text-phosphor" aria-hidden="true">{{ job.slug }}/</span>
                <span class="sr-only">{{ job.company }}</span>
                <span class="job-company-name" aria-hidden="true">{{ job.company }}</span>
              </h3>
              <p class="job-where">
                {{ job.location }} · {{ job.duration }}
                @if (job.current) {
                  <span class="now">agora</span>
                }
              </p>
            </div>

            <ol class="roles">
              @for (role of job.roles; track role.title) {
                <li class="role">
                  <p class="role-title">{{ role.title }}</p>
                  <p class="role-meta">
                    <time>{{ role.start }}</time> — <time>{{ role.end }}</time> · {{ role.kind }}
                  </p>
                  @if (role.note) {
                    <p class="role-note">{{ role.note }}</p>
                  }
                </li>
              }
            </ol>
          </li>
        }
      </ol>
    </section>
  `,
  styles: `
    .job-head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.25rem 1rem;
    }
    .job-company {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
    }
    .job-company-name {
      margin-left: 0.6rem;
      color: var(--color-fg);
      font-weight: 500;
    }
    .job-where {
      margin: 0;
      font-size: 0.8rem;
      color: var(--color-muted);
    }
    .now {
      margin-left: 0.5rem;
      padding: 0 0.4rem;
      border: 1px solid var(--color-phosphor-dim);
      color: var(--color-phosphor);
      font-size: 0.72rem;
    }
    /* Árvore desenhada com box-drawing: ├── nos itens e └── no último. */
    .roles {
      margin: 0.75rem 0 0;
      padding: 0;
      list-style: none;
    }
    .role {
      position: relative;
      padding: 0.35rem 0 0.9rem 2.6rem;
    }
    .role::before {
      content: '├──';
      position: absolute;
      left: 0;
      top: 0.35rem;
      color: var(--color-line-strong);
    }
    .role:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 0.5ch;
      top: 1.9rem;
      bottom: 0;
      border-left: 1px solid var(--color-line-strong);
    }
    .role:last-child::before {
      content: '└──';
    }
    .role-title {
      margin: 0;
      font-weight: 500;
    }
    .role-meta,
    .role-note {
      margin: 0.15rem 0 0;
      font-size: 0.82rem;
      color: var(--color-muted);
    }
    .role-note::before {
      content: '// ';
      color: var(--color-faint);
    }
  `,
})
export class ExperienceSection {
  protected readonly jobs = EXPERIENCE;
}
