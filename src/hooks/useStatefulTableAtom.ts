import {useAtom, WritableAtom} from 'jotai';
import {RESET} from 'jotai/utils';
import type {MRT_RowData, MRT_TableOptions, MRT_TableState} from 'material-react-table';
import {useCallback, useMemo} from 'react';

import {statefullTableAtomFamily} from '~/state/atoms';

type StateAndHandlers<TData extends MRT_RowData> = Pick<
  MRT_TableOptions<TData>,
  | 'state'
  | 'onColumnFiltersChange'
  | 'onColumnVisibilityChange'
  | 'onDensityChange'
  | 'onGroupingChange'
  | 'onGlobalFilterChange'
  | 'onShowColumnFiltersChange'
  | 'onShowGlobalFilterChange'
  | 'onSortingChange'
  | 'onPaginationChange'
  | 'onRowSelectionChange'
  | 'onIsFullScreenChange'
  | 'onColumnOrderChange'
  | 'onColumnPinningChange'
  | 'onColumnSizingChange'
  | 'onExpandedChange'
>;

type SetStateActionWithReset<Value> =
  | Value
  | typeof RESET
  | ((prev: Value) => Value | typeof RESET);

export const useStatefullTableAtom = <TData extends MRT_RowData>(key: string) => {
  const atom = statefullTableAtomFamily(key) as WritableAtom<
    Partial<MRT_TableState<TData>>,
    [SetStateActionWithReset<Partial<MRT_TableState<TData>>>],
    void
  >;

  const [tableState, setTableState] = useAtom(atom);

  const stateChangeHandler = useCallback(
    (stateName: keyof Partial<MRT_TableState<TData>>) => (stateOrCallback: any) => {
      if (stateName === 'rowSelection') {
        console.log('stateOrCallback', stateOrCallback);
      }

      setTableState((prev) => {
        return {
          ...prev,
          [stateName]:
            stateOrCallback instanceof Function
              ? stateOrCallback(prev[stateName])
              : stateOrCallback,
        };
      });
    },
    [setTableState]
  );

  const handlers: StateAndHandlers<TData> = useMemo(() => {
    return {
      state: tableState,
      onColumnFiltersChange: stateChangeHandler('columnFilters'),
      onColumnVisibilityChange: stateChangeHandler('columnVisibility'),
      onDensityChange: stateChangeHandler('density'),
      onGlobalFilterChange: stateChangeHandler('globalFilter'),
      onShowColumnFiltersChange: stateChangeHandler('showColumnFilters'),
      onShowGlobalFilterChange: stateChangeHandler('showGlobalFilter'),
      onSortingChange: stateChangeHandler('sorting'),
      onPaginationChange: stateChangeHandler('pagination'),
      onGroupingChange: stateChangeHandler('grouping'),
      onRowSelectionChange: stateChangeHandler('rowSelection'),
      onIsFullScreenChange: stateChangeHandler('isFullScreen'),
      onColumnOrderChange: stateChangeHandler('columnOrder'),
      onColumnPinningChange: stateChangeHandler('columnPinning'),
      onColumnSizingChange: stateChangeHandler('columnSizing'),
      onExpandedChange: stateChangeHandler('expanded'),
    };
  }, [tableState, stateChangeHandler]);

  return [handlers, () => setTableState(RESET)] as const;
};
