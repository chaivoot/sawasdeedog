-- Items regrouped into four groups: food (ของกิน), gear (ของใช้), toys (ของเล่น)
-- and training (อุปกรณ์ฝึก). Old groups become types inside the new ones.
-- Safe to run more than once.
update public.products set category = 'gear' where category = 'walk';
update public.products set category = 'food', subcategory = category where category in ('chews', 'treats', 'health');
update public.products set category = 'training', subcategory = 'fitness' where category = 'fitness';
