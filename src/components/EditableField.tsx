import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import {Box, IconButton, TextField, Typography} from '@mui/material';
import {useState} from 'react';

interface EditableFieldProps {
  label: string | null;
  placeholder: string;
  multiline?: boolean;
  variant?: 'title' | 'body';
  onSave: (value: string) => void;
}

const EditableField = ({
  label,
  placeholder,
  multiline,
  variant = 'body',
  onSave,
}: EditableFieldProps) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(label ?? '');

  const handleSave = () => {
    setEditing(false);

    if (value !== label) {
      onSave(value);
    }
  };

  const button = (
    <IconButton
      onClick={() => {
        if (editing) {
          handleSave();
        } else {
          setEditing(true);
        }
      }}
      size="small"
      aria-label={editing ? 'Gem' : 'Rediger'}
      sx={{color: 'primary.main'}}
    >
      {editing ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
    </IconButton>
  );

  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
      {!editing ? (
        <Typography
          variant={variant === 'title' ? 'h6' : 'body2'}
          // The placeholder is greyed out; a real value reads as normal text.
          sx={{color: label ? 'text.primary' : 'text.secondary'}}
        >
          {label || placeholder}
        </Typography>
      ) : (
        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          size="small"
          fullWidth
          multiline={multiline}
          placeholder={placeholder}
          autoFocus
        />
      )}
      {button}
    </Box>
  );
};

export default EditableField;
