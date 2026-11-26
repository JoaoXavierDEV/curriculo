import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../app.routes';
import { WindowManager } from '../services/window-manager.service';
import { OsNavigator } from './os-navigator.service';
import { Title } from '@angular/platform-browser';

describe('OsNavigator', () => {
  let router: Router;
  let wm: WindowManager;
  let nav: OsNavigator;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    router = TestBed.inject(Router);
    wm = TestBed.inject(WindowManager);
    nav = TestBed.inject(OsNavigator);
  });

  it('a URL abre a janela e define título e description', async () => {
    await router.navigateByUrl('/carreira');
    expect(wm.state('carreira').open).toBe(true);
    expect(wm.focused()).toBe('carreira');
    expect(TestBed.inject(Title).getTitle()).toBe('Experiência · João Xavier');
  });

  it('/projetos/salome abre a janela do projeto', async () => {
    await router.navigateByUrl('/projetos/salome');
    expect(wm.focused()).toBe('projeto');
    expect(wm.projectSlug()).toBe('salome');
    expect(TestBed.inject(Title).getTitle()).toBe('Salomé · João Xavier');
  });

  it('a página inicial abre o sobre.txt', async () => {
    await router.navigateByUrl('/');
    expect(wm.focused()).toBe('sobre');
  });

  it('fechar a janela volta a URL para a janela que fica em foco', async () => {
    await router.navigateByUrl('/');
    nav.open('formacao');
    await new Promise((resolve) => setTimeout(resolve));
    expect(router.url).toBe('/formacao');
    nav.close('formacao');
    await new Promise((resolve) => setTimeout(resolve));
    expect(router.url).toBe('/sobre');
  });

  it('no celular, abrir empilha a rota e voltar desfaz', async () => {
    nav.mode.set('phone');
    await router.navigateByUrl('/');
    nav.open('contato');
    await new Promise((resolve) => setTimeout(resolve));
    expect(wm.phoneApp()).toBe('contato');
  });
});
