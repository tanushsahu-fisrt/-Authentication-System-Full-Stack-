import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/api';




export default function Signup() {

    const navigate = useNavigate()

    const [formData , setFormData] = useState({
        username: '',email : '',password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await signup(formData);
           
            if(res.data.accessToken){
              sessionStorage.setItem("accessToken",res.data.accessToken);
              navigate("/dashboard")
            }
        }
        catch(err){
            alert( err.response?.data?.message || 'error');
        }
    }

    return (
    <>
    
    <h1 className="text-center text-3xl mt-10">🔥 Welcome to Auth System 🔥</h1>

    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Signup</h2>
        
        <form onSubmit={e => handleSubmit(e)}>
          <input type="text"  name="username" placeholder="Username" className="w-full mb-4 p-2 border rounded" onChange={e => handleChange(e)}/>
          <input type="email" name='email' placeholder="Email" className="w-full mb-4 p-2 border rounded"    onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" className="w-full mb-4 p-2 border rounded" onChange={handleChange} />
          <button type='submit' className="w-full bg-green-600 text-white py-2 rounded">Signup</button>
        </form>

        <p className="mt-4 text-sm text-center">
          Already have an account? <Link to="/" className="text-green-500">Login</Link>
        </p>
      </div>
    </div>

    </>

  );
}
