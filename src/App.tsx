import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import OnboardingStart from "./pages/OnboardingStart";
import InReviewOrganizations from "./pages/InReviewOrganizations";
import CreateOrganization from "./pages/CreateOrganization";
import OnboardingDetail from "./pages/OnboardingDetail";
import ReviewOrganization from "./pages/ReviewOrganization";
import SurpassLayout from "./pages/surpass/SurpassLayout";
import SurpassEntry from "./pages/surpass/SurpassEntry";
import SurpassBusiness from "./pages/surpass/SurpassBusiness";
import SurpassKYB from "./pages/surpass/SurpassKYB";
import SurpassKYC from "./pages/surpass/SurpassKYC";
import SurpassDocuments from "./pages/surpass/SurpassDocuments";
import SurpassBank from "./pages/surpass/SurpassBank";
import SurpassIntegrations from "./pages/surpass/SurpassIntegrations";
import SurpassReview from "./pages/surpass/SurpassReview";
import Organizations from "./pages/Organizations";
import OrganizationDetail from "./pages/OrganizationDetail";
import CreateVA from "./pages/CreateVA";
import UpdateVA from "./pages/UpdateVA";
import Reports from "./pages/Reports";
import Settlements from "./pages/Settlements";
import Refunds from "./pages/Refunds";
import RefundsByVA from "./pages/RefundsByVA";
import RefundDetail from "./pages/RefundDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/onboarding/start" element={<OnboardingStart />} />
            <Route path="/onboarding/in-review" element={<InReviewOrganizations />} />
            <Route path="/onboarding/create" element={<CreateOrganization />} />
            <Route path="/onboarding/surepass" element={<SurpassLayout />}>
              <Route index element={<SurpassEntry />} />
              <Route path="business-details" element={<SurpassBusiness />} />
              <Route path="kyb" element={<SurpassKYB />} />
              <Route path="kyc" element={<SurpassKYC />} />
              <Route path="documents" element={<SurpassDocuments />} />
              <Route path="bank-accounts" element={<SurpassBank />} />
              <Route path="integrations" element={<SurpassIntegrations />} />
              <Route path="review" element={<SurpassReview />} />
            </Route>
            <Route path="/onboarding/review/:id" element={<ReviewOrganization />} />
            <Route path="/onboarding/:id" element={<OnboardingDetail />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/organizations/:id" element={<OrganizationDetail />} />
            <Route path="/organizations/:id/va/new" element={<CreateVA />} />
            <Route path="/organizations/:id/va/:vaId" element={<UpdateVA />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/payins/settlements" element={<Settlements />} />
            <Route path="/payins/refunds" element={<Refunds />} />
            <Route path="/payins/refunds/:vaNo" element={<RefundsByVA />} />
            <Route path="/payins/refunds/:vaNo/:refundId" element={<RefundDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
