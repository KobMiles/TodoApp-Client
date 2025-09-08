import { buildTimeOptions, combineLocalToWire, toLocalDateTimeParts } from '../../utils/dateTime';
import { useEffect, useState } from 'react';

// Поле дати+часу, що піднімає готовий рядок для API (“YYYY-MM-DDTHH:mm:ss”) [5]
const TIME_OPTS = buildTimeOptions();

export function DateTimeField({
  idDate = 'date',
  idTime = 'time',
  isoValue,
  onWireChange,
}: {
  idDate?: string;
  idTime?: string;
  isoValue?: string | null;
  onWireChange: (wire: string | null) => void;
}) {
  const parts = toLocalDateTimeParts(isoValue);
  const [date, setDate] = useState(parts.date);
  const [time, setTime] = useState(parts.time);

  useEffect(() => {
    onWireChange(combineLocalToWire(date, time)); // віддаємо готове значення для API [5]
  }, [date, time, onWireChange]);

  return (
    <div className="modal__row" style={{ gap: 12, alignItems:'center' }}>
      <label className="modal__label" htmlFor={idDate} style={{ width:140 }}>Due date</label>
      <input
        id={idDate}
        type="date"
        value={date}
        onChange={(e) => setDate(e.currentTarget.value)}
        style={{flex:1, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--panel-2)', color:'var(--fg)'}}
      />
      <select
        id={idTime}
        aria-label="Time"
        value={time}
        onChange={(e) => setTime(e.currentTarget.value)}
        style={{ width:160, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--panel-2)', color:'var(--fg)'}}
      >
        <option value="">--:--</option>
        {TIME_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );
}
