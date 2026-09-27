import { DestroyRef, Injectable, afterNextRender, inject } from '@angular/core';

function noopLimpeza(): void {
  return;
}

/**
 * Monta a cena Three.js de partículas neon do Hero.
 * O Three.js é carregado dinamicamente (chunk separado) para não inflar o
 * bundle inicial — importante por causa do budget de 500 kB.
 */
@Injectable({ providedIn: 'root' })
export class HeroSceneService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fabricas: (() => HTMLCanvasElement | null)[] = [];

  constructor() {
    afterNextRender({
      write: async () => {
        const limpezas: (() => void)[] = [];
        this.destroyRef.onDestroy(() => limpezas.forEach((limpar) => limpar()));
        for (const fabrica of this.fabricas) {
          const canvas = fabrica();
          if (!canvas) continue;
          const cleanup = await this.montar(canvas);
          limpezas.push(cleanup);
        }
        this.fabricas.length = 0;
      },
    });
  }

  /** Agende a cena 3D assim que o DOM do componente estiver renderizado (browser). */
  iniciarQuandoPronto(fabrica: () => HTMLCanvasElement | null): void {
    this.fabricas.push(fabrica);
  }

  async montar(canvas: HTMLCanvasElement): Promise<() => void> {
    const { Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, BufferAttribute, Points, PointsMaterial, Color } =
      await import('three');

    const cena = new Scene();
    const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 6;

    let renderizador: InstanceType<typeof WebGLRenderer>;
    try {
      renderizador = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return noopLimpeza;
    }
    renderizador.setSize(canvas.clientWidth, canvas.clientHeight);
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometria = new BufferGeometry();
    const contagem = 900;
    const posicoes = new Float32Array(contagem * 3);
    const cores = new Float32Array(contagem * 3);
    const corPink = new Color('#ff2e88');
    const corTeal = new Color('#00e5b0');
    for (let i = 0; i < contagem; i++) {
      posicoes[i * 3] = (Math.random() - 0.5) * 14;
      posicoes[i * 3 + 1] = (Math.random() - 0.5) * 8;
      posicoes[i * 3 + 2] = (Math.random() - 0.5) * 8;
      const cor = Math.random() > 0.5 ? corPink : corTeal;
      cores[i * 3] = cor.r;
      cores[i * 3 + 1] = cor.g;
      cores[i * 3 + 2] = cor.b;
    }
    geometria.setAttribute('position', new BufferAttribute(posicoes, 3));
    geometria.setAttribute('color', new BufferAttribute(cores, 3));

    const pontinhos = new Points(
      geometria,
      new PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.9 }),
    );
    cena.add(pontinhos);

    const redimensionar = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderizador.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', redimensionar);

    let mouseX = 0;
    let mouseY = 0;
    const noMouse = (e: PointerEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', noMouse);

    let rodando = true;
    const animar = () => {
      if (!rodando) return;
      requestAnimationFrame(animar);
      pontinhos.rotation.y += 0.0009;
      pontinhos.rotation.x += 0.0004;
      pontinhos.position.x += (mouseX * 0.35 - pontinhos.position.x) * 0.04;
      pontinhos.position.y += (-mouseY * 0.35 - pontinhos.position.y) * 0.04;
      renderizador.render(cena, camera);
    };
    animar();

    return () => {
      rodando = false;
      window.removeEventListener('resize', redimensionar);
      window.removeEventListener('pointermove', noMouse);
      renderizador.dispose();
      geometria.dispose();
      (pontinhos.material as InstanceType<typeof PointsMaterial>).dispose();
    };
  }
}