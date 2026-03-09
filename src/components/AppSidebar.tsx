import {
  LayoutDashboard, Briefcase, Wallet, PlusCircle, ShoppingBag, DollarSign,
  Users, Shield, AlertTriangle, LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const clientLinks = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Wallet", url: "/wallet", icon: Wallet },
  { title: "Post a Gig", url: "/post-gig", icon: PlusCircle },
  { title: "My Gigs", url: "/my-gigs", icon: Briefcase },
];

const hustlerLinks = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
  { title: "My Jobs", url: "/my-jobs", icon: Briefcase },
  { title: "Earnings", url: "/earnings", icon: DollarSign },
];

const adminLinks = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "KYC Queue", url: "/admin/kyc", icon: Shield },
  { title: "All Gigs", url: "/admin/gigs", icon: Briefcase },
  { title: "Disputes", url: "/admin/disputes", icon: AlertTriangle },
  { title: "Users", url: "/admin/users", icon: Users },
];

export function AppSidebar() {
  const { profile, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const role = profile?.role;
  const links = role === "admin" ? adminLinks : role === "hustler" ? hustlerLinks : clientLinks;
  const label = role === "admin" ? "Admin" : role === "hustler" ? "Hustler" : "Client";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          {!collapsed && (
            <h1 className="text-lg font-bold text-sidebar-primary-foreground tracking-tight">
              Gig<span className="text-primary">Hold</span>
            </h1>
          )}
          {collapsed && <span className="text-primary font-bold text-lg">G</span>}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-widest">
            {!collapsed && label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard" || item.url === "/admin"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-3">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full text-sm"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
