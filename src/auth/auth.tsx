import Cookies from 'js-cookie';
import axios from 'axios';

async function checkIsLoggedIn(): Promise<boolean> {
    try {
      const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""
      const authToken = Cookies.get('authToken');
      const response = await axios.get(`${rootUrl}/api/login`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(response.status)
      if (response.status === 200) {
        console.log("YES")
        return true
      } else {
        return false
      }
    } catch (error) {
      return false
    }
  }

export default checkIsLoggedIn