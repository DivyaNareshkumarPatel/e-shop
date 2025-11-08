import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000/api', // Base URL for Node/Express Backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Authentication Endpoints (/api/auth) ---

export const registerUser = (data) => {
    return API.post('/auth/register', data);
};

export const loginUser = (data) => {
    return API.post('/auth/login', data);
};

export const fetchProducts = () => {
    return API.get('/products');
};

export const getCart = (config) => {
    return API.get('/cart', config); // Config will contain { params: { userId: ... } }
};

// 2. POST /api/cart: Requires userId in body
export const updateCartItem = (productId, qty, authData) => {
    // authData contains { userId: ... }
    return API.post('/cart', { productId: parseInt(productId), qty, ...authData });
};

// 3. DELETE /api/cart/:id: Requires userId in query params
export const removeCartItem = (id, config) => {
    // Config will contain { params: { userId: ... } }
    return API.delete(`/cart/${id}`, config); 
};

// 4. POST /api/checkout: Requires userId in body
export const processCheckout = (checkoutData) => {
    return API.post('/cart/checkout', checkoutData);
};

// export const processCheckout = (checkoutData) => {
//     return API.post('/checkout', checkoutData);
// };

export default API;