import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/api";
import { logout } from "../services/api";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);


  useEffect(() => {
    getCurrentUser()
      .then((res) => setUser(res.data.user))
      .catch((err) => console.log(err));
  }, []);

  const handleLogout = async () => {
    try {
      await logout();

      // Remove access token from session
      sessionStorage.removeItem("accessToken");

      // Redirect to login
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      <h1 className="text-center text-3xl mt-10 ">🔥 Dashboard 🔥</h1>

      <div className="flex justify-center items-center p-5 bg-gray-100 mt-2">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          {user ? (
            <div>
              <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
                Welcome , {user.username}
              </h1>
              <h3 className="text-2xl font-bold mb-6 text-center ">
                Role : {user.role}
              </h3>
            </div>
          ) : (
            <p>Loading user info...</p>
          )}
        </div>
      </div>

      <div className="bg-green-300 p-1">
        <button type="button" onClick={handleLogout} className="text-black ">
          LOGOUT
        </button>
      </div>
    </>
  );
}
