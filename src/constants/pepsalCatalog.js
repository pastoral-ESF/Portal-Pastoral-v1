// Contenido oficial del PEPSAL — Proyecto Educativo Pastoral Salesiano Local (Ciclo 26 - 27)
// ESFER Salesianos Chihuahua

export const PEPSAL_META = {
  cycle: 'Ciclo 26 - 27',
  title: 'PEPSAL — Proyecto Educativo Pastoral Salesiano Local',
  definition:
    'Es el documento y plan de acción que guía la vida, la educación y la evangelización en una obra o comunidad salesiana (como colegios, parroquias u oratorios).',
  objectives: [
    {
      title: 'Unificar criterios',
      desc: 'Crea una mentalidad y una línea de trabajo compartida entre directivos, docentes, familias y alumnos.',
    },
    {
      title: 'Integrar fe y cultura',
      desc: 'Conecta la formación académica y el crecimiento humano con los valores del Evangelio y el carisma de Don Bosco.',
    },
    {
      title: 'Responder a la realidad juvenil',
      desc: 'Analiza los retos actuales de los niños, niñas, adolescentes y jóvenes para ofrecerles un acompañamiento adecuado.',
    },
  ],
  directorMessage: {
    author: 'P. Francisco Origel, SDB',
    role: 'Mensaje del Director',
    body: 'La sinodalidad y el discernimiento nos invitan a caminar juntos como comunidad, escuchándonos, participando y tomando decisiones con responsabilidad, siempre al servicio de nuestra misión común. Somos una familia en la que cada persona tiene algo valioso que aportar: jóvenes, catequistas, madres, padres y todos quienes formamos parte de ella. Y nuestros muchachos ocupan un lugar esencial, pues son el corazón y la razón de ser de nuestra misión, quienes nos inspiran a mantener siempre los pies en la tierra y la mirada puesta en lo que verdaderamente importa.',
  },
  closingPurpose:
    'Este proyecto nace con un propósito que nos une: seguir construyendo una educación salesiana integral, que acompañe a cada uno de nuestros alumnos en todas las dimensiones de su vida, formando no solo buenos estudiantes, sino buenos cristianos y honrados ciudadanos, capaces de transformar su realidad con sentido, esperanza y espíritu de familia.',
};

