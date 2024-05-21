import MaalepunktForm from '~/components/MaalepunktForm';
import useFormData from '~/hooks/useFormData';
import moment from 'moment';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {Box, useMediaQuery, useTheme} from '@mui/material';
import MaalepunktTableMobile from './tableComponents/MaalepunktTableMobile';
import MaalepunktTableDesktop from './tableComponents/MaalepunktTableDesktop';

interface Props {
  mode: string;
  setMode: (form: string) => void;
  canEdit: boolean;
  ts_id: number;
}

export default function ReferenceForm({mode, setMode, canEdit, ts_id}: Props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const [mpData, setMpData, changeMpData, resetMpData] = useFormData({
    gid: -1,
    startdate: moment(),
    enddate: moment('2099-01-01'),
    elevation: 0,
    mp_description: '',
  });

  const {
    get: {data: watlevmp},
    post: postWatlevmp,
    put: putWatlevmp,
    del: deleteWatlevmp,
  } = useMaalepunkt();

  const handleMaalepunktSubmit = () => {
    mpData.startdate = moment(mpData.startdate).toISOString();
    mpData.enddate = moment(mpData.enddate).toISOString();

    const mutationOptions = {
      onSuccess: (data: {}) => {
        resetMpData();
        setMode('view');
      },
    };

    if (mpData.gid === -1) {
      const payload = {
        data: mpData,
        path: `${ts_id}`,
      };
      postWatlevmp.mutate(payload, mutationOptions);
    } else {
      const payload = {
        data: mpData,
        path: `${ts_id}/${mpData.gid}`,
      };
      putWatlevmp.mutate(payload, mutationOptions);
    }
  };

  const handleMpCancel = () => {
    resetMpData();
    setMode('view');
  };

  const handleDeleteMaalepunkt = (gid: number | undefined) => {
    deleteWatlevmp.mutate(
      {path: `${ts_id}/${gid}`},
      {
        onSuccess: (data) => {
          resetMpData();
        },
      }
    );
  };

  const handleEdit = (type: string) => {
    return (data: {}) => {
      console.log('does this work?');
      setMpData(data);
      setMode('edit');
    };
  };

  return (
    <>
      {mode !== 'view' && canEdit && (
        <MaalepunktForm
          formData={mpData}
          changeFormData={changeMpData}
          handleSubmit={handleMaalepunktSubmit}
          handleCancel={handleMpCancel}
        />
      )}
      <Box display="flex" justifyContent={{sm: 'center'}}>
        {mode === 'view' &&
          (matches ? (
            <MaalepunktTableMobile
              data={watlevmp!}
              handleEdit={handleEdit('watlevmp')}
              handleDelete={handleDeleteMaalepunkt}
              canEdit={canEdit}
            />
          ) : (
            <MaalepunktTableDesktop
              data={watlevmp!}
              handleEdit={handleEdit('watlevmp')}
              handleDelete={handleDeleteMaalepunkt}
              canEdit={canEdit}
            />
          ))}
      </Box>
    </>
  );
}
