import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRY_PHONE_CODES, COUNTRIES } from "@/lib/constants";

const registerSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  tx_id: z.string().min(1),
  phone_country_code: z.string().min(1),
  phone_number: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  country: z.string().min(1),
  occupation: z.string().min(1),
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegistrationForm = () => {
  const [loading, setLoading] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone_country_code: "+62|ID", // penting!
      country: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);

    try {
      let paymentProofUrl: string | null = null;

      // ======================
      // UPLOAD FILE
      // ======================
      if (paymentFile) {
        const fileExt = paymentFile.name.split(".").pop();
        const fileName = `${data.tx_id}_${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } =
          await supabase.storage
            .from("payment-proofs")
            .upload(fileName, paymentFile);

        if (uploadError) {
          toast.error(uploadError.message);
          setLoading(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("payment-proofs")
          .getPublicUrl(uploadData.path);

        paymentProofUrl = urlData.publicUrl;
      }

      // ======================
      // INSERT TO DATABASE
      // ======================
      const phoneCode = data.phone_country_code.split("|")[0];

      const { error } = await supabase.from("bookings").insert({
        ...data,
        phone_country_code: phoneCode,
        payment_proof_url: paymentProofUrl,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("Registration successful!");
      reset();
      setPaymentFile(null);

    } catch (err: any) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <Input {...register("full_name")} placeholder="Full Name" />
          <Input {...register("email")} type="email" placeholder="Email" />
          <Input {...register("tx_id")} placeholder="Transaction ID" />

          {/* ========================= */}
          {/* PHONE COUNTRY CODE FIXED */}
          {/* ========================= */}
          <Select
            value={watch("phone_country_code")}
            onValueChange={(v) => setValue("phone_country_code", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Country Code" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_PHONE_CODES.map((c) => (
                <SelectItem
                  key={`${c.code}-${c.country}`}
                  value={`${c.code}|${c.country}`}
                >
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input {...register("phone_number")} placeholder="Phone Number" />
          <Input {...register("address")} placeholder="Address" />
          <Input {...register("city")} placeholder="City" />
          <Input {...register("province")} placeholder="State" />

          {/* COUNTRY SELECT */}
          <Select
            value={watch("country")}
            onValueChange={(v) => setValue("country", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c, i) => (
                <SelectItem key={`${c}-${i}`} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input {...register("occupation")} placeholder="Occupation" />

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Processing..." : "REGISTER"}
          </Button>

        </form>
      </div>
    </section>
  );
};

export default RegistrationForm;