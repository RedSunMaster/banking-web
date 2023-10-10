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
import { Alert, Checkbox, IconButton, List, ListItem, ListItemText, Snackbar } from '@mui/material';
import { AutoSizer } from 'react-virtualized';
import { useNavigate } from 'react-router-dom';
import checkIsLoggedIn from '../auth/auth';
import { AddCategoryModal } from '../components/addCategoryModal';
import AddTransactionModal from '../components/addTransactionModal';
import axios from 'axios';
import Cookies from 'js-cookie';
import AddIcon from '@mui/icons-material/Add';
import AddBalanceModal from '../components/addBalanceModal';
import DeleteIcon from '@mui/icons-material/Delete';



export const Dashboard = () => {
  const { categories, balances, filteredBalances, customBalances, transactions, owedItems, user, setUpdateValues, setUpdateCategories, setUpdateBalances, setUpdateTransactions, setUpdateOwedItems, setUpdateUser } = React.useContext(DatabaseInformationContext);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [postMsg, setPostMsg] = React.useState('')
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [openBalance, setOpenBalance] = React.useState(false);
  const handleOpenBalance = () => setOpenBalance(true);
  const handleCloseBalance = () => setOpenBalance(false);
  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""
  const [addCustomBalance, setAddCustomBalance] = React.useState(false);

  
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
  }, []);

  React.useEffect(() => {
    checkIsLoggedIn().then((result) => {
      if (!result) {
          navigate('/login')
      }
    })
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
  }, []);


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
      !transaction.Description.includes("Balance") &&
      !transaction.Description.includes("Trans")
  );

  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
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

    const monthlySums = Object.entries(groupedTransactions).map(([year, transactions]) => {
      const sums = transactions.reduce((acc, transaction) => {
        const month = transaction.Date.getMonth();
        acc[month] += transaction.Amount;
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

    
    const lineSeries = monthlySums.map(({ year, sums }) => ({
      data: sums,
      label: year
    }));
    

    const totalBalance = balances.reduce(
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
    

    return (
      <Box sx={{ flexGrow: 1 }}>
        <AddTransactionModal 
            categories={categories}
            setUpdateTransactions={setUpdateTransactions} 
            setUpdateBalances={setUpdateBalances} 
            setOpenAlert={setOpenAlert}
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
              <CardContent>
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
                        <IconButton onClick={() => handleDeleteBalance(balance.balanceId)}>
                          <DeleteIcon />
                        </IconButton>
                      </Typography>

                    </div>
                  ))}
                  <IconButton color="primary" aria-label="add balance" style={{ border: '1px solid black' }} onClick={() => handleOpenBalance()}>
                    <AddIcon />
                  </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Masonry columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }} spacing={0}>
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
            <Card elevation={4} >
              <CardContent>
              <List sx={{width:'100%'}}>
                {balances.map((balance) => (
                  <Box 
                    sx={{border: '4px solid ' + balance.Colour + '40', borderRadius: '10px', padding: '5px', backgroundColor: balance.Colour + '40', marginBottom:'5px'}}
                    onClick={(event) => {
                      // Check if the target is not the checkbox
                      if ((event.target as HTMLInputElement).type !== 'checkbox') {
                        navigate(`/transactions?category=${balance.Category}`)
                      }
                    }}
                  >
                    <ListItem>
                      <Checkbox
                        checked={filteredBalances.map((balance) => balance.Category).includes(balance.Category)}
                        onChange={async (event) => {
                          try {
                            const authToken = Cookies.get("authToken");
                            console.log(event.target.checked)
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
                ))}
              </List>


              </CardContent>
            </Card>
          </Grid>

          {categories.length > 1 ? (
            <>
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
              <Card elevation={4} sx={{height:400}} >
                    <CardContent sx={{height:'100%'}}>
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
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
                <Card elevation={4} sx={{height:400}} >
                    <CardContent sx={{height:'100%'}}>
                  <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                    Monthly Spending
                  </Typography>
                  <AutoSizer>
                      {({height, width}) => (
                      <LineChart
                        series={lineSeries}
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
                    <CardContent sx={{height:'100%'}}>
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
          </Grid></> ) : (
            <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
            <Card elevation={4} sx={{height:400}} >
                  <CardContent sx={{height:'100%'}}>
                <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                  Balances Distribution
                </Typography>
            </CardContent>
            </Card>
            </Grid>
          )}
          </Masonry>
        </Grid>
        )}
      </Box>
    );    
};



export default Dashboard;