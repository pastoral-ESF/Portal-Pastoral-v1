// Configuración centralizada del Portal Pastoral ESFER Salesianos (Chihuahua)

export const BACKSTAGE_PINS = {
  // Rol 1: Animador MJS (acceso únicamente al Repositorio MJS)
  ANIMADOR: '2026',
  // Rol 2: Agente de Pastoral / Coordinación (acceso completo al Backstage)
  COORDINADOR: '1859',
};

export const ROLES = {
  SDB: 'sdb',
  COORDINADOR: 'coordinador',
  AUXILIAR: 'auxiliar',
  ANIMADOR: 'animador',
};

export const ROLE_LABELS = {
  sdb: 'Salesiano de Don Bosco (SDB)',
  coordinador: 'Coordinador de Pastoral',
  auxiliar: 'Auxiliar / Agente de Pastoral',
  animador: 'Animador MJS',
};

export function isFullAdminRole(role) {
  return role === ROLES.SDB || role === ROLES.COORDINADOR;
}

export function isPastoralTeamRole(role) {
  return role === ROLES.SDB || role === ROLES.COORDINADOR || role === ROLES.AUXILIAR;
}

export const WHATSAPP_CONFIG = {
  // Número configurable en formato internacional sin "+" ni espacios (Ej. 526140000000)
  phone: '526140000000',
  buildMjsUrl(groupName, plantel) {
    const message = `¡Hola! Quisiera pedir informes sobre el grupo *${groupName}* del Movimiento Juvenil Salesiano (MJS) en el plantel *${plantel}* de ESFER Salesianos Chihuahua. ¡Gracias!`;
    return `https://wa.me/${this.phone}?text=${encodeURIComponent(message)}`;
  },
};

export const DON_BOSCO_CONTEST_URL = 'https://concurso-don-bosco-2027.netlify.app';

export const PLANTELES = ['Glandorff', 'Kennedy', 'Cordilleras', 'General'];

export const CARTA_PLANTEL_OPTIONS = [
  'Glandorff',
  'Kennedy',
  'Cordilleras',
  'General',
  'TSJB (Templo San Juan Bosco)',
  'Otro',
];

export const EVALUATION_AUDIENCE_OPTIONS = [
  'Alumno / Participante',
  'Docente / Colaborador',
  'Padre / Madre de Familia',
  'Equipo Organizador',
  'Núcleo de la CEP',
  'Agente de Pastoral',
  'Animador MJS',
  'Padrinos / Invitados',
];

export const EVENT_CATEGORIES = [
  'Pastoral',
  'Misa',
  'MJS',
  'Retiro',
  'Sacramentos',
  'Formación / Pláticas',
  'TSJB / Liturgia',
  'CEP',
  'Comunidad SDB',
  'Inspectorial',
  'Académico',
  'Deportes',
  'Psicopedagógico',
  'Inglés',
  'Junta Interna',
  'Recordatorio',
  'Actividad Pastoral',
];

export const PLANTEL_BADGE_STYLES = {
  Glandorff: 'bg-pastoral/10 text-pastoral border-pastoral/20',
  Kennedy: 'bg-pastoral-cyan/15 text-sky-800 border-pastoral-cyan/30',
  Cordilleras: 'bg-pastoral-lime/20 text-lime-900 border-pastoral-lime/40',
  General: 'bg-pastoral-gold/20 text-amber-900 border-pastoral-gold/40',
  'TSJB (Templo San Juan Bosco)': 'bg-purple-100 text-purple-900 border-purple-200',
  Otro: 'bg-slate-100 text-slate-800 border-slate-300',
};

export const ACTIVITY_STATUSES = [
  'En planeación',
  'Aprobado',
  'Realizado',
  'Pendiente de evaluar',
];

export const STATUS_STYLES = {
  'En planeación': 'bg-amber-50 text-amber-800 border-amber-200',
  Aprobado: 'bg-sky-50 text-sky-800 border-sky-200',
  Realizado: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Pendiente de evaluar': 'bg-rose-50 text-rose-800 border-rose-200',
};

export const AGUINALDO_ACTUAL = {
  year: '2027',
  title: 'LA CARIDAD ES PACIENTE, LA CARIDAD ES BENIGNA',
  motto: '«Consagrados» al bien integral de los jóvenes',
  subtitle: '150.º aniversario de «El Sistema Preventivo en la educación de la juventud» (1877–2027)',
  quote:
    'La práctica de este sistema se apoya por completo en las palabras de San Pablo, que dice: La caridad es benigna y paciente; todo lo soporta, pero todo lo espera y aguanta cualquier dificultad.',
  reference: '1 Cor 13 · San Juan Bosco · Familia Salesiana',
  part1: {
    title: 'Parte I · La caridad es el camino (1 Cor 12,31b–14,1a)',
    summary:
      'La caridad es «el camino más sublime»: el criterio que permite comprobar la autenticidad de la vida cristiana y poner cada don recibido al servicio de los jóvenes como un bien compartido.',
  },
  pillars: [
    {
      name: 'Razón',
      subtitle: 'La pedagogía del encuentro',
      desc: 'Poner en el centro a cada joven concreto, acortando distancias en el patio salesiano con escucha auténtica y la «palabrita al oído».',
    },
    {
      name: 'Religión',
      subtitle: 'Reconocer la sed espiritual',
      desc: 'Acoger las preguntas de los jóvenes, educar su interioridad para escuchar la voz del corazón y descubrir juntos la presencia del Dios vivo.',
    },
    {
      name: 'Amor (Amorevolezza)',
      subtitle: 'Acompañar la experiencia pastoral',
      desc: 'Ejercer un ministerio de compasión al estilo de Jesús en Emaús, con predilección por los más pobres y dejándonos acompañar para acompañar.',
    },
  ],
  conclusion:
    'Celebrar este 150.º aniversario del Sistema Preventivo es una oportunidad providencial para conocer más a fondo el carisma salesiano y renovar nuestro compromiso educativo y pastoral con los jóvenes.',
};

export const DEFAULT_COMMISSIONS = [
  { id: 'com-1', what: 'CONVOCATORIA y SOCIALIZACIÓN', who: '', how: '', material: '' },
  { id: 'com-8', what: 'AVISO A COMUNICACIÓN', who: '', how: '', material: '' },
  { id: 'com-2', what: 'PREPARACIÓN DEL LUGAR', who: '', how: '', material: '' },
  { id: 'com-3', what: 'AMBIENTACIÓN', who: '', how: '', material: '' },
  { id: 'com-4', what: 'SONIDO', who: '', how: '', material: '' },
  { id: 'com-5', what: 'MOBILIARIO', who: '', how: '', material: '' },
  { id: 'com-6', what: 'RECOGER GUARDAR Y/O TIRAR', who: '', how: '', material: '' },
  { id: 'com-7', what: 'EVALUACIÓN', who: '', how: '', material: '' },
];

export const MJS_REPO_GROUPS = [
  'Todos',
  'Pandillas',
  'ADS',
  'Grumis',
  'Acólitos',
  'Coro/Forofos',
];
