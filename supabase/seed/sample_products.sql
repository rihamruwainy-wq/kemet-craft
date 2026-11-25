-- Sample catalog for KemetCraft (test data), owned by the seller account
insert into public.products (seller_id, title, description, price, stock, era_tag)
select u.id, p.title, p.description, p.price, p.stock, p.era_tag
from public.users u
cross join (values
  ('Bastet Bronze Cat Statue',
   'Hand-cast bronze figure of Bastet, the cat goddess of home and protection. Aged patina finish, 18 cm tall. A classic Pharaonic decor piece for a shelf or desk.',
   45.00, 12, 'Pharaonic'),
  ('Eye of Horus Silver Pendant',
   'Sterling silver Wedjat eye pendant on an 18-inch chain, handmade in Khan el-Khalili. The Eye of Horus is an ancient symbol of protection and good health. Gift box included.',
   38.00, 25, 'Pharaonic'),
  ('Hand-Painted Papyrus: Tree of Life',
   'Genuine papyrus sheet painted by hand with the Tree of Life and hieroglyphic border. 30 x 40 cm, ready to frame. Wall art for living room or office.',
   29.50, 30, 'Pharaonic'),
  ('Alabaster Canopic Jar',
   'Translucent Egyptian alabaster jar carved in Luxor with a jackal-headed Duamutef lid. 15 cm tall. Glows beautifully with a candle or lamp behind it.',
   62.00, 8, 'Pharaonic'),
  ('Coptic Woven Textile Panel',
   'Linen and wool tapestry inspired by 5th-century Coptic weavings, with birds and vine motifs. 40 x 40 cm, hand-loomed in Akhmim. Wall hanging or cushion cover.',
   54.00, 10, 'Coptic'),
  ('Coptic Cross Wooden Icon',
   'Hand-carved olive wood plaque with an inlaid Coptic cross and mother-of-pearl details. 20 x 15 cm. Traditional Cairo workshop craftsmanship.',
   34.00, 15, 'Coptic'),
  ('Mashrabiya Wooden Lantern',
   'Turned-wood mashrabiya lantern with a brass top, inspired by Islamic Cairo windows. Casts intricate shadow patterns. 35 cm tall, fits an LED candle.',
   72.00, 6, 'Islamic'),
  ('Khayamiya Tentmaker Wall Hanging',
   'Colorful hand-stitched applique textile from the Street of the Tentmakers in Cairo. Geometric Islamic star pattern, 50 x 50 cm. Each piece is unique.',
   85.00, 5, 'Islamic'),
  ('Brass Arabesque Serving Tray',
   'Engraved brass tray with arabesque and calligraphy-style patterns, hammered by hand. 35 cm diameter. Perfect for tea or as a decorative centerpiece.',
   48.00, 14, 'Islamic'),
  ('Nubian Handwoven Palm Basket',
   'Brightly colored basket woven from palm fronds by artisans in Aswan. Lidded, 25 cm wide. Storage for the kitchen, bathroom or living room.',
   24.00, 20, 'Nubian'),
  ('Siwa Embroidered Shawl',
   'Black cotton shawl with traditional Siwa oasis embroidery in orange, red and green, plus mother-of-pearl buttons. 180 x 60 cm. Warm, light, and handmade.',
   41.00, 0, 'Bedouin'),
  ('Scarab Beetle Carved Soapstone',
   'Palm-sized carved soapstone scarab with hieroglyphs on the base. The scarab symbolised rebirth and the rising sun. A small gift under $20.',
   16.00, 40, 'Pharaonic')
) as p(title, description, price, stock, era_tag)
where u.email = 'rihamruwainy@gmail.com'
  and not exists (select 1 from public.products x where x.title = p.title);
