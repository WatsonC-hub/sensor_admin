import {Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import React, {useMemo, useState} from 'react';
import {SubmitHandler, useFormContext} from 'react-hook-form';
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

import {AdgangsforholdTable} from '../zodSchemas';

import LocationAccessFormDialog from './LocationAccessFormDialog';

type Props = {
  data: Array<AccessTable>;
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
  const {
    watch,
    reset,
    handleSubmit,
    formState: {dirtyFields},
  } = useFormContext<AdgangsforholdTable>();
  const [openContactInfoDialog, setOpenContactInfoDialog] = useState<boolean>(false);
  const params = useParams();
  const loc_id = parseInt(params.locid!);
  const {isMobile} = useBreakpoints();

  const navnLabel = watch('type');
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
    localization:
      'detail' in data ? {noRecordsToDisplay: data.detail as string} : MRT_Localization_DA,
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
              if ((e.target as HTMLElement).innerText) {
                reset(row.original);
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
      reset(initialLocationAccessData);
    },
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          reset(row.original);
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

  const table = useTable<AccessTable>(
    isMobile ? mobileColumns : columns,
    data,
    options,
    tableState,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  const handleClose = () => {
    reset(initialLocationAccessData);
    setOpenContactInfoDialog(false);
  };

  const handleSave: SubmitHandler<AdgangsforholdTable> = async (details) => {
    editLocationAccess(details);

    setOpenContactInfoDialog(false);
    reset(initialLocationAccessData);
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
          <Button
            disabled={JSON.stringify(dirtyFields) === '{}'}
            onClick={handleSubmit(handleSave, (error) => console.log(error))}
            bttype="primary"
          >
            Ændre {navnLabel && navnLabel !== '-1' && navnLabel.toLowerCase()}
          </Button>
        </DialogActions>
      </Dialog>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default LocationAccessTable;
