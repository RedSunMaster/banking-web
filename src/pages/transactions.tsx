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
import { url } from 'inspector';




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

export const Transactions = () => {
    const {databaseInformation, setUpdateValues} = React.useContext(DatabaseInformationContext);
    const [open, setOpen] = React.useState(false);
    const [edit, setEdit] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleEdit = () => setEdit(true);
    const handleCloseEdit = () => setEdit(false);
    const [openAlert, setOpenAlert] = React.useState(false);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',]
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);



    const [filterCategory, setFilterCategory] = React.useState('')
    const [category, setCategory] = React.useState('')
    const [postMsg, setPostMsg] = React.useState('')
    const [description, setDescription] = React.useState('')
    const [amount, setAmount] = React.useState(0)
    const [trans_type, setTransaction] = React.useState('Withdraw')
    const [inputDate, setDate] = React.useState<Dayjs | null>(dayjs())
    const [filterTransactions, setFilterTransactions] = React.useState<TransactionItem[]>([])
    const [filterBalance, setFilterBalance] = React.useState<BalanceItem>()


    const [newCategory, setNewCategory] = React.useState('')
    const [newDescription, setNewDescription] = React.useState('')
    const [newAmount, setNewAmount] = React.useState(0)
    const [newTrans_type, setNewTransaction] = React.useState('Withdraw')
    const [newInputDate, setNewDate] = React.useState<Dayjs | null>(dayjs())
    const [transactionId, setTransactionId] = React.useState(0)

    React.useEffect(() => {
      if (databaseInformation) {
        if (filterCategory == "") {
          const urlParams = new URLSearchParams(window.location.search);
          const category = urlParams.get('category');
          if (category) {
            setFilterCategory(category);
            setCategory(category)
            setFilterBalance(databaseInformation.balances.find((balance) => balance.Category === category))
            setFilterTransactions(
              databaseInformation?.transactions.filter(
                (transaction) => transaction.Category === category)
              )
          } else {
            setFilterCategory(databaseInformation.categories[0].categoryName)
            setCategory(databaseInformation.categories[0].categoryName)
            setFilterBalance(databaseInformation.balances.find((balance) => balance.Category === databaseInformation.categories[0].categoryName))
            setFilterTransactions(
              databaseInformation?.transactions.filter(
                (transaction) => transaction.Category === databaseInformation.categories[0].categoryName
              )
            );
          }
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

    const handleAddTransaction = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        let inputAmount = amount;
        if (trans_type === "Withdraw") {
          inputAmount = amount * -1;
        }
        console.log(inputAmount);
        const authToken = Cookies.get("authToken");
        const date = dayjs(inputDate).format("YYYY-MM-DD").toString();
        const data = {
          "category": category,
          "date": date,
          "description": description,
          "amount": inputAmount,
          "trans_type": trans_type,
        };
        console.log("Request body:", data);
    
        const response = await axios.post("/api/transactions", data, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Successfully Added Transaction");
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
    

    const handleUpdateTransaction = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        let inputAmount = newAmount;
        if (newTrans_type === "Withdraw") {
          inputAmount = newAmount * -1;
        }
        const authToken = Cookies.get("authToken");
        const date = dayjs(newInputDate).format("YYYY-MM-DD").toString();
        const data = {
          "category": newCategory,
          "date": date,
          "description": newDescription,
          "amount": inputAmount,
          "trans_type": newTrans_type,
          "transactionId": transactionId
        };
        console.log("Request body:", data);
    
        const response = await axios.patch("/api/transactions", data, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Successfully Updated Transaction");
          setEdit(false);
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
    

    const handleDeleteTransaction = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        const authToken = Cookies.get("authToken");
        const data = {
          "transactionId": transactionId
        };
    
        const response = await axios({
          method: 'delete',
          url: '/api/transactions',
          data: data,
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Successfully Deleted Transaction");
          setEdit(false);
          setUpdateValues(true);
        } else {
          setPostMsg("Error" + response.statusText);
        }
      } catch (error) {
        setPostMsg("Error: " + error);
        console.error(error);
      }
      setOpenAlert(true);
    }
    

    if (!databaseInformation) {
      return <div>Loading...</div>;
    }


    

    function renderRow(props: ListChildComponentProps) {
      const { index, style } = props;
      const transaction = filterTransactions[index];
    
      return (
        <ListItem style={style} key={transaction?.transactionID} sx={{ display: 'flex' }}>
          <ListItemButton onClick={() => editTransaction(transaction)}>
            <ListItemText primary={transaction?.Description} secondary={dayjs(transaction?.Date).format("DD-MM-YYYY")} />
            <Box sx={{ flexGrow: 1 }} />
            <Typography align="right" variant="body2">
              ${transaction?.Amount}
            </Typography>
          </ListItemButton>
        </ListItem>
      );
    }

    function renderAlikeRow(props: ListChildComponentProps) {
      const { index, style } = props;
      const item = percentageChanges[index];
    
      return (
        <ListItem style={style} key={item?.description} sx={{ display: 'flex' }}>
          <ListItemText
            primary={item?.description}
            secondary={
              <span
                style={{
                  color: item?.percentageChange < 0 ? "green" : "red",
                  fontWeight: 'bold'
                }}
              >
                {item?.percentageChange.toFixed(2) + "%"}
              </span>
            }
          />
        </ListItem>
      );
    }

    const editTransaction = (transaction: TransactionItem) => {
      setNewCategory(transaction.Category)
      setNewAmount(Math.abs(transaction.Amount))
      setNewDate(dayjs(transaction.Date))
      setNewDescription(transaction.Description)
      setNewTransaction(transaction.Transaction)
      setTransactionId(transaction.transactionID)
      setEdit(true)
    }

    const filteredTransactionsLineChart = filterTransactions.filter(
      (transaction) =>
        transaction.Amount < 0 &&
        !transaction.Description.includes("Balancing") &&
        !transaction.Description.includes("Trans")
    );

    const filteredStatsTransactions = filterTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.Date);
      return (
        transaction.Amount < 0 &&
        !transaction.Description.includes("Balance") &&
        !transaction.Description.includes("Trans") &&
        ((transactionDate >= startOfLastMonth && transactionDate <= endOfLastMonth) ||
          (transactionDate >= startOfCurrentMonth && transactionDate <= endOfCurrentMonth))
      );
    });
    
    const groupedStatsTransactions = filteredStatsTransactions.reduce((acc: Record<string, TransactionGroup>, transaction) => {
      const key = transaction.Description;
      if (!acc[key]) {
        acc[key] = { lastMonth: 0, currentMonth: 0 };
      }
      const transactionDate = new Date(transaction.Date);
      if (transactionDate >= startOfLastMonth && transactionDate <= endOfLastMonth) {
        acc[key].lastMonth += Math.abs(transaction.Amount);
      } else if (transactionDate >= startOfCurrentMonth && transactionDate <= endOfCurrentMonth) {
        acc[key].currentMonth += Math.abs(transaction.Amount);
      }
      return acc;
    }, {});
    
    const percentageChanges = Object.entries(groupedStatsTransactions)
      .filter(([_, { lastMonth, currentMonth }]) => lastMonth > 0 && currentMonth > 0)
      .map(([description, { lastMonth, currentMonth }]) => ({
        description,
        percentageChange: ((currentMonth - lastMonth) / Math.abs(lastMonth)) * 100,
    }));
        
  
    const groupedTransactions = filteredTransactionsLineChart.reduce((acc, transaction) => {
      const year = transaction.Date.getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(transaction);
      return acc;
    }, {} as Record<number, TransactionItem[]>);

    const monthlySums = Object.entries(groupedTransactions).map(([year, transactions]) => {
      const sums = transactions.reduce((acc, transaction) => {
        const month = transaction.Date.getMonth();
        acc[month] += transaction.Amount;
        return acc;
      }, Array.from({ length: 12 }, () => 0));
      return { year, sums: sums.map((sum) => Math.abs(Number(sum.toFixed(2)))) };
    });
    
    const lineSeries = monthlySums.map(({ year, sums }) => ({
      data: sums,
      label: year
    }));
    

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
            id="outlined-adornment-transaction"
            type="text"
            readOnly={true}
            value={trans_type}
            endAdornment={
              <InputAdornment position="end">
                <Switch
                  checked={trans_type === 'Deposit'}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setTransaction(event.target.checked ? 'Deposit' : 'Withdraw');
                  }}
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
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={edit}
        onClose={handleCloseEdit}
        closeAfterTransition
      >
        <Fade in={edit}>
          <Box sx={style}>
          <h2 className='pageTitle'>Edit Transaction</h2>
          <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              defaultValue={newInputDate}
              onChange={(newValue: Dayjs | null) => {
                setNewDate(newValue);
              }}
            />
          </LocalizationProvider>
          </FormControl>
        <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-category">Category</InputLabel>
          <Select
            label="Category"
            className='select'
            value={newCategory}
            onChange={(event: SelectChangeEvent<string>) => {setNewCategory(event.target.value as string)}}
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
            id="outlined-adornment-transaction"
            type="text"
            readOnly={true}
            value={newTrans_type}
            endAdornment={
              <InputAdornment position="end">
                <Switch
                  checked={trans_type === 'Deposit'}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setNewTransaction(event.target.checked ? 'Deposit' : 'Withdraw');
                  }}
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
            value={newAmount}
            onChange={(event) => setNewAmount(Number(event.target.value))}
          />
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
          <InputLabel htmlFor="outlined-adornment-description">Description</InputLabel>
          <OutlinedInput
            id="outlined-adornment-description"
            label="Description"
            type='text'
            value={newDescription}
            onChange={(event) => setNewDescription(event.target.value)}
          />
        </FormControl>
        <Box display={'flex'} flexDirection={'row'}>        
          <Button variant="outlined" color="error" fullWidth sx={{ marginTop: 1, marginRight: 2}} onClick={handleDeleteTransaction}>Delete</Button>
          <Button variant="contained" color="success" fullWidth sx={{ marginTop: 1}} onClick={handleUpdateTransaction}>Update</Button>
        </Box>


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
                    {filterCategory} Transactions 
                  </Typography>
                  </Grid>
                  <Grid>
                  <Typography variant="h6">
                  <b style={{fontSize: '30px', lineHeight: '50px',border: '4px solid ' + filterBalance?.Colour, borderRadius: '10px', padding: '5px', float: 'left', width:'150px', backgroundColor: filterBalance?.Colour, textAlign: 'center'}}>${filterBalance?.Amount}</b>
                  </Typography>
                  </Grid>
                  <Grid>
                  <Typography variant="h6">
                    Number of Transactions: <b>{filterTransactions.length}</b>
                  </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Masonry columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }} spacing={0}>
          <Grid xs={2} sm={2} md={4} lg={8} xl={6}>
          <Card elevation={4}>
              <CardContent>
                <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-filter">Filter</InputLabel>
                <Select
                  label="Filter"
                  className='select'
                  value={filterCategory}
                  onChange={(event: SelectChangeEvent<string>) => {
                    const newCategory = event.target.value as string;
                    setFilterCategory(newCategory);
                    setCategory(newCategory);
                    setFilterTransactions(
                      databaseInformation.transactions.filter(
                        (transaction) => transaction.Category === newCategory
                      )
                    );
                    setFilterBalance(databaseInformation.balances.find((balance) => balance.Category === newCategory))
                  }}
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
              </CardContent>
            </Card>
            <Card elevation={4} sx={{height:300}}>
              <CardContent sx={{height:'100%'}}>
                <AutoSizer>
                  {({height, width}) => (
                      <FixedSizeList
                        width={width}
                        height={height}
                        itemSize={75}
                        itemCount={filterTransactions.length}
                        overscanCount={5}
                      >
                      {renderRow}
                    </FixedSizeList>
                  )}
              </AutoSizer>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={2} md={4} lg={8} xl={6}> 
          <Card elevation={4} sx={{height:300}}>
              <CardContent sx={{height:'100%'}}>
                
                  <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                    Monthly {filterCategory} Spending
                  </Typography>
                  <AutoSizer>
                  {({height, width}) => (
                <LineChart
                  series={lineSeries}
                  height={height}
                  width={width}
                  xAxis={[{
                    data: months,
                    scaleType: 'band',

                  }]}
                   ></LineChart>)}
                   </AutoSizer>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={2} md={4} lg={8} xl={6}> 
            <Card elevation={4} sx={{height:400}}>
            <CardContent sx={{height:'100%'}}>
                <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                  Monthly Spending Habits
                </Typography>
                <AutoSizer style={{marginTop: 30}}>
                  {({height, width}) => (
                      <FixedSizeList
                        width={width}
                        height={height}
                        itemSize={75}
                        itemCount={percentageChanges.length}
                        overscanCount={5}
                      >
                      {renderAlikeRow}
                    </FixedSizeList>
                    )}
                </AutoSizer>
              </CardContent>
            </Card>
          </Grid>
          </Masonry>
        </Grid>
      </Box>
  );
};

export default Transactions;
