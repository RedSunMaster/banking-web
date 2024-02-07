import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
import CardContent from '@mui/material/CardContent';
import { PieChart, LineChart, BarChart } from '@mui/x-charts';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import 'react-virtualized/styles.css'; // only needs to be imported once
import TransactionItem from '../types/Transaction';
import Masonry from '@mui/lab/Masonry';
import { DatabaseInformationContext } from '../utils/DatabaseInformation';
import { Alert, Checkbox, IconButton, List, ListItem, ListItemText, Snackbar, Tooltip, useTheme } from '@mui/material';
import { AutoSizer } from 'react-virtualized';
import { useNavigate } from 'react-router-dom';
import checkIsLoggedIn from '../auth/auth';
import { AddCategoryModal } from '../components/addCategoryModal';
import AddTransactionModal from '../components/addTransactionModal';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import AddIcon from '@mui/icons-material/Add';
import AddBalanceModal from '../components/addBalanceModal';
import DeleteIcon from '@mui/icons-material/Delete';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import Joyride, {CallBackProps, STATUS, ACTIONS,EVENTS, Step} from 'react-joyride';
import dayjs from 'dayjs';
import { DragHandle } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import BalanceItem from '../types/BalanceItem';

export const Dashboard = () => {
  const { categories, balances, filteredBalances, customBalances, transactions, goalItems, flagItems, recurringTransactions, setUpdateFlags, setUpdateGoalItems,setUpdateRecTransactions, owedItems, user, setUpdateCategories, setUpdateBalances, setUpdateTransactions, setUpdateOwedItems, setUpdateUser, count, setUpdateCount } = React.useContext(DatabaseInformationContext);
  const [tempBalances, setTempBalances] = React.useState<BalanceItem[]>([])
  const [openAlert, setOpenAlert] = React.useState(false);
  const [postMsg, setPostMsg] = React.useState('')
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [openCategory, setOpenCategory] = React.useState(false);

  const handleOpenCategory = () => setOpenCategory(true);
  const handleCloseCategory = () => setOpenCategory(false);

  const [openBalance, setOpenBalance] = React.useState(false);
  const handleOpenBalance = () => setOpenBalance(true);
  const handleCloseBalance = () => setOpenBalance(false);
  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""
  const [steps, setSteps] = React.useState<Step[]>([]);


  const [hadTutorial, setHadTutorial] = React.useState(true);

  interface TutorialResponse {
    hadTutorial: boolean;
  }
  


  const fetchTutorialState = React.useCallback(async () => {
    try {
      const authToken = Cookies.get('authToken');
      const response = await axios.get<TutorialResponse[]>(`${rootUrl}/api/tutorial`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status !== 200) {
        return false;
      }
      return response.data[0].hadTutorial;
    } catch (error) {
      return false;
    }
  }, [rootUrl]); // Include all dependencies that the function relies on
  
  
  const updateTutorialState = React.useCallback(async () => {
    try {
      const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""
      const authToken = Cookies.get('authToken');
      await axios.patch(`${rootUrl}/api/tutorial`, null, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      fetchTutorialState().then((hadTutorial) => {
        setHadTutorial(hadTutorial);
      });
    } catch (error) {
      // Handle the error appropriately
    }
  }, [setHadTutorial,fetchTutorialState]); // Include all dependencies that the function relies on
  
  const [stepIndex, setStepIndex] = React.useState(0);


  const theme = useTheme(); // This line automatically gets the current theme object


  React.useEffect(() => {
    if (count >= 4 && !hadTutorial) {
      updateTutorialState();
    }
  }, [count, hadTutorial, updateTutorialState]);
  
  




  React.useEffect(() => {
    if (window.innerWidth <= 768) {
      // Mobile steps
      setSteps([
        {
          target: 'body',
          floaterProps: {
            hideArrow: true
          },
          placement:'center',
          content: (
            <div>
              <h3>Welcome To McNut Budgeting</h3>
              <p>
                Lets Start The Tour To Get You Familiar
              </p>
            </div>
          ),
          disableBeacon: true,
        },
        {
          target: '.categoryFab',
          content: (
            <div>
              <h3>Add Category</h3>
              <p>
                This action button is used for adding a category, needed for adding transactions.
              </p>
            </div>
          ),
          disableBeacon: true
        },
        {
          target: '.transactionFab',
          content: (
            <div>
              <h3>Add Transaction</h3>
              <p>
                This action button is used for adding a transaction, you can specify Date, Amount, Description and Category.
              </p>
            </div>
          ),
          disableBeacon: true
        },
        {
          target: '.toggleDrawer',
          content: (
            <div>
              <h3>Transactions Page</h3>
              <p>
                This section will show you all the specifics about your categories, including statistics, spending habits etc.
              </p>
            </div>
          ),
          disableBeacon: true
        },
        {
          target: '.toggleDrawer',
          content: (
            <div>
              <h3>Money Owed Page</h3>
              <p>
                Here you can log items that are owed to you, they are automatically negated from your balance to accurately represent your current balance
              </p>
            </div>
          ),
          disableBeacon: true
        },
        {
          target: '.toggleDrawer',
          content: (
            <div>
              <h3>Goals Page</h3>
              <p>
                Here you are able to set person finance goals, track your progress and save money daily
              </p>
            </div>
          ),
          disableBeacon: true
        },
        {
          target: '.toggleDrawer',
          content: (
            <div>
              <h3>Budget/Transfer Page</h3>
              <p>
                Here is where you go with your income, this page will distribute your income across your categories.
              </p>
            </div>
          ),
          disableBeacon: true
        },
      ]);
    } else {
      // Desktop steps
      setSteps([
        {
          target: 'body',
          floaterProps: {
            hideArrow: true
          },
          placement:'center',
          content: (
            <div>
              <h3>Welcome To McNut Budgeting</h3>
              <p>
                Lets Start The Tour To Get You Familiar
              </p>
            </div>
          ),
          disableBeacon: true,
        },
        {
          target: '.categoryFab',
          content: (
            <div>
              <h3>Add Category</h3>
              <p>
                This action button is used for adding a category, needed for adding transactions.
              </p>
            </div>
          ),
          disableBeacon: true
        },
        {
          target: '.transactionFab',
          content: (
            <div>
              <h3>Add Transaction</h3>
              <p>
                This action button is used for adding a transaction, you can specify Date, Amount, Description and Category.
              </p>
            </div>
          ),
          disableBeacon: true
        },
        {
          target: '.transactions',
          content: (
            <div>
              <h3>Transactions Page</h3>
              <p>
                This section will show you all the specifics about your categories, including statistics, spending habits etc.
              </p>
            </div>
          ),
          disableBeacon: true
        },
        {
          target: '.owed',
          content: (
            <div>
              <h3>Money Owed Page</h3>
              <p>
                Here you can log items that are owed to you, they are automatically negated from your balance to accurately represent your current balance
              </p>
            </div>
          ),
          disableBeacon: true
        },
        {
          target: '.goals',
          content: (
            <div>
              <h3>Goals Page</h3>
              <p>
                Here you are able to set person finance goals, track your progress and save money daily
              </p>
            </div>
          ),
          disableBeacon: true
        },
        {
          target: '.budget',
          content: (
            <div>
              <h3>Budget/Transfer Page</h3>
              <p>
                Here is where you go with your income, this page will distribute your income across your categories.
              </p>
            </div>
          ),
          disableBeacon: true
        },
      ]);
    }
  }, []);



  const handleNext = () => {
    setStepIndex((prevStepIndex) => prevStepIndex + 1);
  };

  


  const navigate = useNavigate()

  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      checkIsLoggedIn().then((result) => {
        if (!result) {
            navigate('/login')
        }
      })
    }
  };

  React.useLayoutEffect(() => {
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  });

  React.useEffect(() => {
    if (user.fName === "") {
      setUpdateUser(true);
    }
    if (categories.length === 0) {
        setUpdateCategories(true);
    }
    if (balances.length === 0) {
        setUpdateBalances(true);
    }
    if (transactions.length === 0) {
        setUpdateTransactions(true);
    }
    if (owedItems.length === 0) {
        setUpdateOwedItems(true);
    }
    if (goalItems.length === 0) {
        setUpdateGoalItems(true);
    }
    if (flagItems.length === 0) {
        setUpdateFlags(true)
    }
    if (recurringTransactions.length === 0) {
        setUpdateRecTransactions(true)
    }
    fetchTutorialState().then((hadTutorial) => {
        setHadTutorial(hadTutorial)
    })
  }, []);


  React.useEffect(() => {
    setTempBalances(balances)
  },[balances])


  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',]
  const oneDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  const dayOfWeek = today.getDay() || 7; // getDay returns 0 for Sunday, so we use 7 instead
  const startOfWeek = new Date(today.getTime() - (dayOfWeek - 1) * oneDay);
  const startOfLastWeek = new Date(startOfWeek.getTime() - 7 * oneDay);



  const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };


  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.Amount < 0 &&
      transaction.Tracked
  );

  const filteredDepositTransactions = transactions.filter(
    (transaction) =>
      transaction.Amount > 0 &&
      transaction.Tracked
  );

  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const year = transaction.Date.getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(transaction);
    return acc;
  }, {} as Record<number, TransactionItem[]>);

  const groupedDepositTransactions = filteredDepositTransactions.reduce((acc, transaction) => {
    const year = transaction.Date.getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(transaction);
    return acc;
  }, {} as Record<number, TransactionItem[]>);
  

  const groupedWeekTransactions = filteredTransactions.reduce((acc, transaction) => {
    if (transaction.Date >= startOfWeek) {
      if (!acc['This Week']) acc['This Week'] = [];
      acc['This Week'].push(transaction);
    } else if (transaction.Date >= startOfLastWeek) {
      if (!acc['Last Week']) acc['Last Week'] = [];
      acc['Last Week'].push(transaction);
    }
    return acc;
  }, {} as Record<string, TransactionItem[]>);


  const sortedFilteredBalances = filteredBalances.slice().sort((a, b) => a.Amount - b.Amount);
    const filteredPieChartData = {
      series: [
        {
          data: sortedFilteredBalances.sort((a, b) => a.Amount - b.Amount).map((balance) => ({
            id: balance.Category,
            value: balance.Amount,
            color: balance.Colour,
            label: balance.Category
          })),
          innerRadius: 75,
          outerRadius: 125,
          paddingAngle: 5,
          cornerRadius: 5,
          startAngle: -180,
          endAngle: 180,
        },],
      };

      const monthlySpendingSums = Object.entries(groupedTransactions).map(([year, transactions]) => {
        const sums = transactions.reduce((acc, transaction) => {
            const month = transaction.Date.getMonth();
            acc[month] += Number(transaction.Amount);
            return acc;
        }, Array.from({ length: 12 }, () => 0));
        return { year, sums: sums.map((sum) => Math.abs(Number(sum.toFixed(2)))) };
    });
    

    const monthlyEarningSums = Object.entries(groupedDepositTransactions).map(([year, transactions]) => {
      const sums = transactions.reduce((acc, transaction) => {
        const month = transaction.Date.getMonth();
        acc[month] += Number(transaction.Amount);
        return acc;
      }, Array.from({ length: 12 }, () => 0));
      return { year, sums: sums.map((sum) => Math.abs(Number(sum.toFixed(2)))) };
    });


    const weeklySums = Object.entries(groupedWeekTransactions).map(([week, transactions]) => {
      const sums = transactions.reduce((acc, transaction) => {
        const category = transaction.Category;
        if (!acc[category]) acc[category] = 0;
        acc[category] += transaction.Amount;
        return acc;
      }, {} as Record<string, number>);
      const orderedSums: { categoryName: string; sum: number }[] = [];
      categories.forEach((category) => {
        if (sums[category.categoryName]) {
          orderedSums.push({
            categoryName: category.categoryName,
            sum: Math.abs(Number(sums[category.categoryName].toFixed(2))),
          });
        } else {
          orderedSums.push({ categoryName: category.categoryName, sum: 0 });
        }
      });
      return { week, sums: orderedSums };
    });
    
    
  
    const barSeries = weeklySums.map(({ week, sums }) => ({
      data: sums.map((sum) => sum.sum),
      label: week
    }));

    
    const spendingLineSeries = monthlySpendingSums.map(({ year, sums }) => ({
      data: sums,
      label: year
    }));

    const earningLineSeries = monthlyEarningSums.map(({ year, sums }) => ({
      data: sums,
      label: year
    }));
    

    const totalBalance = tempBalances.reduce(
      (sum, balance) => sum + balance.Amount,
      0
    );

    const handleDeleteBalance = async (id: Number) => {
      try {
        const authToken = Cookies.get("authToken");
        const data = {
          "balanceId": id,
        };
    
        const response = await axios.request({
          method: 'delete',
          url: `${rootUrl}/api/customBalances`,
          headers: { Authorization: `Bearer ${authToken}` },
          data: data
        });
    
        if (response.status === 200) {
          setUpdateBalances(true);
        }
      } catch (error) {
        // handle error
      }
    };


    
    function renderRowOwed(props: ListChildComponentProps) {
      const { index, style } = props;
      const item = owedItems.filter((owedItem) => owedItem.Payed === false)[index];
    
      return (
        <ListItem style={style} key={item?.ID} sx={{ display: 'flex' }}
        >
            <ListItemText primary={item?.Description} secondary={item?.Category} />
            <Box sx={{ flexGrow: 1 }} />
            <Typography align="right" variant="body2">
              ${item?.Amount}
            </Typography>
        </ListItem>
      );
    }

    function renderTransactionRow(props: ListChildComponentProps) {
      const { index, style } = props;
      const transaction = transactions[index];
      const transactionFlagIds = transaction?.Flags?.split(',');
      const transactionFlags = transactionFlagIds?.map((id) =>
        flagItems.find((flag) => flag.flagId === Number(id))
      );
          
      let runningTotal = totalBalance;
      for (let i = 0; i < index; i++) {
        runningTotal -= transactions[i]?.Amount || 0;
      }

      return (
        <ListItem style={style} key={index} sx={{ display: "flex" }}>
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
          <Box sx={{ flexGrow: 1 }} />
          <Typography align="right" variant="body2">
          ${transaction?.Amount}
          <Typography component="div" variant="caption" sx={{ color: 'text.secondary' }}>
            ${runningTotal.toFixed(2)}
          </Typography>
          </Typography>
        </ListItem>
      );
    }

    function renderRecRow(props: ListChildComponentProps) {
      const { index, style } = props;
      recurringTransactions.sort((a, b) => {
        const remainingDaysA = calculateRemainingDays(a.Date, a.Frequency);
        const remainingDaysB = calculateRemainingDays(b.Date, b.Frequency);
        return remainingDaysA - remainingDaysB;
      });      
      const recTransaction = recurringTransactions[index];
    
      return (
        <ListItem style={style} key={index} sx={{ display: "flex" }}>
          <ListItemText
            primary={recTransaction?.Description}
            secondary={
              calculateRemainingDays(recTransaction.Date, recTransaction.Frequency) === 0
                ? "Due Later Today"
                : calculateRemainingDays(recTransaction.Date, recTransaction.Frequency) < 0
                ? `Due ${Math.abs(calculateRemainingDays(recTransaction.Date, recTransaction.Frequency))} Days Ago`
                : `${calculateRemainingDays(recTransaction.Date, recTransaction.Frequency)} Day(s) Remaining`
            }
          />

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
      return endDate.diff(today, 'day')+1;
    }
    const handleDragEnd = async (result: DropResult) => {
      if (!result.destination) {
        return;
      }
    
      const items = Array.from(tempBalances);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
    
      // Update the sortId of each item according to its new position
      const updatedItems = items.map((item, index) => ({
        ...item,
        sortId: index  // Assuming sortId starts from 0
      }));
      setTempBalances(updatedItems)
      // Find the items that have changed
      const changedItems = updatedItems.filter((item, index) => item.sortId !== tempBalances[index].SortId);
    
      for (const item of changedItems) {
        try {
          const authToken = Cookies.get("authToken");
          const data = {
            "categoryName": item.Category,
            "sortId": item.sortId,
          };
      
          const response = await axios.patch(`${rootUrl}/api/reorder`, data, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (response.status === 200) {
    
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
      }
      setPostMsg("Successfully Updated Order");
      setUpdateCategories(true);
      setUpdateBalances(true);    
    };
    
    


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
            handleOpen={handleOpen}
            handleClose={handleClose}
            open={open}
            inputCategory={''}
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
      <AddBalanceModal 
          categories={categories}
          setUpdateBalances={setUpdateBalances} 
          setOpenAlert={setOpenAlert}
          setPostMsg={setPostMsg}
          open = {openBalance}
          handleOpenCategory={handleOpenBalance}
          handleCloseCategory={handleCloseBalance}
      />
        <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
          {postMsg}
        </Alert>
        </Snackbar>
        {categories.length === 0 && balances.length === 0 ? (
          // Display a message if there are no transactions
          <Box>
            <Typography variant='h4'>
              No Balances Avaliable
            </Typography><br/>
            <Typography>
              Use the action buttons at the bottom of the page to get started
            </Typography>
          </Box>
        ) : (
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 8, md: 12, lg: 16, xl: 20 }}>
          <Grid xs={2} sm={8} md={12} lg={16} xl={20}>
            <Card elevation={12} sx={{width:'100%', display:'flex', position:'relative', flexDirection: 'column'}}>
              <CardContent sx={{bgcolor: theme.palette.info.main}}>
              <Grid container direction="column" width='100%'>
                  <Grid>
                  <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                    Welcome Back {user.fName}
                  </Typography>
                  <Typography variant="h6">
                    Total Balance <b style={{color: 'blue'}}>${totalBalance.toFixed(2)}</b>
                  </Typography>
                  {customBalances.map((balance, index) => (
                    <div key={index}>
                      <Typography variant="h6">
                        {balance.Balance} <b style={{color: 'green'}}>${balance.Total}</b>
                        <Tooltip title="Delete Balance">
                        <IconButton onClick={() => handleDeleteBalance(balance.balanceId)}>
                          <DeleteIcon />
                        </IconButton></Tooltip>
                      </Typography>

                    </div>
                  ))}
                  <Tooltip title="Add Balance">
                  <IconButton aria-label="add balance" sx={{bgcolor: theme.palette.primary.main, color: theme.palette.text.primary }} style={{ border: '1px solid', borderBlockColor: theme.palette.text.primary, backgroundColor: theme.palette.primary.main }} onClick={() => handleOpenBalance()}>
                    <AddIcon />
                  </IconButton>
                  </Tooltip>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Masonry columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }} spacing={0}>
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
            <Card elevation={4} >
              <CardContent sx={{bgcolor: theme.palette.info.main}}>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="balances">
                  {(provided) => (
                    <List sx={{width:'100%'}} {...provided.droppableProps} ref={provided.innerRef}>
                      {tempBalances.map((balance, index) => (
                        <Draggable key={balance.Category} draggableId={balance.Category} index={index}>
                          {(provided) => (
                            <Box 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{border: '4px solid ' + balance.Colour + '40', borderRadius: '10px', padding: '5px', backgroundColor: balance.Colour + '40', marginBottom:'5px'}}
                              onClick={(event) => {
                                event.preventDefault();
                                // Check if the target is not the checkbox
                                if ((event.target as HTMLInputElement).type !== 'checkbox') {
                                  navigate(`/transactions?category=${balance.Category}`)
                                }
                              }}
                            >
                              <ListItem>
                                <div {...provided.dragHandleProps}>
                                  <DragHandle />
                                </div>
                                <Checkbox
                                  color='primary'
                                  checked={filteredBalances.map((balance) => balance.Category).includes(balance.Category)}
                                  onChange={async (event) => {
                                    try {
                                      const authToken = Cookies.get("authToken");
                                      const data = {
                                        "action": event.target.checked ? 'add' : 'remove',
                                        "categoryName": balance.Category
                                      };
                                      const response = await axios.patch(`${rootUrl}/api/filteredCategories`, data, {
                                        headers: { Authorization: `Bearer ${authToken}` },
                                      });
                                      if (response.status === 200) {
                                        setUpdateBalances(true);
                                      }
                                    } catch(error) {
                                      
                                    }
                                  }}
                                />
                                <ListItemText primary={balance.Category.toUpperCase()}/>
                                <Box sx={{ flexGrow: 1 }} />
                                <Typography align="right" variant="body2">
                                  {<b>${balance?.Amount}</b>}
                                </Typography>
                              </ListItem>
                            </Box>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>


              </CardContent>
            </Card>
          </Grid>

          {categories.length > 1 ? (
            <>
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
              <Card elevation={4} sx={{height:400}} >
                <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
                  <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                    Filtered Balances Distribution
                  </Typography>
                  <AutoSizer>
                      {({height, width}) => (
                  <PieChart 
                    series={filteredPieChartData.series} 
                    height={height} 
                    width={width} 
                    />)}
                  </AutoSizer>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={2} md={6} lg={8} xl={6}> 
            <Card elevation={4} sx={{height:400}}>
            <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
                <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                All Transactions
                </Typography>
                <AutoSizer style={{marginTop: 30}}>
                  {({height, width}) => (
                      <FixedSizeList
                        width={width}
                        height={height}
                        itemSize={75}
                        itemCount={transactions.length}
                        overscanCount={5}
                      >
                      {renderTransactionRow}
                    </FixedSizeList>
                    )}
                </AutoSizer>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
                <Card elevation={4} sx={{ height: 300 }}>
                  <CardContent sx={{ height: "100%", bgcolor: theme.palette.info.main }}>
                  <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                    Upcoming Payments
                  </Typography>
                    <AutoSizer>
                      {({ height, width }) => (
                        <FixedSizeList
                          width={width}
                          height={height-30}
                          itemSize={75}
                          itemCount={recurringTransactions.length}
                          overscanCount={5}
                          style={{marginTop:30}}
                        >
                          {renderRecRow}
                        </FixedSizeList>
                      )}
                    </AutoSizer>
                  </CardContent>
                </Card>
              </Grid>
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
            <Card elevation={4} sx={{height:300}}>
              <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
                <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                   Money Owed Summary
                </Typography>
                <AutoSizer>
                      {({ height, width }) => (
                        <FixedSizeList
                          width={width}
                          height={height - 30}
                          itemSize={75}
                          itemCount={owedItems.filter((owedItem) => owedItem.Payed === false).length}
                          overscanCount={5}
                          style={{marginTop:30}}
                        >
                          {renderRowOwed}
                        </FixedSizeList>
                      )}
                    </AutoSizer>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
          <Card elevation={4} sx={{height:400}} >
                    <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
              <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                Weekly Spending Comparison
              </Typography>
              <AutoSizer>
                      {({height, width}) => (
              <BarChart width={width} height={height-30} series={barSeries} 
                xAxis={[
                  {
                    data: categories.map((category) => category.categoryName.slice(0, 5)),
                    scaleType: 'band',
                    position: 'bottom',
                    label: 'Category',
                  },
                ]}
              />)}
              </AutoSizer>
            </CardContent>
          </Card>
          </Grid>
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
                <Card elevation={4} sx={{height:400}} >
                    <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
                  <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                    Monthly Spending
                  </Typography>
                  <AutoSizer>
                      {({height, width}) => (
                      <LineChart
                        series={spendingLineSeries}
                        height={height-20}
                        width={width}
                        xAxis={[{
                          data: months,
                          scaleType: 'band',

                        }]}
                   ></LineChart> )}
                   </AutoSizer>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
                <Card elevation={4} sx={{height:400}} >
                    <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
                  <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                    Monthly Earning
                  </Typography>
                  <AutoSizer>
                      {({height, width}) => (
                      <LineChart
                        series={earningLineSeries}
                        height={height-20}
                        width={width}
                        xAxis={[{
                          data: months,
                          scaleType: 'band',

                        }]}
                   ></LineChart> )}
                   </AutoSizer>
              </CardContent>
            </Card>
          </Grid></> ) : (
            <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
            <Card elevation={4} sx={{height:400}} >
                  <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
                <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                  Balances Distribution
                </Typography>
            </CardContent>
            </Card>
            </Grid>
          )}
          </Masonry>
        </Grid>
        )}{!hadTutorial || count < 4? (
          <Joyride
              stepIndex={stepIndex}
              callback={(data: CallBackProps) => {
                const { status, action, type } = data;
                if (status === STATUS.FINISHED) {
                  console.log("Ended")
                  setUpdateCount(true)
                } else if (type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT) {
                  handleNext();
                } else if (status === STATUS.SKIPPED) {
                  updateTutorialState()
                }
              }}
              continuous
              hideCloseButton
              hideBackButton
              run={!hadTutorial}
              scrollToFirstStep
              showProgress
              showSkipButton
              steps={steps}
              styles={{
                options: {
                  zIndex: 99999999,
                },
              }}
            /> 
        ): (<></>)}
      </Box>
    );    
};



export default Dashboard;