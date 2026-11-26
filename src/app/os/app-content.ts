import { Component, input } from '@angular/core';
import { AppId } from '../data/apps';
import { About } from '../sections/about';
import { Contact } from '../sections/contact';
import { EducationSection } from '../sections/education';
import { ExperienceSection } from '../sections/experience';
import { Projects } from '../sections/projects';
import { Trash } from '../sections/trash';
import { SettingsPanel } from './settings-panel';

/** O conteúdo de cada app, igual na janela do desktop e na tela do celular. */
@Component({
  selector: 'app-content',
  imports: [About, Projects, ExperienceSection, EducationSection, Contact, Trash, SettingsPanel],
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
      @case ('lixeira') {
        <app-trash />
      }
      @case ('config') {
        <section class="section" aria-labelledby="config-title">
          <h2 id="config-title" class="sr-only">Configurações</h2>
          <app-settings-panel />
        </section>
      }
    }
  `,
  host: { class: 'block @container' },
})
export class AppContent {
  readonly app = input.required<AppId>();
}
