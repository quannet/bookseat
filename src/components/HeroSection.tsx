import heroMoon from "@/assets/star1.jpg";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <img
        src={heroMoon}
        alt="Moon surface with spacecraft"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <p className="text-sm font-body tracking-[0.3em] uppercase text-muted-foreground animate-fade-in-up mb-4">
          Your Journey Beyond Earth
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-foreground text-glow animate-fade-in-up-delay leading-tight">
          BOOK YOUR SEAT<br />TO THE MOON
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl animate-fade-in-up-delay-2 font-body">
          Secure your place on humanity's next great adventure. Register your MoonBase booking and receive your official confirmation.
        </p>
        <div className="mt-10 flex gap-4 animate-fade-in-up-delay-2">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider px-8"
            onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
          >
            REGISTER NOW
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-border text-foreground hover:bg-secondary font-display tracking-wider px-8"
            onClick={() => document.getElementById('check')?.scrollIntoView({ behavior: 'smooth' })}
          >
            CHECK BOOKING
          </Button>
        </div>
      </div>
      <button
        onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
};

export default HeroSection;
