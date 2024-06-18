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
  | 'onGlobalFilterChange'
  | 'onShowColumnFiltersChange'
  | 'onShowGlobalFilterChange'
  | 'onSortingChange'
  | 'onPaginationChange'
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
    (
      stateName:
        | 'columnFilters'
        | 'columnVisibility'
        | 'density'
        | 'globalFilter'
        | 'showColumnFilters'
        | 'showGlobalFilter'
        | 'sorting'
        | 'pagination'
    ) =>
      (state: any) => {
        setTableState((prev) => {
          return {
            ...prev,
            [stateName]: state instanceof Function ? state(prev[stateName]) : state,
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
    };
  }, [tableState, stateChangeHandler]);

  return [handlers, () => setTableState(RESET)] as const;
};
