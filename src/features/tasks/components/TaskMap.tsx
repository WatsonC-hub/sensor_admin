import {Box} from '@mui/material';
import L from 'leaflet';
import {LassoControl, LassoHandlerFinishedEvent} from 'leaflet-lasso';
import React, {useEffect} from 'react';

import {calculateContentHeight} from '~/consts';
import useMap from '~/features/map/components/useMap';
import {defaultCircleMarkerStyle} from '~/features/map/mapConsts';

import {useTaskStore} from '../store';
import {Task} from '../types';

const TaskMap = () => {
  // const mapRef = React.useRef<L.Map | null>(null);
  // const layerRef = React.useRef<L.FeatureGroup | null>(null);

  // const [shownTasks, setSelectedTask] = taskStore((store) => [
  //   store.shownTasks,
  //   store.setSelectedTask,
  // ]);
  const {shownTasks, hiddenTasks, setSelectedTask, setShownMapTaskIds} = useTaskStore();

  const {
    map,
    layers: {markerLayer},
    selectedMarker,
  } = useMap('taskmap', shownTasks, []);

  useEffect(() => {
    if (selectedMarker) {
      setSelectedTask(selectedMarker.id);
    }
  }, [selectedMarker]);

  useEffect(() => {
    if (map) {
      const lassoControl = new LassoControl({position: 'topleft'});
      map.addControl(lassoControl);

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

      const shownByLocid = shownTasks.reduce(
        (acc, task) => {
          if (!acc[task.loc_id]) {
            acc[task.loc_id] = [];
          }
          acc[task.loc_id].push(task);
          return acc;
        },
        {} as Record<number, Task[]>
      );

      const hiddenByLocid = hiddenTasks.reduce(
        (acc, task) => {
          if (!acc[task.loc_id]) {
            acc[task.loc_id] = [];
          }
          acc[task.loc_id].push(task);
          return acc;
        },
        {} as Record<number, Task[]>
      );

      Object.values(hiddenByLocid).forEach((tasks) => {
        L.circleMarker([tasks[0].latitude, tasks[0].longitude], {
          ...defaultCircleMarkerStyle,
          // radius: 5,
          title: tasks[0].name,
          fillColor: 'grey',
          data: tasks,
        })
          .addTo(markerLayer)
          .bindPopup(tasks.map((task) => task.name).join(', '));
      });

      Object.values(shownByLocid).forEach((tasks) => {
        L.circleMarker([tasks[0].latitude, tasks[0].longitude], {
          ...defaultCircleMarkerStyle,
          // radius: 5,
          title: tasks[0].name,
          fillColor: 'green',
          data: tasks,
        })
          .addTo(markerLayer)
          .bindPopup(tasks.map((task) => task.name).join(', '));
      });

      // shownTasks.forEach((task) => {
      //   L.circleMarker([task.latitude, task.longitude], {
      //     ...defaultCircleMarkerStyle,
      //     // radius: 5,
      //     title: task.name,
      //     fillColor: 'blue',
      //     data: task,
      //   })
      //     .addTo(markerLayer)
      //     .bindPopup(task.name);
      // });
    }
  }, [shownTasks, markerLayer, hiddenTasks]);

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
