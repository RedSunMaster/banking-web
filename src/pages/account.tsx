import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Button, Snackbar } from '@mui/material';
import { DatabaseInformationContext } from '../utils/DatabaseInformation';
import Alert from '@mui/lab/Alert';



export const Account = () => {
    const {databaseInformation, setUpdateValues} = React.useContext(DatabaseInformationContext);
  const [email, setEmail] = useState('');
  const [fName, setfName] = useState('');
  const [lName, setlName] = useState('');
  const [phone, setPhone] = useState('');
  const [postMsg, setPostMsg] = React.useState('')
  const [openAlert, setOpenAlert] = React.useState(false);

  React.useEffect(() => {
    if (databaseInformation) {
        setfName(databaseInformation.user.fName)
        setlName(databaseInformation.user.lName)
        setEmail(databaseInformation.user.email)
        setPhone(databaseInformation.user.phone)
    }
  }, [databaseInformation]);



  const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  const handleUpdateUser = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
        const authToken = Cookies.get('authToken')
        const response = await axios.patch('/api/user', { fName, lName, email, phone },{
            headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
            setPostMsg("Successfully Updated Owed Item");
            setUpdateValues(true);
          } else {
            setPostMsg("Error" + response.statusText);
          }
    } catch (error) {
      console.error(error);
    }
  };


  if (!databaseInformation) {
    return <div>Loading...</div>
  }  

  return (
    <Box sx={{ flexGrow: 1 }}>
        <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
          {postMsg}
        </Alert>
        </Snackbar>
    <Box justifyContent="center" sx={{ display: 'flex', flexDirection: 'column'}}>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', width: '100%' }}>
        </Box>
          <div>
            <h2 className='pageTitle'>Account Settings</h2>
            <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
              <InputLabel htmlFor="outlined-adornment-fName">First Name</InputLabel>
              <OutlinedInput
                id="outlined-adornment-fName"
                label="First Name"
                type="text"
                value={fName}
                onChange={(event) => setfName(event.target.value)}
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-lName">Last Name</InputLabel>
              <OutlinedInput
                id="outlined-adornment-lNmae"
                label="Last Name"
                type="text"
                value={lName}
                onChange={(event) => setlName(event.target.value)}
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-email">Email</InputLabel>
              <OutlinedInput
                id="outlined-adornment-email"
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-phone">Phone</InputLabel>
              <OutlinedInput
                id="outlined-adornment-phone"
                label="Phone"
                type="number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </FormControl>
            <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleUpdateUser}>Update Account</Button>
          </div>
    </Box>
    </Box>
  );
};
