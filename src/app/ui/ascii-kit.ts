/**
 * O kit do asciify-engine só é baixado no navegador, depois do primeiro render,
 * num chunk separado. Assim o bundle inicial fica leve e o conteúdo HTML nunca
 * espera pelo WebGL.
 */
export type AsciiKit = typeof import('asciify-engine/kit');

let kitPromise: Promise<AsciiKit> | null = null;

export function loadAsciiKit(): Promise<AsciiKit> {
  kitPromise ??= import('asciify-engine/kit');
  return kitPromise;
}

/** Alfabetos do "scramble": binário, ramp de densidade e hexadecimal. */
export const TERMINAL_ALPHABETS = ['01', '#%&@*+=-:.', '0123456789ABCDEF'];

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let offscreen: DOMRect[] | null = null;

/**
 * "Área livre" fora da tela: faz os papéis de parede cobrirem tudo, sem o meio vazio.
 * O kit pede o mesmo array a cada quadro, então ele é criado uma vez só.
 */
export const OFFSCREEN_CLEAR = (): DOMRect[] => (offscreen ??= [new DOMRect(-100, -100, 1, 1)]);
