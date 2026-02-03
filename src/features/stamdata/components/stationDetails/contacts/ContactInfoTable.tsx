import {Box} from '@mui/material';
import {startCase} from 'lodash';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import React, {useMemo, useState} from 'react';
import {SubmitHandler, useFormContext} from 'react-hook-form';

import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {initialContactData} from '~/consts';
import {useUser} from '~/features/auth/useUser';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useContactInfo} from '~/features/stamdata/api/useContactInfo';
import {ContactInfoType, MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {ContactTable} from '~/types';
import EditContactInfo from './EditContactInfo';

type Props = {
  loc_id?: number;
};

const onDeleteBtnClick = (
  id: number,
  setDialogOpen: (open: boolean) => void,
  setContactID: (relation_id: number) => void
) => {
  setContactID(id);
  setDialogOpen(true);
};

const ContactInfoTable = ({loc_id}: Props) => {
  const {
    features: {contacts: contactsFeature},
  } = useUser();
  const [removeId, setRemoveId] = useState<number>(-1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    reset,
    handleSubmit,
    formState: {dirtyFields},
  } = useFormContext<ContactTable>();
  const [openContactInfoDialog, setOpenContactInfoDialog] = useState<boolean>(false);
  const [isUser, setIsUser] = useState<boolean>(false);
  const {isMobile} = useBreakpoints();

  const {
    get: {data},
    del: deleteContact,
    put: editContact,
  } = useContactInfo(loc_id);

  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';

  const handleDelete = (relation_id: number) => {
    const payload = {
      path: `${relation_id}`,
    };

    deleteContact.mutate(payload);
  };

  const handleEdit = (contactInfo: ContactTable) => {
    const email = contactInfo.email !== '' ? contactInfo.email : null;
    const payload = {
      path: `${loc_id}`,
      data: {
        id: contactInfo.id,
        name: contactInfo.name,
        mobile: contactInfo.mobile,
        email: email,
        contact_role: contactInfo.contact_role,
        comment: contactInfo.comment,
        org: contactInfo.org,
        user_id: contactInfo.user_id ?? null,
        relation_id: contactInfo.relation_id,
        contact_type: contactInfo.contact_type,
        notify_required: contactInfo.notify_required ?? false,
      },
    };

    editContact.mutate(payload, {
      onSuccess: () => {
        reset(initialContactData);
      },
    });
  };

  const handleSave: SubmitHandler<ContactTable> = async (details) => {
    handleEdit({
      ...details,
      email: details.email ?? '',
      mobile: details.mobile ? details.mobile.toString() : null,
    });

    setOpenContactInfoDialog(false);
    setIsUser(false);
  };

  const columns = useMemo<MRT_ColumnDef<ContactTable>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
        enableColumnActions: false,
        size: 120,
      },
      {
        header: 'Rolle',
        id: 'contact_role_name',
        enableColumnActions: false,
        accessorFn: (row) => {
          return row.contact_role_name;
        },
        size: 20,
      },
      {
        header: 'Kontakt type',
        id: 'contact_type',
        accessorFn: (row) => {
          switch (row.contact_type) {
            case ContactInfoType.Lokation:
              return startCase(ContactInfoType.Lokation);
            case ContactInfoType.Projekt:
              return startCase(ContactInfoType.Projekt);
            default:
              return '';
          }
        },
        enableColumnActions: false,
        size: 20,
      },
      {
        header: 'Email',
        id: 'email',
        accessorFn: (row) => <a href={'mailto:' + row.email}>{row.email}</a>,
        size: 20,
        enableColumnActions: false,
      },
      {
        header: 'Organisation',
        accessorKey: 'org',
        size: 20,
        enableColumnActions: false,
      },
      {
        header: 'Tlf.',
        accessorKey: 'mobile',
        size: 20,
        enableColumnActions: false,
      },
      {
        header: 'Kommentar',
        accessorKey: 'comment',
        size: 20,
        enableColumnActions: false,
      },
      {
        header: 'Kontaktes inden besøg',
        id: 'notify_required',
        accessorFn: (row) => (row.notify_required ? 'Ja' : 'Nej'),
        size: 150,
        enableColumnActions: false,
      },
    ],
    []
  );

  const mobileColumns = useMemo<MRT_ColumnDef<ContactTable>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
        enableColumnActions: false,
        size: 2,
      },
      {
        header: 'Rolle',
        id: 'contact_role_name',
        enableColumnActions: false,
        accessorFn: (row) => row.contact_role_name,
        size: 2,
      },
    ],
    []
  );

  const [tableState, resetState] = useStatefullTableAtom<ContactTable>('ContactTableState');

  const options: Partial<MRT_TableOptions<ContactTable>> = {
    localization: {
      ...MRT_Localization_DA,
      noRecordsToDisplay: 'Ingen kontakter er tilknyttet denne lokation eller projekt',
    },

    enableTopToolbar: false,
    enablePagination: false,
    enableRowActions: true,
    muiTablePaperProps: {},
    muiTableContainerProps: {},
    enableColumnPinning: true,
    enableBottomToolbar: false,
    muiTableBodyRowProps: ({row, table}) => {
      return !isMobile
        ? {}
        : {
            onClick: (e) => {
              if ((e.target as HTMLElement).innerText) {
                reset({
                  ...row.original,
                  mobile: row.original.mobile ? row.original.mobile : null,
                });
              }
              table.setEditingRow(row);
            },
          };
    },

    onEditingRowCancel: () => {
      reset();
    },
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          reset({
            ...row.original,
            mobile: row.original.mobile ? row.original.mobile : null,
          });

          setIsUser(row.original.org !== '');
          setOpenContactInfoDialog(true);
        }}
        onDeleteBtnClick={() => {
          onDeleteBtnClick(row.original.relation_id, setDialogOpen, setRemoveId);
        }}
        disabled={!contactsFeature || disabled}
      />
    ),
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={resetState} />;
    },
    initialState: {
      columnPinning: {right: ['mrt-row-actions']},
    },
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 0, //if using layoutMode that is not 'semantic', the columns will not auto-size, so you need to set the size manually
        grow: false,
        header: '',

        muiTableHeadCellProps: {
          align: 'right',
          padding: 'none',
        },
        muiTableBodyCellProps: {
          align: 'right',
          padding: 'none',
        },
      },
    },
  };

  const table = useTable<ContactTable>(
    isMobile ? mobileColumns : columns,
    data ?? [],
    options,
    tableState,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  const handleClose = () => {
    setOpenContactInfoDialog(false);
    reset();
    setIsUser(false);
  };

  return (
    <Box sx={{minWidth: '300px'}}>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => {
          handleDelete(removeId);
        }}
      />

      <EditContactInfo
        openContactInfoDialog={openContactInfoDialog}
        handleClose={handleClose}
        handleSave={() => handleSubmit(handleSave, (e) => console.log(e))()}
        isDisabled={Object.keys(dirtyFields).length === 0}
        isUser={isUser}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default ContactInfoTable;
