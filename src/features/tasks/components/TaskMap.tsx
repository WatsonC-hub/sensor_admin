import {Box} from '@mui/material';
import L from 'leaflet';
import {LassoControl, LassoHandlerFinishedEvent} from 'leaflet-lasso';
import React, {useEffect} from 'react';

import {calculateContentHeight} from '~/consts';
import useMap from '~/features/map/components/useMap';
import {defaultCircleMarkerStyle} from '~/features/map/mapConsts';

import {useTaskStore} from '../store';

const TaskMap = () => {
  // const mapRef = React.useRef<L.Map | null>(null);
  // const layerRef = React.useRef<L.FeatureGroup | null>(null);

  // const [shownTasks, setSelectedTask] = taskStore((store) => [
  //   store.shownTasks,
  //   store.setSelectedTask,
  // ]);
  const {shownTasks, hiddenTasks, setSelectedTask, setShownMapTaskIds} = useTaskStore();

  console.log(shownTasks);
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
          (event as LassoHandlerFinishedEvent).layers.map(
            (layer: L.CircleMarker<Task>) => layer.options.data.id
          )
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
        console.log(task);
        if (task.latitude && task.longitude) {
          console.log([task.latitude, task.longitude]);

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
