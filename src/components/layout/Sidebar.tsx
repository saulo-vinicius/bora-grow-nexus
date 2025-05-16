
import { Home, Plant, Calculator, FileText, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const navigationItems = [
    { icon: Home, label: t("menu.home"), href: "/" },
    { icon: Plant, label: t("menu.myPlants"), href: "/plants" },
    { icon: Calculator, label: t("menu.calculator"), href: "/calculator" },
    { icon: FileText, label: t("menu.recipes"), href: "/recipes" },
    { icon: User, label: t("menu.profile"), href: "/profile" },
  ];

  // Close sidebar when clicking a link on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <div
      className={cn(
        "bg-background z-50 h-screen transition-all duration-300 border-r",
        isOpen ? "w-64" : "w-0",
        isMobile && isOpen ? "fixed inset-y-0 left-0" : "",
        isMobile && !isOpen ? "hidden" : ""
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-xl font-bold flex-1">Bora Grow</h2>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
      <div className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md",
              location.pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={handleLinkClick}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
