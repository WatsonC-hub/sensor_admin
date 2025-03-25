import React, {useCallback, useReducer, useRef} from 'react';
import {elementScroll, useVirtualizer, VirtualizerOptions} from '@tanstack/react-virtual';

import {useFilteredMapData} from '~/features/map/hooks/useFilteredMapData';
import LocationListItem from './LocationListItem';

import {useDisplayState} from '~/hooks/ui';
import {useTaskStore} from '../api/useTaskStore';

function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
}

const LocationListVirtualizer = () => {
  const {listFilteredData} = useFilteredMapData();
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef<number>(0);
  const setLocId = useDisplayState((state) => state.setLocId);
  const getScrollElement = useCallback(() => parentRef.current, []);
  const insertionDirection = useRef<'forward' | 'backward'>('forward');
  const list = listFilteredData.filter((item) => 'loc_id' in item);

  const {tasks} = useTaskStore();

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

          const filteredTasks = tasks?.filter((task) => task.loc_id === item.loc_id);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: filteredTasks ? filteredTasks.length * 48 : 48,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                data-index={virtualRow.index}
                ref={(element) => virtualizer.measureElement(element)}
              >
                <div style={{padding: '10px 0'}}>
                  <LocationListItem
                    key={item.loc_id}
                    itemData={item}
                    onClick={() => setLocId(item.loc_id)}
                  />
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
