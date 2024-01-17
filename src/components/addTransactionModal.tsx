import { Modal, Fade, Box, FormControl, InputLabel, OutlinedInput, Button, Fab, InputAdornment, MenuItem, Select, SelectChangeEvent, Switch, useTheme, Grid, IconButton, Autocomplete, TextField, Tooltip } from "@mui/material";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import React from "react";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import CategoryItem from "../types/CategoryItem";
import AddIcon from '@mui/icons-material/Add';
import TransactionItem from "../types/Transaction";
import CloseIcon from '@mui/icons-material/Close';
import GoalItem from "../types/GoalItem";
import RecurringTransactionItem from "../types/RecurringTransaction";



interface AddTransactionModalProps {
  categories: CategoryItem[]
  setUpdateTransactions: (value: boolean) => void;
  setUpdateRecTransactions: (value: boolean) => void;
  setUpdateBalances: (value: boolean) => void;
  setOpenAlert: (value: boolean) => void;
  goalItems: GoalItem[];
  setUpdateGoalItems: (value: boolean) => void;
  setPostMsg: (value: string) => void;
  item?: TransactionItem;
  recurringItem?: RecurringTransactionItem;
  handleOpen: () => void;
  handleClose: () => void;
  open: boolean;
  inputCategory: string;
}



