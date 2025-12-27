import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://wcilvqkcfclnmscrvoav.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bGvw-qgXDVyqZUKD77OGOg_ND1OIz4U";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

