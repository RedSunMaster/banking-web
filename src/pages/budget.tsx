import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
import CardContent from '@mui/material/CardContent';
import Cookies from 'js-cookie';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import 'react-virtualized/styles.css'; // only needs to be imported once
import Masonry from '@mui/lab/Masonry';
import { DatabaseInformationContext } from '../utils/DatabaseInformation';
import { Alert, Button, FormControl, InputLabel, List, ListItem, ListItemText, MenuItem, OutlinedInput, Select, SelectChangeEvent, Snackbar } from '@mui/material';
import dayjs from 'dayjs';
import axios, { AxiosError } from 'axios';
import { ca } from 'date-fns/locale';
import checkIsLoggedIn from '../auth/auth';
import { useNavigate } from 'react-router-dom';


interface EnteredValues {
  [category: string]: number;
}

export const Budget = () => {
  const { categories, balances, transactions, owedItems, user, setUpdateValues, setUpdateCategories, setUpdateBalances, setUpdateTransactions, setUpdateOwedItems, setUpdateUser } = React.useContext(DatabaseInformationContext);
  const [openAlert, setOpenAlert] = React.useState(false);
  
  const [postMsg, setPostMsg] = React.useState('')
  const [toCategory, setToCategory] = React.useState('')
  const [fromCategory, setFromCategory] = React.useState('')
  const [enteredValues, setEnteredValues] = React.useState<EnteredValues>({});
  const [income, setIncome] = React.useState(0)
  const [transferAmount, setTransferAmount] = React.useState(0)
  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""

  const onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, category: string) => {
    setEnteredValues((prevValues) => ({
      ...prevValues,
      [category]: Number(event.target.value),
    }));
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
  }, []);

  React.useEffect(() => {
    checkIsLoggedIn().then((result) => {
      if (!result) {
          navigate('/login')
      }
    })
    if (categories.length === 0) {
        setUpdateCategories(true);
    }
    if (balances.length === 0) {
        setUpdateBalances(true);
    }
  }, []);




    
  
  const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };
  const sum = Object.values(enteredValues).reduce((acc, value) => acc + value, 0);


  const handleDistributeBudget = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (sum === income && sum !== 0 && income !== 0) {
      try {
        for (const category in enteredValues) {
          const value = enteredValues[category];
          if (value != 0) {
            const authToken = Cookies.get("authToken");
            const date = dayjs(new Date()).format("YYYY-MM-DD").toString();
            const data = {
              "category": category,
              "date": date,
              "description": "Income",
              "amount": value,
              "trans_type": "Deposit",
            };
        
            const response = await axios.post(`${rootUrl}/api/transactions`, data, {
              headers: { Authorization: `Bearer ${authToken}` },
            });
            if (response.status === 200) {
              setPostMsg("Successfully Distributed Income");
              setUpdateTransactions(true);
              setUpdateBalances(true);
            } else {
              setPostMsg("Error" + response.data);
            }
          }
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          // Handle Axios error
          const responseData = error.response?.data;
          setPostMsg("Error: " + responseData)
        } else {
        }
      }
      setOpenAlert(true);
    } else {
      setPostMsg("Error: " + "Have not reached full allocation");
      setOpenAlert(true);
    }
  };


  const handleTransfer = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
        if (transferAmount != 0) {
          const authToken = Cookies.get("authToken");
          const date = dayjs(new Date()).format("YYYY-MM-DD").toString();
          const toData = {
            "category": toCategory,
            "date": date,
            "description": `Trans - ${fromCategory}`,
            "amount": transferAmount,
            "trans_type": "Deposit",
          };
      
          const toResponse = await axios.post(`${rootUrl}/api/transactions`, toData, {
            headers: { Authorization: `Bearer ${authToken}` },
          });

          const fromData = {
            "category": fromCategory,
            "date": date,
            "description": `Trans - ${toCategory}`,
            "amount": transferAmount*-1,
            "trans_type": "Deposit",
          };
      
          const fromResponse = await axios.post(`${rootUrl}/api/transactions`, fromData, {
            headers: { Authorization: `Bearer ${authToken}` },
          });

          if (toResponse.status === 200 && fromResponse.status === 200) {
            setPostMsg("Successfully Transfered");
            setUpdateTransactions(true);
            setUpdateBalances(true);
          }
        } else {
          setPostMsg("Error: must have amount to transfer");
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          // Handle Axios error
          const responseData = error.response?.data;
          setPostMsg("Error: " + responseData)
        } else {
        }
    }
    setOpenAlert(true);
  };
  

    return (
      <Box sx={{ flexGrow: 1 }}>
        <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
          {postMsg}
        </Alert>
        </Snackbar>
        {categories.length === 0 && balances.length === 0 ? (
          // Display a message if there are no transactions
          <Box>
            <Typography variant='h4'>
              Cannot Distribute
            </Typography><br/>
            <Typography>
              Go back to create a category / transaction
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
                    Distribute Budget
                  </Typography>
                  </Grid>
                  <Grid>
                  <FormControl sx={{width:200}}>
                      <InputLabel htmlFor="outlined-adornment-fName">Income</InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-lNmae"
                        label="Income"
                        type="number"
                        onChange={(event) => setIncome(Number(event.target.value))}
                      />

                      </FormControl>
                  </Grid>
                  <Grid>
                  <Typography variant="body1">
                    <span>Percentage Allocation: </span>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: sum === income && sum !== 0 ? 'green' : 'red',
                      }}
                    >
                      {(sum / income * 100).toFixed(2)}%
                    </span>
                  </Typography>

                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Masonry columns={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2 }} spacing={0}>
          <Grid xs={2} sm={4} md={6} lg={8} xl={10}>
            <Card elevation={4} >
              <CardContent>
              <List sx={{width:'100%'}}>
                {balances.map((balance) => (
                  <Box sx={{border: '4px solid ' + balance.Colour + '40', borderRadius: '10px', padding: '5px', backgroundColor: balance.Colour + '40', marginBottom:'5px'}}>
                  <ListItem>                      
                  <ListItemText
                      primary={balance.Category.toUpperCase()}
                      secondary={`${balance.Amount} (${(balance.Amount + (isNaN(enteredValues[balance.Category]) ? 0 : +enteredValues[balance.Category].toFixed(2))).toFixed(2)})`}
                    />

                      <Box sx={{ flexGrow: 1 }} />
                      <FormControl sx={{width:100}}>
                      <InputLabel htmlFor="outlined-adornment-fName">{balance.Category}</InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-lNmae"
                        label={balance.Category}
                        type="number"
                        onChange={(event) => onChange(event, balance.Category)}
                      />

                      </FormControl>
                    </ListItem>
                  </Box>
                ))}
              <Button variant="contained" fullWidth sx={{ marginTop: 1, height:50}} onClick={handleDistributeBudget}>Distribute Budget</Button>

              </List>

              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={4} md={6} lg={8} xl={10} >
            <Card elevation={4} >
              <CardContent sx={{display:'flex', flexDirection:'column'}}>
              <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-category">From</InputLabel>
              <Select
                label="From"
                className='select'
                value={fromCategory}
                onChange={(event: SelectChangeEvent<string>) => {setFromCategory(event.target.value as string)}}
                inputProps={{
                  name: 'fromCategory',
                  id: 'outlined-adornment-fromcategory',
                }}>
                {categories.map((category) => (
                  <MenuItem key={category.categoryId} value={category.categoryName}>
                    {category.categoryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth  sx={{ marginTop: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-category">To</InputLabel>
              <Select
                label="To"
                className='select'
                value={toCategory}
                onChange={(event: SelectChangeEvent<string>) => {setToCategory(event.target.value as string)}}
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
            <FormControl fullWidth sx={{marginTop: 1}}>
                      <InputLabel htmlFor="outlined-adornment-fName">Transfer Amount</InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-lNmae"
                        label="Transfer Amount"
                        type="number"
                        onChange={(event) => setTransferAmount(Number(event.target.value))}
                      />

                      </FormControl>
              <Button variant="contained"  fullWidth sx={{ marginTop: 1, height:50}} onClick={handleTransfer}>Transfer</Button>

              </CardContent>
            </Card>
          </Grid>
          </Masonry>
        </Grid>
        )}
      </Box>
    );    
};


export default Budget;