export const AddTransactionModal = ({categories, setUpdateTransactions, setUpdateRecTransactions, setUpdateBalances, setOpenAlert, goalItems, setUpdateGoalItems, setPostMsg, item, recurringItem, handleOpen, handleClose, open, inputCategory}: AddTransactionModalProps) => {
  const [editItem, setEditItem] = React.useState<TransactionItem | undefined>(item)
  const [editRecurringItem, setEditRecurringItem] = React.useState<RecurringTransactionItem | undefined>(recurringItem)


  const [category, setCategory] = React.useState(editItem ? editItem.Category : "");
  const [description, setDescription] = React.useState(editItem ? editItem.Description : recurringItem ? recurringItem.Description : "");
  const [amount, setAmount] = React.useState(editItem ? Math.abs(editItem.Amount) : recurringItem ? Math.abs(recurringItem.Amount) : 0);
  const [frequency, setFrequency] = React.useState(recurringItem ? recurringItem.Frequency : 0);
  const [inputDate, setDate] = React.useState<Dayjs | null>(editItem ? dayjs(editItem.Date) : recurringItem ? dayjs(recurringItem.Date) : dayjs());
  const [trans_type, setTransaction] = React.useState(editItem ? editItem.Transaction : recurringItem ? recurringItem.Transaction: "Withdraw");

  const [recurring, setRecurring] = React.useState<boolean>(recurringItem? true : false);
  



  
  const theme = useTheme();
  const [notAchievedItems, setNotAchievedItems] = React.useState<GoalItem[]>([])

  const updateState = React.useCallback((data: TransactionItem | undefined) => {
    setCategory(data ? data.Category : inputCategory);
    setDescription(data ? data.Description : "");
    setAmount(data ? Math.abs(data.Amount) : 0);
    setDate(data ? dayjs(data.Date) : dayjs());
    setTransaction(data ? data.Transaction : "Withdraw");
  }, [inputCategory, setCategory, setDescription, setAmount, setDate, setTransaction]);
  
  const updateRecState = React.useCallback((data: RecurringTransactionItem | undefined) => {
    setFrequency(data ? data.Frequency : 0);
    setRecurring(data ? true : false);
    if (!item) {
      setCategory(data ? data.Category : inputCategory);
      setDescription(data ? data.Description : "");
      setAmount(data ? Math.abs(data.Amount) : 0);
      setDate(data ? dayjs(data.Date) : dayjs());
      setTransaction(data ? data.Transaction : "Withdraw");
    }
  }, [inputCategory, item, setCategory, setDescription, setAmount, setDate, setTransaction, setFrequency, setRecurring]);
  
  
  



  React.useEffect(() => {
    updateState(editItem);
    updateRecState(editRecurringItem);
  }, [editItem, editRecurringItem, updateRecState, updateState]);
  
  React.useEffect(() => {
    setEditItem(item);
    setEditRecurringItem(recurringItem);
    updateState(item);
    updateRecState(recurringItem);
  }, [item, recurringItem, updateRecState, updateState]);

  React.useEffect(() => {
    setUpdateGoalItems(true);
  }, [setUpdateGoalItems])
  

  React.useEffect(() => {
    try {
      if (goalItems.length !== 0) {
        const notAchievedItems = goalItems.filter((goalItem) => goalItem.achieved === false);
        setNotAchievedItems(notAchievedItems);
      }
    } catch (error) {
    }
  }, [goalItems]);



  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""

  const handleAddRecurringTransaction = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      let inputAmount = Math.abs(amount);
      const authToken = Cookies.get("authToken");
      const date = dayjs(inputDate).format("YYYY-MM-DD").toString();
      const data = {
        "category": category,
        "amount": inputAmount,
        "description": description,
        "startDate": date,
        "trans_type": trans_type,
        "frequency": frequency
      };
  
      const response = await axios.post(`${rootUrl}/api/recurring`, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200) {
        setPostMsg("Successfully Added Recurring Transaction");
        setUpdateRecTransactions(true)
        setEditRecurringItem(undefined)
        setEditItem(undefined)
        handleClose()

      } else {
        setPostMsg("Error" + response.data);
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


  const handleDeleteRecurringTransaction = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const authToken = Cookies.get("authToken");
      const data = {
        "recurringTransactionId": editRecurringItem?.recurringId
      };
  
      const response = await axios({
        method: 'delete',
        url: `${rootUrl}/api/recurring`,
        data: data,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200) {
        setPostMsg("Successfully Deleted Recurring Transaction");
        setUpdateRecTransactions(true)
        setEditRecurringItem(undefined)
        setEditItem(undefined)
        handleClose()
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

  const handleUpdateRecurringTransaction = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      let inputAmount = Math.abs(amount);
      const authToken = Cookies.get("authToken");
      const date = dayjs(inputDate).format("YYYY-MM-DD").toString();
      const data = {
        "category": category,
        "amount": inputAmount,
        "description": description,
        "startDate": date,
        "trans_type": trans_type,
        "frequency": frequency,
        "recurringTransactionId": editRecurringItem?.recurringId
      };
      const response = await axios.patch(`${rootUrl}/api/recurring`, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200) {
        setPostMsg("Successfully Updated Recurring Transaction");
        setUpdateRecTransactions(true)
        setEditRecurringItem(undefined)
        setEditItem(undefined)
        handleClose()
      } else {
        setPostMsg("Error" + response.data);
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










  const handleAddTransaction = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      let inputAmount = Math.abs(amount);
      if (trans_type === "Withdraw") {
        inputAmount = Math.abs(amount) * -1;
      }
      const authToken = Cookies.get("authToken");
      const date = dayjs(inputDate).format("YYYY-MM-DD").toString();
      const data = {
        "category": category,
        "date": date,
        "description": description,
        "amount": inputAmount,
        "trans_type": trans_type,
      };
  
      const response = await axios.post(`${rootUrl}/api/transactions`, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200) {
        setPostMsg("Successfully Added Transaction");
        setEditRecurringItem(undefined)
        setEditItem(undefined)
        handleClose()
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
      }
    }
    setOpenAlert(true);
  };


  const handleDeleteTransaction = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const authToken = Cookies.get("authToken");
      const data = {
        "transactionId": editItem?.transactionID
      };
  
      const response = await axios({
        method: 'delete',
        url: `${rootUrl}/api/transactions`,
        data: data,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200) {
        setPostMsg("Successfully Deleted Transaction");
        setUpdateTransactions(true);
        setEditRecurringItem(undefined)
        setEditItem(undefined)
        handleClose()
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
      }
    }
    setOpenAlert(true);
  }

  const handleUpdateTransaction = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      let inputAmount = Math.abs(amount);
      if (trans_type === "Withdraw") {
        inputAmount = Math.abs(amount) * -1;
      }
      const authToken = Cookies.get("authToken");
      const date = dayjs(inputDate).format("YYYY-MM-DD").toString();
      const data = {
        "category": category,
        "date": date,
        "description": description,
        "amount": inputAmount,
        "trans_type": trans_type,
        "transactionId": editItem?.transactionID
      };
  
      const response = await axios.patch(`${rootUrl}/api/transactions`, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200) {
        setPostMsg("Successfully Updated Transaction");
        setUpdateTransactions(true);
        setEditRecurringItem(undefined)
        setEditItem(undefined)
        handleClose()
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
      }
    }
    setOpenAlert(true);
  };
    



  return (
      <><Tooltip title="Add Transaction"><Fab
      color="primary"
      aria-label="add"
      size='large'
      className="transactionFab"
      onClick={() => {handleOpen(); setEditItem(undefined); setEditRecurringItem(undefined);}}
      sx={{ position: 'fixed', bottom: 32, right: 32}}
    >
      <AddIcon />
    </Fab></Tooltip>
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      onClose={handleClose}
      disableScrollLock={ true }
      className="transactionModal"
      closeAfterTransition
    >
      <Fade in={open}>
      <Grid container justifyContent="center" alignItems="top" style={{ minHeight: '100vh' }}>
          <Grid item xs={12} sm={8} md={6} lg={5} xl={4}>
        <Box className={'modal'} sx={{bgcolor: theme.palette.secondary.main, width:'auto', position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Tooltip title="Close"><IconButton
                size='large'
                onClick={handleClose}
              ><CloseIcon /></IconButton></Tooltip>
              <h2 className='pageTitle'>Add Transaction</h2>
              <div></div>
              </Box>
      {((!editItem && editRecurringItem) || (!editItem && !editRecurringItem)) && (<FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
        <OutlinedInput
          id="outlined-adornment-recurring"
          type="text"
          readOnly={true}
          value={"Repeating Transaction?"}
          endAdornment={
            <InputAdornment position="end">
              <Switch
                checked={recurring}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setRecurring(event.target.checked? true : false);
                }}
                inputProps={{ 'aria-label': 'Recurring' }}
              />
            </InputAdornment>
          }
        />
      </FormControl>)}
        <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={inputDate}
            onChange={(newValue: Dayjs | null) => {
              setDate(newValue);
            }}
          />
        </LocalizationProvider>
      </FormControl>
      {recurring && (
      <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
      <Autocomplete
        id="outlined-adornment-frequency"
        options={['7', '14', '28']}
        freeSolo
        value={frequency === 0 ? '' : String(frequency)}
        onInputChange={(event, newValue) => {
          if (newValue !== null) {
            setFrequency(Number(newValue));
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="Frequency (Days)" variant="outlined" />
        )}
      />
    </FormControl>)}
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
          value={amount === 0 ? '' : amount}
          onChange={(event) => {
            setAmount(Number(event.target.value));
          }}
        />
      </FormControl>

      <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
  <Autocomplete
    id="outlined-adornment-description"
    options={notAchievedItems.map((item) => item.goalName + ' - ' + item.uniqueCode)}
    freeSolo
    value={description}
    onInputChange={(event, newValue) => {
      if (newValue !== null) {
        setDescription(newValue);
      }
    }}
    renderInput={(params) => (
      <TextField {...params} label="Description" variant="outlined" />
    )}
  />
</FormControl>

      {editItem || editRecurringItem ? (
        <Box display={'flex'} flexDirection={'row'}>        
          <Button variant="outlined" color="error" fullWidth sx={{ marginTop: 1, marginRight: 2}} onClick={recurringItem? handleDeleteRecurringTransaction : handleDeleteTransaction}>Delete</Button>
          <Button variant="contained" color="success" fullWidth sx={{ marginTop: 1}} onClick={recurringItem? handleUpdateRecurringTransaction : handleUpdateTransaction}>Update</Button>
        </Box>
      ) : (
        <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={recurring? handleAddRecurringTransaction : handleAddTransaction}>Add</Button>
      )
      }
        </Box>
        </Grid>
        </Grid>
      </Fade>
    </Modal>
    </>
    )
}





export default AddTransactionModal