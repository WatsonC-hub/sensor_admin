import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {setTableBoxStyle} from '~/consts';
import {
  checkEndDateIsUnset,
  convertDateWithTimeStamp,
  limitDecimalNumbers,
} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {Maalepunkt} from '~/types';

interface Props {
  data: Maalepunkt[] | undefined;
  handleEdit: (maalepunkt: Maalepunkt) => void;
  handleDelete: (gid: number | undefined) => void;
  disabled: boolean;
}

export default function MaalepunktTableDesktop({data, handleEdit, handleDelete, disabled}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const {data: timeseries} = useTimeseriesData();

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const unit = timeseries?.tstype_id === 1 ? 'Kote [m (DVR90)]' : `Måling [${timeseries?.unit}]`;

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
        Cell: ({row}) => {
          const startDate: string = convertDateWithTimeStamp(row.original.startdate);
          const endDate: string = convertDateWithTimeStamp(row.original.enddate);

          return (
            <>
              <span style={{display: 'inline-block'}}>{startDate}</span>
              {' - '}
              {/* <span style={{display: 'block'}}>-</span> */}
              <span style={{display: 'inline-block'}}> {endDate}</span>
            </>
          );
        },
      },
      {accessorFn: (row) => limitDecimalNumbers(row.elevation), header: unit, id: 'elevation'},
      {header: 'Beskrivelse', accessorKey: 'mp_description'},
      {header: 'Oprettet af', accessorKey: 'display_name'},
    ],
    [unit]
  );

  const [tableState, reset] = useStatefullTableAtom<Maalepunkt>('MaalepunktTableState');

  const options: Partial<MRT_TableOptions<Maalepunkt>> = {
    localization: {noRecordsToDisplay: 'Ingen målepunkter at vise'},
    enableRowActions: true,
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          handleEdit(row.original);
        }}
        onDeleteBtnClick={() => {
          onDeleteBtnClick(row.original.gid);
        }}
        disabled={disabled}
      />
    ),
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={reset} />;
    },
  };

  const table = useTable<Maalepunkt>(
    columns,
    data,
    options,
    tableState,
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box sx={setTableBoxStyle(636)}>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
}
