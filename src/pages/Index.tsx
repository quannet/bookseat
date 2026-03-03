import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RegistrationForm from "@/components/RegistrationForm";
import CheckBooking from "@/components/CheckBooking";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <RegistrationForm />
      <CheckBooking />
      <Footer />
    </main>
  );
};

export default Index;
