// Contenido base del Portal Público (MJS configurado, Sacramentos y Multimedia en limpio para producción)

export const MJS_GROUPS = [
  // Plantel Glandorff
  {
    id: 'mjs-glandorff-pandillas',
    plantel: 'Glandorff',
    name: 'Pandillas Don Bosco',
    audience: '4° a 6° de primaria',
    schedule: 'Jueves de 3:00 a 4:30 pm',
    extraNote: 'Opción de quedarse a comer desde las 2:30 pm.',
    coordinatorName: 'Coordinación Pandillas Glandorff',
    whatsappPhone: '526140000001',
    animators: 'Animado por chicos de secundaria y preparatoria.',
    description:
      'Espacio de alegría, juegos organizados, formación en valores salesianos y amistad al estilo del Oratorio de Valdocco.',
    accent: 'from-pastoral to-pastoral-light',
    badgeColor: 'bg-pastoral/10 text-pastoral',
  },
  {
    id: 'mjs-glandorff-acolitos',
    plantel: 'Glandorff',
    name: 'Acólitos',
    audience: 'Primaria mayor y secundaria',
    schedule: 'Jueves de 4:30 a 6:00 pm (cada 15 días)',
    extraNote: 'Servicio en la misa dominical de las 11:30 am.',
    coordinatorName: 'Coordinación Acólitos Glandorff',
    whatsappPhone: '526140000002',
    animators: 'Acompañamiento por coordinación pastoral y equipo litúrgico.',
    description:
      'Formación litúrgica y espiritual para niños y adolescentes que desean servir en el altar con alegría y compromiso.',
    accent: 'from-pastoral-gold to-amber-500',
    badgeColor: 'bg-amber-100 text-amber-900',
  },

  // Plantel Kennedy
  {
    id: 'mjs-kennedy-ads',
    plantel: 'Kennedy',
    name: 'ADS (Amigos de Domingo Savio)',
    audience: '1° a 3° de secundaria',
    schedule: 'Viernes de 3:00 a 4:30 pm',
    extraNote: 'Encuentros semanales con dinámicas, temas y proyecto de vida.',
    coordinatorName: 'Coordinación ADS Kennedy',
    whatsappPhone: '526140000003',
    animators: 'Animado por chicos de preparatoria.',
    description:
      'Grupo juvenil inspirado en Santo Domingo Savio que impulsa el liderazgo positivo, la fe vivida con alegría y el servicio a los demás.',
    accent: 'from-pastoral-cyan to-sky-600',
    badgeColor: 'bg-sky-100 text-sky-900',
  },
  {
    id: 'mjs-kennedy-grumis',
    plantel: 'Kennedy',
    name: 'Grumis (Misiones)',
    audience: '3° de secundaria y preparatoria',
    schedule: 'Viernes de 5:00 a 6:30 pm',
    extraNote: 'Formación para misiones de Semana Santa.',
    coordinatorName: 'Coordinación Grumis Kennedy',
    whatsappPhone: '526140000004',
    animators: 'Equipo de misioneros jóvenes y asesores salesianos.',
    description:
      'Grupo Misionero Salesiano orientado a la solidaridad, formación catequética y experiencia misionera en comunidades durante Semana Santa.',
    accent: 'from-pastoral-red to-rose-600',
    badgeColor: 'bg-rose-100 text-rose-900',
  },

  // Plantel Cordilleras
  {
    id: 'mjs-cordilleras-pandillas',
    plantel: 'Cordilleras',
    name: 'Pandillas Don Bosco',
    audience: '4° a 6° de primaria',
    schedule: 'Miércoles de 3:00 a 4:30 pm',
    extraNote: 'Actividades lúdicas, formación salesiana y convivencia fraterna.',
    coordinatorName: 'Coordinación Pandillas Cordilleras',
    whatsappPhone: '526140000005',
    animators: 'Animadores juveniles y agentes de pastoral del plantel.',
    description:
      'Tardes de patio, canto, dinámicas y amistad donde los niños descubren el cariño de Don Bosco y Jesús amigo.',
    accent: 'from-pastoral-lime to-emerald-600',
    badgeColor: 'bg-lime-100 text-lime-900',
  },
  {
    id: 'mjs-cordilleras-jueves',
    plantel: 'Cordilleras',
    name: 'Jueves Salesianos (ADS, Forofos y Coro Salesiano)',
    audience: 'Secundaria y preparatoria',
    schedule: 'Jueves de 3:00 a 4:30 pm',
    extraNote: 'Tres experiencias integradas: liderazgo juvenil, deporte con valores y música litúrgica.',
    coordinatorName: 'Coordinación Jueves Salesianos Cordilleras',
    whatsappPhone: '526140000006',
    animators: 'Coordinación pastoral y jóvenes animadores de Cordilleras.',
    description:
      'Un encuentro semanal vibrante donde cada joven elige vivir el carisma salesiano a través de ADS, la comunidad Forofos o el Coro Salesiano.',
    accent: 'from-pastoral-deep to-pastoral',
    badgeColor: 'bg-indigo-100 text-indigo-900',
  },
];

// Estructura limpia lista para capturar desde Editor Portal -> Sacramentos
export const SACRAMENTS_WIKI = [
  {
    id: 'primera-comunion',
    title: 'Primeras Comuniones',
    subtitle: 'Preparación catequética para recibir a Jesús Eucaristía',
    target: 'Estudiantes de primaria ESFER Salesianos',
    color: 'pastoral',
    requirements: [],
    dates: [],
    faqs: [],
  },
  {
    id: 'confirmaciones',
    title: 'Confirmaciones',
    subtitle: 'Renovación consciente de la fe y envío del Espíritu Santo',
    target: 'Jóvenes de secundaria y preparatoria ESFER Salesianos',
    color: 'cyan',
    requirements: [],
    dates: [],
    faqs: [],
  },
];

// En modo Próximamente hasta que se agreguen cápsulas o podcasts desde Editor Portal -> Multimedia
export const MULTIMEDIA_CONTENT = {
  videos: [],
  podcasts: [],
};
