import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { logError } from "@/services/unified-error-system";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logError('404 Not Found', undefined, { url: location.pathname });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        <Link to="/" className="text-primary hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
