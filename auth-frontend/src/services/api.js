import axios from "axios";

// ✅ 1. Axios instance banana
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // cookies ke liye
});

// ✅ 2. Request Interceptor – har request ke sath token bhejna
API.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (err) => Promise.reject(err)
);

// ✅ 3. Response Interceptor – token expire ho toh refresh karke retry
API.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;

        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/auth/refresh`,
                    { withCredentials: true }
                );

                const newAccessToken = res.data.accessToken;

                // ✅ Naya token sessionStorage me save karo
                sessionStorage.setItem("accessToken", newAccessToken);

                // ✅ Pehli request ko dubara bhejo with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            } catch (refreshErr) {
                console.error("Refresh token failed", refreshErr);
                // Optional: force logout or redirect
            }
        }

        return Promise.reject(err);
    }
);

// ✅ 4. API functions – sab API call ab isi instance se honge
export const signup = async (data) => {
    return await API.post('/auth/signup', data);
};

export const login = async (data) => {
    return await API.post('/auth/login', data);
};

export const getCurrentUser = async () => {
    return await API.get('/auth/me');
};

export const logout = async () => {
    return await API.post('/auth/logout');
};

export default API;
