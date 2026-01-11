const { createClient } = require('@supabase/supabase-js');

// Config from .env
const SUPABASE_URL = 'https://ucnnmjmzigfnhseqzzct.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbm5tam16aWdmbmhzZXF6emN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjMwMDc4MCwiZXhwIjoyMDgxODc2NzgwfQ.RWo3hXueGpksFRdN-WBLMw92XxY2zU-1XEe0RAKu7Jo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function init() {
    console.log('--- Initializing Profile ---');

    // 1. Check for existing users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    let userId;

    if (users.length === 0) {
        console.log('No users found. Creating default admin user...');
        const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
            email: 'admin@monarch.com',
            password: 'adminpassword123',
            email_confirm: true
        });

        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }

        console.log('Created user:', user.email, user.id);
        userId = user.id;
    } else {
        console.log(`Found ${users.length} users. Using the first one.`);
        userId = users[0].id;
        console.log('User ID:', userId);
    }

    // 2. Check for profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profile) {
        console.log('Profile already exists for this user.');
        console.log('Profile Name:', profile.full_name);
    } else {
        console.log('No profile found. Creating default profile...');

        const defaultProfile = {
            id: userId,
            full_name: 'Harish Rohith',
            headline: 'System Architect',
            bio: 'Software Architect specializing in scalable systems.',
            level: 1,
            xp: 0,
            is_awakened: true,
            updated_at: new Date()
        };

        const { error: insertError } = await supabase
            .from('profiles')
            .insert(defaultProfile);

        if (insertError) {
            console.error('Error creating profile:', insertError);
        } else {
            console.log('Successfully created profile for Harish Rohith.');
        }
    }
}

init();
