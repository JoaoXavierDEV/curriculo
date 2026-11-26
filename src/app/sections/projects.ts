import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GithubReposService } from '../services/github-repos.service';
import { LINKS } from '../data/profile.data';
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
  protected readonly repos = computed(() => this.github.list().repos);
  protected readonly source = computed(() => this.github.list().source);
  protected readonly githubUrl = LINKS.github.href;
  protected readonly skeletons = [0, 1, 2, 3, 4, 5];
}
