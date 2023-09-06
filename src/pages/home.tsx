import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
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
