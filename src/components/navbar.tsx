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
import { Logout } from '@mui/icons-material';

const drawerWidth = 240;

interface NavBarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const pages = [
  { name: 'Dashboard', destination: '/dashboard' },
  { name: 'Transactions', destination: '/transactions' },
  { name: 'Money Owed', destination: '/owed' },
];

const settings = [
  { name: 'Account', destination: '/account' },
  { name: 'Logout', destination: '/logout' },
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
    <div style={{ display: 'flex', overflow:'hidden'}}>
      <AppBar position="static" sx={{ zIndex: theme.zIndex.drawer + 1, overflow:'hidden' }}>
        <Container maxWidth={false}>
          <Toolbar>
            <AttachMoneyIcon
              sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}
            />
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: 'flex', md: 'none' },
                overflow:'hidden'
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
        open={leftDrawerOpen}
        onClose={() => handleToggleDrawer('left')}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          zIndex: theme.zIndex.drawer + 2,
          overflow:'hidden'
        }}
      >
        {/* Content for the Left Drawer */}
        <List>
          {pages.map((page) => (
            <ListItem
              key={page.name}
              onClick={() => {
                handleToggleDrawer('left');
                navigate(page.destination);
              }}
              button
            >
              <ListItemText primary={page.name} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {isLoggedIn && (
        <Drawer
          variant="temporary"
          anchor="right"
          open={rightDrawerOpen}
          onClose={() => handleToggleDrawer('right')}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            zIndex: theme.zIndex.drawer + 2,
          }}
        >
          <div style={{ padding: '16px' }}>
            <Typography variant="h5" gutterBottom>
              McNut Budgeting Settings
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
                      {/* You can replace the following icon with your desired Material-UI icon */}
                      <ListItemIcon>
                        {setting.name === 'Account' ? <AccountCircleIcon /> : <Logout />}
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
