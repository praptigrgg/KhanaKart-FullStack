import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await axios.post('http://localhost:8000/api/forgot-password', { email });

            setMessage(res.data.message);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Something went wrong !!');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-6">
                    <Mail className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                    <h1 className="text-xl font-bold">Forgot Password</h1>
                    <p className="text-gray-600 mt-1">Enter your email to reset your password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="email"
                        placeholder="Your email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                {message && <p className="text-center text-sm text-gray-700 mt-4">{message}</p>}

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                        Back to Login
                    </Link>
                </div>
                <footer className="mt-8 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} KhanaKart.🍽️ All rights reserved.
                </footer>
            </div>
        </div>
    );
};

export default ForgotPassword;
