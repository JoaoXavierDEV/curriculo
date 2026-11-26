import { Component } from '@angular/core';
import { Contact } from './sections/contact';
import { EducationSection } from './sections/education';
import { ExperienceSection } from './sections/experience';
import { Hero } from './sections/hero';
import { Linktree } from './sections/linktree';
import { Projects } from './sections/projects';
import { SideProjects } from './sections/side-projects';
import { SiteFooter } from './sections/site-footer';
import { SiteHeader } from './sections/site-header';

@Component({
  selector: 'app-root',
  imports: [
    SiteHeader,
    Hero,
    Linktree,
    Projects,
    ExperienceSection,
    EducationSection,
    SideProjects,
    Contact,
    SiteFooter,
  ],
  template: `
    <app-site-header />
    <main id="conteudo" tabindex="-1">
      <app-hero />
      <app-linktree />
      <app-projects />
      <app-experience />
      <app-education />
      <app-side-projects />
      <app-contact />
    </main>
    <app-site-footer />
  `,
  styles: `
    main {
      display: block;
      outline: none;
    }
  `,
})
export class App {}
