const Logout = ({ setAuth }) => {
  return (
    <button
      onClick={() => setAuth(false)}
      className="text-gray-900 dark:text-gray-50 absolute botom-4 right-4"
    >
      Salir
    </button>
  );
};
export default Logout;
