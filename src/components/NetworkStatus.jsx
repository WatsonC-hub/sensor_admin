import {toast} from 'react-toastify';
import useOnlineStatus from 'src/hooks/useOnlineStatus';

let prevStatus = window.navigator.onLine;

const NetworkStatus = () => {
  const online = useOnlineStatus();

  const style = {
    width: '20%',
    minWidth: '150px',
    marginLeft: '70%',
    marginRight: '0%',
  };

  if (online && online !== prevStatus) {
    toast.dismiss('offline');
    toast.success('Online', {
      toastId: 'online',
      style: style,
      newestOnTop: true,
    });

    // return null;
  } else if (!online && online !== prevStatus) {
    toast.dismiss('online');
    toast.error('Offline', {
      toastId: 'offline',
      style: style,
      autoClose: false,
      newestOnTop: true,
    });

    // return <WifiOffIcon />;
  }

  prevStatus = online;

  return;
};

export default NetworkStatus;
