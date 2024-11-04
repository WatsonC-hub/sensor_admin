import {Box} from '@mui/material';
import L from 'leaflet';
import React, {useEffect} from 'react';

import {mapboxToken, calculateContentHeight} from '~/consts';

import {taskStore} from '../store';

const TaskMap = () => {
  const mapRef = React.useRef<L.Map | null>(null);
  const layerRef = React.useRef<L.FeatureGroup | null>(null);

  const [shownTasks] = taskStore((store) => [store.shownTasks]);
  const renderMap = () => {
    const outdormapbox = L.tileLayer(
      `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
      {
        maxZoom: 20,
        attribution: `© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>`,
        id: 'mapbox/outdoors-v11',
        tileSize: 512,
        zoomOffset: -1,
      }
    );
    const map = L.map('map2', {
      center: [56.215868, 8.228759],
      zoom: 7,
      layers: [outdormapbox],
      tap: false,
      renderer: L.canvas(),
    });

    return map;
  };

  useEffect(() => {
    mapRef.current = renderMap();
    layerRef.current = L.featureGroup().addTo(mapRef.current);
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (layer) {
      layer.clearLayers();
      shownTasks.forEach((task) => {
        if (task.latitude && task.longitude) {
          L.circleMarker([task.latitude, task.longitude]).addTo(layer).bindPopup(task.opgave);
        }
      });
    }
  }, [shownTasks]);

  return (
    <Box
      id="map2"
      sx={{
        width: '100%',
        height: calculateContentHeight(128),
        flexGrow: 1,
      }}
    ></Box>
  );
};

export default TaskMap;
