import lunarLogo from "@/assets/lunarlogo.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-background/60 backdrop-blur-md border-b border-border/50">
      
      {/* Left Section */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <img 
          src={lunarLogo} 
          alt="Lunar Logo" 
          className="h-10 w-auto object-contain"
        />

        {/* Booking Info */}
        <div className="hidden md:flex flex-col leading-tight">
          <span className="text-sm font-semibold text-foreground">
            5 BNB – Book Your Seat
          </span>
          <span className="text-xs text-muted-foreground">
            This is a seat reservation only. Final price will be announced before launch.
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        <a 
          href="#register" 
          className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
        >
          Register
        </a>
        <a 
          href="#check" 
          className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
        >
          Check Booking
        </a>
      </div>
    </nav>
  );
};

export default Navbar;