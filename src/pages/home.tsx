import React, { useEffect } from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
import CardContent from '@mui/material/CardContent';
import Cookies from 'js-cookie';
import { PieChart, LineChart, BarChart, CurveType } from '@mui/x-charts';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import 'react-virtualized/styles.css'; // only needs to be imported once

export const Home = () => {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant='h3' sx={{textAlign: 'center'}}>
          Welcome to McNut Banking
        </Typography>
      </Box>
    );    
};
