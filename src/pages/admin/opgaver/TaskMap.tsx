import {Box} from '@mui/material';
import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import 'leaflet.locatecontrol';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import L, {ContextMenuItemClickEvent} from 'leaflet';
import '~/css/leaflet.css';
import {useEffect, SyntheticEvent, useCallback} from 'react';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import AlertDialog from '~/components/AlertDialog';
import DeleteAlert from '~/components/DeleteAlert';
import {boreholeColors} from '~/consts';
import {NotificationMap} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

import {getColor} from '~/pages/field/overview/components/NotificationIcon';
import SearchAndFilterMap from '~/pages/field/overview/components/SearchAndFilterMap';

import {useAuthStore, useMapUtilityStore} from '~/state/store';
import {BoreholeMapData} from '~/types';

import 'leaflet/dist/leaflet.css';

import 'leaflet-contextmenu/dist/leaflet.contextmenu.min.css';
import useMap from '../../../features/map/components/useMap';
import {
  boreholeSVG,
  defaultCircleMarkerStyle,
  defaultRadius,
  utm,
} from '../../../features/map/mapConsts';
import {useFilteredMapData} from '~/features/map/hooks/useFilteredMapData';

const leafletIcons = Object.keys(boreholeColors).map((key) => {
  const index = parseInt(key);
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: L.Util.template(boreholeSVG, {color: boreholeColors[index].color}),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
});

interface LocItems {
  name: string;
  sensor: boolean;
  group: string;
}

interface MapProps {
  clickCallback?: (data: NotificationMap | BoreholeMapData | null) => void;
}

// type TaskStyling = 'upcoming' | '';
// const taskStyleAtom = atom<TaskStyling>('');

// const Control = () => {
//   const [selectedStyle, setSelectedStyle] = useAtom(taskStyleAtom);

//   return (
//     <TextField
//       select
//       size="small"
//       value={selectedStyle}
//       label={'Vælg filtrering...'}
//       sx={{width: 200, backgroundColor: 'white'}}
//       onChange={(e) => {
//         const value = e.target.value as TaskStyling;
//         setSelectedStyle(value);
//         console.log(value);
//       }}
//     >
//       <MenuItem value={''}>Ingen filtrering</MenuItem>
//       {/* <MenuItem value={'dato'}>Farvelæg på dato</MenuItem> */}
//       <MenuItem value={'ansvarlig'}>Farvelæg mine opgaver</MenuItem>
//     </TextField>
//   );
// };

// const select: Partial<L.Control.StyleSelect> = {
//   onAdd: function () {
//     const div = L.DomUtil.create('div');

//     const root = createRoot(div);
//     root.render(<Control />);

//     return div;
//   },
// };

// L.Control.StyleSelect = L.Control.extend(select);

// L.control.StyleSelect = function (opts: L.ControlOptions) {
//   return new L.Control.StyleSelect(opts);
// };

