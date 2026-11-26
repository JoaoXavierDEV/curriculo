import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('renderiza o nome como h1 acessível', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .match((req) => req.url.startsWith('https://api.github.com/'))
      .forEach((req) => req.flush([]));
    await fixture.whenStable();
    const h1 = (fixture.nativeElement as HTMLElement).querySelector('h1');
    expect(h1?.textContent).toContain('João Xavier');
  });

  it('tem todas as seções como apps do desktop', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .match((req) => req.url.startsWith('https://api.github.com/'))
      .forEach((req) => req.flush([]));
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    for (const id of ['sobre', 'projetos', 'experiencia', 'formacao', 'contato']) {
      expect(root.querySelector(`#${id}`), id).not.toBeNull();
    }
  });
});
