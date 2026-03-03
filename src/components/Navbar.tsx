import lunarLogo from "@/assets/lunarlogo.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-background/60 backdrop-blur-md border-b border-border/50">
      
      {/* Logo */}
      <img 
        src={lunarLogo} 
        alt="Lunar Logo" 
        className="h-10 w-auto object-contain"
      />

      <div className="flex items-center gap-6">
        <a href="#register" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
          Register
        </a>
        <a href="#check" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
          Check Booking
        </a>
      </div>
    </nav>
  );
};

export default Navbar;