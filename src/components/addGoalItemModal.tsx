import { Fab, Modal, Fade, Box, FormControl, InputLabel, Select, SelectChangeEvent, MenuItem, OutlinedInput, Button, useTheme, Grid, IconButton, Typography } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios, { AxiosError } from "axios";
import dayjs, { Dayjs } from "dayjs";
import Cookies from "js-cookie";
import CategoryItem from "../types/CategoryItem";
import React from "react";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import GoalItem from "../types/GoalItem";







interface AddGoalItemProps {
    categories: CategoryItem[]
    setUpdateGoalItems: (value: boolean) => void;
    goalItems: GoalItem[];
    setOpenAlert: (value: boolean) => void;
    setPostMsg: (value: string) => void;
    item?: GoalItem;
    handleOpen: () => void;
    handleClose: () => void;
    open: boolean;
}
  
  
  
  export const AddGoalItemModal = ({categories, setUpdateGoalItems, goalItems, setOpenAlert, setPostMsg, item, handleOpen, handleClose, open}: AddGoalItemProps) => {
    const [editItem, setEditItem] = React.useState<GoalItem | undefined>(item)
    const [category, setCategory] = React.useState(editItem ? editItem.category : "");
    const [goalName, setGoalName] = React.useState(
      editItem ? editItem.goalName : ""
    );
    const [endDateInput, setEndDateInput] = React.useState<Dayjs | null>(
      editItem ? dayjs(editItem.endDate) : null
    );
    const [amount, setAmount] = React.useState(editItem ? Math.abs(editItem.amount) : 0);
    const [startDate, setStartDate] = React.useState<Dayjs | null>(
      editItem ? dayjs(editItem.startDate) : dayjs()
    );

    const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""
    const theme = useTheme();




    const updateState = (data: GoalItem | undefined) => {
        setCategory(data ? data.category: '');
        setGoalName(data ? data.goalName : "");
        setAmount(data ? Math.abs(data.amount) : 0);
        setEndDateInput(data ? dayjs(data.endDate) : null);
        setStartDate(data ? dayjs(data.startDate) : dayjs());
      };
      
      React.useEffect(() => {
        setEditItem(editItem);
      }, [editItem]);
      
      React.useEffect(() => {
        updateState(item);
        setEditItem(item);
      }, [item]);
      
    const handleAddGoalItem = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try {
          const authToken = Cookies.get("authToken");
          const date = dayjs(startDate).format("YYYY-MM-DD").toString();
          const endDate = dayjs(endDateInput).format("YYYY-MM-DD").toString();
          const data = {
            "category": category,
            "startDate": date,
            "goalName": goalName,
            "amount": Math.abs(amount),
            "endDate": endDate,
          };
      
          const response = await axios.post(`${rootUrl}/api/goals`, data, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (response.status === 200) {
            setPostMsg("Successfully Logged Goal");
            handleClose();
            setEditItem(undefined)
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
      };
  
  
      const handleUpdateGoalItem = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try {
          const authToken = Cookies.get("authToken");
          const date = dayjs(startDate).format("YYYY-MM-DD").toString();
          const endDate = dayjs(endDateInput).format("YYYY-MM-DD").toString();
          const data = {
            "category": category,
            "startDate": date,
            "endDate": endDate,
            "goalName": goalName,
            "amount": Math.abs(amount),
            "goal_id": editItem?.goalId
          };
      
          const response = await axios.patch(`${rootUrl}/api/goals`, data, {
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
      };
  
      const handleDeleteGoalItem = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try {
          const authToken = Cookies.get("authToken");
          const data = {
            "goal_id": editItem?.goalId
          };
      
          const response = await axios({
            method: 'delete',
            url: `${rootUrl}/api/goals`,
            data: data,
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (response.status === 200) {
            setUpdateGoalItems(true);
            setPostMsg("Successfully Deleted Goal");
            handleClose();
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
        <Fab
        color="primary"
        aria-label="add"
        size='large'
        className="goalFab"
        onClick={() => {handleOpen(); setEditItem(undefined)}}
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
        <Grid container justifyContent="center" alignItems="top" style={{ minHeight: '100vh' }}>
            <Grid item xs={12} sm={8} md={6} lg={5} xl={4}>
        <Box className={'modal'} sx={{bgcolor: theme.palette.secondary.main, width:'auto', position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IconButton
                size='large'
                onClick={handleClose}
              ><CloseIcon /></IconButton>
              <h2 className='pageTitle'>Start New Goal</h2>
              <div></div>
              </Box>
          <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              defaultValue={startDate}
              onChange={(newValue: Dayjs | null) => {
                setStartDate(newValue);
              }}
            />
          </LocalizationProvider>
          </FormControl>
          <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              key={endDateInput ? endDateInput.toString() : ''}
              label="End Date"
              value={endDateInput}
              onChange={(newValue: Dayjs | null) => {
                setEndDateInput(newValue);
              }}
            />
          </LocalizationProvider>

          </FormControl>
          <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
          <InputLabel htmlFor="outlined-adornment-description">Goal Name</InputLabel>
          <OutlinedInput
            id="outlined-adornment-description"
            label="Goal Name"
            type='text'
            value={goalName}
            onChange={(event) => setGoalName(event.target.value)}
          />
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
        {editItem ? (
          <>
        <Box display={'flex'} flexDirection={'row'}>        
          <Button variant="outlined" color="error" fullWidth sx={{ marginTop: 1, marginRight: 2}} onClick={handleDeleteGoalItem}>Delete</Button>
          <Button variant="contained" color="success" fullWidth sx={{ marginTop: 1}} onClick={handleUpdateGoalItem}>Update</Button>
        </Box>
        <Box display={'flex'} flexDirection={'row'} style={{width: '100%'}}>        
          <div style={{width:'100%', textAlign:'center'}}>
            <Typography>
              Unique Code: 
            </Typography>
            <Typography style={{fontWeight:'bold'}}>
              {editItem.uniqueCode}
            </Typography>
          </div>
        </Box>
        </>
      ) : (
        <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleAddGoalItem}>Add</Button>
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

  export default AddGoalItemModal