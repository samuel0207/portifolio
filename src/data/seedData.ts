import type { AppData, CalendarEvent } from '../types';
import { formatDateISO } from '../utils/format';

function getRelativeMonthDate(dayOfMonth: number, monthOffset = 0): string {
  const now = new Date();
  const targetYear = now.getFullYear();
  const targetMonth = now.getMonth() + monthOffset;
  const maxDay = new Date(targetYear, targetMonth + 1, 0).getDate();
  const safeDay = Math.min(Math.max(1, dayOfMonth), maxDay);
  return formatDateISO(new Date(targetYear, targetMonth, safeDay));
}

function buildSeedEvents(): CalendarEvent[] {
  const now = new Date();
  const todayDay = now.getDate();
  const createdAt = now.toISOString();

  // Anchor key sample events cleanly around the current month so the calendar
  // looks immediately realistic regardless of the day it is opened.
  const d1 = getRelativeMonthDate(Math.max(2, todayDay - 7));
  const d2 = getRelativeMonthDate(Math.max(4, todayDay - 3));
  const dToday = formatDateISO(now);
  const dNext1 = getRelativeMonthDate(Math.min(28, todayDay + 2));
  const dNext2 = getRelativeMonthDate(Math.min(28, todayDay + 4));
  const dNext3 = getRelativeMonthDate(Math.min(28, todayDay + 6));
  const dNext4 = getRelativeMonthDate(Math.min(28, todayDay + 9));
  const dNextMonth = getRelativeMonthDate(5, 1);

  return [
    {
      id: 'evt_1',
      date: d1,
      allDay: false,
      startTime: '08:00',
      endTime: '11:30',
      title: '4º Núcleo de Design & Produto',
      description: 'Encontro técnico mensal de revisão de arquitetura e protótipos.',
      clientName: 'Coletivo Atlas',
      clientContact: 'contato@coletivoatlas.com.br',
      notes: 'Sala híbrida + gravação.',
      status: 'Reservado',
      color: 'sky',
      createdAt,
    },
    {
      id: 'evt_2',
      date: d2,
      allDay: false,
      startTime: '14:00',
      endTime: '17:00',
      title: 'Curso Intensivo de Fotografia de Produto',
      description: 'Módulo prático de iluminação em estúdio e direção criativa.',
      clientName: 'Turma Presencial B',
      clientContact: '(11) 98821-4020',
      notes: 'Trazer câmera mirrorless ou DSLR.',
      status: 'Reservado',
      color: 'violet',
      createdAt,
    },
    {
      id: 'evt_3',
      date: dToday,
      allDay: false,
      startTime: '10:00',
      endTime: '11:30',
      title: 'Consultoria de Portfólio & Marca',
      description: 'Horário aberto para diagnóstico de identidade visual e posicionamento.',
      status: 'Disponível',
      color: 'emerald',
      createdAt,
    },
    {
      id: 'evt_4',
      date: dToday,
      allDay: false,
      startTime: '15:30',
      endTime: '17:00',
      title: 'Sessão de Alinhamento — Projeto Kova',
      description: 'Apresentação de entregáveis finais e aprovação de catálogo.',
      clientName: 'Marina Lacerda',
      clientContact: 'marina@kovalab.com.br',
      notes: 'Link da chamada enviado por e-mail.',
      status: 'Reservado',
      color: 'amber',
      createdAt,
    },
    {
      id: 'evt_5',
      date: dNext1,
      allDay: true,
      title: 'Dia inteiro • Produção Externa Editorial',
      description: 'Agenda reservada exclusivamente para captação externa.',
      status: 'Bloqueado',
      color: 'coral',
      notes: 'Sem atendimentos presenciais nesta data.',
      createdAt,
    },
    {
      id: 'evt_6',
      date: dNext2,
      allDay: false,
      startTime: '09:30',
      endTime: '11:00',
      title: 'Mentoria 1:1 — Sistemas de Design',
      description: 'Horário disponível para agendamento online ou presencial.',
      status: 'Disponível',
      color: 'emerald',
      createdAt,
    },
    {
      id: 'evt_7',
      date: dNext2,
      allDay: false,
      startTime: '14:00',
      endTime: '16:00',
      title: 'Workshop Rápido de Prototipagem',
      description: 'Vaga aberta para equipes de até 4 pessoas.',
      status: 'Disponível',
      color: 'emerald',
      createdAt,
    },
    {
      id: 'evt_8',
      date: dNext3,
      allDay: false,
      startTime: '11:00',
      endTime: '12:30',
      title: 'Reunião de Escopo — E-commerce Minimal',
      clientName: 'Lucas Andrade',
      clientContact: '(11) 97710-3321',
      status: 'Reservado',
      color: 'sky',
      createdAt,
    },
    {
      id: 'evt_9',
      date: dNext4,
      allDay: false,
      startTime: '16:00',
      endTime: '17:30',
      title: 'Avaliação Técnica de Equipamentos',
      description: 'Horário livre para teste e demonstração de itens do inventário.',
      status: 'Disponível',
      color: 'emerald',
      createdAt,
    },
    {
      id: 'evt_10',
      date: dNextMonth,
      allDay: false,
      startTime: '10:00',
      endTime: '12:00',
      title: 'Abertura de Agenda Mensal',
      description: 'Janela disponível para novos projetos e consultorias.',
      status: 'Disponível',
      color: 'emerald',
      createdAt,
    },
  ];
}

