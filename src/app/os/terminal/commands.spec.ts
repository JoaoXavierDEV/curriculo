import { TermContext, complete, run } from './commands';

const ctx: TermContext = {
  history: ['help', 'ls'],
  projects: [
    { name: 'ChatSignalR', slug: 'chatsignalr' },
    { name: 'Claude-Color', slug: 'claude-color' },
  ],
  now: new Date('2026-11-26T12:00:00-03:00'),
};

const text = (input: string) =>
  run(input, ctx)
    .lines.map((line) => line.text)
    .join('\n');

describe('terminal: comandos', () => {
  it('help lista os comandos', () => {
    expect(text('help')).toContain('neofetch');
  });

  it('linha vazia não imprime nada', () => {
    expect(run('   ', ctx)).toEqual({ lines: [], actions: [] });
  });

  it('comando desconhecido sugere help', () => {
    const out = run('banana', ctx).lines[0];
    expect(out.kind).toBe('err');
    expect(out.text).toContain('digite help');
  });

  it('ls e cat leem os arquivos', () => {
    expect(text('ls')).toContain('sobre.txt');
    expect(text('cat sobre.txt')).toContain('João Xavier');
    expect(text('cat carreira.log')).toContain('NST E-Business');
    expect(text('cat formacao/pos-puc-rio.txt')).toContain('PUC-Rio');
    expect(run('cat nada.txt', ctx).lines[0].kind).toBe('err');
  });

  it('open abre janelas e redes', () => {
    expect(run('open projetos', ctx).actions).toEqual([{ type: 'open', app: 'projetos' }]);
    expect(run('open experiência', ctx).actions).toEqual([{ type: 'open', app: 'carreira' }]);
    expect(run('open github', ctx).actions[0]).toMatchObject({ type: 'link' });
  });

  it('projeto abre a janela certa, curado ou do GitHub', () => {
    expect(run('projeto salome', ctx).actions).toEqual([
      { type: 'open', app: 'projeto', slug: 'salome' },
    ]);
    expect(run('projeto Salomé', ctx).actions).toEqual([
      { type: 'open', app: 'projeto', slug: 'salome' },
    ]);
    expect(run('projeto chatsignalr', ctx).actions).toEqual([
      { type: 'open', app: 'projeto', slug: 'chatsignalr' },
    ]);
    expect(run('projeto xyz', ctx).lines[0].kind).toBe('err');
  });

  it('matrix e crt mudam as configurações', () => {
    expect(run('matrix chuva', ctx).actions).toEqual([{ type: 'wallpaper', value: 'rain' }]);
    expect(run('matrix off', ctx).actions).toEqual([{ type: 'wallpaper', value: 'off' }]);
    expect(run('crt forte', ctx).actions).toEqual([{ type: 'crt', value: 'strong' }]);
    expect(run('crt neon', ctx).lines[0].kind).toBe('err');
  });

  it('sudo hire joao abre o contato', () => {
    expect(run('sudo hire joao', ctx).actions).toEqual([{ type: 'open', app: 'contato' }]);
    expect(run('sudo rm', ctx).lines[0].text).toContain('sudoers');
  });

  it('history, clear, exit e oiia', () => {
    expect(text('history')).toContain('ls');
    expect(run('clear', ctx).actions).toEqual([{ type: 'clear' }]);
    expect(run('exit', ctx).actions).toEqual([{ type: 'exit' }]);
    expect(run('oiia', ctx).actions).toEqual([{ type: 'open', app: 'lixeira' }]);
  });

  it('neofetch mostra o logo e o uptime', () => {
    expect(text('neofetch')).toContain('8 anos programando');
  });

  it('Tab completa comando e argumento', () => {
    expect(complete('neo', ctx)).toBe('neofetch ');
    expect(complete('cat so', ctx)).toBe('cat sobre.txt');
    expect(complete('projeto sal', ctx)).toBe('projeto salome');
    expect(complete('c', ctx)).toBeNull();
    expect(complete('open lin', ctx)).toBe('open linkedin');
    expect(complete('matrix ch', ctx)).toBe('matrix chuva');
  });
});
