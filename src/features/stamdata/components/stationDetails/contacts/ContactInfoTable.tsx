import {Box, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import {lowerCase, startCase} from 'lodash';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import React, {useMemo, useState} from 'react';
import {SubmitHandler, useFormContext} from 'react-hook-form';

import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {initialContactData} from '~/consts';
import {useUser} from '~/features/auth/useUser';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useContactInfo} from '~/features/stamdata/api/useContactInfo';
import StationContactInfo from '~/features/stamdata/components/stationDetails/contacts/StationContactInfo';
import {ContactInfoType, MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {ContactTable} from '~/types';
import {setRoleName} from './const';

type Props = {
  mode: 'add' | 'edit' | 'mass_edit';
  loc_id?: number;
  contacts?: Array<ContactTable>;
  removeContact?: (index: number) => void;
  alterContact?: (index: number, data?: ContactTable) => void;
  currentIndex?: number;
  setCurrentIndex?: (index: number) => void;
};

const onDeleteBtnClick = (
  id: number,
  setDialogOpen: (open: boolean) => void,
  setContactID: (relation_id: number) => void
) => {
  setContactID(id);
  setDialogOpen(true);
};

const ContactInfoTable = ({
  loc_id,
  contacts,
  mode,
  removeContact,
  alterContact,
  currentIndex,
  setCurrentIndex,
}: Props) => {
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
  const disabled = location_permissions !== 'edit' || (mode === 'add' && loc_id !== undefined);

  const handleDelete = (relation_id: number) => {
    if (mode === 'edit') {
      const payload = {
        path: `${relation_id}`,
      };

      deleteContact.mutate(payload);
    } else if (mode === 'add' && removeContact) {
      removeContact(removeId);
    }
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
    enableEditing: true,
    editDisplayMode: 'modal',
    muiTableBodyRowProps: ({row, table}) => {
      return !isMobile
        ? {}
        : {
            onClick: (e) => {
              if ((e.target as HTMLElement).innerText && !disabled && mode === 'edit') {
                reset({
                  ...row.original,
                  mobile: row.original.mobile ? row.original.mobile : null,
                });
              } else if (mode === 'add') {
                if (setCurrentIndex) setCurrentIndex(row.index);
                reset(row.original);
              }
              table.setEditingRow(row);
            },
          };
    },
    renderEditRowDialogContent: () => {
      return (
        <Box py={4} px={2} boxShadow={6}>
          <StationContactInfo isEditing={true} isUser={true} tableModal={true} />
        </Box>
      );
    },
    onEditingRowCancel: () => {
      reset();
    },
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          if (mode === 'edit') {
            reset({
              ...row.original,
              mobile: row.original.mobile ? row.original.mobile : null,
            });
          } else if (mode === 'add') {
            if (setCurrentIndex) setCurrentIndex(row.index);
            reset(row.original);
          }

          setIsUser(row.original.org !== '');
          setOpenContactInfoDialog(true);
        }}
        onDeleteBtnClick={() => {
          if (mode === 'edit')
            onDeleteBtnClick(row.original.relation_id, setDialogOpen, setRemoveId);
          else if (mode === 'add') onDeleteBtnClick(row.index, setDialogOpen, setRemoveId);
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
    data ?? (contacts || []),
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

  const handleSave: SubmitHandler<ContactTable> = async (details) => {
    if (mode === 'edit') {
      handleEdit({
        ...details,
        email: details.email ?? '',
        mobile: details.mobile ? details.mobile.toString() : null,
      });
    } else if (mode === 'add' && alterContact && currentIndex !== undefined) {
      details.contact_type = lowerCase(details.contact_type || '');
      details.contact_role_name = setRoleName(details.contact_role || 0);
      alterContact(currentIndex, details);
    }
    setOpenContactInfoDialog(false);
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

      <Dialog
        open={openContactInfoDialog}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Ændre kontakt information</DialogTitle>
        <DialogContent>
          <StationContactInfo isEditing={true} isUser={isUser} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} bttype="tertiary">
            Annuller
          </Button>
          <Button
            disabled={Object.keys(dirtyFields).length === 0}
            onClick={handleSubmit(handleSave, (error) => console.log(error))}
            bttype="primary"
          >
            Ændre kontakt
          </Button>
        </DialogActions>
      </Dialog>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default ContactInfoTable;
