import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { setupPolyfills } from "./polyfills";
import MyOrganizations from "@/organizations/MyOrganizations.tsx";
import NewOrganization from "@/organizations/NewOrganization.tsx";
import OrganizationDetail from "@/organizations/OrganizationDetail.tsx";

// Initialize polyfills
setupPolyfills();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="organizations">
          <Route index element={<MyOrganizations />} />
          <Route path="new" element={<NewOrganization />} />
          <Route path=":id" element={<OrganizationDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
