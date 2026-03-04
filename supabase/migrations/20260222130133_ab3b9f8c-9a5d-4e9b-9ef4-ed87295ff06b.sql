-- =========================
-- BOOKINGS TABLE
-- =========================

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  tx_id TEXT NOT NULL UNIQUE,
  phone_country_code TEXT NOT NULL DEFAULT '+62',
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  country TEXT NOT NULL,
  occupation TEXT NOT NULL,
  payment_proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can register a booking" ON public.bookings;
CREATE POLICY "Anyone can register a booking"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read bookings" ON public.bookings;
CREATE POLICY "Anyone can read bookings"
ON public.bookings
FOR SELECT
TO public
USING (true);


-- =========================
-- STORAGE BUCKET
-- =========================

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;


-- =========================
-- STORAGE POLICIES
-- =========================

DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Allow public view" ON storage.objects;
CREATE POLICY "Allow public view"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');


-- =========================
-- AUTO UPDATE TIMESTAMP
-- =========================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();