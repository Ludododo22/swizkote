import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLocation, Link } from "wouter";
import { useState, useEffect } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarFooter, SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, Wallet,
  TrendingUp, FolderLock, MessageSquare, LogOut,
  Users, UserPlus, FileText, UserCircle, BarChart3,
} from "lucide-react";
const logoImg = "/logo.png";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [location] = useLocation();
  const isAdmin = user?.role === "admin";

  // État réactif du tab actif — mis à jour à chaque popstate
  const [activeAdminTab, setActiveAdminTab] = useState<string>(() => {
    return new URLSearchParams(window.location.search).get("tab") || "stats";
  });

  useEffect(() => {
    const syncTab = () => {
      const tab = new URLSearchParams(window.location.search).get("tab") || "stats";
      setActiveAdminTab(tab);
    };
    // Écouter les changements d'URL (sidebar pushState + boutons retour/avant)
    window.addEventListener("popstate", syncTab);
    // Synchroniser immédiatement au montage
    syncTab();
    return () => window.removeEventListener("popstate", syncTab);
  }, []);

  const clientMenuItems = [
    { title: t("nav_dashboard"), url: "/dashboard",     icon: LayoutDashboard },
    { title: t("nav_transfers"), url: "/transfers",     icon: ArrowLeftRight  },
    { title: t("nav_accounts"),  url: "/accounts",      icon: Wallet          },
    { title: t("nav_cards"),     url: "/cards",         icon: CreditCard      },
    { title: t("nav_loans"),     url: "/loans",         icon: TrendingUp      },
    { title: t("nav_loan_request"), url: "/loan-request", icon: FileText      },
    { title: t("nav_vault"),     url: "/vault",         icon: FolderLock      },
    { title: t("nav_messages"),  url: "/messages",      icon: MessageSquare   },
    { title: t("nav_profile"),   url: "/profile",       icon: UserCircle      },
  ];

  // Dashboard ajouté en premier + tous les autres onglets admin
  const adminMenuItems = [
    { title: t("nav_dashboard"),       tab: "stats",     icon: BarChart3      },
    { title: t("admin_tab_create"),    tab: "create",    icon: UserPlus       },
    { title: t("admin_tab_clients"),   tab: "clients",   icon: Users          },
    { title: t("admin_tab_loans"),     tab: "loans",     icon: TrendingUp     },
    { title: t("admin_tab_transfers"), tab: "transfers", icon: ArrowLeftRight },
    { title: t("admin_tab_messages"),  tab: "messages",  icon: MessageSquare  },
    { title: t("admin_tab_pdf"),       tab: "pdf",       icon: FileText       },
  ];

  const initials = user?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const isClientLinkActive = (url: string) => {
    return location === url || (url !== "/dashboard" && location.startsWith(url));
  };

  const handleAdminNav = (e: React.MouseEvent, tab: string) => {
    e.preventDefault();
    // Mettre à jour l'état local immédiatement pour un highlight instantané
    setActiveAdminTab(tab);
    const href = `/admin?tab=${tab}`;
    window.history.pushState({}, "", href);
    // Notifier AdminPage via popstate
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <img src={logoImg} alt="SWIZKOTE" className="h-8 w-auto object-contain flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-widest whitespace-nowrap uppercase">
              SWIZKOTE
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {isAdmin ? t("nav_admin") : t("nav_space")}
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? t("nav_admin") : "SWIZKOTE"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isAdmin ? (
                adminMenuItems.map(item => {
                  const isActive = activeAdminTab === item.tab;
                  return (
                    <SidebarMenuItem key={item.tab}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <a
                          href={`/admin?tab=${item.tab}`}
                          onClick={(e) => handleAdminNav(e, item.tab)}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              ) : (
                clientMenuItems.map(item => {
                  const isActive = isClientLinkActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback className="bg-gold/20 text-gold text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">{user?.fullName}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="flex-shrink-0" data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
