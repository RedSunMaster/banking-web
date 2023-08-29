import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Cookies from 'js-cookie'


interface TransactionItem {
    transactionID: number;
    userId: number;
    Date: Date;
    Amount: number;
    Category: string;
    Description: string;
    Transaction: string;
  }
  

export const Transactions = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  
  useEffect(() => {
    const fetchTransactions = async () => {
        const authToken = Cookies.get('authToken');
        const response = await axios.get('/api/transactions', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const formattedData = response.data.map((transaction: TransactionItem) => ({
          ...transaction,
          Date: new Date(transaction.Date).toLocaleDateString(),
        }));
        setTransactions(formattedData);
      };      
    fetchTransactions();
  }, []);

  const columns: GridColDef[] = [
    { field: 'transactionID', headerName: 'ID', flex: 1 },
    { field: 'Date', headerName: 'Date', flex: 1 },
    { field: 'Amount', headerName: 'Amount', flex: 1, renderCell: (params) => `$${params.value}`},
    { field: 'Category', headerName: 'Category', flex: 1 },
    { field: 'Description', headerName: 'Description', flex: 1 },
  ];
  
  return (
    <>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
        getRowId={(row) => `${row.transactionID}`}
        rows={transactions}
        columns={columns}
        slots={{
            toolbar: GridToolbar,
        }}
        />

      </div>
    </>
  );
};

export default Transactions;
