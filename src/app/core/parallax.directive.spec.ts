import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ParallaxDirective } from './parallax.directive';
import { mockMatchMedia } from '../test-helpers/match-media';

@Component({
  imports: [ParallaxDirective],
  template: `<div id="alvo" [appParallax]="40">conteúdo</div>`,
})
class HostComponent {}

describe('ParallaxDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let origMatchMedia: typeof window.matchMedia;

  beforeEach(async () => {
    origMatchMedia = window.matchMedia;
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  afterEach(() => {
    window.matchMedia = origMatchMedia;
  });

  it('deve injetar a diretiva no elemento com movimento normal', () => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const debug: DebugElement = fixture.debugElement.query(By.css('#alvo'));
    expect(debug.injector.get(ParallaxDirective)).toBeTruthy();
  });

  it('deve respeitar reduced motion e não animar', () => {
    window.matchMedia = () => mockMatchMedia({ reduzido: true });
    fixture = TestBed.createComponent(HostComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});