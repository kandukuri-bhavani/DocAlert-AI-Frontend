import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AddDocument from "./components/AddDocument";
import EditDocument from "./components/EditDocument";
import UploadDocument from "./components/UploadDocument";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/add-document"
          element={<AddDocument />}
        />

        <Route
          path="/edit-document/:id"
          element={<EditDocument />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
        <Route
  path="/upload-document"
  element={<UploadDocument />}
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;