import {Box} from '@mui/material';
import moment from 'moment';
import {parseAsBoolean, useQueryState} from 'nuqs';

import MaalepunktForm from '~/components/MaalepunktForm';
import MaalepunktTableDesktop from '~/components/tableComponents/MaalepunktTableDesktop';
import MaalepunktTableMobile from '~/components/tableComponents/MaalepunktTableMobile';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import useBreakpoints from '~/hooks/useBreakpoints';
import useFormData from '~/hooks/useFormData';

interface Props {
  canEdit: boolean;
  ts_id: number;
}

export default function ReferenceForm({canEdit, ts_id}: Props) {
  const {isMobile} = useBreakpoints();
  const [showForm, setShowForm] = useQueryState('showForm', parseAsBoolean);
  const [mpData, setMpData, changeMpData, resetMpData] = useFormData({
    gid: -1,
    startdate: () => moment().format('YYYY-MM-DDTHH:mm'),
    enddate: () => moment('2099-01-01').format('YYYY-MM-DDTHH:mm'),
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
      onSuccess: () => {
        resetMpData();
        setShowForm(null);
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
    setShowForm(null);
  };

  const handleDeleteMaalepunkt = (gid: number | undefined) => {
    deleteWatlevmp.mutate(
      {path: `${ts_id}/${gid}`},
      {
        onSuccess: () => {
          resetMpData();
        },
      }
    );
  };

  const handleEdit = (data: object) => {
    setMpData(data);
    setShowForm(true);
  };

  return (
    <>
      {showForm && canEdit && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <MaalepunktForm
            formData={mpData}
            changeFormData={changeMpData}
            handleSubmit={handleMaalepunktSubmit}
            handleCancel={handleMpCancel}
          />
        </Box>
      )}
      <Box display="flex" justifyContent={{sm: 'center'}}>
        {isMobile ? (
          <MaalepunktTableMobile
            data={watlevmp}
            handleEdit={handleEdit}
            handleDelete={handleDeleteMaalepunkt}
            canEdit={canEdit}
          />
        ) : (
          <MaalepunktTableDesktop
            data={watlevmp}
            handleEdit={handleEdit}
            handleDelete={handleDeleteMaalepunkt}
            canEdit={canEdit}
          />
        )}
      </Box>
    </>
  );
}
