create extension if not exists pgcrypto;

create type public.product_status as enum ('draft','active','archived');
create type public.order_status as enum ('pending','confirmed','processing','packed','shipped','delivered','cancelled','returned');
create type public.payment_status as enum ('pending','unpaid','processing','paid','failed','refunded','partially_refunded');
create type public.payment_method as enum ('cod','stripe');
create type public.inventory_movement_type as enum ('opening','purchase','adjustment','reservation','order','cancellation','return');

create table public.categories (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  description text, image_url text, sort_order integer not null default 0, active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(), external_id text unique, slug text not null unique, name text not null,
  short_description text, description text not null, category_id uuid references public.categories(id),
  status public.product_status not null default 'draft', source_cost integer not null check(source_cost >= 0),
  selling_price integer generated always as (source_cost + 200) stored,
  currency text not null default 'INR' check(currency='INR'), featured boolean not null default false,
  new_arrival boolean not null default false, best_seller boolean not null default false,
  material text, fit text, care text, occasion text, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null, alt_text text not null, position integer not null default 0 check(position >= 0),
  created_at timestamptz not null default now(), unique(product_id,position), unique(product_id,image_url)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique, size text not null, colour text, price_override integer check(price_override is null or price_override >= 0),
  active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(product_id,size,colour)
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(), variant_id uuid not null unique references public.product_variants(id) on delete cascade,
  stock_on_hand integer not null default 0 check(stock_on_hand >= 0), reserved_quantity integer not null default 0 check(reserved_quantity >= 0),
  available_quantity integer generated always as (stock_on_hand-reserved_quantity) stored,
  low_stock_threshold integer not null default 3 check(low_stock_threshold >= 0), updated_at timestamptz not null default now(),
  check(reserved_quantity <= stock_on_hand)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(), variant_id uuid not null references public.product_variants(id),
  movement_type public.inventory_movement_type not null, quantity integer not null check(quantity <> 0),
  reference_type text, reference_id uuid, note text, created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(), email text, phone text not null unique, full_name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(), customer_id uuid references public.customers(id) on delete set null,
  full_name text not null, phone text not null, address_line_1 text not null, address_line_2 text,
  locality text not null, landmark text, city text not null, state text not null, postal_code text not null,
  country text not null default 'India', created_at timestamptz not null default now(), check(postal_code ~ '^[0-9]{6}$')
);

create table public.orders (
  id uuid primary key default gen_random_uuid(), order_number text not null unique, access_token_hash text not null,
  idempotency_key uuid not null unique, customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null, email text, phone text not null, shipping_address jsonb not null,
  currency text not null default 'INR' check(currency='INR'), subtotal integer not null check(subtotal >= 0),
  shipping_amount integer not null default 0 check(shipping_amount=0), discount_amount integer not null default 0 check(discount_amount>=0),
  total_amount integer not null check(total_amount=subtotal+shipping_amount-discount_amount),
  payment_method public.payment_method not null, payment_status public.payment_status not null,
  order_status public.order_status not null, stripe_checkout_session_id text unique, stripe_payment_intent_id text,
  notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null, variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null, product_slug text not null, sku text not null, size text not null, colour text,
  unit_price integer not null check(unit_price>=0), quantity integer not null check(quantity between 1 and 10),
  line_total integer generated always as (unit_price*quantity) stored, image_url text, created_at timestamptz not null default now()
);

create table public.stripe_events (
  id text primary key, event_type text not null, processed_at timestamptz not null default now(), payload_reference text
);

create index products_active_category_idx on public.products(category_id,created_at desc) where status='active';
create index variants_product_active_idx on public.product_variants(product_id) where active;
create index inventory_available_idx on public.inventory(variant_id) where available_quantity > 0;
create index orders_phone_created_idx on public.orders(phone,created_at desc);
create index order_items_order_idx on public.order_items(order_id);
create index movements_variant_created_idx on public.inventory_movements(variant_id,created_at desc);

alter table public.categories enable row level security; alter table public.products enable row level security;
alter table public.product_images enable row level security; alter table public.product_variants enable row level security;
alter table public.inventory enable row level security; alter table public.inventory_movements enable row level security;
alter table public.customers enable row level security; alter table public.customer_addresses enable row level security;
alter table public.orders enable row level security; alter table public.order_items enable row level security;
alter table public.stripe_events enable row level security;

revoke all on all tables in schema public from anon, authenticated;

create view public.public_catalogue with (security_invoker=true) as
select p.id,p.external_id,p.slug,p.name,p.short_description,p.description,c.slug category_slug,c.name category,
 p.selling_price,p.currency,p.featured,p.new_arrival,p.best_seller,p.material,p.fit,p.care,p.occasion,
 coalesce((select jsonb_agg(jsonb_build_object('url',i.image_url,'alt',i.alt_text,'position',i.position) order by i.position) from public.product_images i where i.product_id=p.id),'[]') images,
 coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'sku',v.sku,'size',v.size,'colour',v.colour,'price',coalesce(v.price_override,p.selling_price),'available',inv.available_quantity>0) order by v.size) from public.product_variants v join public.inventory inv on inv.variant_id=v.id where v.product_id=p.id and v.active),'[]') variants
from public.products p left join public.categories c on c.id=p.category_id where p.status='active';
revoke all on public.public_catalogue from anon,authenticated;

