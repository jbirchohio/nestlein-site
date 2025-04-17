import { expandHours } from '@/utils/expandHours';

export function parseHours(hours: string): {
  status: 'open' | 'closed' | 'openingSoon' | 'closingSoon';
  message: string;
} {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

  const expanded = expandHours(hours); // Converts blocks into individual day lines

  const regex = new RegExp(
    `${currentDay}:\\s*(\\d{1,2}:\\d{2}\\s*[APMapm]+)\\s*to\\s*(\\d{1,2}:\\d{2}\\s*[APMapm]+)`
  );
  const match = expanded.match(regex);

  if (!match) {
    return {
      status: 'closed',
      message: 'Closed',
    };
  }

  
  const [openH, openM] = to24HourTime(openStr);
  const [closeH, closeM] = to24HourTime(closeStr);

  const openTime = new Date(now);
  openTime.setHours(openH, openM, 0, 0);

  const closeTime = new Date(now);
  closeTime.setHours(closeH, closeM, 0, 0);

  const isOpen = now >= openTime && now < closeTime;
  const diffToOpen = (openTime.getTime() - now.getTime()) / (1000 * 60); // in minutes
  const diffToClose = (closeTime.getTime() - now.getTime()) / (1000 * 60); // in minutes

  if (isOpen) {
    if (diffToClose <= 60) {
      return {
        status: 'closingSoon',
        message: `Closes in ${formatMinutes(diffToClose)}`,
      };
    }
    return {
      status: 'open',
      message: `Open until ${formatTime(closeStr)}`,
    };
  }

  if (diffToOpen > 0 && diffToOpen <= 720) {
    return {
      status: 'openingSoon',
      message: `Opens in ${formatMinutes(diffToOpen)}`,
    };
  }

  return {
    status: 'closed',
    message: 'Closed',
  };
}

function to24HourTime(str: string): [number, number] {
  let hour = parseInt(h, 10);
  const minute = parseInt(m, 10);
  if (/pm/i.test(ampm) && hour !== 12) hour += 12;
  if (/am/i.test(ampm) && hour === 12) hour = 0;
  return [hour, minute];
}

function formatTime(str: string): string {
  const d = new Date();
  const [hour, minute] = to24HourTime(str);
  d.setHours(hour, minute);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatMinutes(minutes: number): string {
  const mins = Math.round(minutes);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainder = mins % 60;
  return remainder === 0
    ? `${hrs} hour${hrs === 1 ? '' : 's'}`
    : `${hrs} hour${hrs === 1 ? '' : 's'} ${remainder} min`;
}
