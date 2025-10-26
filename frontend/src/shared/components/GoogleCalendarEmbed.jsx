import * as React from 'react';
import i18n from '../../i18n/index.js';

export default function GoogleCalendarEmbed({
  calendarId,
  timeZone = 'Europe/Bucharest',
  height = 320,
  style = {},
  rounded = false,
  bordered = false,
  title = 'Google Calendar',
}) {
  if (!calendarId) {
    // Render nothing if no calendarId provided
    return null;
  }
  const lang = (i18n?.language || 'en').split('-')[0];
  const src = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=${encodeURIComponent(timeZone)}&hl=${encodeURIComponent(lang)}`;
  const baseStyle = {
    border: bordered ? '1px solid #e0e0e0' : 0,
    borderRadius: rounded ? 12 : 0,
    width: '100%',
    height,
    minHeight: height,
    minWidth: '100%',
    background: 'transparent',
  };
  return (
    <iframe
      title={title}
      src={src}
      style={{ ...baseStyle, ...style }}
      frameBorder="0"
      scrolling="no"
    />
  );
}
