import { useLocation } from "wouter";
import { useAdmin } from "@/contexts/AdminContext";
import AdminTopBar from "./AdminTopBar";
import AdminSidebar from "./AdminSidebar";
import { useEffect } from "react";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdminLoggedIn, canAccess, adminRole, getDefaultCmsPath } = useAdmin();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isAdminLoggedIn) {
      setLocation("/admin/login");
      return;
    }
    if (!canAccess(location)) {
      toast.error("您没有权限访问该页面");
      if (location.startsWith("/admin/cms") && adminRole === "branch_admin") {
        setLocation(getDefaultCmsPath());
      } else {
        setLocation("/admin/dashboard");
      }
    }
  }, [isAdminLoggedIn, location, canAccess, adminRole, getDefaultCmsPath, setLocation]);

  if (!isAdminLoggedIn) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <AdminTopBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-paper-bright p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
