import {toast} from 'react-toastify';
import CloseButton from 'src/helpers/CloseButton';

export const rerunToastId = 'rerun-toast';

export const rerunToast = () => {
  toast('Ændringer foretaget...', {
    toastId: rerunToastId,
    type: toast.TYPE.INFO,
    autoClose: false,
    closeOnClick: true,
    draggable: false,
    closeButton: CloseButton,
  });
};
