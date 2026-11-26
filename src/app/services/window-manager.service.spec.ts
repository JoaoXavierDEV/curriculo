import { TestBed } from '@angular/core/testing';
import { WindowManager } from './window-manager.service';

describe('WindowManager', () => {
  let wm: WindowManager;

  beforeEach(() => {
    wm = TestBed.inject(WindowManager);
  });

  it('começa sem janelas abertas', () => {
    expect(wm.running()).toEqual([]);
    expect(wm.focused()).toBeNull();
  });

  it('a última janela aberta fica com o foco', () => {
    wm.open('sobre');
    wm.open('projetos');
    expect(wm.running().map((win) => win.id)).toEqual(['sobre', 'projetos']);
    expect(wm.focused()).toBe('projetos');
    wm.focus('sobre');
    expect(wm.focused()).toBe('sobre');
  });

  it('o botão da taskbar minimiza a janela focada e restaura a minimizada', () => {
    wm.open('contato');
    wm.taskbarClick('contato');
    expect(wm.state('contato').minimized).toBe(true);
    expect(wm.focused()).toBeNull();
    wm.taskbarClick('contato');
    expect(wm.state('contato').minimized).toBe(false);
    expect(wm.focused()).toBe('contato');
  });

  it('fechar tira da taskbar e passa o foco adiante', () => {
    wm.open('sobre');
    wm.open('carreira');
    wm.close('carreira');
    expect(wm.running().map((win) => win.id)).toEqual(['sobre']);
    expect(wm.focused()).toBe('sobre');
  });

  it('ao abrir, mantém a janela dentro da área de trabalho', () => {
    wm.open('projetos', undefined, { w: 800, h: 500 });
    const { x, y } = wm.state('projetos');
    expect(x).toBeGreaterThanOrEqual(8);
    expect(y).toBeGreaterThanOrEqual(8);
  });

  it('sobre.txt abre centralizado e no tamanho pedido, limitado à tela', () => {
    wm.open('sobre', undefined, { w: 1440, h: 864 });
    expect(wm.state('sobre')).toMatchObject({ x: 95, y: 65 });
    wm.close('sobre');
    const small = TestBed.inject(WindowManager);
    expect(small.state('sobre').open).toBe(false);
  });

  it('no celular, o app entra no histórico e o voltar fecha', () => {
    wm.openPhoneApp('formacao');
    expect(wm.phoneApp()).toBe('formacao');
    expect(location.hash).toBe('#formacao');
    history.replaceState(null, '', '/');
    wm.syncFromHistory();
    expect(wm.phoneApp()).toBeNull();
  });
});