const Map = ({clickCallback}: MapProps) => {
  const {createStamdata} = useNavigationFunctions();
  const [setSelectLocId, setEditRouteLayer, setEditParkingLayer] = useMapUtilityStore((state) => [
    state.setSelectedLocId,
    state.setEditRouteLayer,
    state.setEditParkingLayer,
  ]);
  // const [filteredData, setFilteredData] = useState<(NotificationMap | BoreholeMapData)[]>([]);
  // const user_id = authStore().user_id;
  // const {hiddenTasks, shownTasks} = useTaskStore();
  // const selectedStyle = useAtomValue<TaskStyling>(taskStyleAtom);

  const [superUser, iotAccess] = useAuthStore((state) => [state.superUser, state.iotAccess]);

  const {data, mapFilteredData: filteredData, setExtraData} = useFilteredMapData();

  const contextmenuItems: Array<L.ContextMenuItem> = [];

  if (iotAccess)
    contextmenuItems.push(
      {
        text: 'Opret ny lokation',
        callback: function (e: ContextMenuItemClickEvent) {
          // @ts-expect-error error in type definition
          const coords = utm.convertLatLngToUtm(e.latlng.lat, e.latlng.lng, 32);

          if (typeof coords == 'object') {
            createStamdata(undefined, {
              state: {
                x: parseFloat(coords.Easting.toFixed(2)),
                y: parseFloat(coords.Northing.toFixed(2)),
              },
            });
          }
        },
        icon: '/leaflet-images/marker.png',
      },
      {
        text: 'separator',
        separator: true,
      }
    );

  const {
    map,
    setSelectedMarker,
    layers: {markerLayer},
    delete: {
      deleteId,
      deleteParking,
      setDeleteTitle,
      deleteRoute,
      deleteTitle,
      displayDelete,
      setDisplayDelete,
      type,
    },
    warning: {displayAlert, setDisplayAlert},
    defaultContextmenuItems,
  } = useMap('test', data, contextmenuItems, clickCallback);

  // useEffect(() => {
  //   if (map) {
  //     new LassoControl({position: 'bottomleft'}).addTo(map);
  //   }
  // }, [map]);

  const createBoreholeMarker = (element: BoreholeMapData) => {
    const point: L.LatLngExpression = [element.latitude, element.longitude];

    const maxStatus = Math.max(...element.status);

    const marker = L.marker(point, {
      icon: leafletIcons[maxStatus],
      interactive: true,
      riseOnHover: true,
      title: element.boreholeno,
      data: element,
      contextmenu: true,
      contextmenuItems: [],
    });

    return marker;
  };

  const createLocationMarker = (element: NotificationMap) => {
    const coords = utm.convertUtmToLatLng(element.x, element.y, 32, 'N');
    if (typeof coords != 'object') return;
    const point: L.LatLngExpression = [coords.lat, coords.lng];
    const marker = L.circleMarker(point, {
      ...defaultCircleMarkerStyle,
      interactive: true,
      fillColor: getColor(element),
      title: element.loc_name,
      data: element,
      contextmenu: true,
    });

    let locationMenu: Array<L.ContextMenuItem> = [
      {
        text: 'Opret tidsserie',
        callback: () => {
          createStamdata('1', {state: element});
        },
        icon: '/leaflet-images/marker.png',
      },
    ];

    if (superUser) {
      locationMenu = [
        ...locationMenu,
        {
          text: 'Tegn rute',
          callback: () => {
            if (map) {
              setSelectLocId(element.loc_id);

              setEditRouteLayer('create');

              map.pm.enableDraw('Line');
            }
          },
          icon: '/mapRoute.png',
        },
        {
          text: 'Tilknyt parkering',
          callback: () => {
            if (map) {
              map.getContainer().style.cursor = 'pointer';

              setSelectLocId(element.loc_id);
              setEditParkingLayer('create');
              toast('Vælg parkering for at tilknytte den lokationen', {
                toastId: 'tilknytParking',
                type: 'info',
                autoClose: false,
                draggable: false,
              });
            }
          },
          icon: '/parking-icon.png',
        },
      ];
    }

    locationMenu = [
      ...locationMenu,
      {text: 'divider', separator: true},
      ...defaultContextmenuItems,
    ];

    marker.bindContextMenu({
      contextmenu: true,
      contextmenuInheritItems: false,
      contextmenuItems: [...locationMenu],
    });

    if (element.obsNotifications.length > 0) {
      const smallMarker = L.circleMarker(point, {
        ...defaultCircleMarkerStyle,
        radius: defaultRadius + 4,
        interactive: false,
        fillOpacity: 1,
        opacity: 1,
        fillColor: getColor(element.obsNotifications[0]),
      });
      if (markerLayer) {
        smallMarker.addTo(markerLayer);
      }
    }

    return marker;
  };

  const handleSearchSelect = useCallback(
    (e: SyntheticEvent, value: string | LocItems | null) => {
      if (value !== null && typeof value == 'object' && markerLayer && map) {
        if (value.sensor) {
          // @ts-expect-error Getlayers returns markers
          const markers: L.Marker[] = markerLayer.getLayers();
          const marker = markers.find((marker) => marker.options.title == value.name);

          if (marker) {
            marker.openPopup();
            map?.flyTo(marker.getLatLng(), 14, {animate: false});
            marker.fire('click');
            setSelectedMarker(marker.options.data);
          } else {
            const newData = data
              ?.filter((item) => 'loc_id' in item)
              .find((item) => item.loc_name == value.name);
            if (newData) {
              const hiddenMarker = createLocationMarker(newData);
              setExtraData(newData);
              setSelectedMarker(newData);
              if (hiddenMarker) {
                // hightlightedMarker = marker;
                hiddenMarker.openPopup();
                map?.flyTo(hiddenMarker.getLatLng(), 14, {animate: false});
                hiddenMarker.fire('click');
              }
            }
          }
        } else {
          apiClient
            .get<BoreholeMapData>(`/sensor_field/jupiter/search/${value.name}`)
            .then((res) => {
              const element = res.data;

              const point: L.LatLngExpression = [element.latitude, element.longitude];

              const marker = createBoreholeMarker(element);

              marker.on('add', function () {
                map?.flyTo(point, 16, {animate: false});
                marker.fire('click');
                setSelectedMarker(element);
              });
              if (markerLayer) {
                marker.addTo(markerLayer);
              }
            });
        }
      }
    },
    [markerLayer]
  );

  useEffect(() => {
    markerLayer?.clearLayers();
    const sorted = filteredData?.sort((a, b) => {
      if ('loc_id' in a && 'loc_id' in b) {
        if (a.flag === b.flag) {
          if (a.obsNotifications.length === 0 && b.obsNotifications.length === 0) return 0;
          if (a.obsNotifications.length === 0) return -1;
          if (b.obsNotifications.length === 0) return 1;
          return a.obsNotifications[0].flag - b.obsNotifications[0].flag;
        }
        return a.flag - b.flag;
      }
      if ('boreholeno' in a && 'boreholeno' in b) {
        return Math.max(...a.status) - Math.max(...b.status);
      }
      return 0;
    });

    sorted?.forEach((element) => {
      if ('loc_id' in element) {
        const marker = createLocationMarker(element);

        if (marker) {
          marker.bindTooltip(element.loc_name, {direction: 'top', offset: [0, -10]});

          if (markerLayer) {
            marker.addTo(markerLayer);
          }
        }
      } else {
        const marker = createBoreholeMarker(element);

        marker.bindTooltip(element.boreholeno, {direction: 'top', offset: [0, -10]});

        if (markerLayer) {
          marker.addTo(markerLayer);
        }
      }
    });
  }, [filteredData]);

  return (
    <>
      <DeleteAlert
        measurementId={deleteId}
        dialogOpen={displayDelete}
        onOkDelete={(id) => {
          if (type === 'parkering') deleteParking(id?.toString());
          else if (type === 'rute') deleteRoute(id?.toString());
        }}
        setDialogOpen={setDisplayDelete}
        title={deleteTitle}
        onCancel={() => setDeleteTitle('Er du sikker du vil slette denne parkering?')}
      />
      <AlertDialog
        open={displayAlert}
        setOpen={setDisplayAlert}
        title="Opret parkering"
        message="Vælg venligst hvor parkeringen skal oprettes."
        handleOpret={() => null}
      />
      <Box position={'absolute'} zIndex={401} p={0} width={'100%'} mr={2}>
        <SearchAndFilterMap data={data} handleSearchSelect={handleSearchSelect} />
      </Box>
      <Box display="flex" position="relative" flexGrow={1}>
        <Box id="test" position="absolute" sx={{height: '100%', width: '100%'}} />
      </Box>
    </>
  );
};

export default Map;
