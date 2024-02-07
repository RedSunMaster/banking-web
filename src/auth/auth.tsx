import Cookies from 'js-cookie';
import axios from 'axios';

async function checkIsLoggedIn(): Promise<boolean> {
    try {
      console.log("Here")
      const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""
      const authToken = Cookies.get('authToken');
      const response = await axios.get(`${rootUrl}/api/login`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.status === 200) {
        return true
      } else {
        localStorage.clear()
        return false
      }
    } catch (error) {
      localStorage.clear()
      return false
    }
  }

export default checkIsLoggedIn