/**
 * Monta um `MediaQueryList` mínimo controlado para testes Karma.
 * - `reduzido`: força `matches` para consults de `prefers-reduced-motion`.
 * - `queries`: mapeia a query exata para um valor `matches` específico.
 */
export function mockMatchMedia(
  opcoes: { reduzido?: boolean; queries?: Record<string, boolean> } = {},
): MediaQueryList {
  const queries = opcoes.queries ?? {};
  const usouReduzido = opcoes.reduzido !== undefined;
  const list: MediaQueryList = {
    get matches() {
      if (queries[list.media] !== undefined) return queries[list.media];
      if (usouReduzido) return opcoes.reduzido as boolean;
      if (list.media.includes('prefers-reduced-motion')) return false;
      return false;
    },
    media: '',
    onchange: null as unknown as MediaQueryList['onchange'],
    addListener: () => {
      /* mock */
    },
    removeListener: () => {
      /* mock */
    },
    addEventListener: () => {
      /* mock */
    },
    removeEventListener: () => {
      /* mock */
    },
    dispatchEvent: () => false,
  };
  return list;
}

export function stubMatchMedia(matches: boolean): MediaQueryList {
  return mockMatchMedia({ reduzido: matches });
}