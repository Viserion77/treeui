import practicesData from '../../../docs/ai/practices.json';

// Landing-only copy. English is canonical and comes straight from the practices
// contract (docs/ai/practices.json); pt/es translate it here and fall back to
// the canonical English for any practice added later without a translation.

export type LandingLocale = 'en' | 'pt' | 'es';

export interface PracticeCopy {
  title: string;
  summary: string;
}

export interface LandingMessages {
  nav: {
    ariaLabel: string;
    practices: string;
    vueDocs: string;
    reactDocs: string;
    examples: string;
    languageLabel: string;
  };
  theme: {
    toggleLabel: string;
    dark: string;
    light: string;
  };
  hero: {
    title: string;
    lead: string;
    ctaVue: string;
    copyLabel: string;
    copy: string;
    copied: string;
  };
  paths: {
    ariaLabel: string;
    vueBadge: string;
    vueBody: string;
    vueGo: string;
    reactBadge: string;
    reactBody: string;
    reactGo: string;
  };
  practices: {
    heading: string;
    intro: string;
    followedBy: string;
    more: string;
    copyById: Record<string, PracticeCopy>;
  };
  examples: {
    heading: string;
    intro: string;
    liveBadge: string;
    vueTitle: string;
    vueBody: string;
    reactTitle: string;
    reactBody: string;
    go: string;
  };
  foundation: {
    heading: string;
    features: Array<{ label: string; title: string; body: string }>;
  };
  footer: {
    line: string;
  };
}

export const localeOptions = [
  { label: 'English', value: 'en', code: 'us' },
  { label: 'Português', value: 'pt', code: 'br' },
  { label: 'Español', value: 'es', code: 'es' },
];

const canonicalPracticeCopy = Object.fromEntries(
  practicesData.practices.map((practice) => [
    practice.id,
    { title: practice.title, summary: practice.summary },
  ]),
);

const en: LandingMessages = {
  nav: {
    ariaLabel: 'Main',
    practices: 'Best practices',
    vueDocs: 'Vue docs',
    reactDocs: 'React docs',
    examples: 'Examples',
    languageLabel: 'Page language',
  },
  theme: {
    toggleLabel: 'Switch color theme',
    dark: 'Dark',
    light: 'Light',
  },
  hero: {
    title: 'Clean components for modern products',
    lead:
      'An open-source component library on a framework-agnostic foundation — shared design tokens, accessibility-first behavior, and a compact T-prefixed API across every framework.',
    ctaVue: 'Explore the Vue docs',
    copyLabel: 'Copy the install command',
    copy: 'Copy',
    copied: 'Copied!',
  },
  paths: {
    ariaLabel: 'Documentation',
    vueBadge: 'Stable',
    vueBody:
      'The complete library: 60+ production components, a plugin, full type exports, and the entire design-system documentation.',
    vueGo: 'Open Vue docs →',
    reactBadge: 'Early',
    reactBody:
      'A growing package with the core primitives — Button, Input, Badge, Card — built on the same tokens and t-* classes.',
    reactGo: 'Open React docs →',
  },
  practices: {
    heading: 'Best practices, built in',
    intro: practicesData.philosophy.statement,
    followedBy: 'Components that follow it',
    more: 'Every practice, with its rules and live component demos, in Storybook →',
    copyById: canonicalPracticeCopy,
  },
  examples: {
    heading: 'See it running',
    intro:
      'A full configurable dashboard — theme, accent color, density, and widgets — built entirely with TreeUI components. No custom UI framework code.',
    liveBadge: 'Live demo',
    vueTitle: 'Vue dashboard',
    vueBody:
      'Sidebar shell, sortable tables, KPI stats, toasts, and a settings drawer — the complete component set working together.',
    reactTitle: 'React dashboard',
    reactBody:
      'The same dashboard concept built with the React primitives — Button, Input, Badge, Card — on shared tokens.',
    go: 'Open example →',
  },
  foundation: {
    heading: 'One foundation, shared by every framework',
    features: [
      {
        label: '@treeui/tokens',
        title: 'Design tokens',
        body: 'Framework-agnostic --tree-* variables, themes, and a brand-ramp generator.',
      },
      {
        label: 'a11y',
        title: 'Accessible by default',
        body: 'Native semantics, keyboard support, focus management, and visible focus.',
      },
      {
        label: 'T<Name>',
        title: 'Predictable API',
        body: 'A compact, consistent surface — the same names and contracts across frameworks.',
      },
      {
        label: '@treeui/mcp',
        title: 'Agent-ready',
        body: 'A machine-readable catalog and MCP server so coding agents pick the right component.',
      },
    ],
  },
  footer: {
    line: 'MIT licensed · Built with token-driven theming.',
  },
};

