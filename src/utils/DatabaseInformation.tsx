import axios from "axios";
import BalanceItem from "../types/BalanceItem";
import CategoryItem from "../types/CategoryItem";
import TransactionItem from "../types/Transaction";
import UserItem from "../types/UserItem";
import Cookies from "js-cookie";
import React from 'react';

interface DatabaseInformationProviderProps {
    children: React.ReactNode;
  }
  

const fetchTransactions = async () => {
    try {
      const authToken = Cookies.get('authToken');
      const response = await axios.get('/api/transactions', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status !== 200) {
        return null;
      }
      const formattedData = response.data.map((transaction: TransactionItem) => ({
        ...transaction,
        Date: new Date(transaction.Date),
      }));
      return formattedData;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  
  const fetchBalances = async () => {
    try {
      const authToken = Cookies.get('authToken');
      const response = await axios.get<BalanceItem[]>('/api/balances', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status !== 200) {
        return null;
      }
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  
  const fetchCategories = async () => {
    try {
      const authToken = Cookies.get('authToken');
      const response = await axios.get<CategoryItem[]>('/api/categories', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status !== 200) {
        return null;
      }
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  
  const fetchUser = async () => {
    try {
      const authToken = Cookies.get('authToken');
      const response = await axios.get<UserItem>('/api/login', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status !== 200) {
        return null;
      }
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

interface DatabaseInformation {
  transactions: TransactionItem[];
  balances: BalanceItem[];
  categories: CategoryItem[];
  user: UserItem;
}

let databaseInformation: DatabaseInformation | null = null;

export const getDatabaseInformation = async () => {
    try {
      const transactions = await fetchTransactions();
      const balances = await fetchBalances();
      const categories = await fetchCategories();
      const user = await fetchUser();
  
      if (balances && transactions && categories && user) {
        databaseInformation = {
          transactions,
          balances,
          categories,
          user,
        };
      } else {
        databaseInformation = null;
      }
    } catch (error) {
      console.log(error);
      databaseInformation = null;
    }
  
    return databaseInformation;
  };
  
export const setDatabaseInformation = (newDatabaseInformation: DatabaseInformation) => {
  databaseInformation = newDatabaseInformation;
};


// Create a context
export const DatabaseInformationContext = React.createContext<{
    databaseInformation: DatabaseInformation | null;
    setUpdateValues: React.Dispatch<React.SetStateAction<boolean>>;
  }>({
    databaseInformation: null,
    setUpdateValues: () => {},
  });
  
  // Create a provider component
  export const DatabaseInformationProvider = ({
    children,
  }: DatabaseInformationProviderProps) => {
    const [databaseInformation, setDatabaseInformation] = React.useState<
      DatabaseInformation | null
    >(null);
    const [updateValues, setUpdateValues] = React.useState(false);
  
    // Fetch the data when the provider is mounted or when updateValues changes
    React.useEffect(() => {
      const fetchData = async () => {
        const data = await getDatabaseInformation();
        setDatabaseInformation(data);
        setUpdateValues(false);
      };
      fetchData();
    }, [updateValues]);
  
    // Provide the databaseInformation state and the setUpdateValues function to child components
    return (
      <DatabaseInformationContext.Provider
        value={{ databaseInformation, setUpdateValues }}
      >
        {children}
      </DatabaseInformationContext.Provider>
    );
  };
  


export {fetchBalances, fetchCategories, fetchTransactions, fetchUser}