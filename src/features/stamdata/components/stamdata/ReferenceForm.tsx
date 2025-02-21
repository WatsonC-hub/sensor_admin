import {Box} from '@mui/material';

import MaalepunktForm from '~/components/MaalepunktForm';
import MaalepunktTableDesktop from '~/components/tableComponents/MaalepunktTableDesktop';
import MaalepunktTableMobile from '~/components/tableComponents/MaalepunktTableMobile';
import {convertDate, currentDate, toISOString} from '~/helpers/dateConverter';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import useBreakpoints from '~/hooks/useBreakpoints';
import useFormData from '~/hooks/useFormData';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';

export default function ReferenceForm() {
  const {ts_id} = useAppContext(['ts_id']);
  const {isMobile} = useBreakpoints();
  const [showForm, setShowForm] = useShowFormState();
  const [mpData, setMpData, changeMpData, resetMpData] = useFormData({
    gid: -1,
    startdate: () => currentDate('YYYY-MM-DDTHH:mm'),
    enddate: () => convertDate('2099-01-01', 'YYYY-MM-DDTHH:mm'),
    elevation: null,
    mp_description: '',
  });

  const {
    get: {data: watlevmp},
    post: postWatlevmp,
    put: putWatlevmp,
    del: deleteWatlevmp,
  } = useMaalepunkt();

  const handleMaalepunktSubmit = () => {
    mpData.startdate = toISOString(mpData.startdate);
    mpData.enddate = toISOString(mpData.enddate);

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
      {showForm && (
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
          />
        ) : (
          <MaalepunktTableDesktop
            data={watlevmp}
            handleEdit={handleEdit}
            handleDelete={handleDeleteMaalepunkt}
          />
        )}
      </Box>
    </>
  );
}
