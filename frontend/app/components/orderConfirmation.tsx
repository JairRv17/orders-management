import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getOrder } from "~/utils/helper";
import Swal from "sweetalert2";

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

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");

  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedId) {
      setCustomerId(storedId);
    }
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    if (orderId && customerId) {
      loadOrder();
    }
  }, [orderId, customerId]);

  const loadOrder = async () => {
    setIsLoading(true);
    try {
      const response = await getOrder(Number(orderId), customerId);
      setOrderData(response.data);
    } catch (error: any) {
      const message = error.response?.data?.error || "Order not found";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        confirmButtonColor: "#1f2937",
      }).then(() => {
        navigate("/customer");
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToShop = () => {
    navigate("/customer");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-gray-600">Loading order...</div>
      </main>
    );
  }

  if (!orderData) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-gray-600">Order not found</div>
        <button
          onClick={handleBackToShop}
          className="cursor-pointer mt-4 px-6 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors duration-200"
        >
          Back to Shop
        </button>
      </main>
    );
  }

  const isPaid = orderData.status.toLowerCase() === "paid";

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-2xl mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {isPaid ? (
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-medium text-gray-900">Payment Successful!</h1>
                <p className="text-gray-500 mt-2">Thank you for your purchase</p>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-medium text-gray-900">Order Details</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${orderData.status.toLowerCase() === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                  }`}>
                  {orderData.status}
                </span>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
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
                <span className="text-lg font-medium text-gray-900">{isPaid ? "Total Paid" : "Total"}</span>
                <span className="text-2xl font-bold text-green-600">${Number(orderData.total).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleBackToShop}
              className="cursor-pointer w-full mt-8 px-6 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors duration-200"
            >
              {isPaid ? "Continue Shopping" : "Back to Shop"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
