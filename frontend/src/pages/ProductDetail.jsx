import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate for redirection
import { fetchProducts, updateCartItem } from '../api/apiService'; 

// --- Reusable Success Toast Component (Define outside the main component) ---
const SuccessToast = ({ message }) => {
    // This is the clean, modern notification that appears briefly
    return (
        <div className="fixed bottom-6 right-6 z-50 p-4 w-full max-w-sm">
            <div className={`flex items-center p-4 rounded-xl shadow-2xl bg-green-100 border-2 border-green-400 transform transition duration-500 ease-out`}>
                <span className={`text-2xl mr-3`}>✅</span>
                <div>
                    <p className="font-bold text-green-800">Item Added!</p>
                    <p className="text-sm text-gray-700">{message}</p>
                </div>
            </div>
        </div>
    );
};


const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartActionMessage, setCartActionMessage] = useState(null); 
    
    // --- STATE FOR USER ID ---
    // Retrieve User ID from local storage and store it
    const [userId, setUserId] = useState(null); 
    
    const navigate = useNavigate();
    const currencySymbol = '₹';
    const mockRating = '4.6'; // UI Constant

    // --- 1. Data & User ID Fetching Effect ---
    useEffect(() => {
        // Get user ID from local storage immediately on mount
        const userToken = localStorage.getItem('userToken');
        setUserId(userToken);
        
        const loadProduct = async () => {
            try {
                const response = await fetchProducts();
                const fetchedProduct = response.data.find(p => p.id === parseInt(id));

                if (fetchedProduct) {
                    setProduct(fetchedProduct);
                } else {
                    setError("Product not found.");
                }
            } catch (err) {
                setError("Failed to load product data from API. Ensure backend is running and seeded.");
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    // --- 2. Add to Cart Handler (API Integration) ---
    const handleAddToCart = async () => {
        if (!product) return;
        setCartActionMessage(null); 
        
        // --- VALIDATION: CHECK LOGIN STATUS ---
        if (!userId) {
            alert("Please log in to add items to your cart."); // Using alert for immediate block before redirect
            navigate('/auth'); // Redirect to login page
            return;
        }

        try {
            // FIX: Call the API, sending the userId in the request body
            await updateCartItem(product.id, quantity, { userId: userId }); 
            
            // Show success toast
            setCartActionMessage(`${product.name} (x${quantity}) added to cart!`);

            // Automatically hide toast after 3 seconds
            setTimeout(() => setCartActionMessage(null), 3000);

        } catch (err) {
            console.error("Cart update failed:", err);
            setCartActionMessage("Failed to add item to cart. Backend error.");
            setTimeout(() => setCartActionMessage(null), 3000);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-white text-center p-20 text-gray-500">Loading product details...</div>;
    }
    
    if (error || !product) {
        return (
            <div className="min-h-screen bg-white text-center p-20">
                <h2 className="text-3xl text-red-500">{error || "Product Not Found"}</h2>
                <Link to="/products" className="text-pink-600 underline mt-4 block">Return to Catalogue</Link>
            </div>
        );
    }
    

    return (
        <div className="min-h-screen bg-white font-sans py-12">
            
            {/* Display Success Toast */}
            {cartActionMessage && <SuccessToast message={cartActionMessage} />}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Minimal Header */}
                <header className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100 relative">
                    <Link to="/products" className="text-gray-600 hover:text-pink-600 transition text-sm flex items-center space-x-1 absolute left-0">
                        <span className="text-lg">←</span> <span>Back to Products</span>
                    </Link>
                    <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-pink-600 mx-auto">E-shop</Link>
                    <Link to="/cart" className="text-xl text-pink-600 cursor-pointer absolute right-0">🛒</Link>
                </header>

                {/* Main Product Layout (Image Gallery + Info) */}
                <div className="flex flex-col lg:flex-row gap-12 bg-white p-8 rounded-xl shadow-xl border border-gray-100">
                    
                    {/* Left Column: Single Image View */}
                    <div className="lg:w-1/2 flex flex-col items-center">
                        <div className="w-full max-w-lg h-96 bg-gray-50 flex items-center justify-center rounded-2xl shadow-inner-lg overflow-hidden border border-gray-100">
                            <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain p-4 transition-transform duration-300 hover:scale-105" />
                        </div>
                    </div>

                    {/* Right Column: Product Details and CTA */}
                    <div className="lg:w-1/2 space-y-4 pt-2">
                        {/* Headline */}
                        <h1 className="text-3xl font-serif font-extrabold text-gray-900 leading-tight mb-2">{product.name}</h1>
                        <p className="text-sm text-gray-500 mb-4">{product.category}</p>
                        
                        {/* Price and Rating */}
                        <div className="flex items-center space-x-6 mb-4">
                            <span className="text-3xl font-extrabold text-pink-600">{currencySymbol}{product.price.toFixed(2)}</span>
                            <div className="flex items-center text-yellow-500">
                                <span className="text-lg mr-1">★</span>
                                <span className="text-lg font-semibold">{mockRating}</span>
                                <span className="text-gray-500 ml-2 text-sm">(120 Reviews)</span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 leading-relaxed text-base pt-3 border-t border-gray-100">{product.description}</p>
                        
                        {/* Quantity Selector: Compact controls */}
                        <div className="space-y-3 pt-4">
                             <h3 className="text-lg font-bold text-gray-800">Quantity:</h3>
                             <div className="flex items-center space-x-3 bg-gray-100 rounded-full py-1 px-3 w-fit shadow-inner">
                                <button 
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                                    className="text-gray-600 hover:text-pink-600 text-xl font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-200"
                                >-</button>
                                <span className="text-lg font-extrabold text-gray-800 w-6 text-center">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(q => q + 1)} 
                                    className="text-gray-600 hover:text-pink-600 text-xl font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-200"
                                >+</button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button 
                            onClick={handleAddToCart}
                            className="w-full mt-6 py-3 rounded-full text-white font-bold text-lg uppercase 
                                       bg-gradient-to-br from-pink-600 to-red-500 shadow-xl shadow-pink-300 hover:shadow-2xl hover:scale-[1.01] transition duration-300 ease-in-out transform"
                        >
                            Add to Cart ({currencySymbol}{(product.price * quantity).toFixed(2)})
                        </button>
                        
                        {/* Detailed Specifications */}
                        <div className="pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Specifications</h3>
                            <ul className="text-gray-700 list-disc list-inside space-y-1">
                                {product.details && product.details.map((detail, index) => (
                                    <li key={index} className="text-sm leading-relaxed">{detail}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;