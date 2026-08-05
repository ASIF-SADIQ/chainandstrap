-- Wan2.2 Cinematic Video Studio - Supabase Schema

-- Table: public.profiles
-- Note: If updating an existing database, run this command in Supabase SQL Editor:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits_expire_at timestamp with time zone DEFAULT (now() + interval '30 days');

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  credits integer default 0 not null,
  credits_expire_at timestamp with time zone default (now() + interval '30 days') not null,
  is_admin boolean default false not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: public.generations
create table if not exists public.generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'idle' check (status in ('idle', 'processing', 'completed', 'failed')),
  image_input_path text not null,
  video_input_path text not null,
  mode text default 'wan2.2-animate-mix' check (mode in ('wan2.2-animate-mix', 'wan2.2-animate-move')),
  quality text default 'wan-pro' check (quality in ('wan-pro', 'wan-std')),
  output_url text,
  error_log text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to automatically create a profile for a new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, credits, credits_expire_at)
  values (
    new.id, 
    split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4), 
    5,
    now() + interval '30 days'
  ); -- 5 free credits on signup (expires in 30 days)
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.generations enable row level security;

-- Profiles Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" 
on public.profiles for select 
using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" 
on public.profiles for select 
using ( (select is_admin from public.profiles where id = auth.uid()) = true );

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles" 
on public.profiles for update 
using ( (select is_admin from public.profiles where id = auth.uid()) = true );

-- Generations Policies
drop policy if exists "Users can view own generations" on public.generations;
create policy "Users can view own generations" 
on public.generations for select 
using (auth.uid() = user_id);

drop policy if exists "Users can insert own generations" on public.generations;
create policy "Users can insert own generations" 
on public.generations for insert 
with check (auth.uid() = user_id);

-- Note: The Python backend uses the Service Role key which bypasses RLS automatically, 
-- so we don't need to add UPDATE policies for the backend to change generation statuses.

-- Storage Policies (Requires the 'animation-vault' bucket to exist)
-- Note: 'animation-vault' must be created as a public bucket if output_url is used publicly, 
-- but uploads/access can be restricted here.

drop policy if exists "Users can upload to their folder" on storage.objects;
create policy "Users can upload to their folder" 
on storage.objects for insert 
with check (
  bucket_id = 'animation-vault' and 
  (auth.uid())::text = (storage.foldername(name))[2]
);

drop policy if exists "Users can view their folder" on storage.objects;
create policy "Users can view their folder" 
on storage.objects for select 
using (
  bucket_id = 'animation-vault' and 
  (auth.uid())::text = (storage.foldername(name))[2]
);
