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
import { AsciiDivider } from './ui/ascii-divider';
import { BootScreen } from './ui/boot-screen';
import { CrtOverlay } from './ui/crt-overlay';
import { StatusBar } from './ui/status-bar';

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
    AsciiDivider,
    BootScreen,
    CrtOverlay,
    StatusBar,
  ],
  template: `
    <app-site-header />
    <main id="conteudo" tabindex="-1">
      <app-hero />
      <app-linktree />
      <app-ascii-divider index="02" label="projetos" />
      <app-projects />
      <app-ascii-divider index="03" label="carreira" />
      <app-experience />
      <app-ascii-divider index="04" label="formacao" />
      <app-education />
      <app-ascii-divider index="05" label="outros" />
      <app-side-projects />
      <app-ascii-divider index="06" label="contato" />
      <app-contact />
    </main>
    <app-site-footer />
    <app-status-bar />
    <app-crt-overlay />
    <app-boot-screen />
  `,
  styles: `
    main {
      display: block;
      outline: none;
    }
  `,
})
export class App {}
