import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Cookies from 'js-cookie'
import TransactionItem from '../types/Transaction';
import BalanceItem from '../types/BalanceItem';
import CategoryItem from '../types/CategoryItem';


  
  interface TransactionsProps {
    DatabaseInformation: {
      transactions: TransactionItem[];
      balances: BalanceItem[];
      categories: CategoryItem[];
    };
  }

  export const Transactions = ({ DatabaseInformation }: TransactionsProps) => {
  
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
        rows={DatabaseInformation.transactions}
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
