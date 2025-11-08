import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api/apiService'; // Import the API function

// --- Product Card Component (for the featured grid) ---
const ProductCard = ({ product }) => (
  <Link 
    to={`/product/${product.id}`} 
    className="relative block bg-white rounded-lg border border-gray-100 hover:shadow-lg transition duration-300 overflow-hidden"
  >
    <div className="p-4 flex flex-col items-center">
        <div className="w-full h-48 mb-3 flex items-center justify-center">
            {/* Use the imageUrl from the fetched product */}
            <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain"/>
        </div>
        {/* Price is displayed from the fetched data */}
        <p className="text-lg font-bold text-gray-800 self-start mt-1">₹{product.price ? product.price.toFixed(2) : 'N/A'}</p>
    </div>
  </Link>
);


// --- Home Page Component (with enhanced Hero Banner and API Fetch) ---
const HomePage = () => {
    // State for Authentication
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    
    // State for Products from API
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // --- 1. Fetch Products from Backend API ---
    useEffect(() => {
        const loadProducts = async () => {
            // Check auth status first
            const userToken = localStorage.getItem('userToken');
            setIsLoggedIn(!!userToken); 
            
            try {
                // Call API to get all products
                const response = await fetchProducts(); 
                // Display the first 4 products
                setFeaturedProducts(response.data.slice(0, 4));
            } catch (err) {
                setError("Failed to fetch products. Check backend API and MongoDB connection.");
                console.error("Product fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        
        loadProducts();
    }, []); // Empty dependency array ensures this runs once


    // Hero visuals data (kept consistent with your provided image)
    const heroHeadphones = { name: "Headphones", imageUrl: "https://static.vecteezy.com/system/resources/previews/046/947/122/non_2x/white-headphones-on-transparent-background-png.png"};
    const heroPerfume = { name: "Perfume", imageUrl: "https://www.pngmart.com/files/22/Coco-Chanel-PNG.png" };

    // CONDITIONAL NAVIGATION ICON LOGIC
    const AuthIcon = () => {
        return (
            isLoggedIn 
                ? <Link to="/cart" className="text-xl text-pink-600 cursor-pointer">🛒</Link>
                : <Link to="/auth" className="text-xl text-gray-600 cursor-pointer hover:text-pink-600">👤</Link>
        );
    };


    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                
                {/* --- 1. Top Navigation (Minimalist Navbar) --- */}
                <header className="flex justify-between items-center mb-12 pb-4 border-b border-gray-100">
                    <div className="text-2xl font-bold text-gray-800">E-shop</div>
                    
                    {/* CONDITIONAL ICON DISPLAY */}
                    <div className="flex items-center">
                        <AuthIcon />
                    </div>
                </header>

                {/* --- 2. Central Hero Banner (BEAUTIFIED SECTION) --- */}
                <div className="relative w-full h-[380px] bg-gradient-to-br from-pink-50 to-pink-100 rounded-[25px] shadow-2xl shadow-pink-200 p-12 mb-12 flex items-center justify-between overflow-hidden">
                    
                    {/* Left Text/Search/CTA Area */}
                    <div className="w-1/2 z-10 pr-8"> 
                        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 font-serif leading-tight tracking-tight"> 
                            Get the best product <br /> at your home
                        </h1>
                        
                        {/* Search Input (Prominent CTA) */}
                        <div className="relative w-full max-w-sm">
                            <input 
                                type="text" 
                                placeholder="🔍 Search your favorite product" 
                                className="w-full py-4 pl-6 pr-12 text-pink-700 bg-white rounded-full 
                                           shadow-md focus:outline-none focus:ring-3 focus:ring-pink-500 
                                           placeholder-pink-400 text-base font-medium transition duration-300 ease-in-out" 
                            />
                        </div>
                    </div>

                    {/* Right Visual Area (Headphones and Perfume) */}
                    <div className="absolute top-0 right-0 h-full w-[600px] flex items-center justify-end">
                        
                        {/* Yellow Section Background - now with a subtle gradient/texture */}
                        <div className="w-2/3 h-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center relative transform skew-x-[-10deg] origin-bottom-right rounded-br-[25px]">
                            {/* Headphones Image - positioned more dynamically, added subtle shadow */}
                            <img 
                                src={heroHeadphones.imageUrl} 
                                alt={heroHeadphones.name} 
                                className="w-[250px] h-[250px] object-contain rotate-[-5deg] absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 
                                           drop-shadow-lg"
                                style={{
                                    filter: 'drop-shadow(5px 5px 10px rgba(0,0,0,0.2))'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* --- 3. Category Tabs (Visualizing Product Flow) --- */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-800">Featured Products</h2>
                    <div className="flex space-x-6">
                        <Link to="/products" className="text-pink-600 font-semibold hover:text-pink-700">See all →</Link>
                    </div>
                </div>

                {/* --- 4. Featured Products Grid --- */}
                {loading ? (
                    <div className="text-center py-16 text-gray-500">Loading featured products...</div>
                ) : error ? (
                    <div className="text-center py-16 text-red-600 border border-red-300 p-4 rounded-lg">
                        Error fetching products: {error}
                        <p className="text-sm mt-2 text-gray-600">Please ensure the backend server is running and the database has products seeded.</p>
                    </div>
                ) : (
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {featuredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                 </div>
                )}
                 
                 {/* --- 5. Footer CTA --- */}
                 <div className="mt-12 text-center">
                    <Link to="/products" className="px-8 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition duration-200 shadow-lg shadow-pink-300">
                        Shop All Products
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;