import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/">
              <a className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-route text-white text-xl"></i>
                </div>
                <span className="text-2xl font-bold">Travel<span className="text-primary">Plan</span></span>
              </a>
            </Link>
            <p className="text-neutral-400 mb-4">
              Your smart travel companion for budget-friendly itineraries and personalized recommendations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition" aria-label="Pinterest">
                <i className="fab fa-pinterest"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Home</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Popular Destinations</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Budget Travel Tips</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Saved Itineraries</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Travel Guides</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Cookie Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Newsletter</h4>
            <p className="text-neutral-400 mb-3">
              Subscribe to our newsletter for travel tips and exclusive offers.
            </p>
            <form className="space-y-2">
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="rounded-r-none bg-neutral-800 border-neutral-700 focus:border-primary"
                />
                <Button className="rounded-l-none" aria-label="Subscribe">
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </div>
              <div className="text-xs text-neutral-400">
                We respect your privacy. Unsubscribe at any time.
              </div>
            </form>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400 text-sm">
          <p>© 2023 TravelPlan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
