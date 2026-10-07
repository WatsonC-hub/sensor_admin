// components/CommandContext.tsx
import React, {createContext, useCallback, useContext, useMemo, useRef} from 'react';

type BaseCommand<T = unknown> = {
  id: string;
  name: string;
  icon?: React.ReactNode;
  description?: string;
  shortcut?: string;
  group?: string;
  type: string;
  perform: (value: T) => void;
};

type ActionCommand = Omit<BaseCommand<void>, 'type' | 'perform'> & {
  type: 'action';
  perform: () => void;
};

type InputCommand = Omit<BaseCommand<string>, 'type'> & {
  type: 'input';
  inputPlaceholder?: string;
};

export type SelectionCommand<T> = Omit<BaseCommand<T>, 'type'> & {
  type: 'selection';
  inputPlaceholder?: string;
  options: {label: string; value: T}[] | undefined;
  filter?: (value: T, search: string) => number;
};

// Union of all types
export type CommandAction = ActionCommand | InputCommand | SelectionCommand<any>;

type CommandRegistry = {
  current: Map<string, CommandAction>;
};

type CommandContextType = {
  register: (actions: CommandAction[]) => void;
  unregister: (ids: string[]) => void;
  getActions: () => CommandAction[];
};

const CommandContext = createContext<CommandContextType | null>(null);

export const CommandProvider = ({children}: {children: React.ReactNode}) => {
  const actionsRef: CommandRegistry = useRef(new Map());

  const register = useCallback((actions: CommandAction[]) => {
    actions.forEach((action) => actionsRef.current.set(action.id, action));
  }, []);

  const unregister = useCallback((ids: string[]) => {
    ids.forEach((id) => actionsRef.current.delete(id));
  }, []);

  const getActions = useCallback(() => Array.from(actionsRef.current.values()), []);

  const value = useMemo(
    () => ({register, unregister, getActions}),
    [register, unregister, getActions]
  );

  return <CommandContext.Provider value={value}>{children}</CommandContext.Provider>;
};

export const useCommandRegistry = () => {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error('useCommandRegistry must be used within a CommandProvider');
  return ctx;
};
