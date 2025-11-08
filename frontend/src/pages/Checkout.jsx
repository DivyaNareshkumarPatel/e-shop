import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, processCheckout } from '../api/apiService'; // Import API functions

const TAX_RATE = 0.08; 
const currencySymbol = '₹';

// --- Receipt Modal Component (Unchanged) ---
const ReceiptModal = ({ receipt }) => {
    const formatTime = (iso) => {
        return new Date(iso).toLocaleString();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-10 text-center relative border-4 border-pink-600">
                <span className="text-5xl text-pink-600 mb-4 block">🎉</span>
                <h2 className="text-3xl font-serif font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
                <p className="text-gray-600 mb-6">Thank you, **{receipt.customer.name}**! Your mock receipt is below.</p>

                <div className="bg-gray-50 p-4 rounded-lg text-left text-sm space-y-1">
                    <p><strong>Order ID:</strong> #{receipt.orderId}</p>
                    <p><strong>Time:</strong> {formatTime(receipt.timestamp)}</p>
                    <p><strong>Email:</strong> {receipt.customer.email}</p>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mt-6 mb-3 border-b pb-2">Items Purchased</h3>
                <ul className="max-h-32 overflow-y-auto space-y-1 text-sm text-gray-700 mb-6">
                    {receipt.items.map(item => (
                        <li key={item.productId} className="flex justify-between border-b border-gray-100 pb-1">
                            <span>{item.name} ({item.qty})</span>
                            <span className="font-medium">{currencySymbol}{item.lineTotal.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                
                <div className="text-2xl font-extrabold text-pink-600 mt-4">
                    Total: {currencySymbol}{receipt.totalPaid.toFixed(2)}
                </div>

                <Link to="/" className="mt-8 inline-block px-6 py-2 rounded-full text-white font-bold bg-pink-600 hover:bg-pink-700 transition">
                    Back to Home
                </Link>
            </div>
        </div>
    );
};


const CheckoutPage = () => {
    const [cart, setCart] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [receipt, setReceipt] = useState(null);

    // Get user ID from local storage and navigate hooks
    const navigate = useNavigate();
    // FIX 1: Retrieve userId from localStorage
    const userId = localStorage.getItem('userToken');

    // 1. Fetch Cart Data on Load (Connects to GET /api/cart)
    useEffect(() => {
        // Guard: If not logged in, redirect immediately
        if (!userId) {
             navigate('/auth');
             return;
        }

        const fetchCart = async () => {
            try {
                // FIX 2: Fetch cart using userId query parameter
                const response = await getCart({ params: { userId: userId } }); 
                const data = response.data;
                
                setCart(data);
                if (data.items.length === 0) {
                    setError("Your cart is empty. Please add items before checking out.");
                }
            } catch (err) {
                const message = err.message || "Failed to fetch cart data.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [userId, navigate]);

    // 2. Handle Checkout Submission (Connects to POST /api/checkout)
    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!cart || cart.items.length === 0) return;

        setError(null);
        setLoading(true);

        try {
            const checkoutData = {
                name,
                email,
                userId: parseInt(userId), // FIX 3: Send the user ID (as integer) to the backend
                grandTotal: cart.grandTotal,
                cartItems: cart.items.map(item => ({ productId: item.productId, qty: item.qty })), 
            };
            
            // ** API CALL **
            await processCheckout(checkoutData);
            
            // Success: Show Receipt Modal (using data already captured in checkoutData)
            // Note: Since the backend clears the cart, we use the local data for the receipt display
            setReceipt({ ...checkoutData, customer: { name, email }, items: cart.items, orderId: Math.floor(Math.random() * 1000000), totalPaid: cart.grandTotal });
            localStorage.removeItem('cartData'); // Clear local cache (if used)

        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Checkout failed due to an unknown error.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition duration-200";
    const buttonClasses = "w-full py-3 rounded-full text-white font-bold text-lg uppercase bg-gradient-to-br from-pink-600 to-red-500 shadow-lg shadow-pink-300 hover:shadow-xl transition duration-300";

    // --- Loading and Empty Cart States ---
    if (!cart) {
        return <div className="min-h-screen bg-pink-50 flex items-center justify-center p-8 text-gray-700">Loading cart summary...</div>;
    }
    
    // If user is redirected but cart is empty in DB
    if (cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center font-sans p-8">
                <div className="text-center bg-white p-10 rounded-xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-red-500 mb-4">Cart Empty</h2>
                    <p className="text-gray-600 mb-6">Your cart is empty. Please add items before checking out.</p>
                    <Link to="/products" className={buttonClasses + ' inline-block w-auto px-8'}>
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }
    
    if (receipt) {
        return <ReceiptModal receipt={receipt} />;
    }

    const totals = cart;
    const TAX_RATE_DISPLAY = 8; 

    return (
        <div className="min-h-screen bg-pink-50 font-sans py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <header className="text-center mb-10">
                    <Link to="/" className="text-3xl font-serif font-extrabold text-gray-900 hover:text-pink-600">E-shop Checkout</Link>
                    <p className="text-gray-500 mt-2">Final Step: Complete Your Purchase</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 bg-white p-8 rounded-xl shadow-2xl border border-pink-100">
                    
                    {/* Left Column: Customer and Payment Form */}
                    <div className="lg:w-3/5">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">1. Shipping & Contact</h2>
                        <form onSubmit={handleCheckout} className="space-y-6">
                            
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className={inputClasses}
                            />
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={inputClasses}
                            />
                            
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pt-4 pb-2">2. Payment Details (Mock)</h2>
                            <div className="space-y-4">
                                <label className="flex items-center space-x-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="card" 
                                        defaultChecked 
                                        readOnly
                                        className="form-radio text-pink-600 h-5 w-5"
                                    />
                                    <span className="font-medium text-gray-700">Credit/Debit Card (Mock Payment)</span>
                                </label>
                            </div>
                            
                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                            
                            <button type="submit" className={buttonClasses} disabled={loading}>
                                {loading ? 'Processing...' : `Place Order – ${currencySymbol}${totals.grandTotal.toFixed(2)}`}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:w-2/5 bg-pink-50 p-6 rounded-xl shadow-inner border border-pink-200 h-fit">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary ({totals.items.length} Items)</h2>
                        
                        {/* Item List (Scrolling) */}
                        <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                            {totals.items.map(item => (
                                <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                                    <span className="truncate">{item.name} ({item.qty})</span>
                                    <span className="font-medium">{currencySymbol}{item.lineTotal.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Totals Breakdown */}
                        <div className="space-y-2 text-gray-700 mt-4 pt-4 border-t border-pink-200">
                            <div className="flex justify-between"><span>Subtotal</span><span>{currencySymbol}{totals.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Shipping</span><span>{currencySymbol}{totals.shipping.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Tax ({TAX_RATE_DISPLAY}%)</span><span>{currencySymbol}{totals.tax.toFixed(2)}</span></div>
                        </div>

                        {/* Grand Total */}
                        <div className="flex justify-between pt-4 border-t border-gray-300 mt-4">
                            <span className="text-xl font-bold text-gray-900">Total</span>
                            <span className="text-2xl font-extrabold text-pink-600">{currencySymbol}{totals.grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;