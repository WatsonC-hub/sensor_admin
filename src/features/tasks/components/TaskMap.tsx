import {Box, MenuItem, TextField} from '@mui/material';
import {atom, useAtom, useAtomValue} from 'jotai';
import L from 'leaflet';
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

type TaskStyling = 'dato' | 'ansvarlig' | '';

const taskStyleAtom = atom<TaskStyling>('dato');

const TaskMap = () => {
  const {shownTasks, hiddenTasks, setSelectedTask, setShownMapTaskIds} = useTaskStore();

  const selectedStyle = useAtomValue<TaskStyling>(taskStyleAtom);
  const user_id = authStore((state) => state.user_id);
  const shownByLocid = useMemo(() => {
    return Object.values(
      shownTasks
        .filter((task) => task.status_category != 'closed')
        .reduce(
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

  const createMarkers = (tasks: Array<Task>, markerLayer: L.FeatureGroup<any>) => {
    if (selectedStyle === 'ansvarlig') {
      const makeMarker = tasks.some(
        (task) => task.assigned_to === user_id && task.status_category !== 'closed'
      );
      if (makeMarker) {
        L.circleMarker([tasks[0].latitude, tasks[0].longitude], {
          ...defaultCircleMarkerStyle,
          title: tasks[0].name,
          data: tasks,
          fillColor: 'green',
        })
          .addTo(markerLayer)
          .bindPopup(tasks.map((task) => task.name).join(', '));
      }
    } else if (selectedStyle === 'dato') {
      const task = tasks.sort((a, b) => {
        return moment(a.due_date).milliseconds() - moment(b.due_date).milliseconds();
      })[0];
      L.circleMarker([task.latitude, task.longitude], {
        ...defaultCircleMarkerStyle,
        ...getDueDateColor(task),
        title: task.name,
        data: tasks,
      })
        .addTo(markerLayer)
        .bindPopup(tasks.map((task) => task.name).join(', '));
      return;
    }
    L.circleMarker([tasks[0].latitude, tasks[0].longitude], {
      ...defaultCircleMarkerStyle,
      title: tasks[0].name,
      data: tasks,
      fillColor: 'grey',
      fillOpacity: 0.3,
      opacity: 0.3,
    })
      .addTo(markerLayer)
      .bindPopup(tasks.map((task) => task.name).join(', '));
  };

  useEffect(() => {
    if (selectedMarker) {
      console.log('selectedMarker', selectedMarker);
      setSelectedTask(selectedMarker[0].id);
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
          fillOpacity: 0.3,
          opacity: 0.3,
        })
          .addTo(markerLayer)
          .bindPopup(tasks.map((task) => task.name).join(', '));
      });

      shownByLocid.forEach((tasks) => {
        createMarkers(tasks, markerLayer);
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

const getDueDateColor = (task: Task): object => {
  const now = moment();
  const week = now.week();
  const date = moment(task.due_date);
  const due_date_week = date.week();
  let taskColor = 'green';

  if (date.isBefore(now)) taskColor = 'red';
  else if (due_date_week - week < 0) taskColor = 'red';
  else if (due_date_week - week === 0) taskColor = 'orange';
  else if (due_date_week - week === 1) taskColor = 'yellow';

  return {fillColor: taskColor};
};

export default TaskMap;
