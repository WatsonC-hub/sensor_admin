// hooks/usePageActions.ts
import {useEffect} from 'react';

import {useCommandRegistry} from '../components/CommandContext';

import type {CommandAction} from '../components/CommandContext';

export const usePageActions = (actions: CommandAction[]) => {
  const {register, unregister} = useCommandRegistry();

  useEffect(() => {
    register(actions);
    return () => unregister(actions.map((a) => a.id));
  }, [actions]);
};
