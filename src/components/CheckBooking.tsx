import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Loader2, User, Mail, MapPin, Phone, Briefcase, Hash, Calendar, FileCheck } from "lucide-react";

interface BookingResult {
  id: string;
  full_name: string;
  email: string;
  tx_id: string;
  phone_country_code: string;
  phone_number: string;
  address: string;
  city: string;
  province: string;
  country: string;
  occupation: string;
  status: string;
  created_at: string;
  payment_proof_url: string | null;
}

const CheckBooking = () => {
  const [searchTxId, setSearchTxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTxId.trim()) {
      toast.error("Enter TXid to search for bookings.");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('tx_id', searchTxId.trim())
        .maybeSingle();

      if (error) throw error;
      setResult(data);
      if (!data) toast.info("Booking not found. Please double-check your TXid.");
    } catch (err: any) {
      toast.error(err.message || "There is an error.");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = result?.status === 'confirmed'
    ? 'bg-success/10 text-success border-success/30'
    : result?.status === 'pending'
    ? 'bg-warning/10 text-warning border-warning/30'
    : 'bg-muted text-muted-foreground border-border';

  return (
    <section id="check" className="relative py-24 px-4 border-t border-border/50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.3em] uppercase text-primary font-body mb-2">Verification</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            CHECK YOUR BOOKING
          </h2>
          <p className="mt-3 text-muted-foreground font-body">
            Enter Transaction ID to view your booking status.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <Input
            value={searchTxId}
            onChange={(e) => setSearchTxId(e.target.value)}
            placeholder="Enter your TXid..."
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary flex-1"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider px-6"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </form>

        {searched && result && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-6 border-glow">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-foreground">Booking Details</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-body font-semibold border uppercase tracking-wider ${statusColor}`}>
                {result.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={<User className="w-4 h-4" />} label="Name" value={result.full_name} />
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={result.email} />
              <InfoRow icon={<Hash className="w-4 h-4" />} label="TXid" value={result.tx_id} />
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={`${result.phone_country_code} ${result.phone_number}`} />
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address" value={`${result.address}, ${result.city}`} />
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="State" value={`${result.province}, ${result.country}`} />
              <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Occupation" value={result.occupation} />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Registration Date" value={new Date(result.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
            </div>

            {result.payment_proof_url && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <FileCheck className="w-4 h-4" />
                  <span className="font-body">Proof of payment</span>
                </div>
                <a
                  href={result.payment_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline font-body"
                >
                  View Proof of Payment →
                </a>
              </div>
            )}
          </div>
        )}

        {searched && !result && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-body">
              Booking not found. Please make sure your TXid is correct or{" "}
              <a href="#register" className="text-primary hover:underline">register yourself</a>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-muted-foreground">{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground font-body">{label}</p>
      <p className="text-sm text-foreground font-body break-all">{value}</p>
    </div>
  </div>
);

export default CheckBooking;