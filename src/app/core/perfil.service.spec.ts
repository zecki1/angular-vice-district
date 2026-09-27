import { TestBed } from '@angular/core/testing';
import { PerfilService } from './perfil.service';

const TITULO = {
  id: 1,
  nome: 'Duna',
  ano: '2021',
  descricao: 'Uma saga.',
  cartaz: 'http://img/duna.jpg',
  tipo: 'filme' as const,
};

describe('PerfilService', () => {
  let service: PerfilService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(PerfilService);
  });

  it('deve criar um perfil e torná-lo ativo', () => {
    const perfil = service.criarPerfil('Ana');
    expect(perfil.nome).toBe('Ana');
    expect(service.ativo()?.id).toBe(perfil.id);
    expect(service.perfis()).toHaveSize(1);
  });

  it('deve selecionar um perfil existente', () => {
    const ana = service.criarPerfil('Ana');
    const bruno = service.criarPerfil('Bruno');
    service.selecionar(ana.id);
    expect(service.ativo()?.nome).toBe('Ana');
    expect(service.perfis()).toHaveSize(2);
    expect(bruno.nome).toBe('Bruno');
  });

  it('deve salvar e remover títulos da lista do perfil', () => {
    const perfil = service.criarPerfil('Ana');
    service.salvarNaLista(perfil.id, TITULO);
    expect(service.listaDe(perfil.id)).toHaveSize(1);
    expect(service.estaNaLista(perfil.id, TITULO)).toBeTrue();

    service.salvarNaLista(perfil.id, TITULO);
    expect(service.listaDe(perfil.id)).toHaveSize(0);
    expect(service.estaNaLista(perfil.id, TITULO)).toBeFalse();
  });

  it('deve manter listas independentes por perfil', () => {
    const ana = service.criarPerfil('Ana');
    const bruno = service.criarPerfil('Bruno');
    service.salvarNaLista(ana.id, TITULO);
    expect(service.listaDe(bruno.id)).toHaveSize(0);
  });

  it('deve remover perfil e sua lista', () => {
    const perfil = service.criarPerfil('Ana');
    service.salvarNaLista(perfil.id, TITULO);
    service.removerPerfil(perfil.id);
    expect(service.perfis()).toHaveSize(0);
    expect(service.ativo()).toBeNull();
    expect(localStorage.getItem(`zecki1-vd-lista-${perfil.id}`)).toBeNull();
  });

  it('deve restaurar o perfil ativo persistido', () => {
    const perfil = service.criarPerfil('Ana');
    localStorage.setItem('zecki1-vd-perfil-ativo', perfil.id);
    const novoServico = TestBed.inject(PerfilService);
    expect(novoServico.ativo()?.id).toBe(perfil.id);
  });

  it('deve tolerar JSON corrompido no localStorage', () => {
    localStorage.setItem('zecki1-vd-perfis', '{quebrado');
    localStorage.setItem('zecki1-vd-lista-x', '{também');
    const novoServico = TestBed.inject(PerfilService);
    expect(novoServico.perfis()).toEqual([]);
    expect(novoServico.listaDe('x')).toEqual([]);
  });

  it('deve tratar JSON válido que não é lista como vazio', () => {
    localStorage.setItem('zecki1-vd-perfis', '{"nope": true}');
    localStorage.setItem('zecki1-vd-lista-x', '{"nope": true}');
    const novoServico = TestBed.inject(PerfilService);
    expect(novoServico.perfis()).toEqual([]);
    expect(novoServico.listaDe('x')).toEqual([]);
  });

  it('deve ignorar seleção de perfil inexistente', () => {
    service.selecionar('qualquer-id');
    expect(service.ativo()).toBeNull();
  });

  it('deve ignorar perfil ativo órfão no localStorage', () => {
    localStorage.setItem('zecki1-vd-perfil-ativo', 'absentelocal');
    const novoServico = TestBed.inject(PerfilService);
    expect(novoServico.ativo()).toBeNull();
  });
});