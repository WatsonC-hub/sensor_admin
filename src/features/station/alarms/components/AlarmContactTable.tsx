import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {ContactTable} from '~/types';

type AlarmContact = {
  name: string;
  contactType: boolean;
  contactInterval: string;
};

type AlarmContactTableProps = {
  contacts: Array<ContactTable> | undefined;
};

const AlarmContactTable = ({contacts}: AlarmContactTableProps) => {
  const columns = useMemo<MRT_ColumnDef<AlarmContact>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'navn',
        size: 120,
      },
      {
        header: 'SMS/Mail/Mobil nr.',
        accessorKey: 'contactType',
        size: 120,
      },
      {
        header: 'E-post',
        accessorKey: 'contactInterval',
        size: 180,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<AlarmContact>> = {
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enablePagination: false,
  };

  const table = useTable<AlarmContact>(
    columns,
    contacts?.map((contact) => ({
      name: contact.navn,
      contactType: true,
      contactInterval: contact.email || contact.telefonnummer || '',
    })) || [],

    options,
    undefined,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  return <MaterialReactTable table={table} />;
};

export default AlarmContactTable;
