-- Stage the exact source-verified Product 1 identity and size-wise prices.
-- This migration does not infer owned stock from Meesho availability.

update public.products
set slug='ajrakh-black-cotton-straight-kurti',
    name='Ajrakh Black Cotton Straight Kurti',
    description='A black cotton straight kurti with red Ajrakh-inspired motifs, a medallion yoke and decorative tassels for office and everyday wear.',
    category_id=(select id from public.categories where slug='kurtis'),
    status='active',
    source_cost=269,
    material='Cotton',
    occasion='Daily wear / office',
    featured=true,
    best_seller=true,
    updated_at=now()
where external_id='MSH-ETH-001';

update public.product_variants set active=false,updated_at=now()
where product_id=(select id from public.products where external_id='MSH-ETH-001');

create temporary table verified_product_1_variants(
  size text primary key,
  source_cost integer not null
) on commit drop;

insert into verified_product_1_variants values
('S',269),('M',278),('L',287),('XL',302),('XXL',302),('XXXL',302),('4XL',302),('5XL',302),('6XL',302);

insert into public.product_variants(product_id,sku,size,colour,price_override,active)
select p.id,'MSH-ETH-001-'||v.size,v.size,'Black with red ethnic motifs',v.source_cost+200,true
from verified_product_1_variants v
join public.products p on p.external_id='MSH-ETH-001'
on conflict(sku) do update set
  size=excluded.size,colour=excluded.colour,price_override=excluded.price_override,active=true,updated_at=now();

insert into public.inventory(variant_id,stock_on_hand,low_stock_threshold)
select v.id,0,3 from public.product_variants v
join public.products p on p.id=v.product_id
where p.external_id='MSH-ETH-001'
on conflict(variant_id) do nothing;