create or replace function public.create_order(p_checkout jsonb,p_items jsonb,p_payment_method public.payment_method,p_idempotency_key uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_order public.orders; v_item jsonb; v_variant record; v_customer_id uuid; v_subtotal integer:=0; v_token text:=encode(gen_random_bytes(24),'hex'); v_qty integer; v_phone text;
begin
  if jsonb_array_length(p_items)<1 or jsonb_array_length(p_items)>25 then raise exception 'INVALID_CART'; end if;
  select * into v_order from public.orders where idempotency_key=p_idempotency_key;
  if found then return jsonb_build_object('order_number',v_order.order_number,'access_token',null,'duplicate',true); end if;
  v_phone:=regexp_replace(coalesce(p_checkout->>'phone',''),'\D','','g'); if length(v_phone)=12 and left(v_phone,2)='91' then v_phone:=right(v_phone,10); end if;
  if v_phone !~ '^[6-9][0-9]{9}$' or coalesce(p_checkout->>'postal_code','') !~ '^[0-9]{6}$' then raise exception 'INVALID_CHECKOUT'; end if;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty:=(v_item->>'quantity')::integer; if v_qty<1 or v_qty>10 then raise exception 'INVALID_QUANTITY'; end if;
    select v.id,v.product_id,v.sku,v.size,v.colour,coalesce(v.price_override,p.selling_price) unit_price,p.name,p.slug,
      (select image_url from public.product_images where product_id=p.id order by position limit 1) image_url,inv.available_quantity
      into v_variant from public.product_variants v join public.products p on p.id=v.product_id join public.inventory inv on inv.variant_id=v.id
      where v.sku=v_item->>'sku' and v.active and p.status='active' for update of inv;
    if not found then raise exception 'VARIANT_UNAVAILABLE'; end if; if v_variant.available_quantity<v_qty then raise exception 'INSUFFICIENT_STOCK'; end if;
    v_subtotal:=v_subtotal+(v_variant.unit_price*v_qty);
  end loop;
  insert into public.customers(phone,email,full_name) values(v_phone,nullif(p_checkout->>'email',''),p_checkout->>'full_name') on conflict(phone) do update set email=excluded.email,full_name=excluded.full_name,updated_at=now() returning id into v_customer_id;
  insert into public.orders(order_number,access_token_hash,idempotency_key,customer_id,customer_name,email,phone,shipping_address,subtotal,total_amount,payment_method,payment_status,order_status)
  values('DS-'||to_char(now(),'YYYYMMDD')||'-'||upper(substr(encode(gen_random_bytes(4),'hex'),1,6)),encode(digest(v_token,'sha256'),'hex'),p_idempotency_key,v_customer_id,p_checkout->>'full_name',nullif(p_checkout->>'email',''),v_phone,p_checkout, v_subtotal,v_subtotal,p_payment_method,case when p_payment_method='cod' then 'unpaid' else 'pending' end,case when p_payment_method='cod' then 'confirmed' else 'pending' end) returning * into v_order;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty:=(v_item->>'quantity')::integer;
    select v.id,v.product_id,v.sku,v.size,v.colour,coalesce(v.price_override,p.selling_price) unit_price,p.name,p.slug,(select image_url from public.product_images where product_id=p.id order by position limit 1) image_url into v_variant from public.product_variants v join public.products p on p.id=v.product_id where v.sku=v_item->>'sku';
    insert into public.order_items(order_id,product_id,variant_id,product_name,product_slug,sku,size,colour,unit_price,quantity,image_url) values(v_order.id,v_variant.product_id,v_variant.id,v_variant.name,v_variant.slug,v_variant.sku,v_variant.size,v_variant.colour,v_variant.unit_price,v_qty,v_variant.image_url);
    update public.inventory set reserved_quantity=reserved_quantity+v_qty,updated_at=now() where variant_id=v_variant.id;
    insert into public.inventory_movements(variant_id,movement_type,quantity,reference_type,reference_id,note) values(v_variant.id,'reservation',-v_qty,'order',v_order.id,'Checkout reservation');
  end loop;
  return jsonb_build_object('order_number',v_order.order_number,'access_token',v_token,'duplicate',false,'total',v_order.total_amount);
end $$;
revoke all on function public.create_order(jsonb,jsonb,public.payment_method,uuid) from public,anon,authenticated; grant execute on function public.create_order(jsonb,jsonb,public.payment_method,uuid) to service_role;

create or replace function public.apply_stripe_event(p_event_id text,p_event_type text,p_session_id text,p_payment_intent_id text)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$ begin
  insert into public.stripe_events(id,event_type,payload_reference) values(p_event_id,p_event_type,p_session_id) on conflict do nothing;
  if not found then return false; end if;
  if p_event_type='checkout.session.completed' then update public.orders set payment_status='paid',order_status='confirmed',stripe_payment_intent_id=p_payment_intent_id,updated_at=now() where stripe_checkout_session_id=p_session_id and payment_status<>'paid';
  elsif p_event_type='payment_intent.payment_failed' then update public.orders set payment_status='failed',updated_at=now() where stripe_payment_intent_id=p_payment_intent_id;
  elsif p_event_type='charge.refunded' then update public.orders set payment_status='refunded',updated_at=now() where stripe_payment_intent_id=p_payment_intent_id;
  end if; return true;
end $$;
revoke all on function public.apply_stripe_event(text,text,text,text) from public,anon,authenticated; grant execute on function public.apply_stripe_event(text,text,text,text) to service_role;

comment on table public.products is 'source_cost is internal; never expose this table directly to public clients';
comment on function public.create_order is 'Atomic server-only cart reconciliation, order snapshots, and inventory reservation';
