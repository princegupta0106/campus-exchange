
-- Add college field to profiles table
ALTER TABLE public.profiles ADD COLUMN college TEXT;

-- Create a colleges table for the dropdown options
CREATE TABLE public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add some default colleges
INSERT INTO public.colleges (name) VALUES
  ('Indian Institute of Technology (IIT) Delhi'),
  ('Indian Institute of Technology (IIT) Bombay'),
  ('Indian Institute of Technology (IIT) Kanpur'),
  ('Indian Institute of Technology (IIT) Madras'),
  ('Indian Institute of Management (IIM) Ahmedabad'),
  ('Indian Institute of Management (IIM) Bangalore'),
  ('Delhi University'),
  ('Jawaharlal Nehru University'),
  ('Banaras Hindu University'),
  ('Aligarh Muslim University'),
  ('Jamia Millia Islamia'),
  ('Manipal Institute of Technology'),
  ('VIT University'),
  ('SRM Institute of Science and Technology'),
  ('Amity University');

-- Enable RLS on colleges table
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read colleges for the dropdown
CREATE POLICY "Anyone can view colleges" ON public.colleges FOR SELECT USING (true);

-- Allow authenticated users to add new colleges
CREATE POLICY "Authenticated users can add colleges" ON public.colleges FOR INSERT WITH CHECK (auth.role() = 'authenticated');
