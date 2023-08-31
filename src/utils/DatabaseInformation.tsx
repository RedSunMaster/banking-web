import axios from "axios";
import BalanceItem from "../types/BalanceItem";
import CategoryItem from "../types/CategoryItem";
import TransactionItem from "../types/Transaction";
import UserItem from "../types/UserItem";
import Cookies from "js-cookie";


const fetchTransactions = async () => {
    const authToken = Cookies.get('authToken');
    const response = await axios.get('/api/transactions', {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    const formattedData = response.data.map((transaction: TransactionItem) => ({
        ...transaction,
        Date: new Date(transaction.Date),
    }));
    return formattedData
};

const fetchBalances = async () => {
    try {
        const authToken = Cookies.get('authToken');
        console.log(authToken);
        const response = await axios.get<BalanceItem[]>('/api/balances', {
        headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data
    } catch (error) {
        console.error(error);
    }
};

const fetchCategories = async () => {
    try {
        const authToken = Cookies.get('authToken');
        console.log(authToken);
        const response = await axios.get<CategoryItem[]>('/api/categories', {
        headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data
    } catch (error) {
        console.error(error);
    }
};

const fetchUser = async () => {
    try {
        const authToken = Cookies.get('authToken');
        console.log(authToken);
        const response = await axios.get<UserItem>('/api/login', {
        headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data
    } catch (error) {
        console.error(error);
    }
};    

export {fetchBalances, fetchCategories, fetchTransactions, fetchUser}