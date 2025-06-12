// components/CommandContext.tsx
import React, {createContext, useContext, useRef} from 'react';

export type CommandAction = {
  id: string;
  name: string;
  perform: (inp?: string) => void;
  icon?: React.ReactNode; // Optional icon for the command
  description?: string; // Optional description for the command
  input?: boolean; // Whether the command requires input
  inputPlaceholder?: string; // Placeholder for the input field
  shortcut?: string; // Optional keyboard shortcut for the command
  group?: string; // Optional group for categorizing commands
};

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

  const register = (actions: CommandAction[]) => {
    actions.forEach((action) => actionsRef.current.set(action.id, action));
  };

  const unregister = (ids: string[]) => {
    ids.forEach((id) => actionsRef.current.delete(id));
  };

  const getActions = () => Array.from(actionsRef.current.values());

  const value = {register, unregister, getActions};

  return <CommandContext.Provider value={value}>{children}</CommandContext.Provider>;
};

export const useCommandRegistry = () => {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error('useCommandRegistry must be used within a CommandProvider');
  return ctx;
};