export function createSeedData(): AppData {
  const nowIso = new Date().toISOString();

  return {
    version: 1,
    updatedAt: nowIso,
    profile: {
      slug: 'estudio-atlas',
      name: 'Lumière',
      brandTagline: 'ATELIÊ & ESTÚDIO',
      title: 'Cuidado Especializado, Experiências Sob Medida & Curadoria Exclusiva',
      bio: 'Cuidado especializado e atendimento personalizado para realçar a sua melhor versão todos os dias. Agende seu horário online em poucos cliques ou conheça nossa curadoria de produtos.',
      location: 'São Paulo, SP • Atendimento Presencial e Online',
      avatarUrl:
        'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=400&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80',
      email: 'contato@lumiereestudio.com.br',
      phone: '(11) 3042-8890',
      whatsapp: '+55 11 98765-4321',
      primaryCtaLabel: 'Agendar Experiência',
      secondaryCtaLabel: 'Ver Produtos',
      heroEyebrow: 'Onde a Confiança Floresce',
      heroHeadlineLine1: 'Cuidado Real.',
      heroHeadlineLine2: 'Sua Melhor Versão.',
      heroHeadlineAccent: 'Todos os Dias.',
      heroBadgeText: 'ATENDIMENTO PREMIUM',
      showSocialProof: true,
      socialProofTitle: 'Amado por 500+ clientes',
      socialProofSubtitle: '4,9/5 (120 avaliações)',
      showPillarsSection: true,
      pillars: [
        {
          id: 'pil_1',
          icon: 'sparkles',
          title: 'Produtos Selecionados',
          description:
            'Utilizamos materiais e fórmulas de alta performance para resultados duradouros.',
        },
        {
          id: 'pil_2',
          icon: 'award',
          title: 'Especialistas Dedicados',
          description:
            'Profissionais apaixonados por cada detalhe, técnica e acabamento impecável.',
        },
        {
          id: 'pil_3',
          icon: 'heart',
          title: 'Atendimento Sob Medida',
          description:
            'Cada sessão é desenhada conforme seu estilo, objetivos e rotina.',
        },
        {
          id: 'pil_4',
          icon: 'calendar',
          title: 'Agendamento Fácil',
          description:
            'Consulte a agenda em tempo real e reserve seu horário online em segundos.',
        },
      ],
      showStoryBanner: true,
      storyEyebrow: 'Mais que um Estúdio',
      storyTitle: 'É o Seu Tempo.\nÉ o Seu Brilho.',
      storyDescription:
        'Criamos muito mais do que entregas técnicas — proporcionamos momentos de autocuidado, acolhimento e confiança que acompanham você no dia a dia.',
      storyCtaLabel: 'Agendar Horário',
      storyCtaHref: '#agenda',
      storyImageUrl:
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',
      ctaImageUrl:
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
      ctaButtonLabel: 'Agendar Horário',
      portfolioSectionEyebrow: 'Nossos Serviços',
      portfolioSectionTitle: 'Cuidado & Excelência Para Você',
      portfolioSectionDescription:
        'De atendimentos personalizados a projetos autorais, unimos técnica apurada e sensibilidade estética em cada detalhe.',
      calendarSectionEyebrow: 'Agenda Online',
      calendarSectionTitle: 'Reserve Seu Horário',
      calendarSectionDescription:
        'Selecione uma data no calendário abaixo para conferir disponibilidade e agendar seu atendimento em tempo real.',
      inventorySectionEyebrow: 'Curadoria & Produtos',
      inventorySectionTitle: 'Produtos Selecionados',
      inventorySectionDescription:
        'Explore itens disponíveis no nosso estoque, filtre por categoria e reserve diretamente pela vitrine.',
      contactSectionEyebrow: 'Pronto para Começar?',
      contactSectionTitle: 'Pronto para Sua Melhor Experiência?',
      contactSectionDescription:
        'Agende seu horário hoje mesmo ou fale diretamente conosco pelos canais abaixo.',
      showCalendarSection: true,
      showInventorySection: true,
      allowPublicCustomBooking: true,
      sectionOrder: ['projects', 'calendar', 'inventory'],
      footerText: '© 2026 Lumière Estúdio. Todos os direitos reservados.',
      socialLinks: [
        {
          id: 'soc_1',
          platform: 'instagram',
          label: 'Instagram',
          url: 'https://instagram.com',
          visible: true,
        },
        {
          id: 'soc_2',
          platform: 'linkedin',
          label: 'LinkedIn',
          url: 'https://linkedin.com',
          visible: true,
        },
        {
          id: 'soc_3',
          platform: 'github',
          label: 'GitHub',
          url: 'https://github.com',
          visible: true,
        },
        {
          id: 'soc_4',
          platform: 'website',
          label: 'Portfólio Editorial',
          url: 'https://estudioatlas.com.br',
          visible: true,
        },
      ],
    },
    portfolioItems: [
      {
        id: 'proj_1',
        kind: 'projeto',
        title: 'Kova Finance — Design System & App Mobile',
        subtitle: 'Fintech • Produto Digital',
        description:
          'Arquitetura completa de design system multiplataforma com mais de 140 componentes acessíveis, fluxos de investimento em tempo real e redução de 38% no tempo de entrega da engenharia.',
        tags: ['Design System', 'Figma', 'React', 'TypeScript', 'Mobile'],
        imageUrl:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
        externalUrl: 'https://dribbble.com',
        period: '2026',
        highlight: '+38% velocidade de entrega',
        featured: true,
        visible: true,
        order: 0,
      },
      {
        id: 'proj_2',
        kind: 'projeto',
        title: 'Norte Café Especial — Identidade & E-commerce',
        subtitle: 'Branding • Experiência Web',
        description:
          'Reposicionamento visual completo, direção de fotografia de produto em estúdio e loja virtual de assinatura com foco em alta conversão e narrativa sensorial.',
        tags: ['Branding', 'Direção Criativa', 'UX/UI', 'E-commerce'],
        imageUrl:
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80',
        externalUrl: 'https://behance.net',
        period: '2025',
        highlight: '3,2x aumento em assinaturas',
        featured: true,
        visible: true,
        order: 1,
      },
      {
        id: 'proj_3',
        kind: 'servico',
        title: 'Consultoria de Produto & Prototipagem Rápida',
        subtitle: 'Serviço Sob Demanda • Sprint de 2 semanas',
        description:
          'Imersão estratégica para validar fluxos críticos, estruturar arquitetura de informação e entregar protótipos navegáveis de alta fidelidade prontos para testes com usuários.',
        tags: ['Consultoria', 'UX Research', 'Protótipo Interativo'],
        imageUrl:
          'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80',
        externalUrl: '',
        period: 'Sob agendamento',
        highlight: 'Entregável em 10 dias úteis',
        featured: false,
        visible: true,
        order: 2,
      },
      {
        id: 'proj_4',
        kind: 'experiencia',
        title: 'Líder de Design & Tecnologia — Estúdio Atlas',
        subtitle: 'Experiência • Direção de Projetos',
        description:
          'Condução de projetos multidisciplinares integrando design de interface, produção audiovisual e consultoria técnica para startups e indústrias criativas no Brasil e Europa.',
        tags: ['Liderança', 'Estratégia', 'Full-Cycle Design'],
        imageUrl:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
        externalUrl: '',
        period: '2022 – Atual',
        highlight: '+45 projetos entregues',
        featured: false,
        visible: true,
        order: 3,
      },
    ],
    events: buildSeedEvents(),
    products: [
      {
        id: 'prod_1',
        name: 'Kit Iluminação LED Bi-Color Estúdio 120W',
        sku: 'ATL-LED-120',
        category: 'Iluminação',
        description:
          'Conjunto completo com painel LED de alto CRI (97+), difusor octabox 65cm, tripé reforçado em alumínio e controle de temperatura de 2700K a 6500K. Ideal para gravações e fotografia de produto.',
        imageUrl:
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
        price: 1890,
        showPrice: true,
        stock: 7,
        lowStockThreshold: 2,
        status: 'Disponível',
        visiblePublic: true,
        allowReservation: true,
        deductStockOnReserve: true,
        featured: true,
        createdAt: nowIso,
      },
      {
        id: 'prod_2',
        name: 'Microfone Condensador USB-C / XLR Pro Studio',
        sku: 'ATL-MIC-402',
        category: 'Áudio',
        description:
          'Captação cristalina padrão cardioide com shock-mount integrado, pop filter metálico e monitoramento sem latência para podcasts, cursos online e narrações.',
        imageUrl:
          'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80',
        price: 940,
        showPrice: true,
        stock: 2,
        lowStockThreshold: 3,
        status: 'Baixo estoque',
        visiblePublic: true,
        allowReservation: true,
        deductStockOnReserve: true,
        featured: true,
        createdAt: nowIso,
      },
      {
        id: 'prod_3',
        name: 'Guia Impresso & Templates de Design System (Edição 2026)',
        sku: 'ATL-KIT-DS26',
        category: 'Templates & Kits',
        description:
          'Livro técnico em capa dura + acesso completo à biblioteca Figma com tokens semânticos, componentes responsivos em modo escuro e checklists de handoff.',
        imageUrl:
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80',
        price: 280,
        showPrice: true,
        stock: 14,
        lowStockThreshold: 3,
        status: 'Disponível',
        visiblePublic: true,
        allowReservation: true,
        deductStockOnReserve: false,
        featured: false,
        createdAt: nowIso,
      },
      {
        id: 'prod_4',
        name: 'Monitor de Referência Calibrado 27" 4K IPS',
        sku: 'ATL-MON-274K',
        category: 'Equipamentos',
        description:
          'Cobertura 99% DCI-P3 com calibração de fábrica Delta E < 1, porta USB-C 90W e suporte ergonômico articulado para revisão de cor e edição.',
        imageUrl:
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80',
        price: null,
        showPrice: false,
        stock: 0,
        lowStockThreshold: 1,
        status: 'Esgotado',
        visiblePublic: true,
        allowReservation: true,
        deductStockOnReserve: false,
        featured: false,
        createdAt: nowIso,
      },
      {
        id: 'prod_5',
        name: 'Mesa Digitalizadora Compacta Bluetooth Pro',
        sku: 'ATL-TAB-PRO',
        category: 'Acessórios',
        description:
          'Caneta sem bateria com 8.192 níveis de pressão, 8 teclas programáveis e estojo rígido de transporte. Pronta entrega em embalagem lacrada.',
        imageUrl:
          'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=900&q=80',
        price: 620,
        showPrice: true,
        stock: 5,
        lowStockThreshold: 2,
        status: 'Disponível',
        visiblePublic: true,
        allowReservation: true,
        deductStockOnReserve: true,
        featured: false,
        createdAt: nowIso,
      },
    ],
    productInterests: [
      {
        id: 'int_1',
        productId: 'prod_1',
        productName: 'Kit Iluminação LED Bi-Color Estúdio 120W',
        productSku: 'ATL-LED-120',
        quantity: 1,
        visitorName: 'Camila Ferreira',
        visitorContact: '(11) 99123-4488',
        notes: 'Gostaria de retirar no estúdio esta semana.',
        deductedStock: true,
        createdAt: nowIso,
        resolved: false,
      },
    ],
  };
}
