// hook that returns the anem of the current page
//

import {useLocation} from 'react-router-dom';

export default function useWhatPage() {
  const location = useLocation();
  const path = location.pathname;
  const page = path.split('/')[1];
  return page;
}
