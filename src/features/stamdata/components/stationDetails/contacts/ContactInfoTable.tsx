import {Box, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import {startCase} from 'lodash';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo, useState} from 'react';
import {SubmitHandler, useFormContext} from 'react-hook-form';

import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {ContactInfoType, MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {ContactTable} from '~/types';

import {InferContactInfoTable} from '../zodSchemas';

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
  const {
    reset,
    handleSubmit,
    formState: {dirtyFields},
  } = useFormContext<InferContactInfoTable>();
  const [openContactInfoDialog, setOpenContactInfoDialog] = useState<boolean>(false);
  const [isUser, setIsUser] = useState<boolean>(false);
  const {isMobile} = useBreakpoints();

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
        accessorKey: 'email',
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
              console.log((e!.target as HTMLElement).ondblclick);
              if ((e.target as HTMLElement).innerText) {
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
          <StationContactInfo modal={true} isUser={true} tableModal={true} />
        </Box>
      );
    },
    onEditingRowCancel: () => {
      reset();
    },
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          console.log(row.original);
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
        canEdit={true}
      />
    ),
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={resetState} />;
    },
  };

  const table = useTable<ContactTable>(
    isMobile ? mobileColumns : columns,
    data,
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
          <StationContactInfo modal={true} isUser={isUser} />
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
