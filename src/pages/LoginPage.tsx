import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';
// import { ChefHat } from 'lucide-react';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { setCurrentUser, setUserProfile } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Get Token
            const data = await api.login({ username: email, password }); // Using email as username for now or adjust backend
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);

            // 2. Fetch User Profile
            const user = await api.getMe();
            setCurrentUser(user);
            // Ideally backend returns profile data too, or we fetch it separately
            // For MVP assuming basic user data is enough

            navigate('/feed');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center px-6">
            <div className="text-center mb-8">
                {/* <ChefHat size={48} className="mx-auto text-brand-orange mb-2" /> */}
                <h1 className="text-3xl font-black text-brand-dark mb-1">Welcome Back</h1>
                <p className="text-gray-500 text-sm">Sign in to continue ordering</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-xs font-bold">{error}</div>}

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Username / Email</label>
                    <input
                        type="text"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-gray-50 p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                        placeholder="Enter your username"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-gray-50 p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="flex justify-end">
                    <button type="button" className="text-xs font-bold text-brand-orange">Forgot Password?</button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50"
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>

            <div className="mt-8 text-center text-xs font-medium text-gray-500">
                Don't have an account? <Link to="/signup" className="text-brand-orange font-bold">Sign Up</Link>
            </div>
        </div>
    );
};

export default LoginPage;
