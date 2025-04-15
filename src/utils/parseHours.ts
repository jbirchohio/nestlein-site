export function parseHours(hours: string): {
  open: boolean;
  message: string;
  status: 'open' | 'openingSoon' | 'closed';
} {
  if (!hours || !hours.includes('-')) {
    return { open: false, message: 'Hours unavailable', status: 'closed' };
  }
 
  const [startStr, endStr] = hours.split('-').map(str => str.trim());

  const toMinutes = (str: string): number => {
    const [time, period] = str.split(' ');
    let [hour, min] = time.split(':').map(Number);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour * 60 + min;
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMin = toMinutes(startStr);
  const endMin = toMinutes(endStr);

  const open =
    startMin < endMin
      ? currentMinutes >= startMin && currentMinutes < endMin
      : currentMinutes >= startMin || currentMinutes < endMin;

  let message = '';
  let status: 'open' | 'openingSoon' | 'closed' = 'closed';

  if (open) {
    message = `Open now — until ${endStr}`;
    status = 'open';
  } else {
    const minutesUntilOpen =
      startMin > currentMinutes
        ? startMin - currentMinutes
        : 1440 - currentMinutes + startMin;

    const hours = Math.floor(minutesUntilOpen / 60);
    const minutes = minutesUntilOpen % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

    message = `Closed — opens in ${parts.join(' ')}`;
    status = minutesUntilOpen <= 60 ? 'openingSoon' : 'closed';
  }

  return { open, message, status };
}
