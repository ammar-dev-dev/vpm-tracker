import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://djumpcacjgilncfuembx.supabase.co"
const SUPABASE_KEY = "sb_publishable_qPrYj-NAUKr9Z_fxweDB7A_FwGYZzDM"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)