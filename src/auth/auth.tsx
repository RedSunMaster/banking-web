import Cookies from 'js-cookie';
import axios from 'axios';

async function checkIsLoggedIn(): Promise<boolean> {
    try {
      const authToken = Cookies.get('authToken');
      const response = await axios.get('/api/login', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(response.status)
      if (response.status === 200) {
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error(error);
      return false
    }
  }

export default checkIsLoggedIn