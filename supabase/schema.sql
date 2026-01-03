-- Catalog.AI Database Schema
-- 크레딧 기반 카탈로그 생성 시스템

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  company_name text,
  credits integer default 3, -- 무료 크레딧 3개
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Catalogs table
create table if not exists public.catalogs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  company_name text not null,
  logo_url text,
  brand_color text,
  status text default 'draft', -- draft, generating, completed, failed
  language text[] default '{ko}',
  product_count integer default 0,
  pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.catalogs enable row level security;

-- Catalogs policies
create policy "Users can view own catalogs"
  on public.catalogs for select
  using (auth.uid() = user_id);

create policy "Users can create catalogs"
  on public.catalogs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own catalogs"
  on public.catalogs for update
  using (auth.uid() = user_id);

create policy "Users can delete own catalogs"
  on public.catalogs for delete
  using (auth.uid() = user_id);

-- Products table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  catalog_id uuid references public.catalogs(id) on delete cascade not null,
  model_name text,
  category text,
  specifications jsonb default '{}'::jsonb,
  features text[] default '{}',
  image_url text,
  confidence text, -- high, medium, low
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.products enable row level security;

-- Products policies
create policy "Users can view products of own catalogs"
  on public.products for select
  using (
    exists (
      select 1 from public.catalogs
      where catalogs.id = products.catalog_id
      and catalogs.user_id = auth.uid()
    )
  );

create policy "Users can insert products to own catalogs"
  on public.products for insert
  with check (
    exists (
      select 1 from public.catalogs
      where catalogs.id = products.catalog_id
      and catalogs.user_id = auth.uid()
    )
  );

-- Transactions table (크레딧 충전/사용 이력)
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- charge, use
  amount integer not null,
  balance_after integer not null,
  description text,
  catalog_id uuid references public.catalogs(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Transactions policies
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

-- Functions

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, credits)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    3 -- 무료 크레딧 3개
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Use credit function
create or replace function public.use_credit(catalog_id_param uuid)
returns boolean as $$
declare
  user_credits integer;
begin
  -- Get current credits
  select credits into user_credits
  from public.profiles
  where id = auth.uid();

  -- Check if enough credits
  if user_credits < 1 then
    raise exception 'Not enough credits';
  end if;

  -- Deduct credit
  update public.profiles
  set credits = credits - 1,
      updated_at = now()
  where id = auth.uid();

  -- Record transaction
  insert into public.transactions (user_id, type, amount, balance_after, catalog_id, description)
  values (
    auth.uid(),
    'use',
    -1,
    user_credits - 1,
    catalog_id_param,
    'Catalog generation'
  );

  return true;
end;
$$ language plpgsql security definer;

-- Charge credit function
create or replace function public.charge_credit(amount_param integer)
returns boolean as $$
declare
  user_credits integer;
begin
  -- Get current credits
  select credits into user_credits
  from public.profiles
  where id = auth.uid();

  -- Add credits
  update public.profiles
  set credits = credits + amount_param,
      updated_at = now()
  where id = auth.uid();

  -- Record transaction
  insert into public.transactions (user_id, type, amount, balance_after, description)
  values (
    auth.uid(),
    'charge',
    amount_param,
    user_credits + amount_param,
    'Credit purchase'
  );

  return true;
end;
$$ language plpgsql security definer;

-- Indexes
create index if not exists catalogs_user_id_idx on public.catalogs(user_id);
create index if not exists products_catalog_id_idx on public.products(catalog_id);
create index if not exists transactions_user_id_idx on public.transactions(user_id);
