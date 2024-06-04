import {Theme} from '@mui/material/styles';
import * as React from 'react';

export interface SaveImageDialogProps {
  activeImage: {
    gid: number;
    comment: string;
    public: boolean;
    date: string;
    // imageurl: string; // Assuming this property exists
    // Add any other properties as needed
  };
  changeData: (field: string, value: any) => void;
  id: string;
  type: string;
  open: boolean;
  dataUri: string;
  handleCloseSave: () => void;
}

declare const SaveImageDialog: React.FC<SaveImageDialogProps>;

export default SaveImageDialog;
