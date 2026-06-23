"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  LayoutDashboard, Calendar, Users, Disc3, Activity, FileBarChart2, Search,
  Settings, ChevronRight, Plus, Bell, CheckCircle2, Clock, XCircle, AlertCircle,
  Filter, Download, ExternalLink, ChevronLeft, ChevronDown, ArrowUpRight,
  Menu, X, MoreHorizontal, Sparkles, Radio, Tv, Camera, Music, Mic2, Share2,
  Globe, Zap, Star, TrendingUp, Play, FileText, Hash, BarChart3, Layers,
} from "lucide-react";
import {
  AreaChart, Area, ComposedChart, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay,
  isToday, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth, addDays, subDays,
} from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivityStatus = "Scheduled" | "In Progress" | "Completed" | "Cancelled";
type CampaignStage = "Pre-Release" | "Release Week" | "Post-Release";
type ActivityType =
  | "DSP Placement" | "Creator Campaign" | "Social Media" | "Influencer"
  | "Media Interview" | "Radio" | "TV" | "Ad Campaign" | "Event" | "Livestream"
  | "Photoshoot" | "Music Video" | "Editorial" | "Partnership" | "Other";

interface CampaignActivity {
  id: string;
  releaseId: string;
  title: string;
  description: string;
  type: ActivityType;
  stage: CampaignStage;
  status: ActivityStatus;
  date: string;
  owner: string;
  notes: string;
  externalLink: string;
}

interface Release {
  id: string;
  artistId: string;
  title: string;
  releaseDate: string;
  artwork: string;
  description: string;
  status: "active" | "completed" | "upcoming";
  type?: string;
}

interface Artist {
  id: string;
  name: string;
  image: string;
  bio: string;
}

interface Track {
  id: string;
  artistId: string;
  name: string;
  durationMs: number;
  previewUrl: string;
  albumImage: string;
}

type Page =
  | "dashboard" | "calendar" | "artists" | "artist-profile"
  | "releases" | "release-detail" | "activities" | "reports"
  | "extraction" | "settings";

// ─── Sample Data ──────────────────────────────────────────────────────────────

const ARTISTS: Artist[] = [
  { id: "ayra", name: "Ayra Starr", image: "https://i.scdn.co/image/ab6761610000e5eb8bfd832e0547c4acabe6e67c", bio: "Afrobeats breakout artist and Mavin Records flagship act." },
  { id: "bayanni", name: "Bayanni", image: "https://i.scdn.co/image/ab6761610000e5ebec9db3d4de7709c1425c9e92", bio: "Rising Afrobeats artist known for high-energy performances." },
  { id: "boyspyce", name: "Boy Spyce", image: "https://i.scdn.co/image/ab6761610000e5eb197bbae6b5439d5998812a75", bio: "Songwriter and vocalist blending Afrobeats with R&B." },
  { id: "cupid", name: "CupidSZN", image: "https://i.scdn.co/image/ab6761610000e5eb57bab8e67da94644fa331941", bio: "Genre-defying artist bridging Afrobeats and Amapiano." },
  { id: "johnny", name: "Johnny Drille", image: "https://i.scdn.co/image/ab6761610000e5ebc3ccd7643d7964556ae14c06", bio: "Alternative Afro-pop singer-songwriter with cinematic sound." },
  { id: "ladipoe", name: "LADIPOE", image: "https://i.scdn.co/image/ab6761610000e5eb68d6673fac6ffc9df4507fab", bio: "Lyrical heavyweight fusing rap with Afrobeats." },
  { id: "lovn", name: "Lovn", image: "https://i.scdn.co/image/ab6761610000e5ebec25a174ae701bb33adea163", bio: "Emerging voice bringing emotional depth to Afropop." },
  { id: "magixx", name: "Magixx", image: "https://i.scdn.co/image/ab6761610000e5eb7ac2f480f0edc357026b1844", bio: "Versatile performer and prolific songwriter." },
  { id: "rema", name: "Rema", image: "https://i.scdn.co/image/ab6761610000e5ebf4626451ff59c5989a1af18d", bio: "Global Afrorave superstar and international crossover icon." },
];

