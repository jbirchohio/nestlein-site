import { expandHours } from './expandHours';

export function parseHours(raw: string): Record<string, [string, string][]> {
  const parsed: Record<string, string> = {};
  const lines = raw.split(/\n|\r|,/).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const match = line.match(/^(?<days>[A-Za-z\s,-]+?)\s+(?<start>\d{1,2}:\d{2}\s*[APMapm]+)\s*(to|-)\s*(?<end>\d{1,2}:\d{2}\s*[APMapm]+)/);
    if (match?.groups?.days && match.groups.start && match.groups.end) {
      const dayKey = normalizeDayRange(match.groups.days);
      parsed[dayKey] = `${match.groups.start} to ${match.groups.end}`;
    }
  }

  return expandHours(parsed);
}

function normalizeDayRange(input: string): string {
  return input
    .replace(/\bMon\b/i, 'Monday')
    .replace(/\bTue\b/i, 'Tuesday')
    .replace(/\bWed\b/i, 'Wednesday')
    .replace(/\bThu\b/i, 'Thursday')
    .replace(/\bFri\b/i, 'Friday')
    .replace(/\bSat\b/i, 'Saturday')
    .replace(/\bSun\b/i, 'Sunday')
    .replace(/\s*–\s*/g, '-') // handle en dashes
    .replace(/\s+/g, ' ') // cleanup spaces
    .trim();
}
