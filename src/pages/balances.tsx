import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  ResponsiveChartContainer,
  LinePlot,
  ChartsXAxis,
  ChartsYAxis,
  LineSeriesType,
} from '@mui/x-charts';
import { PieChart, LineChart, BarChart, CurveType } from '@mui/x-charts';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import 'react-virtualized/styles.css'; // only needs to be imported once
import TransactionItem from '../types/Transaction';
import { Height } from '@mui/icons-material';
import BalanceItem from '../types/BalanceItem';
import CategoryItem from '../types/CategoryItem';


interface BalanceProps {
  DatabaseInformation: {
    transactions: TransactionItem[];
    balances: BalanceItem[];
    categories: CategoryItem[];
  };
}

export const Balances = ({ DatabaseInformation}: BalanceProps) => {

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
  

  const oneDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  const dayOfWeek = today.getDay() || 7; // getDay returns 0 for Sunday, so we use 7 instead
  const startOfWeek = new Date(today.getTime() - (dayOfWeek - 1) * oneDay);
  const startOfLastWeek = new Date(startOfWeek.getTime() - 7 * oneDay);
  
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
        },
        
      ],
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
    
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',]

    
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 8, md: 12 }}>
          <Grid xs={2} sm={4} md={4}>
            <Card elevation={4}>
              <CardContent>
                <LineChart
                  series={lineSeries}
                  height={300}
                  width={500}

                   ></LineChart>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={4} md={4}>
            <Card elevation={4}>
              <CardContent>
                  <PieChart series={pieChartData.series} height={300} width={500} />
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={2} sm={4} md={4}>
            <Card elevation={4}>
              <CardContent>
                  {/* <BarChart width={500} height={300} series={barSeries} xAxis={[{data:categories, scaleType:'band'}]}/> */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );    
};
