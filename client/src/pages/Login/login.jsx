import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
    const navigate = useNavigate();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(user);
        try {
            const response = await axios.post('http://localhost:8000/api/auth/login', user);
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(user),+
            // });
            // console.log("login form" ,response);
            if (response.status === 200) {
                // Save token/userId if needed
                const { token } = response.data;
                // Optionally store token in localStorage/sessionStorage
                localStorage.setItem('token', token);
                // alert("Login successful");
                toast.success('Login successful!');
                setUser({ email: "", password: "" });
                navigate('/recon');
            }
            else {
                toast.warning("Invalid email or password!");
                console.log("invalid credentials");
            }
        } catch (error) {
            console.log("Error response", error)
        }
    }

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // const handleLogin = () => {
    //     <Navigate to={'/recon'} />
    // }

    return (
        <form onSubmit={handleSubmit}>
            <div
                className="min-h-screen bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: "url('/bg-bg.jpg')" }}
            >
                <div className='border rounded-lg text-center w-1/3 bg-yellow-100 bg-opacity-90 p-5'>
                    <h1 className='text-5xl font-medium text-amber-300'>Login to Dashboard</h1>

                    <div className="mt-8 p-6">
                        <label className='text-xl text-amber-400'>E-mail :</label>
                        <input
                            className='ml-5 p-1 w-1/2 rounded-lg'
                            type='email'
                            name='email'
                            required
                            value={user.email}
                            onChange={handleInput}
                            placeholder='enter your mail'
                        />
                    </div>

                    <div className="p-1">
                        <label className='text-xl text-amber-300'>Password :</label>
                        <input
                            className='ml-5 p-1 w-[42%] rounded-lg'
                            type={showPassword ? 'text' : 'password'}
                            name='password'
                            required
                            value={user.password}
                            onChange={handleInput}
                            placeholder='enter your password'
                        />
                        <span
                            onClick={togglePasswordVisibility}
                            className="relative left-3/4 bottom-6 cursor-pointer"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <div className='p-5'>
                        <button
                            className='text-2xl font-bold rounded-lg border-amber-600 hover:bg-white border-2 text-amber-300 w-36'
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );

}

export default Login