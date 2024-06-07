import {useAtom, WritableAtom} from 'jotai';
import {RESET} from 'jotai/utils';
import type {MRT_RowData, MRT_TableOptions, MRT_TableState} from 'material-react-table';

import {statefullTableAtomFamily} from '~/state/atoms';

// type StateAndHandlers = {
//   state: Partial<MRT_TableState<MRT_RowData>>;
//   onColumnFiltersChange: (state: MRT_ColumnFiltersState) => void;
//   onColumnVisibilityChange: (state: MRT_TableState<MRT_RowData>['columnVisibility']) => void;
//   onDensityChange: (state: MRT_TableState<MRT_RowData>['density']) => void;
//   onGlobalFilterChange: (state: MRT_TableState<MRT_RowData>['globalFilter']) => void;
//   onShowColumnFiltersChange: (state: MRT_TableState<MRT_RowData>['showColumnFilters']) => void;
//   onShowGlobalFilterChange: (state: MRT_TableState<MRT_RowData>['showGlobalFilter']) => void;
//   onSortingChange: (state: MRT_TableState<MRT_RowData>['sorting']) => void;
//   onPaginationChange: (state: MRT_TableState<MRT_RowData>['pagination']) => void;
// };

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

  const stateChangeHandler =
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
    };

  const stateAndHandlers: StateAndHandlers<TData> = {
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

  return [stateAndHandlers, () => setTableState(RESET)] as const;
};
