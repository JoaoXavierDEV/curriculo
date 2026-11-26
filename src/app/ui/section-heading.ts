import { Component, input } from '@angular/core';
import { ScrambleDirective } from './scramble.directive';
import { TypeOnViewDirective } from './type-on-view.directive';

@Component({
  selector: 'app-section-heading',
  imports: [ScrambleDirective, TypeOnViewDirective],
  template: `
    <p class="section-kicker">
      <span class="prompt" appTypeOnView>{{ command() }}</span>
    </p>
    <h2 class="section-title" [id]="headingId()">
      <span class="hash" aria-hidden="true">#&nbsp;</span><span appScramble>{{ title() }}</span>
    </h2>
    @if (lede()) {
      <p class="section-lede">{{ lede() }}</p>
    }
  `,
  host: { class: 'block mb-10 md:mb-14' },
})
export class SectionHeading {
  readonly command = input.required<string>();
  readonly title = input.required<string>();
  readonly headingId = input.required<string>();
  readonly lede = input<string>();
}
