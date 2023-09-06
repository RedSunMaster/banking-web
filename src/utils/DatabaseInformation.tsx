import axios from "axios";
import BalanceItem from "../types/BalanceItem";
import CategoryItem from "../types/CategoryItem";
import TransactionItem from "../types/Transaction";
import UserItem from "../types/UserItem";
import Cookies from "js-cookie";
import React from 'react';
import OwedItem from "../types/OwedItem";

interface DatabaseInformationProviderProps {
    children: React.ReactNode;
  }
  

  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""


const fetchTransactions = async () => {
    try {
      const authToken = Cookies.get('authToken');
      const response = await axios.get(`${rootUrl}/api/transactions`, {
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
      const response = await axios.get<BalanceItem[]>(`${rootUrl}/api/balances`, {
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
      const response = await axios.get<CategoryItem[]>(`${rootUrl}/api/categories`, {
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

    
  const fetchOwedItems = async () => {
    try {
      const authToken = Cookies.get('authToken');
      const response = await axios.get<OwedItem[]>(`${rootUrl}/api/moneyOwed`, {
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
      const response = await axios.get<UserItem>(`${rootUrl}/api/login`, {
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



export const getDatabaseInformation = async () => {
    try {
      const transactions = await fetchTransactions();
      const balances = await fetchBalances();
      const categories = await fetchCategories();
      const user = await fetchUser();
      const owedItems = await fetchOwedItems();
      


      return {transactions,balances,categories,user,owedItems}
      
    } catch (error) {
      console.log(error);
    }
    return []
  };

  const emptyUserItem: UserItem = {
    fName: "",
    lName: "",
    authToken: "",
    userId: 0,
    email: "",
    phone: "",
  };

// Create a context
export const DatabaseInformationContext = React.createContext<{
  categories: CategoryItem[];
  balances: BalanceItem[]; // Update this line to specify it's an array of BalanceItem
  transactions: TransactionItem[];
  owedItems: OwedItem[];
  user: UserItem;

  setUpdateValues: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateCategories: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateBalances: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateTransactions: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateOwedItems: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateUser: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  categories: [],
  balances: [], // Initialize it as an empty array
  transactions: [],
  owedItems: [],
  user: emptyUserItem,
  setUpdateValues: () => {},
  setUpdateCategories: () => {},
  setUpdateBalances: () => {},
  setUpdateTransactions: () => {},
  setUpdateOwedItems: () => {},
  setUpdateUser: () => {},
});

  
  // Create a provider component
  export const DatabaseInformationProvider = ({
    children,
  }: DatabaseInformationProviderProps) => {
    const [categories, setCategories] = React.useState<CategoryItem[]>([]);
    const [balances, setBalances] = React.useState<BalanceItem[]>([]);
    const [transactions, setTransactions] = React.useState<TransactionItem[]>([]);
    const [owedItems, setOwedItems] = React.useState<OwedItem[]>([]);
    const [user, setUser] = React.useState<UserItem>(emptyUserItem);

    const [updateValues, setUpdateValues] = React.useState(false);
    const [updateCategories, setUpdateCategories] = React.useState(false);
    const [updateBalances, setUpdateBalances] = React.useState(false);
    const [updateTransactions, setUpdateTransactions] = React.useState(false);
    const [updateOwedItems, setUpdateOwedItems] = React.useState(false);
    const [updateUser, setUpdateUser] = React.useState(false);

  
    // Fetch the data when the provider is mounted or when updateValues changes
    React.useEffect(() => {
      const fetchData = async () => {
        if (updateValues) {
          const data = await getDatabaseInformation();
          setUpdateValues(false);
          if (!Array.isArray(data)) {
            setTransactions(data.transactions?? []);
            setCategories(data.categories?? []);
            setBalances(data.balances?? []);
            setUser(data.user?? emptyUserItem);
            setOwedItems(data.owedItems?? []);
          }
      }
      };
      fetchData();
    }, [updateValues]);

    React.useEffect(() => {
      const fetchData = async () => {
        if (updateCategories) {
        const data = await fetchCategories();
        if (data) {
          setCategories(data);
        }
        setUpdateCategories(false);
      }
      };
      fetchData();
    }, [updateCategories]);

    React.useEffect(() => {
      const fetchData = async () => {
        if (updateBalances) {
        const data = await fetchBalances();
        if (data) {
          setBalances(data);
        }
        setUpdateBalances(false);
      }
      };
      fetchData();
    }, [updateBalances]);

    React.useEffect(() => {
      const fetchData = async () => {
        if (updateTransactions) {
        const data = await fetchTransactions();
        if (data) {
          setTransactions(data);
        }
        setUpdateTransactions(false);
      }
      };
      fetchData();
    }, [updateTransactions]);

    React.useEffect(() => {
      const fetchData = async () => {
        if (updateOwedItems) {
          const data = await fetchOwedItems();
          if (data) {
            setOwedItems(data);
          }
          setUpdateOwedItems(false);
      }
      };
      fetchData();
    }, [updateOwedItems]);

    React.useEffect(() => {
      const fetchData = async () => {
        if(updateUser) {
          const data = await fetchUser();
          if (data) {
            setUser(data);
          }
          setUpdateUser(false);
        }
      };
      fetchData();
    }, [updateUser]);



  
    // Provide the databaseInformation state and the setUpdateValues function to child components
    return (
      <DatabaseInformationContext.Provider
        value={{ categories, balances, transactions, owedItems, user, setUpdateValues, setUpdateCategories, setUpdateBalances, setUpdateTransactions, setUpdateOwedItems, setUpdateUser }}
      >
        {children}
      </DatabaseInformationContext.Provider>
    );
  };
  


export {fetchBalances, fetchCategories, fetchTransactions, fetchUser}