import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Balance {
  Category: string;
  Amount: number;
  Colour: string;
}

export const Balances = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const authToken = Cookies.get('authToken');
        console.log(authToken);
        const response = await axios.get('/api/balances', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setBalances(response.data);
        setSelectedCategories(response.data.map((balance: Balance) => balance.Category));
      } catch (error) {
        console.error(error);
      }
    };
    fetchBalances();
  }, []);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const category = event.target.value;
    if (event.target.checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const filteredBalances = balances.filter(balance =>
    selectedCategories.includes(balance.Category)
  );

    filteredBalances.sort((a: Balance, b: Balance) => a.Amount - b.Amount)
  const data = {
    labels: filteredBalances.map(balance => balance.Category),
    datasets: [
      {
        data: filteredBalances.map(balance => balance.Amount),
        backgroundColor: filteredBalances.map(balance => balance.Colour),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    devicePixelRatio: 4,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  return (
    <div>
        <h2 className='pageTitle'>Balances</h2>
        <div className="parent-div" >
        <div style={{ flex: 1 }} >
            <ul>
            {balances.map(balance => (
                <div
                style={{
                    borderRadius: '15px',
                    background: `rgba(${parseInt(balance.Colour.slice(-6, -4), 16)}, ${parseInt(balance.Colour.slice(-4, -2), 16)}, ${parseInt(balance.Colour.slice(-2), 16)}, 0.4)`,
                }}
                >
                <li className="balanceList" key={balance.Category}>
                    {balance.Category}: ${balance.Amount}
                    <input
                    type="checkbox"
                    value={balance.Category}
                    checked={selectedCategories.includes(balance.Category)}
                    onChange={handleCategoryChange}
                />
                </li>
                </div>
            ))}
            </ul>
        </div>
        <div style={{ flex: 1 }} className='balanceChart'>
                <Doughnut data={data} options={options}  />;
        </div>
        </div>
    </div>
  );
};
