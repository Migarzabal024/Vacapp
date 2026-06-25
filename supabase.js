import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Reemplaza estas dos variables con los datos de tu proyecto de Supabase
const supabaseUrl = 'https://ozwwebxuqzbmlanmlwgd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96d3dlYnh1cXpibWlhbm1sd2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODYzOTUsImV4cCI6MjA5Nzg2MjM5NX0.hEe61QfVZLn_cU2GPUEL1DZ3cBJkxavgUfMtnDZEqsQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);