export function parseHours(hours: string): { open: boolean; message: string } {
  if (!hours || !hours.includes('-')) return { open: false, message: 'Hours unavailable' };

  const [startStr, endStr] = hours.split('-').map(str => str.trim());

  const toMinutes = (str: string): number => {
    const [time, period] = str.split(' ');
    let [hour, minute] = time.split(':').map(Number);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour * 60 + (minute || 0);
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
  if (open) {
    message = `Open now — until ${endStr}`;
  } else {
    const minutesUntilOpen =
      startMin > currentMinutes
        ? startMin - currentMinutes
        : 1440 - currentMinutes + startMin;

    const hours = Math.floor(minutesUntilOpen / 60);
    const mins = minutesUntilOpen % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (mins > 0) parts.push(`${mins} minute${mins > 1 ? 's' : ''}`);

    message = `Closed — opens in ${parts.join(' ')}`;
  }

  return { open, message };
}
