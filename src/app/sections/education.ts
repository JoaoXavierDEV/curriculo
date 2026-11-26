import { Component } from '@angular/core';
import { EDUCATION } from '../data/profile.data';
import { RevealDirective } from '../ui/reveal.directive';
import { SectionHeading } from '../ui/section-heading';

@Component({
  selector: 'app-education',
  imports: [SectionHeading, RevealDirective],
  template: `
    <section class="section" id="formacao" aria-labelledby="formacao-title">
      <app-section-heading
        command="cat ~/formacao/*.txt"
        title="Formação acadêmica"
        headingId="formacao-title"
      />

      <ul class="grid gap-6 md:grid-cols-3">
        @for (item of items; track item.file; let i = $index) {
          <li class="frame frame-corners edu" [appReveal]="i">
            <span class="frame-label" aria-hidden="true">{{ item.file }}</span>
            <p class="edu-years">
              <time>{{ item.start }}</time> → <time>{{ item.end }}</time>
            </p>
            <h3 class="edu-course">{{ item.course }}</h3>
            <p class="edu-school">{{ item.institution }}</p>
            <p class="edu-status"><span aria-hidden="true">[✓]</span> concluído</p>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .edu {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      padding: 1.7rem 1.25rem 1.2rem;
    }
    .edu-years {
      margin: 0;
      font-size: 0.78rem;
      color: var(--color-muted);
    }
    .edu-course {
      margin: 0.2rem 0 0;
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.4;
      text-wrap: balance;
    }
    .edu-school {
      margin: 0;
      color: var(--color-phosphor);
    }
    .edu-status {
      margin: auto 0 0;
      padding-top: 0.9rem;
      font-size: 0.78rem;
      color: var(--color-muted);
    }
  `,
})
export class EducationSection {
  protected readonly items = EDUCATION;
}
