import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const isMobile = useMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <div className="bg-primary rounded-full p-2 text-white">
              <i className="fas fa-plane-departure text-xl"></i>
            </div>
            <div className="font-bold text-xl text-neutral-900 flex items-center">
              Travel<span className="text-primary">Buddy</span>
              <span className="ml-1 text-yellow-500 animate-bounce">✈️</span>
            </div>
          </a>
        </Link>

        {isMobile ? (
          <div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
            
            {mobileMenuOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border-b border-neutral-200 py-4 px-4 shadow-md">
                <nav className="flex flex-col space-y-4">
                  <Link href="/">
                    <a className="text-neutral-600 hover:text-primary transition-colors flex items-center">
                      <i className="fas fa-home mr-2"></i> Home
                    </a>
                  </Link>
                  <Link href="/saved-trips">
                    <a className="text-neutral-600 hover:text-primary transition-colors flex items-center">
                      <i className="fas fa-bookmark mr-2"></i> Saved Trips
                    </a>
                  </Link>
                  <Link href="/about">
                    <a className="text-neutral-600 hover:text-primary transition-colors flex items-center">
                      <i className="fas fa-info-circle mr-2"></i> About
                    </a>
                  </Link>
                  <div className="pt-2 border-t border-neutral-200">
                    <Button className="w-full">
                      <i className="fas fa-plus mr-2"></i> New Trip
                    </Button>
                  </div>
                </nav>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <Link href="/">
                <a className="text-neutral-600 hover:text-primary transition-colors flex items-center">
                  <i className="fas fa-home mr-1"></i> Home
                </a>
              </Link>
              <Link href="/saved-trips">
                <a className="text-neutral-600 hover:text-primary transition-colors flex items-center">
                  <i className="fas fa-bookmark mr-1"></i> Saved Trips
                </a>
              </Link>
              <Link href="/about">
                <a className="text-neutral-600 hover:text-primary transition-colors flex items-center">
                  <i className="fas fa-info-circle mr-1"></i> About
                </a>
              </Link>
            </nav>
            <Button>
              <i className="fas fa-plus mr-2"></i> New Trip
            </Button>
          </div>
        )}
      </div>
      
      {/* Fun travel-themed banner */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 py-1 text-white text-center text-sm font-medium overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-2">✈️ Adventure awaits!</span>
          <span className="mx-2">🏨 Find perfect stays</span>
          <span className="mx-2">🍽️ Discover local cuisine</span>
          <span className="mx-2">🗺️ Explore hidden gems</span>
          <span className="mx-2">🏖️ Beach getaways</span>
          <span className="mx-2">⛰️ Mountain escapes</span>
          <span className="mx-2">🌆 City adventures</span>
          <span className="mx-2">🚂 Epic journeys</span>
        </div>
      </div>
    </header>
  );
}
