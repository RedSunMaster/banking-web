import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
import CardContent from '@mui/material/CardContent';
import { LineChart } from '@mui/x-charts';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import 'react-virtualized/styles.css'; // only needs to be imported once
import { DatabaseInformationContext } from '../utils/DatabaseInformation';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Alert, Snackbar, useTheme, Menu, IconButton, List } from '@mui/material';
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
import Cookies from 'js-cookie';
import axios, { AxiosError } from 'axios';
import AddFlagModal from '../components/addFlagModal';
import FlagIcon from '@mui/icons-material/Flag';
import FlagItem from '../types/FlagItem';
import { FlagPicker } from '../components/transactionFlagMenu';
import Transaction from '../types/Transaction';
import AddRecurringTransactionModal from '../components/addRecurringTransactionModal';
import RecurringTransactionItem from '../types/RecurringTransaction';




interface TransactionGroup {
  lastMonth: number;
  currentMonth: number;
}



export const Transactions = () => {
    const { categories, balances, transactions, goalItems, user,recurringTransactions, flagItems,setUpdateRecTransactions, setUpdateGoalItems, setUpdateUser, setUpdateCategories, setUpdateBalances, setUpdateTransactions, setUpdateFlags } = React.useContext(DatabaseInformationContext);
    const [category, setCategory] = React.useState('');
    const [openAlert, setOpenAlert] = React.useState(false);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',]
    const now = new Date();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    const [openRec, setOpenRec] = React.useState(false);
    const handleOpenRec = () => setOpenRec(true);
    const handleCloseRec = () => setOpenRec(false);

    const [canOpen, setCanOpen] = React.useState(false);

    const [openCategory, setOpenCategory] = React.useState(false);

    const handleOpenCategory = () => setOpenCategory(true);
    const handleCloseCategory = () => setOpenCategory(false);

    const [openFlag, setOpenFlag] = React.useState(false);

    const handleOpenFlag = () => setOpenFlag(true);
    const handleCloseFlag = () => setOpenFlag(false);
  
    const [selectedIndex, setIndex] = React.useState<number>(0);

    const [openTransactionId, setOpenTransactionId] = React.useState<number | null>(null);
    const [pickedFlagTransaction, setPickedFlagTransactionTransactionId] = React.useState<Transaction | null>(null);

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);


    const handleClickFlags = (event: React.MouseEvent<HTMLButtonElement>, transaction: Transaction, index: number) => {
      setOpenTransactionId(transaction.transactionID);
      setAnchorEl(event.currentTarget)
      setPickedFlagTransactionTransactionId(transaction);
      setIndex(index);
    };
    
    const handleCloseFlags = () => {
      setPickedFlagTransactionTransactionId(null)
      setAnchorEl(null);
      setOpenTransactionId(null);
      setIndex(0);
    };
  

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const [filterCategory, setFilterCategory] = React.useState('')
    const [postMsg, setPostMsg] = React.useState('')
    const [item, setItem] = React.useState<TransactionItem | undefined>(undefined)
    const [recurringItem, setRecurringItem] = React.useState<RecurringTransactionItem | undefined>(undefined)

    const [filterTransactions, setFilterTransactions] = React.useState<TransactionItem[]>([])
    const [filterRecTransactions, setFilterRecTransactions] = React.useState<RecurringTransactionItem[]>([])

    const [filterBalance, setFilterBalance] = React.useState<BalanceItem>()

    const navigate = useNavigate();
    const theme = useTheme();



    const handleSetItem = (item: TransactionItem | undefined, callback: () => void) => {
      setItem(item);
      setRecurringItem(undefined)
      callback();
    };

    const handleSetRecItem = (item: RecurringTransactionItem | undefined, callback: () => void) => {
      console.log(item)
      setRecurringItem(item)
      setItem(undefined)
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
      if (flagItems.length === 0) {
        setUpdateFlags(true);
      }
      if (recurringTransactions.length === 0) {
        setUpdateRecTransactions(true);
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
            setFilterRecTransactions(
              recurringTransactions.filter(
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
            setFilterRecTransactions(
              recurringTransactions.filter(
                (transaction) => transaction.Category === categories[0].categoryName)
              )
          }
        } else {
            setFilterTransactions(
              transactions.filter(
                (transaction) => transaction.Category === filterCategory
              )
            );
            setFilterRecTransactions(
              recurringTransactions.filter(
                (transaction) => transaction.Category === filterCategory)
              )
            setFilterBalance(balances.find((balance) => balance.Category === filterCategory))

          }
      }
    }
    }, [transactions, balances]);

    React.useEffect(() => {
      if (recurringTransactions) {
        if (filterCategory === "") {
          const urlParams = new URLSearchParams(window.location.search);
          const category = urlParams.get('category');
          if (category) {
            setFilterRecTransactions(
              recurringTransactions.filter(
                (transaction) => transaction.Category === category)
              )
          } else {
            setFilterRecTransactions(
              recurringTransactions.filter(
                (transaction) => transaction.Category === categories[0].categoryName)
              )
          }
        } else {
            setFilterRecTransactions(
              recurringTransactions.filter(
                (transaction) => transaction.Category === filterCategory)
              )

          }
    }
    }, [recurringTransactions]);



    const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpenAlert(false);
    };


    const updateTransactionFlags = async (flagId: Number, transcationId: Number) => {
      try {
        const authToken = Cookies.get("authToken");
        const data = {
          "flagId": flagId,
          "transactionId": transcationId,
        };
        const response = await axios.patch(`${rootUrl}/api/flagOperation`, data, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Transaction Altered");
          handleCloseFlag()
          setUpdateFlags(true);
          setUpdateTransactions(true);
          setUpdateBalances(true);
        } else {
          setPostMsg("Error" + response.data);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          // Handle Axios error
          const responseData = error.response?.data;
          setPostMsg("Error: " + responseData)
        }
      }
      setOpenAlert(true);
    };

    const handleFlagChange = (transactionId: Number, flagId: Number) => {
      updateTransactionFlags(flagId, transactionId)
      setAnchorEl(null)
      handleCloseFlags()
    }

    const refs = filterTransactions.map(() => React.createRef<HTMLButtonElement>());





    function renderRow(props: ListChildComponentProps) {
      const { index, style } = props;
      const transaction = filterTransactions[index];
      const transactionFlagIds = transaction?.Flags?.split(',');
      const transactionFlags = transactionFlagIds?.map((id) =>
        flagItems.find((flag) => flag.flagId === Number(id))
      );
    
      return (
        <ListItem style={style} key={index} sx={{ display: "flex" }}>
          <ListItemButton id="edit-transaction-button" onClick={() => {handleSetItem(transaction, handleOpen);}}>
            <Box sx={{ position: "relative" }}>
              {transactionFlags?.map((flag, index) => (
                <Box
                  key={flag?.flagId}
                  sx={{
                    position: "absolute",
                    top: -35,
                    left: index * 5,
                    width: "5px",
                    height: "15px",
                    backgroundColor: flag?.flagColour,
                  }}
                ></Box>
              ))}
            </Box>
            <ListItemText
              primary={transaction?.Description}
              secondary={dayjs(transaction?.Date).format("DD-MM-YYYY")}
            />
          </ListItemButton>
          <Box sx={{ flexGrow: 1 }} />
          <Typography align="right" variant="body2">
            ${transaction?.Amount}
          </Typography>
          <IconButton ref={refs[index]} key={transaction.transactionID} className={index.toString()} onClick={(event: React.MouseEvent<HTMLButtonElement>) => handleClickFlags(event, transaction, index)}>
            <FlagIcon />
          </IconButton>
        </ListItem>
      );
    }

    function renderRecRow(props: ListChildComponentProps) {
      const { index, style } = props;
      filterRecTransactions.sort((a, b) => {
        const remainingDaysA = calculateRemainingDays(a.Date, a.Frequency);
        const remainingDaysB = calculateRemainingDays(b.Date, b.Frequency);
        return remainingDaysA - remainingDaysB;
      });    
      const recTransaction = filterRecTransactions[index];
    
      return (
        <ListItem style={style} key={index} sx={{ display: "flex" }}>
          <ListItemButton id="edit-transaction-button" onClick={() => {handleSetRecItem(recTransaction, handleOpen);}}>
          <ListItemText
            primary={recTransaction?.Description}
            secondary={
              calculateRemainingDays(recTransaction.Date, recTransaction.Frequency) === 0
                ? "Due Later Today"
                : calculateRemainingDays(recTransaction.Date, recTransaction.Frequency) < 0
                ? `Due ${Math.abs(calculateRemainingDays(recTransaction.Date, recTransaction.Frequency))} Days Ago`
                : `${calculateRemainingDays(recTransaction.Date, recTransaction.Frequency)} Days Remaining`
            }
          />

          </ListItemButton>
          <Box sx={{ flexGrow: 1 }} />
          <Typography align="right" variant="body2">
            ${recTransaction?.Amount}
          </Typography>
        </ListItem>
      );
    }
    function calculateRemainingDays(startDate: Date, frequency: number) {
      const endDate = dayjs(startDate).add(frequency, 'day');
      const today = dayjs();
      return endDate.diff(today, 'day');
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

    function renderGroupTransactions(props: ListChildComponentProps) {
      const { index, style } = props;
      const item = Object.values(groupedByFlags)[index];
      const averageSpent = (item.total / item.count).toFixed(2);
    
      return (
        <ListItem style={style} key={item.flagItem.flagId} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: item.flagItem.flagColour, marginRight: 1 }} />
            <ListItemText
              primary={item.flagItem.flagName}
              secondary={"Last Added: " + new Date(item.lastDate).toLocaleDateString()}
            />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            {"Avg: $" + averageSpent}
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            {"Total: $" + item.total.toFixed(2)}
          </Box>
        </ListItem>
      );
    }
    
    



    const filteredTransactionsLineChart = filterTransactions.filter(
      (transaction) =>
        transaction.Amount < 0 &&
        !transaction.Description.includes("Balancing") &&
        !transaction.Description.includes("Trans")
    );

    const totalFilteredTransactionsLineChart = transactions.filter(
      (transaction) =>
        transaction.Amount < 0 &&
        !transaction.Description.includes("Balancing") &&
        !transaction.Description.includes("Trans")
    );

    const filteredStatsTransactions = filterTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.Date);
      return (
        transaction.Amount < 0 &&
        !transaction.Description.includes("Balancing") &&
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


    const groupedByFlags = totalFilteredTransactionsLineChart.reduce<{ [key: string]: { total: number, count: number, transactions: Transaction[], flagItem: FlagItem, lastDate: Date } }>((acc, transaction) => {
      // Check if flagItems is empty
      if (flagItems.length === 0) {
        return acc;
      }
    
      flagItems.forEach((flag: FlagItem) => {
        if (transaction.Flags !== null) {
          if (transaction.Flags.includes(flag.flagId.toString())) {
            if (!acc[flag.flagName]) {
              acc[flag.flagName] = { total: 0, count: 0, transactions: [], flagItem: flag, lastDate: transaction.Date }; // Initialize if not already present
            }
            acc[flag.flagName].total += Math.abs(transaction.Amount); // Add the transaction amount
            acc[flag.flagName].count += 1; // Increment the transaction count
            acc[flag.flagName].transactions.push(transaction); // Add the transaction to the list
    
            if (transaction.Date > acc[flag.flagName].lastDate) {
              acc[flag.flagName].lastDate = transaction.Date;
            }
          }
        }
      });
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

    const monthlyFlagSums = Object.values(groupedByFlags).map((item) => {
      const sums = item.transactions.reduce((acc, transaction) => {
        const month = new Date(transaction.Date).getMonth();
        acc[month] += Math.abs(transaction.Amount);
        return acc;
      }, Array.from({ length: 12 }, () => 0));
      return { flagItem: item.flagItem, sums: sums.map((sum) => Number(sum.toFixed(2))) };
    });
    
    
    const lineSeries = monthlySums.map(({ year, sums }) => ({
      data: sums,
      label: year
    }));

    const lineSeriesFlags = monthlyFlagSums.map(({ flagItem, sums }) => ({
      data: sums,
      label: flagItem.flagName,
      color: flagItem.flagColour // Add this line
    }));
    
    


  return (
    <Box sx={{ flexGrow: 1 }}>
        <AddTransactionModal 
            categories={categories}
            setUpdateTransactions={setUpdateTransactions} 
            setUpdateRecTransactions={setUpdateRecTransactions}
            setUpdateBalances={setUpdateBalances} 
            setOpenAlert={setOpenAlert}
            goalItems={goalItems}
            setUpdateGoalItems={setUpdateGoalItems}
            setPostMsg={setPostMsg}
            item={item}
            recurringItem={recurringItem}
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
          openCategory={openCategory}
          handleCloseCategory={handleCloseCategory}
          handleOpenCategory={handleOpenCategory}
      />
      <AddFlagModal 
          setUpdateFlags={setUpdateFlags} 
          setUpdateTransactions={setUpdateTransactions}
          setOpenAlert={setOpenAlert}
          setPostMsg={setPostMsg}
          openFlag={openFlag}
          handleCloseFlag={handleCloseFlag}
          handleOpenFlag={handleOpenFlag}
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
              <CardContent sx={{bgcolor: theme.palette.info.main}}>
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
          <Masonry columns={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }} spacing={0}>
          <Grid xs={2} sm={2} md={6} lg={8} xl={6}>
          <Card elevation={4}>
              <CardContent sx={{bgcolor: theme.palette.info.main}}>
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
                    setFilterRecTransactions(
                      recurringTransactions.filter(
                        (transaction) => transaction.Category === newCategory)
                      )
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
            <Card elevation={4} sx={{height:700}}>
              <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
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
              <FlagPicker
                flagItems={flagItems}
                transaction={pickedFlagTransaction}
                anchorEl={anchorEl}
                open={pickedFlagTransaction? true : false && canOpen}
                handleCloseFlags={handleCloseFlags}
                handleOpenFlag={handleOpenFlag}
                handleFlagChange={handleFlagChange} />
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={2} md={6} lg={8} xl={6}> 
          <Card elevation={4} sx={{height:300}}>
              <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
                
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
          <Grid xs={2} sm={2} md={6} lg={8} xl={6}> 
            <Card elevation={4} sx={{height:400}}>
            <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
                <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                  Recurring Payments
                </Typography>
                <AutoSizer style={{marginTop: 30}}>
                  {({height, width}) => (
                      <FixedSizeList
                        width={width}
                        height={height}
                        itemSize={75}
                        itemCount={filterRecTransactions.length}
                        overscanCount={5}
                      >
                      {renderRecRow}
                    </FixedSizeList>
                    )}
                </AutoSizer>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={2} md={6} lg={8} xl={6}> 
            <Card elevation={4} sx={{height:400}}>
            <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
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
          <Grid xs={2} sm={2} md={6} lg={8} xl={6}> 
            <Card elevation={4} sx={{height:400}}>
            <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
                <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                  Grouped Transactions
                </Typography>
                <AutoSizer style={{marginTop: 30}}>
                  {({height, width}) => (
                      <FixedSizeList
                        width={width}
                        height={height}
                        itemSize={75}
                        itemCount={Object.keys(groupedByFlags).length}
                        overscanCount={5}
                      >
                      {renderGroupTransactions}
                    </FixedSizeList>
                    )}
                </AutoSizer>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={2} md={6} lg={8} xl={6}> 
          <Card elevation={4} sx={{height:300}}>
              <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
                
                  <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                    Flag Spending
                  </Typography>
                  <AutoSizer>
                  {({height, width}) => (
                <LineChart
                  series={lineSeriesFlags}
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
          </Masonry>
        </Grid>
        )}
    </Box>
  );
};

export default Transactions;
