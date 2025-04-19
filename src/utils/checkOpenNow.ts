import { parseHours } from './parseHours';
import { expandHours } from './expandHours';

function getToday(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

function parseTimeToMinutes(time: string): number {
  const [hour, minutePart] = time.toLowerCase().replace(/\s+/g, '').split(/:|(?=am|pm)/);
  const [minutes, ampm] = [minutePart.replace(/[^0-9]/g, ''), minutePart.replace(/[0-9]/g, '')];
  let h = parseInt(hour, 10);
  let m = parseInt(minutes || '0', 10);
  if (ampm === 'pm' && h !== 12) h += 12;
  if (ampm === 'am' && h === 12) h = 0;
  return h * 60 + m;
}

export function isOpenNow(hours?: string): boolean {
  if (!hours) return false;

  try {
    const parsed = parseHours(hours);
    const expanded = expandHours(parsed);
    const today = getToday();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const ranges = expanded[today];
    if (!ranges || ranges.length === 0) return false;

    return ranges.some(([open, close]) => {
      const [openMin, closeMin] = [parseTimeToMinutes(open), parseTimeToMinutes(close)];
      if (closeMin < openMin) {
        return currentMinutes >= openMin || currentMinutes < closeMin;
      }
      return currentMinutes >= openMin && currentMinutes < closeMin;
    });
  } catch (e) {
    console.warn('Failed to parse hours:', hours, e);
    return false;
  }
}
