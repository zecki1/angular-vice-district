import { TestBed } from '@angular/core/testing';
import { Footer } from './footer';

describe('Footer', () => {
  it('deve renderizar marca, ano e links', async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
    }).compileComponents();
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('VICE DISTRICT');
    expect(compiled.textContent).toContain(String(fixture.componentInstance.ano));
    expect(compiled.querySelectorAll('.rodape-acoes a').length).toBe(2);
  });
});