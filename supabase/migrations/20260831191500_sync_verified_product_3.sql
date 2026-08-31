-- Stage the exact source-verified Product 3 identity and S-XXL prices.
-- This migration does not infer owned stock from Meesho availability.

update public.products
set slug='peach-printed-kurta-palazzo-set',
    name='Peach Printed Kurta Palazzo Set',
    description='A sleeveless peach rayon kurta with a square neckline and floral ethnic-motif print, paired with plain white rayon palazzos.',
    category_id=(select id from public.categories where slug='kurta-sets'),
    status='active',
    source_cost=275,
    material='Rayon',
    occasion='Daily / casual outing',
    updated_at=now()
where external_id='MSH-SET-003';

update public.product_variants set active=false,updated_at=now()
where product_id=(select id from public.products where external_id='MSH-SET-003');

create temporary table verified_product_3_variants(
  size text primary key,
  source_cost integer not null
) on commit drop;

insert into verified_product_3_variants values
('S',275),('M',275),('L',275),('XL',275),('XXL',275);

insert into public.product_variants(product_id,sku,size,colour,price_override,active)
select p.id,'MSH-SET-003-'||v.size,v.size,'Peach kurta with white palazzos',v.source_cost+200,true
from verified_product_3_variants v
join public.products p on p.external_id='MSH-SET-003'
on conflict(sku) do update set
  size=excluded.size,colour=excluded.colour,price_override=excluded.price_override,active=true,updated_at=now();

insert into public.inventory(variant_id,stock_on_hand,low_stock_threshold)
select v.id,0,3 from public.product_variants v
join public.products p on p.id=v.product_id
where p.external_id='MSH-SET-003'
on conflict(variant_id) do nothing;
