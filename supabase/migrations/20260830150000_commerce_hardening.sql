-- Batch 2 hardening: catalogue imports, safer public projection, and operational fields.
alter type public.product_status add value if not exists 'inactive';
alter table public.categories add column if not exists updated_at timestamptz not null default now();
alter table public.product_images add column if not exists is_primary boolean not null default false;
alter table public.customers add column if not exists normalized_phone text;
update public.customers set normalized_phone=phone where normalized_phone is null;
alter table public.customers alter column normalized_phone set not null;
create unique index if not exists customers_normalized_phone_idx on public.customers(normalized_phone);
create or replace function public.set_normalized_customer_phone() returns trigger language plpgsql security invoker set search_path='' as $$ begin new.normalized_phone:=regexp_replace(new.phone,'\D','','g');if length(new.normalized_phone)=12 and left(new.normalized_phone,2)='91' then new.normalized_phone:=right(new.normalized_phone,10);end if;return new;end $$;
drop trigger if exists customers_normalize_phone on public.customers;
create trigger customers_normalize_phone before insert or update of phone on public.customers for each row execute function public.set_normalized_customer_phone();
revoke all on function public.set_normalized_customer_phone() from public,anon,authenticated;
create index if not exists orders_number_created_idx on public.orders(order_number,created_at desc);
create index if not exists orders_stripe_payment_intent_idx on public.orders(stripe_payment_intent_id) where stripe_payment_intent_id is not null;
create unique index if not exists product_primary_image_idx on public.product_images(product_id) where is_primary;

create or replace view public.public_catalogue with (security_invoker=true) as
select p.id,p.external_id,p.slug,p.name,p.short_description,p.description,c.slug category_slug,c.name category,
 p.selling_price,p.currency,p.featured,p.new_arrival,p.best_seller,p.material,p.fit,p.care,p.occasion,p.created_at,
 coalesce((select jsonb_agg(jsonb_build_object('url',i.image_url,'alt',i.alt_text,'position',i.position,'is_primary',i.is_primary) order by i.position) from public.product_images i where i.product_id=p.id),'[]') images,
 coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'sku',v.sku,'size',v.size,'colour',v.colour,'price',coalesce(v.price_override,p.selling_price),'available',inv.available_quantity>0,'available_quantity',inv.available_quantity) order by v.created_at,v.size) from public.product_variants v join public.inventory inv on inv.variant_id=v.id where v.product_id=p.id and v.active),'[]') variants
from public.products p left join public.categories c on c.id=p.category_id where p.status='active' and coalesce(c.active,true);
revoke all on public.public_catalogue from anon,authenticated;

create or replace function public.import_catalogue(p_rows jsonb, p_dry_run boolean default true)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  r jsonb; v_product_id uuid; v_category_id uuid; v_variant_id uuid; v_slug text; v_external_id text;
  v_size text; v_image jsonb; v_position integer; v_created integer:=0; v_updated integer:=0; v_variants integer:=0; v_images integer:=0;
