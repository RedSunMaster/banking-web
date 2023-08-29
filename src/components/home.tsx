import { useNavigate } from 'react-router-dom';
import checkIsLoggedIn from '../auth/auth';
import * as React from 'react';


function Home() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const navigate = useNavigate();
    React.useEffect(() => {
    checkIsLoggedIn().then(setIsLoggedIn);
    }, []);

    React.useEffect(() => {
    if (isLoggedIn) {
        navigate('/balances');
    } else {
        navigate('/login');
    }
    }, [isLoggedIn]);

    return (
        <>
        </>
    )
}

export default Home