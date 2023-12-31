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
import { Alert, Button, FormControl, InputLabel, List, ListItem, ListItemText, MenuItem, OutlinedInput, Select, SelectChangeEvent, Snackbar, Switch, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import axios, { AxiosError } from 'axios';
import checkIsLoggedIn from '../auth/auth';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import Joyride, { ACTIONS, CallBackProps, EVENTS, STATUS, Step } from 'react-joyride';


interface EnteredValues {
  [category: string]: number;
}

export const Budget = () => {
  const { categories, balances, transactions, owedItems, user, setUpdateValues, setUpdateCategories, setUpdateBalances, setUpdateTransactions, count, setUpdateCount  } = React.useContext(DatabaseInformationContext);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [postMsg, setPostMsg] = React.useState('')
  const [toCategory, setToCategory] = React.useState('')
  const [fromCategory, setFromCategory] = React.useState('')
  const [enteredValues, setEnteredValues] = React.useState<EnteredValues>({});
  const [income, setIncome] = React.useState(0)
  const [transferAmount, setTransferAmount] = React.useState(0)
  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""
  const [distributeByPercentage, setDistributeByPercentage] = React.useState(false);


  
  const [hadTutorial, setHadTutorial] = React.useState(true);

  interface TutorialResponse {
    hadTutorial: boolean;
  }
  
  const [stepIndex, setStepIndex] = React.useState(0);


  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h3>Welcome to The Budget/Transfer Page</h3>
          <p>
            Input your income and distribute your funds across your categories, Or transfer money between your categories
          </p>
        </div>
      ),
      disableBeacon: true,
    },
  ];

  const fetchTutorialState = async () => {
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
  };
  
  const updateTutorialState = async () => {
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
    }
  };  

  const handleNext = () => {
    setStepIndex((prevStepIndex) => prevStepIndex + 1);
  };

  React.useEffect(() => {
    console.log(count)
    if (count >= 4 && !hadTutorial) {
      updateTutorialState()
    }
  }, [count]);


  const theme = useTheme();

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
    fetchTutorialState().then((hadTutorial) => {
      setHadTutorial(hadTutorial)
    })
  }, []);



  React.useEffect(() => {
    // Convert enteredValues from value to percentage or vice versa
    const convertedValues = Object.fromEntries(
      Object.entries(enteredValues).map(([category, value]) => {
        const balance = balances.find((balance) => balance.Category === category)?.Amount || 0;
        if (distributeByPercentage) {
          // Convert from value to percentage
          return [category, Number(((value / income) * 100).toFixed(2))];
        } else {
          // Convert from percentage to value
          return [category, Number(((value / 100) * income).toFixed(2))];
        }
      })
    );
  
    setEnteredValues(convertedValues);
  }, [distributeByPercentage]);
  
  
    
  
  const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };
  const sum = Number(Object.values(enteredValues).reduce((acc, value) => acc + value, 0).toFixed(2));


  const handleDistributeBudget = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsLoading(true);
    if ((distributeByPercentage && sum === 100) || (!distributeByPercentage && sum === income)) {
      try {
        for (const category in enteredValues) {
          const value = distributeByPercentage ? (enteredValues[category] / 100 * income) : enteredValues[category];
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
    setIsLoading(false);
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
        {isLoading ? (
            <CircularProgress sx={{zIndex:9999999999999999999}} />
          ) : categories.length === 0 && balances.length === 0 ? (
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
              <CardContent sx={{bgcolor: theme.palette.info.main}}>
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
                      color: ((distributeByPercentage && sum === 100) || (!distributeByPercentage && sum === income)) ? 'green' : 'red',
                    }}
                  >
                    {distributeByPercentage ? `${sum.toFixed(2)}%` : `${(sum / income * 100).toFixed(2)}%`}
                  </span>
                </Typography>

                  <Typography variant="body1">
                    <span>Distribute by: </span>
                    <span
                      style={{
                        fontWeight: 'bold',
                      }}
                    >
                      {distributeByPercentage ? 'Percentage' : 'Value'}
                    </span>
                    <Switch
                      checked={distributeByPercentage}
                      onChange={(event) => setDistributeByPercentage(event.target.checked)}
                    />
                  </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Masonry columns={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2 }} spacing={0}>
          <Grid xs={2} sm={4} md={6} lg={8} xl={10}>
            <Card elevation={4} >
              <CardContent sx={{bgcolor: theme.palette.info.main}}>
              <List sx={{width:'100%'}}>
                {balances.map((balance) => (
                  <Box sx={{border: '4px solid ' + balance.Colour + '40', borderRadius: '10px', padding: '5px', backgroundColor: balance.Colour + '40', marginBottom:'5px'}}>
                    <ListItem>                      
                      <ListItemText
                        primary={balance.Category.toUpperCase()}
                        secondary={`${balance.Amount} (${distributeByPercentage ? (balance.Amount + (enteredValues[balance.Category] || 0) / 100 * income).toFixed(2) : (balance.Amount + (isNaN(enteredValues[balance.Category]) ? 0 : +enteredValues[balance.Category])).toFixed(2)})`}
                      />
                      <Box sx={{ flexGrow: 1 }} />
                      <FormControl sx={{width:100}}>
                        <InputLabel htmlFor="outlined-adornment-fName">{balance.Category}</InputLabel>
                        <OutlinedInput
                          id="outlined-adornment-lNmae"
                          label={balance.Category}
                          type="number"
                          value={enteredValues[balance.Category] || ''} // Use the value from the state
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
              <CardContent sx={{display:'flex', flexDirection:'column', bgcolor: theme.palette.info.main}}>
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
        )}{!hadTutorial || count < 4? (
          <Joyride
              stepIndex={stepIndex}
              callback={(data: CallBackProps) => {
                const { status, action, type, index } = data;
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


export default Budget;
