import { buildTimeOptions, combineLocalToWire, toLocalDateTimeParts } from '../../utils/dateTime';
import { useEffect, useState } from 'react';

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
    onWireChange(combineLocalToWire(date, time));
  }, [date, time, onWireChange]);

  return (
    <div className="modal__row datefield">
      <label className="modal__label" htmlFor={idDate}>Due date</label>
      <input
        id={idDate}
        type="date"
        className="modal__control"
        value={date}
        onChange={(e) => setDate(e.currentTarget.value)}
      />
      <select
        id={idTime}
        aria-label="Time"
        className="time-select"
        value={time}
        onChange={(e) => setTime(e.currentTarget.value)}
      >
        <option value="">--:--</option>
        {TIME_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );
}
