import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
import CardContent from '@mui/material/CardContent';
import { LineChart } from '@mui/x-charts';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import 'react-virtualized/styles.css'; // only needs to be imported once
import { DatabaseInformationContext } from '../utils/DatabaseInformation';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Alert, Snackbar } from '@mui/material';
import dayjs from 'dayjs';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized';
import TransactionItem from '../types/Transaction';
import BalanceItem from '../types/BalanceItem';
import Masonry from '@mui/lab/Masonry';
import checkIsLoggedIn from '../auth/auth';
import { useNavigate } from 'react-router-dom';
import AddCategoryModal from '../components/addCategoryModal';
import AddTransactionModal from '../components/addTransactionModal';



interface TransactionGroup {
  lastMonth: number;
  currentMonth: number;
}



export const Transactions = () => {
    const { categories, balances, transactions, user, setUpdateUser, setUpdateCategories, setUpdateBalances, setUpdateTransactions } = React.useContext(DatabaseInformationContext);
    const [category, setCategory] = React.useState('');
    const [openAlert, setOpenAlert] = React.useState(false);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',]
    const now = new Date();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const [filterCategory, setFilterCategory] = React.useState('')
    const [postMsg, setPostMsg] = React.useState('')
    const [item, setItem] = React.useState<TransactionItem | undefined>(undefined)

    const [filterTransactions, setFilterTransactions] = React.useState<TransactionItem[]>([])
    const [filterBalance, setFilterBalance] = React.useState<BalanceItem>()

    const navigate = useNavigate()


    const handleSetItem = (item: TransactionItem | undefined, callback: () => void) => {
      setItem(item);
      callback();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkIsLoggedIn().then((result) => {
          if (!result) {
              navigate('/login')
          }
        })
      }
    };
  
    const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""

    React.useLayoutEffect(() => {
      document.addEventListener("visibilitychange", onVisibilityChange);
  
      return () =>
        document.removeEventListener("visibilitychange", onVisibilityChange);
    }, []);

    React.useEffect(() => {
      checkIsLoggedIn().then((result) => {
        if (!result) {
            navigate('/login')
        }
      })
      if (transactions.length === 0) {
          setUpdateTransactions(true);
      }
      if (categories.length === 0) {
          setUpdateCategories(true);
      }
      if (balances.length === 0) {
          setUpdateBalances(true);
      }
  }, []);
  

    React.useEffect(() => {
      if (transactions) {
        if (transactions.length !== 0) {
        if (filterCategory === "") {
          const urlParams = new URLSearchParams(window.location.search);
          const category = urlParams.get('category');
          if (category) {
            setFilterCategory(category);
            setCategory(category)
            setFilterBalance(balances.find((balance) => balance.Category === category))
            setFilterTransactions(
              transactions.filter(
                (transaction) => transaction.Category === category)
              )
          } else {
            setFilterCategory(categories[0].categoryName)
            setCategory(categories[0].categoryName)
            setFilterBalance(balances.find((balance) => balance.Category === categories[0].categoryName))
            setFilterTransactions(
              transactions.filter(
                (transaction) => transaction.Category === categories[0].categoryName
              )
            );
          }
        } else {
            setFilterTransactions(
              transactions.filter(
                (transaction) => transaction.Category === filterCategory
              )
            );
            setFilterBalance(balances.find((balance) => balance.Category === filterCategory))

          }
      }
    }
    }, [transactions, balances]);


    const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpenAlert(false);
    };

  

    

    function renderRow(props: ListChildComponentProps) {
      const { index, style } = props;
      const transaction = filterTransactions[index];
    
      return (
        <ListItem style={style} key={transaction?.transactionID} sx={{ display: 'flex' }}>
          <ListItemButton onClick={() => {handleSetItem(transaction, handleOpen);}}>
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
        <AddTransactionModal 
            categories={categories}
            setUpdateTransactions={setUpdateTransactions} 
            setUpdateBalances={setUpdateBalances} 
            setOpenAlert={setOpenAlert}
            setPostMsg={setPostMsg}
            item={item}
            handleOpen={handleOpen}
            handleClose={handleClose}
            open={open}
            inputCategory={category}
        />
      <AddCategoryModal 
          setUpdateCategories={setUpdateCategories} 
          setUpdateBalances={setUpdateBalances} 
          setOpenAlert={setOpenAlert}
          setPostMsg={setPostMsg}
      />
        <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
          {postMsg}
        </Alert>
        </Snackbar>
        {transactions.length === 0 ? (
          // Display a message if there are no transactions
          <Box>
            <Typography variant='h4'>
              No Transactions
            </Typography><br/>
            <Typography>
              Use the action buttons at the bottom of the page to get started
            </Typography>
          </Box>
        ) : (
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
          <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }} spacing={0}>
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
                      transactions.filter(
                        (transaction) => transaction.Category === newCategory
                      )
                    );
                    setFilterBalance(balances.find((balance) => balance.Category === newCategory))
                  }}
                  inputProps={{
                    name: 'category',
                    id: 'outlined-adornment-category',
                  }}
                >
                  {categories.map((category) => (
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
        )}
    </Box>
  );
};

export default Transactions;
