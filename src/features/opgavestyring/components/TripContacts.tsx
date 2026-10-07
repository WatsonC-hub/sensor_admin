import {Box, Link, Typography} from '@mui/material';
import {MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';

import {MergeType, TableTypes, stationPages} from '~/helpers/enumHelper';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import {useTable} from '~/hooks/useTable';

import {sharedTableOptions} from '../sharedOptions';

import type {MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import type {TaskContact} from '~/types';

type TripContactsProps = {
  contacts: Array<TaskContact> | undefined;
};

const TripContacts = ({contacts}: TripContactsProps) => {
  const {location} = useNavigationFunctions();
  const [, setPageToShow] = useStationPages();
  const columns = useMemo<MRT_ColumnDef<TaskContact>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
        size: contacts && contacts.length > 0 ? 120 : 20,
      },
      {
        header: 'Lokationer',
        accessorKey: 'loc_names',
        Cell: ({cell, row}) => (
          <>
            {(cell.getValue<string[]>() || []).map((loc, index) => (
              <Link
                key={loc}
                onClick={() => {
                  location(row.original.loc_ids[index]);
                  setPageToShow(stationPages.KONTAKTER);
                }}
                sx={{
                  display: 'block',
                  cursor: 'pointer',
                }}
              >
                {loc}
              </Link>
            ))}
          </>
        ),
        size: contacts && contacts.length > 0 ? 150 : 20,
      },
      {
        header: 'Telefon',
        accessorKey: 'phone',
        size: 20,
      },
      {
        header: 'Email',
        accessorKey: 'email',
        size: 20,
      },
    ],
    [contacts]
  );

  const options: Partial<MRT_TableOptions<TaskContact>> = useMemo(
    () => ({
      ...(sharedTableOptions as Partial<MRT_TableOptions<TaskContact>>),
      renderTopToolbar: (
        <Typography
          variant="body1"
          sx={{
            pt: 1,
            px: 1,
          }}
        >
          Skal kontaktes inden besøg
        </Typography>
      ),
    }),
    []
  );

  const table = useTable<TaskContact>(
    columns,
    contacts,
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  return (
    <Box
      sx={{
        p: 1,
      }}
    >
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TripContacts;
