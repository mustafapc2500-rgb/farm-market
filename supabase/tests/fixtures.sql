-- LOCAL TEST FIXTURES ONLY. Never insert Auth users or fake storage rows in a real project.
insert into auth.users(id, email, raw_user_meta_data) values
 ('00000000-0000-4000-8000-000000000001','admin@example.invalid','{}'),
 ('00000000-0000-4000-8000-000000000002','ordinary@example.invalid','{"is_admin":true,"role":"admin"}');
update auth.users set email_confirmed_at = now();
insert into farm_market_private.authorized_administrators(user_id, notes)
values ('00000000-0000-4000-8000-000000000001', 'Synthetic local test administrator');
insert into public.categories(id,slug,name,is_published)
values ('10000000-0000-4000-8000-000000000001','hidden-category','Private category',false);
insert into public.products(id,slug,category_id,name,description,full_description,price_eur,is_published) values
 ('20000000-0000-4000-8000-000000000001','published-test',(select id from public.categories where slug='layout'),'Published test','Short test description','Full test description',29.90,true),
 ('20000000-0000-4000-8000-000000000002','draft-test',(select id from public.categories where slug='layout'),'Draft test','Short test description','Full test description',19.90,false),
 ('20000000-0000-4000-8000-000000000003','hidden-category-test','10000000-0000-4000-8000-000000000001','Published in hidden category','Short test description','Full test description',9.90,true);
insert into storage.objects(bucket_id,name) values
 ('product-images','20000000-0000-4000-8000-000000000001/30000000-0000-4000-8000-000000000001.webp'),
 ('product-images','20000000-0000-4000-8000-000000000002/30000000-0000-4000-8000-000000000002.webp'),
 ('product-images','20000000-0000-4000-8000-000000000003/30000000-0000-4000-8000-000000000003.webp'),
 ('product-images','20000000-0000-4000-8000-000000000001/30000000-0000-4000-8000-000000000004.webp');
insert into public.product_images(product_id,storage_path,alt_text,is_primary) values
 ('20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001/30000000-0000-4000-8000-000000000001.webp','Published image',true),
 ('20000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002/30000000-0000-4000-8000-000000000002.webp','Draft image',true),
 ('20000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003/30000000-0000-4000-8000-000000000003.webp','Hidden category image',true);
