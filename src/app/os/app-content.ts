import { Component, input } from '@angular/core';
import { AppId } from '../data/apps';
import { About } from '../sections/about';
import { Contact } from '../sections/contact';
import { EducationSection } from '../sections/education';
import { ExperienceSection } from '../sections/experience';
import { Projects } from '../sections/projects';

/** O conteúdo de cada app, igual na janela do desktop e na tela do celular. */
@Component({
  selector: 'app-content',
  imports: [About, Projects, ExperienceSection, EducationSection, Contact],
  template: `
    @switch (app()) {
      @case ('sobre') {
        <app-about />
      }
      @case ('projetos') {
        <app-projects />
      }
      @case ('carreira') {
        <app-experience />
      }
      @case ('formacao') {
        <app-education />
      }
      @case ('contato') {
        <app-contact />
      }
    }
  `,
  host: { class: 'block @container' },
})
export class AppContent {
  readonly app = input.required<AppId>();
}
