import dotenv from 'dotenv';

dotenv.config();

const adminAccount = {
  username: 'admin',
  email: 'admin@resort.local',
  password: 'admin',
  role: 'super-admin',
};

console.log('Initial Super Admin provisioning guide');
console.log('-------------------------------------');
console.log('Username: admin');
console.log('Email: admin@resort.local');
console.log('Password: admin');
console.log('IMPORTANT: This local-development account is for testing only. Replace with a secure password before production deployment.');
console.log('If the live Supabase project has a service role key configured, the project can synchronize the same account through a secure backend provisioning flow.');
console.log('Local fallback mode does not store the plaintext password in the Supabase database; it keeps it hashed in the app runtime and requires a secure replacement before going live.');
console.log('Provisioning target:', adminAccount.email);
