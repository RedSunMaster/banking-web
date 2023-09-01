import React, { useEffect } from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
import CardContent from '@mui/material/CardContent';
import Cookies from 'js-cookie';
import { PieChart, LineChart, BarChart, CurveType } from '@mui/x-charts';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import 'react-virtualized/styles.css'; // only needs to be imported once
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { DatabaseInformationContext } from '../utils/DatabaseInformation';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import format from 'date-fns/format';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Modal, Fade, Theme, Button, FormControl,Switch, IconButton, InputAdornment, InputLabel, OutlinedInput, Select, MenuItem, SelectChangeEvent, Alert, Snackbar } from '@mui/material';
import { VisibilityOff, Visibility } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import axios from 'axios';



const style = (theme: Theme) => ({
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',

  borderRadius: '12px',
  padding: '16px 32px 24px 32px',
  backgroundColor: theme.palette.mode === 'dark' ? '#0A1929' : 'white',
  boxShadow: 16,
});
  

  export const Transactions = () => {
    const {databaseInformation, setUpdateValues} = React.useContext(DatabaseInformationContext);
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [openAlert, setOpenAlert] = React.useState(false);
    const today = new Date();

    const [category, setCategory] = React.useState('')
    const [postMsg, setPostMsg] = React.useState('')
    const [description, setDescription] = React.useState('')
    const [amount, setAmount] = React.useState(0)
    const [trans_type, setTransaction] = React.useState('Withdraw')
    const [inputDate, setDate] = React.useState<Dayjs | null>(dayjs())

    const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpenAlert(false);
    };


    const handleCategoryChange = (event: SelectChangeEvent<string>) => {
      setCategory(event.target.value as string);
    };


    const handleTransactionTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setTransaction(event.target.checked ? 'Deposit' : 'Withdraw');
    };



    const handleAddTransaction = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        if (trans_type == "Withdraw") {
          setAmount(amount*-1)
        }
        const authToken = Cookies.get('authToken');
        const date = dayjs(inputDate).format('YYYY-MM-DD').toString();
        const data = { category, date, description, amount, trans_type };
        console.log('Request body:', data);
        
        const response = await axios.post('/api/transactions', data,{
          headers: { Authorization: `Bearer ${authToken}` },
        });        
        if (response.status == 200) {
          setPostMsg("Successfully Added Transaction")
          setOpen(false)
          setUpdateValues(true)
        } else {
          setPostMsg("Error" + response.statusText)
        }
        setOpenAlert(true)
      } catch (error) {
        console.error(error);
      }
    };
    


    if (!databaseInformation) {
      return <div>Loading...</div>;
    }

    const columns: GridColDef[] = [
      { field: 'transactionID', headerName: 'ID', flex: 1 },
      {
        field: 'Date',
        headerName: 'Date',
        flex: 1,
        valueFormatter: (params) => format(params.value, 'dd-MMMM-yy'),
        sortComparator: (v1, v2) => v1.getDate() - v2.getDate(),
      },
      {
        field: 'Amount',
        headerName: 'Amount',
        flex: 1,
        renderCell: (params) => `$${params.value.toFixed(2)}`,
      },
      { field: 'Category', headerName: 'Category', flex: 1 },
      { field: 'Description', headerName: 'Description', flex: 1 },
    ];
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Fab
        color="primary"
        aria-label="add"
        size='large'
        onClick={handleOpen}
        sx={{ position: 'fixed', bottom: 32, right: 32}}
      >
        <AddIcon />
      </Fab>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
      >
        <Fade in={open}>
          <Box sx={style}>
          <h2 className='pageTitle'>Add Transaction</h2>
          <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              defaultValue={inputDate}
              onChange={(newValue: Dayjs | null) => {
                setDate(newValue);
              }}
            />
          </LocalizationProvider>
          </FormControl>
        <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-category">Category</InputLabel>
          <Select
            label="Category"
            value={category}
            onChange={handleCategoryChange}
            inputProps={{
              name: 'category',
              id: 'outlined-adornment-category',
            }}
          >
            {databaseInformation.categories.map((category) => (
              <MenuItem key={category.categoryId} value={category.categoryName}>
                {category.categoryName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
          <OutlinedInput
            id="outlined-adornment-transaction"
            type="text"
            readOnly={true}
            value={trans_type}
            endAdornment={
              <InputAdornment position="end">
                <Switch
                  checked={trans_type === 'Deposit'}
                  onChange={handleTransactionTypeChange}
                  inputProps={{ 'aria-label': 'Transaction type' }}
                />
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            label="Amount"
            type='number'
            onChange={(event) => setAmount(Number(event.target.value))}
          />
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
          <InputLabel htmlFor="outlined-adornment-description">Description</InputLabel>
          <OutlinedInput
            id="outlined-adornment-description"
            label="Description"
            type='text'
            onChange={(event) => setDescription(event.target.value)}
          />
        </FormControl>
        <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleAddTransaction}>Add</Button>
          </Box>
        </Fade>
      </Modal>
      <Snackbar open={openAlert} autoHideDuration={3000}>
        <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
          {postMsg}
        </Alert>
        </Snackbar>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 8, md: 12 }}>
          <Grid xs={2} sm={8} md={12}>
            <Card elevation={12} sx={{width:'100%', display:'flex', position:'relative', flexDirection: 'column'}}>
              <CardContent>
              <Grid container direction="column" width='100%'>
                  <Grid>
                  <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                    Transactions
                  </Typography>
                  </Grid>
                  <Grid>
                  <Typography variant="h6">
                    #. <b>{databaseInformation.transactions.length}</b>
                  </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={8} md={12}>
            <Card elevation={4}>
              <CardContent>
                  <DataGrid
                  getRowId={(row) => `${row.transactionID}`}
                  rows={databaseInformation.transactions}
                  columns={columns}
                  slots={{
                      toolbar: GridToolbar,
                  }}
                  />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
  );
};

export default Transactions;
