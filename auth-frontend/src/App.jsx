import { BrowserRouter as Router, Routes , Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import './app.css';
import Dashboard from './pages/Dashboard';
import PrivateRoute from "./components/PrivateRoutes";


function App() {
  return (

    <Router>
      <Routes>
        <Route path="/"  element={<Login />} ></Route>
        <Route path="/signup"  element={<Signup />} ></Route>
        
        <Route 
        path="/dashboard"  
        element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>} 
        >
        </Route>
        
      </Routes>
    </Router>

  );
}

export default App;
