import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ReactNode } from "react"; // ✅ type-only import

<Route path="/" element={<App />} />
import App from "./App";
import { supabase } from "./supabase-client";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) return null; // wait for auth check
  return session ? children : <Navigate to="/auth" replace />;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
