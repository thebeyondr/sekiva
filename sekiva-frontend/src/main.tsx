import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./Home.tsx";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { setupPolyfills } from "./polyfills";
import MyCollectives from "@/collective/MyCollectives.tsx";
import NewCollectivePage from "@/collective/new/NewCollectivePage.tsx";
import CollectiveDetail from "@/collective/CollectiveDetails.tsx";
import { AuthProvider } from "@/auth/AuthProvider.tsx";
import NewBallot from "@/ballot/NewBallot.tsx";
import BallotPage from "@/ballot/BallotPage.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TransactionTest from "@/components/shared/TransactionTest.tsx";

setupPolyfills();

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route index element={<Home />} />
            <Route path="collectives">
              <Route index element={<MyCollectives />} />
              <Route path="new" element={<NewCollectivePage />} />
              <Route path=":organizationId" element={<CollectiveDetail />} />
              <Route path=":organizationId/ballots">
                <Route path="new" element={<NewBallot />} />
                <Route path=":ballotId" element={<BallotPage />} />
              </Route>
            </Route>
            <Route path="/test-transaction" element={<TransactionTest />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
