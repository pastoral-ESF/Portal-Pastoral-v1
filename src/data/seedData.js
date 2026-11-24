// Estado inicial limpio de producción para ESFER Salesianos (Chihuahua)
// Conserva el Calendario ESFER 2026-2027 (401 eventos reales) y el Directorio MJS.
import { DEFAULT_PEPSAL_DOC } from '../constants/pepsalCatalog';
import { MJS_GROUPS, SACRAMENTS_WIKI, MULTIMEDIA_CONTENT } from './staticContent';
import { WHATSAPP_CONFIG, DON_BOSCO_CONTEST_URL } from '../constants/config';
import { NOTION_CALENDAR_2026_2027 } from './notionCalendar2026';
import { DEFAULT_EVALUATION_TEMPLATES } from './evaluationTemplates';

export const SEED_DATA = {
  pepsalDoc: DEFAULT_PEPSAL_DOC,

  portalSettings: {
    whatsappPhone: WHATSAPP_CONFIG.phone,
    donBoscoContestUrl: DON_BOSCO_CONTEST_URL,
    vafejeBadge: 'Próximamente · Edición Verano',
    vafejeSubtitle: 'Vacaciones Felices con Jesús · Curso de Verano Salesiano ESFER',
    vafejeDescription:
      '¡Estamos preparando un verano lleno de color, amistad, juegos gigantes y espíritu salesiano en Chihuahua! Muy pronto publicaremos fechas oficiales, sedes, edades e inscripciones.',
    vafejeStatusNote: 'Apertura de inscripciones próximamente',
  },

  mjsGroups: MJS_GROUPS,
  sacraments: SACRAMENTS_WIKI,
  multimedia: MULTIMEDIA_CONTENT,

  cartasDescriptivas: [],
  quickEvents: NOTION_CALENDAR_2026_2027,
  notices: [],
  mjsResources: [],
  accompanimentMessages: [],
  tasks: [],
  evaluationTemplates: DEFAULT_EVALUATION_TEMPLATES,
  eventEvaluationConfigs: {},
};
