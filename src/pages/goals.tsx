import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
import CardContent from '@mui/material/CardContent';
import Cookies from 'js-cookie';
import { ScatterChart } from '@mui/x-charts';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import 'react-virtualized/styles.css'; // only needs to be imported once
import { DatabaseInformationContext } from '../utils/DatabaseInformation';
import { Button, IconButton, Alert, Snackbar, useTheme, CircularProgress } from '@mui/material';
import axios, { AxiosError } from 'axios';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized';
import Masonry from '@mui/lab/Masonry';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import checkIsLoggedIn from '../auth/auth';
import GoalItem from '../types/GoalItem';
import AddGoalItemModal from '../components/addGoalItemModal';
import Joyride, { ACTIONS, CallBackProps, EVENTS, STATUS, Step } from 'react-joyride';



export const Goals = () => {
    const { categories, user, transactions, goalItems, setUpdateUser, setUpdateCategories, setUpdateTransactions, setUpdateGoalItems, count, setUpdateCount } = React.useContext(DatabaseInformationContext);
    const [open, setOpen] = React.useState(false);
    const [edit, setEdit] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [openAlert, setOpenAlert] = React.useState(false);
    const [item, setItem] = React.useState<GoalItem | undefined>(undefined)
    const [postMsg, setPostMsg] = React.useState('')

    const [achievedItems, setAchievedItems] = React.useState<GoalItem[]>([])
    const [notAchievedItems, setNotAchievedItems] = React.useState<GoalItem[]>([])
    const [achievedTab, setAchievedTab] = React.useState(false)
    const theme = useTheme();
    const [stepIndex, setStepIndex] = React.useState(0);

  

    
    const [hadTutorial, setHadTutorial] = React.useState(true);

    interface TutorialResponse {
      hadTutorial: boolean;
    }
    


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


  
    const steps: Step[] = [
      {
        target: '.goalFab',
        content: (
          <div>
            <h3>Add A Goal</h3>
            <p>
              Create yourself a goal here, and track its progress.
            </p>
          </div>
        ),
        disableBeacon: true,
      },
    ];
  

    const handleNext = () => {
      setStepIndex((prevStepIndex) => prevStepIndex + 1);
    };
  

    React.useEffect(() => {
      console.log(count)
      if (count >= 4 && !hadTutorial) {
        updateTutorialState()
      }
    }, [count]);

    const handleGoalSuccess = async (id: number) => {
      try{
        const authToken = Cookies.get("authToken");
        const data = {
          "goal_id": id
        };
        const response = await axios.patch(`${rootUrl}/api/updateGoal`, data, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Successfully Updated Goal");
          handleClose();
          setUpdateGoalItems(true);
        } else {
          setPostMsg("Error" + response.statusText);
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

    }

    
    const handleSetItem = (item: GoalItem | undefined, callback: () => void) => {
      setItem(item);
      callback();
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
    if (goalItems.length === 0) {
      setUpdateGoalItems(true);
    }
    if (user.email === "") {
      setUpdateUser(true)
    }
    if (transactions.length === 0) {
      setUpdateTransactions(true)
    }
    fetchTutorialState().then((hadTutorial) => {
      setHadTutorial(hadTutorial)
    })
  }, []);




  React.useEffect(() => {
    const notAchievedItems = goalItems.filter((goalItem) => goalItem.achieved == false);
    setNotAchievedItems(notAchievedItems);
    setAchievedItems(goalItems.filter((goalItem) => goalItem.achieved == true));
  }, [goalItems, setUpdateGoalItems]);
  


    const handleCloseAlert = (_event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpenAlert(false);
    };



  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""

  const handleSwitchTab = () => {
    setAchievedTab(!achievedTab)
  }
      


    function renderAllRow(props: ListChildComponentProps) {
      const { index, style } = props;
      const item = achievedItems[achievedItems.length-1-index]; 
    
      return (
        <ListItem style={style} key={item?.goalId} sx={{ display: 'flex' }}
        secondaryAction={
          <IconButton edge="end" aria-label="achieved" onClick={() => handleGoalSuccess(item.goalId)}>
            <CloseIcon />
          </IconButton>
        }
        >
          <ListItemButton >
            <ListItemText primary={item?.goalName} secondary={item?.amount} />
            <Box sx={{ flexGrow: 1 }} />
            <Typography align="right" variant="body2">
              ${item?.amount}
            </Typography>
          </ListItemButton>
        </ListItem>
      );
    }




    function renderRow(props: ListChildComponentProps) {
      const { index, style } = props;
      const item = notAchievedItems[index];
    
      // Filter transactions by category
      const categoryTransactions = transactions.filter(transaction => transaction.Category === item.category);
      const savedMoney = categoryTransactions.filter(transaction => transaction.Description.includes(item.uniqueCode));
    
      const totalSavedMoney = savedMoney.reduce((total, transaction) => total + Math.abs(transaction.Amount), 0);
    
      let daysToGoal;
      let endDate;
      let dailySavings;
    
      // Get the current date
      const today = new Date();
      const remainingAmount = item.amount - totalSavedMoney;

      // If item.endDate is not null, calculate the amount it would take per day to reach the goal
      if (item.endDate != null) {
        const startDate = today > new Date(item.startDate) ? today : new Date(item.startDate);
        endDate = new Date(item.endDate);
        const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
        daysToGoal = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
        // Calculate daily savings based on remaining amount and days until endDate
        dailySavings = remainingAmount / daysToGoal;
      } else {
        // Estimate days to goal based on the total goal amount and the total saved money so far
        const startDate = today > new Date(item.startDate) ? today : new Date(item.startDate);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (item.amount/5)); // Set the end date to 60 days from the current date
        const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
        daysToGoal = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Calculate days to goal based on the current date
    
        // Calculate daily savings based on remaining amount and days to goal
        dailySavings = remainingAmount / daysToGoal;
      }
    
      const progress = Math.min((totalSavedMoney / item.amount) * 100, 100);
    
      // Rest of the code...
    
      return (
        <ListItem style={style} key={item?.goalId} sx={{ display: 'flex' }}
        secondaryAction={
          <IconButton edge="end" aria-label="achieved" onClick={() => handleGoalSuccess(item.goalId)}>
            <CheckIcon />
          </IconButton>
        }
        >
          <ListItemButton onClick={() => {handleSetItem(item, handleOpen);}}>
          <ListItemText 
            primary={item?.goalName} 
            secondary={
              dailySavings !== undefined && !isNaN(dailySavings)
                ? daysToGoal + " Days Remaining, Saving $" + dailySavings.toFixed(2) + " per day" 
                : daysToGoal !== 0 
                  ? daysToGoal + " Days Remaining, Saving $" + dailySavings.toFixed(2) + " per day"
                  : "Goal reached"
            }
          />
    
          <Box sx={{ flexGrow: 1 }} />
          <Typography align="right" variant="body2" marginX={2}>
            ${item?.amount-totalSavedMoney}
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress variant="determinate" value={progress} sx={{color:'green'}} />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
            >{`${Math.round(progress)}%`}</Typography>
          </Box>
        </Box>
        </ListItemButton>
      </ListItem>
    );
    }
    
    
    


  return (
    <Box sx={{ flexGrow: 1 }}>
      <AddGoalItemModal 
            categories={categories}
            setUpdateGoalItems={setUpdateGoalItems} 
            goalItems={goalItems}
            setOpenAlert={setOpenAlert}
            setPostMsg={setPostMsg}
            item={item}
            handleOpen={handleOpen}
            handleClose={handleClose}
            open={open}
        />
        <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
          {postMsg}
        </Alert>
        </Snackbar>
        {achievedItems.length === 0 && notAchievedItems.length === 0 ? (
          // Display a message if there are no transactions
          <Box>
            <Typography variant='h4'>
              No Goals
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
                     Goals
                  </Typography>
                  </Grid>
                  <Grid>
                    <Button variant="contained" sx={{float: 'right'}} onClick={handleSwitchTab}>{!achievedTab ? `Achieved Tab` : `Not Achieved Tab`}</Button>
                  <Typography>
                     Use The Provided Unique Code When Withdrawing Funds From The Chosen Category,
                  </Typography>
                  <Typography>
                     This Ensures Progress Tracking, And Promotes Healthy Spending
                  </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {achievedTab ? (
            achievedItems.length !== 0 ? (
            <Masonry columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }} spacing={0}>
                <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
                    <Card elevation={4} sx={{height:400}}>
                      <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
                        <AutoSizer>
                          {({height, width}) => (
                              <FixedSizeList
                                width={width}
                                height={height}
                                itemSize={75}
                                itemCount={achievedItems.length}
                                overscanCount={5}
                              >
                              {renderAllRow}
                            </FixedSizeList>
                          )}
                      </AutoSizer>
                      </CardContent>
                    </Card>
                </Grid>
                <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
                  <Card elevation={4} sx={{height:400}} >
                    <CardContent sx={{height:'100%', bgcolor: theme.palette.info.main}}>
                    <AutoSizer>
                      {({height, width}) => (
                        <ScatterChart
                          width={width}
                          height={height}
                          series={[
                            {
                              label: 'Days, Amount',
                              data: achievedItems.map((v) => ({ x: v['Days Elapsed'], y: v.amount, id: v.goalId })),
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
                  </CardContent>
                </Card>
                </Grid>
                </Masonry>
          ) : (
            <Typography variant="h6">
              You don't have any finished goals yet.
            </Typography>
          )) : ( notAchievedItems.length !== 0 ? (
            <Masonry columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }} spacing={0}>
              <Grid xs={2} sm={6} md={6} lg={8} xl={8}>
                <Card elevation={4} sx={{ height: 300 }}>
                  <CardContent sx={{ height: "100%", bgcolor: theme.palette.info.main }}>
                    <Typography style={{ position: 'absolute', top: 15, left: 15, right: 0, textAlign: 'left' }}>
                      Total: ${notAchievedItems.reduce((acc, item) => acc + item.amount, 0).toFixed(2)}
                    </Typography>
                    <AutoSizer>
                      {({ height, width }) => (
                        <FixedSizeList
                          width={width}
                          height={height-30}
                          itemSize={75}
                          itemCount={notAchievedItems.length}
                          overscanCount={5}
                          style={{marginTop:30}}
                        >
                          {renderRow}
                        </FixedSizeList>
                      )}
                    </AutoSizer>
                  </CardContent>
                </Card>
              </Grid>
            </Masonry>
          ) : (
            <Typography variant="h6">You don't have goals yet.</Typography>
          ))}         
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

export default Goals;
