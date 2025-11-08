import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api/apiService";

const ProductCard = ({ product }) => (
  <Link
    to={`/product/${product.id}`}
    className="relative block bg-white rounded-lg border border-gray-100 hover:shadow-lg transition duration-300 overflow-hidden"
  >
    <div className="p-4 flex flex-col items-center">
      <div className="w-full h-48 mb-3 flex items-center justify-center">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="flex items-center justify-between w-full mt-2">
        <h3 className="text-base font-medium text-gray-700">{product.name}</h3>
        <span className="text-pink-600 text-sm">❤️</span>
      </div>

      <p className="text-lg font-bold text-gray-800 self-start mt-1">
        ₹{product.price ? product.price.toFixed(2) : "N/A"}
      </p>
    </div>
  </Link>
);

const ProductList = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Electronics");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const CATEGORY_TABS = ["Electronics", "Cosmetics", "Clothes", "Books", "Furniture"];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchProducts();
        setAllProducts(response.data);
      } catch (err) {
        setError("Failed to load products. Ensure the backend is running and seeded.");
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = activeCategory
    ? allProducts.filter((product) => product.category === activeCategory)
    : allProducts;

  const isLoggedIn = localStorage.getItem("userToken");

  const AuthIcon = () =>
    isLoggedIn ? (
      <Link to="/cart" className="text-xl text-pink-600 cursor-pointer">🛒</Link>
    ) : (
      <Link to="/auth" className="text-xl text-gray-600 cursor-pointer hover:text-pink-600">👤</Link>
    );

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="flex justify-between items-center mb-12 pb-4 border-b border-gray-100">
          <div className="text-2xl font-bold text-gray-800">E-shop</div>
          <div className="flex items-center">
            <AuthIcon />
          </div>
        </header>

        {/* Hero Banner */}
        <div className="relative w-full h-[250px] bg-pink-100 rounded-3xl shadow-xl p-8 mb-12 flex items-center justify-between overflow-hidden">

          {/* Left Text */}
          <div className="w-1/2 z-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Get the best product <br /> at your home
            </h2>

            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="🔍 Search your favorite product"
                className="w-full py-3 pl-4 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
              />
            </div>
          </div>

          {/* Right Visuals */}
          <div className="absolute top-0 right-0 h-full w-[500px] flex items-center justify-end">
            <div className="w-2/3 h-full bg-yellow-400 flex items-center justify-center p-6">
              <img
                src="https://static.vecteezy.com/system/resources/previews/046/947/122/non_2x/white-headphones-on-transparent-background-png.png"
                alt="Headphones"
                className="w-40 h-40 object-contain rotate-12 absolute left-[-20px] top-1/2 -translate-y-1/2"
              />
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 flex items-center right-5">
              <img
                src="https://www.pngmart.com/files/22/Coco-Chanel-PNG.png"
                alt="Perfume"
                className="w-24 h-auto object-contain z-20 mr-4"
              />
              <div className="text-gray-500 text-sm font-semibold tracking-widest rotate-90 whitespace-nowrap absolute right-[-35px] top-[10px]">
                Perfume
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-6 border-b border-gray-200">
            {CATEGORY_TABS.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`pb-2 text-sm font-semibold transition duration-150 ${
                  activeCategory === category
                    ? "text-gray-800 border-b-2 border-pink-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Section */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading products...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-600 border border-red-300 p-4 rounded-lg">
            Error: {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No products found in this category.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
