import { Modal, Fade, Box, FormControl, InputLabel, OutlinedInput, Button, Fab, InputAdornment, MenuItem, Select, SelectChangeEvent, Switch, useTheme, Grid, IconButton, Autocomplete, TextField } from "@mui/material";
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



interface AddRecurringTransactionModalProps {
  categories: CategoryItem[]
  setOpenAlert: (value: boolean) => void;
  setPostMsg: (value: string) => void;
  item?: RecurringTransactionItem;
  handleOpen: () => void;
  handleClose: () => void;
  open: boolean;
  inputCategory: string;
}



export const AddRecurringTransactionModal = ({categories,setOpenAlert,setPostMsg, item, handleOpen, handleClose, open, inputCategory}: AddRecurringTransactionModalProps) => {
  const [editItem, setEditItem] = React.useState<RecurringTransactionItem | undefined>(item)
  
  const [category, setCategory] = React.useState(editItem ? editItem.Category : "");
  const [description, setDescription] = React.useState(
    editItem ? editItem.Description : ""
  );
  const [amount, setAmount] = React.useState(editItem ? Math.abs(editItem.Amount) : 0);
  const [inputDate, setDate] = React.useState<Dayjs | null>(
    editItem ? dayjs(editItem.Date) : dayjs()
  );
  const [frequency, setFrequency] = React.useState(
    editItem ? editItem.Frequency : 7
  );
  const theme = useTheme();
  const [notAchievedItems, setNotAchievedItems] = React.useState<GoalItem[]>([])

  const updateState = (data: RecurringTransactionItem | undefined) => {
    setCategory(data ? data.Category: inputCategory);
    setDescription(data ? data.Description : "");
    setAmount(data ? Math.abs(data.Amount) : 0);
    setDate(data ? dayjs(data.Date) : dayjs());
    setFrequency(data ? data.Frequency : 7);
  };
  



  React.useEffect(() => {
    updateState(editItem);
  }, [editItem]);
  
  React.useEffect(() => {
    setEditItem(item);
    updateState(item);
  }, [item]);



  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""

  const handleAddRecurringTransaction = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      let inputAmount = Math.abs(amount);
      const authToken = Cookies.get("authToken");
      const date = dayjs(inputDate).format("YYYY-MM-DD").toString();
      const data = {
        "category": category,
        "startDate": date,
        "description": description,
        "amount": inputAmount,
        "frequency": frequency,
      };
  
      const response = await axios.post(`${rootUrl}/api/recurring`, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200) {
        setPostMsg("Successfully Added Transaction");
        handleClose()
        setEditItem(undefined)
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
        "recurringTransactionId": editItem?.recurringId
      };
  
      const response = await axios({
        method: 'delete',
        url: `${rootUrl}/api/recurring`,
        data: data,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200) {
        setPostMsg("Successfully Deleted Recurring Transaction");
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
        "startDate": date,
        "description": description,
        "amount": inputAmount,
        "frequency": frequency,
        "recurringTransactionId": editItem?.recurringId
      };
  
      const response = await axios.patch(`${rootUrl}/api/recurring`, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200) {
        setPostMsg("Successfully Updated Recurring Transaction");
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
    


  return (
      <>      <Fab
      color="primary"
      aria-label="add"
      size='large'
      className="recurringTransactionFab"
      onClick={() => {handleOpen(); setEditItem(undefined)}}
      sx={{ position: 'fixed', bottom: 32, right: 160}}
    >
      <AddIcon />
    </Fab>
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
              <IconButton
                size='large'
                onClick={handleClose}
              ><CloseIcon /></IconButton>
              <h2 className='pageTitle'>Add Recurring Payment</h2>
              <div></div>
              </Box>
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
        <InputLabel htmlFor="outlined-adornment-frequency">Frequency</InputLabel>
        <OutlinedInput
          id="outlined-adornment-frequency"
          label="Frequency"
          type="number"
          value={frequency === 0 ? '' : frequency}
          onChange={(event) => {
            setFrequency(Number(event.target.value));
          }}
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

      {editItem ? (
        <Box display={'flex'} flexDirection={'row'}>        
          <Button variant="outlined" color="error" fullWidth sx={{ marginTop: 1, marginRight: 2}} onClick={handleDeleteRecurringTransaction}>Delete</Button>
          <Button variant="contained" color="success" fullWidth sx={{ marginTop: 1}} onClick={handleUpdateRecurringTransaction}>Update</Button>
        </Box>
      ) : (
        <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleAddRecurringTransaction}>Add</Button>
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





export default AddRecurringTransactionModal