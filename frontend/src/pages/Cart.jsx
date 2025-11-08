import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { getCart, updateCartItem, removeCartItem } from '../api/apiService'; 

const CartPage = () => {
    const [cartData, setCartData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- AUTHENTICATION STATE ---
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null); 

    // Constants
    const SHIPPING_COST = 15.00; 
    const TAX_RATE = 0.08; 
    const currencySymbol = '₹';

    // --- Authentication Check and User ID Retrieval ---
    useEffect(() => {
        const userToken = localStorage.getItem('userToken');
        setUserId(userToken);
        
        if (!userToken) {
            setError("Authentication Required: Please log in to view your cart.");
            setLoading(false);
        }
    }, []);

    // --- Core Data Fetching Function (Triggered by userId change) ---
    const fetchCart = async () => {
        if (!userId) return; 

        setLoading(true);
        try {
            const response = await getCart({ params: { userId: userId } });
            setCartData(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching cart:", err);
            setError("Failed to load cart data. Please ensure the backend is running.");
            
            // FIX 1: Set shipping and grandTotal to 0 in the default empty state object
            setCartData({ items: [], subtotal: 0, tax: 0, shipping: 0.00, grandTotal: 0 }); 
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch on component mount and whenever userId changes
    useEffect(() => {
        if (userId) {
            fetchCart();
        }
    }, [userId]); 

    // --- Cart Manipulation Handlers (Unchanged API Logic) ---
    const handleUpdateQuantity = async (productId, currentQty) => {
        if (!userId) return navigate('/auth');
        const newQty = Math.max(0, currentQty); 
        try {
            const response = await updateCartItem(productId, newQty, { userId: userId });
            setCartData(response.data); 
        } catch (err) {
            console.error("Quantity update failed:", err);
            setError("Could not update item quantity.");
            fetchCart(); 
        }
    };
    
    const handleRemoveItem = async (productId) => {
        if (!userId) return navigate('/auth');
         try {
            const response = await removeCartItem(productId, { params: { userId: userId } });
            setCartData(response.data);
        } catch (err) {
            console.error("Item removal failed:", err);
            setError("Could not remove item.");
             fetchCart();
        }
    };

    // --- Render Logic ---
    if (loading && !error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <span className="text-lg text-pink-600">Loading your cart...</span>
            </div>
        );
    }
    
    // Authentication Guard
    if (!userId || (error && error.includes("Authentication Required"))) {
         return (
            <div className="min-h-screen bg-white text-center p-20">
                <h2 className="text-3xl text-red-500 mb-4">Authentication Required</h2>
                <p className="text-gray-600 mb-6">Please log in to view and manage your shopping cart.</p>
                <Link to="/auth" className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-full hover:bg-pink-700 transition">
                    Go to Login / Register
                </Link>
            </div>
        );
    }
    
    const cartItems = cartData?.items || [];
    const totals = cartData || {};

    // FIX 2: Calculate the effective shipping cost (0 if cart is empty)
    const effectiveShipping = cartItems.length === 0 ? 0.00 : totals.shipping;

    // FIX 3: Calculate the effective Grand Total locally for display consistency
    const effectiveGrandTotal = (totals.subtotal || 0) + (totals.tax || 0) + effectiveShipping;


    // --- Cart Item Row Component (remains unchanged) ---
    const CartItemRow = ({ item }) => (
        <div className="flex items-center py-6 border-b border-gray-100">
            {/* Image */}
            <div className="w-16 h-16 mr-6 flex-shrink-0">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain rounded-md border border-gray-100" />
            </div>

            {/* Product Info */}
            <div className="flex-grow">
                <Link to={`/product/${item.productId}`} className="text-lg font-semibold text-gray-800 hover:text-pink-600 transition">
                    {item.name}
                </Link>
                <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center space-x-3 w-32 justify-center">
                <button 
                    onClick={() => handleUpdateQuantity(item.productId, item.qty - 1)} 
                    className="text-gray-600 hover:text-red-500 text-lg font-bold w-6 h-6 border rounded-full transition"
                >-</button>
                <span className="text-base font-medium w-4 text-center">{item.qty}</span>
                <button 
                    onClick={() => handleUpdateQuantity(item.productId, item.qty + 1)} 
                    className="text-gray-600 hover:text-pink-600 text-lg font-bold w-6 h-6 border rounded-full transition"
                >+</button>
            </div>

            {/* Line Total */}
            <div className="w-24 text-right">
                <span className="text-lg font-bold text-gray-800">₹{item.lineTotal.toFixed(2)}</span>
            </div>
            
            {/* Remove Button */}
            <div className="w-10 text-right">
                <button 
                    onClick={() => handleRemoveItem(item.productId)}
                    className="text-gray-400 hover:text-red-500 transition"
                >
                    &times;
                </button>
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-white font-sans py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header (Minimalist Theme) */}
                <header className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
                    <h1 className="text-3xl font-serif font-extrabold text-gray-800">Shopping Cart</h1>
                    <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-pink-600">E-shop</Link>
                </header>
                
                {/* Global Error Banner */}
                {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-center">{error}</div>}

                {/* Main Cart Layout (Two Columns) */}
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Left Column: Cart Items List */}
                    <div className="lg:w-2/3 bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-100">
                        {cartItems.length > 0 ? (
                            <div className="space-y-2">
                                {cartItems.map(item => (
                                    <CartItemRow key={item.productId} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                Your cart is empty. <Link to="/products" className="text-pink-600 underline">Start shopping!</Link>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:w-1/3 bg-pink-100 p-8 rounded-xl shadow-lg border border-pink-200 h-fit">
                        <h2 className="text-2xl font-serif font-extrabold text-gray-800 mb-6 border-b border-pink-200 pb-3">
                            Order Summary
                        </h2>
                        
                        <div className="space-y-3 text-gray-700 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{currencySymbol}{totals.subtotal ? totals.subtotal.toFixed(2) : '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping (Flat Rate)</span>
                                <span>{effectiveShipping === 0 ? 'FREE' : `${currencySymbol}${effectiveShipping.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Estimated Tax (8%)</span>
                                <span>{currencySymbol}{totals.tax ? totals.tax.toFixed(2) : '0.00'}</span>
                            </div>
                        </div>

                        {/* Grand Total */}
                        <div className="flex justify-between pt-4 border-t-2 border-pink-300">
                            <span className="text-xl font-bold text-gray-900">Grand Total</span>
                            {/* Use the locally calculated effective Grand Total */}
                            <span className="text-2xl font-extrabold text-pink-600">₹{effectiveGrandTotal.toFixed(2)}</span>
                        </div>

                        {/* Checkout Button */}
                        <Link 
                            to="/checkout" 
                            className={`mt-8 block text-center py-4 rounded-full text-white font-bold text-lg 
                                       bg-gradient-to-br from-pink-600 to-red-500 shadow-xl shadow-pink-300 hover:shadow-2xl transition duration-300 ${cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={(e) => cartItems.length === 0 && e.preventDefault()}
                        >
                            Proceed to Checkout
                        </Link>
                        
                        {/* Continue Shopping Link */}
                        <Link to="/products" className="block text-center mt-4 text-gray-600 hover:text-pink-600 transition">
                            ← Continue Shopping
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CartPage;