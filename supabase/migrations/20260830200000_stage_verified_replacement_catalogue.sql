-- Stage source-verified Products 16-20 without inventing unit inventory.
-- Products remain draft until an operational availability policy is approved.
-- Product 15 remains draft and is never reintroduced by this migration.

insert into public.categories(slug,name,sort_order)
values ('dresses','Dresses',3),('kurta-sets','Kurta Sets',2),('gowns','Gowns',4)
on conflict(slug) do update set name=excluded.name,active=true,updated_at=now();

create temporary table verified_replacements(
  external_id text primary key,
  slug text not null,
  name text not null,
  category_slug text not null,
  source_cost integer not null,
  description text not null,
  material text not null,
  colour text not null,
  occasion text not null
) on commit drop;

insert into verified_replacements values
('MSH-EXP-016','multicolour-sleeveless-rayon-maxi-dress','Multicolour Sleeveless Rayon Maxi Dress','dresses',480,'A vivid sleeveless rayon maxi with a black-base multicolour floral print, fitted waist and flowing ankle-length silhouette.','Rayon','Multicolour floral on black base','Casual / party'),
('MSH-EXP-017','maroon-printed-flared-gown-with-dupatta','Maroon Printed Flared Gown with Dupatta','gowns',368,'A full-length maroon printed flared gown with a coordinated dupatta for festive gatherings and celebrations.','Poly Georgette','Maroon','Festive'),
('MSH-EXP-018','pista-printed-cotton-blend-co-ord-set','Pista Printed Cotton-Blend Co-ord Set','kurta-sets',351,'A pista-green floral cotton-blend co-ord with a collared straight kurta and matching wide-leg palazzos for easy everyday wear.','Cotton Blend','Pista Green / Multicolour','Casual'),
('MSH-EXP-019','red-sleeveless-rayon-kurta-palazzo-set','Red Sleeveless Rayon Kurta-Palazzo Set','kurta-sets',450,'A bright red sleeveless viscose-rayon kurta with beige-gold circular motifs and matching plain palazzos for easy everyday wear.','Viscose Rayon','Red','Daily'),
('MSH-EXP-020','white-georgette-anarkali-with-dupatta','White Georgette Anarkali with Dupatta','gowns',482,'A flowing white georgette Anarkali with black ethnic motifs, coordinated border details and a matching dupatta for festive occasions.','Georgette','White with black ethnic motifs','Festive');

insert into public.products(external_id,slug,name,description,category_id,status,source_cost,material,occasion,new_arrival)
select r.external_id,r.slug,r.name,r.description,c.id,'draft',r.source_cost,r.material,r.occasion,true
from verified_replacements r join public.categories c on c.slug=r.category_slug
on conflict(external_id) do update set
  slug=excluded.slug,name=excluded.name,description=excluded.description,category_id=excluded.category_id,
  status='draft',source_cost=excluded.source_cost,material=excluded.material,occasion=excluded.occasion,
  new_arrival=true,updated_at=now();

create temporary table verified_replacement_variants(
  external_id text not null,
  size text not null,
  source_cost integer not null,
  primary key(external_id,size)
) on commit drop;

insert into verified_replacement_variants values
('MSH-EXP-016','XS',480),('MSH-EXP-016','S',490),('MSH-EXP-016','M',490),('MSH-EXP-016','L',490),('MSH-EXP-016','XL',490),('MSH-EXP-016','XXL',490),('MSH-EXP-016','XXXL',490),
('MSH-EXP-017','S',388),('MSH-EXP-017','M',368),('MSH-EXP-017','L',388),('MSH-EXP-017','XL',388),('MSH-EXP-017','XXL',388),
('MSH-EXP-018','S',351),('MSH-EXP-018','M',351),('MSH-EXP-018','L',351),('MSH-EXP-018','XL',351),('MSH-EXP-018','XXL',351),
('MSH-EXP-019','S',450),('MSH-EXP-019','M',450),('MSH-EXP-019','L',450),('MSH-EXP-019','XL',450),('MSH-EXP-019','XXL',450),
('MSH-EXP-020','S',482),('MSH-EXP-020','M',482),('MSH-EXP-020','L',482),('MSH-EXP-020','XL',482),('MSH-EXP-020','XXL',482),('MSH-EXP-020','XXXL',482);

update public.product_variants v set active=false,updated_at=now()
where v.product_id in (select p.id from public.products p join verified_replacements r on r.external_id=p.external_id);

insert into public.product_variants(product_id,sku,size,colour,price_override,active)
select p.id,v.external_id||'-'||v.size,v.size,r.colour,v.source_cost+200,true
from verified_replacement_variants v
join verified_replacements r on r.external_id=v.external_id
join public.products p on p.external_id=v.external_id
on conflict(sku) do update set
  size=excluded.size,colour=excluded.colour,price_override=excluded.price_override,active=true,updated_at=now();

insert into public.inventory(variant_id,stock_on_hand,low_stock_threshold)
select v.id,0,3 from public.product_variants v
join public.products p on p.id=v.product_id
join verified_replacements r on r.external_id=p.external_id
on conflict(variant_id) do nothing;

delete from public.product_images i
using public.products p,verified_replacements r
where i.product_id=p.id and p.external_id=r.external_id;

insert into public.product_images(product_id,image_url,alt_text,position,is_primary)
select p.id,
  '/images/'||p.external_id||'/0'||asset.position||'-'||asset.filename||'.png',
  p.name||case asset.position when 1 then ' catalogue view' else ' view '||asset.position end,
  asset.position-1,
  asset.position=1
from public.products p
join verified_replacements r on r.external_id=p.external_id
cross join (values
  (1,'catalogue-hero'),(2,'front-model'),(3,'occasion-lifestyle'),
  (4,'three-quarter-view'),(5,'fabric-detail'),(6,'product-info-card')
) asset(position,filename);

update public.products
set slug='maroon-rayon-co-ord-set',
    name='Maroon Rayon Co-ord Set',
    description='A maroon rayon kurta and wide-leg pant co-ord set. Source details and price require verification before publication.',
    category_id=(select id from public.categories where slug='kurta-sets'),
    status='draft',
    material='Rayon',
    occasion='Everyday wear',
    new_arrival=false,
    updated_at=now()
where external_id='MSH-EXP-015';
update public.product_variants set active=false,updated_at=now()
where product_id=(select id from public.products where external_id='MSH-EXP-015');
delete from public.product_images
where product_id=(select id from public.products where external_id='MSH-EXP-015');

comment on table public.inventory is
  'Exact owned inventory only. Do not convert source-page availability into an invented stock quantity.';
