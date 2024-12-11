import moment from 'moment';
import 'moment/dist/locale/da';
import React from 'react';
import {Calendar, Components, Views, momentLocalizer} from 'react-big-calendar';
import withDragAndDrop, {withDragAndDropProps} from 'react-big-calendar/lib/addons/dragAndDrop';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './taskcalendar.css';
import {calculateContentHeight} from '~/consts';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';

import {useTasks} from '../api/useTasks';
import {Task} from '../types';

moment.locale('da');

type CalendarTask = Task & {due_date: string};

const DragAndDropCalendar = withDragAndDrop<CalendarTask, object>(Calendar);
const localizer = momentLocalizer(moment);

export default function TaskCalendar() {
  const {patch} = useTasks();

  const {shownTasks, setSelectedTask} = useTaskStore();

  const moveEvent: withDragAndDropProps<Task, object>['onEventDrop'] = ({event, start}) => {
    patch.mutate({
      path: event.id,
      data: {
        ts_id: event.ts_id,
        due_date: moment(start).format('YYYY-MM-DD'),
      },
    });
  };

  const components: Components<CalendarTask> = {
    agenda: {
      time: ({event}: {event?: CalendarTask}) => {
        return (
          <div>
            <div>{event?.assigned_display_name}</div>
          </div>
        );
      },
    },
  };

  const calendarTasks = shownTasks.filter((task) => task.due_date) as CalendarTask[];

  return (
    <DragAndDropCalendar
      culture="da-DK"
      defaultDate={new Date()}
      defaultView={Views.MONTH}
      views={['month', 'day', 'agenda']}
      events={calendarTasks}
      localizer={localizer}
      onEventDrop={moveEvent}
      onDragStart={(event) => console.log('drag start', event)}
      //   onDragOver={(event) => {
      //     event.preventDefault();
      //     console.log('drag over', event);
      //   }}
      onSelectEvent={(event) => setSelectedTask(event.id)}
      //   onEventResize={resizeEvent}
      startAccessor={(event) => new Date(event.due_date)}
      endAccessor={(event) => new Date(event.due_date)}
      allDayAccessor={() => true}
      titleAccessor={(event) => event.name}
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