const pt: LandingMessages = {
  nav: {
    ariaLabel: 'Principal',
    practices: 'Boas práticas',
    vueDocs: 'Docs Vue',
    reactDocs: 'Docs React',
    examples: 'Exemplos',
    languageLabel: 'Idioma da página',
  },
  theme: {
    toggleLabel: 'Alternar tema de cores',
    dark: 'Escuro',
    light: 'Claro',
  },
  hero: {
    title: 'Componentes limpos para produtos modernos',
    lead:
      'Uma biblioteca de componentes open-source sobre uma fundação agnóstica de framework — tokens de design compartilhados, comportamento acessível por padrão e uma API compacta com prefixo T em todos os frameworks.',
    ctaVue: 'Explorar os docs Vue',
    copyLabel: 'Copiar o comando de instalação',
    copy: 'Copiar',
    copied: 'Copiado!',
  },
  paths: {
    ariaLabel: 'Documentação',
    vueBadge: 'Estável',
    vueBody:
      'A biblioteca completa: mais de 60 componentes de produção, um plugin, exports de tipos e toda a documentação do design system.',
    vueGo: 'Abrir docs Vue →',
    reactBadge: 'Inicial',
    reactBody:
      'Um pacote em crescimento com os primitivos centrais — Button, Input, Badge, Card — sobre os mesmos tokens e classes t-*.',
    reactGo: 'Abrir docs React →',
  },
  practices: {
    heading: 'Boas práticas, de fábrica',
    intro:
      'A TreeUI é otimizada para clareza — clareza visual para usuários e clareza de desenvolvimento para times — com consistência e acessibilidade como padrão, nunca opcionais. Os componentes são calibrados para boa UI e UX através das práticas nomeadas abaixo, e a biblioteca assume o trabalho de layout e alinhamento para o código de produto não precisar fazê-lo.',
    followedBy: 'Componentes que seguem',
    more: 'Todas as práticas, com regras e demos ao vivo dos componentes, no Storybook →',
    copyById: {
      'interaction-feedback': {
        title: 'Feedback visual de interação',
        summary:
          'Toda interação responde. Hover, foco, ativo, loading e desabilitado são estados projetados — nunca deixados para o consumidor.',
      },
      'accessible-by-default': {
        title: 'Acessível por padrão',
        summary:
          'Semântica nativa primeiro, ARIA onde o padrão exige, teclado completo e gerenciamento de foco que o consumidor nunca precisa escrever.',
      },
      'predictable-api': {
        title: 'Uma API previsível',
        summary:
          'Os mesmos contratos em toda parte: uma escala de tamanhos, uma escala de variantes, v-model nos controles de formulário, open/close nos overlays. Aprenda um componente e conheça todos.',
      },
      'state-clarity': {
        title: 'Vazio, loading e erro são estados projetados',
        summary:
          'Telas comunicam status com honestidade: skeletons durante o carregamento, empty states com propósito e superfícies de status numa única escala semântica de tons.',
      },
      'content-alignment': {
        title: 'Alinhamento sem CSS custom',
        summary:
          'Primitivos de layout absorvem espaçamento, alinhamento e ritmo para o código de produto nunca mais repetir o mesmo flexbox.',
      },
      'token-driven': {
        title: 'Clareza dirigida por tokens',
        summary:
          'Nenhum hex, px ou fonte crus. Toda decisão visual referencia um token --tree-*, então light/dark e o theming de marca ficam coerentes por construção.',
      },
    },
  },
  examples: {
    heading: 'Veja funcionando',
    intro:
      'Um dashboard completo e configurável — tema, cor de destaque, densidade e widgets — construído inteiramente com componentes TreeUI. Nenhum código de UI framework próprio.',
    liveBadge: 'Demo ao vivo',
    vueTitle: 'Dashboard Vue',
    vueBody:
      'Shell com sidebar, tabelas ordenáveis, KPIs, toasts e um drawer de configurações — o conjunto completo de componentes trabalhando junto.',
    reactTitle: 'Dashboard React',
    reactBody:
      'O mesmo conceito de dashboard construído com os primitivos React — Button, Input, Badge, Card — sobre tokens compartilhados.',
    go: 'Abrir exemplo →',
  },
  foundation: {
    heading: 'Uma fundação, compartilhada por todos os frameworks',
    features: [
      {
        label: '@treeui/tokens',
        title: 'Tokens de design',
        body: 'Variáveis --tree-* agnósticas de framework, temas e um gerador de rampa de marca.',
      },
      {
        label: 'a11y',
        title: 'Acessível por padrão',
        body: 'Semântica nativa, suporte a teclado, gerenciamento de foco e foco visível.',
      },
      {
        label: 'T<Name>',
        title: 'API previsível',
        body: 'Uma superfície compacta e consistente — os mesmos nomes e contratos entre frameworks.',
      },
      {
        label: '@treeui/mcp',
        title: 'Pronta para agentes',
        body: 'Um catálogo legível por máquina e um servidor MCP para agentes escolherem o componente certo.',
      },
    ],
  },
  footer: {
    line: 'Licença MIT · Feito com theming dirigido por tokens.',
  },
};

