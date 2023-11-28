import { Modal, Fade, Box, FormControl, InputLabel, OutlinedInput, Button, Fab, useTheme, Grid, IconButton } from "@mui/material";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import React from "react";
import { SwatchesPicker } from "react-color";
import CategoryIcon from '@mui/icons-material/Category';
import CloseIcon from '@mui/icons-material/Close';
import Joyride, { CallBackProps, STATUS } from "react-joyride";


interface AddCategoryModalProps {
  setUpdateCategories: (value: boolean) => void;
  setUpdateBalances: (value: boolean) => void;
  setOpenAlert: (value: boolean) => void;
  setPostMsg: (value: string) => void;
  openCategory: boolean;
  handleOpenCategory: () => void;
  handleCloseCategory: () => void;
}



export const AddCategoryModal = ({setUpdateCategories, setUpdateBalances, setOpenAlert, handleOpenCategory, handleCloseCategory, openCategory, setPostMsg}: AddCategoryModalProps) => {
    const [colour, setColour] = React.useState('')
    const [categoryName, setCategoryName] = React.useState('') 


    const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""



    const handleAddCategory = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        const authToken = Cookies.get("authToken");
        const data = {
          "categoryName": categoryName,
          "colour": colour,
        };
    
        const response = await axios.post(`${rootUrl}/api/categories`, data, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Successfully Added Category");
          handleCloseCategory()
          setUpdateCategories(true);
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
    const theme = useTheme();
    return (
      <><Fab
        color="primary"
        aria-label="add_category"
        size='large'
        onClick={handleOpenCategory}
        className="categoryFab"
        sx={{ position: 'fixed', bottom: 32, right: 96 }}
      >
        <CategoryIcon />
      </Fab><Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openCategory}
        disableScrollLock={true}
        onClose={handleCloseCategory}
        closeAfterTransition
        sx={{ alignContent: 'center'}}
        className="categoryModal"
      >
          <Fade in={openCategory}>
          <Grid container justifyContent="center" alignItems="top" style={{ minHeight: '100vh' }}>
            <Grid item xs={12} sm={8} md={6} lg={5} xl={4}>
        <Box className={'modal'} sx={{bgcolor: theme.palette.secondary.main, width:'auto', position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IconButton
                size='large'
                onClick={handleCloseCategory}
              ><CloseIcon /></IconButton>
              <h2 className='pageTitle'>Add Category</h2>
              <div></div>
              </Box>
              <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined" className="categoryInput">
                <InputLabel htmlFor="outlined-adornment-description">Category Name</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-description"
                  label="Category Name"
                  type='text'
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)} />
              </FormControl>
              <FormControl fullWidth sx={{ marginTop: 1, display: 'flex', justifyContent: 'center' }} variant="outlined" className="categoryColourInput">                  
              <div style={{ margin:'auto', display: 'flex', justifyContent: 'center', height:250, width:'100%', backgroundColor: theme.palette.secondary.main }}>
                    <SwatchesPicker
                      width={2000}
                      height={250}
                      color={colour}
                      onChange={(color) => setColour(color.hex)}
                      styles={{
                        default : {
                          body: {
                            backgroundColor: theme.palette.secondary.main, 
                            boxShadow: '0',
                          },
                          picker: {
                            backgroundColor: theme.palette.secondary.main,
                            boxShadow: '0',
                          }
                        }
                      }}
                      colors={[
                        ['#c3362b','#dc3c31','#f44336', '#f5564a', '#f6695e', '#f77b72', '#f88e86', '#faa19b'],
                        ['#ba184f','#d21b59','#e91e63', '#eb3573', '#ed4b82', '#f06292', '#f278a1', '#f48fb1'],
                        ['#7d1f8d','#8c239e','#9c27b0', '#a63db8', '#b052c0', '#ba68c8', '#c47dd0', '#ce93d8'],
                        ['#522e92','#5d34a5','#673ab7', '#764ebe', '#8561c5', '#9575cd', '#a489d4', '#b39ddb'],
                        ['#324191','#3949a3','#3f51b5', '#5262bc', '#6574c4', '#7985cb', '#8c97d3', '#9fa8da'],
                        ['#1a78c2','#1e87db','#2196f3', '#37a1f4', '#4dabf5', '#64b6f7', '#7ac0f8', '#90cbf9'],
                        ['#0287c3','#0398dc','#03a9f4', '#1cb2f5', '#35baf6', '#4fc3f7', '#68cbf8', '#81d4fa'],
                        ['#0096aa','#00a9bf','#00bcd4', '#1ac3d8', '#33c9dd', '#4dd0e1', '#66d7e5', '#80deea'],
                        ['#00786d','#00877a','#009688', '#1aa194', '#33aba0', '#4db6ac', '#66c0b8', '#80cbc4'],
                        ['#3d8c40','#449e48','#4caf50', '#5eb762', '#70bf73', '#82c785', '#94cf96', '#a6d7a8'],
                        ['#6f9c3b','#7db043','#8bc34a', '#97c95c', '#a2cf6e', '#aed580', '#b9db92', '#c5e1a5'],
                        ['#a4b02e','#b9c633','#cddc39', '#d2e04d', '#d7e361', '#dce774', '#e1ea88', '#e6ee9c'],
                        ['#ccbc2f','#e6d435','#ffeb3b', '#ffed4f', '#ffef62', '#fff176', '#fff389', '#fff59d'],
                        ['#cc9a06','#e6ae06','#ffc107', '#ffc720', '#ffcd39', '#ffd451', '#ffda6a', '#ffe083'],
                        ['#cc7a00','#e68900','#ff9800', '#ffa21a', '#ffad33', '#ffb74d', '#ffc166', '#ffcc80'],
                        ['#cc461b','#e64e1f','#ff5722', '#ff6838', '#ff794e', '#ff8964', '#ff9a7a', '#ffab91'],
                        ['#61443a','#6d4d41','#795548', '#86665a', '#94776d', '#a1887f', '#af9991', '#bcaaa4']
                      ]}
                    />
                  </div>
              </FormControl>


              <Button variant="outlined" fullWidth sx={{ marginTop: 1 }} onClick={handleAddCategory}>Add</Button>
            </Box>
            </Grid>
            </Grid>
          </Fade>
        </Modal></>
    )
}





export default AddCategoryModal