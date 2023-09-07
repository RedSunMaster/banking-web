import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
import CardContent from '@mui/material/CardContent';
import Cookies from 'js-cookie';
import { PieChart, LineChart, BarChart } from '@mui/x-charts';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import 'react-virtualized/styles.css'; // only needs to be imported once
import TransactionItem from '../types/Transaction';
import Masonry from '@mui/lab/Masonry';
import { DatabaseInformationContext } from '../utils/DatabaseInformation';
import { Alert, Button, Fab, Fade, FormControl, InputAdornment, InputLabel, List, ListItem, ListItemText, MenuItem, Modal, OutlinedInput, Select, SelectChangeEvent, Snackbar, Switch } from '@mui/material';
import { AutoSizer } from 'react-virtualized';
import { useNavigate } from 'react-router-dom';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { CirclePicker, SliderPicker, SwatchesPicker } from 'react-color';
import axios, { AxiosError } from 'axios';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
import checkIsLoggedIn from '../auth/auth';
import { Height } from '@mui/icons-material';



export const Dashboard = () => {
  const { categories, balances, transactions, owedItems, user, setUpdateValues, setUpdateCategories, setUpdateBalances, setUpdateTransactions, setUpdateOwedItems, setUpdateUser } = React.useContext(DatabaseInformationContext);
  const [open, setOpen] = React.useState(false);
  const [openCategory, setOpenCategory] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleOpenCategory = () => setOpenCategory(true);
  const handleCloseCategory = () => setOpenCategory(false);
  const handleClose = () => setOpen(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  
  const [category, setCategory] = React.useState('')
  const [postMsg, setPostMsg] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [amount, setAmount] = React.useState(0)
  const [trans_type, setTransaction] = React.useState('Withdraw')
  const [colour, setColour] = React.useState('')
  const [categoryName, setCategoryName] = React.useState('') 
  const [inputDate, setDate] = React.useState<Dayjs | null>(dayjs())

  
  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""

  
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

  const handleAddTransaction = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      let inputAmount = Math.abs(amount);
      if (trans_type === "Withdraw") {
        inputAmount = Math.abs(amount) * -1;
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
  
      const response = await axios.post(`${rootUrl}/api/transactions`, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200) {
        setPostMsg("Successfully Added Transaction");
        setOpen(false);
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
      } else {
        console.error(error)
      }
    }
    setOpenAlert(true);
  };

  const handleAddCategory = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const authToken = Cookies.get("authToken");
      const data = {
        "categoryName": categoryName,
        "colour": colour,
      };
      console.log("Request body:", data);
  
      const response = await axios.post(`${rootUrl}/api/categories`, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200) {
        setPostMsg("Successfully Added Category");
        setOpenCategory(false);
        setUpdateCategories(true);
        setUpdateBalances(true);
      } else {
        setPostMsg("Error" + response.data);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle Axios error
        const responseData = error.response?.data;
        setPostMsg("Error: " + responseData)
      } else {
        console.error(error)
      }
    }
    setOpenAlert(true);
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


  const sortedBalances = balances.slice().sort((a, b) => a.Amount - b.Amount);
  
  const pieChartData = {
    series: [
      {
        data: sortedBalances.sort((a, b) => a.Amount - b.Amount).map((balance) => ({
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
      <Fab
            color="primary"
            aria-label="add_category"
            size='large'
            onClick={handleOpenCategory}
            sx={{ position: 'fixed', bottom: 32, right: 96}}
          >
            <CategoryIcon />
      </Fab>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        disableScrollLock={ true }
        closeAfterTransition
      >
        <Fade in={open}>
          <Box className={'modal'}>
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
            {categories.map((category) => (
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
        <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            label="Amount"
            type="number"
            inputProps={{ min: 0 }}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (value >= 0) {
                setAmount(value);
              }
            }}
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
            open={openCategory}
            disableScrollLock={ true }
            onClose={handleCloseCategory}
            closeAfterTransition
            sx={{alignContent: 'center'}}
          >
            <Fade in={openCategory}>
              <Box className={'modal'}>
              <h2 className='pageTitle'>Add Category</h2>
              <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
              <InputLabel htmlFor="outlined-adornment-description">Category Name</InputLabel>
              <OutlinedInput
                id="outlined-adornment-description"
                label="Category Name"
                type='text'
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: 1, display: 'flex', justifyContent: 'center'}} variant="outlined">
              <div style={{margin:'auto', justifyContent:'center', height:200, width:'100%'}}>
                <AutoSizer>
                      {({height, width}) => (
                <SwatchesPicker width={width} height={height} color={colour} onChange={(color: { hex: React.SetStateAction<string>; }) => setColour(color.hex)} colors={
                  [['#f44336', '#f5564a', '#f6695e', '#f77b72', '#f88e86', '#faa19b'],
                  ['#e91e63', '#eb3573', '#ed4b82', '#f06292', '#f278a1', '#f48fb1'],
                  ['#9c27b0', '#a63db8', '#b052c0', '#ba68c8', '#c47dd0', '#ce93d8'],
                  ['#673ab7', '#764ebe', '#8561c5', '#9575cd', '#a489d4', '#b39ddb'],
                  ['#3f51b5', '#5262bc', '#6574c4', '#7985cb', '#8c97d3', '#9fa8da'],
                  ['#2196f3', '#37a1f4', '#4dabf5', '#64b6f7', '#7ac0f8', '#90cbf9'],
                  ['#03a9f4', '#1cb2f5', '#35baf6', '#4fc3f7', '#68cbf8', '#81d4fa'],
                  ['#00bcd4', '#1ac3d8', '#33c9dd', '#4dd0e1', '#66d7e5', '#80deea'],
                  ['#009688', '#1aa194', '#33aba0', '#4db6ac', '#66c0b8', '#80cbc4'],
                  ['#4caf50', '#5eb762', '#70bf73', '#82c785', '#94cf96', '#a6d7a8'],
                  ['#8bc34a', '#97c95c', '#a2cf6e', '#aed580', '#b9db92', '#c5e1a5'],
                  ['#cddc39', '#d2e04d', '#d7e361', '#dce774', '#e1ea88', '#e6ee9c'],
                  ['#ffeb3b', '#ffed4f', '#ffef62', '#fff176', '#fff389', '#fff59d'],
                  ['#ffc107', '#ffc720', '#ffcd39', '#ffd451', '#ffda6a', '#ffe083'],
                  ['#ff9800', '#ffa21a', '#ffad33', '#ffb74d', '#ffc166', '#ffcc80'],
                  ['#ff5722', '#ff6838', '#ff794e', '#ff8964', '#ff9a7a', '#ffab91'],
                  ['#795548', '#86665a', '#94776d', '#a1887f', '#af9991', '#bcaaa4']]} />
                      )}</AutoSizer>
              </div>
            </FormControl>

            <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleAddCategory}>Add</Button>
              </Box>
            </Fade>
      </Modal>
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
                    Total Balance <b style={{color: 'green'}}>${totalBalance.toFixed(2)}</b>
                  </Typography>
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
                  <Box sx={{border: '4px solid ' + balance.Colour + '40', borderRadius: '10px', padding: '5px', backgroundColor: balance.Colour + '40', marginBottom:'5px'}}>
                  <ListItem
                          onClick={(event: React.MouseEvent<HTMLLIElement>) =>
                            navigate(`/transactions?category=${balance.Category}`)
                          }
                        >                      
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
                    Balances Distribution
                  </Typography>
                  <AutoSizer>
                      {({height, width}) => (
                  <PieChart 
                    series={pieChartData.series} 
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