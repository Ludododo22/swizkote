import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  LayoutDashboard, ArrowLeftRight, Wallet,
  TrendingUp, MessageSquare, UserCircle,
  BarChart3, Users, UserPlus, FileDown, CreditCard,
} from "lucide-react";

export function MobileNav() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [location] = useLocation();
  const isAdmin = user?.role === "admin";

  const getAdminTab = () => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("tab") || "stats";
    }
    return "stats";
  };

  const clientItems = [
    { url: "/dashboard",    icon: LayoutDashboard, label: t("nav_dashboard") },
    { url: "/transfers",    icon: ArrowLeftRight,  label: t("nav_transfers") },
    { url: "/accounts",     icon: Wallet,          label: t("nav_accounts")  },
    { url: "/loans",        icon: TrendingUp,      label: t("nav_loans")     },
    { url: "/messages",     icon: MessageSquare,   label: t("nav_messages")  },
    { url: "/profile",      icon: UserCircle,      label: t("nav_profile")   },
  ];

  const adminItems = [
    { tab: "stats",    icon: BarChart3,      label: "Stats"     },
    { tab: "clients",  icon: Users,          label: "Clients"   },
    { tab: "create",   icon: UserPlus,       label: "Nouveau"   },
    { tab: "loans",    icon: TrendingUp,     label: "Dossiers"  },
    { tab: "cards",    icon: CreditCard,     label: "Cartes"    },
    { tab: "messages", icon: MessageSquare,  label: "Messages"  },
    { tab: "pdf",      icon: FileDown,       label: "PDF"       },
  ];

  if (isAdmin) {
    const activeTab = getAdminTab();
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border flex items-stretch h-14 safe-area-bottom overflow-x-auto">
        {adminItems.map((item) => {
          const isActive = activeTab === item.tab;
          const Icon = item.icon;
          return (
            <a
              key={item.tab}
              href={`/admin?tab=${item.tab}`}
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, "", `/admin?tab=${item.tab}`);
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              className="flex-1 min-w-[50px]"
            >
              <div className={`relative flex flex-col items-center justify-center h-full gap-0.5 transition-all px-1 ${
                isActive ? "text-[hsl(var(--gold))]" : "text-muted-foreground hover:text-foreground"
              }`}>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-b-full bg-[hsl(var(--gold))]" />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? "stroke-[2.2] scale-110" : "stroke-[1.6]"}`} />
                <span className="text-[8px] font-medium leading-none truncate w-full text-center px-0.5">
                  {item.label}
                </span>
              </div>
            </a>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border flex items-stretch h-14 safe-area-bottom">
      {clientItems.map((item) => {
        const isActive =
          location === item.url ||
          (item.url !== "/dashboard" && !item.url.includes("?") && location.startsWith(item.url));
        return (
          <Link key={item.url} href={item.url} className="flex-1 min-w-0">
            <div className={`relative flex flex-col items-center justify-center h-full gap-0.5 transition-all px-1 ${
              isActive ? "text-[hsl(var(--gold))]" : "text-muted-foreground hover:text-foreground"
            }`}>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-b-full bg-[hsl(var(--gold))]" />
              )}
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform ${isActive ? "stroke-[2.2] scale-110" : "stroke-[1.6]"}`} />
              <span className="text-[9px] font-medium leading-none truncate w-full text-center px-0.5">
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
