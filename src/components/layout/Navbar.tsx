
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeToggle from "../ThemeToggle";
import { LanguageSelector } from "../LanguageSelector";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const isMobile = useIsMobile();

  return (
    <nav className="border-b sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <LanguageSelector />
          <Button variant="ghost" size="icon" asChild>
            <a href="/profile">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
