import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {setTableBoxStyle} from '~/consts';
import {
  checkEndDateIsUnset,
  convertDateWithTimeStamp,
  limitDecimalNumbers,
} from '~/helpers/dateConverter';
import {TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {stamdataStore} from '~/state/store';
import {Maalepunkt} from '~/types';

import RenderInternalActions from './RenderInternalActions';

interface Props {
  data: Maalepunkt[] | undefined;
  handleEdit: (maalepunkt: Maalepunkt) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
}

export default function MaalepunktTableDesktop({data, handleEdit, handleDelete, canEdit}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const [timeseries] = stamdataStore((state) => [state.timeseries]);
  const {isTablet} = useBreakpoints();

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const unit = timeseries.tstype_id === 1 ? 'Pejling (nedstik) [m]' : `Måling [${timeseries.unit}]`;

  const columns = useMemo<MRT_ColumnDef<Maalepunkt>[]>(
    () => [
      {
        header: 'Dato',
        id: 'startdate',
        accessorFn: (row) =>
          convertDateWithTimeStamp(row.startdate) +
          ' - ' +
          (checkEndDateIsUnset(row.enddate) ? 'Nu' : convertDateWithTimeStamp(row.enddate)),
        sortingFn: (a, b) => (a.original.startdate > b.original.startdate ? 1 : -1),
        enableHide: false,
      },
      {
        accessorFn: (row) => limitDecimalNumbers(row.elevation),
        header: unit,
        id: 'elevation',
      },
      {
        header: 'Beskrivelse',
        accessorKey: 'mp_description',
      },
    ],
    [unit]
  );

  const [tableState, reset] = useStatefullTableAtom<Maalepunkt>('MaalepunktTableState');

  const options: Partial<MRT_TableOptions<Maalepunkt>> = {
    enableRowActions: true,
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          handleEdit(row.original);
        }}
        onDeleteBtnClick={() => {
          onDeleteBtnClick(row.original.gid);
        }}
        canEdit={canEdit}
      />
    ),
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={reset} />;
    },
  };

  const table = useTable<Maalepunkt>(columns, data, options, tableState, TableTypes.TABLE);

  return (
    <Box sx={setTableBoxStyle(isTablet ? 436 : 636)}>
      <DeleteAlert
        measurementId={mpId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={handleDelete}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
