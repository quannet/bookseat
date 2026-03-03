import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRY_PHONE_CODES, COUNTRIES } from "@/lib/constants";
import { Upload, Loader2, CheckCircle, Copy } from "lucide-react";

const registerSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  tx_id: z.string().trim().min(1, "TXid is required").max(100),
  phone_country_code: z.string().min(1, "Select country code"),
  phone_number: z.string().trim().min(1, "Phone number is required").max(20),
  address: z.string().trim().min(1, "Address is required").max(300),
  city: z.string().trim().min(1, "City is required").max(100),
  province: z.string().trim().min(1, "Province is required").max(100),
  country: z.string().min(1, "Select country"),
  occupation: z.string().trim().min(1, "Occupation is required").max(100),
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegistrationForm = () => {
  const [loading, setLoading] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { phone_country_code: '+1', country: '' },
  });

  const OFFICIAL_WALLET = "0x24d0cc9ca78fd7d6d6a2fecd62541da6dd4f8334";
  const BOOKING_PRICE = "5 BNB";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(OFFICIAL_WALLET);
      setCopied(true);
      toast.success("Wallet address copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      let paymentProofUrl: string | null = null;

      if (paymentFile) {
        const fileExt = paymentFile.name.split('.').pop();
        const fileName = `${data.tx_id}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, paymentFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(uploadData.path);
        paymentProofUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('bookings').insert({
        full_name: data.full_name,
        email: data.email,
        tx_id: data.tx_id,
        phone_country_code: data.phone_country_code,
        phone_number: data.phone_number,
        address: data.address,
        city: data.city,
        province: data.province,
        country: data.country,
        occupation: data.occupation,
        payment_proof_url: paymentProofUrl,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error("TXid has been registered. Please check your booking status..");
        } else {
          throw error;
        }
        return;
      }

      setSuccess(true);
      toast.success("Registration successful! Your booking has been recorded..");
      reset();
      setPaymentFile(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      toast.error(err.message || "An error occurred. Please try again..");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20";

  return (
    <section id="register" className="relative py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.3em] uppercase text-primary font-body mb-2">Registration</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            BOOK YOUR SEAT
          </h2>
          <p className="mt-3 text-muted-foreground font-body">
            Register yourself for a trip to the Moon
          </p>
        </div>

        {/* Payment Information Card */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                Booking Price: <span className="text-primary text-2xl ml-2">{BOOKING_PRICE}</span>
              </h3>
              <p className="text-sm text-muted-foreground font-body mb-3">
                Send exactly 5 BNB to the official wallet address below:
              </p>
              <div className="flex items-center gap-2 bg-background/50 p-3 rounded-lg border border-border">
                <code className="text-xs md:text-sm font-mono text-foreground break-all">
                  {OFFICIAL_WALLET}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="shrink-0 hover:bg-primary/10"
                >
                  <Copy className="w-4 h-4" />
                  <span className="sr-only">Copy address</span>
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-body">
            ⚠️ Only send BNB (BEP-20) to this address. After payment, enter your TXid below and upload the proof.
          </p>
        </div>

        {success && (
          <div className="mb-8 p-4 rounded-lg bg-success/10 border border-success/30 flex items-center gap-3 text-success">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="font-body text-sm">Registration successful! Save your TXid to check your booking status..</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-foreground font-body text-sm">Full Name *</Label>
              <Input {...register("full_name")} placeholder="Elon Musk" className={inputClass} />
              {errors.full_name && <p className="text-destructive text-xs">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-body text-sm">Email *</Label>
              <Input {...register("email")} type="email" placeholder="john@example.com" className={inputClass} />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-body text-sm">Transaction ID (TXid) *</Label>
            <Input {...register("tx_id")} placeholder="0x..." className={inputClass} />
            {errors.tx_id && <p className="text-destructive text-xs">{errors.tx_id.message}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Enter the TXid from your 5 BNB payment to the official wallet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-foreground font-body text-sm">Telephone Country Code *</Label>
              <Select
                value={watch("phone_country_code")}
                onValueChange={(v) => setValue("phone_country_code", v)}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Select code" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {COUNTRY_PHONE_CODES.map((c) => (
                    <SelectItem key={c.country} value={c.code} className="text-foreground">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.phone_country_code && <p className="text-destructive text-xs">{errors.phone_country_code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-body text-sm">Phone Number *</Label>
              <Input {...register("phone_number")} placeholder="345678999" className={inputClass} />
              {errors.phone_number && <p className="text-destructive text-xs">{errors.phone_number.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-body text-sm">Address*</Label>
            <Input {...register("address")} placeholder="Blake street" className={inputClass} />
            {errors.address && <p className="text-destructive text-xs">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label className="text-foreground font-body text-sm">City *</Label>
              <Input {...register("city")} placeholder="Los Angeles" className={inputClass} />
              {errors.city && <p className="text-destructive text-xs">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-body text-sm">State *</Label>
              <Input {...register("province")} placeholder="California" className={inputClass} />
              {errors.province && <p className="text-destructive text-xs">{errors.province.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-body text-sm">Country *</Label>
              <Select
                value={watch("country")}
                onValueChange={(v) => setValue("country", v)}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-foreground">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && <p className="text-destructive text-xs">{errors.country.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-body text-sm">Occupation *</Label>
            <Input {...register("occupation")} placeholder="Software Engineer" className={inputClass} />
            {errors.occupation && <p className="text-destructive text-xs">{errors.occupation.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-body text-sm">BNB Payment Proof (5 BNB)</Label>
            <div className="relative">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                className="hidden"
                id="payment-proof"
              />
              <label
                htmlFor="payment-proof"
                className={`flex items-center gap-3 p-4 rounded-lg border border-dashed cursor-pointer transition-colors ${
                  paymentFile
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border hover:border-primary/30 bg-secondary'
                }`}
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-body">
                  {paymentFile ? paymentFile.name : 'Upload proof of 5 BNB payment (image/PDF)'}
                </span>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider py-6 text-base"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> PROCESSING...</>
            ) : (
              'REGISTER BOOKING - 5 BNB'
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6 font-body">
          By registering, you agree to our terms and conditions. Price: 5 BNB (non-refundable)
        </p>
      </div>
    </section>
  );
};

export default RegistrationForm;