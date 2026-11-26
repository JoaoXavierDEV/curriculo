import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GithubReposService } from '../services/github-repos.service';
import { CASE_STUDIES } from '../data/case-studies';
import { LINKS } from '../data/profile.data';
import { repoSlug } from '../data/projects';
import { OsNavigator } from '../os/os-navigator.service';
import { RevealDirective } from '../ui/reveal.directive';
import { SectionHeading } from '../ui/section-heading';

@Component({
  selector: 'app-projects',
  imports: [SectionHeading, RevealDirective, DatePipe],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects {
  private readonly github = inject(GithubReposService);

  protected readonly loading = this.github.loading;
  private readonly nav = inject(OsNavigator);

  /** Projetos privados com texto próprio (o Salomé) aparecem fixos no topo. */
  protected readonly featured = CASE_STUDIES.filter((study) => study.private);
  protected readonly others = computed(() => this.github.list().repos);
  protected readonly source = computed(() => this.github.list().source);
  protected readonly githubUrl = LINKS.github.href;
  protected readonly skeletons = [0, 1, 2, 3, 4, 5];

  protected slugOf(name: string): string {
    return repoSlug(name);
  }

  /** Clique normal abre a janela; Ctrl/⌘/botão do meio seguem o link de verdade. */
  protected open(event: MouseEvent, slug: string): void {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    this.nav.open('projeto', { slug });
  }
}
