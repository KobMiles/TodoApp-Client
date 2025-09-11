export const pad = (n: number) => String(n).padStart(2, '0');

export const toLocalDateTimeParts = (iso?: string | null) => {
  if (!iso) {
    return { date: '', time: '' };
  }
  const d = new Date(iso);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

export const combineLocalToWire = (dateStr: string, timeStr: string) => {
  if (!dateStr) {
    return null;
  }
  const t = timeStr || '00:00';
  return `${dateStr}T${t}:00`;
};

export const buildTimeOptions = (stepMin = 30) => {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMin) {
      opts.push(`${pad(h)}:${pad(m)}`);
    }
  }
  return opts;
};
