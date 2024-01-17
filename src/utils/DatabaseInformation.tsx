import axios from "axios";
import BalanceItem from "../types/BalanceItem";
import CategoryItem from "../types/CategoryItem";
import TransactionItem from "../types/Transaction";
import UserItem from "../types/UserItem";
import Cookies from "js-cookie";
import React from 'react';
import OwedItem from "../types/OwedItem";
import GoalItem from "../types/GoalItem";

import TotalItem from "../types/TotalItem";
import FlagItem from "../types/FlagItem";
import RecurringTransactionItem from "../types/RecurringTransaction";

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
      return null;
    }
  };


  const fetchRecurringTransactions = async () => {
    try {
      const authToken = Cookies.get('authToken');
      const response = await axios.get(`${rootUrl}/api/recurring`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status !== 200) {
        return null;
      }
      const formattedData = response.data.map((recurringItem: RecurringTransactionItem) => ({
        ...recurringItem,
        Date: new Date(recurringItem.Date),
      }));
      return formattedData;
    } catch (error) {
      return null;
    }
  };
  
  const fetchBalances = async () => {
    try {
      const authToken = Cookies.get('authToken');
      const response = await axios.get<BalanceItem[]>(`${rootUrl}/api/balances`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const response2 = await axios.get<BalanceItem[]>(`${rootUrl}/api/filteredBalances`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status !== 200) {
        return null;
      }
      return [response.data, response2.data];
    } catch (error) {
      return null;
    }
  };

  const fetchCustomBalances = async () => {
    try {
      const authToken = Cookies.get('authToken');
      const response = await axios.get<TotalItem[]>(`${rootUrl}/api/customBalances`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status !== 200) {
        return null;
      }
      return response.data;
    } catch (error) {
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
      return null;
    }
  };
  
  const fetchGoalItems = async () => {
    try {
      const authToken = Cookies.get('authToken');
      const response = await axios.get<GoalItem[]>(`${rootUrl}/api/goals`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status !== 200) {
        return null;
      }
      return response.data;
      
    } catch (error) {
      return null;
    }
  };


  const fetchFlagItems = async () => {
    try {
      const authToken = Cookies.get('authToken');
      const response = await axios.get<FlagItem[]>(`${rootUrl}/api/flags`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status !== 200) {
        return null;
      }
      return response.data;
      
    } catch (error) {
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
      return null;
    }
  };



export const getDatabaseInformation = async () => {
    try {
      const transactions = await fetchTransactions();
      const recurringTransactions = await fetchRecurringTransactions();
      const fetchBalancesResult = await fetchBalances();
      const categories = await fetchCategories();
      const user = await fetchUser();
      const owedItems = await fetchOwedItems();
      const goalItems = await fetchGoalItems();
      const flags = await fetchFlagItems();
      if (fetchBalancesResult !== null) {
        const [balances, filteredBalances, customBalances] = fetchBalancesResult;
        return {transactions,recurringTransactions,balances,filteredBalances, customBalances,categories,user,owedItems, goalItems, flags}
      } else {
          return []
      }


      
    } catch (error) {
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
  filteredBalances: BalanceItem[];
  customBalances: TotalItem[];
  transactions: TransactionItem[];
  recurringTransactions: RecurringTransactionItem[];
  owedItems: OwedItem[];
  goalItems: GoalItem[];
  flagItems: FlagItem[];
  user: UserItem;
  count: number;

  setUpdateCount: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateValues: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateCategories: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateBalances: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateTransactions: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateRecTransactions: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateOwedItems: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateGoalItems: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateUser: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateFlags: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  categories: [],
  balances: [], // Initialize it as an empty array
  filteredBalances: [],
  customBalances: [],
  transactions: [],
  recurringTransactions: [],
  owedItems: [],
  goalItems: [],
  flagItems: [],
  user: emptyUserItem,
  count: 0,

  setUpdateCount: () => {},
  setUpdateValues: () => {},
  setUpdateCategories: () => {},
  setUpdateBalances: () => {},
  setUpdateTransactions: () => {},
  setUpdateRecTransactions: () => {},
  setUpdateOwedItems: () => {},
  setUpdateGoalItems: () => {},
  setUpdateUser: () => {},
  setUpdateFlags: () => {},
});

  
  // Create a provider component
  export const DatabaseInformationProvider = ({
    children,
  }: DatabaseInformationProviderProps) => {
    const [categories, setCategories] = React.useState<CategoryItem[]>([]);
    const [balances, setBalances] = React.useState<BalanceItem[]>([]);
    const [filteredBalances, setFilteredBalances] = React.useState<BalanceItem[]>([]);
    const [customBalances, setCustomBalances] = React.useState<TotalItem[]>([]);

    const [transactions, setTransactions] = React.useState<TransactionItem[]>([]);
    const [recurringTransactions, setRecTransactions] = React.useState<RecurringTransactionItem[]>([]);

    const [owedItems, setOwedItems] = React.useState<OwedItem[]>([]);
    const [goalItems, setGoalItems] = React.useState<GoalItem[]>([]);
    const [flagItems, setFlagItems] = React.useState<FlagItem[]>([]);


    const [count, setCount] = React.useState(0);

    const [updateCount, setUpdateCount] = React.useState(false);


    const [user, setUser] = React.useState<UserItem>(emptyUserItem);
    const [updateValues, setUpdateValues] = React.useState(false);
    const [updateCategories, setUpdateCategories] = React.useState(false);
    const [updateBalances, setUpdateBalances] = React.useState(false);
    const [updateTransactions, setUpdateTransactions] = React.useState(false);
    const [updateRecTransactions, setUpdateRecTransactions] = React.useState(false);

    const [updateOwedItems, setUpdateOwedItems] = React.useState(false);
    const [updateGoalItems, setUpdateGoalItems] = React.useState(false);
    const [updateUser, setUpdateUser] = React.useState(false);
    const [updateFlags, setUpdateFlags] = React.useState(false);

  
    // Fetch the data when the provider is mounted or when updateValues changes
    React.useEffect(() => {
      const fetchData = async () => {
        if (updateValues) {
          const data = await getDatabaseInformation();
          setUpdateValues(false);
          if (!Array.isArray(data)) {
            setTransactions(data.transactions?? []);
            setRecTransactions(data.recurringTransactions?? []);
            setCategories(data.categories?? []);
            setBalances(data.balances?? []);
            setUser(data.user?? emptyUserItem);
            setOwedItems(data.owedItems?? []);
            setGoalItems(data.goalItems?? []);
            setFlagItems(data.flags?? []);
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
      if (updateCount) {
        console.log('Changed')
        setCount(count + 1);
        setUpdateCount(false);
      }
    }, [updateCount, count]);


    React.useEffect(() => {
      const fetchData = async () => {
        if (updateBalances) {
        const data = await fetchBalances();
        const customBalancesData = await fetchCustomBalances();
        if (data && customBalancesData) {
          const [newBalances, newFilBalances] = data;
          setBalances(newBalances);
          setFilteredBalances(newFilBalances);
          setCustomBalances(customBalancesData)
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
        if (updateRecTransactions) {
        const data = await fetchRecurringTransactions();
        if (data) {
          setRecTransactions(data);
        }
        setUpdateRecTransactions(false);
      }
      };
      fetchData();
    }, [updateRecTransactions]);

    React.useEffect(() => {
      const fetchData = async () => {
        if (updateFlags) {
        const data = await fetchFlagItems();
        if (data) {
          setFlagItems(data);
        }
        setUpdateFlags(false);
      }
      };
      fetchData();
    }, [updateFlags]);


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
        const data = await fetchGoalItems();
        if (data) {
          setGoalItems(data);
        }
        setUpdateGoalItems(false);
      };
      if (updateGoalItems) {
        fetchData();
      }
    }, [updateGoalItems]);
    

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
        value={{ categories, balances, filteredBalances, customBalances, transactions, recurringTransactions, owedItems, goalItems, user,count, flagItems, setUpdateFlags, setUpdateCount, setUpdateValues, setUpdateCategories, setUpdateBalances, setUpdateTransactions, setUpdateRecTransactions, setUpdateOwedItems, setUpdateGoalItems, setUpdateUser }}
      >
        {children}
      </DatabaseInformationContext.Provider>
    );
  };
  


export {fetchBalances, fetchCategories, fetchTransactions, fetchUser, fetchGoalItems, fetchFlagItems}