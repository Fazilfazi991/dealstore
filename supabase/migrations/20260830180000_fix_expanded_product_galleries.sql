-- Replace the public collage boards for products 11-15 with six separate image records.
delete from public.product_images
where product_id in (
  select id from public.products where external_id between 'MSH-EXP-011' and 'MSH-EXP-015'
);

insert into public.product_images(product_id,image_url,alt_text,position,is_primary)
select
  p.id,
  '/images/'||p.external_id||'/0'||asset.position||'-'||asset.name||'.png',
  p.name||case asset.position when 1 then ' catalogue view' else ' view '||asset.position end,
  asset.position-1,
  asset.position=1
from public.products p
cross join (values
  (1,'catalogue-hero'),
  (2,'front-model'),
  (3,'occasion-lifestyle'),
  (4,'three-quarter-view'),
  (5,'fabric-detail'),
  (6,'product-info-card')
) asset(position,name)
where p.external_id between 'MSH-EXP-011' and 'MSH-EXP-015';

-- Product 15's supplied imagery identifies a maroon rayon co-ord, not an
-- Anarkali. Keep it out of the public catalogue until its source record and
-- size-wise prices are verified.
update public.products
set slug='maroon-rayon-co-ord-set', name='Maroon Rayon Co-ord Set',
    status='draft', source_cost=0, material='Rayon', occasion=null,
    description='A maroon kurta with coordinated wide-leg pants. Commercial details require source verification.',
    updated_at=now()
where external_id='MSH-EXP-015';

update public.product_variants
set active=false, updated_at=now()
where product_id=(select id from public.products where external_id='MSH-EXP-015');
