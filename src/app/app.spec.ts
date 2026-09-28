import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('cria o componente raiz', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('monta o shell e o router-outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const html = (fixture.nativeElement as HTMLElement).innerHTML;

    expect(html).toContain('app-shell');
    expect(html).toContain('router-outlet');
    expect(html).not.toContain('<h1');
  });
});
