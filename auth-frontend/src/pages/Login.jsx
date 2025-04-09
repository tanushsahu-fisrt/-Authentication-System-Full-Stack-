import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function Login() {

    const navigate = useNavigate();
    const [formData,setFormData] = useState({
        email : '', password : ''
    })

    const handlechange = (e) => {
        setFormData({...formData, [e.target.name] : e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
      try{
        const res = await login(formData);
        if(res.data.accessToken){
          sessionStorage.setItem("accessToken",res.data.accessToken);
          navigate("/dashboard")
        }
      }
      catch(err){
        console.log(err,"something went wrong");
      }
    }

  return (
    <>
    <h1 className="text-center text-3xl mt-10">🔥 Welcome to Auth System 🔥</h1>


    <div className="flex justify-center items-center  min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login</h2>
        
        <form onSubmit={e => handleSubmit(e)}>
          <input type="email" name='email' placeholder="Email" className="w-full mb-4 p-2 border rounded" onChange={e => handlechange(e)} />
          <input type="password" name="password" placeholder="Password" className="w-full mb-4 p-2 border rounded" onChange={e => handlechange(e)}/>
          <button type='submit' className="w-full bg-blue-600 text-white py-2 rounded cursor: pointer">Login</button>
        </form>
        <p className="mt-4 text-sm text-center">
          Don’t have an account? <Link to="/signup" className="text-blue-500">Signup</Link>
        </p>
      </div>
    </div>

    </>
  );
}
