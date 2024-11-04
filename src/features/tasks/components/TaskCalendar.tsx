import moment from 'moment';
import 'moment/dist/locale/da';
import React, {useCallback, useMemo} from 'react';
import {Calendar, Views, momentLocalizer} from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {calculateContentHeight} from '~/consts';

import {taskStore} from '../store';
moment.locale('da');
const DragAndDropCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

export default function TaskCalendar() {
  const [shownTasks, setTasks] = taskStore((store) => [store.shownTasks, store.setTasks]);

  const events = useMemo(() => {
    return shownTasks.map((task) => ({
      id: task.id,
      title: task.opgave,
      allDay: true,
      start: new Date(task.due_date),
      end: new Date(task.due_date),
    }));
  }, [shownTasks]);

  const moveEvent = useCallback(
    ({event, start, end}) => {
      const existing = shownTasks.find((ev) => ev.id === event.id) ?? {};
      const filtered = shownTasks.filter((ev) => ev.id !== event.id);
      console.log('existing', existing);
      setTasks([...filtered, {...existing, due_date: start, allDay: true}]);
    },
    [setTasks, shownTasks]
  );

  //   const resizeEvent = useCallback(
  //     ({event, start, end}) => {
  //       setMyEvents((prev) => {
  //         const existing = prev.find((ev) => ev.id === event.id) ?? {};
  //         const filtered = prev.filter((ev) => ev.id !== event.id);
  //         return [...filtered, {...existing, start, end}];
  //       });
  //     },
  //     [setMyEvents]
  //   );

  return (
    <DragAndDropCalendar
      culture="da-DK"
      defaultDate={new Date()}
      defaultView={Views.MONTH}
      events={shownTasks}
      localizer={localizer}
      onEventDrop={moveEvent}
      //   onEventResize={resizeEvent}
      startAccessor={(event) => new Date(event.due_date)}
      endAccessor={(event) => new Date(event.due_date)}
      allDayAccessor={() => true}
      titleAccessor={(event) => event.opgave}
      popup
      messages={{
        week: 'Uge',
        work_week: 'Arbejdsuge',
        day: 'Dag',
        month: 'Måned',
        previous: 'Forrige',
        next: 'Næste',
        today: 'Idag',
        agenda: 'Agenda',
      }}
      resizable={false}
      style={{height: calculateContentHeight(128)}}
    />
  );
}
