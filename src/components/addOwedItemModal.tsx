import { Fab, Modal, Fade, Box, FormControl, InputLabel, Select, SelectChangeEvent, MenuItem, OutlinedInput, Button, useTheme, Grid, IconButton, Tooltip } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios, { AxiosError } from "axios";
import dayjs, { Dayjs } from "dayjs";
import Cookies from "js-cookie";
import CategoryItem from "../types/CategoryItem";
import OwedItem from "../types/OwedItem";
import React from "react";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';







interface AddOwedItemProps {
    categories: CategoryItem[]
    setUpdateOwedItems: (value: boolean) => void;
    setUpdateBalances: (value: boolean) => void;
    setOpenAlert: (value: boolean) => void;
    setPostMsg: (value: string) => void;
    item?: OwedItem;
    handleOpen: () => void;
    handleClose: () => void;
    open: boolean;
    inputPerson: string;
  }
  
  
  
  export const AddOwedItemModal = ({categories, setUpdateOwedItems, setUpdateBalances, setOpenAlert, setPostMsg, item, handleOpen, handleClose, open, inputPerson}: AddOwedItemProps) => {
    const [editItem, setEditItem] = React.useState<OwedItem | undefined>(item)

    const [category, setCategory] = React.useState(editItem ? editItem.Category : "");
    const [description, setDescription] = React.useState(
      editItem ? editItem.Description : ""
    );
    const [amount, setAmount] = React.useState(editItem ? Math.abs(editItem.Amount) : 0);
    const [inputDate, setDate] = React.useState<Dayjs | null>(
      editItem ? dayjs(editItem.Date) : dayjs()
    );
    const [person, setPerson] = React.useState(
      editItem ? editItem.Person : ""
    );
    const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""






    const theme = useTheme();
    const updateState = React.useCallback((data: OwedItem | undefined) => {
      setCategory(data ? data.Category : '');
      setDescription(data ? data.Description : "");
      setAmount(data ? Math.abs(data.Amount) : 0);
      setDate(data ? dayjs(data.Date) : dayjs());
      setPerson(data ? data.Person : inputPerson);
    }, [setCategory, setDescription, setAmount, setDate, setPerson, inputPerson]);
    
      
      React.useEffect(() => {
        updateState(editItem);
      }, [editItem, updateState]);
      
      React.useEffect(() => {
        setEditItem(item);
        updateState(item);
      }, [item, updateState]);
      

    const handleAddOwedItem = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try {
          const authToken = Cookies.get("authToken");
          const date = dayjs(inputDate).format("YYYY-MM-DD").toString();
          const data = {
            "category": category,
            "date": date,
            "description": description,
            "amount": Math.abs(amount),
            "person": person,
          };
      
          const response = await axios.post(`${rootUrl}/api/moneyOwed`, data, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (response.status === 200) {
            setPostMsg("Successfully Logged Money Owed");
            handleClose();
            setEditItem(undefined)
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
          }
        }
        setOpenAlert(true);
      };
  
  
      const handleUpdateOwedItem = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try {
          const authToken = Cookies.get("authToken");
          const date = dayjs(inputDate).format("YYYY-MM-DD").toString();
          const data = {
            "category": category,
            "date": date,
            "description": description,
            "amount": Math.abs(amount),
            "person": person,
            "owed_id": editItem?.ID
          };
      
          const response = await axios.patch(`${rootUrl}/api/editOwedItem`, data, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (response.status === 200) {
            setPostMsg("Successfully Updated Money Owed");
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
          }
        }
        setOpenAlert(true);
      };
  
      const handleDeleteOwedItem = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try {
          const authToken = Cookies.get("authToken");
          const data = {
            "owed_id": editItem?.ID
          };
      
          const response = await axios({
            method: 'delete',
            url: `${rootUrl}/api/moneyOwed`,
            data: data,
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (response.status === 200) {
            setPostMsg("Successfully Deleted Owed Item");
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
          }
        }
        setOpenAlert(true);
      }
  


    return (
        <>
        <Tooltip title="Add Owed Item"><Fab
        color="primary"
        aria-label="add"
        size='large'
        className="owedFab"
        onClick={() => {handleOpen(); setEditItem(undefined)}}
        sx={{ position: 'fixed', bottom: 32, right: 32}}
      >
        <AddIcon />
      </Fab></Tooltip>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        disableScrollLock={ true }
        onClose={handleClose}
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
              <h2 className='pageTitle'>Log Owed Item</h2>
              <div></div>
              </Box>
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
            value={amount === 0 ? '' : amount}
            onChange={(event) => setAmount(Number(event.target.value))}
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
          <Button variant="outlined" color="error" fullWidth sx={{ marginTop: 1, marginRight: 2}} onClick={handleDeleteOwedItem}>Delete</Button>
          <Button variant="contained" color="success" fullWidth sx={{ marginTop: 1}} onClick={handleUpdateOwedItem}>Update</Button>
        </Box>
      ) : (
        <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleAddOwedItem}>Add</Button>
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

  export default AddOwedItemModal