export const PEPSAL_RETOS = [
  {
    id: 'R01',
    number: '01',
    title: 'Centralidad de los jóvenes y Acompañamiento',
    description:
      'Poner a los NNAJ en el centro, escuchándolos y acompañándolos de manera cercana e integral. Fortalecer la escuela como un espacio seguro y una casa que acoge, con especial atención a quienes viven situaciones de vulnerabilidad, violencia, exclusión, adicciones o dificultades emocionales y sociales.',
    accent: 'bg-sky-100 text-sky-900 border-sky-200',
  },
  {
    id: 'R02',
    number: '02',
    title: 'Salud Mental y Bienestar Socioemocional',
    description:
      'Promover una cultura de cuidado, prevención y acompañamiento de la salud mental, eliminando estigmas y fortaleciendo las herramientas socioemocionales y psicoespirituales. Contar con personal capacitado y protocolos claros de actuación ante situaciones de crisis.',
    accent: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  {
    id: 'R03',
    number: '03',
    title: 'Identidad Carismática y Sistema Preventivo',
    description:
      'Impulsar una evangelización significativa, que presente a Jesús como respuesta a los retos y preguntas de los jóvenes. Vivir la fe desde el testimonio, fortalecer la vida sacramental y generar un diálogo cercano entre fe, cultura y realidad juvenil.',
    accent: 'bg-pink-100 text-pink-900 border-pink-200',
  },
  {
    id: 'R04',
    number: '04',
    title: 'Educación de Calidad e Innovación',
    description:
      'Ofrecer una formación integral y de calidad que prepare a los jóvenes para su futuro universitario y profesional, atendiendo la diversidad y las diferentes necesidades educativas. Aprovechar la tecnología como herramienta de aprendizaje y responder responsablemente a sus nuevos desafíos.',
    accent: 'bg-lime-100 text-lime-900 border-lime-200',
  },
  {
    id: 'R05',
    number: '05',
    title: 'Formación y Cuidado del Personal',
    description:
      'Cuidar el bienestar de los colaboradores, fortaleciendo su integración y previniendo el estrés laboral. Garantizar una formación continua en el carisma Salesiano y en sus competencias profesionales, valorando también el servicio de catequistas y voluntarios.',
    accent: 'bg-orange-100 text-orange-900 border-orange-200',
  },
  {
    id: 'R06',
    number: '06',
    title: 'Gestión, Infraestructura y Comunicación',
    description:
      'Fortalecer una comunicación institucional clara y ordenada, mejorar los espacios y recursos necesarios para el desarrollo de la comunidad y atender oportunamente sus necesidades. Promover procesos de evaluación que permitan mejorar continuamente.',
    accent: 'bg-purple-100 text-purple-900 border-purple-200',
  },
  {
    id: 'R07',
    number: '07',
    title: 'Familia y Compromiso Social',
    description:
      'Buscar la corresponsabilidad de las familias en la formación de los jóvenes, promoviendo una participación más activa. Formar jóvenes sensibles a las necesidades de su entorno y capaces de convertirse en agentes de cambio social, superando el individualismo.',
    accent: 'bg-cyan-100 text-cyan-900 border-cyan-200',
  },
  {
    id: 'R08',
    number: '08',
    title: 'Evaluación y Mejora Continua',
    description:
      'Consolidar una cultura de evaluación y seguimiento sistemático en los procesos educativos y pastorales, que permita conocer los resultados, identificar áreas de oportunidad y tomar decisiones de mejora. También comprender las causas de la apatía de algunos alumnos y familias para generar un acompañamiento adecuado.',
    accent: 'bg-yellow-100 text-yellow-900 border-yellow-200',
  },
];

// Las 4 Dimensiones oficiales de la CEP (Comunidad Educativa - Pastoral)
export const PEPSAL_AREAS = [
  {
    id: 'PEPSAL-FE',
    name: 'Educación en la Fe',
    shortName: 'Educación en la Fe',
    color: '#2B3890',
    objective:
      'Promover una evangelización gradual que lleve a los miembros de la CEP al encuentro personal con Jesucristo y al descubrimiento de la belleza de la fe.',
    strategies: [
      'Ofrecer y fortalecer experiencias evangelizadoras significativas, adaptadas a los diferentes miembros de la CEP.',
      'Favorecer la participación, corresponsabilidad y acompañamiento mediante las estructuras de animación pastoral.',
    ],
    interventions: [
      'Diseñar experiencias de formación en la fe acordes con las necesidades de cada grupo, motivando una mayor participación.',
      'Preparar a los alumnos para comprender y vivir las celebraciones litúrgicas.',
      'Compartir y aplicar criterios de calidad y significatividad de la escuela salesiana para fortalecer las acciones pastorales.',
      'Planificar y dar seguimiento a las reuniones pastorales mediante programas y actas de acuerdos.',
      'Implementar y evaluar las cartas descriptivas de las actividades pastorales.',
    ],
  },
  {
    id: 'PEPSAL-EC',
    name: 'Educativo - Cultural',
    shortName: 'Educativo - Cultural',
    color: '#00ADEF',
    objective:
      'Garantizar una educación integral, significativa y pertinente, centrada en los NNAJ, mediante propuestas educativas, pastorales y tecnológicas innovadoras que les permitan responder de manera crítica, humana y cristiana a los retos actuales.',
    strategies: [
      'Promover los valores del Modelo Educativo Salesiano en todas las actividades escolares.',
      'Brindar una educación contextualizada y vinculada con la realidad.',
      'Mantener una formación y actualización continua del personal, atendiendo a las necesidades actuales, el aprendizaje significativo y la transversalidad.',
    ],
    interventions: [
      'Formar y acompañar a los asesores para fortalecer su rol y la hora de asesoría.',
      'Garantizar la participación activa en los Buenos Días.',
      'Sistematizar tutorías y procesos de autoevaluación mediante observación de clases, revisión de planeaciones y retroalimentación.',
      'Evaluar los procesos educativos desde una perspectiva que favorezca el aprendizaje significativo y la innovación.',
      'Impulsar la transversalidad en todas las asignaturas.',
      'Establecer un plan de formación docente continua, evaluado semestralmente y orientado a las necesidades actuales de aprendizaje.',
    ],
  },
  {
    id: 'PEPSAL-EA',
    name: 'Experiencia Asociativa',
    shortName: 'Experiencia Asociativa',
    color: '#FBB03B',
    objective:
      'Fortalecer la participación, el sentido de pertenencia y el espíritu de familia, ofreciendo un espacio seguro basado en la Amorevolezza Salesiana.',
    strategies: [
      'Promover las propuestas artísticas, deportivas y del MJS en momentos oportunos del ciclo escolar.',
      'Garantizar un ambiente de confianza, respeto, cercanía, corresponsabilidad y pertenencia.',
    ],
    interventions: [
      'Dar a conocer y ofrecer las diversas propuestas durante el ciclo, destacando sus beneficios.',
      'Asegurar el seguimiento de los itinerarios formativos de cada asociación, incluyendo experiencias, símbolos y temas.',
      'Impulsar el liderazgo juvenil, permitiendo a los alumnos diseñar y gestionar experiencias formativas y de convivencia.',
      'Brindar a los asesores itinerarios y recursos para dinámicas grupales que fortalezcan la unidad y el respeto.',
      'Establecer mecanismos para proteger la seguridad e integridad de los alumnos y prevenir el acoso escolar.',
      'Generar espacios de acompañamiento individual para atender las necesidades de los alumnos.',
    ],
  },
  {
    id: 'PEPSAL-VOC',
    name: 'Vocacional',
    shortName: 'Vocacional',
    color: '#8DC63F',
    objective:
      'Acompañar a los NNAJ en la construcción de su proyecto de vida, integrando de manera armónica sus dimensiones humana, intelectual y espiritual.',
    strategies: [
      'Sistematizar y fortalecer las asignaturas de Autoevaluación, Orientación Vocacional y Formando Corazones.',
      'Presentar progresivamente las vocaciones de vida cristiana a los destinatarios.',
    ],
    interventions: [
      'Formar y acompañar a coordinadores, auxiliares y asesores para impartir estas asignaturas.',
      'Garantizar su impartición semanal, considerando los días inhábiles.',
      'Asegurar que cada alumno de preparatoria cuente con un proyecto de vida y una opción profesional.',
      'Crear, evaluar y actualizar el itinerario de animación vocacional de la obra.',
      'Consolidar el Comité Vocacional y su respectivo manual.',
      'Realizar una invitación personal a los jóvenes que manifiesten habilidades, valores y disposición hacia la vocación religiosa.',
    ],
  },
];

export function getPepsalAreaById(areaId) {
  return PEPSAL_AREAS.find((a) => a.id === areaId) || null;
}

export function getPepsalRetoById(retoId) {
  return PEPSAL_RETOS.find((r) => r.id === retoId) || null;
}

export const DEFAULT_PEPSAL_DOC = {
  title: 'PEPSAL — Proyecto Educativo Pastoral Salesiano Local',
  version: 'Ciclo 26 - 27',
  documentUrl: '',
  notes:
    'Documento oficial del PEPSAL Ciclo 26-27 integrado en el sistema. Si deseas enlazar además el archivo PDF original (>10 MB) en Google Drive o OneDrive, configura aquí el enlace.',
};
