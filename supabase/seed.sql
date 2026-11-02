insert into properties (name, type, description, nightly_rate, status)
values
  ('Laguna Suite', 'suite', 'Private terrace, panoramic sea views, and a soaking tub designed for sunset rituals.', 420.00, 'available'),
  ('Palm Courtyard Villa', 'villa', 'A spacious hideaway with a private plunge pool and indoor-outdoor lounge space.', 680.00, 'available'),
  ('Coral Horizon Room', 'room', 'Minimalist comfort paired with uninterrupted beach views and a sunrise coffee ritual.', 310.00, 'available')
on conflict do nothing;

insert into site_content (section_name, content)
values
  ('hero', '{"headline": "Escape to your own private horizon.", "tagline": "A coastal sanctuary crafted for slow mornings and unforgettable evenings."}'),
  ('company', '{"name": "Azure Cove Resort"}')
on conflict (section_name) do nothing;
