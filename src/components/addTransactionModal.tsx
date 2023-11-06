import { Modal, Fade, Box, FormControl, InputLabel, OutlinedInput, Button, Fab, InputAdornment, MenuItem, Select, SelectChangeEvent, Switch, useTheme, Grid } from "@mui/material";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import React from "react";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import CategoryItem from "../types/CategoryItem";
import AddIcon from '@mui/icons-material/Add';
import TransactionItem from "../types/Transaction";



interface AddTransactionModalProps {
  categories: CategoryItem[]
  setUpdateTransactions: (value: boolean) => void;
  setUpdateBalances: (value: boolean) => void;
  setOpenAlert: (value: boolean) => void;
  setPostMsg: (value: string) => void;
  item?: TransactionItem;
  handleOpen: () => void;
  handleClose: () => void;
  open: boolean;
  inputCategory: string;
}



export const AddTransactionModal = ({categories, setUpdateTransactions, setUpdateBalances, setOpenAlert, setPostMsg, item, handleOpen, handleClose, open, inputCategory}: AddTransactionModalProps) => {
  const [editItem, setEditItem] = React.useState<TransactionItem | undefined>(item)
  
  const [category, setCategory] = React.useState(editItem ? editItem.Category : "");
  const [description, setDescription] = React.useState(
    editItem ? editItem.Description : ""
  );
  const [amount, setAmount] = React.useState(editItem ? Math.abs(editItem.Amount) : 0);
  const [inputDate, setDate] = React.useState<Dayjs | null>(
    editItem ? dayjs(editItem.Date) : dayjs()
  );
  const [trans_type, setTransaction] = React.useState(
    editItem ? editItem.Transaction : "Withdraw"
  );
  const theme = useTheme();

  const updateState = (data: TransactionItem | undefined) => {
    setCategory(data ? data.Category: inputCategory);
    setDescription(data ? data.Description : "");
    setAmount(data ? Math.abs(data.Amount) : 0);
    setDate(data ? dayjs(data.Date) : dayjs());
    setTransaction(data ? data.Transaction : "Withdraw");
  };
  
  React.useEffect(() => {
    updateState(editItem);
  }, [editItem]);
  
  React.useEffect(() => {
    setEditItem(item);
    updateState(item);
  }, [item]);
  


  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""

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
        handleClose()
        setEditItem(undefined)
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
      <>      <Fab
      color="primary"
      aria-label="add"
      size='large'
      onClick={() => {handleOpen(); setEditItem(undefined)}}
      sx={{ position: 'fixed', bottom: 32, right: 32}}
    >
      <AddIcon />
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
      <Box className={'modal'} sx={{bgcolor: theme.palette.secondary.main }}>
        <h2 className='pageTitle'>Add Transaction</h2>
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


      <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
        <InputLabel htmlFor="outlined-adornment-description">Description</InputLabel>
        <OutlinedInput
          id="outlined-adornment-description"
          label="Description"
          type='text'
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </FormControl>
      {editItem ? (
        <Box display={'flex'} flexDirection={'row'}>        
          <Button variant="outlined" color="error" fullWidth sx={{ marginTop: 1, marginRight: 2}} onClick={handleDeleteTransaction}>Delete</Button>
          <Button variant="contained" color="success" fullWidth sx={{ marginTop: 1}} onClick={handleUpdateTransaction}>Update</Button>
        </Box>
      ) : (
        <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleAddTransaction}>Add</Button>
      )
      }
        </Box>
      </Fade>
    </Modal>
    </>
    )
}





export default AddTransactionModal