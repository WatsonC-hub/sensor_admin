import {Box, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo, useState} from 'react';
import {useFormContext} from 'react-hook-form';

import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {initialContactData} from '~/consts';
import {ContactInfoRole, MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {ContactTable} from '~/types';

import StationContactInfo from './StationContactInfo';

type Props = {
  data: Array<ContactTable> | undefined;
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

const ContactInfoTable = ({data, delContact, editContact}: Props) => {
  const [contactID, setContactID] = useState<number>(-1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const {setValue, trigger, getValues, clearErrors} = useFormContext();
  const [openContactInfoDialog, setOpenContactInfoDialog] = useState<boolean>(false);
  const [isUser, setIsUser] = useState<boolean>(false);
  const {isMobile} = useBreakpoints();

  const columns = useMemo<MRT_ColumnDef<ContactTable>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'navn',
        enableColumnActions: false,
        size: 20,
      },
      {
        header: 'Rolle',
        id: 'rolle',
        enableColumnActions: false,
        accessorFn: (row) => {
          switch (row.rolle) {
            case ContactInfoRole.DataEjer:
              return ContactInfoRole.DataEjer;
            case ContactInfoRole.kontakter:
              return ContactInfoRole.kontakter;
            default:
              return '';
          }
        },
        size: 20,
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Organisation',
        accessorKey: 'org',
        size: 20,
      },
      {
        header: 'Telefon nummer',
        accessorKey: 'telefonnummer',
        size: 20,
      },
      {
        header: 'Kommentar',
        accessorKey: 'kommentar',
        size: 20,
      },
    ],
    []
  );

  const [tableState, resetState] = useStatefullTableAtom<ContactTable>('ContactTableState');

  const options: Partial<MRT_TableOptions<ContactTable>> = {
    enableTopToolbar: false,
    enablePagination: false,
    enableRowActions: true,
    muiTablePaperProps: {},
    muiTableContainerProps: {},
    enableEditing: true,
    editDisplayMode: 'modal',
    muiTableBodyRowProps: ({row, table}) => {
      return !isMobile
        ? {
            onDoubleClick: () => {
              setValue('contact_info', row.original);
              table.setEditingRow(row);
            },
          }
        : {
            onClick: () => {
              console.log('Clicking');
              setValue('contact_info', row.original);
              table.setEditingRow(row);
            },
          };
    },
    renderEditRowDialogContent: () => {
      return (
        <Box py={4} px={2} boxShadow={6}>
          <StationContactInfo modal={true} isUser={true} tableModal={true} />
        </Box>
      );
    },
    onEditingRowCancel: () => {
      setValue('contact_info', null);
    },
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          setValue('contact_info', row.original);
          setIsUser(row.original.org !== '');
          setOpenContactInfoDialog(true);
        }}
        onDeleteBtnClick={() => {
          onDeleteBtnClick(row.original.relation_id, setDialogOpen, setContactID);
        }}
        canEdit={true}
      />
    ),
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={resetState} />;
    },
    initialState: {
      columnVisibility: {org: false, telefonnummer: false, kommentar: false, email: false},
    },
  };

  const table = useTable<ContactTable>(
    columns,
    data,
    options,
    tableState,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  const handleClose = () => {
    setValue('contact_info', initialContactData);
    setOpenContactInfoDialog(false);
    clearErrors('contact_info');
    setIsUser(false);
  };

  const handleSave = async () => {
    const result = await trigger('contact_info');

    const details = getValues().contact_info;

    editContact(details);

    setOpenContactInfoDialog(!result);
    setIsUser(!result);
    setValue('contact_info', initialContactData);
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
          <StationContactInfo modal={true} isUser={isUser} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} bttype="tertiary">
            Annuller
          </Button>
          <Button onClick={handleSave} bttype="primary">
            Ændre kontakt
          </Button>
        </DialogActions>
      </Dialog>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default ContactInfoTable;
