import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./Home.tsx";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { setupPolyfills } from "./polyfills";
import MyCollectives from "@/collective/MyCollectives.tsx";
import NewCollective from "@/collective/NewCollective.tsx";
import CollectiveDetail from "@/collective/CollectiveDetails.tsx";
import { AuthProvider } from "@/auth/AuthProvider.tsx";

setupPolyfills();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="collectives">
            <Route index element={<MyCollectives />} />
            <Route path="new" element={<NewCollective />} />
            <Route path=":id" element={<CollectiveDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
