// Utilidades para exportar eventos a Google Calendar y archivos .ics (Apple Calendar / Outlook)

function formatDatePart(dateStr, timeStr = '09:00') {
  // dateStr: YYYY-MM-DD, timeStr: HH:mm
  const [year, month, day] = (dateStr || '').split('-');
  const [hours = '09', minutes = '00'] = (timeStr || '09:00').split(':');
  if (!year || !month || !day) return '';
  return `${year}${month}${day}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;
}

function addHoursToTime(timeStr = '09:00', hoursToAdd = 2) {
  const [h = 9, m = 0] = (timeStr || '09:00').split(':').map(Number);
  const totalMinutes = h * 60 + m + hoursToAdd * 60;
  const endH = Math.min(23, Math.floor(totalMinutes / 60));
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

export function buildGoogleCalendarUrl(event) {
  const startTime = event.startTime || '09:00';
  const endTime = event.endTime || addHoursToTime(startTime, 2);
  const start = formatDatePart(event.date, startTime);
  const end = formatDatePart(event.date, endTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.title} · Pastoral ESFER (${event.plantel})`,
    dates: `${start}/${end}`,
    details: [
      event.description || 'Actividad de la Pastoral ESFER Salesianos Chihuahua.',
      `Plantel: ${event.plantel}`,
      event.category ? `Categoría: ${event.category}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    location: event.location || `Colegio ESFER Salesianos - Plantel ${event.plantel}, Chihuahua`,
    ctz: 'America/Chihuahua',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcsText(text = '') {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function downloadIcsFile(event) {
  const startTime = event.startTime || '09:00';
  const endTime = event.endTime || addHoursToTime(startTime, 2);
  const dtStart = formatDatePart(event.date, startTime);
  const dtEnd = formatDatePart(event.date, endTime);
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `${event.id || Date.now()}@pastoral-esfer.chihuahua`;

  const description = [
    event.description || 'Actividad de la Pastoral ESFER Salesianos Chihuahua.',
    `Plantel: ${event.plantel}`,
  ].join('\n');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Colegio ESFER Salesianos//Portal Pastoral//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=America/Chihuahua:${dtStart}`,
    `DTEND;TZID=America/Chihuahua:${dtEnd}`,
    `SUMMARY:${escapeIcsText(`${event.title} (${event.plantel})`)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(event.location || `ESFER Salesianos ${event.plantel}, Chihuahua`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (event.title || 'evento-pastoral')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  link.href = url;
  link.setAttribute('download', `${safeName || 'evento-pastoral'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
