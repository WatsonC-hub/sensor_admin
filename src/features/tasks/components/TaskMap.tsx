import {Box} from '@mui/material';
import L from 'leaflet';
import {LassoHandler, LassoHandlerFinishedEvent} from 'leaflet-lasso';
import React, {useEffect} from 'react';

import {calculateContentHeight} from '~/consts';
import useMap from '~/features/map/components/useMap';

import {useTaskStore} from '../store';
import type {Task} from '../types';

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
  } = useMap('taskmap', shownTasks, []);

  useEffect(() => {
    if (markerLayer) {
      markerLayer.on('click', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        if (e.sourceTarget instanceof L.CircleMarker) {
          setSelectedTask((e.sourceTarget.options.data as Task).id);
        }
      });
    }
  }, [markerLayer]);

  useEffect(() => {
    if (map) {
      L.control
        .lasso({
          position: 'topleft',
        })
        .addTo(map);
      map.on('lasso.finished', (event) => {
        const ids = new Set(
          (event as LassoHandlerFinishedEvent).layers.map((layer) => layer.options.data.id)
        );
        setShownMapTaskIds(Array.from(ids));
        console.log(ids);
      });
    }
  }, [map]);

  useEffect(() => {
    if (markerLayer) {
      markerLayer.clearLayers();
      shownTasks.forEach((task) => {
        if (task.latitude && task.longitude) {
          L.circleMarker([task.latitude, task.longitude], {
            radius: 5,
            data: task,
          })
            .addTo(markerLayer)
            .bindPopup(task.name);
        }
      });

      hiddenTasks.forEach((task) => {
        if (task.latitude && task.longitude) {
          L.circleMarker([task.latitude, task.longitude], {
            radius: 5,
            data: task,
            color: 'gray',
          })
            .addTo(markerLayer)
            .bindPopup(task.name);
        }
      });
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
