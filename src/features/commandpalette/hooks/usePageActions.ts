// hooks/usePageActions.ts
import {useEffect} from 'react';
import {CommandAction, useCommandRegistry} from '../components/CommandContext';

export const usePageActions = (actions: CommandAction[]) => {
  const {register, unregister} = useCommandRegistry();

  useEffect(() => {
    register(actions);
    return () => unregister(actions.map((a) => a.id));
  }, [actions]);
};
