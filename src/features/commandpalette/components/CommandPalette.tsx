import {Command} from 'cmdk';
import {CommandAction, useCommandRegistry} from './CommandContext';
import {useState, useEffect} from 'react';
import '../styles/cmdk.css';
import {Box} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [actions, setActions] = useState<ReturnType<typeof getActions>>([]);
  const [selectedAction, setSelectedAction] = useState<CommandAction | null>(null);
  const {getActions} = useCommandRegistry();
  const [page, setPage] = useState<'all' | 'input' | 'selection'>('all');
  const {isMobile} = useBreakpoints();

  // const updateActions = useCallback(() => {
  //   setActions(getActions());
  // }, [getActions]);

  const onClose = () => {
    setOpen(false);
    setSearch('');
    setPage('all');
    setSelectedAction(null);
  };

  const itemSelect = (action: CommandAction) => {
    if (action.type === 'input') {
      setPage('input');
      setSearch('');
      setSelectedAction(action);
    } else if (action.type === 'selection') {
      setPage('selection');
      setSearch('');
      setSelectedAction(action);
    } else {
      action.perform();
      onClose();
    }
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const actions = getActions();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActions(actions);
        setOpen((prev) => !prev);
      }

      if (e.key === 'Escape' && page !== 'all') {
        console.log("Escape pressed, resetting to 'all' page");
        e.preventDefault();
        setPage('all');
        setSelectedAction(null);
      }

      if (open) {
        actions.forEach((action) => {
          if (
            action.shortcut &&
            e.key.toLowerCase() === action.shortcut.toLowerCase() &&
            (e.metaKey || e.ctrlKey)
          ) {
            e.preventDefault();
            itemSelect(action);
          }
        });
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [open, page]);

  return (
    <Command.Dialog
      loop
      shouldFilter={page === 'all'}
      open={open}
      onOpenChange={onClose}
      title="Command Palette"
      label="Global Command Menu"
      className={`cmdk-overlay ${isMobile ? 'mobile' : ''}`}
      aria-describedby="cmdk-description"
    >
      <div className={`cmdk-container ${isMobile ? 'mobile' : ''}`}>
        {page === 'input' && selectedAction ? (
          <Command.Input
            placeholder={selectedAction.inputPlaceholder || 'Indtast din kommando...'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                selectedAction.perform(e.currentTarget.value);
                onClose();
              }
            }}
            className="cmdk-input"
          />
        ) : (
          <Command.Input
            placeholder="Søg efter en handling..."
            value={search}
            onValueChange={setSearch}
            className="cmdk-input"
          />
        )}
        <Command.List className="cmdk-list">
          {page == 'all' && <Command.Empty className="cmdk-empty">Ingen resultater</Command.Empty>}
          {page == 'selection' && (
            <Command.Empty className="cmdk-empty">Ingen resultater</Command.Empty>
          )}
          {page == 'selection' &&
            selectedAction?.options
              ?.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()))
              .slice(0, 20)
              .map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.value}
                  className="cmdk-item"
                  onSelect={() => {
                    selectedAction.perform(option.value);
                    onClose();
                  }}
                >
                  <div />
                  {option.label}
                </Command.Item>
              ))}
          {actions.length > 0 &&
            page == 'all' &&
            actions.map((action) => (
              <Command.Item
                key={action.id}
                value={action.name}
                className="cmdk-item"
                onSelect={() => {
                  itemSelect(action);
                }}
              >
                {action.icon ? action.icon : <div />}
                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                  {action.name}
                  {action.shortcut && (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                      <kbd className="cmdk-shortcut">CTRL</kbd>
                      <kbd key={action.shortcut} className="cmdk-shortcut">
                        {action.shortcut}
                      </kbd>
                    </Box>
                  )}
                </Box>
              </Command.Item>
            ))}
        </Command.List>
      </div>
    </Command.Dialog>
  );
}

export default CommandPalette;
