import {useAtom} from 'jotai';
import {useMemo} from 'react';

import {getStatefulTableAtom} from '~/state/atoms';

export const useStatefullTableAtom = (key: string) => {
  const atom = getStatefulTableAtom(key);

  return useAtom(atom);
};
