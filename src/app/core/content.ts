/** Conteúdo do site. Separar do template deixa a narrativa editável sem tocar em markup. */

export interface Character {
  id: string;
  nome: string;
  papel: string;
  descricao: string;
  imagem: string;
  cor: string;
}

export interface Location {
  id: string;
  nome: string;
  regiao: string;
  descricao: string;
  imagem: string;
}

export interface PrologoBloco {
  texto: string;
  imagem: string;
}

const img = (seed: string, w = 1200, h = 800): string =>
  `https://picsum.photos/seed/${seed}/${w}/${h}.webp`;

export const HERO_IMAGEM = img('vd-hero', 1920, 1080);

export const PROLOGO: PrologoBloco[] = [
  {
    texto:
      'Vice District não é uma cidade. É um acordo entre quem ficou e quem saiu. ' +
      'Aqui o sol não nasce — ele é negociado, hora a hora, por quem controla o céu.',
    imagem: img('vd-prologo-1'),
  },
  {
    texto:
      'Três Borders, uma fronteira e o som de um motor que nunca desliga. ' +
      'Enquanto o lado de lá dorme, o distrito respira em turnos: quem entra, ' +
      'quem sai, e quem decide o preço da noite.',
    imagem: img('vd-prologo-2'),
  },
];

export const PERSONAGENS: Character[] = [
  {
    id: 'vera',
    nome: 'Vera Calhoun',
    papel: 'A Broker',
    descricao:
      'Mede o distrito em amanheceres e mentiras. Sabe o preço de cada coisa ' +
      'antes de sair do leito — e cobra caro o que o dia seguinte tenta levar.',
    imagem: img('vd-char-vera', 900, 1200),
    cor: '#ff4d2e',
  },
  {
    id: 'bo',
    nome: 'Bo Tanager',
    papel: 'O Mecânico',
    descricao:
      'Mantém um motor vivo com peças de três motos diferentes. Fala pouco, ' +
      'conserta tudo e sabe exatamente onde o dono escondeu o dinheiro.',
    imagem: img('vd-char-bo', 900, 1200),
    cor: '#2ad4a8',
  },
  {
    id: 'ines',
    nome: 'Inês Belmonte',
    papel: 'A Operadora',
    descricao:
      'Conecta quem precisa a quem tem. Nunca aparece nas fotos, ' +
      'aparece em todos os álbuns — e cobra comissão em silêncio.',
    imagem: img('vd-char-ines', 900, 1200),
    cor: '#ffc93c',
  },
];

export const LOCAIS: Location[] = [
  {
    id: 'setor-7',
    nome: 'Setor Sete',
    regiao: 'Zona industrial',
    descricao: 'Onde o asfalto ferve. Galpões com a luz sempre acesa.',
    imagem: img('vd-loc-setor7', 1200, 900),
  },
  {
    id: 'margem',
    nome: 'Margem Norte',
    regiao: 'Fronteira',
    descricao: 'A última ponte antes do nada. Carros param aqui, pessoas não.',
    imagem: img('vd-loc-margem', 1200, 900),
  },
  {
    id: 'mercado',
    nome: 'Mercado Abissal',
    regiao: 'Centro submerso',
    descricao: 'Um mercado inteiro sob o nível da rua, iluminado por lâmpadas de neon.',
    imagem: img('vd-loc-mercado', 1200, 900),
  },
  {
    id: 'mirante',
    nome: 'Torre Mirante',
    regiao: 'Distrito alto',
    descricao: 'O único ponto de onde se vê o sol. É sempre ocupado.',
    imagem: img('vd-loc-mirante', 1200, 900),
  },
];

export const NEWSLETTER_SLUG = 'gta-campaign';
