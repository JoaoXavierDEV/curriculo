import { Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { prefersReducedMotion } from './ascii-kit';

const COLS = 44;
const ROWS = 35;

interface Node {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly title: string;
  readonly sub: string;
  /** Brilho da borda ao receber um pacote (decai a cada quadro). */
  glow: number;
}

interface Edge {
  readonly from: Node;
  readonly to: Node;
  readonly cells: readonly (readonly [number, number])[];
  readonly packets: { pos: number; back: boolean }[];
  rate: number;
  /** Requisições por segundo exibidas ao lado da seta. */
  rps: number;
  /** Onde fica o rótulo de req/s: no começo ou no fim da seta (trechos verticais). */
  readonly label: 'start' | 'end';
}

const node = (id: string, x: number, y: number, w: number, title: string, sub: string): Node => ({
  id,
  x,
  y,
  w,
  title,
  sub,
  glow: 0,
});

/**
 * Decoração do "sobre" no desktop: um mapa de arquitetura em ASCII, no estilo
 * dos diagramas animados de docs. Clientes Angular e Flutter chamam a API
 * ASP.NET Core pela Azure, que fala com SQL Server, Redis e Service Bus;
 * pacotes correm pelas setas e as métricas mudam ao vivo.
 * Puramente visual; com "reduzir movimento" fica parado.
 */
@Component({
  selector: 'app-ascii-arch',
  template: `<canvas aria-hidden="true"></canvas>`,
  styles: `
    :host {
      display: block;
    }

    canvas {
      display: block;
      max-width: 100%;
      height: auto;
      border: 1px solid var(--color-line-strong);
      border-radius: 6px;
      background: #050706;
    }
  `,
})
export class AsciiArch {
  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const canvas = host.querySelector('canvas');
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const css = getComputedStyle(host);
      const font = css.getPropertyValue('--font-mono').trim() || 'monospace';
      const color = (name: string, fallback: string) =>
        css.getPropertyValue(name).trim() || fallback;
      const bright = color('--color-phosphor', '#5cf08f');
      const dim = color('--color-phosphor-dim', '#2e8a52');
      const fg = color('--color-fg', '#d9e2dc');
      const muted = color('--color-muted', '#93a199');
      const faint = color('--color-faint', '#84918a');
      const amber = color('--color-amber', '#f0c674');

      const size = 12;
      ctx.font = `${size}px ${font}`;
      const cw = Math.ceil(ctx.measureText('─').width);
      const ch = Math.ceil(size * 1.25);
      const pad = 10;
      const width = COLS * cw + pad * 2;
      const height = ROWS * ch + pad * 2;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.style.width = `${width}px`;
      // Em telas estreitas (celular) o canvas encolhe mantendo a proporção.
      canvas.style.aspectRatio = `${width} / ${height}`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.scale(dpr, dpr);
      ctx.font = `${size}px ${font}`;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      /** Centro da célula (x, y), em px. */
      const cx = (x: number) => pad + x * cw + cw / 2;
      const cy = (y: number) => pad + y * ch + ch / 2;

      /** Escreve um caractere por célula: tudo fica na grade, sem desalinhar. */
      const text = (x: number, y: number, value: string, fill: string, alpha = 1) => {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = fill;
        [...value].forEach((glyph, i) => ctx.fillText(glyph, cx(x + i), cy(y)));
        ctx.globalAlpha = 1;
      };

      // ── Diagrama ─────────────────────────────────────────────────────
      const angular = node('ng', 1, 3, 18, 'Angular', 'web · SPA');
      const flutter = node('fl', 25, 3, 18, 'Flutter', 'android · ios');
      const front = node('fd', 11, 11, 22, 'Azure Front Door', 'cdn · waf');
      const api = node('api', 9, 19, 26, 'ASP.NET Core API', '3 pods · .NET 10');
      const sql = node('sql', 0, 27, 13, 'SQL Server', 'primary');
      const redis = node('rd', 15, 27, 12, 'Redis', 'cache');
      const bus = node('bus', 29, 27, 15, 'Service Bus', 'filas');
      const nodes = [angular, flutter, front, api, sql, redis, bus];

      const edges: Edge[] = [];
      const connect = (
        from: Node,
        to: Node,
        rate: number,
        rps: number,
        label: 'start' | 'end' = 'start',
      ) => {
        const sx = from.x + Math.floor(from.w / 2);
        const sy = from.y + 4;
        const ex = to.x + Math.floor(to.w / 2);
        const ey = to.y - 1;
        const mid = Math.floor((sy + ey) / 2);
        const cells: [number, number][] = [];
        for (let y = sy; y <= mid; y++) cells.push([sx, y]);
        const step = Math.sign(ex - sx);
        if (step !== 0) for (let x = sx + step; x !== ex + step; x += step) cells.push([x, mid]);
        for (let y = mid + 1; y <= ey; y++) cells.push([ex, y]);
        edges.push({ from, to, cells, packets: [], rate, rps, label });
      };
      connect(angular, front, 0.05, 820);
      connect(flutter, front, 0.035, 410);
      connect(front, api, 0.07, 1230);
      connect(api, sql, 0.04, 640, 'end');
      connect(api, redis, 0.06, 980, 'end');
      connect(api, bus, 0.025, 120, 'end');

      const drawBox = (n: Node) => {
        const glow = Math.min(n.glow, 1);
        const left = cx(n.x) - cw / 2 + 1;
        const top = cy(n.y);
        const w = (n.w - 1) * cw + cw - 2;
        const h = cy(n.y + 3) - top;
        ctx.globalAlpha = 0.65 + glow * 0.35;
        ctx.strokeStyle = glow > 0.05 ? bright : dim;
        ctx.lineWidth = 1;
        ctx.fillStyle = '#050706';
        ctx.beginPath();
        ctx.roundRect(left + 0.5, top + 0.5, w, h, 4);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
        const title = n.title.slice(0, n.w - 2);
        text(n.x + Math.floor((n.w - title.length) / 2), n.y + 1, title, fg);
        const sub = n.sub.slice(0, n.w - 2);
        text(n.x + Math.floor((n.w - sub.length) / 2), n.y + 2, sub, muted);
      };

      /** Seta: linha contínua da borda de baixo de um nó até a de cima do outro. */
      const drawEdge = (e: Edge) => {
        ctx.strokeStyle = dim;
        ctx.fillStyle = dim;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const [fx] = e.cells[0];
        ctx.moveTo(Math.round(cx(fx)) + 0.5, cy(e.from.y + 3));
        for (const [x, y] of e.cells) ctx.lineTo(Math.round(cx(x)) + 0.5, Math.round(cy(y)) + 0.5);
        const [lx] = e.cells[e.cells.length - 1];
        const tip = cy(e.to.y);
        ctx.lineTo(Math.round(cx(lx)) + 0.5, tip - 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(Math.round(cx(lx)) + 0.5, tip);
        ctx.lineTo(Math.round(cx(lx)) - 3.5, tip - 5);
        ctx.lineTo(Math.round(cx(lx)) + 4.5, tip - 5);
        ctx.closePath();
        ctx.fill();
      };

      let p99 = 42;
      let deploy = 128;
      let frameCount = 0;

      const draw = () => {
        ctx.clearRect(0, 0, width, height);

        // Cabeçalho e rodapé com métricas.
        text(0, 0, 'production · brazil-south', muted);
        text(COLS - 9, 0, '● healthy', bright);
        const total = edges[2].rps;
        text(0, 1, `p99 ${p99}ms · ${(total / 1000).toFixed(2)}k rps`, faint);
        text(0, ROWS - 2, `$ git push → deploy #${deploy} `, faint);
        text(30, ROWS - 2, '✓ passed', bright);
        text(0, ROWS - 1, `  ci: build · test · deploy`, faint, 0.8);

        // Setas.
        edges.forEach(drawEdge);
        for (const e of edges) {
          const [lx, ly] = e.label === 'start' ? e.cells[0] : e.cells[e.cells.length - 2];
          text(lx + 2, ly, `${e.rps}/s`, faint, 0.85);
        }

        nodes.forEach(drawBox);

        // Pacotes: ida brilhante, volta (resposta) em âmbar.
        ctx.shadowColor = bright;
        for (const e of edges) {
          for (const p of e.packets) {
            const i = Math.floor(p.pos);
            const cell = e.cells[p.back ? e.cells.length - 1 - i : i];
            if (!cell) continue;
            ctx.shadowBlur = 8;
            text(cell[0], cell[1], p.back ? '◆' : '●', p.back ? amber : bright);
            ctx.shadowBlur = 0;
          }
        }
      };

      const update = () => {
        frameCount++;
        for (const e of edges) {
          if (Math.random() < e.rate) e.packets.push({ pos: 0, back: Math.random() < 0.35 });
          for (const p of e.packets) p.pos += 0.45;
          const arrived = e.packets.filter((p) => p.pos >= e.cells.length);
          for (const p of arrived) (p.back ? e.from : e.to).glow = 1;
          e.packets.splice(0, e.packets.length, ...e.packets.filter((p) => p.pos < e.cells.length));
        }
        for (const n of nodes) n.glow *= 0.9;
        if (frameCount % 30 === 0) {
          p99 = Math.max(28, Math.min(71, p99 + Math.round((Math.random() - 0.5) * 8)));
          for (const e of edges)
            e.rps = Math.max(40, Math.round(e.rps * (0.94 + Math.random() * 0.12)));
        }
        if (frameCount % 600 === 0) deploy++;
      };

      if (prefersReducedMotion()) {
        draw();
        return;
      }

      let frame = 0;
      let last = 0;
      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        if (document.hidden || now - last < 33) return;
        last = now;
        update();
        draw();
      };
      frame = requestAnimationFrame(tick);
      destroyRef.onDestroy(() => cancelAnimationFrame(frame));
    });
  }
}
