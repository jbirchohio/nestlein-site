export function expandHours(parsed: Record<string, string>): Record<string, [string, string][]> {
  const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const expanded: Record<string, [string, string][]> = {};

  for (const day of days) {
    expanded[day] = [];
  }

  for (const [key, value] of Object.entries(parsed)) {
    const timeRanges = value.split(',').map(range => {
      const [start, end] = range.split('to').map(t => t.trim());
      return [start, end] as [string, string];
    });

    const dayKeys = key.includes('-')
      ? expandDayRange(key)
      : [key.trim()];

    for (const day of dayKeys) {
      expanded[day] = [...(expanded[day] || []), ...timeRanges];
    }
  }

  return expanded;
}

function expandDayRange(range: string): string[] {
  const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  const [start, end] = range.split('-').map(d => d.trim());
  const startIndex = days.indexOf(start);
  const endIndex = days.indexOf(end);

  if (startIndex === -1 || endIndex === -1) return [];

  if (startIndex <= endIndex) {
    return days.slice(startIndex, endIndex + 1);
  } else {
    return [...days.slice(startIndex), ...days.slice(0, endIndex + 1)];
  }
}
