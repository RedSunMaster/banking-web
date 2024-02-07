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
import { Alert, Autocomplete, Button, FormControl, InputLabel, List, ListItem, ListItemText, MenuItem, OutlinedInput, Select, SelectChangeEvent, Snackbar, Switch, TextField, useTheme } from '@mui/material';
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
  const { categories, balances, setUpdateCategories, setUpdateBalances, setUpdateTransactions, count, setUpdateCount  } = React.useContext(DatabaseInformationContext);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);


  const [postMsg, setPostMsg] = React.useState('')
  const [toCategory, setToCategory] = React.useState('')
  const [fromCategory, setFromCategory] = React.useState('')
  const [income, setIncome] = React.useState(() => {
    const cachedIncome = localStorage.getItem('cachedIncome');
    return cachedIncome ? cachedIncome : '0'; // Store as a string
  });
  
  const [enteredValues, setEnteredValues] = React.useState<EnteredValues>(localStorage.getItem('cachedEnteredValues')? JSON.parse(localStorage.getItem('cachedEnteredValues')!!) : {});
  const [transferAmount, setTransferAmount] = React.useState(0)
  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""
  const [distributeByPercentage, setDistributeByPercentage] = React.useState(false)
  
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
  
  const navigate = useNavigate()

  const updateTutorialState = React.useCallback(async () => {
    try {
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
  }, [setHadTutorial,fetchTutorialState, rootUrl]); // Include all dependencies that the function relies on
  
  const onVisibilityChange = React.useCallback(() => {
    if (document.visibilityState === "visible") {
      checkIsLoggedIn().then((result) => {
        if (!result) {
          navigate('/login');
        }
      });
    }
  }, [navigate]); // Include all dependencies that the function relies on
  


  React.useLayoutEffect(() => {
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [onVisibilityChange]);


  const handleNext = () => {
    setStepIndex((prevStepIndex) => prevStepIndex + 1);
  };

  React.useEffect(() => {
    console.log(count)
    if (count >= 4 && !hadTutorial) {
      updateTutorialState()
    }
  }, [count, hadTutorial, updateTutorialState]);


  const theme = useTheme();


  React.useEffect(() => {

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
      setEnteredValues(prevValues => {
        const convertedValues = Object.fromEntries(
          Object.entries(prevValues).map(([category, value]) => {
            if (distributeByPercentage) {
              // Convert from value to percentage
              return [category, Number(((value / Number(income)) * 100).toFixed(2))];
            } else {
              // Convert from percentage to value
              return [category, Number(((value / 100) * Number(income)).toFixed(2))];
            }
          })
        );
        return convertedValues;
      });
    }, [distributeByPercentage, income]);
    
    
  const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };
  const values = [1, 0.5, 0.25]; // 

  const handleDistributeBudget = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsLoading(true);
    if ((distributeByPercentage && Number(sum.toFixed(2)) === 100) || (!distributeByPercentage && Number(sum.toFixed(2)) === Number(income))) {
      try {
        for (const category in enteredValues) {
          const value = distributeByPercentage ? (enteredValues[category] / 100 * Number(income)) : enteredValues[category];
          if (value !== 0) {
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
              if (distributeByPercentage) {
                // Convert each value to percentage and multiply by 100 before storing
                const valuesAsPercentages = Object.fromEntries(
                  Object.entries(enteredValues).map(([category, value]) => {
                    return [category, Number(((value / 100) * Number(income)))];
                  })
                );
                localStorage.setItem('cachedEnteredValues', JSON.stringify(valuesAsPercentages));
              } else {
                localStorage.setItem('cachedEnteredValues', JSON.stringify(enteredValues));
              }
              
              const numericIncome = Number(income);
              // Don't forget to update the localStorage with the numeric value when necessary
              localStorage.setItem('cachedIncome', numericIncome.toString());              setUpdateTransactions(true);
              setUpdateTransactions(true)
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
      setPostMsg("Error: Have not reached full allocation");
      setOpenAlert(true);
    }
    setIsLoading(false);
  };
  


  const handleTransfer = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
        if (transferAmount !== 0) {
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


  const sum = Number(Object.values(enteredValues).reduce((acc, value) => acc + value, 0))
  let leftToAllocate = sum
  if (distributeByPercentage) {
    leftToAllocate = Number((100 - sum).toFixed(4))
  } else {
    leftToAllocate = Number(income) - sum;
  }
  

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
                      <Autocomplete
                        id="outlined-adornment-description"
                        options={[]}
                        freeSolo
                        value={income ? income : ''}
                        onInputChange={(event, newValue) => {
                          if (newValue !== null) {
                            setIncome(newValue)
                          }
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label={"Income"} variant="outlined" />
                        )}
                      />



                      </FormControl>
                  </Grid>
                  <Grid>
                  <Typography variant="body1">
                  <span>Percentage Allocation: </span>
                  <span
                    style={{
                      fontWeight: 'bold',
                      color: ((distributeByPercentage && Number(sum.toFixed(2)) === 100) || (!distributeByPercentage && Number(sum.toFixed(2)) === Number(income))) ? 'green' : 'red',
                    }}
                  >
                    {distributeByPercentage ? `${sum.toFixed(2)}%` : `${(sum / Number(income) * 100).toFixed(2)}%`}
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
                        secondary={`${balance.Amount} (${distributeByPercentage ? (balance.Amount + (enteredValues[balance.Category] || 0) / 100 * Number(income)).toFixed(2) : (balance.Amount + (isNaN(enteredValues[balance.Category]) ? 0 : +enteredValues[balance.Category])).toFixed(2)})`}
                      />
                      <Box sx={{ flexGrow: 1 }} />

                      <FormControl sx={{ width: 200 }} variant="outlined">
                        <Autocomplete
                          id="outlined-adornment-description"
                          options={values.map(value => leftToAllocate * value)}
                          freeSolo
                          value={enteredValues[balance.Category] ? enteredValues[balance.Category] : ''}
                          onInputChange={(event, newValue) => {
                            if (newValue !== null) {
                              setEnteredValues((prevValues) => ({
                                ...prevValues,
                                [balance.Category]: Number(Number(newValue).toFixed(2)),
                              }));
                            }
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label={balance.Category} variant="outlined" />
                          )}
                          renderOption={(props, option, state) => (
                            <li {...props}>{option.toFixed(2)}</li>
                          )}
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
            /> 
        ): (<></>)}
      </Box>
    );    
};


export default Budget;
