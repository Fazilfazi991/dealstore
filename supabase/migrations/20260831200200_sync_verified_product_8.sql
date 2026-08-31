-- Stage the exact source-verified Product 8 identity and S-XXL prices.
-- This migration does not infer owned stock from Meesho availability.

update public.products
set slug='black-floral-fit-and-flare-maxi-dress',
    name='Black Floral Fit-and-Flare Maxi Dress',
    description='A black cotton-blend fit-and-flare maxi with tiny white florals, slim shoulder straps, an off-shoulder gathered neckline, short puff sleeves and a smocked waist.',
    category_id=(select id from public.categories where slug='dresses'),
    status='active',
    source_cost=279,
    material='Cotton Blend',
    occasion='Casual / party',
    updated_at=now()
where external_id='MSH-WES-008';

update public.product_variants set active=false,updated_at=now()
where product_id=(select id from public.products where external_id='MSH-WES-008');

create temporary table verified_product_8_variants(
  size text primary key,
  source_cost integer not null
) on commit drop;

insert into verified_product_8_variants values
('S',289),('M',279),('L',289),('XL',289),('XXL',289);

insert into public.product_variants(product_id,sku,size,colour,price_override,active)
select p.id,'MSH-WES-008-'||v.size,v.size,'Black with white floral print',v.source_cost+200,true
from verified_product_8_variants v
join public.products p on p.external_id='MSH-WES-008'
on conflict(sku) do update set
  size=excluded.size,colour=excluded.colour,price_override=excluded.price_override,active=true,updated_at=now();

insert into public.inventory(variant_id,stock_on_hand,low_stock_threshold)
select v.id,0,3 from public.product_variants v
join public.products p on p.id=v.product_id
where p.external_id='MSH-WES-008'
on conflict(variant_id) do nothing;
