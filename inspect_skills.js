
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://ucnnmjmzigfnhseqzzct.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbm5tam16aWdmbmhzZXF6emN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMDA3ODAsImV4cCI6MjA4MTg3Njc4MH0.8VK_DRQignE59e3nmy6dUp-08g_NAPkFaoZcYNnxFyI'
);

async function inspectSkills() {
    const { data, error } = await supabase
        .from('skills')
        .select('*');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

inspectSkills();
