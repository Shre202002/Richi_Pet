-- Richi's PET Stuff: B2B ordering. Run in Supabase SQL editor.
-- No stock tracking by design.

create type user_role as enum ('admin', 'salesperson', 'shop');
create type shop_status as enum ('pending', 'approved', 'blocked');
create type order_status as enum ('placed', 'accepted', 'rejected', 'dispatched', 'delivered');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null default 'shop',
  name text not null,
  phone text
);

create table shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),          -- login of the shop owner
  salesperson_id uuid references profiles(id),    -- assigned rep
  name text not null,
  gstin text,
  address text,
  phone text,
  status shop_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort int not null default 0
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  name text not null,
  pack_size text,
  image_url text,
  price numeric(10,2) not null,       -- wholesale price
  mrp numeric(10,2),
  gst_percent numeric(4,1) not null default 0,
  active boolean not null default true
);

create sequence invoice_seq;

create table orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id),
  placed_by uuid not null references profiles(id),
  status order_status not null default 'placed',
  reject_reason text,
  total numeric(12,2) not null,
  note text,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  name text not null,                 -- snapshot
  qty int not null check (qty > 0),
  price numeric(10,2) not null,       -- price snapshot
  gst_percent numeric(4,1) not null default 0
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id),
  order_id uuid references orders(id),
  amount numeric(12,2) not null check (amount > 0),
  mode text,
  note text,
  paid_on date not null default current_date
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  type text not null check (type in ('order', 'dispatch')),
  number text not null unique default 'RP-' || lpad(nextval('invoice_seq')::text, 5, '0'),
  created_at timestamptz not null default now(),
  unique (order_id, type)
);

-- Outstanding per shop: dispatched/delivered orders minus payments.
create view shop_balance with (security_invoker = true) as
select s.id as shop_id,
  coalesce((select sum(total) from orders o where o.shop_id = s.id and o.status in ('dispatched','delivered')), 0)
  - coalesce((select sum(amount) from payments p where p.shop_id = s.id), 0) as outstanding
from shops s;

-- ---------- RLS ----------
create function my_role() returns user_role language sql stable security definer as
  $$ select role from profiles where id = auth.uid() $$;

create function my_shop_ids() returns setof uuid language sql stable security definer as
  $$ select id from shops where owner_id = auth.uid() or salesperson_id = auth.uid() $$;

alter table profiles enable row level security;
alter table shops enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table invoices enable row level security;

create policy "own profile" on profiles for select using (id = auth.uid() or my_role() = 'admin');
create policy "admin all profiles" on profiles for all using (my_role() = 'admin');

create policy "shops read" on shops for select using (my_role() = 'admin' or id in (select my_shop_ids()));
create policy "shop self-register" on shops for insert with check (owner_id = auth.uid() and status = 'pending');
create policy "admin shops write" on shops for all using (my_role() = 'admin');

-- Catalog (and prices) visible only to approved users.
create policy "categories read" on categories for select using (auth.uid() is not null);
create policy "admin categories" on categories for all using (my_role() = 'admin');
create policy "products read" on products for select using (
  my_role() = 'admin' or (active and exists (select 1 from shops where id in (select my_shop_ids()) and status = 'approved')));
create policy "admin products" on products for all using (my_role() = 'admin');

create policy "orders read" on orders for select using (my_role() = 'admin' or shop_id in (select my_shop_ids()));
create policy "orders insert" on orders for insert with check (
  placed_by = auth.uid() and status = 'placed'
  and shop_id in (select id from shops where id in (select my_shop_ids()) and status = 'approved'));
create policy "admin orders update" on orders for update using (my_role() = 'admin');

create policy "items read" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (my_role() = 'admin' or o.shop_id in (select my_shop_ids()))));
create policy "items insert" on order_items for insert with check (
  exists (select 1 from orders o where o.id = order_id and o.placed_by = auth.uid() and o.status = 'placed'));

create policy "payments read" on payments for select using (my_role() = 'admin' or shop_id in (select my_shop_ids()));
create policy "admin payments" on payments for all using (my_role() = 'admin');

create policy "invoices read" on invoices for select using (
  exists (select 1 from orders o where o.id = order_id and (my_role() = 'admin' or o.shop_id in (select my_shop_ids()))));
create policy "admin invoices" on invoices for all using (my_role() = 'admin');

-- Auto-create a profile on signup (role always 'shop'; admin promotes manually).
create function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email), new.raw_user_meta_data->>'phone');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
