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
