import { Router, Route, Switch } from "wouter";
import { AdminProvider } from "@/contexts/AdminContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import AdminLayout from "@/components/AdminLayout";
import LoginPage from "@/pages/admin/LoginPage";
import Dashboard from "@/pages/admin/Dashboard";
import AuditWorkbench from "@/pages/admin/AuditWorkbench";
import MemberManagement from "@/pages/admin/MemberManagement";
import ConferenceManagement from "@/pages/admin/ConferenceManagement";
import Statistics from "@/pages/admin/Statistics";
import FinanceRecords from "@/pages/admin/FinanceRecords";
import BranchManagement from "@/pages/admin/BranchManagement";
import NotFound from "@/pages/admin/NotFound";

function WrappedPage({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <AdminProvider>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Switch>
            <Route path="/admin/login" component={LoginPage} />
            <Route path="/admin/dashboard">
              {() => (
                <WrappedPage>
                  <Dashboard />
                </WrappedPage>
              )}
            </Route>
            <Route path="/admin/audit">
              {() => (
                <WrappedPage>
                  <AuditWorkbench />
                </WrappedPage>
              )}
            </Route>
            <Route path="/admin/members">
              {() => (
                <WrappedPage>
                  <MemberManagement />
                </WrappedPage>
              )}
            </Route>
            <Route path="/admin/conferences">
              {() => (
                <WrappedPage>
                  <ConferenceManagement />
                </WrappedPage>
              )}
            </Route>
            <Route path="/admin/statistics">
              {() => (
                <WrappedPage>
                  <Statistics />
                </WrappedPage>
              )}
            </Route>
            <Route path="/admin/finance">
              {() => (
                <WrappedPage>
                  <FinanceRecords />
                </WrappedPage>
              )}
            </Route>
            <Route path="/admin/branches">
              {() => (
                <WrappedPage>
                  <BranchManagement />
                </WrappedPage>
              )}
            </Route>
            <Route path="/">
              {() => <LoginPage />}
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </Router>
      </TooltipProvider>
    </AdminProvider>
  );
}
