import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  BookOpen,
  CheckCircle2,
  Edit3,
  Trash2,
  Sparkles,
  RefreshCw,
  X,
  Play,
  Palette
} from 'lucide-react';

export const CALENDAR_COLOR_PRESETS = [
  { hex: '#8c4a27', labelET: 'Terrakota / Teak', labelEN: 'Terracotta / Teak' },
  { hex: '#3b6245', labelET: 'Metsaroheline', labelEN: 'Forest Green' },
  { hex: '#2b5c75', labelET: 'Sügavsinine', labelEN: 'Deep Blue' },
  { hex: '#7b2cbf', labelET: 'Ploomililla', labelEN: 'Plum Violet' },
  { hex: '#b7791f', labelET: 'Merevaik / Ooker', labelEN: 'Amber Ochre' },
  { hex: '#9b2c2c', labelET: 'Karmiinpunane', labelEN: 'Crimson' },
  { hex: '#3d4451', labelET: 'Kiltkivi', labelEN: 'Slate Charcoal' },
  { hex: '#0f766e', labelET: 'Meresinine / Teal', labelEN: 'Marine Teal' }
];

function formatCalendarPillTitle(title) {
  if (!title) return '';
  let s = String(title).trim();
  s = s
    .replace(/^Matemaatilise\s+analüüsi\s+(?:kontrolltöö|KT)[:\s]*/i, 'KT: ')
    .replace(/^Kontrolltöö[:\s]*/i, 'KT: ')
    .replace(/^Eksam[:\s]*/i, 'Eksam: ')
    .replace(/^Arvestus[:\s]*/i, 'Arv: ')
    .replace(/^Test[:\s]*/i, 'Test: ');
  if (s.length > 15) {
    return `${s.slice(0, 14).trim()}…`;
  }
  return s;
}

