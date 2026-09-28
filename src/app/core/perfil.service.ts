import { Injectable, signal } from '@angular/core';
import { Titulo } from './tmdb.service';

export interface Perfil {
  id: string;
  nome: string;
  cor: string;
}

const CHAVE_PERFIS = 'zecki1-vd-perfis';
const CHAVE_ATIVO = 'zecki1-vd-perfil-ativo';
const CORES_PERFIL = ['#ff2e88', '#00e5b0', '#7b61ff', '#ffb02e'];

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly perfisSinal = signal<Perfil[]>(this.lerPerfis());
  private readonly ativoSinal = signal<Perfil | null>(this.lerAtivo());

  readonly perfis = this.perfisSinal.asReadonly();
  readonly ativo = this.ativoSinal.asReadonly();

  private lerPerfis(): Perfil[] {
    const salvo = localStorage.getItem(CHAVE_PERFIS);
    if (!salvo) return [];
    try {
      const dados = JSON.parse(salvo) as Perfil[];
      return Array.isArray(dados) ? dados : [];
    } catch {
      return [];
    }
  }

  private gravarPerfis(perfis: Perfil[]): void {
    localStorage.setItem(CHAVE_PERFIS, JSON.stringify(perfis));
  }

  private lerAtivo(): Perfil | null {
    const id = localStorage.getItem(CHAVE_ATIVO);
    if (!id) return null;
    return this.lerPerfis().find((p) => p.id === id) ?? null;
  }

  criarPerfil(nome: string): Perfil {
    const perfil: Perfil = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      cor: CORES_PERFIL[this.perfisSinal().length % CORES_PERFIL.length],
    };
    const perfis = [...this.perfisSinal(), perfil];
    this.gravarPerfis(perfis);
    this.perfisSinal.set(perfis);
    this.selecionar(perfil.id);
    return perfil;
  }

  selecionar(id: string): void {
    const perfil = this.perfisSinal().find((p) => p.id === id);
    if (!perfil) return;
    localStorage.setItem(CHAVE_ATIVO, id);
    this.ativoSinal.set(perfil);
  }

  removerPerfil(id: string): void {
    const perfis = this.perfisSinal().filter((p) => p.id !== id);
    this.gravarPerfis(perfis);
    this.perfisSinal.set(perfis);
    if (this.ativoSinal()?.id === id) {
      localStorage.removeItem(CHAVE_ATIVO);
      this.ativoSinal.set(null);
    }
    localStorage.removeItem(this.chaveLista(id));
  }

  listaDe(id: string): Titulo[] {
    const salvo = localStorage.getItem(this.chaveLista(id));
    if (!salvo) return [];
    try {
      const dados = JSON.parse(salvo) as Titulo[];
      return Array.isArray(dados) ? dados : [];
    } catch {
      return [];
    }
  }

  salvarNaLista(id: string, titulo: Titulo): void {
    const atual = this.listaDe(id);
    const existe = atual.some((t) => t.id === titulo.id && t.tipo === titulo.tipo);
    const proxima = existe ? atual.filter((t) => !(t.id === titulo.id && t.tipo === titulo.tipo)) : [...atual, titulo];
    localStorage.setItem(this.chaveLista(id), JSON.stringify(proxima));
  }

  estaNaLista(id: string, titulo: Titulo): boolean {
    return this.listaDe(id).some((t) => t.id === titulo.id && t.tipo === titulo.tipo);
  }

  private chaveLista(id: string): string {
    return `zecki1-vd-lista-${id}`;
  }
}