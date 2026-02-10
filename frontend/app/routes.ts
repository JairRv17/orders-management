import { type RouteConfig, index, route } from "@react-router/dev/routes";
import { PATHS } from "./utils/constants";

export default [
  index("routes/home.tsx"),
  route(PATHS.ADD_ITEMS, "components/addItems.tsx"),
  route(PATHS.CUSTOMER, "components/customer.tsx"),
  route(PATHS.ORDER_CONFIRMATION, "components/orderConfirmation.tsx"),
] satisfies RouteConfig;
