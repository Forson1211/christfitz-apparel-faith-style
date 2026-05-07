
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDiscounts() {
  const { data, error } = await supabase
    .from('discounts')
    .select('*')
    .eq('active', true)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Active Discounts:', JSON.stringify(data, null, 2))
  
  const { data: settings, error: sError } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', 'announcement')
    .single()
    
  if (sError) {
    console.error('Settings Error:', sError)
  } else {
    console.log('Announcement Settings:', JSON.stringify(settings, null, 2))
  }
}

checkDiscounts()
