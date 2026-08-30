insert into public.categories(slug,name,sort_order) values ('kurtis','Kurtis',1),('kurta-sets','Kurta Sets',2),('dresses','Dresses',3),('gowns','Gowns',4) on conflict(slug) do update set name=excluded.name,sort_order=excluded.sort_order;

create temporary table seed_products(external_id text,slug text,name text,category_slug text,cost integer,description text,material text,colour text,sizes text[],featured boolean,new_arrival boolean,best_seller boolean);
insert into seed_products values
('MSH-ETH-001','ajrakh-black-cotton-straight-kurti','Ajrakh Black Cotton Straight Kurti','kurtis',494,'Ajrakh-inspired motifs with a comfortable straight silhouette for workdays and everyday outings.','Cotton Cambric','Black',array['XS','S','M','L','XL','XXL','3XL','4XL','5XL','6XL'],true,false,true),
('MSH-ETH-002','teal-art-silk-embroidered-a-line-kurta','Teal Art-Silk Embroidered A-Line Kurta','kurtis',409,'A jewel-toned A-line kurta with embroidered neckline detailing for festive moments.','Art Silk','Teal',array['XXS','XS','S','M','L','XL','XXL','3XL','4XL'],false,true,false),
('MSH-SET-003','peach-printed-kurta-palazzo-set','Peach Printed Kurta Palazzo Set','kurta-sets',475,'An easy rayon kurta-and-palazzo pairing with a soft peach print.','Rayon','Peach',array['XXS','XS','S','M','L','XL','XXL','3XL','4XL','5XL'],false,true,false),
('MSH-SET-004','purple-aliya-cut-three-piece-set','Purple Aliya-Cut Three-Piece Set','kurta-sets',616,'A flowing three-piece ensemble with coordinated pants and dupatta.','Rayon','Purple',array['XS','S','M','L','XL','XXL','3XL','4XL','5XL'],true,false,false),
('MSH-GWN-005','purple-sequin-embroidered-anarkali','Purple Sequin-Embroidered Anarkali','gowns',632,'A generous ankle-length Anarkali with delicate sequin accents.','Cotton Blend','Purple',array['S','M','L','XL','XXL','3XL','4XL','5XL'],false,false,true),
('MSH-GWN-006','ivory-floral-rayon-flared-gown','Ivory Floral Rayon Flared Gown','gowns',490,'A light floral gown with a sweeping ankle-length flare.','Rayon','Ivory',array['S','M','L','XL','XXL','3XL','4XL','5XL'],false,true,false),
('MSH-WES-007','pink-tiered-georgette-maxi-dress','Pink Tiered Georgette Maxi Dress','dresses',667,'A vibrant floral maxi with puff sleeves and a tiered skirt.','Georgette','Pink',array['XS','S','M','L','XL','XXL'],true,false,true),
('MSH-WES-008','black-floral-fit-and-flare-maxi-dress','Black Floral Fit-and-Flare Maxi Dress','dresses',479,'A fitted bodice and flowing floral skirt for casual plans and parties.','Cotton Blend','Black',array['S','M','L','XL','XXL'],false,false,true),
('MSH-WES-009','white-floral-puff-sleeve-mini-dress','White Floral Puff-Sleeve Mini Dress','dresses',558,'A playful floral mini with puff sleeves and a softly flared shape.','Rayon','White',array['S','M','L','XL'],false,true,false),
('MSH-WES-010','lemon-yellow-bodycon-midi-dress','Lemon Yellow Bodycon Midi Dress','dresses',637,'A clean bodycon midi with a square neckline and front slit.','Lycra','Lemon Yellow',array['XS','S','M','L','XL'],false,false,false),
('MSH-EXP-011','sky-blue-cotton-kurta-pant-set','Sky Blue Cotton Kurta & Pant Set','kurta-sets',485,'A breathable sky-blue cotton kurta and pant pairing for everyday office, college and casual wear.','Cotton','Sky Blue',array['M','L','XL','XXL','3XL'],false,true,false),
('MSH-EXP-012','maroon-printed-flared-gown-dupatta','Maroon Printed Flared Gown with Dupatta','gowns',588,'A graceful printed flared gown with a coordinated dupatta for festive gatherings and special occasions.','Poly Georgette','Maroon',array['S','M','L','XL'],false,true,false),
('MSH-EXP-013','checked-a-line-maxi-dress','Checked A-Line Maxi Dress','dresses',526,'A relaxed checked A-line maxi with a collared waist detail for easy everyday styling.','Printed Fabric','Green/Navy Check',array['S','M','L','XL','XXL'],false,true,false),
('MSH-EXP-014','black-anarkali-gown-dupatta','Black Anarkali Gown with Dupatta','gowns',679,'An elegant black Anarkali gown with a matching dupatta and subtle festive detailing.','Faux Georgette','Black',array['S','M','L','XL'],false,true,false),
('MSH-EXP-015','maroon-floral-anarkali-gown-set','Maroon Floral Anarkali Gown Set','gowns',588,'A flowing maroon floral Anarkali-style gown with coordinated dupatta for festive occasions.','Printed Fabric','Maroon',array['S','M','L','XL'],false,true,false);

