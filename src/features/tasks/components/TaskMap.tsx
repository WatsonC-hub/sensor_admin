import {Box} from '@mui/material';
import L, {CircleMarker} from 'leaflet';
import {LassoControl, LassoHandlerFinishedEvent} from 'leaflet-lasso';
import moment from 'moment';
import React, {useEffect, useMemo, useRef} from 'react';

import {calculateContentHeight} from '~/consts';
import useMap from '~/features/map/components/useMap';
import {defaultCircleMarkerStyle} from '~/features/map/mapConsts';
import {authStore} from '~/state/store';

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
  const assignedRef = useRef<L.LayerGroup | null>(null);
  const dueDateRef = useRef<L.LayerGroup | null>(null);
  const overlayRef = useRef<L.Control.Layers | null>(null);
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

  useEffect(() => {
    if (selectedMarker) {
      console.log('selectedMarker', selectedMarker);
      if (selectedMarker.length == 1) setSelectedTask(selectedMarker[0].id);
    }
  }, [selectedMarker]);

  useEffect(() => {
    if (map) {
      dueDateRef.current = L.featureGroup().addTo(map);
      assignedRef.current = L.featureGroup().addTo(map);
      overlayRef.current = L.control.layers().addTo(map);
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

      map.addLayer(assignedRef.current);
      overlayRef.current.addBaseLayer(dueDateRef.current, 'Dato frist');
      overlayRef.current.addBaseLayer(assignedRef.current, 'Tildelt til');
      map.on('baselayerchange', (e) => {
        console.log('baselayerchange', e);
      });
    }
  }, [map]);

  useEffect(() => {
    if (markerLayer) {
      markerLayer.clearLayers();

      hiddenByLocid.forEach((tasks) => {
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
      if (overlayRef.current) console.log(overlayRef.current.getContainer());
      shownByLocid.forEach((tasks) => {
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
    }
  }, [shownByLocid, hiddenByLocid, markerLayer]);

  const getDueDateColor = (task: Array<Task>): string => {
    const now = moment();
    const week = now.week();
    const year = now.year();
    const date = moment(task[0].due_date);
    const due_date_week = date.week();
    const due_date_year = date.year();
    if (Math.abs(due_date_year - year) >= 1) {
      return 'grey';
    } else {
      if (due_date_week - week < 0) return 'grey';
      else if (due_date_week - week === 0) return 'red';
      else if (due_date_week - week === 1) return 'yellow';
    }

    return 'green';
  };

  const getAssignedColor = (task: Array<Task>) => {
    const assigned = task[0].assigned_to;
    const status = task[0].status_id;
    if (assigned === user_id && status === 0) return 'green';
    else if (assigned === user_id && status === 1) return 'red';
    else if (assigned === user_id && status === 2) return 'blue';

    return 'grey';
  };

  useEffect(() => {
    if (map) {
      if (markerLayer) {
        if (assignedRef.current && map.hasLayer(assignedRef.current))
          markerLayer.getLayers().forEach((layer) => {
            if (
              layer instanceof CircleMarker &&
              !hiddenByLocid.map((task) => task[0].id).includes(layer.options.data.id)
            ) {
              const due_date_marker = L.circleMarker(layer.getLatLng(), {
                ...defaultCircleMarkerStyle,
                title: layer.options.data[0].name,
                data: layer.options.data[0],
                fillColor: getDueDateColor(layer.options.data),
              }).bindPopup(layer.options.data.map((task: Task) => task.name).join(', '));

              dueDateRef.current?.addLayer(due_date_marker);
            }
          });

        if (dueDateRef.current && map.hasLayer(dueDateRef.current))
          markerLayer.getLayers().forEach((layer) => {
            if (
              layer instanceof CircleMarker &&
              !hiddenByLocid.map((task) => task[0].id).includes(layer.options.data.id)
            ) {
              const assigned_marker = L.circleMarker(layer.getLatLng(), {
                ...defaultCircleMarkerStyle,
                title: layer.options.data[0].name,
                data: layer.options.data[0],
                fillColor: getAssignedColor(layer.options.data),
                opacity: layer.options.data[0].assigned_to === user_id ? 1 : 0,
                fillOpacity: layer.options.data[0].assigned_to === user_id ? 1 : 0,
              }).bindPopup(layer.options.data.map((task: Task) => task.name).join(', '));

              assignedRef.current?.addLayer(assigned_marker);
            }
          });
        if (markerLayer.getEvents) {
          const events = markerLayer.getEvents();
          console.log(events);
          if (assignedRef.current && events) assignedRef.current.on(events);
          if (dueDateRef.current && events) dueDateRef.current.on(events);
        }
        // const tildeltTil = markerLayer.eachLayer((layer) => {
        //   if (
        //     layer instanceof CircleMarker &&
        //     !hiddenByLocid.map((task) => task[0].id).includes(layer.options.data.id)
        //   ) {
        //     layer.options.fillColor = getAssignedColor(layer.options.data);
        //   }
        // });

        // const dueDate = markerLayer.eachLayer((layer) => {
        //   if (
        //     layer instanceof CircleMarker &&
        //     !hiddenByLocid.map((task) => task[0].id).includes(layer.options.data.id)
        //   ) {
        //     layer.options.fillColor = getDueDateColor(layer.options.data);
        //   }
        // });
      }
    }
  }, [map, markerLayer]);

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
