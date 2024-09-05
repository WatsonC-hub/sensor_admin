import {Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useParams} from 'react-router-dom';

import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {initialLocationAccessData} from '~/consts';
import {AccessType, MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {AccessTable} from '~/types';

import LocationAccessFormDialog from './LocationAccessFormDialog';

type Props = {
  data: Array<AccessTable> | undefined;
  delLocationAccess: (location_access_id: number | undefined) => void;
  editLocationAccess: (LocationAccess: AccessTable) => void;
};

const onDeleteBtnClick = (
  id: number,
  setDialogOpen: (open: boolean) => void,
  setLocationAccessID: (location_access_id: number) => void
) => {
  setLocationAccessID(id);
  setDialogOpen(true);
};

const LocationAccessTable = ({data, delLocationAccess, editLocationAccess}: Props) => {
  const [locationAccessID, setLocationAccessID] = useState<number>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const {setValue, trigger, getValues, watch, clearErrors} = useFormContext();
  const [openContactInfoDialog, setOpenContactInfoDialog] = useState<boolean>(false);
  const params = useParams();
  const loc_id = parseInt(params.locid!);
  const {isMobile} = useBreakpoints();

  const navnLabel = watch('adgangsforhold.type');
  const columns = useMemo<MRT_ColumnDef<AccessTable>[]>(
    () => [
      {
        header: 'Type',
        id: 'type',
        enableColumnActions: false,
        accessorFn: (row) => {
          switch (row.type) {
            case AccessType.Code:
              return AccessType.Code;
            case AccessType.Key:
              return AccessType.Key;
            default:
              return '';
          }
        },
        size: 120,
      },
      {
        header: 'Navn',
        accessorKey: 'navn',
        enableColumnActions: false,
        size: 120,
      },
      {
        header: 'Kode',
        accessorKey: 'koden',
        enableColumnActions: false,
        size: 120,
      },
      {
        header: 'Adresse',
        id: 'placering',
        enableColumnActions: false,
        accessorFn: (row) => {
          if (row.placering && row.placering !== '')
            return <Typography>{row.placering}</Typography>;
          else return <Typography>WatsonC</Typography>;
        },
        size: 120,
      },
      {
        header: 'Udleveres af',
        accessorKey: 'contact_name',
        enableColumnActions: false,
        size: 120,
      },
      {
        header: 'Kommentar',
        accessorKey: 'kommentar',
        enableColumnActions: false,
        size: 120,
      },
    ],
    []
  );

  const mobileColumns = useMemo<MRT_ColumnDef<AccessTable>[]>(
    () => [
      {
        header: 'Type',
        id: 'type',
        enableColumnActions: false,
        accessorFn: (row) => {
          switch (row.type) {
            case AccessType.Code:
              return AccessType.Code;
            case AccessType.Key:
              return AccessType.Key;
            default:
              return '';
          }
        },
        size: 120,
      },
      {
        header: 'Navn',
        accessorKey: 'navn',
        enableColumnActions: false,
        size: 120,
      },
    ],
    []
  );

  const [tableState, resetState] = useStatefullTableAtom<AccessTable>('ContactTableState');

  const options: Partial<MRT_TableOptions<AccessTable>> = {
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
            // onDoubleClick: () => {
            //   setValue('adgangsforhold', row.original);
            //   table.setEditingRow(row);
            // },
          }
        : {
            onClick: (e) => {
              console.log((e.target as HTMLElement).innerText);
              if ((e.target as HTMLElement).innerText) {
                setValue('adgangsforhold', row.original);
                table.setEditingRow(row);
              }
            },
          };
    },
    renderEditRowDialogContent: () => {
      return (
        <Box py={4} px={2} boxShadow={6}>
          <LocationAccessFormDialog loc_id={loc_id} />
        </Box>
      );
    },
    onEditingRowCancel: () => {
      setValue('adgangsforhold', null);
    },
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          setValue('adgangsforhold', row.original);
          setOpenContactInfoDialog(true);
        }}
        onDeleteBtnClick={() => {
          onDeleteBtnClick(row.original.id, setDialogOpen, setLocationAccessID);
        }}
        canEdit={true}
      />
    ),
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={resetState} />;
    },
  };

  const table = useTable<AccessTable>(
    isMobile ? mobileColumns : columns,
    data,
    options,
    tableState,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  const handleClose = () => {
    setValue('adgangsforhold', {});
    clearErrors('adgangsforhold');
    setOpenContactInfoDialog(false);
  };

  const handleSave = async () => {
    const result = await trigger('adgangsforhold');

    const details = getValues().adgangsforhold;

    editLocationAccess(details);

    setOpenContactInfoDialog(!result);
    setValue('adgangsforhold', initialLocationAccessData);
  };

  return (
    <Box>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => delLocationAccess(locationAccessID)}
      />

      <Dialog
        open={openContactInfoDialog}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">Ændre adgangsinformation</DialogTitle>
        <DialogContent>
          <LocationAccessFormDialog loc_id={loc_id} editMode={true} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} bttype="tertiary">
            Annuller
          </Button>
          <Button onClick={handleSave} bttype="primary">
            Ændre {navnLabel && navnLabel.toLowerCase()}
          </Button>
        </DialogActions>
      </Dialog>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default LocationAccessTable;
