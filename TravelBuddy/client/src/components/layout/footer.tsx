import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary rounded-full p-2 text-white">
                <i className="fas fa-plane-departure text-xl"></i>
              </div>
              <div className="font-bold text-xl text-white flex items-center">
                Travel<span className="text-primary">Plan</span>
              </div>
            </div>
            <p className="text-neutral-400 mb-4">
              Your personal travel companion for creating budget-friendly itineraries with all the details you need.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-neutral-400 hover:text-white transition-colors">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/saved-trips">
                  <a className="text-neutral-400 hover:text-white transition-colors">Saved Trips</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-neutral-400 hover:text-white transition-colors">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-neutral-400 hover:text-white transition-colors">Contact</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Popular Destinations</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">🗼</span> Paris, France
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">🗽</span> New York, USA
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">🏯</span> Tokyo, Japan
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">🏰</span> Rome, Italy
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">🏝️</span> Bali, Indonesia
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Newsletter</h4>
            <p className="text-neutral-400 mb-4">
              Subscribe to our newsletter for travel tips and exclusive deals.
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-neutral-800 text-white px-4 py-2 rounded-l-md focus:outline-none flex-grow"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark transition-colors">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} TravelPlan. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy">
              <a className="text-neutral-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
            </Link>
            <Link href="/terms">
              <a className="text-neutral-400 hover:text-white transition-colors text-sm">Terms of Service</a>
            </Link>
            <Link href="/cookies">
              <a className="text-neutral-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