const RELEASES: Release[] = [
  { id: "r1", artistId: "magixx", title: "Juice & Liquor", releaseDate: "2024-03-15", artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop&auto=format", description: "Second studio album exploring themes of desire and celebration.", status: "active" },
  { id: "r2", artistId: "ayra", title: "Commas", releaseDate: "2024-02-09", artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&auto=format", description: "Bold declaration of financial power and feminine confidence.", status: "completed" },
  { id: "r3", artistId: "rema", title: "Calm Down (Deluxe)", releaseDate: "2024-01-26", artwork: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop&auto=format", description: "Extended edition of the global hit featuring new tracks.", status: "completed" },
  { id: "r4", artistId: "bayanni", title: "Zoom", releaseDate: "2024-04-05", artwork: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&h=200&fit=crop&auto=format", description: "Infectious single combining Afrobeats rhythms with electronic production.", status: "active" },
  { id: "r5", artistId: "johnny", title: "Before We Fall Asleep", releaseDate: "2024-05-20", artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop&auto=format", description: "Introspective EP capturing late-night contemplations.", status: "upcoming" },
  { id: "r6", artistId: "ladipoe", title: "Providence", releaseDate: "2024-03-28", artwork: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop&auto=format", description: "Full-length project establishing LADIPOE as a generational voice.", status: "active", type: "album" },
  { id: "r7", artistId: "boyspyce", title: "Phases", releaseDate: "2024-02-14", artwork: "https://images.unsplash.com/photo-1508700929628-c7b8f28a8a70?w=200&h=200&fit=crop&auto=format", description: "Debut EP navigating love, growth, and identity.", status: "completed", type: "album" },
  { id: "r8", artistId: "magixx", title: "No Competition", releaseDate: "2023-11-10", artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop&auto=format", description: "Chart-topping single that broke streaming records.", status: "completed", type: "single" },
  { id: "r9", artistId: "ladipoe", title: "Many People", releaseDate: "2024-06-05", artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&auto=format", description: "Highly anticipated single focusing on relatable life stories.", status: "upcoming", type: "single" },
  { id: "2DDaN7Pgx9uDPd8IbWWW9H", artistId: "rema", title: "HEIS", releaseDate: "2024-07-10", artwork: "https://i.scdn.co/image/ab67616d0000b27319df46a8fa3d972ff4c84275", description: "Studio Album by Rema", status: "active", type: "album" },
  { id: "0nayxjaX54Frd7GsZq6Pbs", artistId: "rema", title: "Rave & Roses Ultra", releaseDate: "2023-04-27", artwork: "https://i.scdn.co/image/ab67616d0000b273963265801aa5c9740ad159b7", description: "Studio Album by Rema", status: "active", type: "album" },
  { id: "1f2tf19jXXPg3uVcYO0WZ3", artistId: "rema", title: "Rave & Roses", releaseDate: "2021-05-18", artwork: "https://i.scdn.co/image/ab67616d0000b273d68842aec8d8a5deec2c664c", description: "Studio Album by Rema", status: "active", type: "album" },
  { id: "32V31xJ7RTgNQB3qyMevei", artistId: "rema", title: "Goals (FIFA World Cup 2026™)", releaseDate: "2026-05-21", artwork: "https://i.scdn.co/image/ab67616d0000b27360b3e4ddf88b2b8b750eac54", description: "Single/EP by LISA", status: "active", type: "single" },
  { id: "2Ib8eWQ9x7SQmYq2VjXLwt", artistId: "rema", title: "Moviestar", releaseDate: "2026-04-16", artwork: "https://i.scdn.co/image/ab67616d0000b273b9d428bb1f5e15965f6816b2", description: "Single/EP by Rema", status: "active", type: "single" },
  { id: "7Me0lVWxSy5AGNBCgcFEAZ", artistId: "rema", title: "Ballerina (with Rema, Skillibeng, & Disco Neil)", releaseDate: "2026-02-27", artwork: "https://i.scdn.co/image/ab67616d0000b273596b0cc59aa4905fb4053519", description: "Single/EP by Silent Addy", status: "active", type: "single" },
  { id: "7ny0e34ZBM5JuGCRXOPNym", artistId: "rema", title: "Secondhand (feat. Rema)", releaseDate: "2026-01-27", artwork: "https://i.scdn.co/image/ab67616d0000b2730010090daf44f9c81317f82c", description: "Single/EP by Don Toliver", status: "active", type: "single" },
  { id: "3GFFUCTXVKgoGEjMgjCsqW", artistId: "rema", title: "Who’s Dat Girl", releaseDate: "2025-10-17", artwork: "https://i.scdn.co/image/ab67616d0000b2730b2ac553094996786771b49c", description: "Single/EP by Ayra Starr", status: "active", type: "single" },
  { id: "46QsilgIDjNfmkhXQltZmZ", artistId: "rema", title: "FUN", releaseDate: "2025-09-05", artwork: "https://i.scdn.co/image/ab67616d0000b27366e58284256f704decf7be28", description: "Single/EP by Rema", status: "active", type: "single" },
  { id: "0dTlxJzKKFaUdPoW7aIQIa", artistId: "rema", title: "KELEBU", releaseDate: "2025-08-01", artwork: "https://i.scdn.co/image/ab67616d0000b2734394d303a54ed6ca638c579b", description: "Single/EP by Rema", status: "active", type: "single" },
  { id: "1SKQZBp2bLPP3OMqoYAwkJ", artistId: "boyspyce", title: "RED PILL", releaseDate: "2026-05-29", artwork: "https://i.scdn.co/image/ab67616d0000b2733355352a94ad7d4c26460275", description: "Single/EP by Boy Spyce", status: "active", type: "single" },
  { id: "0Nqwx5p51hPWe2zQ3YGbKQ", artistId: "boyspyce", title: "Super Woman", releaseDate: "2026-05-14", artwork: "https://i.scdn.co/image/ab67616d0000b2733e1481c467394577b6c156de", description: "Single/EP by Dalex", status: "active", type: "single" },
  { id: "6wZV3F5q3vtN1gBA17UR0l", artistId: "boyspyce", title: "Arise", releaseDate: "2026-03-27", artwork: "https://i.scdn.co/image/ab67616d0000b27348be4d3069170852d219d34a", description: "Single/EP by Boy Spyce", status: "active", type: "single" },
  { id: "54yU6X4VQVGSfe7GGSQ4Pg", artistId: "boyspyce", title: "Igboro", releaseDate: "2026-01-23", artwork: "https://i.scdn.co/image/ab67616d0000b273feef42e51418877163f7ccfa", description: "Single/EP by Boy Spyce", status: "active", type: "single" },
  { id: "20C5dmwQk5SHtoG7MkKvnY", artistId: "boyspyce", title: "Achalugo", releaseDate: "2025-04-25", artwork: "https://i.scdn.co/image/ab67616d0000b273ba88be4555be01921245626f", description: "Single/EP by Boy Spyce", status: "active", type: "single" },
  { id: "3dV6dktBCe7l03Ju0WCaPS", artistId: "boyspyce", title: "I'll Be There", releaseDate: "2025-01-31", artwork: "https://i.scdn.co/image/ab67616d0000b273fd2fe3251249e0b987362016", description: "Single/EP by Boy Spyce", status: "active", type: "single" },
  { id: "3PgRJ8ovhyeq5B0mja444K", artistId: "boyspyce", title: "Pretty Woman (Remixes)", releaseDate: "2024-11-08", artwork: "https://i.scdn.co/image/ab67616d0000b27329f6cfa40097b03eed87801c", description: "Single/EP by Constantin", status: "active", type: "single" },
  { id: "10nuYHrbzaxMMlGcXqARgE", artistId: "boyspyce", title: "Pretty Woman (Long Version)", releaseDate: "2024-11-08", artwork: "https://i.scdn.co/image/ab67616d0000b2736edd1f0ebff9ac0f59dcf65c", description: "Single/EP by Costi", status: "active", type: "single" },
  { id: "4rAvN7aWSeV7E13e18MCUL", artistId: "boyspyce", title: "Talk", releaseDate: "2024-10-25", artwork: "https://i.scdn.co/image/ab67616d0000b2738422c3a8e826a64d540b2a32", description: "Single/EP by Boy Spyce", status: "active", type: "single" },
  { id: "2kqJb2Ku6gkBUfXuttzgcl", artistId: "boyspyce", title: "Shout (Sped Up)", releaseDate: "2024-09-19", artwork: "https://i.scdn.co/image/ab67616d0000b273364efe771d2404faddda07b6", description: "Single/EP by Boy Spyce", status: "active", type: "single" },
  { id: "4Zm9Uo3atRc7urLrzvudn0", artistId: "lovn", title: "Available", releaseDate: "2026-04-24", artwork: "https://i.scdn.co/image/ab67616d0000b27342b0704f5ce9acb517c3c92c", description: "Single/EP by Lovn", status: "active", type: "single" },
  { id: "4CNkV9CTes6bwemvcv6OhE", artistId: "lovn", title: "OMO TI O COMMON", releaseDate: "2026-03-06", artwork: "https://i.scdn.co/image/ab67616d0000b273e1d0b56f015fc46e503f7638", description: "Single/EP by Lovn", status: "active", type: "single" },
  { id: "3uoKJof8T6N1Tkfr1nwfNy", artistId: "lovn", title: "Do Not Disturb (DND)", releaseDate: "2026-01-23", artwork: "https://i.scdn.co/image/ab67616d0000b2737566e4b146b378aee1876a3e", description: "Single/EP by Lovn", status: "active", type: "single" },
  { id: "1lZd6dVzx246LSOxv54c4w", artistId: "lovn", title: "Sorry I'm Busy", releaseDate: "2025-11-27", artwork: "https://i.scdn.co/image/ab67616d0000b273c632f5de8d4b2497bd2a953f", description: "Single/EP by Lovn", status: "active", type: "single" },
  { id: "50YSO09axJCQApnUh2DORI", artistId: "lovn", title: "Hosanna", releaseDate: "2024-05-16", artwork: "https://i.scdn.co/image/ab67616d0000b273850cd4056066f84af61b2c11", description: "Single/EP by Lovn", status: "active", type: "single" },
  { id: "2mgrjvpAdLTaeMFNIWlRz6", artistId: "lovn", title: "Orgasm", releaseDate: "2024-02-09", artwork: "https://i.scdn.co/image/ab67616d0000b27319747fc15fb727b3164d06c4", description: "Single/EP by Lovn", status: "active", type: "single" },
  { id: "3rBhsljGGbsFt2Z5W7x6Yj", artistId: "lovn", title: "This Is Lovn", releaseDate: "2022-09-30", artwork: "https://i.scdn.co/image/ab67616d0000b273f959aa70980007dbf366be03", description: "Single/EP by Lovn", status: "active", type: "single" },
  { id: "2TAGnvTVVDYumxewnTzXBO", artistId: "lovn", title: "Caution", releaseDate: "2022-09-02", artwork: "https://i.scdn.co/image/ab67616d0000b2731fadde5797c0e485370bcfa6", description: "Single/EP by Lovn", status: "active", type: "single" },
  { id: "5kCJdAYu6TLDAOvUDW9r9w", artistId: "lovn", title: "Abena", releaseDate: "2022-03-18", artwork: "https://i.scdn.co/image/ab67616d0000b27325e83b4e14bb9564768eaca4", description: "Single/EP by Lovn", status: "active", type: "single" },
  { id: "0ORYGBhSHeVpjKoslUKZas", artistId: "cupid", title: "Hashtag", releaseDate: "2026-06-05", artwork: "https://i.scdn.co/image/ab67616d0000b27399efe6560ee908281e54605d", description: "Single/EP by CupidSZN", status: "active", type: "single" },
  { id: "5bPOkxU0VV6Zs36F4xyKMk", artistId: "cupid", title: "darkest secrets / CHAKAM", releaseDate: "2026-05-29", artwork: "https://i.scdn.co/image/ab67616d0000b2731f956232bca97db0346b9915", description: "Single/EP by Uncle Bubu", status: "active", type: "single" },
  { id: "2SpdKSADlr33BKhYxThmi9", artistId: "cupid", title: "PALAVA (DJ MIX)", releaseDate: "2026-05-13", artwork: "https://i.scdn.co/image/ab67616d0000b273bde10c3fe19ee9b953b6adbb", description: "Single/EP by CupidSZN", status: "active", type: "single" },
  { id: "3N5IJC3q2cl4nwlY3W0Z8H", artistId: "cupid", title: "Amuni", releaseDate: "2026-03-20", artwork: "https://i.scdn.co/image/ab67616d0000b2737801e756c88bee4bad56c79c", description: "Single/EP by CupidSZN", status: "active", type: "single" },
  { id: "0XsJxNAIkFEWrHSuWYgHK5", artistId: "cupid", title: "Super", releaseDate: "2026-01-30", artwork: "https://i.scdn.co/image/ab67616d0000b2737747d5094e0472c8e6f327b0", description: "Single/EP by CupidSZN", status: "active", type: "single" },
  { id: "3zQqn6nxT3nl4KT057EbY3", artistId: "cupid", title: "MYTH-ERA", releaseDate: "2025-11-13", artwork: "https://i.scdn.co/image/ab67616d0000b27391618a937d445348bd14da3f", description: "Single/EP by CupidSZN", status: "active", type: "single" },
  { id: "0LRe4arxBGysYf7l9rM5Pf", artistId: "cupid", title: "I Want More", releaseDate: "2025-05-30", artwork: "https://i.scdn.co/image/ab67616d0000b273923732ca081062dc2bb1c268", description: "Single/EP by CupidSZN", status: "active", type: "single" },
  { id: "6bkycFw24zf6RlwZq6SY9w", artistId: "cupid", title: "Osogeme", releaseDate: "2025-01-24", artwork: "https://i.scdn.co/image/ab67616d0000b2731b23d25e872c334b5bec4bcf", description: "Single/EP by Wademix", status: "active", type: "single" },
  { id: "63X6WhszEIoXrVCFBAfNFT", artistId: "cupid", title: "Service (Sped Up)", releaseDate: "2024-09-25", artwork: "https://i.scdn.co/image/ab67616d0000b27363c2d1ff08d4f25c6c2dcc2b", description: "Single/EP by CupidSZN", status: "active", type: "single" },
  { id: "6RxOYbrRvkRnBaRoEknEYy", artistId: "cupid", title: "Service", releaseDate: "2024-09-20", artwork: "https://i.scdn.co/image/ab67616d0000b273413298091b19dfcbaa0354e2", description: "Single/EP by CupidSZN", status: "active", type: "single" },
  { id: "2ReT5MpfcBcllICauo5NNr", artistId: "johnny", title: "Before The Morning Light", releaseDate: "2026-05-15", artwork: "https://i.scdn.co/image/ab67616d0000b27317506c66fe628144a00e7aa1", description: "Studio Album by Johnny Drille", status: "active", type: "album" },
  { id: "441l8XES0cGPxR78sXUQok", artistId: "johnny", title: "Johnny’s Room Live 4", releaseDate: "2023-12-30", artwork: "https://i.scdn.co/image/ab67616d0000b273b8e578e3ec8e6d491b83956e", description: "Studio Album by Johnny Drille", status: "active", type: "album" },
  { id: "7C5KGWmdxiwR52GCR7JO9K", artistId: "johnny", title: "Before We Fall Asleep", releaseDate: "2021-09-03", artwork: "https://i.scdn.co/image/ab67616d0000b27330cd3311552f975a1a0c5f48", description: "Studio Album by Johnny Drille", status: "active", type: "album" },
  { id: "01lvzRf5Io2dBoDk2TuEiQ", artistId: "johnny", title: "Stars Align (From the Original Motion Picture “Call of My Life”)", releaseDate: "2026-05-10", artwork: "https://i.scdn.co/image/ab67616d0000b273fc958134cdf3eb156545fe07", description: "Single/EP by Johnny Drille", status: "active", type: "single" },
  { id: "1P8BZuY2ZRlCPzXhSly5eZ", artistId: "johnny", title: "Colorado", releaseDate: "2026-04-10", artwork: "https://i.scdn.co/image/ab67616d0000b2730cacf3891ca709d464b1cbe5", description: "Single/EP by Johnny Drille", status: "active", type: "single" },
  { id: "6XUgrldDupyhi4bmDKScIP", artistId: "johnny", title: "Last Forever", releaseDate: "2026-02-13", artwork: "https://i.scdn.co/image/ab67616d0000b273f93247872113fe0cb076e222", description: "Single/EP by Johnny Drille", status: "active", type: "single" },
  { id: "0Vriv2DkUhqVMyJsGlz5Ut", artistId: "johnny", title: "I'm Available", releaseDate: "2026-01-31", artwork: "https://i.scdn.co/image/ab67616d0000b273c4ecb322d38b0205890883b8", description: "Single/EP by Johnny Drille", status: "active", type: "single" },
  { id: "34FtA5y3NfmDleizvsjiWD", artistId: "johnny", title: "Over The Moon", releaseDate: "2025-08-15", artwork: "https://i.scdn.co/image/ab67616d0000b27353c7bc42d698843cd7c367b4", description: "Single/EP by Johnny Drille", status: "active", type: "single" },
  { id: "792yssMtxw2ho4UZl23L4X", artistId: "johnny", title: "Angelina", releaseDate: "2025-04-11", artwork: "https://i.scdn.co/image/ab67616d0000b273365326f64c53ec56b7e58191", description: "Single/EP by Johnny Drille", status: "active", type: "single" },
  { id: "1UxjoXYJBDwQ4npIGWQhS6", artistId: "johnny", title: "Police", releaseDate: "2025-04-10", artwork: "https://i.scdn.co/image/ab67616d0000b273befcb16be8f65384a7c11f8f", description: "Single/EP by Kizz Daniel", status: "active", type: "single" },
  { id: "3DlhJ97XCthypfMPdgb3Mx", artistId: "ladipoe", title: "T.A.P (Talk About Poe)", releaseDate: "2018-10-05", artwork: "https://i.scdn.co/image/ab67616d0000b2737b900349e867c9dc0f93ecdb", description: "Studio Album by LADIPOE", status: "active", type: "album" },
  { id: "70JkP23kQm8ufn4XS6Bv0q", artistId: "ladipoe", title: "Many People", releaseDate: "2026-06-05", artwork: "https://i.scdn.co/image/ab67616d0000b27389c35c8ae13367918cbe6023", description: "Single/EP by LADIPOE", status: "active", type: "single" },
  { id: "6iKVn15atmmWwvz3qZFaVl", artistId: "ladipoe", title: "Motho Waka", releaseDate: "2026-01-23", artwork: "https://i.scdn.co/image/ab67616d0000b273e3f049ed64eff2fdf9bed3ca", description: "Single/EP by LADIPOE", status: "active", type: "single" },
  { id: "2ALybwwwe9YvLxFV7Ok5nK", artistId: "ladipoe", title: "NBA", releaseDate: "2025-10-03", artwork: "https://i.scdn.co/image/ab67616d0000b27377a82ba95776f58ff601d7ad", description: "Single/EP by LADIPOE", status: "active", type: "single" },
  { id: "1M6bYAJ0BlpTvH9GpJBvPN", artistId: "ladipoe", title: "Folasade", releaseDate: "2025-06-13", artwork: "https://i.scdn.co/image/ab67616d0000b273925ba033642600f34b948a90", description: "Single/EP by LADIPOE", status: "active", type: "single" },
  { id: "7MfB9wSvVjmxV7VfD1gU7q", artistId: "ladipoe", title: "Olufunmi (The Missing Recipe)", releaseDate: "2025-05-23", artwork: "https://i.scdn.co/image/ab67616d0000b27331454beedaca5de40047bf58", description: "Single/EP by LADIPOE", status: "active", type: "single" },
  { id: "1XXEd7C4V7evuhzCC1aYtw", artistId: "ladipoe", title: "I No Be God", releaseDate: "2025-03-21", artwork: "https://i.scdn.co/image/ab67616d0000b273945d039fe724e24d074d1e27", description: "Single/EP by LADIPOE", status: "active", type: "single" },
  { id: "4NKJzYRQc1POilG4lil3IN", artistId: "ladipoe", title: "EKWE", releaseDate: "2024-11-14", artwork: "https://i.scdn.co/image/ab67616d0000b273e44c48f70934e7cd8026501c", description: "Single/EP by LADIPOE", status: "active", type: "single" },
  { id: "21sRdNR6C6BHH4iqpQ2EpV", artistId: "ladipoe", title: "Compose", releaseDate: "2024-09-26", artwork: "https://i.scdn.co/image/ab67616d0000b27379d4a0a0f88236168678ab9a", description: "Single/EP by LADIPOE", status: "active", type: "single" },
  { id: "3pqhwdNsbyzuXL54RMUjNw", artistId: "ladipoe", title: "Hennessy Cypher", releaseDate: "2024-06-26", artwork: "https://i.scdn.co/image/ab67616d0000b27334f3d2dd1093623aea991cae", description: "Single/EP by Sarkodie", status: "active", type: "single" },
  { id: "1W25XYjRQPob14CkgOYVms", artistId: "ayra", title: "The Year I Turned 21", releaseDate: "2024-05-30", artwork: "https://i.scdn.co/image/ab67616d0000b273fa88b93bb6dde97f7258cdec", description: "Studio Album by Ayra Starr", status: "active", type: "album" },
  { id: "16ppCNm1KGCgUS0g3iKqh8", artistId: "ayra", title: "19 & Dangerous (Deluxe)", releaseDate: "2022-10-21", artwork: "https://i.scdn.co/image/ab67616d0000b2734828f4b04d92d6641be98cc5", description: "Studio Album by Ayra Starr", status: "active", type: "album" },
  { id: "0AjdvP8p42lwSzmN0PpwJv", artistId: "ayra", title: "19 & Dangerous", releaseDate: "2021-08-06", artwork: "https://i.scdn.co/image/ab67616d0000b273123783d21fb9ab6f00db2424", description: "Studio Album by Ayra Starr", status: "active", type: "album" },
  { id: "2zQhdFu3XNlJe6hvZwKQ6U", artistId: "ayra", title: "Tornado", releaseDate: "2026-06-12", artwork: "https://i.scdn.co/image/ab67616d0000b273a34c5712641f0b1439bdbf02", description: "Single/EP by Ayra Starr", status: "active", type: "single" },
  { id: "4uehWsaRaI59i4vZgQKQOB", artistId: "ayra", title: "Where Do We Go (Peggy Gou Remix)", releaseDate: "2026-04-28", artwork: "https://i.scdn.co/image/ab67616d0000b27368968acba930bfdfbd8ef764", description: "Single/EP by Ayra Starr", status: "active", type: "single" },
  { id: "1P8BZuY2ZRlCPzXhSly5eZ", artistId: "ayra", title: "Colorado", releaseDate: "2026-04-10", artwork: "https://i.scdn.co/image/ab67616d0000b2730cacf3891ca709d464b1cbe5", description: "Single/EP by Johnny Drille", status: "active", type: "single" },
  { id: "6qg58bqEAREvTlAo0ytie9", artistId: "ayra", title: "Aye Kan (Are You Coming Back?) [feat. Ayra Starr]", releaseDate: "2026-03-27", artwork: "https://i.scdn.co/image/ab67616d0000b27337699290606b76e1c99f25c7", description: "Single/EP by Angelique Kidjo", status: "active", type: "single" },
  { id: "22G67mCJChTPDKcEan8LOh", artistId: "ayra", title: "Where Do We Go", releaseDate: "2026-03-06", artwork: "https://i.scdn.co/image/ab67616d0000b273e2d9544c47e8a5d298daa6b8", description: "Single/EP by Ayra Starr", status: "active", type: "single" },
  { id: "0ZqiMWe35VRRPpsmva9rVT", artistId: "ayra", title: "MON BÉBÉ (feat. Ayra Starr)", releaseDate: "2026-02-20", artwork: "https://i.scdn.co/image/ab67616d0000b2733174b0e35155c61e7b02a0c4", description: "Single/EP by RnBoi", status: "active", type: "single" },
  { id: "6oYatHAnMc7BL6WB5ZbRrs", artistId: "ayra", title: "On A Low", releaseDate: "2025-12-04", artwork: "https://i.scdn.co/image/ab67616d0000b27334da6b8a817aca8d2c943141", description: "Single/EP by Elestee", status: "active", type: "single" },
  { id: "6VS0zvMt7Rrdv8bZrMlCfE", artistId: "bayanni", title: "VALLAH (From “Cocktail 2”)", releaseDate: "2026-06-09", artwork: "https://i.scdn.co/image/ab67616d0000b2739725b73ab1b68ed08fe76c4d", description: "Single/EP by Pritam", status: "active", type: "single" },
  { id: "1Qg0C5ICE3bsQTSym87OaL", artistId: "bayanni", title: "Stick to the Plan", releaseDate: "2026-02-27", artwork: "https://i.scdn.co/image/ab67616d0000b2731ccd38a67814b917a70b9604", description: "Single/EP by Bayanni", status: "active", type: "single" },
  { id: "2W6hDvOtf3AloLmKkoiXpt", artistId: "bayanni", title: "MENU", releaseDate: "2025-10-03", artwork: "https://i.scdn.co/image/ab67616d0000b27344cdd1b6e1828fe2fba67b76", description: "Single/EP by Bayanni", status: "active", type: "single" },
  { id: "2O6QjA5omcQkQqL3WRXm95", artistId: "bayanni", title: "Namipa", releaseDate: "2025-06-27", artwork: "https://i.scdn.co/image/ab67616d0000b27369dd159d6268ef951de6704a", description: "Single/EP by Bayanni", status: "active", type: "single" },
  { id: "1Ls0a3Dh4vKHKwL1Y3OuD7", artistId: "bayanni", title: "Love & Hustle", releaseDate: "2025-03-28", artwork: "https://i.scdn.co/image/ab67616d0000b2739a667cec5b15675e03c1cb83", description: "Single/EP by Bayanni", status: "active", type: "single" },
  { id: "4DekJgQN6z4P2EuSnhUIx9", artistId: "bayanni", title: "Bukhaar", releaseDate: "2025-01-17", artwork: "https://i.scdn.co/image/ab67616d0000b27311d810990ecb6d776065ee66", description: "Single/EP by Aroob Khan", status: "active", type: "single" },
  { id: "6j2qGIcbWhbCx7NK8CXstK", artistId: "bayanni", title: "For Where?", releaseDate: "2024-11-29", artwork: "https://i.scdn.co/image/ab67616d0000b27352771b456d6a3296652a411a", description: "Single/EP by Bayanni", status: "active", type: "single" },
  { id: "1fodM3sDOkOnRyzSJjlSiR", artistId: "bayanni", title: "Goddess", releaseDate: "2024-08-30", artwork: "https://i.scdn.co/image/ab67616d0000b2732e6f0f07852c0ef783d1564a", description: "Single/EP by Bayanni", status: "active", type: "single" },
  { id: "3WcAZQlQPsmeewc90tLg7H", artistId: "bayanni", title: "Finish Me (AEIOU)", releaseDate: "2024-07-19", artwork: "https://i.scdn.co/image/ab67616d0000b27388a53d982db27f491015b30f", description: "Single/EP by Bayanni", status: "active", type: "single" },
  { id: "11zCWribSWYW7CaBSf7gjT", artistId: "bayanni", title: "Ta Ta Ta", releaseDate: "2024-04-26", artwork: "https://i.scdn.co/image/ab67616d0000b273a3ac50e1383553a366946895", description: "Single/EP by &friends", status: "active", type: "single" },
  { id: "1f2GqjFMA3dTYF6CNVAQdh", artistId: "magixx", title: "I Dream In Color", releaseDate: "2025-02-28", artwork: "https://i.scdn.co/image/ab67616d0000b273458bfc85ccfa207a4a53fc5b", description: "Studio Album by Magixx", status: "active", type: "album" },
  { id: "5MlDvYvYASREJcq5nJN0OZ", artistId: "magixx", title: "Juice & Liquor", releaseDate: "2026-05-22", artwork: "https://i.scdn.co/image/ab67616d0000b273b708fb79295165a45f08e343", description: "Single/EP by Magixx", status: "active", type: "single" },
  { id: "5NcCuIJqdsnTB6YvSKx29j", artistId: "magixx", title: "Everyday", releaseDate: "2026-01-16", artwork: "https://i.scdn.co/image/ab67616d0000b27372db14e7dc7a2e134a0eedd0", description: "Single/EP by Magixx", status: "active", type: "single" },
  { id: "6YAQbL9OqngFPVbw4el0i3", artistId: "magixx", title: "RUM", releaseDate: "2025-10-31", artwork: "https://i.scdn.co/image/ab67616d0000b27314ddef9685b199539c986a4e", description: "Single/EP by Juno", status: "active", type: "single" },
  { id: "2ufNBHYADGeBl0FYZP07fB", artistId: "magixx", title: "Broken", releaseDate: "2025-08-29", artwork: "https://i.scdn.co/image/ab67616d0000b27324777edc78f6232bf2c6d88e", description: "Single/EP by Tiphe", status: "active", type: "single" },
  { id: "6FvHEmAaSR9mgfQVC0XpZm", artistId: "magixx", title: "UNLIMITED", releaseDate: "2025-08-15", artwork: "https://i.scdn.co/image/ab67616d0000b273303ebbb2e56eb97e43e3afe5", description: "Single/EP by Magixx", status: "active", type: "single" },
  { id: "5QdAd20r4hhVvaLFyicr95", artistId: "magixx", title: "My Shayla", releaseDate: "2025-07-18", artwork: "https://i.scdn.co/image/ab67616d0000b273408867472c67a99e14d19409", description: "Single/EP by Mavins", status: "active", type: "single" },
  { id: "2P3HUjiMqIuzFNFUaGSIQ9", artistId: "magixx", title: "i think i love you 2", releaseDate: "2025-03-14", artwork: "https://i.scdn.co/image/ab67616d0000b2736520fa7438b8a20be853f5f3", description: "Single/EP by ru.", status: "active", type: "single" },
  { id: "73Z3iEJZUJxplEjmD5UZkw", artistId: "magixx", title: "Winter & Summer", releaseDate: "2025-01-22", artwork: "https://i.scdn.co/image/ab67616d0000b273b2b5ae5474c4b381d5768ddf", description: "Single/EP by Magixx", status: "active", type: "single" },
  { id: "0Ju3LStL4uh8YqHCnJ53yf", artistId: "magixx", title: "Lemme Know", releaseDate: "2024-10-23", artwork: "https://i.scdn.co/image/ab67616d0000b273e692d28e23f30ecc17432c03", description: "Single/EP by Magixx", status: "active", type: "single" },
];

const TRACKS: Track[] = [];

const ACTIVITIES: CampaignActivity[] = [
  // Magixx - Juice & Liquor
  { id: "a1", releaseId: "r1", title: "Apple Music Big 5 Placement", description: "Secure editorial placement on Apple Music Big 5 playlist", type: "DSP Placement", stage: "Pre-Release", status: "Completed", date: "2024-03-08", owner: "Kola Adeyemi", notes: "Confirmed with Apple editorial team", externalLink: "https://music.apple.com" },
  { id: "a2", releaseId: "r1", title: "DSP Editorial Photoshoot", description: "Premium photoshoot for DSP cover artwork", type: "Photoshoot", stage: "Pre-Release", status: "Completed", date: "2024-03-05", owner: "Tunde Bello", notes: "Shot at Lagos studio", externalLink: "" },
  { id: "a3", releaseId: "r1", title: "Spotify New Music Friday", description: "Pitch for New Music Friday Africa and Global", type: "DSP Placement", stage: "Pre-Release", status: "Completed", date: "2024-03-14", owner: "Kola Adeyemi", notes: "Confirmed for Africa version", externalLink: "" },
  { id: "a4", releaseId: "r1", title: "TikTok Live Launch", description: "Live performance and Q&A on TikTok for release day", type: "Livestream", stage: "Release Week", status: "Completed", date: "2024-03-15", owner: "Zara Mensah", notes: "500k viewers peak", externalLink: "https://tiktok.com" },
  { id: "a5", releaseId: "r1", title: "Pappi Reacts Feature", description: "YouTube reaction with Pappi Reacts channel", type: "Creator Campaign", stage: "Release Week", status: "Completed", date: "2024-03-16", owner: "Zara Mensah", notes: "2M views in 48 hours", externalLink: "" },
  { id: "a6", releaseId: "r1", title: "Stationhead Streaming Party", description: "Hosted streaming party on Stationhead platform", type: "Event", stage: "Release Week", status: "Completed", date: "2024-03-17", owner: "Ife Okafor", notes: "Great fan engagement", externalLink: "" },
  { id: "a7", releaseId: "r1", title: "Genovevah Umeh Short Film", description: "Artistic short film collaboration for album promo", type: "Music Video", stage: "Post-Release", status: "In Progress", date: "2024-04-10", owner: "Tunde Bello", notes: "In post-production", externalLink: "" },
  { id: "a8", releaseId: "r1", title: "ISWIS Podcast Interview", description: "Feature interview on I Said What I Said podcast", type: "Media Interview", stage: "Post-Release", status: "Cancelled", date: "2024-04-20", owner: "Ife Okafor", notes: "Host scheduling conflict", externalLink: "" },
  { id: "a9", releaseId: "r1", title: "Radio Promo Tour Lagos", description: "Live appearances across major Lagos radio stations", type: "Radio", stage: "Release Week", status: "Completed", date: "2024-03-18", owner: "Ife Okafor", notes: "Beat FM, Cool FM, Smooth FM", externalLink: "" },

  // Ayra Starr - Commas
  { id: "a10", releaseId: "r2", title: "Vogue Africa Cover Story", description: "Cover feature in Vogue Africa digital edition", type: "Editorial", stage: "Pre-Release", status: "Completed", date: "2024-02-01", owner: "Kemi Lagos", notes: "Historic first cover", externalLink: "" },
  { id: "a11", releaseId: "r2", title: "Instagram Reels Campaign", description: "Coordinated Reels rollout with 20 influencers", type: "Social Media", stage: "Pre-Release", status: "Completed", date: "2024-02-05", owner: "Zara Mensah", notes: "45M impressions total", externalLink: "" },
  { id: "a12", releaseId: "r2", title: "BET Awards Performance", description: "Live performance at BET Awards ceremony", type: "TV", stage: "Post-Release", status: "Completed", date: "2024-03-10", owner: "Kemi Lagos", notes: "Standing ovation", externalLink: "" },
  { id: "a13", releaseId: "r2", title: "Creator Challenge TikTok", description: "Branded dance challenge on TikTok with $50k creator fund", type: "Creator Campaign", stage: "Release Week", status: "Completed", date: "2024-02-09", owner: "Zara Mensah", notes: "1.2B views on challenge", externalLink: "" },
  { id: "a14", releaseId: "r2", title: "Spotify Marquee Campaign", description: "Targeted Spotify Marquee ad for existing listeners", type: "Ad Campaign", stage: "Release Week", status: "Completed", date: "2024-02-09", owner: "Kola Adeyemi", notes: "42% CTR", externalLink: "" },

  // Rema - Calm Down Deluxe
  { id: "a15", releaseId: "r3", title: "BBC 1Xtra Feature", description: "Exclusive interview and mini concert for BBC 1Xtra", type: "Radio", stage: "Pre-Release", status: "Completed", date: "2024-01-20", owner: "Kemi Lagos", notes: "Global broadcast", externalLink: "" },
  { id: "a16", releaseId: "r3", title: "Global Press Junket", description: "Press tour across NYC, London, Paris, Lagos", type: "Media Interview", stage: "Release Week", status: "Completed", date: "2024-01-26", owner: "Kemi Lagos", notes: "32 interviews total", externalLink: "" },
  { id: "a17", releaseId: "r3", title: "YouTube Premiere Event", description: "Exclusive YouTube premiere with live chat", type: "Livestream", stage: "Release Week", status: "Completed", date: "2024-01-26", owner: "Ife Okafor", notes: "800k concurrent viewers", externalLink: "" },

  // Bayanni - Zoom
  { id: "a18", releaseId: "r4", title: "TikTok Pre-Save Campaign", description: "TikTok native ads driving pre-save links", type: "Ad Campaign", stage: "Pre-Release", status: "Completed", date: "2024-03-28", owner: "Zara Mensah", notes: "250k pre-saves", externalLink: "" },
  { id: "a19", releaseId: "r4", title: "Audiomack Spotlight", description: "Audiomack editorial spotlight feature", type: "DSP Placement", stage: "Release Week", status: "In Progress", date: "2024-04-05", owner: "Kola Adeyemi", notes: "Awaiting confirmation", externalLink: "" },
  { id: "a20", releaseId: "r4", title: "Trace TV Performance", description: "Live performance on Trace Africa TV", type: "TV", stage: "Post-Release", status: "Scheduled", date: "2024-04-25", owner: "Ife Okafor", notes: "Booked for May slot", externalLink: "" },

  // LADIPOE - Providence
  { id: "a21", releaseId: "r6", title: "YouTube Documentary", description: "Behind the scenes album documentary on YouTube", type: "Music Video", stage: "Pre-Release", status: "Completed", date: "2024-03-20", owner: "Tunde Bello", notes: "5M views", externalLink: "" },
  { id: "a22", releaseId: "r6", title: "Beats 1 Radio Interview", description: "Feature interview on Apple Beats 1", type: "Radio", stage: "Release Week", status: "Completed", date: "2024-03-28", owner: "Kemi Lagos", notes: "Zane Lowe hosted", externalLink: "" },
  { id: "a23", releaseId: "r6", title: "Rap Caviar Playlist", description: "Pitch for Spotify Rap Caviar placement", type: "DSP Placement", stage: "Release Week", status: "Scheduled", date: "2024-04-15", owner: "Kola Adeyemi", notes: "Pending editorial review", externalLink: "" },
  { id: "a24", releaseId: "r6", title: "Africa Now Tour Announcement", description: "Press announcement for upcoming Africa Now Tour", type: "Event", stage: "Post-Release", status: "Scheduled", date: "2024-05-01", owner: "Ife Okafor", notes: "10 city tour confirmed", externalLink: "" },

  // Johnny Drille - Before We Fall Asleep
  { id: "a25", releaseId: "r5", title: "Pre-Save Link Campaign", description: "Email + social pre-save campaign to existing fanbase", type: "Social Media", stage: "Pre-Release", status: "In Progress", date: "2024-05-10", owner: "Zara Mensah", notes: "Campaign live", externalLink: "" },
  { id: "a26", releaseId: "r5", title: "Intimate Release Show Lagos", description: "Exclusive intimate live performance for media and fans", type: "Event", stage: "Release Week", status: "Scheduled", date: "2024-05-20", owner: "Ife Okafor", notes: "Venue: Harbour Point Lagos", externalLink: "" },
];

// ─── Derived helpers ───────────────────────────────────────────────────────────

function getArtist(id: string) { return ARTISTS.find(a => a.id === id); }
function getRelease(id: string) { return RELEASES.find(r => r.id === id); }
function getArtistReleases(artistId: string) { return RELEASES.filter(r => r.artistId === artistId); }
function getArtistTracks(artistId: string) { return TRACKS.filter(t => t.artistId === artistId); }
function getReleaseActivities(releaseId: string) { return ACTIVITIES.filter(a => a.releaseId === releaseId); }
function getArtistActivities(artistId: string) {
  const releaseIds = getArtistReleases(artistId).map(r => r.id);
  return ACTIVITIES.filter(a => releaseIds.includes(a.releaseId));
}
function completionRate(activities: CampaignActivity[], status?: string) {
  if (status === "active") return 60;
  if (status === "completed") return 100;
  if (!activities.length) return 0;
  return Math.round((activities.filter(a => a.status === "Completed").length / activities.length) * 100);
}

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ActivityStatus, string> = {
  "Completed": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "In Progress": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "Scheduled": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Cancelled": "text-red-400 bg-red-400/10 border-red-400/20",
};
const STATUS_DOT: Record<ActivityStatus, string> = {
  "Completed": "bg-emerald-400",
  "In Progress": "bg-amber-400",
  "Scheduled": "bg-blue-400",
  "Cancelled": "bg-red-400",
};
const STAGE_COLORS: Record<CampaignStage, string> = {
  "Pre-Release": "text-neutral-700 bg-neutral-100 border-neutral-300",
  "Release Week": "text-stone-700 bg-stone-100 border-stone-300",
  "Post-Release": "text-slate-700 bg-slate-100 border-slate-300",
};
const TYPE_ICONS: Partial<Record<ActivityType, React.ReactNode>> = {
  "DSP Placement": <Music size={12} />,
  "Creator Campaign": <Sparkles size={12} />,
  "Social Media": <Share2 size={12} />,
  "Radio": <Radio size={12} />,
  "TV": <Tv size={12} />,
  "Photoshoot": <Camera size={12} />,
  "Event": <Star size={12} />,
  "Livestream": <Play size={12} />,
  "Media Interview": <Mic2 size={12} />,
  "Ad Campaign": <Zap size={12} />,
  "Music Video": <FileText size={12} />,
  "Editorial": <Hash size={12} />,
  "Partnership": <Globe size={12} />,
};

function StatusBadge({ status }: { status: ActivityStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono font-medium ${STATUS_COLORS[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}
function StageBadge({ stage }: { stage: CampaignStage }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-mono font-medium ${STAGE_COLORS[stage]}`}>
      {stage}
    </span>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { id: "calendar", label: "Calendar", icon: <Calendar size={16} /> },
  { id: "extraction", label: "AI Import", icon: <Sparkles size={16} /> },
  { id: "artists", label: "Artists", icon: <Users size={16} /> },
  { id: "releases", label: "Releases", icon: <Disc3 size={16} /> },
  { id: "activities", label: "Activities", icon: <Activity size={16} /> },
  { id: "reports", label: "Reports", icon: <FileBarChart2 size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

function Sidebar({ page, onNav, collapsed, onToggle }: {
  page: Page; onNav: (p: Page) => void; collapsed: boolean; onToggle: () => void;
}) {
  return (
    <aside className={`flex flex-col h-full border-r border-border bg-sidebar transition-all duration-300 ${collapsed ? "w-14" : "w-56"}`}>
      <div className={`flex items-center border-b border-border h-14 ${collapsed ? "justify-center px-0" : "px-4 gap-3"}`}>
        <div className="w-7 h-7 rounded-md overflow-hidden bg-primary flex items-center justify-center shrink-0">
          <img src="/image/mavin.webp" alt="Mavin Logo" className="w-full h-full object-cover" />
        </div>
        {!collapsed && <span className="font-semibold text-sm tracking-tight text-foreground">Mavin OPS</span>}
        <button
          onClick={onToggle}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-all ${
              page === item.id
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            } ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && page === item.id && <ChevronRight size={12} className="ml-auto opacity-50" />}
          </button>
        ))}
      </nav>

    </aside>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, color, sub }: {
  label: string; value: number | string; icon: React.ReactNode; color: string; sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">{label}</span>
        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-black tracking-tight text-foreground font-mono">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────

function DashboardPage({ onNav, onSelectArtist, onSelectRelease }: {
  onNav: (p: Page) => void;
  onSelectArtist: (id: string) => void;
  onSelectRelease: (id: string) => void;
}) {
  const totalArtists = ARTISTS.length;
  const activeReleases = RELEASES.filter(r => r.status === "active").length;
  const upcoming = ACTIVITIES.filter(a => a.status === "Scheduled").length;
  const completed = ACTIVITIES.filter(a => a.status === "Completed").length;
  const pending = ACTIVITIES.filter(a => a.status === "In Progress").length;
  const cancelled = ACTIVITIES.filter(a => a.status === "Cancelled").length;

  const byMonth = [
    { month: "Oct", completed: 8, inProgress: 3 },
    { month: "Nov", completed: 14, inProgress: 5 },
    { month: "Dec", completed: 10, inProgress: 4 },
    { month: "Jan", completed: 18, inProgress: 6 },
    { month: "Feb", completed: 22, inProgress: 7 },
    { month: "Mar", completed: 26, inProgress: 9 },
    { month: "Apr", completed: 12, inProgress: 8 },
  ];

  const byArtist = ARTISTS.map(a => ({
    name: a.name.split(" ")[0],
    activities: getArtistActivities(a.id).length,
    completed: getArtistActivities(a.id).filter(x => x.status === "Completed").length,
  })).filter(a => a.activities > 0);

  const byType = [
    { name: "DSP", value: ACTIVITIES.filter(a => a.type === "DSP Placement").length, color: "#8B5CF6" },
    { name: "Creator", value: ACTIVITIES.filter(a => a.type === "Creator Campaign").length, color: "#10B981" },
    { name: "Social", value: ACTIVITIES.filter(a => a.type === "Social Media").length, color: "#3B82F6" },
    { name: "Media", value: ACTIVITIES.filter(a => a.type === "Media Interview").length, color: "#F59E0B" },
    { name: "Radio", value: ACTIVITIES.filter(a => a.type === "Radio").length, color: "#EC4899" },
    { name: "Other", value: ACTIVITIES.filter(a => !["DSP Placement","Creator Campaign","Social Media","Media Interview","Radio"].includes(a.type)).length, color: "#6B7280" },
  ];

  const upcoming5 = ACTIVITIES
    .filter(a => a.status === "Scheduled" || a.status === "In Progress")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const recentReleases = RELEASES.filter(r => r.status === "active" || r.status === "completed").slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground tracking-tight">Campaign Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Last 28 days: {format(subDays(new Date(), 28), "MMM d, yyyy")} - {format(new Date(), "MMM d, yyyy")} · Worldwide
          </p>
        </div>
        <button
          onClick={() => onNav("activities")}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} /> Add Activity
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Total Artists" value={totalArtists} icon={<Users size={14} className="text-foreground/60" />} color="bg-secondary" />
        <KpiCard label="Active Campaigns" value={activeReleases} icon={<TrendingUp size={14} className="text-blue-400" />} color="bg-blue-400/10" />
        <KpiCard label="Upcoming" value={upcoming} icon={<Clock size={14} className="text-amber-400" />} color="bg-amber-400/10" />
        <KpiCard label="Completed" value={completed} icon={<CheckCircle2 size={14} className="text-emerald-400" />} color="bg-emerald-400/10" />
        <KpiCard label="In Progress" value={pending} icon={<AlertCircle size={14} className="text-blue-400" />} color="bg-blue-400/10" />
        <KpiCard label="Cancelled" value={cancelled} icon={<XCircle size={14} className="text-red-400" />} color="bg-red-400/10" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Activity — custom div chart, no recharts multi-series key bug */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Activities by Month</h3>
            <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-foreground inline-block" />Completed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />In Progress</span>
            </div>
          </div>
          {(() => {
            const maxVal = Math.max(...byMonth.map(d => d.completed + d.inProgress));
            return (
              <div className="flex items-end gap-2 h-40">
                {byMonth.map(d => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: 128 }}>
                      <div className="w-full rounded-sm bg-foreground transition-all" style={{ height: `${(d.completed / maxVal) * 100}%` }} />
                      <div className="w-full rounded-sm bg-amber-400 transition-all" style={{ height: `${(d.inProgress / maxVal) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{d.month}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* By Type Pie */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">By Activity Type</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byType} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                {byType.map((entry) => <Cell key={`type-${entry.name}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 12, color: "#111" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {byType.map(t => (
              <div key={t.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                <span className="text-[10px] text-muted-foreground font-mono">{t.name} ({t.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Artist Activity Bar — custom div chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Activities by Artist</h3>
          <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-foreground inline-block" />Total</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />Completed</span>
          </div>
        </div>
        <div className="space-y-2">
          {byArtist.map(a => {
            const maxActivities = Math.max(...byArtist.map(x => x.activities));
            return (
              <div key={a.name} className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-foreground w-16 shrink-0 truncate">{a.name}</span>
                <div className="flex-1 relative h-5">
                  <div className="absolute inset-y-1 left-0 bg-secondary rounded-sm" style={{ width: "100%" }} />
                  <div className="absolute inset-y-1 left-0 bg-foreground rounded-sm transition-all" style={{ width: `${(a.activities / maxActivities) * 100}%` }} />
                  <div className="absolute inset-y-1 left-0 bg-emerald-500 rounded-sm transition-all" style={{ width: `${(a.completed / maxActivities) * 100}%` }} />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground w-6 text-right shrink-0">{a.activities}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Activities + Recent Campaigns */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Upcoming Activities Table */}
        <div className="xl:col-span-3 bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Upcoming Activities</h3>
            <button onClick={() => onNav("activities")} className="text-xs text-foreground underline-offset-2 hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={11} />
            </button>
          </div>
          <div className="divide-y divide-border">
            {upcoming5.map(act => {
              const rel = getRelease(act.releaseId)!;
              const art = getArtist(rel.artistId)!;
              return (
                <div key={act.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors">
                  <span className="text-[11px] font-mono text-muted-foreground w-16 shrink-0">{format(new Date(act.date + "T00:00:00"), "MMM d")}</span>
                  <img src={art.image} alt={art.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-border" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{act.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{art.name} · {rel.title}</p>
                  </div>
                  <StatusBadge status={act.status} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="xl:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Recent Campaigns</h3>
            <button onClick={() => onNav("releases")} className="text-xs text-foreground underline-offset-2 hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={11} />
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentReleases.map(rel => {
              const art = getArtist(rel.artistId)!;
              const acts = getReleaseActivities(rel.id);
              const rate = completionRate(acts, rel.status);
              return (
                <button
                  key={rel.id}
                  onClick={() => { onSelectRelease(rel.id); onNav("release-detail"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left"
                >
                  <img src={rel.artwork} alt={rel.title} className="w-9 h-9 rounded object-cover shrink-0 border border-border" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{rel.title}</p>
                    <p className="text-[10px] text-muted-foreground">{art.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${rate}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">{rate}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Page ─────────────────────────────────────────────────────────────

function CalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [selected, setSelected] = useState<CampaignActivity | null>(null);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  function activitiesOnDay(d: Date) {
    return ACTIVITIES.filter(a => isSameDay(new Date(a.date + "T00:00:00"), d));
  }

  function releasesOnDay(d: Date) {
    return RELEASES.filter(r => isSameDay(new Date(r.releaseDate + "T00:00:00"), d));
  }

  const CAL_STATUS_COLOR: Record<ActivityStatus, string> = {
    "Completed": "bg-emerald-500",
    "In Progress": "bg-amber-500",
    "Scheduled": "bg-blue-500",
    "Cancelled": "bg-red-500",
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrent(subMonths(current, 1))} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-base font-semibold text-foreground w-40 text-center">{format(current, "MMMM yyyy")}</h2>
          <button onClick={() => setCurrent(addMonths(current, 1))} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="date"
            value={format(current, "yyyy-MM-dd")}
            onChange={e => {
              if (e.target.value) {
                const [y, m, d] = e.target.value.split("-").map(Number);
                setCurrent(new Date(y, m - 1, d));
              }
            }}
            className="mr-2 bg-secondary border border-border rounded text-xs px-2 py-1.5 text-foreground focus:outline-none cursor-pointer"
          />
          <div className="flex items-center gap-3 mr-4 text-[11px] font-mono">
            {(["Completed","In Progress","Scheduled","Cancelled"] as ActivityStatus[]).map(s => (
              <span key={s} className="flex items-center gap-1.5 text-muted-foreground">
                <span className={`w-2 h-2 rounded-full ${CAL_STATUS_COLOR[s]}`} />{s}
              </span>
            ))}
          </div>
          {(["month", "week"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${view === v ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Month Grid */}
      {view === "month" && (
        <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
              <div key={d} className="py-2.5 text-center text-[11px] font-mono text-muted-foreground font-medium border-r last:border-r-0 border-border">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1">
            {days.map((day, i) => {
              const acts = activitiesOnDay(day);
              const inMonth = isSameMonth(day, current);
              const today = isToday(day);
              return (
                <div key={i}
                  className={`min-h-[100px] border-b border-r last-of-type:border-r-0 border-border p-1.5 transition-colors ${inMonth ? "bg-card hover:bg-secondary/30" : "bg-muted/20"} ${i % 7 === 6 ? "border-r-0" : ""}`}
                >
                  <span className={`inline-flex w-6 h-6 items-center justify-center rounded text-[11px] font-mono mb-1 ${today ? "bg-primary text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground/40"}`}>
                    {format(day, "d")}
                  </span>
                  <div className="space-y-0.5">
                    {releasesOnDay(day).slice(0, 1).map(rel => {
                      const art = getArtist(rel.artistId)!;
                      return (
                        <div key={rel.id} title={`${art.name} · ${rel.title} Drop`} className="w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate font-bold bg-primary/20 text-primary border border-primary/30 flex items-center gap-1 mb-0.5 cursor-pointer hover:bg-primary/30 transition-colors">
                          <Disc3 size={10} className="shrink-0" />
                          <span className="truncate">{art.name.split(" ")[0]} · {rel.title}</span>
                        </div>
                      );
                    })}
                    {acts.slice(0, 2).map(act => {
                      const rel = getRelease(act.releaseId)!;
                      const art = getArtist(rel.artistId)!;
                      return (
                        <button key={act.id}
                          onClick={() => setSelected(act)}
                          className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate font-medium transition-opacity hover:opacity-80 ${CAL_STATUS_COLOR[act.status].replace("bg-", "bg-opacity-20 bg-")} text-foreground flex items-center gap-1`}
                          style={{ background: act.status === "Completed" ? "rgba(16,185,129,0.15)" : act.status === "In Progress" ? "rgba(245,158,11,0.15)" : act.status === "Scheduled" ? "rgba(59,130,246,0.15)" : "rgba(239,68,68,0.15)" }}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CAL_STATUS_COLOR[act.status]}`} />
                          <span className="truncate">{art.name.split(" ")[0]} · {act.title}</span>
                        </button>
                      );
                    })}
                    {acts.length > 2 && <p className="text-[9px] text-muted-foreground pl-1">+{acts.length - 2} more</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week view - simple list grouped by day */}
      {view === "week" && (
        <div className="flex-1 space-y-2">
          {Array.from({ length: 7 }, (_, i) => {
            const startOfWk = startOfWeek(current, { weekStartsOn: 1 });
            const d = addDays(startOfWk, i);
            const acts = activitiesOnDay(d);
            const rels = releasesOnDay(d);
            return (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className={`px-4 py-2.5 border-b border-border flex items-center gap-3 ${isToday(d) ? "bg-secondary" : ""}`}>
                  <span className="text-xs font-mono text-muted-foreground w-8">{format(d, "EEE")}</span>
                  <span className={`text-sm font-semibold ${isToday(d) ? "text-foreground font-bold" : "text-foreground"}`}>{format(d, "MMMM d")}</span>
                  <span className="ml-auto text-xs font-mono text-muted-foreground">{rels.length > 0 ? `${rels.length} releases, ` : ""}{acts.length} activities</span>
                </div>
                {acts.length === 0 && rels.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-muted-foreground italic">No activities scheduled</p>
                ) : (
                  <div className="divide-y divide-border">
                    {rels.map(rel => {
                      const art = getArtist(rel.artistId)!;
                      return (
                        <div key={rel.id} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors bg-primary/5">
                          <img src={rel.artwork} alt={rel.title} className="w-8 h-8 rounded-md object-cover border border-primary/30 shrink-0 shadow-lg shadow-primary/20" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-primary flex items-center gap-1.5"><Sparkles size={12}/> {rel.type === 'album' ? 'ALBUM' : 'SINGLE'} DROP</p>
                            <p className="text-[10px] text-muted-foreground">{art.name} · {rel.title}</p>
                          </div>
                        </div>
                      );
                    })}
                    {acts.map(act => {
                      const rel = getRelease(act.releaseId)!;
                      const art = getArtist(rel.artistId)!;
                      return (
                        <button key={act.id} onClick={() => setSelected(act)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left">
                          <img src={art.image} alt={art.name} className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{act.title}</p>
                            <p className="text-[10px] text-muted-foreground">{art.name} · {rel.title}</p>
                          </div>
                          <StatusBadge status={act.status} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1 bg-black/60" />
          <div className="w-96 bg-card border-l border-border h-full overflow-y-auto p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground mb-1">{format(new Date(selected.date + "T00:00:00"), "EEEE, MMM d, yyyy")}</p>
                <h3 className="text-base font-semibold text-foreground leading-tight">{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1"><X size={16} /></button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status={selected.status} />
              <StageBadge stage={selected.stage} />
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border text-[11px] font-mono text-muted-foreground">
                {TYPE_ICONS[selected.type]} {selected.type}
              </span>
            </div>
            {(() => {
              const rel = getRelease(selected.releaseId)!;
              const art = getArtist(rel.artistId)!;
              return (
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-md">
                  <img src={art.image} alt={art.name} className="w-10 h-10 rounded-full object-cover border border-border" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{art.name}</p>
                    <p className="text-xs text-muted-foreground">{rel.title} · {rel.releaseDate}</p>
                  </div>
                </div>
              );
            })()}
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Description</p>
                <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Owner</p>
                <p className="text-sm text-foreground">{selected.owner}</p>
              </div>
              {selected.notes && (
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Notes</p>
                  <p className="text-sm text-foreground">{selected.notes}</p>
                </div>
              )}
              {selected.externalLink && (
                <a href={selected.externalLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-foreground text-sm hover:underline">
                  <ExternalLink size={12} /> {selected.externalLink}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Artists Page ──────────────────────────────────────────────────────────────

function ArtistsPage({ onSelectArtist, onNav }: {
  onSelectArtist: (id: string) => void; onNav: (p: Page) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-black tracking-tight text-foreground">Artists</h1>
        <span className="text-xs font-mono text-muted-foreground">{ARTISTS.length} artists</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {ARTISTS.map(artist => {
          const acts = getArtistActivities(artist.id);
          const releases = getArtistReleases(artist.id);
          const active = releases.filter(r => r.status === "active").length;
          const rate = completionRate(acts);
          return (
            <button
              key={artist.id}
              onClick={() => { onSelectArtist(artist.id); onNav("artist-profile"); }}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-foreground/20 hover:bg-secondary/50 transition-all text-left group"
            >
              <div className="aspect-square overflow-hidden">
                <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{artist.name}</h3>
                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{artist.bio}</p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Releases</p>
                    <p className="text-sm font-mono font-semibold text-foreground">{releases.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Active</p>
                    <p className="text-sm font-mono font-semibold text-foreground">{active}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Completion</span>
                    <span className="text-[10px] font-mono text-foreground">{rate}%</span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${rate}%` }} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Artist Profile ────────────────────────────────────────────────────────────

function ArtistProfilePage({ artistId, onNav, onSelectRelease }: {
  artistId: string; onNav: (p: Page) => void; onSelectRelease: (id: string) => void;
}) {
  const artist = getArtist(artistId)!;
  const releases = getArtistReleases(artistId);
  const activities = getArtistActivities(artistId);
  const rate = completionRate(activities);

  const activityVol = [
    { month: "Oct", count: 2 }, { month: "Nov", count: 3 }, { month: "Dec", count: 1 },
    { month: "Jan", count: 4 }, { month: "Feb", count: 5 }, { month: "Mar", count: 8 }, { month: "Apr", count: 4 },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      <div className="relative h-48 overflow-hidden">
        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <button onClick={() => onNav("artists")} className="absolute top-4 left-6 flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors">
          <ChevronLeft size={14} /> Artists
        </button>
      </div>

      <div className="px-6 -mt-8 relative pb-6 space-y-5">
        <div className="flex items-end gap-4">
          <img src={artist.image} alt={artist.name} className="w-20 h-20 rounded-md object-cover border-2 border-background shadow-xl" />
          <div className="pb-1">
            <h1 className="text-2xl font-black tracking-tight text-foreground">{artist.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{artist.bio}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="Releases" value={releases.length} icon={<Disc3 size={14} className="text-foreground/60" />} color="bg-secondary" />
          <KpiCard label="Activities" value={activities.length} icon={<Activity size={14} className="text-blue-400" />} color="bg-blue-400/10" />
          <KpiCard label="Active" value={releases.filter(r => r.status === "active").length} icon={<TrendingUp size={14} className="text-emerald-400" />} color="bg-emerald-400/10" />
          <KpiCard label="Completion" value={`${rate}%`} icon={<CheckCircle2 size={14} className="text-amber-400" />} color="bg-amber-400/10" />
        </div>

        {/* Releases + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Releases</h3>
            </div>
            <div className="divide-y divide-border">
              {releases.map(rel => {
                const acts = getReleaseActivities(rel.id);
                const r = completionRate(acts, rel.status);
                return (
                  <button key={rel.id} onClick={() => { onSelectRelease(rel.id); onNav("release-detail"); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left">
                    <img src={rel.artwork} alt={rel.title} className="w-10 h-10 rounded object-cover border border-border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{rel.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(rel.releaseDate + "T00:00:00"), "MMM d, yyyy")}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${r}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">{r}%</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${rel.status === "active" ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10" : rel.status === "upcoming" ? "text-amber-400 border-amber-400/20 bg-amber-400/10" : "text-muted-foreground border-border"}`}>
                      {rel.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Top Tracks</h3>
            </div>
            <div className="divide-y divide-border h-[200px] overflow-y-auto">
              {getArtistTracks(artistId).slice(0, 5).map(track => (
                <div key={track.id} className="flex items-center gap-3 px-4 py-2 hover:bg-secondary/50 transition-colors text-left">
                  <img src={track.albumImage} alt={track.name} className="w-8 h-8 rounded object-cover border border-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{track.name}</p>
                    <p className="text-xs text-muted-foreground">{Math.floor(track.durationMs / 60000)}:{(Math.floor((track.durationMs % 60000) / 1000)).toString().padStart(2, '0')}</p>
                  </div>
                  {track.previewUrl && (
                    <audio controls src={track.previewUrl} className="h-6 w-32" style={{ transform: 'scale(0.8)', transformOrigin: 'right' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity history */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Campaign History</h3>
          </div>
          <div className="divide-y divide-border">
            {activities.slice(0, 8).map(act => {
              const rel = getRelease(act.releaseId)!;
              return (
                <div key={act.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-[11px] font-mono text-muted-foreground w-20 shrink-0">{format(new Date(act.date + "T00:00:00"), "MMM d, yy")}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{act.title}</p>
                    <p className="text-[10px] text-muted-foreground">{rel.title}</p>
                  </div>
                  <StageBadge stage={act.stage} />
                  <StatusBadge status={act.status} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Releases Page ─────────────────────────────────────────────────────────────

function ReleasesPage({ onSelectRelease, onNav }: {
  onSelectRelease: (id: string) => void; onNav: (p: Page) => void;
}) {
  const [filterArtist, setFilterArtist] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = RELEASES.filter(r =>
    (filterArtist === "all" || r.artistId === filterArtist) &&
    (filterStatus === "all" || r.status === filterStatus)
  );

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight text-foreground">Releases</h1>
        <div className="flex items-center gap-2">
          <select value={filterArtist} onChange={e => setFilterArtist(e.target.value)}
            className="bg-card border border-border rounded-md text-xs px-3 py-1.5 text-foreground">
            <option value="all">All Artists</option>
            {ARTISTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-card border border-border rounded-md text-xs px-3 py-1.5 text-foreground">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_1fr] gap-0 border-b border-border px-4 py-2.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          <span>Release</span><span>Artist</span><span>Date</span><span>Total</span><span>Done</span><span>Pending</span><span>Status</span>
        </div>
        <div className="divide-y divide-border">
          {filtered.map(rel => {
            const art = getArtist(rel.artistId)!;
            const acts = getReleaseActivities(rel.id);
            return (
              <button key={rel.id}
                onClick={() => { onSelectRelease(rel.id); onNav("release-detail"); }}
                className="w-full grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_1fr] items-center gap-0 px-4 py-3 hover:bg-secondary/50 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <img src={rel.artwork} alt={rel.title} className="w-8 h-8 rounded object-cover border border-border shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">{rel.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={art.image} alt={art.name} className="w-6 h-6 rounded-full object-cover border border-border shrink-0" />
                  <span className="text-xs text-foreground">{art.name}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{format(new Date(rel.releaseDate + "T00:00:00"), "MMM d, yy")}</span>
                <span className="text-sm font-mono text-foreground">{acts.length}</span>
                <span className="text-sm font-mono text-emerald-400">{acts.filter(a => a.status === "Completed").length}</span>
                <span className="text-sm font-mono text-amber-400">{acts.filter(a => a.status !== "Completed" && a.status !== "Cancelled").length}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border w-fit ${rel.status === "active" ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10" : rel.status === "upcoming" ? "text-amber-400 border-amber-400/20 bg-amber-400/10" : "text-muted-foreground border-border"}`}>
                  {rel.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Release Detail ────────────────────────────────────────────────────────────

function ReleaseDetailPage({ releaseId, onNav }: { releaseId: string; onNav: (p: Page) => void }) {
  const rel = getRelease(releaseId)!;
  const art = getArtist(rel.artistId)!;
  const allActs = getReleaseActivities(releaseId);
  const rate = completionRate(allActs, rel.status);

  const stages: CampaignStage[] = ["Pre-Release", "Release Week", "Post-Release"];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      <button onClick={() => onNav("releases")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft size={14} /> Releases
      </button>

      {/* Header */}
      <div className="flex items-start gap-5">
        <img src={rel.artwork} alt={rel.title} className="w-24 h-24 rounded-md object-cover border border-border shrink-0" />
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground">{rel.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <img src={art.image} alt={art.name} className="w-5 h-5 rounded-full object-cover border border-border" />
            <span className="text-sm text-muted-foreground">{art.name}</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-sm font-mono text-muted-foreground">{format(new Date(rel.releaseDate + "T00:00:00"), "MMMM d, yyyy")}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{rel.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-3xl font-mono font-black tracking-tight text-foreground">{rate}%</p>
          <p className="text-xs text-muted-foreground">Campaign completion</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Campaign Progress</h3>
          <span className="text-xs font-mono text-muted-foreground">{allActs.filter(a => a.status === "Completed").length} / {allActs.length} activities</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${rate}%` }} />
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4">
          {(["Completed","In Progress","Scheduled","Cancelled"] as ActivityStatus[]).map(s => (
            <div key={s} className="text-center">
              <p className="text-lg font-mono font-bold text-foreground">{allActs.filter(a => a.status === s).length}</p>
              <p className="text-[10px] text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Sections */}
      {stages.map(stage => {
        const stageActs = allActs.filter(a => a.stage === stage);
        if (!stageActs.length) return null;
        return (
          <div key={stage}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold text-foreground">{stage}</h3>
              <StageBadge stage={stage} />
              <span className="text-xs font-mono text-muted-foreground">{stageActs.filter(a => a.status === "Completed").length}/{stageActs.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {stageActs.map(act => (
                <div key={act.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-muted-foreground">{TYPE_ICONS[act.type] || <Activity size={12} />}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{act.type}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground leading-tight">{act.title}</h4>
                    </div>
                    <StatusBadge status={act.status} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{act.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1 border-t border-border">
                    <span>{format(new Date(act.date + "T00:00:00"), "MMM d, yyyy")}</span>
                    <span>{act.owner}</span>
                  </div>
                  {act.notes && <p className="text-[11px] text-muted-foreground bg-secondary rounded px-2 py-1.5">{act.notes}</p>}
                  {act.externalLink && (
                    <a href={act.externalLink} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-[11px] text-foreground hover:underline">
                      <ExternalLink size={10} /> {act.externalLink}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Activities Page ───────────────────────────────────────────────────────────

const ACTIVITY_TYPES: ActivityType[] = [
  "DSP Placement","Creator Campaign","Social Media","Influencer","Media Interview",
  "Radio","TV","Ad Campaign","Event","Livestream","Photoshoot","Music Video","Editorial","Partnership","Other"
];

function ActivitiesPage() {
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [form, setForm] = useState({
    artistId: "", releaseId: "", title: "", type: "DSP Placement" as ActivityType,
    description: "", stage: "Pre-Release" as CampaignStage, date: "",
    owner: "", status: "Scheduled" as ActivityStatus, externalLink: "", notes: "",
  });

  const filtered = ACTIVITIES.filter(a =>
    (filterStatus === "all" || a.status === filterStatus) &&
    (filterStage === "all" || a.stage === filterStage)
  );

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight text-foreground">Activities</h1>
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-card border border-border rounded-md text-xs px-3 py-1.5 text-foreground">
            <option value="all">All Statuses</option>
            {(["Completed","In Progress","Scheduled","Cancelled"] as ActivityStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
            className="bg-card border border-border rounded-md text-xs px-3 py-1.5 text-foreground">
            <option value="all">All Stages</option>
            {(["Pre-Release","Release Week","Post-Release"] as CampaignStage[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
            <Plus size={13} /> Add Activity
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] border-b border-border px-4 py-2.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          <span>Activity</span><span>Release / Artist</span><span>Type</span><span>Date</span><span>Stage</span><span>Status</span>
        </div>
        <div className="divide-y divide-border">
          {filtered.map(act => {
            const rel = getRelease(act.releaseId)!;
            const art = getArtist(rel.artistId)!;
            return (
              <div key={act.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] items-center px-4 py-3 hover:bg-secondary/30 transition-colors">
                <div>
                  <p className="text-xs font-medium text-foreground">{act.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{act.owner}</p>
                </div>
                <div className="flex items-center gap-2">
                  <img src={art.image} alt={art.name} className="w-6 h-6 rounded-full object-cover border border-border shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-foreground truncate">{rel.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{art.name}</p>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                  {TYPE_ICONS[act.type]} {act.type}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">{format(new Date(act.date + "T00:00:00"), "MMM d")}</span>
                <StageBadge stage={act.stage} />
                <StatusBadge status={act.status} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Activity Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowModal(false)}>
          <div className="bg-card border border-border rounded-md w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Add New Activity</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {/* Artist */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Artist</label>
                <select value={form.artistId} onChange={e => setForm(f => ({ ...f, artistId: e.target.value, releaseId: "" }))}
                  className="w-full bg-secondary border border-border rounded-md text-sm px-3 py-2 text-foreground">
                  <option value="">Select artist</option>
                  {ARTISTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              {/* Release */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Release</label>
                <select value={form.releaseId} onChange={e => setForm(f => ({ ...f, releaseId: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-md text-sm px-3 py-2 text-foreground" disabled={!form.artistId}>
                  <option value="">Select release</option>
                  {getArtistReleases(form.artistId).map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
              </div>
              {/* Title */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Activity Name</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Apple Music Big 5 Placement"
                  className="w-full bg-secondary border border-border rounded-md text-sm px-3 py-2 text-foreground placeholder:text-muted-foreground" />
              </div>
              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Activity Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ActivityType }))}
                  className="w-full bg-secondary border border-border rounded-md text-sm px-3 py-2 text-foreground">
                  {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {/* Stage */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Campaign Stage</label>
                <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as CampaignStage }))}
                  className="w-full bg-secondary border border-border rounded-md text-sm px-3 py-2 text-foreground">
                  {(["Pre-Release","Release Week","Post-Release"] as CampaignStage[]).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Activity Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-md text-sm px-3 py-2 text-foreground" />
              </div>
              {/* Owner */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Owner</label>
                <input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                  placeholder="Campaign manager name"
                  className="w-full bg-secondary border border-border rounded-md text-sm px-3 py-2 text-foreground placeholder:text-muted-foreground" />
              </div>
              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ActivityStatus }))}
                  className="w-full bg-secondary border border-border rounded-md text-sm px-3 py-2 text-foreground">
                  {(["Scheduled","In Progress","Completed","Cancelled"] as ActivityStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Link */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">External Link</label>
                <input value={form.externalLink} onChange={e => setForm(f => ({ ...f, externalLink: e.target.value }))}
                  placeholder="https://"
                  className="w-full bg-secondary border border-border rounded-md text-sm px-3 py-2 text-foreground placeholder:text-muted-foreground" />
              </div>
              {/* Description */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe this campaign activity..."
                  rows={2}
                  className="w-full bg-secondary border border-border rounded-md text-sm px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none" />
              </div>
              {/* Notes */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={2}
                  className="w-full bg-secondary border border-border rounded-md text-sm px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md border border-border text-sm text-foreground hover:bg-secondary transition-colors">Cancel</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Add Activity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reports Page ──────────────────────────────────────────────────────────────

function ReportsPage() {
  const [selectedRelease, setSelectedRelease] = useState("");
  
  const activeReleaseId = selectedRelease && getRelease(selectedRelease) ? selectedRelease : RELEASES[0]?.id;
  const rel = getRelease(activeReleaseId);
  
  if (!rel) return <div className="p-6 text-muted-foreground">Loading reports...</div>;

  const art = getArtist(rel.artistId)!;
  const acts = getReleaseActivities(rel.id);
  const rate = completionRate(acts, rel.status);
  const stages: CampaignStage[] = ["Pre-Release", "Release Week", "Post-Release"];

  const STATUS_ICON: Record<ActivityStatus, React.ReactNode> = {
    "Completed": <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />,
    "In Progress": <AlertCircle size={13} className="text-amber-400 shrink-0" />,
    "Scheduled": <Clock size={13} className="text-blue-400 shrink-0" />,
    "Cancelled": <XCircle size={13} className="text-red-400 shrink-0" />,
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight text-foreground">Campaign Reports</h1>
        <div className="flex items-center gap-2">
          <select value={rel.id} onChange={e => setSelectedRelease(e.target.value)}
            className="bg-card border border-border rounded-md text-xs px-3 py-1.5 text-foreground">
            {RELEASES.map(r => {
              const a = getArtist(r.artistId)!;
              return <option key={r.id} value={r.id}>{a.name} — {r.title}</option>;
            })}
          </select>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground hover:bg-secondary/80 transition-colors">
            <Download size={12} /> Export PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground hover:bg-secondary/80 transition-colors">
            <Download size={12} /> Export Excel
          </button>
        </div>
      </div>

      {/* Report Card */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        {/* Report Header */}
        <div className="bg-secondary border-b border-border p-6">
          <div className="flex items-start gap-5">
            <img src={rel.artwork} alt={rel.title} className="w-20 h-20 rounded-lg object-cover border border-border/50 shadow-lg shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Campaign Report</p>
              <h2 className="text-2xl font-black tracking-tight text-foreground">{rel.title}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <img src={art.image} alt={art.name} className="w-5 h-5 rounded-full object-cover" />
                <span className="text-sm text-muted-foreground">{art.name}</span>
                <span className="text-muted-foreground/30">·</span>
                <span className="text-sm font-mono text-muted-foreground">{format(new Date(rel.releaseDate + "T00:00:00"), "MMMM d, yyyy")}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-mono font-black text-foreground">{rate}%</div>
              <div className="text-xs text-muted-foreground mt-0.5">Campaign Complete</div>
              <div className="mt-2 h-1.5 w-24 bg-secondary rounded-full overflow-hidden ml-auto">
                <div className="h-full bg-primary rounded-full" style={{ width: `${rate}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
          {([
            ["Total Activities", acts.length, "text-foreground"],
            ["Completed", acts.filter(a => a.status === "Completed").length, "text-emerald-400"],
            ["In Progress", acts.filter(a => a.status === "In Progress").length, "text-amber-400"],
            ["Cancelled", acts.filter(a => a.status === "Cancelled").length, "text-red-400"],
          ] as [string, number, string][]).map(([label, value, cls]) => (
            <div key={label} className="px-5 py-4 text-center">
              <p className={`text-2xl font-mono font-bold ${cls}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Stage Sections */}
        <div className="p-6 space-y-6">
          {stages.map(stage => {
            const stageActs = acts.filter(a => a.stage === stage);
            if (!stageActs.length) return null;
            const completed = stageActs.filter(a => a.status === "Completed").length;
            return (
              <div key={stage}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-foreground">{stage}</h3>
                  <StageBadge stage={stage} />
                  <span className="text-xs font-mono text-muted-foreground">{completed}/{stageActs.length} completed</span>
                </div>
                <div className="space-y-2">
                  {stageActs.map(act => (
                    <div key={act.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                      {STATUS_ICON[act.status]}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{act.title}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">· {act.type}</span>
                        </div>
                        {act.notes && <p className="text-xs text-muted-foreground mt-0.5">{act.notes}</p>}
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground shrink-0">{format(new Date(act.date + "T00:00:00"), "MMM d")}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Extraction Page ───────────────────────────────────────────────────────────

type ChatMessage = {
  role: "user" | "model";
  content: string;
  extractedActivities?: CampaignActivity[];
};

function ExtractionPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "model",
    content: "I can help."
  }]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      const catalogContext = RELEASES.map(r => {
        const art = getArtist(r.artistId);
        return {
          artist: art ? art.name : "Unknown",
          title: r.title,
          releaseId: r.id,
          date: r.releaseDate
        };
      });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          catalogContext
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "model",
        content: data.reply,
        extractedActivities: data.extractedActivities?.length > 0 ? data.extractedActivities : undefined
      }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "model", content: "Sorry, I encountered an error communicating with the server." }]);
    }
    setIsLoading(false);
  };

  const handleSaveActivities = async (activities: CampaignActivity[]) => {
    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activities)
      });
      window.location.reload();
    } catch(e) {
      console.error(e);
      alert("Failed to save activities");
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col relative max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-foreground">Global AI Extraction Hub</h2>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-32">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-1 border border-primary/20">
                <Sparkles size={14} className="text-primary" />
              </div>
            )}
            
            <div className={`space-y-3 ${msg.role === 'user' ? 'items-end' : ''} flex flex-col`}>
              {msg.content && (
                <div className={`px-4 py-3 rounded-md text-sm whitespace-pre-wrap ${
                  msg.role === 'user' ? 'bg-primary text-white ml-12' : 'bg-card border border-border text-foreground mr-12'
                }`}>
                  {msg.content}
                </div>
              )}
              
              {/* If message has extracted activities, render table */}
              {msg.extractedActivities && (
                <div className="bg-card border border-border rounded-md overflow-hidden shadow-sm w-full max-w-[800px] mr-12">
                  <div className="bg-secondary px-4 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">Extracted Activities</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{msg.extractedActivities.length} found</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-4 py-2 font-medium">Target</th>
                          <th className="px-4 py-2 font-medium">Activity</th>
                          <th className="px-4 py-2 font-medium">Date</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {msg.extractedActivities.map((act, idx) => {
                          const rel = getRelease(act.releaseId);
                          const art = rel ? getArtist(rel.artistId) : null;
                          return (
                            <tr key={idx} className="bg-card">
                              <td className="px-4 py-2 text-foreground font-medium">
                                {art ? <span className="text-primary">{art.name}</span> : "Unknown"}
                                <span className="text-muted-foreground ml-1">· {rel?.title || "No Release"}</span>
                              </td>
                              <td className="px-4 py-2 text-foreground">{act.title}</td>
                              <td className="px-4 py-2 text-muted-foreground font-mono">{act.date}</td>
                              <td className="px-4 py-2 text-muted-foreground">{act.status}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-3 bg-card border-t border-border flex justify-end">
                    <button 
                      onClick={() => handleSaveActivities(msg.extractedActivities!)}
                      className="flex items-center gap-2 px-4 py-2 rounded bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors shadow-sm">
                      <CheckCircle2 size={12} /> Save to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-1 border border-primary/20">
              <Sparkles size={14} className="text-primary animate-pulse" />
            </div>
            <div className="px-4 py-3 rounded-md bg-card border border-border text-muted-foreground text-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded bg-primary/60 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded bg-primary/60 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded bg-primary/60 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border shrink-0">
        <div className="relative flex items-center">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={e => {
              setInputText(e.target.value);
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Send a message or paste notes to extract..."
            rows={1}
            className="w-full bg-card border border-border rounded-md text-sm pl-4 pr-12 py-3.5 text-foreground placeholder:text-muted-foreground resize-none focus:ring-1 focus:ring-primary outline-none"
            style={{ minHeight: '52px', maxHeight: '160px' }}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-white rounded disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            <Sparkles size={14} />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">Mavin 2.5 Flash can make mistakes. Check extractions before saving.</p>
      </div>
    </div>
  );
}

// ─── Search Page ───────────────────────────────────────────────────────────────

function SearchPage({ onNav, onSelectArtist, onSelectRelease }: {
  onNav: (p: Page) => void; onSelectArtist: (id: string) => void; onSelectRelease: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const q = query.toLowerCase().trim();
  const matchedArtists = q ? ARTISTS.filter(a => a.name.toLowerCase().includes(q)) : [];
  const matchedReleases = q ? RELEASES.filter(r => r.title.toLowerCase().includes(q) || getArtist(r.artistId)!.name.toLowerCase().includes(q)) : [];
  const matchedActivities = q ? ACTIVITIES.filter(a =>
    a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.notes.toLowerCase().includes(q) || a.owner.toLowerCase().includes(q)
  ) : [];

  const total = matchedArtists.length + matchedReleases.length + matchedActivities.length;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      <div className="relative max-w-2xl">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search artists, releases, activities, creators, notes..."
          className="w-full bg-card border border-border rounded-lg text-sm pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground/30 outline-none transition-colors"
        />
      </div>

      {q && (
        <p className="text-xs text-muted-foreground font-mono">{total} result{total !== 1 ? "s" : ""} for "{query}"</p>
      )}

      {!q && (
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground mb-4">Search across {ARTISTS.length} artists, {RELEASES.length} releases, {ACTIVITIES.length} activities.</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Artists", count: ARTISTS.length, icon: <Users size={14} /> },
              { label: "Releases", count: RELEASES.length, icon: <Disc3 size={14} /> },
              { label: "Activities", count: ACTIVITIES.length, icon: <Activity size={14} /> },
            ].map(item => (
              <div key={item.label} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
                <span className="text-muted-foreground">{item.icon}</span>
                <div>
                  <p className="text-lg font-mono font-bold text-foreground">{item.count}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {matchedArtists.length > 0 && (
        <div>
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Artists ({matchedArtists.length})</h3>
          <div className="space-y-1">
            {matchedArtists.map(a => (
              <button key={a.id} onClick={() => { onSelectArtist(a.id); onNav("artist-profile"); }}
                className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-foreground/20 transition-all text-left">
                <img src={a.image} alt={a.name} className="w-9 h-9 rounded-full object-cover border border-border shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{getArtistReleases(a.id).length} releases</p>
                </div>
                <ArrowUpRight size={12} className="ml-auto text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {matchedReleases.length > 0 && (
        <div>
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Releases ({matchedReleases.length})</h3>
          <div className="space-y-1">
            {matchedReleases.map(r => {
              const a = getArtist(r.artistId)!;
              return (
                <button key={r.id} onClick={() => { onSelectRelease(r.id); onNav("release-detail"); }}
                  className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-foreground/20 transition-all text-left">
                  <img src={r.artwork} alt={r.title} className="w-9 h-9 rounded object-cover border border-border shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{a.name} · {r.releaseDate}</p>
                  </div>
                  <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full border ${r.status === "active" ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10" : "text-muted-foreground border-border"}`}>{r.status}</span>
                  <ArrowUpRight size={12} className="text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {matchedActivities.length > 0 && (
        <div>
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Activities ({matchedActivities.length})</h3>
          <div className="space-y-1">
            {matchedActivities.map(act => {
              const rel = getRelease(act.releaseId)!;
              const a = getArtist(rel.artistId)!;
              return (
                <div key={act.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{act.title}</p>
                    <p className="text-xs text-muted-foreground">{a.name} · {rel.title} · {act.owner}</p>
                    {act.notes && <p className="text-[10px] text-muted-foreground italic mt-0.5 truncate">{act.notes}</p>}
                  </div>
                  <StageBadge stage={act.stage} />
                  <StatusBadge status={act.status} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {q && total === 0 && (
        <div className="text-center py-12">
          <Search size={24} className="text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">No results for "{query}"</p>
        </div>
      )}
    </div>
  );
}

// ─── Settings Page ─────────────────────────────────────────────────────────────

function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [compactView, setCompactView] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 max-w-2xl space-y-6">
      <h1 className="text-xl font-black tracking-tight text-foreground">Settings</h1>

      {[
        {
          title: "Notifications", items: [
            { label: "Activity reminders", value: notifications, onChange: () => setNotifications(v => !v) },
            { label: "Weekly digest email", value: weeklyDigest, onChange: () => setWeeklyDigest(v => !v) },
          ]
        },
        {
          title: "Display", items: [
            { label: "Compact view", value: compactView, onChange: () => setCompactView(v => !v) },
          ]
        },
      ].map(section => (
        <div key={section.title} className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
          </div>
          <div className="divide-y divide-border">
            {section.items.map((item: any) => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3">
                <label className="text-sm text-foreground">{item.label}</label>
                <button
                  onClick={item.onChange}
                  style={{ width: 40, height: 22, borderRadius: 11, background: item.value ? "#111111" : "#D4D4D4", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}
                >
                  <span style={{
                    position: "absolute", top: 3, left: item.value ? 19 : 3,
                    width: 16, height: 16, borderRadius: "50%", background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s",
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Data</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-secondary border border-border text-xs text-foreground hover:bg-secondary/80 transition-colors">
            <Download size={12} /> Export All Data
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState<string>("magixx");
  const [selectedReleaseId, setSelectedReleaseId] = useState<string>("r1");
  const [spotifyLoaded, setSpotifyLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/catalog')
      .then(res => res.json())
      .then(data => {
        if (data.releases && data.releases.length > 0) {
          RELEASES.length = 0;
          RELEASES.push(...data.releases);
          
          // Remap mock activities to real Spotify releases to prevent undefined crashes
          ACTIVITIES.forEach((act, idx) => {
            act.releaseId = data.releases[idx % data.releases.length].id;
          });

          // Safely set the initial selected states to the first active ones from DB
          setSelectedReleaseId(data.releases[0].id);
          setSelectedArtistId(data.releases[0].artistId);
        }
        if (data.tracks && data.tracks.length > 0) {
          TRACKS.length = 0;
          TRACKS.push(...data.tracks);
        }
        
        // Fetch saved activities from DB
        fetch('/api/activities')
          .then(r => r.json())
          .then(dbActs => {
            if (dbActs && Array.isArray(dbActs) && dbActs.length > 0) {
              ACTIVITIES.push(...dbActs);
            }
            setSpotifyLoaded(true);
          });
      })
      .catch(err => {
        console.error("Failed to load DB catalog data", err);
        setSpotifyLoaded(true); // Fallback to mock data if it fails
      });
  }, []);

  if (!spotifyLoaded) {
    return <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm font-medium animate-pulse">Loading catalog from database...</p>
    </div>;
  }

  function navigate(p: Page) { setPage(p); }

  const PAGE_TITLES: Partial<Record<Page, string>> = {
    dashboard: "Dashboard", calendar: "Calendar", artists: "Artists",
    "artist-profile": selectedArtistId ? getArtist(selectedArtistId)?.name ?? "" : "",
    releases: "Releases",
    "release-detail": selectedReleaseId ? getRelease(selectedReleaseId)?.title ?? "" : "",
    activities: "Activities", reports: "Reports", extraction: "Global AI Extraction Hub", settings: "Settings",
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar
        page={page}
        onNav={navigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center px-5 border-b border-border bg-background/80 backdrop-blur-sm shrink-0 gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">{PAGE_TITLES[page]}</h2>
            {page === "artist-profile" && selectedArtistId && (
              <span className="text-muted-foreground/40 text-sm mx-1">/</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {page === "dashboard" && (
            <DashboardPage
              onNav={navigate}
              onSelectArtist={setSelectedArtistId}
              onSelectRelease={setSelectedReleaseId}
            />
          )}
          {page === "calendar" && <CalendarPage />}
          {page === "artists" && (
            <ArtistsPage onSelectArtist={setSelectedArtistId} onNav={navigate} />
          )}
          {page === "artist-profile" && selectedArtistId && (
            <ArtistProfilePage
              artistId={selectedArtistId}
              onNav={navigate}
              onSelectRelease={setSelectedReleaseId}
            />
          )}
          {page === "releases" && (
            <ReleasesPage onSelectRelease={setSelectedReleaseId} onNav={navigate} />
          )}
          {page === "release-detail" && selectedReleaseId && (
            <ReleaseDetailPage releaseId={selectedReleaseId} onNav={navigate} />
          )}
          {page === "activities" && <ActivitiesPage />}
          {page === "reports" && <ReportsPage />}
          {page === "extraction" && <ExtractionPage />}
          {page === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}
