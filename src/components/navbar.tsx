import * as React from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  ListItemIcon,
  ListItemButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { createStyles, makeStyles, Theme, useTheme } from '@mui/material/styles'; // Correct import here
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SavingsIcon from '@mui/icons-material/Savings';

const drawerWidth = 240;

interface NavBarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const pages = [
  { name: 'Dashboard', destination: '/dashboard', icon: <DashboardIcon /> },
  { name: 'Transactions', destination: '/transactions', icon: <AddShoppingCartIcon /> },
  { name: 'Money Owed', destination: '/owed', icon: <ReceiptLongIcon /> },
  { name: 'Budget', destination: '/budget', icon: <SavingsIcon /> },
];

const settings = [
  { name: 'Account', destination: '/account', icon: <AccountCircleIcon /> },
  { name: 'Logout', destination: '/logout', icon: <LogoutIcon /> },
];

function NavBar({ isLoggedIn, setIsLoggedIn }: NavBarProps) {
  const theme = useTheme(); // This line automatically gets the current theme object

  const navigate = useNavigate();

  const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = React.useState(false);

  const handleToggleDrawer = (drawer: 'left' | 'right') => {
    if (drawer === 'left') {
      setLeftDrawerOpen(!leftDrawerOpen);
    } else if (drawer === 'right') {
      setRightDrawerOpen(!rightDrawerOpen);
    }
  };
  

  const logoutUser = async () => {
    try {
      const authToken = Cookies.get('authToken');
      await axios.post('/api/logout', null, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      Cookies.remove('authToken');
      setIsLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ display: 'flex'}}>
      <AppBar position="static" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Container maxWidth={false}>
          <Toolbar>
            <AttachMoneyIcon
              sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}
            />
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: 'flex', md: 'none' },
              }}
            >
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={() => handleToggleDrawer('left')} // Open the left drawer
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              {/* Your app title */}
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page.name}
                  onClick={() => {
                    navigate(page.destination);
                  }}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page.name}
                </Button>
              ))}
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <Avatar
                alt="Remy Sharp"
                src="/static/images/avatar/2.jpg"
                onClick={() => handleToggleDrawer('right')} // Open the right drawer
              />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
            <Drawer
        variant="temporary"
        anchor="left"
        className='test'
        open={leftDrawerOpen}
        disableScrollLock={ true }
        onClose={() => handleToggleDrawer('left')}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          zIndex: theme.zIndex.drawer + 2,
        }}
      >
      <div style={{ padding: '16px' }}>
        <Typography variant="h5" gutterBottom>
          Navigation
        </Typography>
        <Divider />
        <List>
          {pages.map((page, index) => {
                return (
                  <div key={page.name}>
                    {index !== 0 && <Divider />} {/* Add a divider if not the first item */}
                    <ListItemButton>
                    <ListItem
                      onClick={() => {
                        handleToggleDrawer('left');
                        navigate(page.destination)
                      } }
                    >
                      {/* You can replace the following icon with your desired Material-UI icon */}
                      <ListItemIcon>
                        {page.icon}
                      </ListItemIcon>
                      <ListItemText primary={page.name} />
                    </ListItem>
                    </ListItemButton>
                  </div>
                );
              })}
        </List>
        </div>
      </Drawer>

      {isLoggedIn && (
        <Drawer
          variant="temporary"
          anchor="right"
          open={rightDrawerOpen}
          className='test'
          disableScrollLock={ true }
          onClose={() => handleToggleDrawer('right')}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            zIndex: theme.zIndex.drawer + 2,
          }}
        >
          <div style={{ padding: '16px' }}>
            <Typography variant="h5" gutterBottom>
              Settings
            </Typography>
            <Divider />
            <List>
              {settings.map((setting, index) => {
                return (
                  <div key={setting.name}>
                    {index !== 0 && <Divider />} {/* Add a divider if not the first item */}
                    <ListItemButton>
                    <ListItem
                      onClick={() => {
                        handleToggleDrawer('right');
                        if (setting.name === 'Logout') {
                          logoutUser();
                        } else {
                          navigate(setting.destination);
                        }
                      } }
                    >
                      <ListItemIcon>
                        {setting.icon}
                      </ListItemIcon>
                      <ListItemText primary={setting.name} />
                    </ListItem>
                    </ListItemButton>
                  </div>
                );
              })}
            </List>
          </div>
        </Drawer>

      )}
    </div>
  );
}

export default NavBar;