const es: LandingMessages = {
  nav: {
    ariaLabel: 'Principal',
    practices: 'Buenas prácticas',
    vueDocs: 'Docs Vue',
    reactDocs: 'Docs React',
    examples: 'Ejemplos',
    languageLabel: 'Idioma de la página',
  },
  theme: {
    toggleLabel: 'Cambiar tema de color',
    dark: 'Oscuro',
    light: 'Claro',
  },
  hero: {
    title: 'Componentes limpios para productos modernos',
    lead:
      'Una librería de componentes open-source sobre una base agnóstica de framework — tokens de diseño compartidos, comportamiento accesible por defecto y una API compacta con prefijo T en todos los frameworks.',
    ctaVue: 'Explorar los docs de Vue',
    copyLabel: 'Copiar el comando de instalación',
    copy: 'Copiar',
    copied: '¡Copiado!',
  },
  paths: {
    ariaLabel: 'Documentación',
    vueBadge: 'Estable',
    vueBody:
      'La librería completa: más de 60 componentes de producción, un plugin, exports de tipos y toda la documentación del design system.',
    vueGo: 'Abrir docs Vue →',
    reactBadge: 'Inicial',
    reactBody:
      'Un paquete en crecimiento con los primitivos centrales — Button, Input, Badge, Card — sobre los mismos tokens y clases t-*.',
    reactGo: 'Abrir docs React →',
  },
  practices: {
    heading: 'Buenas prácticas, de serie',
    intro:
      'TreeUI está optimizada para la claridad — claridad visual para las personas y claridad de desarrollo para los equipos — con consistencia y accesibilidad por defecto, nunca opcionales. Los componentes están afinados para buena UI y UX mediante las prácticas nombradas abajo, y la librería asume el trabajo de layout y alineación para que el código de producto no tenga que hacerlo.',
    followedBy: 'Componentes que la siguen',
    more: 'Cada práctica, con sus reglas y demos en vivo de los componentes, en Storybook →',
    copyById: {
      'interaction-feedback': {
        title: 'Feedback visual de interacción',
        summary:
          'Cada interacción responde. Hover, foco, activo, cargando y deshabilitado son estados diseñados — nunca dejados al consumidor.',
      },
      'accessible-by-default': {
        title: 'Accesible por defecto',
        summary:
          'Semántica nativa primero, ARIA donde el patrón lo exige, teclado completo y gestión de foco que el consumidor nunca tiene que escribir.',
      },
      'predictable-api': {
        title: 'Una API predecible',
        summary:
          'Los mismos contratos en todas partes: una escala de tamaños, una escala de variantes, v-model en los controles de formulario, open/close en los overlays. Aprende un componente y los conoces todos.',
      },
      'state-clarity': {
        title: 'Vacío, carga y error son estados diseñados',
        summary:
          'Las pantallas comunican el estado con honestidad: skeletons al cargar, empty states con propósito y superficies de estado en una única escala semántica de tonos.',
      },
      'content-alignment': {
        title: 'Alineación sin CSS a medida',
        summary:
          'Los primitivos de layout absorben espaciado, alineación y ritmo para que el código de producto no repita el mismo flexbox otra vez.',
      },
      'token-driven': {
        title: 'Claridad dirigida por tokens',
        summary:
          'Nada de hex, px ni fuentes en crudo. Cada decisión visual referencia un token --tree-*, así light/dark y el theming de marca se mantienen coherentes por construcción.',
      },
    },
  },
  examples: {
    heading: 'Míralo funcionando',
    intro:
      'Un dashboard completo y configurable — tema, color de acento, densidad y widgets — construido íntegramente con componentes TreeUI. Sin código de UI framework propio.',
    liveBadge: 'Demo en vivo',
    vueTitle: 'Dashboard Vue',
    vueBody:
      'Shell con sidebar, tablas ordenables, KPIs, toasts y un drawer de ajustes — el conjunto completo de componentes trabajando junto.',
    reactTitle: 'Dashboard React',
    reactBody:
      'El mismo concepto de dashboard construido con los primitivos React — Button, Input, Badge, Card — sobre tokens compartidos.',
    go: 'Abrir ejemplo →',
  },
  foundation: {
    heading: 'Una base, compartida por todos los frameworks',
    features: [
      {
        label: '@treeui/tokens',
        title: 'Tokens de diseño',
        body: 'Variables --tree-* agnósticas de framework, temas y un generador de rampa de marca.',
      },
      {
        label: 'a11y',
        title: 'Accesible por defecto',
        body: 'Semántica nativa, soporte de teclado, gestión de foco y foco visible.',
      },
      {
        label: 'T<Name>',
        title: 'API predecible',
        body: 'Una superficie compacta y consistente — los mismos nombres y contratos entre frameworks.',
      },
      {
        label: '@treeui/mcp',
        title: 'Lista para agentes',
        body: 'Un catálogo legible por máquinas y un servidor MCP para que los agentes elijan el componente correcto.',
      },
    ],
  },
  footer: {
    line: 'Licencia MIT · Hecho con theming dirigido por tokens.',
  },
};

export const messages: Record<LandingLocale, LandingMessages> = { en, pt, es };

export const LOCALE_STORAGE_KEY = 'treeui-landing-locale';

export const isLandingLocale = (value: string | null): value is LandingLocale =>
  value === 'en' || value === 'pt' || value === 'es';

export const detectLocale = (): LandingLocale => {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLandingLocale(stored)) {
      return stored;
    }
  } catch {
    // Storage unavailable (private mode) — fall through to the browser language.
  }

  const browser = navigator.language.toLowerCase();
  if (browser.startsWith('pt')) {
    return 'pt';
  }
  if (browser.startsWith('es')) {
    return 'es';
  }
  return 'en';
};
