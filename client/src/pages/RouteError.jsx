import { Link } from "react-router-dom";

// Gives missing and forbidden destinations a useful route back to the workspace.
function RouteError({ forbidden = false }) {
  return <main className="content-page">
    <p className="section-label">{forbidden ? "403" : "404"}</p>
    <h1>{forbidden ? "Access restricted" : "Page not found"}</h1>
    <p>{forbidden ? "Your account does not have permission to open this page." : "This address does not match a page in EMS."}</p>
    <Link className="button" to="/dashboard">Return to Overview</Link>
  </main>;
}
export default RouteError;