begin
  if jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)=0 then raise exception 'IMPORT_EMPTY'; end if;
  perform pg_advisory_xact_lock(hashtext('dealstore_catalogue_import'));
  create temporary table import_seen_slugs(slug text primary key) on commit drop;
  for r in select * from jsonb_array_elements(p_rows) loop
    v_slug:=lower(regexp_replace(trim(coalesce(r->>'slug','')),'[^a-z0-9]+','-','g'));
    v_slug:=trim(both '-' from v_slug); v_external_id:=upper(trim(coalesce(r->>'externalId','')));
    if v_slug='' or v_external_id='' or length(trim(coalesce(r->>'name','')))<2 then raise exception 'IMPORT_REQUIRED_FIELD'; end if;
    if coalesce((r->>'sourceCost')::integer,-1)<0 then raise exception 'IMPORT_INVALID_PRICE:%',v_slug; end if;
    if coalesce((r->>'stock')::integer,-1)<0 then raise exception 'IMPORT_INVALID_STOCK:%',v_slug; end if;
    if jsonb_typeof(r->'sizes')<>'array' or jsonb_array_length(r->'sizes')=0 then raise exception 'IMPORT_INVALID_SIZES:%',v_slug; end if;
    if jsonb_typeof(r->'images')<>'array' or jsonb_array_length(r->'images')=0 then raise exception 'IMPORT_MISSING_IMAGES:%',v_slug; end if;
    insert into import_seen_slugs values(v_slug);
    if p_dry_run then continue; end if;
    insert into public.categories(slug,name) values(lower(trim(r->>'category')),initcap(trim(r->>'category'))) on conflict(slug) do update set active=true,updated_at=now() returning id into v_category_id;
    select id into v_product_id from public.products where external_id=v_external_id;
    if v_product_id is null then
      insert into public.products(external_id,slug,name,short_description,description,category_id,status,source_cost,material,fit,care,occasion,featured,new_arrival,best_seller)
      values(v_external_id,v_slug,trim(r->>'name'),nullif(trim(coalesce(r->>'shortDescription','')),''),trim(r->>'description'),v_category_id,'active',(r->>'sourceCost')::integer,nullif(trim(coalesce(r->>'material','')),''),nullif(trim(coalesce(r->>'fit','')),''),nullif(trim(coalesce(r->>'care','')),''),nullif(trim(coalesce(r->>'occasion','')),''),coalesce((r->>'featured')::boolean,false),coalesce((r->>'newArrival')::boolean,false),coalesce((r->>'bestSeller')::boolean,false)) returning id into v_product_id;
      v_created:=v_created+1;
    else
      update public.products set slug=v_slug,name=trim(r->>'name'),short_description=nullif(trim(coalesce(r->>'shortDescription','')),''),description=trim(r->>'description'),category_id=v_category_id,status='active',source_cost=(r->>'sourceCost')::integer,material=nullif(trim(coalesce(r->>'material','')),''),fit=nullif(trim(coalesce(r->>'fit','')),''),care=nullif(trim(coalesce(r->>'care','')),''),occasion=nullif(trim(coalesce(r->>'occasion','')),''),featured=coalesce((r->>'featured')::boolean,false),new_arrival=coalesce((r->>'newArrival')::boolean,false),best_seller=coalesce((r->>'bestSeller')::boolean,false),updated_at=now() where id=v_product_id;
      v_updated:=v_updated+1;
    end if;
    update public.product_variants set active=false,updated_at=now() where product_id=v_product_id;
    for v_size in select upper(trim(value#>>'{}')) from jsonb_array_elements(r->'sizes') loop
      if v_size='' or v_size !~ '^[A-Z0-9]{1,6}$' then raise exception 'IMPORT_INVALID_SIZE:%',v_slug; end if;
      insert into public.product_variants(product_id,sku,size,colour,active) values(v_product_id,v_external_id||'-'||regexp_replace(v_size,'[^A-Z0-9]','','g'),v_size,nullif(trim(coalesce(r->>'colour','')),''),true)
      on conflict(sku) do update set size=excluded.size,colour=excluded.colour,active=true,updated_at=now() returning id into v_variant_id;
      insert into public.inventory(variant_id,stock_on_hand,low_stock_threshold) values(v_variant_id,coalesce((r->>'stock')::integer,0),3)
      on conflict(variant_id) do update set stock_on_hand=greatest(excluded.stock_on_hand,public.inventory.reserved_quantity),updated_at=now();
      insert into public.inventory_movements(variant_id,movement_type,quantity,note) select v_variant_id,'opening',(r->>'stock')::integer,'Catalogue import opening stock' where (r->>'stock')::integer<>0 and not exists(select 1 from public.inventory_movements where variant_id=v_variant_id);
      v_variants:=v_variants+1;
    end loop;
    delete from public.product_images where product_id=v_product_id;
    v_position:=0;
    for v_image in select * from jsonb_array_elements(r->'images') loop
      if trim(coalesce(v_image->>'url',''))='' then raise exception 'IMPORT_INVALID_IMAGE:%',v_slug; end if;
      insert into public.product_images(product_id,image_url,alt_text,position,is_primary) values(v_product_id,trim(v_image->>'url'),coalesce(nullif(trim(v_image->>'alt'),''),trim(r->>'name')),v_position,v_position=0);
      v_position:=v_position+1; v_images:=v_images+1;
    end loop;
  end loop;
  return jsonb_build_object('dry_run',p_dry_run,'valid_products',jsonb_array_length(p_rows),'created',case when p_dry_run then 0 else v_created end,'updated',case when p_dry_run then 0 else v_updated end,'variants',case when p_dry_run then 0 else v_variants end,'images',case when p_dry_run then 0 else v_images end);
exception when unique_violation then raise exception 'IMPORT_DUPLICATE_SLUG';
end $$;
revoke all on function public.import_catalogue(jsonb,boolean) from public,anon,authenticated;
grant execute on function public.import_catalogue(jsonb,boolean) to service_role;

comment on function public.import_catalogue is 'Atomic service-role-only catalogue validation/upsert. Dry-run performs all validation then rolls back no data by skipping writes.';

create or replace function public.abandon_stripe_order(p_order_number text)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_order_id uuid; line record;
begin
  select id into v_order_id from public.orders where order_number=p_order_number and payment_method='stripe' and payment_status='pending' and order_status='pending' for update;
  if not found then return false; end if;
  for line in select variant_id,quantity from public.order_items where order_id=v_order_id loop
    update public.inventory set reserved_quantity=greatest(0,reserved_quantity-line.quantity),updated_at=now() where variant_id=line.variant_id;
    insert into public.inventory_movements(variant_id,movement_type,quantity,reference_type,reference_id,note) values(line.variant_id,'cancellation',line.quantity,'order',v_order_id,'Online checkout session could not be created');
  end loop;
  update public.orders set payment_status='failed',order_status='cancelled',updated_at=now() where id=v_order_id;
  return true;
end $$;
revoke all on function public.abandon_stripe_order(text) from public,anon,authenticated;
grant execute on function public.abandon_stripe_order(text) to service_role;
