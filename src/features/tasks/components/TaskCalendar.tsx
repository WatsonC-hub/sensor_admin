import moment from 'moment';
import 'moment/dist/locale/da';
import React from 'react';
import {Calendar, Components, Views, momentLocalizer} from 'react-big-calendar';
import withDragAndDrop, {withDragAndDropProps} from 'react-big-calendar/lib/addons/dragAndDrop';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './taskcalendar.css';
import {calculateContentHeight} from '~/consts';

import {useTasks} from '../api/useTasks';
import {useTaskStore} from '../store';
import {Task} from '../types';
moment.locale('da');
const DragAndDropCalendar = withDragAndDrop<Task, object>(Calendar);
const localizer = momentLocalizer(moment);

export default function TaskCalendar() {
  const {patch} = useTasks();

  const {shownTasks, setSelectedTask} = useTaskStore();

  const moveEvent: withDragAndDropProps<Task, object>['onEventDrop'] = ({event, start}) => {
    const existing = shownTasks.find((ev) => ev.id === event.id);
    const filtered = shownTasks.filter((ev) => ev.id !== event.id);
    // if (existing) {
    //   setTasks([...filtered, {...existing, due_date: start as string}]);
    // }
    patch.mutate({
      path: event.id,
      data: {
        due_date: moment(start).format('YYYY-MM-DD'),
      },
    });
  };

  const components: Components<Task> = {
    agenda: {
      time: ({event}) => {
        console.log(event);
        return (
          <div>
            <div>{event.assigned_to.initials}</div>
          </div>
        );
      },
    },
  };

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
      views={['month', 'day', 'agenda']}
      events={shownTasks}
      localizer={localizer}
      onEventDrop={moveEvent}
      onSelectEvent={(event) => setSelectedTask(event.id)}
      //   onEventResize={resizeEvent}
      startAccessor={(event) => new Date(event.due_date)}
      endAccessor={(event) => new Date(event.due_date)}
      allDayAccessor={() => true}
      titleAccessor={(event) => event.opgave}
      popup
      components={components}
      messages={{
        week: 'Uge',
        work_week: 'Arbejdsuge',
        day: 'Dag',
        month: 'Måned',
        previous: 'Forrige',
        next: 'Næste',
        today: 'Idag',
        agenda: 'Agenda',
        date: 'Dato',
        time: 'Tildelt',
        event: 'Opgave',
      }}
      resizable={false}
      style={{height: calculateContentHeight(128)}}
    />
  );
}
