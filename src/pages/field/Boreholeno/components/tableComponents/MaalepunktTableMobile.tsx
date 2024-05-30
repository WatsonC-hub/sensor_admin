import {Box, Typography} from '@mui/material';
import {MRT_ColumnDef, MRT_ExpandButton, MRT_TableOptions} from 'material-react-table';
import {useMemo, useState} from 'react';
import DeleteAlert from '~/components/DeleteAlert';
import {
  convertDate,
  checkEndDateIsUnset,
  convertDateWithTimeStamp,
  limitDecimalNumbers,
} from '~/helpers/dateConverter';
import FormTableComponent from '~/components/FormTableComponent';
import React from 'react';
import {authStore, stamdataStore} from '~/state/store';
import RenderActions from '~/helpers/RowActions';

export type Maalepunkt = {
  startdate: string;
  enddate: string;
  elevation: number;
  organisationid: number;
  organisationname: string;
  mp_description: string;
  gid: number;
  ts_id: number;
  userid: string;
};

interface Props {
  data: Maalepunkt[];
  handleEdit: ({}) => void;
  handleDelete: (gid: number | undefined) => void;
}

export default function MaalepunktTableMobile({data, handleEdit, handleDelete}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState<number>(-1);
  const [timeseries] = stamdataStore((state) => [state.timeseries]);
  const org_id = authStore((store) => store.org_id);

  const onDeleteBtnClick = (id: number) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const columns = useMemo<MRT_ColumnDef<Maalepunkt>[]>(
    () => [
      {
        accessorFn: (row) => row,
        id: 'content',
        header: 'Indhold',
        enableHide: false,
        Cell: ({row, table, staticRowIndex}) => (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{width: '100%'}}
            gap={1}
            height={26}
          >
            <MRT_ExpandButton
              sx={{justifyContent: 'left'}}
              row={row}
              table={table}
              staticRowIndex={staticRowIndex}
            />
            <Box display="flex" justifyContent="space-between">
              <Typography width={50} alignSelf={'center'} variant="caption" fontWeight="bold">
                {limitDecimalNumbers(row.original.elevation)} m
              </Typography>
            </Box>
            <Typography margin={'0 auto'} alignSelf={'center'} variant="caption">
              <b>Start: </b> {convertDate(row.original.startdate)}
              <br />
              <b>Slut: </b>
              {checkEndDateIsUnset(row.original.enddate) ? 'Nu' : convertDate(row.original.enddate)}
            </Typography>

            <RenderActions
              handleEdit={() => {
                handleEdit(row.original);
              }}
              onDeleteBtnClick={() => {
                onDeleteBtnClick(row.original.gid);
              }}
              canEdit={row.original.organisationid == org_id}
            />
          </Box>
        ),
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<Maalepunkt>> = {
    renderDetailPanel: ({row}) => (
      <Box
        sx={{
          border: 'none',
          backgroundColor: 'grey.300',
          mt: -7.7,
          pt: 7,
          px: 2,
          mx: -2,
          transition: 'transform 0.2s',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          borderBottomLeftRadius: '15px',
          borderBottomRightRadius: '15px',
        }}
      >
        <Typography>
          <b>Start dato: </b> {convertDateWithTimeStamp(row.original.startdate)}
        </Typography>
        <Typography>
          <b>Slut dato: </b>
          {checkEndDateIsUnset(row.original.enddate)
            ? 'Nu'
            : convertDateWithTimeStamp(row.original.enddate)}
        </Typography>
        <Typography>
          <b>Organisation: </b>
          {row.original.organisationid !== null ? row.original.organisationname : '-'}
        </Typography>
        <Typography>
          <b>Beskrivelse:</b> {row.original.mp_description}
        </Typography>
      </Box>
    ),
    muiTablePaperProps: {
      sx: {
        boxShadow: 'none',
        p: 0,
        margin: 'auto',
        width: '100%',
      },
    },
  };

  return (
    <>
      <DeleteAlert
        measurementId={mpId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={handleDelete}
      />
      <FormTableComponent columns={columns} data={data} {...options} />
    </>
  );
}
