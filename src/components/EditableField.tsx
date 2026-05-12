import {Box, IconButton, TextField, Typography} from '@mui/material';

import {useState} from 'react';

import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';

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

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <IconButton
        onClick={() => {
          if (editing) {
            handleSave();
          } else {
            setEditing(true);
          }
        }}
        size="small"
        sx={{color: 'primary.main'}}
      >
        {editing ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
      </IconButton>

      {!editing ? (
        <Typography
          fontWeight={variant === 'title' ? 'bold' : undefined}
          color={editing ? 'textPrimary' : 'textSecondary'}
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
        />
      )}
    </Box>
  );
};

export default EditableField;
