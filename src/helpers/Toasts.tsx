import {toast} from 'react-toastify';

// import CloseButton from '~/helpers/CloseButton';
import RerunToast from './RerunToast';

const rerunToastId = 'rerun-toast';

export const rerunToast = (ts_id: number) => {
  toast(<RerunToast />, {
    toastId: rerunToastId,
    type: 'info',
    autoClose: false,
    closeOnClick: true,
    draggable: false,
    data: {ts_id: ts_id}, // You can pass any data you need here
  });
};
