/** Uma linha do boot: texto, status opcional e se aparece só em telas largas. */
export interface BootLine {
  readonly text: string;
  readonly status?: 'ok' | 'info';
  readonly wide?: boolean;
}

const k = (time: string, text: string, wide = false): BootLine => ({
  text: `[${time.padStart(12)}] ${text}`,
  wide,
});
const ok = (text: string, wide = false): BootLine => ({ text, status: 'ok', wide });

/** Sequência do "boot Linux" exibida ao abrir ou atualizar o site. */
export const BOOT_LINES: readonly BootLine[] = [
  { text: 'GRUB loading.' },
  { text: 'Welcome to GRUB!' },
  { text: "Booting `joaoxavier.dev GNU/Linux, with Linux 6.12.0-xavier'" },
  { text: 'Loading initial ramdisk ...' },
  k('0.000000', 'Linux version 6.12.0-xavier (joao@xavier) (gcc 14.2.1, GNU ld 2.43) #1 SMP PREEMPT_DYNAMIC'),
  k('0.000000', 'Command line: BOOT_IMAGE=/vmlinuz-6.12.0 root=/dev/curriculo ro quiet splash', true),
  k('0.000000', 'BIOS-provided physical RAM map:', true),
  k('0.000000', 'BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable', true),
  k('0.000000', 'NX (Execute Disable) protection: active'),
  k('0.000000', 'DMI: Rio de Janeiro/RJ, BIOS 1.0 2019 (início da carreira)'),
  k('0.004118', 'tsc: Detected 3600.000 MHz processor'),
  k('0.012734', "x86/fpu: Supporting XSAVE feature 0x001: 'x87 floating point registers'", true),
  k('0.031502', 'ACPI: Early table checksum verification disabled', true),
  k('0.084512', 'Memory: 16384K/16777216K available (C#, TypeScript, SQL, Python)'),
  k('0.112093', 'smpboot: CPU0: Full Stack Dev @ .NET + Angular (family: 0x6)'),
  k('0.231877', 'ACPI: Core revision 20240827'),
  k('0.318455', 'PCI: Using configuration type 1 for base access', true),
  k('0.402190', 'clocksource: Switched to clocksource tsc'),
  k('0.522811', 'NET: Registered PF_INET protocol family'),
  k('0.611042', 'usb 1-1: new high-speed USB device: café, número 1', true),
  k('0.734400', 'nvme nvme0: 1/0/0 default/read/poll queues'),
  k('0.913004', 'EXT4-fs (sda1): mounted filesystem /home/joao with ordered data mode'),
  k('1.002377', 'systemd[1]: systemd 256 running in system mode (+PAM +AUDIT +SELINUX)', true),
  k('1.010921', 'systemd[1]: Detected architecture x86-64.'),
  k('1.024555', 'systemd[1]: Hostname set to <joaoxavier.dev>.'),
  ok('Created slice system-getty.slice.', true),
  ok('Started Journal Service.'),
  ok('Started Load Kernel Modules.'),
  ok('Mounted /home/joao/projetos.'),
  ok('Mounted /home/joao/carreira.'),
  ok('Mounted /home/joao/formacao (PUC-Rio, Estácio, Senac RJ).'),
  ok('Started Rule-based Manager for Device Events.', true),
  ok('Reached target Local File Systems.'),
  ok('Started .NET Runtime (dotnet 10).'),
  ok('Started SQL Server · PostgreSQL.'),
  ok('Started Azure CLI Daemon.', true),
  ok('Started Angular Hydration Service.'),
  ok('Started Signals Change Detection.'),
  ok('Reached target Network (Rio de Janeiro, BR).'),
  ok('Started GitHub Repositories Sync.'),
  ok('Started Coffee Maker Daemon.'),
  ok('Started CRT Scanline Renderer.', true),
  ok('Started Terminal Login Service.'),
  ok('Reached target Multi-User System.'),
  ok('Reached target Graphical Interface.'),
  { text: '' },
  { text: 'joaoxavier.dev GNU/Linux 6.12.0-xavier tty1' },
  { text: '' },
  { text: 'joaoxavier.dev login: joao' },
  { text: 'Last login: hoje, de algum lugar da internet' },
  { text: 'Bem-vindo ao joaoxavier.dev · Dev Full Stack .NET + Angular', status: 'info' },
];

/** Atraso (ms) de cada linha: começa rápido e desacelera, como um kernel de verdade. */
export function bootDelays(count: number, total: number): number[] {
  if (count <= 1) return [0];
  return Array.from({ length: count }, (_, i) => Math.round(total * Math.pow(i / (count - 1), 1.3)));
}
