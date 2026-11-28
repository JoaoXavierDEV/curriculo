import { Component } from '@angular/core';
import { LINKS, PROFILE, SIDE_PROJECTS } from '../data/profile.data';
import { AsciiArch } from '../ui/ascii-arch';
import { TypeOnViewDirective } from '../ui/type-on-view.directive';

@Component({
  selector: 'app-about',
  imports: [AsciiArch, TypeOnViewDirective],
  template: `
    <section class="section" id="sobre" aria-labelledby="sobre-title">
      <div class="about-layout">
        <div class="about-main">
          <p class="section-kicker"><span class="prompt" appTypeOnView>whoami</span></p>
          <h2 id="sobre-title" class="about-name">{{ profile.name }}</h2>
          <p class="about-role">
            <span class="cursor">{{ profile.role }}</span>
          </p>
          <p class="about-bio">{{ profile.bio }}</p>

          <dl class="about-facts">
            <div>
              <dt>local</dt>
              <dd>{{ profile.location }} · remoto</dd>
            </div>
            <div>
              <dt>agora</dt>
              <dd>Dev de Software Pleno na NST E-Business</dd>
            </div>
            <div>
              <dt>contato</dt>
              <dd>
                <a class="link" [href]="links.email.href">{{ profile.email }}</a>
              </dd>
            </div>
          </dl>

          <h3 class="about-sub">stack</h3>
          <ul class="flex flex-wrap gap-2" aria-label="Stack principal">
            @for (tech of profile.stack; track tech) {
              <li class="tag">{{ tech }}</li>
            }
          </ul>

          <h3 class="about-sub">também toco</h3>
          <ul class="grid gap-3">
            @for (project of sideProjects; track project.name) {
              <li class="about-side">
                <a
                  class="link font-bold"
                  [href]="project.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ project.name }} <span aria-hidden="true">↗</span
                  ><span class="sr-only">(abre em nova aba)</span></a
                >
                <span class="text-muted"> · {{ project.description }}</span>
              </li>
            }
          </ul>

          <p class="about-footer">
            <span class="prompt">exit 0</span> · feito com Angular,
            <a class="link" href="https://asciify.org/" target="_blank" rel="noopener noreferrer"
              >asciify-engine<span class="sr-only"> (abre em nova aba)</span></a
            >
            e café.
          </p>
        </div>
        <app-ascii-arch class="about-cat" />
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      container-type: inline-size;
    }
    /* Gato à direita só quando a janela tem espaço (desktop largo). */
    .about-cat {
      display: none;
    }
    @container (min-width: 900px) {
      .about-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 2.5rem;
        align-items: start;
      }
      .about-cat {
        display: block;
        position: sticky;
        top: 1rem;
      }
    }
    .about-name {
      margin: 0.25rem 0 0;
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(2.6rem, 2rem + 3cqi, 3.6rem);
      line-height: 1;
      color: var(--color-phosphor);
    }
    .about-role {
      margin: 0.5rem 0 0;
      font-weight: 500;
      font-size: 1.05rem;
    }
    .about-bio {
      max-width: 56ch;
      margin: 1rem 0 0;
      color: var(--color-muted);
      text-wrap: pretty;
    }
    .about-facts {
      display: grid;
      gap: 0.35rem;
      margin: 1.25rem 0 0;
      font-size: 0.86rem;
    }
    .about-facts div {
      display: grid;
      grid-template-columns: 8ch 1fr;
      gap: 1ch;
    }
    .about-facts dt {
      color: var(--color-faint);
    }
    .about-facts dt::after {
      content: ':';
    }
    .about-facts dd {
      margin: 0;
    }
    .about-sub {
      margin: 1.75rem 0 0.75rem;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--color-muted);
    }
    .about-sub::before {
      content: '## ';
      color: var(--color-phosphor);
    }
    .about-side {
      font-size: 0.86rem;
    }
    .about-footer {
      margin: 2rem 0 0;
      padding-top: 1rem;
      border-top: 1px dashed var(--color-line);
      font-size: 0.75rem;
      color: var(--color-muted);
    }
  `,
})
export class About {
  protected readonly profile = PROFILE;
  protected readonly links = LINKS;
  protected readonly sideProjects = SIDE_PROJECTS;
}