insert into public.products(external_id,slug,name,category_id,status,source_cost,description,material,featured,new_arrival,best_seller)
select s.external_id,s.slug,s.name,c.id,'active',s.cost,s.description,s.material,s.featured,s.new_arrival,s.best_seller from seed_products s join public.categories c on c.slug=s.category_slug
on conflict(external_id) do update set slug=excluded.slug,name=excluded.name,category_id=excluded.category_id,status='active',source_cost=excluded.source_cost,description=excluded.description,material=excluded.material,featured=excluded.featured,new_arrival=excluded.new_arrival,best_seller=excluded.best_seller,updated_at=now();
update public.products set occasion=case external_id when 'MSH-ETH-001' then 'Daily wear' when 'MSH-ETH-002' then 'Festive wear' when 'MSH-SET-003' then 'Casual outing' when 'MSH-SET-004' then 'Wedding guest' when 'MSH-GWN-005' then 'Evening party' when 'MSH-GWN-006' then 'Brunch' when 'MSH-WES-007' then 'Brunch date' when 'MSH-WES-008' then 'Evening' when 'MSH-WES-009' then 'Casual party' when 'MSH-WES-010' then 'Date night' when 'MSH-EXP-011' then 'Office edit' when 'MSH-EXP-012' then 'Festive look' when 'MSH-EXP-013' then 'Everyday style' when 'MSH-EXP-014' then 'Evening edit' when 'MSH-EXP-015' then 'Occasion wear' else occasion end where external_id like 'MSH-%';

insert into public.product_variants(product_id,sku,size,colour)
select p.id,p.external_id||'-'||size,size,s.colour from seed_products s join public.products p on p.external_id=s.external_id cross join unnest(s.sizes) size
on conflict(sku) do update set active=true,size=excluded.size,colour=excluded.colour,updated_at=now();
insert into public.product_images(product_id,image_url,alt_text,position,is_primary)
select p.id,'/images/'||p.external_id||'/0'||asset.position||'-'||asset.name||'.png',p.name||case asset.position when 1 then ' catalogue view' else ' view '||asset.position end,asset.position-1,asset.position=1
from public.products p cross join (values(1,'catalogue-hero'),(2,'front-model'),(3,'occasion-lifestyle'),(4,'three-quarter-view'),(5,'fabric-detail'),(6,'product-info-card')) asset(position,name) where p.external_id not like 'MSH-EXP-%'
on conflict(product_id,position) do update set image_url=excluded.image_url,alt_text=excluded.alt_text,is_primary=excluded.is_primary;
insert into public.product_images(product_id,image_url,alt_text,position,is_primary) select p.id,'/images/'||p.external_id||'/01-catalogue-board.png',p.name||' catalogue board',0,true from public.products p where p.external_id like 'MSH-EXP-%' on conflict(product_id,position) do update set image_url=excluded.image_url,alt_text=excluded.alt_text,is_primary=true;
insert into public.inventory(variant_id,stock_on_hand,low_stock_threshold) select id,20,3 from public.product_variants on conflict(variant_id) do nothing;
insert into public.inventory_movements(variant_id,movement_type,quantity,note)
select v.id,'opening',i.stock_on_hand,'Deterministic development seed'
from public.product_variants v
join public.inventory i on i.variant_id=v.id
where i.stock_on_hand <> 0
  and not exists(select 1 from public.inventory_movements m where m.variant_id=v.id and m.movement_type='opening');
drop table seed_products;
