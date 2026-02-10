import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { createOrder, checkoutOrder, loadProducts } from "~/utils/helper";
import Swal from "sweetalert2";

type ViewState = "shopping" | "summary" | "confirmation";

interface OrderData {
  id: number;
  customerId: string;
  status: string;
  total: number;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

export default function Customer({ items }: { items: Record<string, any>[] }) {
  const navigate = useNavigate();

  // View state management
  const [currentView, setCurrentView] = useState<ViewState>("shopping");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customerId, setCustomerId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  // Load customerId and userEmail from localStorage on client side only
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedId) {
      setCustomerId(storedId);
    } else {
      const newId = `customer_${Date.now()}`;
      localStorage.setItem("userId", newId);
      setCustomerId(newId);
    }

    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const [initialItems, setInitialItems] = useState<Record<string, any>[]>([]);
  const [cart, setCart] = useState<Record<string, any>[]>([]);

  const getCartQuantity = (itemId: number) => {
    const cartItem = cart.find((item) => item.id === itemId);
    return cartItem?.quantity || 0;
  };

  const handleAddToCart = (itemToAdd: Record<string, any>) => {
    const price = Number(itemToAdd.price);
    const existingItemIndex = cart.findIndex(
      (item) => item.id === itemToAdd.id,
    );
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      const existingItem = updatedCart[existingItemIndex];
      existingItem.quantity = (existingItem.quantity || 1) + 1;
      existingItem.addedPrice = Number(existingItem.addedPrice || 0) + price;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...itemToAdd, quantity: 1, addedPrice: price }]);
    }
  };

  const handleRemoveFromCart = (itemToRemove: Record<string, any>) => {
    const price = Number(itemToRemove.price);
    const existingItemIndex = cart.findIndex(
      (item) => item.id === itemToRemove.id,
    );
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      const existingItem = updatedCart[existingItemIndex];
      if (existingItem.quantity > 1) {
        existingItem.quantity -= 1;
        existingItem.addedPrice = Number(existingItem.addedPrice || 0) - price;
        setCart(updatedCart);
      } else {
        setCart(cart.filter((item) => item.id !== itemToRemove.id));
      }
    }
  };

  const totalAmount = cart.reduce(
    (total, item) => total + (item.addedPrice || 0),
    0,
  );

  const totalItems = cart.reduce(
    (total, item) => total + (item.quantity || 0),
    0,
  );

  // Checkout flow handlers
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsLoading(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const response = await createOrder(customerId, orderItems);
      setOrderData(response.data);
      setCurrentView("summary");
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.errors?.join(", ") || "Failed to create order";
      Swal.fire({
        icon: "error",
        title: "Order Error",
        text: message,
        confirmButtonColor: "#1f2937",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async () => {
    if (!orderData) return;

    setIsLoading(true);
    try {
      await checkoutOrder(orderData.id, customerId);
      // Redirect to order confirmation page
      setCart([]);
      navigate(`/order/${orderData.id}`);
    } catch (error: any) {
      const message = error.response?.data?.error || "Payment failed";
      Swal.fire({
        icon: "error",
        title: "Payment Error",
        text: message,
        confirmButtonColor: "#1f2937",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToShop = () => {
    setCart([]);
    setOrderData(null);
    setCurrentView("shopping");
    fetchProducts();
  };

  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, searchQuery]);

  const fetchProducts = async () => {
    try {
      const response = await loadProducts({
        page: currentPage,
        limit: 10,
        sort: sortBy,
        search: searchQuery,
      });

      if (response.data) {
        setInitialItems(response.data.data || []);
        setTotalPages(response.data.meta?.pages || 1);
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load products",
        confirmButtonColor: "#1f2937",
      });
    }
  };

  // Order Summary View
  if (currentView === "summary" && orderData) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-2xl mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-medium text-gray-900">Order Summary</h1>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  {orderData.status}
                </span>
              </div>

              <div className="text-sm text-gray-500 mb-6">
                {userEmail || "Guest"}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Items</h2>
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">
                          ${Number(item.unitPrice).toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">${Number(item.subtotal).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-green-600">${Number(orderData.total).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={handlePay}
                  disabled={isLoading}
                  className={`cursor-pointer flex-1 px-6 py-3 font-medium rounded-md transition-colors duration-200 ${isLoading
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                >
                  {isLoading ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Confirmation View
  if (currentView === "confirmation" && orderData) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-2xl mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-medium text-gray-900">Payment Successful!</h1>
                <p className="text-gray-500 mt-2">Thank you for your purchase</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {orderData.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="font-medium text-gray-900">{userEmail || "Guest"}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">
                          ${Number(item.unitPrice).toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">${Number(item.subtotal).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total Paid</span>
                  <span className="text-2xl font-bold text-green-600">${Number(orderData.total).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleBackToShop}
                className="cursor-pointer w-full mt-8 px-6 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Shopping View (default)
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-7xl mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-light text-gray-800">
            Hola, <span className="font-medium">{userEmail || "Guest"}</span>
          </h1>
          <button
            className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              localStorage.removeItem("userEmail");
              localStorage.removeItem("userId");
              navigate("/");
            }}
          >
            Cerrar sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Products</h2>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 text-gray-900"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price">Sort by Price</option>
                    <option value="stock">Sort by Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {initialItems.map((item, index) => {
                  const quantityInCart = getCartQuantity(item.id);
                  const isInCart = quantityInCart > 0;
                  return (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 flex flex-col transition-all duration-200 ${isInCart
                        ? "border-green-500 bg-green-50 ring-1 ring-green-200"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          {item.name || "Item"}
                        </h3>
                        {isInCart && (
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            In Cart
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        {item.price && (
                          <p className="text-xl font-bold text-gray-900">${Number(item.price).toFixed(2)}</p>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded ${item.stock === 0
                          ? "bg-red-100 text-red-600"
                          : item.stock < 10
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                          }`}>
                          {item.stock === 0 ? "Out of stock" : `${item.stock} in stock`}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-sm text-gray-500 mb-4 flex-grow">{item.description}</p>
                      )}

                      <div className="mt-auto">
                        {isInCart ? (
                          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                            <button
                              onClick={() => handleRemoveFromCart(item)}
                              className="cursor-pointer w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-xl transition-colors"
                            >
                              −
                            </button>
                            <div className="flex flex-col items-center">
                              <span className="text-2xl font-bold text-gray-900">{quantityInCart}</span>
                              <span className="text-xs text-gray-500">in cart</span>
                            </div>
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={quantityInCart >= item.stock}
                              className={`cursor-pointer w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xl transition-colors ${quantityInCart >= item.stock
                                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                                : "bg-green-500 hover:bg-green-600 text-white"
                                }`}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={item.stock === 0}
                            className={`cursor-pointer w-full font-medium py-2.5 px-4 rounded-md flex items-center justify-center gap-2 transition-all duration-200 ${item.stock === 0
                              ? "bg-gray-200 cursor-not-allowed text-gray-500"
                              : "bg-gray-900 hover:bg-gray-800 text-white"
                              }`}
                          >
                            <span className="text-lg">+</span>
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {initialItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No products found
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${currentPage === page
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-fit sticky top-4">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cart Summary</h2>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">Your cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((cartItem) => (
                    <div key={cartItem.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <div>
                        <p className="font-medium text-gray-900">{cartItem.name}</p>
                        <p className="text-gray-500">x{cartItem.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">${Number(cartItem.addedPrice).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Items</span>
                  <span className="text-sm font-medium text-gray-900">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="text-xl font-bold text-green-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={totalAmount === 0 || isLoading}
                className={`w-full mt-6 px-6 py-3 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 ${totalAmount === 0 || isLoading
                  ? "bg-gray-200 cursor-not-allowed text-gray-500"
                  : "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 cursor-pointer"
                  }`}
              >
                {isLoading ? "Processing..." : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
