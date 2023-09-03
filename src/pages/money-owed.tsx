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
import { VisibilityOff, Visibility, Transcribe } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import axios from 'axios';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { AutoSizer, List } from 'react-virtualized';
import TransactionItem from '../types/Transaction';
import BalanceItem from '../types/BalanceItem';
import Masonry from '@mui/lab/Masonry';




interface TransactionGroup {
  lastMonth: number;
  currentMonth: number;
}


const style = (theme: Theme) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  borderRadius: '12px',
  padding: '16px 32px 24px 32px',
  backgroundColor: theme.palette.mode === 'dark' ? '#0A1929' : 'white',
  boxShadow: 16,
});

export const MoneyOwed = () => {
    const {databaseInformation, setUpdateValues} = React.useContext(DatabaseInformationContext);
    const [open, setOpen] = React.useState(false);
    const [edit, setEdit] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleEdit = () => setEdit(true);
    const handleCloseEdit = () => setEdit(false);
    const [openAlert, setOpenAlert] = React.useState(false);

    const [filterCategory, setFilterCategory] = React.useState('')
    const [category, setCategory] = React.useState('')
    const [postMsg, setPostMsg] = React.useState('')
    const [description, setDescription] = React.useState('')
    const [inputAmount, setAmount] = React.useState(0)
    const [person, setPerson] = React.useState('')
    const [inputDate, setDate] = React.useState<Dayjs | null>(dayjs())
    const [filterTransactions, setFilterTransactions] = React.useState<TransactionItem[]>([])
    const [filterBalance, setFilterBalance] = React.useState<BalanceItem>()

    const [newCategory, setNewCategory] = React.useState('')
    const [newDescription, setNewDescription] = React.useState('')
    const [newAmount, setNewAmount] = React.useState(0)
    const [newPerson, setNewPerson] = React.useState('')
    const [newInputDate, setNewDate] = React.useState<Dayjs | null>(dayjs())
    const [OwedItemId, setOwedItemId] = React.useState(0)


    
    React.useEffect(() => {
      if (databaseInformation) {
        if (filterCategory == "") {
          setFilterCategory(databaseInformation.categories[0].categoryName)
          setCategory(databaseInformation.categories[0].categoryName)
          setFilterBalance(databaseInformation.balances.find((balance) => balance.Category === databaseInformation.categories[0].categoryName))
          setFilterTransactions(
            databaseInformation?.transactions.filter(
              (transaction) => transaction.Category === databaseInformation.categories[0].categoryName
            )
          );
        } else {
            setFilterTransactions(
              databaseInformation?.transactions.filter(
                (transaction) => transaction.Category === filterCategory
              )
            );
            setFilterBalance(databaseInformation.balances.find((balance) => balance.Category === filterCategory))

          }
      }
    }, [databaseInformation]);

    const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setOpenAlert(false);
      };

    if (!databaseInformation) {
      return <div>Loading...</div>;
    }

    const notPayedItems = databaseInformation.owedItems.filter((owedItem) => (owedItem.bpayed == false))
    console.log(notPayedItems)



    const handleAddOwedItem = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try {
          const authToken = Cookies.get("authToken");
          const date = dayjs(inputDate).format("YYYY-MM-DD").toString();
          const data = {
            "category": category,
            "date": date,
            "description": description,
            "amount": inputAmount,
            "person": person,
          };
      
          const response = await axios.post("/api/moneyOwed", data, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (response.status === 200) {
            setPostMsg("Successfully Logged Money Owed");
            setOpen(false);
            setUpdateValues(true);
          } else {
            setPostMsg("Error" + response.statusText);
          }
        } catch (error) {
          setPostMsg("Error: " + error);
          console.error(error);
        }
        setOpenAlert(true);
      };



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
            className='select'
            value={category}
            onChange={(event: SelectChangeEvent<string>) => {setCategory(event.target.value as string)}}
            inputProps={{
              name: 'category',
              id: 'outlined-adornment-category',
            }}>
            {databaseInformation.categories.map((category) => (
              <MenuItem key={category.categoryId} value={category.categoryName}>
                {category.categoryName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
          <OutlinedInput
            id="outlined-adornment-person"
            type="text"
            label="Person"
            value={person}
            onChange={(event) => setPerson(event.target.value)}
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
        <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleAddOwedItem}>Add</Button>
          </Box>
        </Fade>
      </Modal>
        <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
          {postMsg}
        </Alert>
        </Snackbar>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 8, md: 12, lg: 16, xl: 20 }}>
          <Grid xs={2} sm={8} md={12} lg={16} xl={20}>
            <Card elevation={12} sx={{width:'100%', display:'flex', position:'relative', flexDirection: 'column', backgroundColor: filterBalance?.Colour + '40'}}>
              <CardContent>
              <Grid container direction="column" width='100%'>
                  <Grid>
                  <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                     Owed Money
                  </Typography>
                  </Grid>
                  <Grid>
                  <Typography variant="h6">
                    Total Money Owed: <b>{filterTransactions.length}</b>
                  </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Masonry columns={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }} spacing={2}>
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
          <Card elevation={4}>
              <CardContent>
              </CardContent>
            </Card>
          </Grid>
          </Masonry>
        </Grid>
      </Box>
  );
};

export default MoneyOwed;
