import { useLocalStorage } from "../js/storage";

const Orders = ({ user }) => {
  const [orders, setOrders] = useLocalStorage("orders", []);
  const [selected, setSelected] = useLocalStorage("order", []);
  const defaultOrder = {
    id: orders.length + 1,
    name: `Orden #${orders.length + 1}`,
    items: [],
  };

  const handleNew = () => {
    setOrders((s) => [...s, defaultOrder]);
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className=" text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Ordenes de {user.name}
            </h1>
            {orders.map((o) =>
              o.id === selected.id ? <h3>{o.name}</h3> : <h3>{o.name}</h3>
            )}

            <button
              onClick={handleNew}
              className="dark:border-solid border rounded px-4 py-1 dark:border-gray-50  text-sm text-gray-900 dark:text-gray-50"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Orders;
