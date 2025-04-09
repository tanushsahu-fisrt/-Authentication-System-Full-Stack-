import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const  authToken = sessionStorage.getItem("accessToken");

    return authToken ? children : <Navigate  to="/" />;
};

export default PrivateRoute;