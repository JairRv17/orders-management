import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { SUPERADMIN_EMAIL } from "~/utils/allowedUsers";
import { handleAddItem, loadProducts } from "~/utils/helper";
import Swal from "sweetalert2";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    setUserEmail(email);
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userEmail = localStorage.getItem("userEmail");
    if (
      isLoggedIn !== "true" ||
      !userEmail ||
      userEmail !== SUPERADMIN_EMAIL
    ) {
      navigate("/");
    }
  }, [navigate]);

  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [products, setProducts] = useState<Record<string, any>[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");


  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, searchQuery]);

  const fetchProducts = async () => {
    try {
      const response = await loadProducts({
        page: currentPage,
        limit: 10,
        sort: sortBy,
        search: searchQuery
      });

      if (response.data) {
        setProducts(response.data.data || []);
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

  const addItem = () => {
    const newProduct = {
      name: productName,
      price: parseFloat(productPrice),
      stock: parseInt(quantity.toString(), 10),
    };
    handleAddItem(newProduct, (response) => {
      if (response.status === 201) {
        setProductName("");
        setProductPrice('');
        setQuantity('');
        fetchProducts();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Product added successfully",
          confirmButtonColor: "#1f2937",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to add item. Please try again.",
          confirmButtonColor: "#1f2937",
        });
      }
    }, (error) => {
      // Show backend error message directly
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.error || errorData.errors?.join('\n') || 'An error occurred while adding the product.';
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
          confirmButtonColor: "#1f2937",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Please check your connection.",
          confirmButtonColor: "#1f2937",
        });
      }
    })
  };
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-7xl mt-8 mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-light text-gray-800">
          Hola, <span className="font-medium">{userEmail}</span>
        </h1>
        <button
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
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

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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

            {products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${parseFloat(product.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {product.stock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
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
            <h2 className="text-lg font-medium text-gray-900 mb-6">Add Product</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                  Product name
                </label>
                <input
                  id="productName"
                  type="text"
                  placeholder="Macbook Pro"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  id="productPrice"
                  type="number"
                  placeholder="0.00"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                />
              </div>
              <button
                onClick={addItem}
                className="w-full mt-6 px-6 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 active:bg-gray-950 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
