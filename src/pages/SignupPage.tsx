import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone_number: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.signup(formData);
            // Auto login or redirect to login? Let's redirect to login for simplicity
            alert('Account created! Please sign in.');
            navigate('/login');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center px-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-brand-dark mb-1">Create Account</h1>
                <p className="text-gray-500 text-sm">Join FastEat today</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-xs font-bold">{error}</div>}

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Username</label>
                    <input
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full bg-gray-50 p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-gray-50 p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                    <input
                        name="phone_number"
                        type="tel"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="w-full bg-gray-50 p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                    <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-gray-50 p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50"
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <div className="mt-8 text-center text-xs font-medium text-gray-500">
                Already have an account? <Link to="/login" className="text-brand-orange font-bold">Sign In</Link>
            </div>
        </div>
    );
};

export default SignupPage;
