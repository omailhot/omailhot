create table if not exists orders (
  id uuid primary key,
  request_id text not null unique,
  submitted_at timestamptz not null,
  created_at timestamptz not null default now(),
  user_id text not null,
  user_email text,
  locale text not null,
  item_count integer not null check (item_count > 0),
  items_summary text not null,
  subtotal numeric(12, 2) not null,
  credit_used numeric(12, 2) not null,
  credit_remaining numeric(12, 2) not null,
  wallet_to_pay numeric(12, 2) not null,
  raw_payload jsonb not null
);

alter table orders add column if not exists is_locked boolean not null default false;
alter table orders add column if not exists locked_at timestamptz;
alter table orders add column if not exists lock_deadline_at timestamptz not null default '2026-03-02T00:00:00Z'::timestamptz;
alter table orders add column if not exists placed_at timestamptz;

create table if not exists order_items (
  id uuid primary key,
  order_id uuid not null references orders(id) on delete cascade,
  cart_line_id text not null,
  product_id text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null,
  line_total numeric(12, 2) not null,
  selected_options jsonb not null default '{}'::jsonb
);

create table if not exists app_users (
  user_id text primary key,
  email text not null unique,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

alter table app_users add column if not exists display_name text not null default '';

create table if not exists admin_users (
  user_id text primary key references app_users(user_id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_orders_user_id on orders(user_id);
create unique index if not exists idx_orders_user_id_unique on orders(user_id);
create index if not exists idx_order_items_order_id on order_items(order_id);
create unique index if not exists idx_order_items_order_line on order_items(order_id, cart_line_id);
create index if not exists idx_app_users_last_seen on app_users(last_seen_at desc);

-- Neon Auth + RLS setup for direct frontend Data API access
-- Make sure Neon Auth is enabled in the Neon console before relying on auth.user_id().
grant usage on schema public to authenticated;
grant select, insert, update, delete on orders to authenticated;
grant select, insert, update, delete on order_items to authenticated;
grant select, insert, update on app_users to authenticated;
grant select on admin_users to authenticated;

alter table orders enable row level security;
alter table order_items enable row level security;
alter table app_users enable row level security;
alter table admin_users enable row level security;

drop policy if exists orders_select_own on orders;
create policy orders_select_own
  on orders
  for select
  to authenticated
  using (
    user_id = auth.user_id()
    or exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists orders_insert_own on orders;
create policy orders_insert_own
  on orders
  for insert
  to authenticated
  with check (
    user_id = auth.user_id()
    or exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists orders_update_own on orders;
create policy orders_update_own
  on orders
  for update
  to authenticated
  using (
    (
      user_id = auth.user_id()
      and now() < lock_deadline_at
    )
    or exists (select 1 from admin_users a where a.user_id = auth.user_id())
  )
  with check (
    (
      user_id = auth.user_id()
      and now() < lock_deadline_at
    )
    or exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists orders_delete_own on orders;
create policy orders_delete_own
  on orders
  for delete
  to authenticated
  using (
    user_id = auth.user_id()
    or exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists order_items_select_own on order_items;
create policy order_items_select_own
  on order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and (
          o.user_id = auth.user_id()
          or exists (select 1 from admin_users a where a.user_id = auth.user_id())
        )
    )
  );

drop policy if exists order_items_insert_own on order_items;
create policy order_items_insert_own
  on order_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and (
          (
            o.user_id = auth.user_id()
            and not o.is_locked
            and now() < o.lock_deadline_at
          )
          or exists (select 1 from admin_users a where a.user_id = auth.user_id())
        )
    )
  );

drop policy if exists order_items_update_own on order_items;
create policy order_items_update_own
  on order_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and (
          (
            o.user_id = auth.user_id()
            and not o.is_locked
            and now() < o.lock_deadline_at
          )
          or exists (select 1 from admin_users a where a.user_id = auth.user_id())
        )
    )
  )
  with check (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and (
          (
            o.user_id = auth.user_id()
            and not o.is_locked
            and now() < o.lock_deadline_at
          )
          or exists (select 1 from admin_users a where a.user_id = auth.user_id())
        )
    )
  );

drop policy if exists order_items_delete_own on order_items;
create policy order_items_delete_own
  on order_items
  for delete
  to authenticated
  using (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and (
          (
            o.user_id = auth.user_id()
            and not o.is_locked
            and now() < o.lock_deadline_at
          )
          or exists (select 1 from admin_users a where a.user_id = auth.user_id())
        )
    )
  );

drop policy if exists app_users_select on app_users;
create policy app_users_select
  on app_users
  for select
  to authenticated
  using (
    user_id = auth.user_id()
    or exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists app_users_insert on app_users;
create policy app_users_insert
  on app_users
  for insert
  to authenticated
  with check (user_id = auth.user_id());

drop policy if exists app_users_update on app_users;
create policy app_users_update
  on app_users
  for update
  to authenticated
  using (user_id = auth.user_id())
  with check (user_id = auth.user_id());

drop policy if exists admin_users_select on admin_users;
create policy admin_users_select
  on admin_users
  for select
  to authenticated
  using (
    user_id = auth.user_id()
    or exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );
