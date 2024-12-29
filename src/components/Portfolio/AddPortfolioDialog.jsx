import { styled } from '@mui/material/styles';

const DarkDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
  },
  '& .MuiDialogTitle-root': {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
  },
  '& .MuiDialogContent-root': {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    '& .MuiTextField-root': {
      backgroundColor: '#2d2d2d',
      '& .MuiOutlinedInput-root': {
        backgroundColor: '#2d2d2d',
        color: '#ffffff',
      },
      '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.7)',
      },
    },
  },
  '& .MuiDialogActions-root': {
    backgroundColor: '#1e1e1e',
  },
}));

// Используйте DarkDialog вместо Dialog
return (
  <DarkDialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
  >
    {/* ... содержимое диалога ... */}
  </DarkDialog>
); 