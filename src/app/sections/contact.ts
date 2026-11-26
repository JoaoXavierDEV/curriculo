import { Component } from '@angular/core';
import { LINKS, PROFILE, SOCIALS } from '../data/profile.data';
import { SectionHeading } from '../ui/section-heading';

@Component({
  selector: 'app-contact',
  imports: [SectionHeading],
  template: `
    <section class="section" id="contato" aria-labelledby="contato-title">
      <app-section-heading
        command="./contato.sh"
        title="Bora conversar?"
        headingId="contato-title"
        lede="Proposta, freela, dúvida, meme bom: pode mandar. Respondo mais rápido no WhatsApp."
      />

      <div class="grid gap-4 @lg:grid-cols-2">
        <a class="contact" [href]="links.email.href">
          <span class="contact-kicker">e-mail</span>
          <span class="contact-value">{{ profile.email }}</span>
        </a>
        <a class="contact" [href]="links.whatsapp.href" target="_blank" rel="noopener noreferrer">
          <span class="contact-kicker"
            >WhatsApp <span class="sr-only">(abre em nova aba)</span></span
          >
          <span class="contact-value">{{ profile.whatsappDisplay }}</span>
        </a>
      </div>

      <ul class="mt-8 flex flex-wrap gap-2" aria-label="Redes sociais">
        @for (social of socials; track social.id) {
          <li>
            <a class="btn" [href]="social.href" target="_blank" rel="noopener noreferrer">
              <span class="text-phosphor" aria-hidden="true">[{{ social.tag }}]</span>
              {{ social.label }}
              <span class="sr-only">(abre em nova aba)</span>
            </a>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .contact {
      display: grid;
      gap: 0.35rem;
      padding: 1.4rem 1.25rem;
      border: 1px solid var(--color-line-strong);
      background: var(--color-surface);
      text-decoration: none;
      transition:
        transform 160ms var(--ease-out),
        border-color 140ms ease;
    }
    .contact:active {
      transform: scale(0.985);
    }
    .contact-kicker {
      font-size: 0.78rem;
      color: var(--color-muted);
    }
    .contact-kicker::before {
      content: '> ';
      color: var(--color-phosphor);
    }
    .contact-value {
      font-size: clamp(1rem, 0.9rem + 0.6vw, 1.25rem);
      font-weight: 700;
      color: var(--color-fg);
      overflow-wrap: anywhere;
    }
    @media (hover: hover) and (pointer: fine) {
      .contact:hover {
        border-color: var(--color-phosphor);
      }
      .contact:hover .contact-value {
        color: var(--color-phosphor);
      }
    }
  `,
})
export class Contact {
  protected readonly profile = PROFILE;
  protected readonly links = LINKS;
  protected readonly socials = SOCIALS;
}
