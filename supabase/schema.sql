create extension if not exists "uuid-ossp";

create table if not exists properties (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null,
  description text,
  nightly_rate numeric(10,2) not null default 0,
  status text not null default 'available',
  created_at timestamptz not null default now()
);

create table if not exists customer_accounts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) on delete cascade,
  guest_name text not null,
  guest_email text not null,
  arrival_date date not null,
  departure_date date not null,
  guests integer not null default 2,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists inquiries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists site_content (
  id uuid primary key default uuid_generate_v4(),
  section_name text unique not null,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_bookings_property_id on bookings(property_id);
create index if not exists idx_bookings_dates on bookings(arrival_date, departure_date);
create index if not exists idx_inquiries_email on inquiries(email);

alter table customer_accounts enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_accounts' and policyname = 'customer_accounts_public_access') then
    create policy customer_accounts_public_access on customer_accounts for all using (true) with check (true);
  end if;
end $$;

alter table properties enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'properties' and policyname = 'properties_public_access') then
    create policy properties_public_access on properties for all using (true) with check (true);
  end if;
end $$;

alter table bookings enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'bookings_public_access') then
    create policy bookings_public_access on bookings for all using (true) with check (true);
  end if;
end $$;

alter table inquiries enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'inquiries' and policyname = 'inquiries_public_access') then
    create policy inquiries_public_access on inquiries for all using (true) with check (true);
  end if;
end $$;

alter table site_content enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_content' and policyname = 'site_content_public_access') then
    create policy site_content_public_access on site_content for all using (true) with check (true);
  end if;
end $$;

create table if not exists roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists permissions (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  category text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists role_permissions (
  id uuid primary key default uuid_generate_v4(),
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (role_id, permission_id)
);

create table if not exists staff_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  full_name text not null,
  username text unique,
  email text not null unique,
  contact_number text,
  status text not null default 'active',
  role_id uuid references roles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  role_id uuid not null references roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, role_id)
);

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid,
  actor_name text,
  action text not null,
  resource text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table roles enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'roles' and policyname = 'roles_public_access') then
    create policy roles_public_access on roles for all using (true) with check (true);
  end if;
end $$;

alter table permissions enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'permissions' and policyname = 'permissions_public_access') then
    create policy permissions_public_access on permissions for all using (true) with check (true);
  end if;
end $$;

alter table role_permissions enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'role_permissions' and policyname = 'role_permissions_public_access') then
    create policy role_permissions_public_access on role_permissions for all using (true) with check (true);
  end if;
end $$;

alter table staff_profiles enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'staff_profiles' and policyname = 'staff_profiles_public_access') then
    create policy staff_profiles_public_access on staff_profiles for all using (true) with check (true);
  end if;
end $$;

alter table user_roles enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_roles' and policyname = 'user_roles_public_access') then
    create policy user_roles_public_access on user_roles for all using (true) with check (true);
  end if;
end $$;

alter table audit_logs enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'audit_logs' and policyname = 'audit_logs_public_access') then
    create policy audit_logs_public_access on audit_logs for all using (true) with check (true);
  end if;
end $$;

create index if not exists idx_staff_profiles_email on staff_profiles(email);
create index if not exists idx_staff_profiles_role on staff_profiles(role_id);
create index if not exists idx_user_roles_user_id on user_roles(user_id);
create index if not exists idx_audit_logs_resource on audit_logs(resource);

insert into roles (id, name, description, is_system)
values
  ('a1ddb8fc-4d84-4768-b975-bf18f4473d2f', 'Super Admin', 'Full access to the resort administration system', true),
  ('fb9f7b1d-1e41-4ace-bf89-5a0d3df1f6d9', 'Resort Manager', 'Operational oversight for bookings, rooms, and reports', false),
  ('9f0b5932-3d3f-49ea-b199-bf17b0a0a47b', 'Receptionist', 'Guest support and booking verification', false),
  ('64ac40db-cbd2-4051-a2aa-9c9776e8fee3', 'Cashier', 'Payments and reporting', false),
  ('5d2c41ce-30ec-48ae-a7ff-aa27f8b410b7', 'Housekeeping', 'Room availability updates', false)
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- Reservation persistence
-- The original bookings table only carried the basic stay details. Extend it so
-- a reservation keeps its reference, party breakdown, chosen rooms, totals and
-- payment state for the life of the account.
-- ---------------------------------------------------------------------------

