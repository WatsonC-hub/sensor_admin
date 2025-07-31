import React, {useMemo} from 'react';
import useProjects, {Project} from '../api/useProjects';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import LookupTable from './LookupTable';
import {Box} from '@mui/material';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';

const Projects = () => {
  const {
    get: {data: projects},
  } = useProjects();

  const columns = useMemo<MRT_ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: 'project_no',
        header: 'Projekt nummer',
        size: 20,
      },
      {
        accessorKey: 'project_info',
        header: 'Projekt info',
        size: 20,
      },
      {
        accessorKey: 'customer_name',
        header: 'Kunde navn',
        size: 20,
      },
      {
        accessorKey: 'project_title',
        header: 'Projekt titel',
        size: 20,
      },
      {
        accessorKey: 'is_customer_service',
        header: 'Er kundeservice',
        Cell: ({cell}) => (cell.getValue() ? 'Ja' : 'Nej'),
        size: 20,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<Project>> = {
    enableExpanding: false,
    initialState: {
      showGlobalFilter: true,
      density: 'comfortable',
    },
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} />;
    },
  };

  const table = LookupTable<Project>(projects ?? [], columns, true, options);

  return (
    <Box px={1} py={2}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default Projects;
