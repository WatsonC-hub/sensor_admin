import {Box, MenuItem, TextField} from '@mui/material';
import {atom, useAtom, useAtomValue} from 'jotai';
import L, {CircleMarkerOptions} from 'leaflet';
import {LassoControl, LassoHandlerFinishedEvent} from 'leaflet-lasso';
import moment from 'moment';
import React, {useEffect, useMemo} from 'react';
import {createRoot} from 'react-dom/client';

import {calculateContentHeight} from '~/consts';
import useMap from '~/features/map/components/useMap';
import {defaultCircleMarkerStyle} from '~/features/map/mapConsts';
import {useTaskStore} from '~/features/tasks/store';
import {Task} from '~/features/tasks/types';
import {authStore} from '~/state/store';

type TaskStyling = 'dato' | 'ansvarlig' | 'lukket_opgaver' | '';

const taskStyleAtom = atom<TaskStyling>('dato');

const TaskMap = () => {
  const {shownTasks, hiddenTasks, setSelectedTask, setShownMapTaskIds} = useTaskStore();

  const selectedStyle = useAtomValue<TaskStyling>(taskStyleAtom);
  const user_id = authStore().user_id;
  const shownByLocid = useMemo(() => {
    return Object.values(
      shownTasks.reduce(
        (acc, task) => {
          if (!acc[task.loc_id]) {
            acc[task.loc_id] = [];
          }
          acc[task.loc_id].push(task);
          return acc;
        },
        {} as Record<number, Task[]>
      )
    );
  }, [shownTasks]);

  const hiddenByLocid = useMemo(() => {
    return Object.values(
      hiddenTasks.reduce(
        (acc, task) => {
          if (!acc[task.loc_id]) {
            acc[task.loc_id] = [];
          }
          acc[task.loc_id].push(task);
          return acc;
        },
        {} as Record<number, Task[]>
      )
    );
  }, [hiddenTasks]);
  const {
    map,
    layers: {markerLayer},
    selectedMarker,
  } = useMap('taskmap', shownByLocid, []);

  const select: Partial<L.Control.StyleSelect> = {
    onAdd: function () {
      const div = L.DomUtil.create('div');

      const Control = () => {
        const [selectedStyle, setSelectedStyle] = useAtom(taskStyleAtom);
        console.log(selectedStyle);
        return (
          <TextField
            select
            size="small"
            value={selectedStyle}
            label={'Vælg filtrering...'}
            sx={{width: 200, backgroundColor: 'white'}}
            onChange={(e) => {
              const value = e.target.value as TaskStyling;
              setSelectedStyle(value);
              console.log(value);
            }}
          >
            {/* <MenuItem value={''}>Ingen filtrering</MenuItem> */}
            <MenuItem value={'dato'}>Farvelæg på dato</MenuItem>
            <MenuItem value={'ansvarlig'}>Farvelæg mine opgaver</MenuItem>
            <MenuItem value={'lukket_opgaver'}>Lukket opgaver</MenuItem>
          </TextField>
        );
      };

      const root = createRoot(div);
      root.render(<Control />);

      return div;
    },
  };

  L.Control.StyleSelect = L.Control.extend(select);

  L.control.StyleSelect = function (opts: L.ControlOptions) {
    return new L.Control.StyleSelect(opts);
  };

  const getStyleOptions = (tasks: Array<Task>): object => {
    let style: Partial<CircleMarkerOptions> = {fillColor: 'red'};
    const upcomingTasks = tasks.filter(
      (task) =>
        task.due_date === null ||
        moment(task.due_date).toDate().getTime() > moment().toDate().getTime()
    );
    const overdueTasks = tasks.filter(
      (task) =>
        task.due_date !== null &&
        moment(task.due_date).toDate().getTime() < moment().toDate().getTime() &&
        task.status_id !== 3
    );

    if (tasks.length === overdueTasks.length) {
      return style;
    }

    switch (selectedStyle) {
      case 'dato':
        if (upcomingTasks.length !== 0)
          style = getDueDateColor(
            upcomingTasks.sort((a, b) => {
              return moment(a.due_date).milliseconds() - moment(b.due_date).milliseconds();
            })[0]
          );
        break;
      case 'ansvarlig': {
        const assigned = upcomingTasks.filter((task) => task.assigned_to === user_id);
        if (assigned.length > 0) {
          style = getAssignedColor(assigned[0]);
        }
        break;
      }
      case 'lukket_opgaver': {
        const completedTask = tasks.find((task) => task.status_id === 3);
        style.fillColor = 'blue';
        if (completedTask) return style;
        break;
      }
      default:
        return {fillColor: 'green'};
    }

    return style;
  };

  const getDueDateColor = (task: Task): object => {
    const now = moment();
    const week = now.week();
    const date = moment(task.due_date);
    const due_date_week = date.week();
    let taskColor = 'green';

    if (due_date_week - week === 0) taskColor = 'orange';
    else if (due_date_week - week === 1) taskColor = 'yellow';

    return {fillColor: taskColor};
  };

  const getAssignedColor = (task: Task) => {
    console.log(task.assigned_display_name);
    const assigned = task.assigned_to;
    const status = task.status_id;
    let taskColor = 'grey';
    if (assigned === user_id && status === 1) taskColor = 'green';
    else if (assigned === user_id && status === 2) taskColor = 'orange';
    else if (assigned === user_id && status === 3) taskColor = 'blue';

    return {fillColor: taskColor};
  };

  useEffect(() => {
    if (selectedMarker) {
      console.log('selectedMarker', selectedMarker);
      if (selectedMarker.length == 1) setSelectedTask(selectedMarker[0].id);
    }
  }, [selectedMarker]);

  useEffect(() => {
    if (map) {
      const lassoControl = new LassoControl({position: 'topleft'});
      const selectControl = new L.Control.StyleSelect({position: 'topright'});
      map.addControl(lassoControl);
      map.addControl(selectControl);
      map.on('lasso.finished', (event) => {
        const ids = new Set(
          (event as LassoHandlerFinishedEvent).layers
            .map((layer) => {
              const data = (layer.options as L.CircleMarkerOptions<Task[]>).data as Task[];

              return data.map((task) => task.id);
            })
            .flat()
        );
        setShownMapTaskIds(Array.from(ids));
      });
    }
  }, [map]);

  useEffect(() => {
    if (markerLayer) {
      markerLayer.clearLayers();

      hiddenByLocid.forEach((tasks) => {
        L.circleMarker([tasks[0].latitude, tasks[0].longitude], {
          ...defaultCircleMarkerStyle,
          title: tasks[0].name,
          fillColor: 'grey',
          data: tasks,
        })
          .addTo(markerLayer)
          .bindPopup(tasks.map((task) => task.name).join(', '));
      });
      shownByLocid.forEach((tasks) => {
        L.circleMarker([tasks[0].latitude, tasks[0].longitude], {
          ...defaultCircleMarkerStyle,
          title: tasks[0].name,
          data: tasks,
          ...getStyleOptions(tasks),
        })
          .addTo(markerLayer)
          .bindPopup(tasks.map((task) => task.name).join(', '));
      });
    }
  }, [shownByLocid, hiddenByLocid, markerLayer, selectedStyle]);

  return (
    <Box
      id="taskmap"
      sx={{
        width: '100%',
        height: calculateContentHeight(128),
        flexGrow: 1,
      }}
    ></Box>
  );
};

export default TaskMap;
