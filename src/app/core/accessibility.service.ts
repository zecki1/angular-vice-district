import { Injectable, signal } from '@angular/core';

/** Modos de filtro visual (igual aos outros sites) + extras do hub. */
export type ModoVisao =
  | 'nenhum'
  | 'monocromatico'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'baixo-contraste';

const CHAVES = {
  visao: 'zecki1-vd-visao',
  dislexia: 'zecki1-vd-dislexia',
  altoContraste: 'zecki1-vd-alto-contraste',
  linhasGuia: 'zecki1-vd-linhas-guia',
  reduzMovimento: 'zecki1-vd-reduz-movimento',
  tamanhoFonte: 'zecki1-vd-fonte',
} as const;

type Chave = keyof typeof CHAVES;

const MIN_FONTE = 12;
const MAX_FONTE = 26;
const PASSO_FONTE = 1;

/** Limites do controle de tamanho de fonte. */
export const LIMITES_FONTE = { min: MIN_FONTE, max: MAX_FONTE, passo: PASSO_FONTE } as const;

/** Classe `.modo-*` aplicada no `<html>` para cada modo de visão. */
const CLASSE_VISAO: Record<ModoVisao, string> = {
  nenhum: '',
  monocromatico: 'modo-monocromatico',
  protanopia: 'modo-protanopia',
  deuteranopia: 'modo-deuteranopia',
  tritanopia: 'modo-tritanopia',
  'baixo-contraste': 'modo-baixo-contraste',
};

const MODOS_VALIDOS: ModoVisao[] = [
  'nenhum',
  'monocromatico',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'baixo-contraste',
];

interface EstadoToggle {
  chave: Chave;
  sinal: ReturnType<typeof signal<boolean>>;
  classe: string;
}

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  readonly visao = signal<ModoVisao>(this.lerVisao());
  readonly dislexia = signal(this.lerBool('dislexia'));
  readonly altoContraste = signal(this.lerBool('altoContraste'));
  readonly linhasGuia = signal(this.lerBool('linhasGuia'));
  readonly reduzMovimento = signal(this.lerBool('reduzMovimento'));
  readonly tamanhoFonte = signal(this.lerNumero('tamanhoFonte', MIN_FONTE));

  private readonly toggles: Record<string, EstadoToggle> = {
    dislexia: { chave: 'dislexia', sinal: this.dislexia, classe: 'font-dyslexic' },
    altoContraste: {
      chave: 'altoContraste',
      sinal: this.altoContraste,
      classe: 'alto-contraste',
    },
    linhasGuia: {
      chave: 'linhasGuia',
      sinal: this.linhasGuia,
      classe: 'linhas-guia',
    },
    reduzMovimento: {
      chave: 'reduzMovimento',
      sinal: this.reduzMovimento,
      classe: 'reduz-movimento',
    },
  };

  constructor() {
    this.aplicarNoDom();
  }

  definirVisao(modo: ModoVisao): void {
    this.visao.set(modo);
    this.gravar('visao', modo);
    this.sincronizarClasseVisao();
  }

  alternar(nome: 'dislexia' | 'altoContraste' | 'linhasGuia' | 'reduzMovimento'): void {
    const t = this.toggles[nome];
    if (!t) return;
    const novo = !t.sinal();
    t.sinal.set(novo);
    this.gravarBool(t.chave, novo);
    this.aplicarClasse(t.classe, novo);
  }

  aumentarFonte(): void {
    this.ajustarFonte(PASSO_FONTE);
  }

  diminuirFonte(): void {
    this.ajustarFonte(-PASSO_FONTE);
  }

  definirFonte(valor: number): void {
    const prox = Math.min(MAX_FONTE, Math.max(MIN_FONTE, Math.round(valor)));
    this.tamanhoFonte.set(prox);
    this.gravarNumero('tamanhoFonte', prox);
    document.documentElement.style.fontSize = `${prox}px`;
  }

  restaurarPreferencias(): void {
    this.definirVisao('nenhum');
    this.definirToggle('dislexia', false);
    this.definirToggle('altoContraste', false);
    this.definirToggle('linhasGuia', false);
    this.definirToggle('reduzMovimento', false);
    this.ajustarFonte(MIN_FONTE - this.tamanhoFonte());
  }

  private definirToggle(
    nome: 'dislexia' | 'altoContraste' | 'linhasGuia' | 'reduzMovimento',
    valor: boolean,
  ): void {
    const t = this.toggles[nome];
    if (!t) return;
    t.sinal.set(valor);
    this.gravarBool(t.chave, valor);
    this.aplicarClasse(t.classe, valor);
  }

  private aplicarNoDom(): void {
    const raiz = document.documentElement;
    raiz.classList.remove(...Object.values(CLASSE_VISAO).filter(Boolean));
    this.sincronizarClasseVisao();
    for (const t of Object.values(this.toggles)) {
      this.aplicarClasse(t.classe, t.sinal());
    }
    raiz.style.fontSize = `${this.tamanhoFonte()}px`;
  }

  private ajustarFonte(delta: number): void {
    const prox = Math.min(MAX_FONTE, Math.max(MIN_FONTE, this.tamanhoFonte() + delta));
    this.tamanhoFonte.set(prox);
    this.gravarNumero('tamanhoFonte', prox);
    document.documentElement.style.fontSize = `${prox}px`;
  }

  private sincronizarClasseVisao(): void {
    const raiz = document.documentElement;
    raiz.classList.remove(...Object.values(CLASSE_VISAO).filter(Boolean));
    const classe = CLASSE_VISAO[this.visao()];
    if (classe) raiz.classList.add(classe);
  }

  private aplicarClasse(classe: string, ativo: boolean): void {
    if (!classe) return;
    document.documentElement.classList.toggle(classe, ativo);
  }

  private lerVisao(): ModoVisao {
    const v = localStorage.getItem(CHAVES.visao);
    return v && (MODOS_VALIDOS as string[]).includes(v) ? (v as ModoVisao) : 'nenhum';
  }

  private lerBool(chave: Chave): boolean {
    return localStorage.getItem(CHAVES[chave]) === '1';
  }

  private lerNumero(chave: Chave, padrao: number): number {
    const cru = localStorage.getItem(CHAVES[chave]);
    if (cru === null) return padrao;
    const n = Number(cru);
    return Number.isFinite(n) && n >= MIN_FONTE && n <= MAX_FONTE ? n : padrao;
  }

  private gravar(chave: Chave, valor: unknown): void {
    localStorage.setItem(CHAVES[chave], String(valor));
  }

  private gravarBool(chave: Chave, valor: boolean): void {
    localStorage.setItem(CHAVES[chave], valor ? '1' : '0');
  }

  private gravarNumero(chave: Chave, valor: number): void {
    localStorage.setItem(CHAVES[chave], String(valor));
  }
}