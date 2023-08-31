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
import { useNavigate } from 'react-router-dom';
import checkIsLoggedIn from '../auth/auth';
import axios from 'axios';
import {fetchBalances, fetchCategories, fetchTransactions, fetchUser} from '../utils/DatabaseInformation';

const emptyUserItem: UserItem = {
  fName: "",
  lName: "",
  authToken: "",
  userId: 0,
  email: "",
  phone: "",
};

export const Dashboard = () => {
  const [DatabaseInformation, setDatabaseInformation] = React.useState<{
    transactions: TransactionItem[];
    balances: BalanceItem[];
    categories: CategoryItem[];
    user: UserItem;
  }>({
    transactions: [],
    balances: [],
    categories: [],
    user: emptyUserItem,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const transactions = await fetchTransactions();
      const balances = await fetchBalances();
      const categories = await fetchCategories();
      const user = await fetchUser();
  
      if (balances && transactions && categories && user) {
        setDatabaseInformation({
          transactions,
          balances,
          categories,
          user,
        });
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',]
  const oneDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  const dayOfWeek = today.getDay() || 7; // getDay returns 0 for Sunday, so we use 7 instead
  const startOfWeek = new Date(today.getTime() - (dayOfWeek - 1) * oneDay);
  const startOfLastWeek = new Date(startOfWeek.getTime() - 7 * oneDay);
  
  
  const filteredTransactions = DatabaseInformation.transactions.filter(
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
  
  const pieChartData = {
    series: [
      {
        data: DatabaseInformation.balances.sort((a, b) => a.Amount - b.Amount).map((balance) => ({
          id: balance.Category,
          value: balance.Amount,
          color: balance.Colour,
          label: balance.Category
        })),
        innerRadius: 75,
        outerRadius: 150,
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

    const categories = DatabaseInformation.categories;

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

    console.log(barSeries)
    
    const lineSeries = monthlySums.map(({ year, sums }) => ({
      data: sums,
      label: year
    }));
    

    const totalBalance = DatabaseInformation.balances.reduce(
      (sum, balance) => sum + balance.Amount,
      0
    );
    const moneySpentCurrentWeek = groupedWeekTransactions['This Week'].reduce(
      (sum, transaction) => sum + Math.abs(transaction.Amount),
      0
    );



    return (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 8, md: 12 }}>
          <Grid container direction="column" xs={2} sm={8} md={12}>
            <Typography variant="h5" style={{ fontWeight: 'bold' }}>
              Welcome Back {DatabaseInformation.user.fName} <br/>
            </Typography>
            <Typography variant="h4">
              <b style={{color: 'darkgreen',border: '4px solid lightgreen', borderRadius: '10px', padding: '5px', float: 'right', backgroundColor: 'lightgreen'}}>${totalBalance.toFixed(2)}</b>
            </Typography>
            <Typography variant="subtitle1">
              Current Week Spending ${moneySpentCurrentWeek.toFixed(2)}  
            </Typography>
          </Grid>

          <Grid xs={2} sm={4} md={4}>
            <Card elevation={4}>
              <CardContent>
                  <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                    Balances Distribution
                  </Typography>
                  <PieChart 
                    series={pieChartData.series} 
                    height={300} 
                    width={500} 
                    />
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={4} md={4}>
            <Card elevation={4}>
              <CardContent>
                  <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                    Monthly Spending
                  </Typography>
                <LineChart
                  series={lineSeries}
                  height={300}
                  width={500}
                  xAxis={[{
                    data: months,
                    scaleType: 'band',

                  }]}
                   ></LineChart>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={4} md={4}>
          <Card elevation={4}>
          <CardContent>
              <Typography style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center' }}>
                Weekly Spending Comparison
              </Typography>
              <BarChart width={600} height={300} series={barSeries}
                xAxis={[
                  {
                    data: categories.map((category) => category.categoryName.slice(0, 5)),
                    scaleType: 'band',
                    position: 'bottom',
                    label: 'Category',
                  },
                ]}
              />
            </CardContent>
          </Card>

          </Grid>
        </Grid>
      </Box>
    );    
};
