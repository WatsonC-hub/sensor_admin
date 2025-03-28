import {Box, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import {startCase} from 'lodash';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import React, {useMemo, useState} from 'react';
import {SubmitHandler, useFormContext} from 'react-hook-form';

import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {useUser} from '~/features/auth/useUser';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useContactInfo} from '~/features/stamdata/api/useContactInfo';
import StationContactInfo from '~/features/stamdata/components/stationDetails/contacts/StationContactInfo';
import {InferContactInfoTable} from '~/features/stamdata/components/stationDetails/zodSchemas';
import {ContactInfoType, MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useQueryTable} from '~/hooks/useTable';
import {useAppContext} from '~/state/contexts';
import {ContactTable} from '~/types';

type Props = {
  delContact: (relation_id: number) => void;
  editContact: (ContactInfo: ContactTable) => void;
};

const onDeleteBtnClick = (
  id: number,
  setDialogOpen: (open: boolean) => void,
  setContactID: (relation_id: number) => void
) => {
  setContactID(id);
  setDialogOpen(true);
};

const ContactInfoTable = ({delContact, editContact}: Props) => {
  const {loc_id} = useAppContext(['loc_id']);
  const user = useUser();
  const [contactID, setContactID] = useState<number>(-1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    reset,
    handleSubmit,
    formState: {dirtyFields},
  } = useFormContext<InferContactInfoTable>();
  const [openContactInfoDialog, setOpenContactInfoDialog] = useState<boolean>(false);
  const [isUser, setIsUser] = useState<boolean>(false);
  const {isMobile} = useBreakpoints();

  const {get} = useContactInfo(loc_id);
  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';

  const columns = useMemo<MRT_ColumnDef<ContactTable>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'navn',
        enableColumnActions: false,
        size: 120,
      },
      {
        header: 'Rolle',
        id: 'contact_role_name',
        enableColumnActions: false,
        accessorFn: (row) => row.contact_role_name,
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
        accessorKey: 'telefonnummer',
        size: 20,
        enableColumnActions: false,
      },
      {
        header: 'Kommentar',
        accessorKey: 'comment',
        size: 20,
        enableColumnActions: false,
      },
    ],
    []
  );

  const mobileColumns = useMemo<MRT_ColumnDef<ContactTable>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'navn',
        enableColumnActions: false,
        size: 20,
      },
      {
        header: 'Rolle',
        id: 'contact_role_name',
        enableColumnActions: false,
        accessorFn: (row) => row.contact_role_name,
        size: 20,
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
    enableEditing: true,
    editDisplayMode: 'modal',
    muiTableBodyRowProps: ({row, table}) => {
      return !isMobile
        ? {}
        : {
            onClick: (e) => {
              if ((e.target as HTMLElement).innerText && !disabled) {
                reset({
                  ...row.original,
                  telefonnummer: row.original.telefonnummer
                    ? parseInt(row.original.telefonnummer)
                    : null,
                });
                table.setEditingRow(row);
              }
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
          reset({
            ...row.original,
            telefonnummer: row.original.telefonnummer ? parseInt(row.original.telefonnummer) : null,
          });
          setIsUser(row.original.org !== '');
          setOpenContactInfoDialog(true);
        }}
        onDeleteBtnClick={() => {
          onDeleteBtnClick(row.original.relation_id, setDialogOpen, setContactID);
        }}
        disabled={!user?.contactAndKeysPermission || disabled}
      />
    ),
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={resetState} />;
    },
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 0, //if using layoutMode that is not 'semantic', the columns will not auto-size, so you need to set the size manually
        grow: false,
        header: '',
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
      },
    },
  };

  const table = useQueryTable<ContactTable>(
    isMobile ? mobileColumns : columns,
    get,
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

  const handleSave: SubmitHandler<InferContactInfoTable> = async (details) => {
    editContact({
      ...details,
      email: details.email ?? '',
      telefonnummer: details.telefonnummer ? details.telefonnummer.toString() : null,
    });
    setOpenContactInfoDialog(false);
    setIsUser(false);
  };

  return (
    <Box>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => {
          delContact(contactID);
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
            disabled={
              !(dirtyFields.contact_role || dirtyFields.comment || dirtyFields.contact_type)
            }
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
