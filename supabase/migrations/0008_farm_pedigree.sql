-- Farms no longer need a pedigree to be listed; the ones that have one carry a badge
-- (the "pedigree" attribute). Every farm listed so far passed the old pedigree rule,
-- so they all get the badge. Safe to run more than once.
update public.places
set attributes = array_append(attributes, 'pedigree')
where category = 'farm'
  and not ('pedigree' = any (attributes));
