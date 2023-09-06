import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
import CardContent from '@mui/material/CardContent';
import Cookies from 'js-cookie';
import { BarChart, ScatterChart } from '@mui/x-charts';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import 'react-virtualized/styles.css'; // only needs to be imported once
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { DatabaseInformationContext } from '../utils/DatabaseInformation';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Modal, Fade, Button, FormControl, IconButton, InputLabel, OutlinedInput, Select, MenuItem, SelectChangeEvent, Alert, Snackbar } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import axios from 'axios';
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



export const MoneyOwed = () => {
    const { categories, owedItems, setUpdateCategories, setUpdateBalances, setUpdateOwedItems} = React.useContext(DatabaseInformationContext);
    const [open, setOpen] = React.useState(false);
    const [edit, setEdit] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleEdit = () => setEdit(true);
    const handleCloseEdit = () => setEdit(false);
    const [openAlert, setOpenAlert] = React.useState(false);

    const [filterPersonItems, setfilterPersonItems] = React.useState<OwedItem[]>([])
    const [filterPerson, setFilterPerson] = React.useState('')
    const [category, setCategory] = React.useState('')
    const [postMsg, setPostMsg] = React.useState('')
    const [description, setDescription] = React.useState('')
    const [inputAmount, setAmount] = React.useState(0)
    const [person, setPerson] = React.useState('')
    const [inputDate, setDate] = React.useState<Dayjs | null>(dayjs())
    const [payedItems, setPayedItems] = React.useState<OwedItem[]>([])
    const [notPayedItems, setNotPayedItems] = React.useState<OwedItem[]>([])


    const [payedTab, setPayedTab] = React.useState(false)




    const [newCategory, setNewCategory] = React.useState('')
    const [newDescription, setNewDescription] = React.useState('')
    const [newAmount, setNewAmount] = React.useState(0)
    const [newPerson, setNewPerson] = React.useState('')
    const [newInputDate, setNewDate] = React.useState<Dayjs | null>(dayjs())
    const [OwedItemId, setOwedItemId] = React.useState(0)

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
    
  }, []);






    React.useEffect(() => {
      try {
        if (owedItems.length !== 0) {
          setNotPayedItems(owedItems.filter((owedItem) => (owedItem.Payed == false)))
          setPayedItems(owedItems.filter((owedItem) => (owedItem.Payed == true)))
          if (filterPerson === "") {
            setFilterPerson(owedItems.filter((owedItem) => (owedItem.Payed == false))[0].Person)
            const notPayedItems = owedItems.filter((item) => item.Payed == false);
            const firstPerson = notPayedItems[0].Person;
            const result = notPayedItems.filter((item) => item.Person === firstPerson);
            setfilterPersonItems(result);
          } else {
            setfilterPersonItems(
              notPayedItems.filter(
                (item) => item.Person === filterPerson
              )
            );
          }
        }
      }
      catch (error) {
        console.log(error)
      }
    }, [owedItems, filterPersonItems, filterPerson]);
    
    


    const handleCloseAlert = (_event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpenAlert(false);
    };

  if (!owedItems) {
    return <div>Loading...</div>;
  }

  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""

  const handleSwitchTab = () => {
    setPayedTab(!payedTab)
  }

  const handleAddOwedItem = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        const authToken = Cookies.get("authToken");
        const date = dayjs(inputDate).format("YYYY-MM-DD").toString();
        const data = {
          "category": category,
          "date": date,
          "description": description,
          "amount": inputAmount,
          "person": person,
        };
    
        const response = await axios.post(`${rootUrl}/api/moneyOwed`, data, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Successfully Logged Money Owed");
          setOpen(false);
          setUpdateOwedItems(true);
          setUpdateBalances(true);
        } else {
          setPostMsg("Error" + response.statusText);
        }
      } catch (error) {
        setPostMsg("Error: " + error);
        console.error(error);
      }
      setOpenAlert(true);
    };


    const handleUpdateOwedItem = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        const authToken = Cookies.get("authToken");
        const date = dayjs(newInputDate).format("YYYY-MM-DD").toString();
        const data = {
          "category": newCategory,
          "date": date,
          "description": newDescription,
          "amount": newAmount,
          "person": newPerson,
          "owed_id": OwedItemId
        };
    
        const response = await axios.patch(`${rootUrl}/api/editOwedItem`, data, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Successfully Updated Money Owed");
          setEdit(false);
          setUpdateOwedItems(true);
          setUpdateBalances(true);
        } else {
          setPostMsg("Error" + response.statusText);
        }
      } catch (error) {
        setPostMsg("Error: " + error);
        console.error(error);
      }
      setOpenAlert(true);
    };

    const handleDeleteOwedItem = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        const authToken = Cookies.get("authToken");
        const data = {
          "owed_id": OwedItemId
        };
    
        const response = await axios({
          method: 'delete',
          url: `${rootUrl}/api/moneyOwed`,
          data: data,
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Successfully Deleted Owed Item");
          setEdit(false);
          setUpdateOwedItems(true);
          setUpdateBalances(true);
        } else {
          setPostMsg("Error" + response.statusText);
        }
      } catch (error) {
        setPostMsg("Error: " + error);
        console.error(error);
      }
      setOpenAlert(true);
    }


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
          setOpen(false);
          setUpdateOwedItems(true);
          setUpdateBalances(true);
        } else {
          setPostMsg("Error" + response.statusText);
        }
    } catch (error) {
      setPostMsg("Error: " + error);
      console.error(error);
    }
    setOpenAlert(true);

    }
        
    
    if (owedItems.length === 0 || categories.length == 0) {
      return <div>Loading...</div>;
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

    const editOwedItem = (item: OwedItem) => {
      setNewCategory(item.Category)
      setNewAmount(Math.abs(item.Amount))
      setNewDate(dayjs(item.Date))
      setNewDescription(item.Description)
      setNewPerson(item.Person)
      setOwedItemId(item.ID)
      handleEdit()
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
          <ListItemButton onClick={() => editOwedItem(item)}>
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
      <Fab
        color="primary"
        aria-label="add"
        size='large'
        onClick={handleOpen}
        sx={{ position: 'fixed', bottom: 32, right: 32}}
      >
        <AddIcon />
      </Fab>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        disableScrollLock={ true }
        onClose={handleClose}
        closeAfterTransition
      >
        <Fade in={open}>
          <Box className={'modal'}>
          <h2 className='pageTitle'>Log Owed Item</h2>
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
          <InputLabel htmlFor="outlined-adornment-person">Person</InputLabel>
          <OutlinedInput
            id="outlined-adornment-person"
            type="text"
            label="Person"
            value={person}
            onChange={(event) => setPerson(event.target.value)}
          />
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            label="Amount"
            type='number'
            onChange={(event) => setAmount(Number(event.target.value))}
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
        <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleAddOwedItem}>Add</Button>
          </Box>
        </Fade>
      </Modal>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={edit}
        disableScrollLock={ true }
        onClose={handleCloseEdit}
        closeAfterTransition
      >
        <Fade in={edit}>
          <Box className={'modal'}>
          <h2 className='pageTitle'>Edit Owed Item</h2>
          <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              defaultValue={newInputDate}
              onChange={(newValue: Dayjs | null) => {
                setNewDate(newValue);
              }}
            />
          </LocalizationProvider>
          </FormControl>
        <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-category">Category</InputLabel>
          <Select
            label="Category"
            className='select'
            value={newCategory}
            onChange={(event: SelectChangeEvent<string>) => {setNewCategory(event.target.value as string)}}
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
          <InputLabel htmlFor="outlined-adornment-person">Person</InputLabel>
          <OutlinedInput
            id="outlined-adornment-person"
            type="text"
            label="Person"
            value={newPerson}
            onChange={(event) => setNewPerson(event.target.value)}
          />
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            label="Amount"
            type='number'
            value={newAmount}
            onChange={(event) => setNewAmount(Number(event.target.value))}
          />
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
          <InputLabel htmlFor="outlined-adornment-description">Description</InputLabel>
          <OutlinedInput
            id="outlined-adornment-description"
            label="Description"
            type='text'
            value={newDescription}
            onChange={(event) => setNewDescription(event.target.value)}
          />
        </FormControl>
        <Box display={'flex'} flexDirection={'row'}>        
          <Button variant="outlined" color="error" fullWidth sx={{ marginTop: 1, marginRight: 2}} onClick={handleDeleteOwedItem}>Delete</Button>
          <Button variant="contained" color="success" fullWidth sx={{ marginTop: 1}} onClick={handleUpdateOwedItem}>Update</Button>
        </Box>
        </Box>
        </Fade>
      </Modal>
        <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
          {postMsg}
        </Alert>
        </Snackbar>
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

      </Box>
  );
};

export default MoneyOwed;
