import React, {useCallback, useReducer, useRef} from 'react';
import {elementScroll, useVirtualizer, VirtualizerOptions} from '@tanstack/react-virtual';

import {useFilteredMapData} from '~/features/map/hooks/useFilteredMapData';
import LocationListItem from './LocationListItem';

import {useDisplayState} from '~/hooks/ui';
import {Box, Divider, Typography} from '@mui/material';
import {useMapFilterStore} from '~/features/map/store';
import {MapOverview} from '~/hooks/query/useNotificationOverview';
import moment from 'moment';
import TooltipWrapper from '~/components/TooltipWrapper';
import {BoreholeMapData} from '~/types';
import BoreholeListItem from './BoreholeListItem';

function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
}

const LocationListVirtualizer = () => {
  const {listFilteredData} = useFilteredMapData();
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef<number>(0);
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
        if (moment(a.due_date).isBefore(b.due_date)) return -1;
        if (moment(a.due_date).isAfter(b.due_date)) return 1;
      }
      if ('loc_id' in a) return -1;
      if ('loc_id' in b) return 1;
      return 0;
    });

  const boolArray = list.map((item) => {
    if (typeof item == 'object' && 'loc_id' in item) return locIds.includes(item?.loc_id);
    return true;
  });
  const firstNotInLocIds = boolArray.indexOf(false);

  if (firstNotInLocIds !== -1) {
    list.splice(firstNotInLocIds, 0, 'divider');
  }

  const rerender = useReducer(() => ({}), {})[1];

  const scrollToFn: VirtualizerOptions<any, any>['scrollToFn'] = useCallback(
    (offset, canSmooth, instance) => {
      const duration = 1000;
      const start = parentRef.current?.scrollTop || 0;
      const startTime = (scrollingRef.current = Date.now());

      const run = () => {
        if (scrollingRef.current !== startTime) return;
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = easeInOutQuint(Math.min(elapsed / duration, 1));
        const interpolated = start + (offset - start) * progress;

        if (elapsed < duration) {
          elementScroll(interpolated, canSmooth, instance);
          requestAnimationFrame(run);
        } else {
          elementScroll(interpolated, canSmooth, instance);
        }
      };

      requestAnimationFrame(run);
    },
    []
  );

  const virtualizer = useVirtualizer({
    count: list.length,
    getScrollElement,
    estimateSize: () => 48,
    enabled: true,
    scrollToFn: scrollToFn,
    onChange: (instance) => {
      if (instance.scrollDirection) {
        insertionDirection.current = instance.scrollDirection;
      }
      rerender();
    },
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="List"
      style={{
        height: window.innerHeight - 150,
        overflowY: 'auto',
        contain: 'strict',
      }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {items.map((virtualRow) => {
          const item = list[virtualRow.index];

          if (item === 'divider') {
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: 48,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div
                  data-index={virtualRow.index}
                  style={{paddingTop: 12}}
                  ref={(element) => virtualizer.measureElement(element)}
                >
                  <Box px={1} py={2} borderTop={2} borderColor="grey.700">
                    <TooltipWrapper description=" Uden for zoom viser de lokationer som ligger udenfor det nuværende kortudsnit.">
                      <Typography variant="h6">Uden for zoom</Typography>
                    </TooltipWrapper>
                  </Box>
                </div>
              </div>
            );
          }

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: 48,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                data-index={virtualRow.index}
                ref={(element) => virtualizer.measureElement(element)}
              >
                <div
                  style={{
                    width: '100%',
                  }}
                >
                  {'loc_id' in item ? (
                    <LocationListItem itemData={item} onClick={() => setLocId(item.loc_id)} />
                  ) : (
                    <BoreholeListItem
                      itemData={item}
                      onClick={() => setBoreholeNo(item.boreholeno)}
                    />
                  )}
                  {virtualRow.index !==
                    list.length -
                      1 -
                      boolArray.filter((boolean) => boolean === false).length -
                      1 && <Divider />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LocationListVirtualizer;
