import { useState } from "react";
import { useLocation } from "wouter";
import { useAdmin, type MenuItem } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";
import { LogOut, LayoutDashboard, ClipboardCheck, Users, User, UserCheck, Calendar, BarChart3, Receipt, Building2, ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  User,
  UserCheck,
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

  // Track which parent menus are expanded
  const [expandedParents, setExpandedParents] = useState<Set<string>>(() => {
    // Auto-expand parent if current location matches a child
    const initial = new Set<string>();
    for (const item of getAllowedMenuItems()) {
      if (item.children && item.children.some(c => location.startsWith(c.path))) {
        initial.add(item.path);
      }
    }
    return initial;
  });

  const handleLogout = () => {
    adminLogout();
    setLocation("/admin/login");
  };

  const toggleParent = (path: string) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const Icon = ICON_MAP[item.icon];
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedParents.has(item.path);

    if (hasChildren) {
      // Parent menu item — expandable
      const isParentActive = item.children!.some(c => location.startsWith(c.path));
      return (
        <div key={item.path}>
          <button
            onClick={() => toggleParent(item.path)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
              isParentActive
                ? "bg-white/10 text-accent-gold"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span className="flex-1">{item.label}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </button>
          {isExpanded && (
            <div className="ml-4 border-l border-white/10">
              {item.children!.map(child => {
                const ChildIcon = ICON_MAP[child.icon];
                const isChildActive = location === child.path;
                return (
                  <button
                    key={child.path}
                    onClick={() => setLocation(child.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left",
                      isChildActive
                        ? "bg-white/10 border-l-[3px] border-accent-gold text-accent-gold"
                        : "text-white/60 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent"
                    )}
                  >
                    {ChildIcon && <ChildIcon className="h-3.5 w-3.5 shrink-0" />}
                    <span>{child.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Leaf menu item
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
        {menuItems.map((item: MenuItem) => renderMenuItem(item))}
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
