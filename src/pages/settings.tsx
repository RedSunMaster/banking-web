import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import 'react-virtualized/styles.css'; // only needs to be imported once
import Masonry from '@mui/lab/Masonry';
import { DatabaseInformationContext } from '../utils/DatabaseInformation';
import { Alert, IconButton, List, ListItem, ListItemText, Snackbar, Tooltip, useTheme } from '@mui/material';
import checkIsLoggedIn from '../auth/auth';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCategoryModal from '../components/addCategoryModal';
import AddFlagModal from '../components/addFlagModal';
import CategoryItem from '../types/CategoryItem';
import FlagItem from '../types/FlagItem';

export const Settings = () => {
  const { categories, balances, flagItems, setUpdateFlags, setUpdateCategories, setUpdateBalances, setUpdateTransactions} = React.useContext(DatabaseInformationContext);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [openCategory, setOpenCategory] = React.useState(false);

  const [editCategory, setEditCategory] = React.useState<CategoryItem>();
  const [editFlag, setEditFlag] = React.useState<FlagItem>();



  const handleOpenCategory = () => setOpenCategory(true);
  const handleCloseCategory = () => setOpenCategory(false);

  const [openFlag, setOpenFlag] = React.useState(false);

  const handleOpenFlag = () => setOpenFlag(true);
  const handleCloseFlag = () => setOpenFlag(false);

  const [postMsg, setPostMsg] = React.useState('')


  
  const theme = useTheme();

  const navigate = useNavigate()

  const onVisibilityChange = React.useCallback(() => {
    if (document.visibilityState === "visible") {
      checkIsLoggedIn().then((result) => {
        if (!result) {
          navigate('/login');
        }
      });
    }
  }, [navigate]); // Include all dependencies that the function relies on
  


  React.useLayoutEffect(() => {
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [onVisibilityChange]);

  React.useEffect(() => {
    checkIsLoggedIn().then((result) => {
      if (!result) {
          navigate('/login')
      }
    })
    if (categories.length === 0) {
        setUpdateCategories(true);
    }
    if (flagItems.length === 0) {
      setUpdateFlags(true)
    }
  }, [categories.length, flagItems.length, navigate, setUpdateCategories, setUpdateFlags]);


    
  
  const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  const handleSetCategory = (item: CategoryItem | undefined, callback: () => void) => {
    setEditCategory(item);
    callback();
  };

  const handleSetFlag = (item: FlagItem | undefined, callback: () => void) => {
    setEditFlag(item);
    callback();
  };

  


  

    return (
      <Box sx={{ flexGrow: 1 }}>
        <AddCategoryModal 
            setUpdateCategories={setUpdateCategories} 
            setUpdateBalances={setUpdateBalances} 
            setOpenAlert={setOpenAlert}
            setPostMsg={setPostMsg}
            openCategory={openCategory}
            handleCloseCategory={handleCloseCategory}
            handleOpenCategory={handleOpenCategory}
            chosenCategory={editCategory}
        />
        <AddFlagModal 
            setUpdateFlags={setUpdateFlags} 
            setUpdateTransactions={setUpdateTransactions}
            setOpenAlert={setOpenAlert}
            setPostMsg={setPostMsg}
            openFlag={openFlag}
            handleCloseFlag={handleCloseFlag}
            handleOpenFlag={handleOpenFlag}
            chosenFlag={editFlag}
        />
        <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
          {postMsg}
        </Alert>
        </Snackbar>
        {false ? (
            <CircularProgress sx={{zIndex:9999999999999999999}} />
          ) : categories.length === 0 && balances.length === 0 ? (
          // Display a message if there are no transactions
          <Box>
            <Typography variant='h4'>
              To Edit Flags and Categories, Please Create either one
            </Typography><br/>
            <Typography>
              Go back to create a category / transaction
            </Typography>
          </Box>
        ) : (
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 8, md: 12, lg: 16, xl: 20 }}>
          <Grid xs={2} sm={8} md={12} lg={16} xl={20}>
            <Card elevation={12} sx={{width:'100%', display:'flex', position:'relative', flexDirection: 'column'}}>
              <CardContent sx={{bgcolor: theme.palette.info.main}}>
              <Grid container direction="column" width='100%'>
                  <Grid>
                  <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                    Edit Categories / Flags
                  </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Masonry columns={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2 }} spacing={0}>
          <Grid xs={2} sm={4} md={6} lg={8} xl={10}>
            <Card elevation={4} >
              <CardContent sx={{bgcolor: theme.palette.info.main}}>
              <List sx={{width:'100%'}}>
              <h3>Categories</h3>
                {categories.map((category) => (
                  <Box sx={{border: '4px solid ' + category.colour + '40', borderRadius: '10px', padding: '5px', backgroundColor: category.colour + '40', marginBottom:'5px'}}>
                    <ListItem>                   
                      <ListItemText>{category.categoryName}</ListItemText>                   
                      <Box sx={{ flexGrow: 1 }} />
                      <Tooltip title="Edit Category">
                      <IconButton
                        size="medium"
                        aria-label="account of current user"
                        className='toggleDrawer'
                        onClick={() => {
                          handleSetCategory(category, handleOpenCategory)
                          }} // Open the left drawer
                        >
                        <EditIcon />
                      </IconButton>
                      </Tooltip>
                    </ListItem>
                  </Box>
                ))}
              </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={4} md={6} lg={8} xl={10}>
            <Card elevation={4} >
              <CardContent sx={{bgcolor: theme.palette.info.main}}>
              <List sx={{width:'100%'}}>
                <h3>Flags</h3>
                {flagItems.map((flag) => (
                  <Box sx={{border: '4px solid ' + flag.flagColour + '40', borderRadius: '10px', padding: '5px', backgroundColor: flag.flagColour + '40', marginBottom:'5px'}}>
                    <ListItem>      
                      <ListItemText>{flag.flagName}</ListItemText>                
                      <Box sx={{ flexGrow: 1 }} />
                      <Tooltip title="Edit Flag">
                      <IconButton
                        size="small"
                        aria-label="Edit Flag"
                        className='toggleDrawer'
                        onClick={() => {handleSetFlag(flag, handleOpenFlag)}} // Open the left drawer
                      >
                        <EditIcon />
                      </IconButton>
                      </Tooltip>
                    </ListItem>
                  </Box>
                ))}
              </List>
              </CardContent>
            </Card>
          </Grid>
          </Masonry>
        </Grid>
        )}
      </Box>
    );    
};


export default Settings;
