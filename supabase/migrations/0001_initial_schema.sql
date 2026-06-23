-- Create Artists Table
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Releases Table
CREATE TABLE IF NOT EXISTS public.releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    release_date DATE NOT NULL,
    artwork TEXT,
    status TEXT DEFAULT 'upcoming',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT NOT NULL,
    campaign_stage TEXT NOT NULL,
    status TEXT DEFAULT 'Scheduled',
    activity_date DATE NOT NULL,
    owner TEXT,
    notes TEXT,
    external_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
    generated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_rate NUMERIC(5, 2)
);

-- Add initial data seed for artists based on the required list
INSERT INTO public.artists (id, name, image, bio)
VALUES 
    ('415b3c3c-8c3c-41c1-8408-725ec306cc94', 'Rema', 'https://i.scdn.co/image/ab6761610000e5ebf4626451ff59c5989a1af18d', 'Global Afrorave superstar and international crossover icon.'),
    ('a7d9fc08-410a-471a-b605-6fbf3e0f0980', 'Boy Spyce', 'https://i.scdn.co/image/ab6761610000e5eb197bbae6b5439d5998812a75', 'Songwriter and vocalist blending Afrobeats with R&B.'),
    ('ec0c2104-cd97-40ad-bd68-f9b88eb32c4a', 'Lovn', 'https://i.scdn.co/image/ab6761610000e5ebec25a174ae701bb33adea163', 'Emerging voice bringing emotional depth to Afropop.'),
    ('7184fc31-c483-4a18-8686-2a62886f6889', 'CupidSZN', 'https://i.scdn.co/image/ab6761610000e5eb57bab8e67da94644fa331941', 'Genre-defying artist bridging Afrobeats and Amapiano.'),
    ('97be0f14-e0c1-4b13-ab45-84074f762696', 'Johnny Drille', 'https://i.scdn.co/image/ab6761610000e5ebc3ccd7643d7964556ae14c06', 'Alternative Afro-pop singer-songwriter with cinematic sound.'),
    ('50b1a03e-c68e-4f76-ae0e-749e7b25ad36', 'LADIPOE', 'https://i.scdn.co/image/ab6761610000e5eb68d6673fac6ffc9df4507fab', 'Lyrical heavyweight fusing rap with Afrobeats.'),
    ('b4a9b5f5-0814-469b-8e10-bf9d02cd3ea5', 'Ayra Starr', 'https://i.scdn.co/image/ab6761610000e5eb8bfd832e0547c4acabe6e67c', 'Afrobeats breakout artist and Mavin Records flagship act.'),
    ('11e40eb8-d6dc-4fcb-8211-13cf20562e6e', 'Bayanni', 'https://i.scdn.co/image/ab6761610000e5ebec9db3d4de7709c1425c9e92', 'Rising Afrobeats artist known for high-energy performances.'),
    ('9fb7701f-d232-4e4b-97e3-cd7ff17df520', 'Magixx', 'https://i.scdn.co/image/ab6761610000e5eb7ac2f480f0edc357026b1844', 'Versatile performer and prolific songwriter.')
ON CONFLICT (id) DO NOTHING;