alter table bookings add column if not exists user_id text;
alter table bookings add column if not exists booking_reference text;
alter table bookings add column if not exists adults integer not null default 2;
alter table bookings add column if not exists children integer not null default 0;
alter table bookings add column if not exists nights integer not null default 1;
alter table bookings add column if not exists room_ids jsonb not null default '[]'::jsonb;
alter table bookings add column if not exists rooms jsonb not null default '[]'::jsonb;
alter table bookings add column if not exists total_amount numeric(12,2) not null default 0;
alter table bookings add column if not exists amount_paid numeric(12,2) not null default 0;
alter table bookings add column if not exists payment_status text not null default 'unpaid';
alter table bookings add column if not exists payment_type text;
alter table bookings add column if not exists payment_reference text;
alter table bookings add column if not exists payments jsonb not null default '[]'::jsonb;
alter table bookings add column if not exists updated_at timestamptz not null default now();
alter table bookings add column if not exists approved_at timestamptz;
alter table bookings add column if not exists completed_at timestamptz;

create unique index if not exists idx_bookings_reference on bookings(booking_reference);
create index if not exists idx_bookings_user_id on bookings(user_id);
create index if not exists idx_bookings_status on bookings(status);

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------

create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid,
  booking_reference text,
  payment_reference text not null unique,
  amount numeric(12,2) not null default 0,
  payment_type text not null default 'downpayment',
  method text not null default 'cash',
  status text not null default 'pending',
  customer_email text,
  guest_name text,
  verification_code text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists idx_payments_booking on payments(booking_id);
create index if not exists idx_payments_status on payments(status);

alter table payments enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'payments_public_access') then
    create policy payments_public_access on payments for all using (true) with check (true);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Support chat
-- ---------------------------------------------------------------------------

create table if not exists chat_threads (
  id uuid primary key default uuid_generate_v4(),
  ticket_number text,
  customer_id text not null unique,
  customer_name text not null,
  customer_email text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  sender text not null,
  sender_name text,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_threads_customer on chat_threads(customer_id);
create index if not exists idx_chat_messages_thread on chat_messages(thread_id);

alter table chat_threads enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'chat_threads' and policyname = 'chat_threads_public_access') then
    create policy chat_threads_public_access on chat_threads for all using (true) with check (true);
  end if;
end $$;

alter table chat_messages enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'chat_messages' and policyname = 'chat_messages_public_access') then
    create policy chat_messages_public_access on chat_messages for all using (true) with check (true);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Room catalogue details
-- The properties table only stored pricing and status. Capacity, amenities and
-- imagery drive availability and the booking flow, so keep them with the room.
-- ---------------------------------------------------------------------------

alter table properties add column if not exists capacity integer not null default 2;
alter table properties add column if not exists amenities jsonb not null default '[]'::jsonb;
alter table properties add column if not exists image text;

update properties set capacity = 2, type = 'suite' where name = 'Laguna Suite';
update properties set capacity = 4, type = 'villa' where name = 'Palm Courtyard Villa';
update properties set capacity = 2, type = 'room' where name = 'Coral Horizon Room';

update properties set amenities = '["Ocean view","Private terrace","Breakfast included"]'::jsonb
  where name = 'Laguna Suite' and (amenities is null or amenities = '[]'::jsonb);
update properties set amenities = '["Private pool","Two bedrooms","Garden dining"]'::jsonb
  where name = 'Palm Courtyard Villa' and (amenities is null or amenities = '[]'::jsonb);
update properties set amenities = '["Balcony","Beach access","Sunrise coffee setup"]'::jsonb
  where name = 'Coral Horizon Room' and (amenities is null or amenities = '[]'::jsonb);

update properties set image = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
  where name = 'Laguna Suite' and image is null;
update properties set image = 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80'
  where name = 'Palm Courtyard Villa' and image is null;
update properties set image = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80'
  where name = 'Coral Horizon Room' and image is null;
