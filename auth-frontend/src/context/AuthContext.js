// import {  createContext , useContext , useState } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({Children}) => {
//     const [authToken, setAuthToken] = useState(null);

//     return(
//         <AuthContext.Provider value={{ authToken , setAuthToken}}>
//             { Children }
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);