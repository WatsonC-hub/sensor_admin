import {Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useParams} from 'react-router-dom';

import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {AccessType, MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
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

const initialData = {
  navn: '',
  type: '',
  contact_id: null,
  placering: '',
  koden: '',
  kommentar: '',
};

const LocationAccessTable = ({data, delLocationAccess, editLocationAccess}: Props) => {
  const [locationAccessID, setLocationAccessID] = useState<number>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const {setValue, trigger, getValues} = useFormContext();
  const [openContactInfoDialog, setOpenContactInfoDialog] = useState<boolean>(false);
  const params = useParams();
  const loc_id = parseInt(params.locid!);

  const columns = useMemo<MRT_ColumnDef<AccessTable>[]>(
    () => [
      {
        header: 'Type',
        id: 'type',
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
        size: 120,
      },
      {
        header: 'Kode',
        accessorKey: 'koden',
        size: 120,
      },
      {
        header: 'Adresse',
        id: 'placering',
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
        size: 120,
      },
      {
        header: 'Kommentar',
        accessorKey: 'kommentar',
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
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          console.log(row.original);
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
    columns,
    data,
    options,
    tableState,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  const handleClose = () => {
    setValue('adgangsforhold', {});
    setOpenContactInfoDialog(false);
  };

  const handleSave = async () => {
    const result = await trigger('adgangsforhold');

    const details = getValues().adgangsforhold;

    editLocationAccess(details);

    setOpenContactInfoDialog(!result);
    setValue('adgangsforhold', initialData);
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
      >
        <DialogTitle id="form-dialog-title">Ændre kontakt information</DialogTitle>
        <DialogContent>
          <LocationAccessFormDialog loc_id={loc_id} editMode={true} />
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

export default LocationAccessTable;
