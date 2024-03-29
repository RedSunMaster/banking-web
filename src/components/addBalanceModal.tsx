import { Modal, Fade, Box, FormControl, InputLabel, OutlinedInput, Button, useTheme, Grid, IconButton, Tooltip } from "@mui/material";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import React from "react";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CategoryItem from "../types/CategoryItem";
import CloseIcon from '@mui/icons-material/Close';


interface AddCategoryModalProps {
  categories: CategoryItem[]
  setUpdateBalances: (value: boolean) => void;
  setOpenAlert: (value: boolean) => void;
  setPostMsg: (value: string) => void;
  open: boolean;
  handleOpenCategory: () => void;
  handleCloseCategory: () => void;
}



export const AddBalanceModal = ({categories, setUpdateBalances, setOpenAlert, setPostMsg,open, handleOpenCategory, handleCloseCategory}: AddCategoryModalProps) => {
    const [balanceName, setBalanceName] = React.useState('')     

    const theme = useTheme();
    const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""

    const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);

    const handleChange = (event: SelectChangeEvent<number[]>) => {
      const value = event.target.value as unknown as number[];
      setSelectedCategories(value);
    };
    

    const handleAddBalance = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        const authToken = Cookies.get("authToken");
        const data = {
          "balanceName": balanceName,
          "categoryIds": selectedCategories,
        };
    
        const response = await axios.post(`${rootUrl}/api/customBalances`, data, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Successfully Added Balance");
          setUpdateBalances(true);
        } else {
          setPostMsg("Error" + response.data);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          // Handle Axios error
          const responseData = error.response?.data;
          setPostMsg("Error: " + responseData)
        }
      }
      setOpenAlert(true);
    };

    return (
      <>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        disableScrollLock={true}
        onClose={handleCloseCategory}
        closeAfterTransition
        sx={{ 
          alignContent: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >

          <Fade in={open}>
          <Grid container justifyContent="center" alignItems="top" style={{ minHeight: '100vh' }}>
            <Grid item xs={12} sm={8} md={6} lg={5} xl={4}>
        <Box className={'modal'} sx={{bgcolor: theme.palette.secondary.main, width:'auto', position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tooltip title="Close">
              <IconButton
                  size='large'  
                  onClick={handleCloseCategory}
              >
                  <CloseIcon />
              </IconButton></Tooltip>

              <h2 className='pageTitle'>Add Custom Balance</h2>
              <div></div>
              </Box>
              <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-description">Custom Balance Name</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-description"
                  label="Custom Balance Name"
                  type='text'
                  value={balanceName}
                  onChange={(event) => setBalanceName(event.target.value)} />
              </FormControl>
              <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
                <InputLabel id="demo-multiple-name-label">Categories</InputLabel>
                <Select
                  labelId="demo-multiple-name-label"
                  id="demo-multiple-name"
                  multiple
                  value={selectedCategories}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.categoryId} value={Number(category.categoryId)}>
                      {category.categoryName}
                      {selectedCategories.includes(category.categoryId)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="outlined" fullWidth sx={{ marginTop: 1 }} onClick={handleAddBalance}>Add</Button>
            </Box>
              </Grid>
              </Grid>
          </Fade>
        </Modal>
        </>
    )
}





export default AddBalanceModal