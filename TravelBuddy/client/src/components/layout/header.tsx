import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const handleNavigate = () => {
    setOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-route text-white text-xl"></i>
            </div>
            <span className="text-2xl font-bold text-neutral-900">Travel<span className="text-primary">Plan</span></span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/">
            <a className="text-neutral-900 hover:text-primary transition font-medium">Home</a>
          </Link>
          <Link href="/saved-trips">
            <a className="text-neutral-600 hover:text-primary transition">Saved Trips</a>
          </Link>
          <Link href="/explore">
            <a className="text-neutral-600 hover:text-primary transition">Explore</a>
          </Link>
          <Link href="/help">
            <a className="text-neutral-600 hover:text-primary transition">Help</a>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button className="hidden md:block">
            Sign In
          </Button>

          {/* Mobile menu button */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                <Link href="/" onClick={handleNavigate}>
                  <a className="text-lg font-medium">Home</a>
                </Link>
                <Link href="/saved-trips" onClick={handleNavigate}>
                  <a className="text-lg">Saved Trips</a>
                </Link>
                <Link href="/explore" onClick={handleNavigate}>
                  <a className="text-lg">Explore</a>
                </Link>
                <Link href="/help" onClick={handleNavigate}>
                  <a className="text-lg">Help</a>
                </Link>
                <Button className="mt-4 w-full">Sign In</Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
