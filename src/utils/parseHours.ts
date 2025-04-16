const daysOfWeek = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export function parseHours(hours: string): {
  open: boolean;
  message: string;
  status: 'open' | 'openingSoon' | 'closed';
} {
  if (!hours || typeof hours !== 'string') {
    return { open: false, message: 'Hours unavailable', status: 'closed' };
  }

  const today = daysOfWeek[new Date().getDay()];
  const blocks = hours.split(',').map(h => h.trim());

  let todayHours: string | null = null;

  for (const block of blocks) {
    if (block.includes(':')) {
      // Handle format: "Tuesday: 7:30 AM to 4 PM"
      const [day, times] = block.split(':').map(s => s.trim());
      if (day === today) {
        todayHours = times;
        break;
      }
    } else if (block.includes('-') && block.includes('to')) {
      // Handle format: "Monday - Friday 8:00 AM to 2 PM"
      const [dayRange, timeRange] = block.split(/(?<=\w)\s(?=\d)/); // split on first space before time
      const [startDay, endDay] = dayRange.split('-').map(d => d.trim());

      const startIndex = daysOfWeek.indexOf(startDay);
      const endIndex = daysOfWeek.indexOf(endDay);
      const todayIndex = daysOfWeek.indexOf(today);

      if (
        (startIndex <= todayIndex && todayIndex <= endIndex) ||
        (startIndex > endIndex && (todayIndex >= startIndex || todayIndex <= endIndex))
      ) {
        todayHours = timeRange.trim();
        break;
      }
    }
  }

  if (!todayHours || !todayHours.includes('to')) {
    return { open: false, message: 'Closed today', status: 'closed' };
  }

  const [startStr, endStr] = todayHours.split('to').map(s => s.trim());

  const toMinutes = (str: string): number => {
    const [time, period] = str.split(' ');
    const [hourStr, minuteStr] = time.split(':');
    let hour = Number(hourStr);
    const minute = Number(minuteStr || '0');

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return hour * 60 + minute;
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
