import { Outlet, useLocation } from "react-router-dom";
import navigation from "../services/navigation";
import { getSavedUser } from "../services/session";
import RouteError from "../pages/RouteError";

// Displays permission errors within the shared shell; APIs independently enforce roles.
function RoleRoute() {
  const location = useLocation();
  const page = navigation.find((item) => item.path === location.pathname);
  if (page && !page.roles.includes(getSavedUser()?.role)) return <RouteError forbidden />;
  return <Outlet />;
}
export default RoleRoute;
