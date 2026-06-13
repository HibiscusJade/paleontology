import { useLocation } from "wouter";
import { useAdmin, type MenuItem } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";
import { LogOut, LayoutDashboard, ClipboardCheck, Users, Calendar, BarChart3, Receipt, Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Calendar,
  BarChart3,
  Receipt,
  Building2,
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "学会总管理员",
  branch_admin: "分会管理员",
  finance_reviewer: "财务审核员",
};

export default function AdminSidebar() {
  const [location, setLocation] = useLocation();
  const { adminUser, adminRole, getAllowedMenuItems, adminLogout } = useAdmin();
  const menuItems = getAllowedMenuItems();

  const handleLogout = () => {
    adminLogout();
    setLocation("/admin/login");
  };

  return (
    <aside className="w-56 bg-strata-blue-deep text-white flex flex-col shrink-0 border-r border-white/10">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent-gold/30 flex items-center justify-center shrink-0">
            <span className="text-accent-gold font-bold text-sm">
              {adminUser?.name?.charAt(0) || "管"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{adminUser?.name}</p>
            <Badge variant="outline" className="text-[10px] text-accent-gold border-accent-gold/30 mt-1 px-1.5 py-0">
              {ROLE_LABELS[adminRole]}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {menuItems.map((item: MenuItem) => {
          const Icon = ICON_MAP[item.icon];
          const isActive = location === item.path;
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                isActive
                  ? "bg-white/10 border-l-[3px] border-accent-gold text-accent-gold"
                  : "text-white/70 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent"
              )}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <Separator className="bg-white/10" />

      <div className="p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-party-red hover:bg-white/5 rounded transition-colors"
        >
          <LogOut className="h-4 w-4" />
          安全退出
        </button>
      </div>
    </aside>
  );
}
