import { useLocalStorage } from "./js/storage";
import Login from "./components/Login";
import Orders from "./components/Orders";
import Logout from "./components/Logout";

const App = () => {
  const [auth, setAuth] = useLocalStorage("auth", false);
  const [user, setUser] = useLocalStorage("user", {});

  return (
    <>
      {auth ? (
        <>
          <Orders user={user} />
          <Logout setAuth={setAuth} />
        </>
      ) : (
        <Login setAuth={setAuth} setUser={setUser} />
      )}
    </>
  );
};
export default App;
