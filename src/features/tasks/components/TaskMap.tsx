import {Box} from '@mui/material';
import L from 'leaflet';
import {LassoHandlerFinishedEvent} from 'leaflet-lasso';
import React, {useEffect} from 'react';

import {calculateContentHeight} from '~/consts';
import useMap from '~/features/map/components/useMap';
import {defaultCircleMarkerStyle} from '~/features/map/mapConsts';

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
    selectedMarker,
  } = useMap('taskmap', shownTasks, []);

  useEffect(() => {
    if (selectedMarker) {
      setSelectedTask(selectedMarker.id);
    }
  }, [selectedMarker]);

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

      hiddenTasks.forEach((task) => {
        if (task.latitude && task.longitude) {
          L.circleMarker([task.latitude, task.longitude], {
            ...defaultCircleMarkerStyle,
            // radius: 5,
            title: task.name,
            data: task,
            color: 'gray',
          })
            .addTo(markerLayer)
            .bindPopup(task.name);
        }
      });
      shownTasks.forEach((task) => {
        if (task.latitude && task.longitude) {
          L.circleMarker([task.latitude, task.longitude], {
            ...defaultCircleMarkerStyle,
            // radius: 5,
            title: task.name,
            fillColor: 'blue',
            data: task,
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
