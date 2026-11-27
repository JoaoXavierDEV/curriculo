import { BOOT_LINES, bootDelays } from './boot-lines';

describe('bootDelays', () => {
  it('começa em 0, termina no total e cresce', () => {
    const delays = bootDelays(BOOT_LINES.length, 1600);
    expect(delays[0]).toBe(0);
    expect(delays.at(-1)).toBe(1600);
    for (let i = 1; i < delays.length; i++) expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]);
  });

  it('lida com uma linha só', () => {
    expect(bootDelays(1, 1000)).toEqual([0]);
  });
});
