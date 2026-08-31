-- Stage the exact source-verified Product 2 identity and size-wise prices.
-- This migration does not infer owned stock from Meesho availability.

update public.products
set slug='teal-art-silk-embroidered-a-line-kurta',
    name='Teal Art-Silk Embroidered A-Line Kurta',
    description='A blue-teal Art Silk A-line kurta with a white geometric U-shaped embroidered yoke and three-quarter sleeves.',
    category_id=(select id from public.categories where slug='kurtis'),
    status='active',
    source_cost=177,
    material='Art Silk',
    occasion='Daily',
    updated_at=now()
where external_id='MSH-ETH-002';

update public.product_variants set active=false,updated_at=now()
where product_id=(select id from public.products where external_id='MSH-ETH-002');

create temporary table verified_product_2_variants(
  size text primary key,
  source_cost integer not null
) on commit drop;

insert into verified_product_2_variants values
('XXS',177),('S',242),('M',215),('L',261),('XL',261),('XXL',261),('XXXL',261),('4XL',261);

insert into public.product_variants(product_id,sku,size,colour,price_override,active)
select p.id,'MSH-ETH-002-'||v.size,v.size,'Blue-teal',v.source_cost+200,true
from verified_product_2_variants v
join public.products p on p.external_id='MSH-ETH-002'
on conflict(sku) do update set
  size=excluded.size,colour=excluded.colour,price_override=excluded.price_override,active=true,updated_at=now();

insert into public.inventory(variant_id,stock_on_hand,low_stock_threshold)
select v.id,0,3 from public.product_variants v
join public.products p on p.id=v.product_id
where p.external_id='MSH-ETH-002'
on conflict(variant_id) do nothing;
