import React, { useEffect } from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
import CardContent from '@mui/material/CardContent';
import Cookies from 'js-cookie';
import { PieChart, LineChart, BarChart, CurveType } from '@mui/x-charts';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import 'react-virtualized/styles.css'; // only needs to be imported once
import TransactionItem from '../types/Transaction';
import BalanceItem from '../types/BalanceItem';
import CategoryItem from '../types/CategoryItem';
import UserItem from '../types/UserItem';
import Marquee from "react-fast-marquee";
import Masonry from '@mui/lab/Masonry';
import { DatabaseInformationContext } from '../utils/DatabaseInformation';
import { List, ListItem, ListItemText } from '@mui/material';
import { AutoSizer } from 'react-virtualized';
import { useNavigate } from 'react-router-dom';





export const Dashboard = () => {

  const {databaseInformation, setUpdateValues} = React.useContext(DatabaseInformationContext);
  const navigate = useNavigate();





  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',]
  const oneDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  const dayOfWeek = today.getDay() || 7; // getDay returns 0 for Sunday, so we use 7 instead
  const startOfWeek = new Date(today.getTime() - (dayOfWeek - 1) * oneDay);
  const startOfLastWeek = new Date(startOfWeek.getTime() - 7 * oneDay);



    
  if (!databaseInformation) {
    return <div>Loading...</div>;
  }



  const filteredTransactions = databaseInformation.transactions.filter(
    (transaction) =>
      transaction.Amount < 0 &&
      !transaction.Description.includes("Balance") &&
      !transaction.Description.includes("Trans")
  );

  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const year = transaction.Date.getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(transaction);
    return acc;
  }, {} as Record<number, TransactionItem[]>);
  

  const groupedWeekTransactions = filteredTransactions.reduce((acc, transaction) => {
    if (transaction.Date >= startOfWeek) {
      if (!acc['This Week']) acc['This Week'] = [];
      acc['This Week'].push(transaction);
    } else if (transaction.Date >= startOfLastWeek) {
      if (!acc['Last Week']) acc['Last Week'] = [];
      acc['Last Week'].push(transaction);
    }
    return acc;
  }, {} as Record<string, TransactionItem[]>);

  const balances = [...databaseInformation.balances];
  
  const pieChartData = {
    series: [
      {
        data: balances.sort((a, b) => a.Amount - b.Amount).map((balance) => ({
          id: balance.Category,
          value: balance.Amount,
          color: balance.Colour,
          label: balance.Category
        })),
        innerRadius: 75,
        outerRadius: 125,
        paddingAngle: 5,
        cornerRadius: 5,
        startAngle: -180,
        endAngle: 180,
      },],
    };

    const monthlySums = Object.entries(groupedTransactions).map(([year, transactions]) => {
      const sums = transactions.reduce((acc, transaction) => {
        const month = transaction.Date.getMonth();
        acc[month] += transaction.Amount;
        return acc;
      }, Array.from({ length: 12 }, () => 0));
      return { year, sums: sums.map((sum) => Math.abs(Number(sum.toFixed(2)))) };
    });

    const categories = databaseInformation.categories;

    const weeklySums = Object.entries(groupedWeekTransactions).map(([week, transactions]) => {
      const sums = transactions.reduce((acc, transaction) => {
        const category = transaction.Category;
        if (!acc[category]) acc[category] = 0;
        acc[category] += transaction.Amount;
        return acc;
      }, {} as Record<string, number>);
      const orderedSums: { categoryName: string; sum: number }[] = [];
      categories.forEach((category) => {
        if (sums[category.categoryName]) {
          orderedSums.push({
            categoryName: category.categoryName,
            sum: Math.abs(Number(sums[category.categoryName].toFixed(2))),
          });
        } else {
          orderedSums.push({ categoryName: category.categoryName, sum: 0 });
        }
      });
      return { week, sums: orderedSums };
    });
    
    
  
    const barSeries = weeklySums.map(({ week, sums }) => ({
      data: sums.map((sum) => sum.sum),
      label: week
    }));

    
    const lineSeries = monthlySums.map(({ year, sums }) => ({
      data: sums,
      label: year
    }));
    

    const totalBalance = databaseInformation.balances.reduce(
      (sum, balance) => sum + balance.Amount,
      0
    );



    return (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 8, md: 12, lg: 16, xl: 20 }}>
          <Grid xs={2} sm={8} md={12} lg={16} xl={20}>
            <Card elevation={12} sx={{width:'100%', display:'flex', position:'relative', flexDirection: 'column'}}>
              <CardContent>
              <Grid container direction="column" width='100%'>
                  <Grid>
                  <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                    Welcome Back {databaseInformation.user.fName}
                  </Typography>
                  <Typography variant="h6">
                    Total Balance <b style={{color: 'green'}}>${totalBalance.toFixed(2)}</b>
                  </Typography>
                  </Grid>
                  <Grid>
                    <Marquee pauseOnHover={true} autoFill={true}>
                      <Typography variant='h5' alignItems='center'>
                      {databaseInformation.balances.map((balance) => (<b style={{lineHeight: '50px',border: '4px solid ' + balance.Colour + '40', borderRadius: '10px', padding: '5px', float: 'left', width:'150px', backgroundColor: balance.Colour + '40', textAlign: 'center'}}>${balance.Amount.toFixed(2)}</b>))}
                      </Typography>
                    </Marquee>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Masonry columns={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }} spacing={0}>
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
            <Card elevation={4} >
              <CardContent>
              <List sx={{width:'100%'}}>
                {databaseInformation.balances.map((balance) => (
                  <Box sx={{border: '4px solid ' + balance.Colour + '40', borderRadius: '10px', padding: '5px', backgroundColor: balance.Colour + '40', marginBottom:'5px'}}>
                  <ListItem
                          onClick={(event: React.MouseEvent<HTMLLIElement>) =>
                            navigate(`/transactions?category=${balance.Category}`)
                          }
                        >                      
                      <ListItemText primary={balance.Category.toUpperCase()}/>
                      <Box sx={{ flexGrow: 1 }} />
                      <Typography align="right" variant="body2">
                        {<b>${balance?.Amount}</b>}
                      </Typography>
                    </ListItem>
                  </Box>
                ))}
              </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
              <Card elevation={4} sx={{height:400}} >
                    <CardContent sx={{height:'100%'}}>
                  <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                    Balances Distribution
                  </Typography>
                  <AutoSizer>
                      {({height, width}) => (
                  <PieChart 
                    series={pieChartData.series} 
                    height={height} 
                    width={width} 
                    />)}
                    </AutoSizer>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
                <Card elevation={4} sx={{height:400}} >
                    <CardContent sx={{height:'100%'}}>
                  <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                    Monthly Spending
                  </Typography>
                  <AutoSizer>
                      {({height, width}) => (
                      <LineChart
                        series={lineSeries}
                        height={height-20}
                        width={width}
                        xAxis={[{
                          data: months,
                          scaleType: 'band',

                        }]}
                   ></LineChart> )}
                   </AutoSizer>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={4} md={4} lg={8} xl={6}>
          <Card elevation={4} sx={{height:400}} >
                    <CardContent sx={{height:'100%'}}>
              <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                Weekly Spending Comparison
              </Typography>
              <AutoSizer>
                      {({height, width}) => (
              <BarChart width={width} height={height-30} series={barSeries} 
                xAxis={[
                  {
                    data: categories.map((category) => category.categoryName.slice(0, 5)),
                    scaleType: 'band',
                    position: 'bottom',
                    label: 'Category',
                  },
                ]}
              />)}
              </AutoSizer>
            </CardContent>
          </Card>
          </Grid>
          </Masonry>
        </Grid>
      </Box>
    );    
};
