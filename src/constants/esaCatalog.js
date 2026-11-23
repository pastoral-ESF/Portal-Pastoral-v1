// Catálogo oficial del Modelo ESA (Escuela Salesiana en América)
// 4 Dimensiones y 16 Subdimensiones

export const ESA_DIMENSIONS = [
  {
    id: 'D1',
    number: 1,
    name: '1. Liderazgo Salesiano',
    shortName: 'Liderazgo Salesiano',
    color: '#2B3890',
    subdimensions: [
      { id: '1.1', name: '1.1 Identidad salesiana y formación carismática' },
      { id: '1.2', name: '1.2 Liderazgo directivo y mejoramiento institucional' },
      { id: '1.3', name: '1.3 Acompañamiento y colaboración para animar el PEP' },
      { id: '1.4', name: '1.4 Redes de comunicación interna y marketing del PEP' },
    ],
  },
  {
    id: 'D2',
    number: 2,
    name: '2. Gestión Pedagógica Evangelizadora',
    shortName: 'Gestión Pedagógica',
    color: '#00ADEF',
    subdimensions: [
      { id: '2.1', name: '2.1 Gestión pedagógica y curricular centrada en el estudiante' },
      { id: '2.2', name: '2.2 Enseñanza Religiosa Escolar y formación espiritual' },
      { id: '2.3', name: '2.3 Docentes salesianos como agentes de innovación' },
      { id: '2.4', name: '2.4 Acompañamiento y desarrollo profesional de educadores' },
    ],
  },
  {
    id: 'D3',
    number: 3,
    name: '3. Animación y Acompañamiento Pastoral',
    shortName: 'Animación Pastoral',
    color: '#FBB03B',
    subdimensions: [
      { id: '3.1', name: '3.1 Acompañamiento salesiano y proyecto de vida' },
      { id: '3.2', name: '3.2 Formación humana y espiritual de estudiantes, educadores y familias' },
      { id: '3.3', name: '3.3 Gestión de la sana convivencia y espíritu de familia' },
      { id: '3.4', name: '3.4 Protagonismo juvenil, ciudadanía activa y ecología integral' },
    ],
  },
  {
    id: 'D4',
    number: 4,
    name: '4. Gestión de Resultados Significativos',
    shortName: 'Resultados Significativos',
    color: '#8DC63F',
    subdimensions: [
      { id: '4.1', name: '4.1 Gestión eficiente de recursos administrativos y financieros' },
      { id: '4.2', name: '4.2 Resultados del aprendizaje integral para el siglo XXI' },
      { id: '4.3', name: '4.3 Participación e incidencia en el medio social' },
      { id: '4.4', name: '4.4 Proyectos innovadores que fortalezcan la significatividad' },
    ],
  },
];

export function getDimensionById(dimId) {
  return ESA_DIMENSIONS.find((d) => d.id === dimId) || null;
}

export function getSubdimensionById(subId) {
  for (const dim of ESA_DIMENSIONS) {
    const found = dim.subdimensions.find((s) => s.id === subId);
    if (found) return { ...found, dimension: dim };
  }
  return null;
}
