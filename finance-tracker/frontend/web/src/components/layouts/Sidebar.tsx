import {
  Home,
  CreditCard,
  Settings,
  PieChart,
  Target,
  TrendingUp,
} from "lucide-react";

const MainNav = () => {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: <Home className="w-5 h-5" />,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Transazioni",
      icon: <CreditCard className="w-5 h-5" />,
      href: "/transactions",
      active: pathname === "/transactions",
    },
    {
      label: "Analisi",
      icon: <TrendingUp className="w-5 h-5" />,
      href: "/analytics",
      active: pathname.startsWith("/analytics"),
    },
    {
      label: "Budget",
      icon: <PieChart className="w-5 h-5" />,
      href: "/budget",
      active: pathname === "/budget",
    },
    {
      label: "Obiettivi",
      icon: <Target className="w-5 h-5" />,
      href: "/goals",
      active: pathname === "/goals",
    },
  ];
};
