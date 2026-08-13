insert into daycares (name, address) values
  ('Guardería Sala Soles', 'Av. Libertador 1234, CABA'),
  ('Guardería Pequeños Genios', 'Calle Belgrano 567, CABA'),
  ('Guardería El Jardín', 'Av. Santa Fe 890, CABA'),
  ('Guardería Sonrisas', 'Calle Corrientes 2345, CABA'),
  ('Guardería Creciendo', 'Av. Rivadavia 6789, CABA');

-- Staff user for testing (direct insert, bypasses auth trigger)
insert into users (id, daycare_id, role, status, full_name)
values (
  '00000000-0000-0000-0000-000000000001',
  (select id from daycares where name = 'Guardería Sala Soles'),
  'staff',
  'active',
  'Dario'
);
