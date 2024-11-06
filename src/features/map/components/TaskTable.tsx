import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';

import {TestMapData} from '../mapConsts';

type Props = {
  testData: Array<TestMapData>;
};

const TaskTable = ({testData}: Props) => {
  const [data, setData] = useState<Array<TestMapData>>(testData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const handleDelete = (id: number | undefined) => {
    setData(testData.filter((data) => data.id !== id));
  };

  const handleEdit = (editedData: TestMapData) => {
    console.log(editedData);
    const edited = testData.map((data) => {
      if (data.id === editedData.id) {
        return editedData;
      } else return data;
    });
    setData(edited);
  };

  const columns = useMemo<MRT_ColumnDef<TestMapData>[]>(
    () => [
      {
        accessorFn: (row) => row.id,
        id: 'id',
        header: 'Opgave id',
        size: 150,
        enableEditing: false,
        enableGlobalFilter: false,
      },
      {
        accessorFn: (row) => row.loc_id,
        id: 'loc_id',
        header: 'Lokation id',
        size: 150,
        enableEditing: false,
      },
      {
        accessorFn: (row) => row.loc_name,
        header: 'Lokationsnavn',
        id: 'loc_name',
        size: 140,
      },
      {
        accessorFn: (row) => row.flag,
        header: 'Flag',
        id: 'flag',
      },
      {
        accessorKey: 'comment',
        header: 'Kommentar',
      },
    ],
    []
  );

  const [tableState, reset] = useStatefullTableAtom<TestMapData>('TaskTableState');

  const options: Partial<MRT_TableOptions<TestMapData>> = {
    muiTableContainerProps: {
      sx: {
        flex: '1 1 1',
      },
    },
    muiTablePaperProps: {
      sx: {
        height: 'inherit',
      },
    },
    onEditingRowSave: ({exitEditingMode, values}) => {
      handleEdit(values);
      exitEditingMode();
    },
    enableRowActions: true,
    renderRowActions: ({row, table}) => (
      <RenderActions
        handleEdit={() => {
          //   handleEdit(row.original);
          table.setEditingRow(row);
        }}
        onDeleteBtnClick={() => {
          onDeleteBtnClick(row.original.id);
        }}
        canEdit={true}
      />
    ),
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={reset} />;
    },
    state: {columnVisibility: {id: false}},
  };

  const table = useTable<TestMapData>(
    columns,
    data,
    options,
    tableState,
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box height={'100%'}>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => handleDelete(mpId)}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TaskTable;
