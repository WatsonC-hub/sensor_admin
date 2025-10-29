import React, {useCallback, useRef} from 'react';
import {useVirtualizer} from '@tanstack/react-virtual';

import {useFilteredMapData} from '~/features/map/hooks/useFilteredMapData';
import LocationListItem from './LocationListItem';

import {useDisplayState} from '~/hooks/ui';
import {Box, Divider, Typography} from '@mui/material';
import {useMapFilterStore} from '~/features/map/store';
import {MapOverview} from '~/hooks/query/useNotificationOverview';
import TooltipWrapper from '~/components/TooltipWrapper';
import {BoreholeMapData} from '~/types';
import BoreholeListItem from './BoreholeListItem';
import {createSmoothScrollToFn} from '../helpers';

const LocationListVirtualizer = () => {
  const {listFilteredData} = useFilteredMapData();
  const parentRef = useRef<HTMLDivElement>(null);
  const [setLocId, setBoreholeNo] = useDisplayState((state) => [
    state.setLocId,
    state.setBoreholeNo,
  ]);
  const getScrollElement = useCallback(() => parentRef.current, []);
  const insertionDirection = useRef<'forward' | 'backward'>('forward');
  const locIds = useMapFilterStore((state) => state.locIds);
  const list: (MapOverview | BoreholeMapData | 'divider')[] = listFilteredData
    .filter((item) => typeof item === 'object')
    .sort((a, b) => {
      if ('loc_id' in a && 'loc_id' in b) {
        // tasks that are in locIds should be at the top of the list
        if (locIds.includes(a.loc_id) && !locIds.includes(b.loc_id)) return -1;
        if (!locIds.includes(a.loc_id) && locIds.includes(b.loc_id)) return 1;
        if (a.due_date?.isBefore(b.due_date)) return -1;
        if (a.due_date?.isAfter(b.due_date)) return 1;
      }
      if ('loc_id' in a) return -1;
      if ('loc_id' in b) return 1;
      return 0;
    });

  const scrollToFn = useCallback(
    () => createSmoothScrollToFn(getScrollElement, 800),
    [getScrollElement]
  );

  const boolArray = list.map((item) => {
    if (typeof item == 'object' && 'loc_id' in item) return locIds.includes(item?.loc_id);
    return true;
  });

  const firstNotInLocIds = boolArray.indexOf(false);

  if (firstNotInLocIds !== -1) {
    list.splice(firstNotInLocIds, 0, 'divider');
  }

  const virtualizer = useVirtualizer({
    count: list.length,
    getScrollElement,
    estimateSize: useCallback(() => 48, []),
    enabled: true,
    scrollToFn,
    onChange: (instance) => {
      if (instance.scrollDirection) {
        insertionDirection.current = instance.scrollDirection;
      }
    },
  });

  const items = virtualizer.getVirtualItems();

  return (
    <Box
      ref={parentRef}
      sx={{
        flexGrow: 1,
        width: '100%',
        overflow: 'auto',
      }}
    >
      <Box
        sx={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {items.map((virtualRow) => {
          const item = list[virtualRow.index];

          if (item === 'divider') {
            return (
              <Box
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <Box px={1} py={2} borderTop={2} borderColor="grey.700">
                  <TooltipWrapper description=" Uden for zoom viser de lokationer som ligger udenfor det nuværende kortudsnit som er tilknyttet den valgte bruger i filtreringen.">
                    <Typography variant="h6">Uden for zoom</Typography>
                  </TooltipWrapper>
                </Box>
              </Box>
            );
          }

          const dividerIndex =
            list.length - 1 - boolArray.filter((boolean) => boolean === false).length;
          return (
            <Box
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {'loc_id' in item ? (
                <LocationListItem itemData={item} onClick={() => setLocId(item.loc_id)} />
              ) : (
                <BoreholeListItem itemData={item} onClick={() => setBoreholeNo(item.boreholeno)} />
              )}
              {virtualRow.index > dividerIndex && <Divider />}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default LocationListVirtualizer;
