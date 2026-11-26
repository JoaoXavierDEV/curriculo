import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/**
 * Retrato em ASCII gerado no build (scripts/prepare-portrait.py + npm run ascii):
 * um SVG em que cada caractere tem a cor do pixel de origem, por isso o rosto
 * continua legível mesmo pequeno. No hover, uma varredura de CRT passa por cima.
 */
@Component({
  selector: 'app-hero-portrait',
  imports: [NgOptimizedImage],
  template: `
    <figure class="portrait frame frame-corners">
      <span class="frame-label" aria-hidden="true">portrait.svg | 96 colunas</span>
      <div class="portrait-screen">
        <img
          ngSrc="/portrait.svg"
          width="597"
          height="768"
          priority
          alt="Retrato do João Xavier desenhado com caracteres ASCII verdes"
        />
        <span class="portrait-sweep" aria-hidden="true"></span>
      </div>
      <figcaption class="portrait-caption">
        <span class="text-phosphor" aria-hidden="true">●</span> online · 0 pixels, só caractere
      </figcaption>
    </figure>
  `,
  styleUrl: './hero-portrait.css',
})
export class HeroPortrait {}
