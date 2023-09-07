import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
import CardContent from '@mui/material/CardContent';
import Cookies from 'js-cookie';
import { BarChart, ScatterChart } from '@mui/x-charts';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import 'react-virtualized/styles.css'; // only needs to be imported once
import { DatabaseInformationContext } from '../utils/DatabaseInformation';
import { Button, FormControl, IconButton, InputLabel, Select, MenuItem, SelectChangeEvent, Alert, Snackbar } from '@mui/material';
import axios, { AxiosError } from 'axios';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized';
import Masonry from '@mui/lab/Masonry';
import OwedItem from '../types/OwedItem';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import checkIsLoggedIn from '../auth/auth';
import AddOwedItemModal from '../components/addOwedItemModal';



export const MoneyOwed = () => {
    const { categories, user, owedItems, setUpdateUser, setUpdateCategories, setUpdateBalances, setUpdateOwedItems} = React.useContext(DatabaseInformationContext);
    const [open, setOpen] = React.useState(false);
    const [edit, setEdit] = React.useState(false);
    const [person, setPerson] = React.useState('');
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [openAlert, setOpenAlert] = React.useState(false);
    const [item, setItem] = React.useState<OwedItem | undefined>(undefined)

    const [filterPersonItems, setfilterPersonItems] = React.useState<OwedItem[]>([])
    const [filterPerson, setFilterPerson] = React.useState('')
    const [postMsg, setPostMsg] = React.useState('')

    const [payedItems, setPayedItems] = React.useState<OwedItem[]>([])
    const [notPayedItems, setNotPayedItems] = React.useState<OwedItem[]>([])
    const [payedTab, setPayedTab] = React.useState(false)



    const handleOwedSuccess = async (id: number) => {
      try{
        const authToken = Cookies.get("authToken");
        console.log(id)
        const data = {
          "owed_id": id
        };
        const response = await axios.patch(`${rootUrl}/api/updateOwedItem`, data, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Successfully Updated Owed Item");
          handleClose();
          setUpdateOwedItems(true);
          setUpdateBalances(true);
        } else {
          setPostMsg("Error" + response.statusText);
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

    }

    
    const handleSetItem = (item: OwedItem | undefined, callback: () => void) => {
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
    if (owedItems.length === 0) {
        setUpdateOwedItems(true);
    }
    if (user.email === "") {
      setUpdateUser(true)
    }
    
  }, []);






  React.useEffect(() => {
    try {
      if (owedItems.length !== 0) {
        const notPayedItems = owedItems.filter((owedItem) => owedItem.Payed == false);
        setNotPayedItems(notPayedItems);
        setPayedItems(owedItems.filter((owedItem) => owedItem.Payed == true));
        if (filterPerson === "") {
          setFilterPerson(notPayedItems[0].Person);
          const firstPerson = notPayedItems[0].Person;
          setfilterPersonItems(notPayedItems.filter((item) => item.Person === firstPerson));
        } else {
          setfilterPersonItems(notPayedItems.filter((item) => item.Person === filterPerson));
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [owedItems]);
  
    


    const handleCloseAlert = (_event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpenAlert(false);
    };



  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""

  const handleSwitchTab = () => {
    setPayedTab(!payedTab)
  }
      


    function renderAllRow(props: ListChildComponentProps) {
      const { index, style } = props;
      const item = payedItems[payedItems.length-1-index]; 
    
      return (
        <ListItem style={style} key={item?.ID} sx={{ display: 'flex' }}
        secondaryAction={
          <IconButton edge="end" aria-label="payed" onClick={() => handleOwedSuccess(item.ID)}>
            <CloseIcon />
          </IconButton>
        }
        >
          <ListItemButton >
            <ListItemText primary={item?.Person} secondary={item?.Description} />
            <Box sx={{ flexGrow: 1 }} />
            <Typography align="right" variant="body2">
              ${item?.Amount}
            </Typography>
          </ListItemButton>
        </ListItem>
      );
    }

    
    function renderRow(props: ListChildComponentProps) {
      const { index, style } = props;
      const item = filterPersonItems[index];
    
      return (
        <ListItem style={style} key={item?.ID} sx={{ display: 'flex' }}
        secondaryAction={
          <IconButton edge="end" aria-label="payed" onClick={() => handleOwedSuccess(item.ID)}>
            <CheckIcon />
          </IconButton>
        }
        >
          <ListItemButton onClick={() => {handleSetItem(item, handleOpen);}}>
            <ListItemText primary={item?.Description} secondary={item?.Category} />
            <Box sx={{ flexGrow: 1 }} />
            <Typography align="right" variant="body2">
              ${item?.Amount}
            </Typography>
          </ListItemButton>
        </ListItem>
      );
    }
    





      const totalOwed = notPayedItems.reduce(
        (sum, owedItem) => sum + owedItem.Amount,
        0
      );

      const totalPayed = payedItems.reduce(
        (sum, owedItem) => sum + owedItem.Amount,
        0
      );

      const payedItemsGrouped = payedItems.reduce((acc, owedItem) => {
        const person = owedItem.Person;
        if (!acc[person]) acc[person] = { totalDays: 0, count: 0 };
        acc[person].totalDays += owedItem['Days Elapsed'];
        acc[person].count += 1;
        return acc;
      }, {} as Record<string, { totalDays: number; count: number }>);

        
      const people = new Set(notPayedItems.map((item) => item.Person));




      const avgDaysElapsedByPerson = Object.entries(payedItemsGrouped).reduce(
        (acc, [person, { totalDays, count }]) => {
          acc[person] = totalDays / count;
          return acc;
        },
        {} as Record<string, number>
      );

      const sortedData = Object.entries(avgDaysElapsedByPerson)
      .map(([person, avg]) => ({ person, avg }))
      .sort((a, b) => a.avg - b.avg);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AddOwedItemModal 
            categories={categories}
            setUpdateOwedItems={setUpdateOwedItems} 
            setUpdateBalances={setUpdateBalances} 
            setOpenAlert={setOpenAlert}
            setPostMsg={setPostMsg}
            item={item}
            handleOpen={handleOpen}
            handleClose={handleClose}
            open={open}
            inputPerson={filterPerson}
        />
        <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
          {postMsg}
        </Alert>
        </Snackbar>
        {payedItems.length === 0 && notPayedItems.length === 0 ? (
          // Display a message if there are no transactions
          <Box>
            <Typography variant='h4'>
              No Owed Items
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
                     Owed Money
                  </Typography>
                  </Grid>
                  <Grid>
                    <Button variant="contained" sx={{float: 'right'}} onClick={handleSwitchTab}>{!payedTab ? `Payed Tab` : `Not Payed Tab`}</Button>
                  </Grid>
                  <Grid>
                  <Typography variant="h6">
                    {!payedTab ? (
                      <>
                        Total Money Owed:{' '}
                        <Box component="span" fontWeight="bold">
                          ${totalOwed.toFixed(2)}
                        </Box>
                      </>
                    ) : (
                      <>
                        Total Money Payed:{' '}
                        <Box component="span" fontWeight="bold">
                          ${totalPayed.toFixed(2)}
                        </Box>
                      </>
                    )}
                  </Typography>

                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {payedTab ? (
            payedItems.length !== 0 ? (
            <Masonry columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }} spacing={0}>
                <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
                    <Card elevation={4} sx={{height:400}}>
                      <CardContent sx={{height:'100%'}}>
                        <AutoSizer>
                          {({height, width}) => (
                              <FixedSizeList
                                width={width}
                                height={height}
                                itemSize={75}
                                itemCount={payedItems.length}
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
                    <CardContent sx={{height:'100%'}}>
                    <AutoSizer>
                      {({height, width}) => (
                        <ScatterChart
                          width={width}
                          height={height}
                          series={[
                            {
                              label: 'Days, Amount',
                              data: payedItems.map((v) => ({ x: v['Days Elapsed'], y: v.Amount, id: v.ID })),
                            },
                          ]}
                        />)}
                      </AutoSizer>
                      </CardContent>
                    </Card>
                </Grid>
                <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
                <Card elevation={4} sx={{height:400}} >
                <CardContent sx={{height:'100%'}}>
                    <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                      AVG Payback Per Person
                    </Typography>
                    <AutoSizer>
                      {({height, width}) => (
                    <BarChart
                      width={width}
                      height={height}
                      series={[{ data: sortedData.map((item) => item.avg) }]}
                      xAxis={[
                        {
                          data: sortedData.map((item) => item.person),
                          scaleType: 'band',
                        },
                      ]}
                      layout="vertical"
                    />)}
                    </AutoSizer>
                  </CardContent>
                </Card>
                </Grid>
                </Masonry>
          ) : (
            <Typography variant="h6">
              You don't have any payed items yet.
            </Typography>
          )) : ( notPayedItems.length !== 0 ? (
            <Masonry columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }} spacing={0}>
              <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
                <Card elevation={4}>
                  <CardContent>
                    <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
                      <InputLabel htmlFor="outlined-adornment-filter">
                        Filter Person
                      </InputLabel>
                      <Select
                        label="Filter Person"
                        className="select"
                        value={filterPerson}
                        onChange={(event: SelectChangeEvent<string>) => {
                          const newPerson = event.target.value as string;
                          setFilterPerson(newPerson);
                          setPerson(newPerson);
                          setfilterPersonItems(
                            notPayedItems.filter((item) => item.Person === newPerson)
                          );
                        }}
                        inputProps={{
                          name: "person",
                          id: "outlined-adornment-person",
                        }}
                      >
                        {[...people].map((person) => (
                          <MenuItem key={person} value={person}>
                            {person}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
                <Card elevation={4} sx={{ height: 300 }}>
                  <CardContent sx={{ height: "100%" }}>
                    <Typography style={{ position: 'absolute', top: 15, left: 15, right: 0, textAlign: 'left' }}>
                      Total: ${filterPersonItems.reduce((acc, item) => acc + item.Amount, 0).toFixed(2)}
                    </Typography>
                    <AutoSizer>
                      {({ height, width }) => (
                        <FixedSizeList
                          width={width}
                          height={height - 30}
                          itemSize={75}
                          itemCount={filterPersonItems.length}
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
            <Typography variant="h6">You don't have any owed items yet.</Typography>
          ))}         
        </Grid>
        )}
      </Box>
  );
};

export default MoneyOwed;
