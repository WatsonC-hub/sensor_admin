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
import '~/features/map/map.css';
import {apiClient} from '~/apiClient';
import AlertDialog from '~/components/AlertDialog';
import DeleteAlert from '~/components/DeleteAlert';
import {MapOverview, timeseriesStatusOptions} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

import SearchAndFilterMap from '~/pages/field/overview/components/SearchAndFilterMap';

import {useMapUtilityStore} from '~/state/store';
import {BoreholeMapData} from '~/types';

import 'leaflet/dist/leaflet.css';

import 'leaflet-contextmenu/dist/leaflet.contextmenu.min.css';
import useMap from '../../../features/map/components/useMap';
import {useFilteredMapData} from '~/features/map/hooks/useFilteredMapData';
import {getBoreholesIcon, getNotificationIcon} from '~/features/map/utils';
import {utm} from '../../../features/map/mapConsts';
import {queryClient} from '~/queryClient';
import {useUser} from '~/features/auth/useUser';
import {debounce} from 'lodash';
import {locationInfoOptions} from '~/features/station/api/useLocationInfo';

interface LocItems {
  name: string;
  sensor: boolean;
  group: string;
}

interface MapProps {
  clickCallback?: (data: MapOverview | BoreholeMapData | null) => void;
}

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

  const user = useUser();

  const {data, mapFilteredData: filteredData, setExtraData} = useFilteredMapData();

  const contextmenuItems: Array<L.ContextMenuItem> = [];

  if (user.iotAccess)
    contextmenuItems.push(
      {
        text: 'Opret ny lokation',
        callback: function (e: ContextMenuItemClickEvent) {
          // @ts-expect-error error in type definition
          const coords = utm.convertLatLngToUtm(e.latlng.lat, e.latlng.lng, 32);

          if (typeof coords == 'object') {
            createStamdata({
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
    doneRendering,
  } = useMap('test', data, contextmenuItems, clickCallback);

  const prefetchQueries = (loc_id: number) => {
    queryClient.prefetchQuery(timeseriesStatusOptions(loc_id));
    queryClient.prefetchQuery(locationInfoOptions(loc_id));
  };

  const createBoreholeMarker = (element: BoreholeMapData) => {
    const point: L.LatLngExpression = [element.latitude, element.longitude];
    const marker = L.marker(point, {
      icon: getBoreholesIcon(element),
      interactive: true,
      riseOnHover: true,
      title: element.boreholeno,
      data: element,
      contextmenu: true,
      contextmenuItems: [],
    });

    return marker;
  };

  const createLocationMarker = (element: MapOverview) => {
    const point: L.LatLngExpression = [element.latitude, element.longitude];
    const debounced = debounce(() => prefetchQueries(element.loc_id), 250);
    const marker = L.marker(point, {
      icon: getNotificationIcon(element),
      interactive: true,
      riseOnHover: true,
      title: element.loc_name,
      data: element,
      contextmenu: true,
      contextmenuItems: [],
      zIndexOffset: 1000 * (element.flag ?? 0),
    });

    marker.addEventListener('mouseover', () => debounced());
    marker.addEventListener('mouseout', () => {
      debounced.cancel();
    });

    let locationMenu: Array<L.ContextMenuItem> = [
      {
        text: 'Opret tidsserie',
        callback: () => {
          createStamdata({state: element});
        },
        icon: '/leaflet-images/marker.png',
      },
    ];

    if (user.superUser) {
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

    // if (element.obsNotifications.length > 0) {
    //   const smallMarker = L.circleMarker(point, {
    //     ...defaultCircleMarkerStyle,
    //     radius: defaultRadius + 4,
    //     interactive: false,
    //     fillOpacity: 1,
    //     opacity: 1,
    //     fillColor: getColor(element.obsNotifications[0]),
    //   });
    //   if (markerLayer) {
    //     smallMarker.addTo(markerLayer);
    //   }
    // }

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
          if (a.flag == null && b.flag == null) return 0;
          if (a.flag == null) return -1;
          if (b.flag == null) return 1;
          return a.flag - b.flag;
        }
        return Number(a.has_task) - Number(b.has_task);
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
  }, [filteredData, doneRendering]);

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
      <Box id="test" sx={{width: '100%', height: '100%'}} />
    </>
  );
};

export default Map;
