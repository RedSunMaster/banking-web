import { Modal, Fade, Box, FormControl, InputLabel, OutlinedInput, Button, Fab, useTheme, Grid, IconButton, Tooltip } from "@mui/material";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import React from "react";
import { SwatchesPicker } from "react-color";
import CategoryIcon from '@mui/icons-material/Category';
import CloseIcon from '@mui/icons-material/Close';
import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { FlagCircle } from "@mui/icons-material";
import FlagItem from "../types/FlagItem";


interface AddFlagModalProps {
  setUpdateFlags: (value: boolean) => void;
  setUpdateTransactions: (value: boolean) => void;
  setOpenAlert: (value: boolean) => void;
  setPostMsg: (value: string) => void;
  openFlag: boolean;
  handleOpenFlag: () => void;
  handleCloseFlag: () => void;
  chosenFlag?: FlagItem;
}



export const AddFlagModal = ({setUpdateFlags,setUpdateTransactions, setOpenAlert, handleOpenFlag, handleCloseFlag, openFlag, setPostMsg, chosenFlag}: AddFlagModalProps) => {
    const [colour, setColour] = React.useState('')
    const [flagName, setFlagName] = React.useState('') 

    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""

    React.useEffect(() => {
      if (chosenFlag) {
        setColour(chosenFlag?.flagColour)
        setFlagName(chosenFlag?.flagName)
      }
    }, [chosenFlag])


    const handleAddFlag = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        const authToken = Cookies.get("authToken");
        const data = {
          "flagName": flagName,
          "flagColour": colour,
        };
    
        const response = await axios.post(`${rootUrl}/api/flags`, data, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Successfully Added Category");
          handleCloseFlag()
          setUpdateFlags(true);
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


    const handleDeleteFlag = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (inputValue !== chosenFlag?.flagName) {
        alert('Incorrect Flag Name');
        handleClose()
        handleCloseFlag()
        setInputValue('')
        return;
      }
      try {
        const authToken = Cookies.get("authToken");
        const data = {
          "flagId": chosenFlag?.flagId
        };
    
        const response = await axios({
          method: 'delete',
          url: `${rootUrl}/api/flags`,
          data: data,
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Successfully Deleted Flag");
          setUpdateTransactions(true);
          setUpdateFlags(true);
          handleCloseFlag();
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
  
    const handleUpdateFlag = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        const authToken = Cookies.get("authToken");
        const data = {
          "flagId": chosenFlag?.flagId,
          "flagName": flagName,
          "flagColour": colour
        };
        const response = await axios.patch(`${rootUrl}/api/flags`, data, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setPostMsg("Successfully Updated Transaction");
          setUpdateFlags(true);
          handleCloseFlag()
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
      







    const theme = useTheme();
    return (
      <><Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openFlag}
        disableScrollLock={true}
        onClose={handleCloseFlag}
        closeAfterTransition
        sx={{ alignContent: 'center'}}
        className="categoryModal"
      >
          <Fade in={openFlag}>
          <Grid container justifyContent="center" alignItems="top" style={{ minHeight: '100vh' }}>
            <Grid item xs={12} sm={8} md={6} lg={5} xl={4}>
        <Box className={'modal'} sx={{bgcolor: theme.palette.secondary.main, width:'auto', position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tooltip title="Close">
              <IconButton
                size='large'
                onClick={handleCloseFlag}
              ><CloseIcon /></IconButton></Tooltip>
              <h2 className='pageTitle'>{chosenFlag? "Edit Flag" : "Add Flag"}</h2>
              <div></div>
              </Box>
              <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined" className="categoryInput">
                <InputLabel htmlFor="outlined-adornment-description">Flag Name</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-description"
                  label="Category Name"
                  type='text'
                  value={flagName}
                  onChange={(event) => setFlagName(event.target.value)} />
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


              {chosenFlag ? (
                <Box display={'flex'} flexDirection={'row'}>        
                  <Button variant="outlined" color="error" fullWidth sx={{ marginTop: 1, marginRight: 2}} onClick={handleOpen}>Delete</Button>   
                  <Modal
                    open={open} onClose={handleClose}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description">
                    <Box sx={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width:400, height:'100%', bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                        <h2>{}Deleting This Flag Could Remove Valuable Data{}</h2>
                        <p>Proceed With Caution - This CANNOT Be Reverted</p>
                        <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-amount">Confirm Flag Name</InputLabel>
                        <OutlinedInput value={inputValue} label={"Confirm Flag Name"} sx={{width:'100%'}} onChange={(e) => setInputValue(e.target.value)} />
                        </FormControl>
                        <br />
                        <Box display={'flex'} flexDirection={'row'}>
                        <Button variant="outlined" color="error" fullWidth sx={{ marginTop: 2}} onClick={handleDeleteFlag}>DELETE</Button>
                        <Button variant="contained" color="success" fullWidth sx={{ marginTop: 2}} onClick={handleClose}>Cancel</Button>
                        </Box>
                    </Box>
                  </Modal>  
                  <Button variant="contained" color="success" fullWidth sx={{ marginTop: 1}} onClick={handleUpdateFlag}>Update</Button>
                </Box>
              ) : (
                <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleAddFlag}>Add</Button>
              )
              }
            </Box>
            </Grid>
            </Grid>
          </Fade>
        </Modal></>
    )
}





export default AddFlagModal