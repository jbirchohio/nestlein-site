export function expandHours(raw: string): Record<string, string> {
  const output: Record<string, string> = {};
  const days = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const blocks = raw.split(',').map(part => part.trim());

  for (const block of blocks) {
    // Match single day
    const dayMatch = block.match(/^([A-Za-z]+):\s*(.+)$/);
    if (dayMatch) {
      output[dayMatch[1]] = dayMatch[2];
      continue;
    }

    // Match day range
    const rangeMatch = block.match(/^([A-Za-z]+)\s*-\s*([A-Za-z]+)\s+(.+)$/);
    if (rangeMatch) {
      const [, start, end, time] = rangeMatch;
      const startIdx = days.indexOf(start);
      const endIdx = days.indexOf(end);
      if (startIdx === -1 || endIdx === -1) continue;

      const range = startIdx <= endIdx
        ? days.slice(startIdx, endIdx + 1)
        : [...days.slice(startIdx), ...days.slice(0, endIdx + 1)];

      for (const day of range) output[day] = time;
    }
  }

  return output;
}
