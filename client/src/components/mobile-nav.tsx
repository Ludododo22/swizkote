import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  LayoutDashboard, ArrowLeftRight, Wallet,
  TrendingUp, MessageSquare, FileText, Shield, UserCircle,
} from "lucide-react";

export function MobileNav() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [location] = useLocation();
  const isAdmin = user?.role === "admin";

  const clientItems = [
    { url: "/dashboard",    icon: LayoutDashboard, label: t("nav_dashboard")    },
    { url: "/transfers",    icon: ArrowLeftRight,  label: t("nav_transfers")    },
    { url: "/accounts",     icon: Wallet,          label: t("nav_accounts")     },
    { url: "/loans",        icon: TrendingUp,      label: t("nav_loans")        },
    { url: "/messages",     icon: MessageSquare,   label: t("nav_messages")     },
    { url: "/profile",      icon: UserCircle,      label: t("nav_profile")      },
  ];

  const adminItems = [
    { url: "/admin", icon: Shield, label: t("nav_admin") },
  ];

  const items = isAdmin ? adminItems : clientItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border flex items-stretch h-16 safe-area-bottom">
      {items.map((item) => {
        const isActive =
          location === item.url ||
          (item.url !== "/dashboard" && !item.url.includes("?") && location.startsWith(item.url));
        return (
          <Link key={item.url} href={item.url} className="flex-1 min-w-0">
            <div
              className={`relative flex flex-col items-center justify-center h-full gap-0.5 transition-all px-1 ${
                isActive
                  ? "text-[hsl(var(--gold))]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {/* Active indicator top bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-[hsl(var(--gold))]" />
              )}
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-transform ${
                  isActive ? "stroke-[2.2] scale-110" : "stroke-[1.6]"
                }`}
              />
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