export default function CalendarView({
  t,
  uiLang,
  materials,
  calendarEvents,
  studyPlans,
  onSaveEvent,
  onDeleteEvent,
  onToggleEventCompleted,
  onCreateOrUpdateStudyPlan,
  onToggleSessionCompleted,
  onOpenMaterial
}) {
  const isEN = uiLang === 'en' || t?.nav?.home === 'Home';
  const initialDate = new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0..11
  const [selectedDateStr, setSelectedDateStr] = useState(
    initialDate.toISOString().slice(0, 10)
  );

  // Month & Year scrollable picker dropdown states
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const monthPickerRef = useRef(null);
  const yearPickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(event.target)
      ) {
        setIsMonthOpen(false);
      }
      if (
        yearPickerRef.current &&
        !yearPickerRef.current.contains(event.target)
      ) {
        setIsYearOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const availableYears = useMemo(() => {
    const current = new Date().getFullYear();
    const years = [];
    for (let y = current - 7; y <= current + 12; y++) {
      years.push(y);
    }
    return years;
  }, []);

  function handleMonthWheel(e) {
    if (e.deltaY > 0) {
      handleNextMonth();
    } else if (e.deltaY < 0) {
      handlePrevMonth();
    }
  }

  function handleYearWheel(e) {
    if (e.deltaY > 0) {
      setViewYear((y) => y + 1);
    } else if (e.deltaY < 0) {
      setViewYear((y) => y - 1);
    }
  }

  // Event Add/Edit Modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('test');
  const [subject, setSubject] = useState('Matemaatiline analüüs');
  const [date, setDate] = useState(initialDate.toISOString().slice(0, 10));
  const [time, setTime] = useState('10:15');
  const [notes, setNotes] = useState('');
  const [linkedMaterialIds, setLinkedMaterialIds] = useState([]);
  const [dailyMinutes, setDailyMinutes] = useState(25);
  const [color, setColor] = useState('#8c4a27');
  const [planDays, setPlanDays] = useState(5);

  // Plan builder inline state per event
  const [planInputMinutesByEvent, setPlanInputMinutesByEvent] = useState({});
  const [planInputDaysByEvent, setPlanInputDaysByEvent] = useState({});

  function openNewEventModal(prefillDate = null) {
    setEditingEventId(null);
    setTitle('');
    setEventType('test');
    setSubject(materials[0]?.subject || 'Matemaatiline analüüs');
    setDate(prefillDate || selectedDateStr || new Date().toISOString().slice(0, 10));
    setTime('10:15');
    setNotes('');
    setLinkedMaterialIds(materials[0] ? [materials[0].id] : []);
    setDailyMinutes(25);
    setColor('#8c4a27');
    setPlanDays(5);
    setIsEventModalOpen(true);
  }

  function openEditEventModal(ev) {
    setEditingEventId(ev.id);
    setTitle(ev.title || '');
    setEventType(ev.type || 'test');
    setSubject(ev.subject || 'Matemaatiline analüüs');
    setDate(ev.date || new Date().toISOString().slice(0, 10));
    setTime(ev.time || '');
    setNotes(ev.notes || '');
    setLinkedMaterialIds(ev.linkedMaterialIds || []);
    setDailyMinutes(ev.dailyMinutes || 25);
    setColor(ev.color || '#8c4a27');
    setPlanDays(ev.planDays || 5);
    setIsEventModalOpen(true);
  }

  function toggleLinkedMaterial(matId) {
    setLinkedMaterialIds((prev) =>
      prev.includes(matId)
        ? prev.filter((id) => id !== matId)
        : [...prev, matId]
    );
  }

  function handleEventFormSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const existing = calendarEvents.find((ev) => ev.id === editingEventId);
    const savedEvent = {
      id: editingEventId || `evt-${Date.now()}`,
      title: title.trim(),
      type: eventType,
      subject,
      date,
      time: time.trim(),
      notes: notes.trim(),
      completed: existing ? existing.completed : false,
      linkedMaterialIds,
      dailyMinutes: Number(dailyMinutes) || 25,
      color: color || '#8c4a27',
      planDays: Number(planDays) || 5
    };

    onSaveEvent(savedEvent);
    setIsEventModalOpen(false);
  }

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  // Build calendar cells for current month (Monday-first week)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Convert Sunday=0..Saturday=6 to Monday=0..Sunday=6
    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;

    const cells = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ isPadding: true, key: `pad-start-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(
        2,
        '0'
      )}-${String(day).padStart(2, '0')}`;

      const dayEvents = calendarEvents.filter((ev) => ev.date === dateStr);
      const daySessions = [];
      for (const plan of studyPlans) {
        for (const sess of plan.sessions || []) {
          if (sess.date === dateStr) {
            daySessions.push(sess);
          }
        }
      }

      cells.push({
        isPadding: false,
        key: dateStr,
        day,
        dateStr,
        dayEvents,
        daySessions
      });
    }

    return cells;
  }, [viewYear, viewMonth, calendarEvents, studyPlans]);

  const sortedEvents = [...calendarEvents].sort((a, b) =>
    (a.date || '').localeCompare(b.date || '')
  );

  const subjectOptions = Array.from(
    new Set([
      ...(t.subjects || []),
      ...materials.map((m) => m.subject).filter(Boolean)
    ])
  );

  return (
    <div className="calendar-view container">
      <div className="library-header">
        <div>
          <h1 className="page-title">{t.calendar.title}</h1>
          <p className="page-subtitle">{t.calendar.subtitle}</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openNewEventModal()}
        >
          <Plus size={18} />
          <span>{t.calendar.addEventBtn}</span>
        </button>
      </div>

      <div className="calendar-layout-grid">
        {/* Monthly Calendar Grid (Kuuvaade) */}
        <div className="calendar-month-card">
          <div className="calendar-month-header">
            <button
              type="button"
              className="icon-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="calendar-picker-group">
              {/* Kuu valija: klõpsatav ja allapoole keritav / rullitav */}
              <div className="calendar-picker-wrapper" ref={monthPickerRef}>
                <button
                  type="button"
                  className={`calendar-picker-trigger ${isMonthOpen ? 'active' : ''}`}
                  onClick={() => {
                    setIsMonthOpen((prev) => !prev);
                    setIsYearOpen(false);
                  }}
                  onWheel={handleMonthWheel}
                  title={isEN ? 'Click to open month list or scroll with mouse wheel' : 'Klõpsa kuude nimekirja avamiseks või keri hiirerulliga'}
                  aria-haspopup="listbox"
                  aria-expanded={isMonthOpen}
                >
                  <span className="picker-label">{t.calendar.months[viewMonth]}</span>
                  <ChevronDown
                    size={15}
                    className={`picker-chevron ${isMonthOpen ? 'open' : ''}`}
                  />
                </button>

                {isMonthOpen && (
                  <div
                    className="calendar-picker-dropdown scrollable-dropdown"
                    role="listbox"
                  >
                    {t.calendar.months.map((mName, mIdx) => (
                      <button
                        key={mIdx}
                        type="button"
                        className={`calendar-picker-item ${
                          mIdx === viewMonth ? 'selected' : ''
                        }`}
                        onClick={() => {
                          setViewMonth(mIdx);
                          setIsMonthOpen(false);
                        }}
                        role="option"
                        aria-selected={mIdx === viewMonth}
                      >
                        {mName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Aasta valija: klõpsatav ja allapoole keritav / rullitav */}
              <div className="calendar-picker-wrapper" ref={yearPickerRef}>
                <button
                  type="button"
                  className={`calendar-picker-trigger ${isYearOpen ? 'active' : ''}`}
                  onClick={() => {
                    setIsYearOpen((prev) => !prev);
                    setIsMonthOpen(false);
                  }}
                  onWheel={handleYearWheel}
                  title={isEN ? 'Click to open year list or scroll with mouse wheel' : 'Klõpsa aastate nimekirja avamiseks või keri hiirerulliga'}
                  aria-haspopup="listbox"
                  aria-expanded={isYearOpen}
                >
                  <span className="picker-label">{viewYear}</span>
                  <ChevronDown
                    size={15}
                    className={`picker-chevron ${isYearOpen ? 'open' : ''}`}
                  />
                </button>

                {isYearOpen && (
                  <div
                    className="calendar-picker-dropdown scrollable-dropdown years-dropdown"
                    role="listbox"
                  >
                    {availableYears.map((yearVal) => (
                      <button
                        key={yearVal}
                        type="button"
                        className={`calendar-picker-item ${
                          yearVal === viewYear ? 'selected' : ''
                        }`}
                        onClick={() => {
                          setViewYear(yearVal);
                          setIsYearOpen(false);
                        }}
                        role="option"
                        aria-selected={yearVal === viewYear}
                      >
                        {yearVal}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="calendar-weekdays-row">
            {t.calendar.weekdaysShort.map((wd) => (
              <div key={wd} className="calendar-weekday-cell">
                {wd}
              </div>
            ))}
          </div>

          <div className="calendar-days-grid">
            {calendarCells.map((cell) => {
              if (cell.isPadding) {
                return (
                  <div
                    key={cell.key}
                    className="calendar-day-cell padding-cell"
                  />
                );
              }
              const isSelected = cell.dateStr === selectedDateStr;
              const isToday =
                cell.dateStr === new Date().toISOString().slice(0, 10);

              return (
                <div
                  key={cell.key}
                  className={`calendar-day-cell ${
                    isSelected ? 'selected-day' : ''
                  } ${isToday ? 'today-cell' : ''}`}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  onDoubleClick={() => openNewEventModal(cell.dateStr)}
                >
                  <div className="day-number-row">
                    <span className="day-num">{cell.day}</span>
                    {cell.dayEvents.length > 0 && (
                      <span className="day-event-dot" />
                    )}
                  </div>

                  <div className="day-pills-stack">
                    {cell.dayEvents.slice(0, 2).map((ev) => {
                      const shortTitle = formatCalendarPillTitle(ev.title);
                      const pillStyle = !ev.completed && ev.color ? {
                        backgroundColor: ev.color,
                        borderColor: ev.color,
                        color: '#ffffff'
                      } : undefined;
                      return (
                        <span
                          key={ev.id}
                          className={`day-event-pill ${
                            ev.completed ? 'pill-done' : 'pill-deadline'
                          }`}
                          style={pillStyle}
                          title={ev.title}
                        >
                          {shortTitle}
                        </span>
                      );
                    })}

                    {cell.daySessions.slice(0, 2).map((sess) => {
                      const shortTopic =
                        (sess.topicTitle || '').length > 14
                          ? `${sess.topicTitle.slice(0, 13).trim()}…`
                          : sess.topicTitle;
                      const sessionStyle = !sess.completed && sess.eventColor ? {
                        borderLeft: `3px solid ${sess.eventColor}`
                      } : undefined;
                      return (
                        <span
                          key={sess.id}
                          className={`day-event-pill pill-session ${
                            sess.completed ? 'pill-done' : ''
                          }`}
                          style={sessionStyle}
                          title={`${sess.topicTitle} (${sess.minutes} min)`}
                        >
                          <BookOpen size={11} className="mr-1 inline-block" />
                          <span>{shortTopic}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deadlines List & Study Plan Generator */}
        <div className="calendar-events-column">
          {sortedEvents.map((ev) => {
            const linkedMats = materials.filter((m) =>
              (ev.linkedMaterialIds || []).includes(m.id)
            );
            const existingPlan = studyPlans.find((p) => p.eventId === ev.id);
            const dateChangedSincePlan =
              existingPlan && existingPlan.targetDate !== ev.date;

            const todayMidnight = new Date();
            todayMidnight.setHours(0, 0, 0, 0);
            const [ey, em, ed] = (ev.date || '').split('-').map(Number);
            const eventMidnight = ey && em && ed ? new Date(ey, em - 1, ed) : new Date();
            eventMidnight.setHours(0, 0, 0, 0);
            const diffDaysRaw = Math.round((eventMidnight.getTime() - todayMidnight.getTime()) / 86400000);
            const daysUntilEvent = Math.max(1, diffDaysRaw);

            const currentMinutesVal =
              planInputMinutesByEvent[ev.id] ??
              existingPlan?.dailyMinutes ??
              ev.dailyMinutes ??
              25;

            const currentDaysVal =
              planInputDaysByEvent[ev.id] ??
              existingPlan?.totalDays ??
              ev.planDays ??
              Math.min(daysUntilEvent, 5);

            return (
              <article
                key={ev.id}
                className={`calendar-event-card ${
                  ev.completed ? 'event-completed' : ''
                }`}
                style={!ev.completed && ev.color ? { borderLeftColor: ev.color } : undefined}
              >
                <div className="event-card-top">
                  <div className="material-badges" style={{ marginBottom: 0 }}>
                    <span
                      className="event-color-pill-tag"
                      style={{ backgroundColor: ev.color || '#8c4a27' }}
                      title={ev.color || '#8c4a27'}
                    />
                    <span className="badge badge-violet">
                      {t.calendar.types[ev.type] || ev.type}
                    </span>
                    <span className="badge badge-neutral">{ev.subject}</span>
                    {ev.completed && (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} />
                        {t.calendar.completedBadge}
                      </span>
                    )}
                  </div>

                  <div className="event-actions-group">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => onToggleEventCompleted(ev.id)}
                      title={t.calendar.markDone}
                    >
                      <CheckCircle2 size={15} />
                      <span>{t.calendar.markDone}</span>
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => openEditEventModal(ev)}
                      title={t.calendar.editEventTitle}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn danger-btn"
                      onClick={() => onDeleteEvent(ev.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="event-card-title">{ev.title}</h3>

                <div className="event-datetime-line">
                  <CalendarIcon size={14} />
                  <strong>{ev.date}</strong>
                  {ev.time && (
                    <>
                      <span>•</span>
                      <Clock size={14} />
                      <span>{ev.time}</span>
                    </>
                  )}
                </div>

                {ev.notes && <p className="event-notes-text">{ev.notes}</p>}

                {/* Linked Materials */}
                {linkedMats.length > 0 && (
                  <div className="event-linked-box">
                    <span className="subsection-title" style={{ marginBottom: '0.4rem' }}>
                      {t.upcomingDeadlines.linkedMaterials}:
                    </span>
                    <div className="deadline-linked-pills">
                      {linkedMats.map((lm) => (
                        <button
                          key={lm.id}
                          type="button"
                          className="source-ref-btn"
                          onClick={() => onOpenMaterial(lm.id)}
                        >
                          <BookOpen size={13} />
                          <span>{lm.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Study Plan Generator ("Koosta kordamisplaan") */}
                {linkedMats.length > 0 && !ev.completed && (
                  <div className="study-plan-builder-box">
                    {dateChangedSincePlan && (
                      <div className="mode-info-banner mb-2">
                        <span>{t.calendar.dateChangedNotice}</span>
                      </div>
                    )}

                    <div className="plan-builder-header">
                      <span className="plan-builder-badge">
                        <Clock size={13} />
                        {t.calendar.planSettingsTitle}
                      </span>
                    </div>

                    <div className="plan-inputs-grid">
                      {/* Daily minutes input & quick chips */}
                      <div className="plan-input-card">
                        <label className="plan-minutes-label">
                          <Clock size={14} />
                          <span>{t.calendar.dailyMinutesLabel}</span>
                        </label>
                        <div className="plan-input-with-presets">
                          <div className="plan-minutes-input-group">
                            <input
                              type="number"
                              min={5}
                              max={240}
                              step={5}
                              className="form-input plan-min-input"
                              value={currentMinutesVal}
                              onChange={(e) =>
                                setPlanInputMinutesByEvent((prev) => ({
                                  ...prev,
                                  [ev.id]: e.target.value
                                }))
                              }
                            />
                            <span className="minutes-unit">
                              {t.calendar.minutesPerDay}
                            </span>
                          </div>
                          <div className="plan-quick-presets">
                            {[15, 25, 45, 60].map((mins) => (
                              <button
                                key={mins}
                                type="button"
                                className={`preset-chip ${Number(currentMinutesVal) === mins ? 'active' : ''}`}
                                onClick={() =>
                                  setPlanInputMinutesByEvent((prev) => ({
                                    ...prev,
                                    [ev.id]: mins
                                  }))
                                }
                              >
                                {mins} min
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Number of days input & quick chips */}
                      <div className="plan-input-card">
                        <label className="plan-minutes-label">
                          <CalendarIcon size={14} />
                          <span>{t.calendar.planDaysLabel}</span>
                        </label>
                        <div className="plan-input-with-presets">
                          <div className="plan-minutes-input-group">
                            <input
                              type="number"
                              min={1}
                              max={60}
                              step={1}
                              className="form-input plan-min-input"
                              value={currentDaysVal}
                              onChange={(e) =>
                                setPlanInputDaysByEvent((prev) => ({
                                  ...prev,
                                  [ev.id]: e.target.value
                                }))
                              }
                            />
                            <span className="minutes-unit">
                              {t.calendar.daysUnit}
                            </span>
                          </div>
                          <div className="plan-quick-presets">
                            {[3, 5, 7].map((dCount) => (
                              <button
                                key={dCount}
                                type="button"
                                className={`preset-chip ${Number(currentDaysVal) === dCount ? 'active' : ''}`}
                                onClick={() =>
                                  setPlanInputDaysByEvent((prev) => ({
                                    ...prev,
                                    [ev.id]: dCount
                                  }))
                                }
                              >
                                {dCount} {dCount === 1 ? t.calendar.daySingular : t.calendar.dayPlural}
                              </button>
                            ))}
                            {daysUntilEvent > 0 && (
                              <button
                                type="button"
                                className={`preset-chip ${Number(currentDaysVal) === daysUntilEvent ? 'active' : ''}`}
                                onClick={() =>
                                  setPlanInputDaysByEvent((prev) => ({
                                    ...prev,
                                    [ev.id]: daysUntilEvent
                                  }))
                                }
                                title={`${daysUntilEvent} ${t.calendar.daysUntilDeadline}`}
                              >
                                {t.calendar.untilDeadlineLabel} ({daysUntilEvent} {daysUntilEvent === 1 ? t.calendar.daySingular : t.calendar.dayPlural})
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="plan-actions-bar mt-3">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          onCreateOrUpdateStudyPlan(
                            ev,
                            Number(currentMinutesVal) || 25,
                            Number(currentDaysVal) || Math.min(daysUntilEvent, 5)
                          )
                        }
                      >
                        {existingPlan ? (
                          <>
                            <RefreshCw size={14} />
                            <span>{t.calendar.regeneratePlanBtn}</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>{t.calendar.createPlanBtn}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {existingPlan &&
                      existingPlan.sessions &&
                      existingPlan.sessions.length > 0 && (
                        <div className="plan-sessions-list">
                          <div className="plan-sessions-header">
                            <strong>
                              {t.calendar.planCreatedBanner} (
                              {existingPlan.sessions.length}{' '}
                              {existingPlan.sessions.length === 1
                                ? t.calendar.daySingular
                                : t.calendar.dayPlural}{' '}
                              • {existingPlan.dailyMinutes}{' '}
                              {t.calendar.minutesPerDay})
                            </strong>
                          </div>
                          {existingPlan.sessions.map((sess) => (
                            <div
                              key={sess.id}
                              className={`plan-session-row ${
                                sess.completed ? 'session-done' : ''
                              }`}
                            >
                              <label className="session-check-label">
                                <input
                                  type="checkbox"
                                  checked={Boolean(sess.completed)}
                                  onChange={() =>
                                    onToggleSessionCompleted(
                                      existingPlan.id,
                                      sess.id
                                    )
                                  }
                                />
                                <span className="session-date-badge">
                                  {sess.date}
                                </span>
                                <span className="session-topic-name">
                                  {sess.topicTitle}
                                </span>
                              </label>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() =>
                                  onOpenMaterial(sess.materialId, 'summary')
                                }
                              >
                                <Play size={13} />
                                <span>{sess.minutes} min</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Calendar Event Modal */}
      {isEventModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsEventModalOpen(false)}
        >
          <div
            className="modal-card upload-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-icon-badge">
                  <CalendarIcon size={18} />
                </span>
                <h2>
                  {editingEventId
                    ? t.calendar.editEventTitle
                    : t.calendar.newEventTitle}
                </h2>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsEventModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEventFormSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  {t.calendar.eventTitleLabel}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t.calendar.eventTitlePlaceholder}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="topic-two-col">
                <div className="form-group">
                  <label className="form-label">
                    {t.calendar.eventTypeLabel}
                  </label>
                  <select
                    className="form-select"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    {Object.entries(t.calendar.types).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {t.calendar.subjectLabel}
                  </label>
                  <select
                    className="form-select"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    {subjectOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="topic-two-col">
                <div className="form-group">
                  <label className="form-label">{t.calendar.dateLabel}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.calendar.timeLabel}</label>
                  <input
                    type="time"
                    className="form-input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.calendar.notesLabel}</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder={t.calendar.notesPlaceholder}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Palette size={14} />
                  <span>{t.calendar.colorLabel}</span>
                </label>
                <div className="color-swatches-grid">
                  {CALENDAR_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      className={`color-swatch-circle ${color === preset.hex ? 'active' : ''}`}
                      style={{ backgroundColor: preset.hex }}
                      onClick={() => setColor(preset.hex)}
                      title={preset.labelET}
                      aria-label={preset.labelET}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {t.calendar.linkedMaterialsLabel}
                </label>
                <div className="feature-checkbox-grid">
                  {materials.map((mat) => (
                    <label
                      key={mat.id}
                      className={`feature-toggle-chip ${
                        linkedMaterialIds.includes(mat.id) ? 'active' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={linkedMaterialIds.includes(mat.id)}
                        onChange={() => toggleLinkedMaterial(mat.id)}
                      />
                      <span>{mat.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEventModalOpen(false)}
                >
                  {t.upload.cancelBtn}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t.calendar.saveEventBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
