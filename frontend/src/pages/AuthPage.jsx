import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../api/apiService'; // Assuming you have this file and functions

// --- 1. Custom Success Toast Component ---
// This component displays a non-blocking success message in the bottom right corner.
const SuccessToast = ({ message, userName }) => {
    // Determine the icon and background color
    const icon = userName ? '🎉' : '✅';
    
    return (
        <div className="fixed bottom-6 right-6 z-50 p-4 w-full max-w-sm">
            <div className={`flex items-center p-4 rounded-xl shadow-2xl bg-green-100 border-2 border-green-400 transform transition duration-500 ease-out`}>
                <span className={`text-2xl mr-3`}>{icon}</span>
                <div>
                    <p className="font-bold text-green-800">Success!</p>
                    <p className="text-sm text-gray-700">{message}</p>
                </div>
            </div>
        </div>
    );
};


const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // State to manage the Success Toast visibility and content
    const [successMessage, setSuccessMessage] = useState(null); 
    const [successUser, setSuccessUser] = useState(null); 
    
    const navigate = useNavigate();

    // --- Toast Dismissal Logic ---
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                
                // After toast dismisses, finalize navigation/form switch
                if (isLogin) {
                    // Final step after successful login confirmation
                    navigate('/'); 
                } else {
                    // After successful registration, switch to login form
                    setIsLogin(true);
                }
            }, 3000); // Toast disappears after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [successMessage, isLogin, navigate]);


    // --- Client-Side Validation ---
    const validate = () => {
        if (!email || !password || (!isLogin && !name)) {
            setError("All fields are required.");
            return false;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return false;
        }
        setError('');
        return true;
    };

    // --- Combined API Submission Handler ---
    const handleAuthAction = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setError('');

        try {
            let response;
            if (isLogin) {
                response = await loginUser({ email, password });
            } else {
                response = await registerUser({ name, email, password });
            }

            // NOTE: Assuming your backend returns user data (e.g., id, name) on success
            const userData = response.data.user || { id: response.data.userId, name: name || 'User' };

            // Handle success based on action
            if (isLogin) {
                // SUCCESSFUL LOGIN: Set mock token and trigger toast
                localStorage.setItem('userToken', userData.id);
                setSuccessUser(userData.name);
                setSuccessMessage(`Welcome back, ${userData.name}! Redirecting...`);
            } else {
                // SUCCESSFUL REGISTRATION: Trigger toast
                setSuccessMessage('Registration successful! Switching to login.');
                // Note: The form switch happens via the useEffect hook after the toast timer runs out
            }

        } catch (err) {
            // Handle HTTP error response from Axios/Backend
            const message = err.response?.data?.message || err.message || "An unexpected error occurred.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // --- Styling Classes ---
    const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition duration-200";
    const buttonClasses = "w-full py-3 rounded-full text-white font-bold text-lg uppercase bg-gradient-to-br from-pink-600 to-red-500 shadow-lg shadow-pink-300 hover:shadow-xl transition duration-300";

    return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center font-sans">
            
            {/* Display Success Toast if successMessage is set */}
            {successMessage && (
                <SuccessToast 
                    message={successMessage} 
                    userName={successUser}
                />
            )}

            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 sm:p-10 border border-pink-100">
                
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-serif font-extrabold text-gray-900 hover:text-pink-600">E-shop</Link>
                    <h2 className="text-2xl font-bold text-gray-800 mt-4">
                        {isLogin ? 'Welcome Back!' : 'Create Your Account'}
                    </h2>
                    <p className="text-gray-500 text-sm">{isLogin ? 'Sign in to access your cart.' : 'Join the E-shop community!'}</p>
                </div>

                <form onSubmit={handleAuthAction} className="space-y-6">
                    {!isLogin && (
                        <input 
                            type="text" 
                            placeholder="Full Name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClasses}
                        />
                    )}
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClasses}
                    />
                    <input 
                        type="password" 
                        placeholder="Password (min 6 chars)" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClasses}
                    />

                    {error && (
                        <p className="text-red-500 text-sm text-center font-medium">{error}</p>
                    )}

                    <button type="submit" className={buttonClasses} disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button 
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setEmail('');
                            setPassword('');
                            setName('');
                        }}
                        className="text-pink-600 hover:text-pink-700 text-sm font-semibold transition"
                    >
                        {isLogin ? "Need an account? Register here." : "Already have an account? Login."}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;