import MoonBaseLogo from "./MoonBaseLogo";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12 px-4 bg-background">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <MoonBaseLogo />
        </div>

        {/* Copyright */}
        <p className="text-sm text-muted-foreground font-body text-center md:text-right">
          © {new Date().getFullYear()} MoonBase. All rights reserved.
        </p>

      </div>
    </footer>
  );
};

export default Footer;