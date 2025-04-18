import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
const Login = () => {

    const [user, setUser] = useState({
        email: "",
        password: ""
    });

    const handleInput = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        setUser({
            ...user,
            [name]: value,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(user);
    }

    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword); // Toggle the showPassword state
    };

    const handleLogin = () => {
        <Navigate to={'/recon'} />
    }
    return (
        <form onSubmit={handleSubmit}>
            <div className='border-2 rounded-lg text-center w-1/3 mx-auto bg-yellow-100 m-80 p-2'>
                <h1 className='text-5xl font-medium text-amber-300'>Login to Dashboard</h1>
                <div className="mt-8 p-6">
                    <label className='text-xl text-amber-300'>E-mail :</label>
                    <input className='ml-5 p-1 w-1/2 rounded-lg' type='email' name='email' value={user.email} onChange={handleInput} placeholder='enter your mail'></input>
                </div>
                <div className="p-1">
                    <label className='text-xl text-amber-300'>Password :</label> 
                    <input className='ml-5 p-1 w-1/2 rounded-lg' type={showPassword ? 'text' : 'password'} name='password' value={user.password} onChange={handleInput} placeholder='enter your password'></input>
                    {/* Eye Icon */}
                    <span
                        onClick={togglePasswordVisibility}
                        className="relative left-3/4 bottom-6 cursor-pointer"
                    >               
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                <div className='p-5'>
                    <Link to='/recon'><button className='text-2xl font-bold rounded-lg border-amber-600  hover:bg-white border-2 text-amber-300 p-1 mt5 w-36' onClick={handleLogin}>Login</button></Link>
                </div>
            </div>
        </form>
    )
}

export default Login
