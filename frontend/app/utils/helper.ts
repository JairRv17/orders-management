import axios from "axios";
import { AXIOS_API_BASE_URL } from "./constants";

// Create order - POST /api/orders
export async function createOrder(
  customerId: string,
  items: { productId: number; quantity: number }[]
) {
  return axios.post(`${AXIOS_API_BASE_URL}/orders`, { customerId, items });
}

// Get order - GET /api/orders/{id}?customerId=X
export async function getOrder(orderId: number, customerId: string) {
  return axios.get(`${AXIOS_API_BASE_URL}/orders/${orderId}`, {
    params: { customerId },
  });
}

// Checkout order - POST /api/orders/{id}/checkout
export async function checkoutOrder(orderId: number, customerId: string) {
  return axios.post(`${AXIOS_API_BASE_URL}/orders/${orderId}/checkout`, {
    customerId,
  });
}

export async function handleAddItem(
  item: Record<string, any>,
  onSuccess?: (resp: any) => void,
  onError?: (error: any) => void
) {
  return await axios.post(`${AXIOS_API_BASE_URL}/products`, item).then((response) => {
    if (response.status === 201) {
      onSuccess && onSuccess(response);
    } else {
      onError && onError(new Error("Failed to add item"));
    }
  }).catch((error) => {
    onError && onError(error);
  });
}

export async function loadProducts(
  serverOpts?: Record<string, any>,
) {
  return await axios.get(`${AXIOS_API_BASE_URL}/products`, { params: serverOpts })
}