import React, { createContext, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "react-query";

const queryClient = new QueryClient();

import Dashboard from "./components/Dashboard";

export const AppContext = createContext();

const App = ({ vercelOptions }) => {
  const [validatedPaths, setValidatedPaths] = useState([]);

  const onUpdateValidatedPaths = (path) => {
    setValidatedPaths([...validatedPaths, path]);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider
        value={{
          settings: vercelOptions,
          validatedPaths,
          onUpdateValidatedPaths,
        }}
      >
        <div>
          <h2 className="app-title">Vercel App</h2>
          <hr />
          <Dashboard />
        </div>
        <ToastContainer />
      </AppContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
