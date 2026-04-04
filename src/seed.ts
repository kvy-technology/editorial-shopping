/**
 * Habitat — seed script
 * Run with: npm run seed
 */
import { getPayload } from 'payload'
import config from './payload.config'

// ─── helpers ────────────────────────────────────────────────────────────────

async function fetchImage(url: string): Promise<{ data: Buffer; size: number }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const ab = await res.arrayBuffer()
  const data = Buffer.from(ab)
  return { data, size: data.length }
}

async function uploadMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  { url, alt, filename }: { url: string; alt: string; filename: string },
) {
  console.log(`  ↑ uploading ${filename}…`)
  const { data, size } = await fetchImage(url)
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/jpeg', name: filename, size },
  })
  return doc
}

// ─── main ────────────────────────────────────────────────────────────────────

async function seed() {
  const payload = await getPayload({ config })
  console.log('🌱  Seeding Habitat…\n')

  // ── wipe existing data (safe for dev) ─────────────────────────────────────
  console.log('🗑  Clearing existing data…')
  for (const col of ['articles', 'products', 'authors', 'categories', 'media', 'users'] as const) {
    const existing = await payload.find({ collection: col, limit: 200, depth: 0 })
    for (const doc of existing.docs) {
      await payload.delete({ collection: col, id: doc.id })
    }
  }

  // ── media ─────────────────────────────────────────────────────────────────
  console.log('\n📸  Uploading images…')

  const IMAGES = {
    heroRoom: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
    livingRoom2: 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=1600&q=80',
    bedroom: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1600&q=80',
    diningRoom: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&q=80',
    homeOffice: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=80',
    sofa: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    coffeeTable: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    floorLamp: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    rug: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800&q=80',
    armchair: 'https://images.unsplash.com/photo-1567538096621-38d2284b23ff?w=800&q=80',
    bookshelf: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
    duvet: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    pendant: 'https://images.unsplash.com/photo-1513506003901-1e6a35082a0c?w=800&q=80',
    deskChair: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&q=80',
    diningTable: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
    sideboard: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    avatarSofia: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    avatarMarcus: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    roomDetail1: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
    roomDetail2: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
  }

  const media: Record<string, { id: string | number; url?: string | null }> = {}
  for (const [key, url] of Object.entries(IMAGES)) {
    try {
      media[key] = await uploadMedia(payload, {
        url,
        alt: key.replace(/([A-Z])/g, ' $1').toLowerCase().trim(),
        filename: `${key}.jpg`,
      })
    } catch (err) {
      console.warn(`  ⚠ skipped ${key}: ${(err as Error).message}`)
    }
  }

  // ── categories ───────────────────────────────────────────────────────────
  console.log('\n🏷  Creating categories…')
  const cats = await Promise.all([
    payload.create({ collection: 'categories', data: { name: 'Living room', slug: 'living-room', color: 'terracotta' } }),
    payload.create({ collection: 'categories', data: { name: 'Bedroom', slug: 'bedroom', color: 'sage' } }),
    payload.create({ collection: 'categories', data: { name: 'Dining', slug: 'dining', color: 'blue' } }),
    payload.create({ collection: 'categories', data: { name: 'Home office', slug: 'home-office', color: 'sand' } }),
  ])
  const [catLiving, catBedroom, catDining, catOffice] = cats
  console.log(`  ✓ ${cats.length} categories`)

  // ── authors ───────────────────────────────────────────────────────────────
  console.log('\n✍️  Creating authors…')
  const authorSofia = await payload.create({
    collection: 'authors',
    data: {
      name: 'Sofia Nilsson',
      title: 'Interior editor',
      avatar: media.avatarSofia?.id,
      bio: 'Sofia has spent 12 years styling homes across Scandinavia. She believes great design is about comfort first, beauty second.',
    },
  })
  const authorMarcus = await payload.create({
    collection: 'authors',
    data: {
      name: 'Marcus Andersen',
      title: 'Furniture specialist',
      avatar: media.avatarMarcus?.id,
      bio: 'Marcus trained as a cabinetmaker before moving into editorial. He writes about the craft behind great furniture.',
    },
  })
  console.log('  ✓ 2 authors')

  // ── products ──────────────────────────────────────────────────────────────
  console.log('\n🛋  Creating products…')
  const products = await Promise.all([
    payload.create({
      collection: 'products',
      data: {
        name: 'Florence Sofa',
        slug: 'florence-sofa',
        image: media.sofa?.id,
        price: 2490,
        category: catLiving.id,
        description: 'Low-profile Scandinavian sofa in natural bouclé. Solid oak legs, feather-down cushions. The anchor piece for any living room.',
        material: 'Natural bouclé, solid oak',
        dimensions: '240 × 90 × 75 cm',
        weight: '48 kg',
        colors: [
          { label: 'Oat', hex: '#C8B99A' },
          { label: 'Chalk', hex: '#E8E0D4' },
          { label: 'Slate', hex: '#7A8B8C' },
        ],
        inStock: true,
      },
    }),
    payload.create({
      collection: 'products',
      data: {
        name: 'Walnut Coffee Table',
        slug: 'walnut-coffee-table',
        image: media.coffeeTable?.id,
        price: 890,
        category: catLiving.id,
        description: 'Solid walnut slab table with hairpin legs. Each piece has unique grain — no two are exactly alike.',
        material: 'Solid walnut, powder-coated steel',
        dimensions: '120 × 60 × 40 cm',
        weight: '18 kg',
        colors: [
          { label: 'Natural', hex: '#8B6914' },
          { label: 'Dark', hex: '#4A3728' },
        ],
        inStock: true,
      },
    }),
    payload.create({
      collection: 'products',
      data: {
        name: 'Arc Floor Lamp',
        slug: 'arc-floor-lamp',
        image: media.floorLamp?.id,
        price: 420,
        category: catLiving.id,
        description: 'Architectural arc lamp in brushed brass. Adjustable arm, linen shade. Adds warm, directional light to reading nooks.',
        material: 'Brushed brass, natural linen',
        dimensions: 'H 180 cm, arm reach 90 cm',
        weight: '6 kg',
        colors: [
          { label: 'Brass', hex: '#B8860B' },
          { label: 'Black', hex: '#1A1A1A' },
        ],
        inStock: true,
      },
    }),
    payload.create({
      collection: 'products',
      data: {
        name: 'Jute Area Rug',
        slug: 'jute-area-rug',
        image: media.rug?.id,
        price: 340,
        category: catLiving.id,
        description: 'Hand-woven jute rug with natural texture. Pairs beautifully with both light and dark floors.',
        material: '100% natural jute',
        dimensions: '200 × 290 cm',
        weight: '4 kg',
        colors: [
          { label: 'Natural', hex: '#B89F78' },
        ],
        inStock: true,
      },
    }),
    payload.create({
      collection: 'products',
      data: {
        name: 'Linen Armchair',
        slug: 'linen-armchair',
        image: media.armchair?.id,
        price: 1290,
        category: catLiving.id,
        description: 'Oversized armchair with loose linen slipcover. Deep seat, soft arms — perfect for long evenings with a book.',
        material: 'Belgian linen, beech wood',
        dimensions: '85 × 95 × 80 cm',
        weight: '22 kg',
        colors: [
          { label: 'Sand', hex: '#C8B49A' },
          { label: 'Sage', hex: '#7A9A7A' },
          { label: 'Stone', hex: '#9A9490' },
        ],
        inStock: true,
      },
    }),
    payload.create({
      collection: 'products',
      data: {
        name: 'Open Oak Bookshelf',
        slug: 'open-oak-bookshelf',
        image: media.bookshelf?.id,
        price: 750,
        category: catOffice.id,
        description: 'Minimal open shelving in white-oiled oak. Five shelves — show off your books, objects, and plants.',
        material: 'White-oiled solid oak',
        dimensions: '80 × 30 × 190 cm',
        weight: '32 kg',
        colors: [
          { label: 'White oak', hex: '#E8DCC8' },
          { label: 'Black', hex: '#1A1A18' },
        ],
        inStock: true,
      },
    }),
    payload.create({
      collection: 'products',
      data: {
        name: 'Linen Duvet Cover',
        slug: 'linen-duvet-cover',
        image: media.duvet?.id,
        price: 290,
        category: catBedroom.id,
        description: 'Pre-washed European linen. Softens with every wash, lasts a lifetime. The only duvet cover you\'ll ever need.',
        material: '100% European flax linen',
        dimensions: '200 × 200 cm (double)',
        weight: '0.8 kg',
        colors: [
          { label: 'Oat', hex: '#C8B49A' },
          { label: 'Fog', hex: '#B0B4B8' },
          { label: 'Ochre', hex: '#C8922A' },
          { label: 'White', hex: '#F0EDE8' },
        ],
        inStock: true,
      },
    }),
    payload.create({
      collection: 'products',
      data: {
        name: 'Wicker Pendant Light',
        slug: 'wicker-pendant-light',
        image: media.pendant?.id,
        price: 380,
        category: catDining.id,
        description: 'Hand-woven wicker pendant. Creates beautiful dappled light over dining tables. Cord adjustable from 60–150 cm.',
        material: 'Hand-woven natural wicker',
        dimensions: 'Ø 55 cm, cord 150 cm',
        weight: '1.2 kg',
        colors: [
          { label: 'Natural', hex: '#C8A870' },
        ],
        inStock: true,
      },
    }),
    payload.create({
      collection: 'products',
      data: {
        name: 'Oval Dining Table',
        slug: 'oval-dining-table',
        image: media.diningTable?.id,
        price: 1890,
        category: catDining.id,
        description: 'Oval pedestal dining table in smoked oak. Seats 6–8 comfortably. The softer shape keeps large rooms feeling warm.',
        material: 'Smoked solid oak',
        dimensions: '200 × 100 × 75 cm',
        weight: '55 kg',
        colors: [
          { label: 'Smoked oak', hex: '#5C4A32' },
          { label: 'Light oak', hex: '#B8945A' },
        ],
        inStock: true,
      },
    }),
    payload.create({
      collection: 'products',
      data: {
        name: 'Ergonomic Desk Chair',
        slug: 'ergonomic-desk-chair',
        image: media.deskChair?.id,
        price: 680,
        category: catOffice.id,
        description: 'Fully adjustable office chair with mesh back. Lumbar support, adjustable arms. Looks good, feels better.',
        material: 'Mesh back, foam seat, aluminium base',
        dimensions: '65 × 65 × 90–100 cm',
        weight: '14 kg',
        colors: [
          { label: 'Black', hex: '#1A1A18' },
          { label: 'White', hex: '#E8E4E0' },
        ],
        inStock: true,
      },
    }),
    payload.create({
      collection: 'products',
      data: {
        name: 'Marble Side Table',
        slug: 'marble-side-table',
        image: media.sideboard?.id,
        price: 560,
        category: catLiving.id,
        description: 'Italian Carrara marble top on a powder-coated steel base. The finishing touch for any sofa corner.',
        material: 'Carrara marble, powder-coated steel',
        dimensions: 'Ø 45 × H 55 cm',
        weight: '12 kg',
        colors: [
          { label: 'White marble / Black base', hex: '#F0EDE8' },
          { label: 'White marble / Brass base', hex: '#B8860B' },
        ],
        inStock: true,
      },
    }),
  ])
  console.log(`  ✓ ${products.length} products`)

  const [sofa, coffeeTable, floorLamp, rug, armchair, bookshelf, duvet, pendant, diningTable, deskChair, marbleTable] = products

  // ── articles ──────────────────────────────────────────────────────────────
  console.log('\n📰  Creating articles…')

  const article1 = await payload.create({
    collection: 'articles',
    data: {
      title: 'The Scandinavian living room: get the look',
      slug: 'scandinavian-living-room',
      excerpt: 'Warm neutrals, natural materials, and considered negative space — we break down how to build a Scandinavian room that actually feels lived-in.',
      heroImage: media.heroRoom?.id,
      category: catLiving.id,
      author: authorSofia.id,
      readTime: '6 min',
      featured: true,
      tags: [
        { tag: 'Living room' },
        { tag: 'Scandinavian' },
        { tag: 'Get the look' },
        { tag: 'Shoppable' },
        { tag: 'Bouclé' },
        { tag: 'Walnut' },
      ],
      content: [
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'There is a quality to Scandinavian interiors that is difficult to name. It is not minimalism exactly — there are objects, warmth, and personality. It is more like a kind of confident restraint. Everything chosen, nothing accidental.', version: 1 }],
                  version: 1,
                },
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'The rooms we love most from this tradition share a few qualities: natural materials in their most honest form, a palette drawn from the landscape outside the window, and always — always — enough empty space to breathe.', version: 1 }],
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          blockType: 'sectionHeading',
          number: '01',
          heading: 'The anchor piece',
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'Every great living room starts with the sofa. In a Scandinavian scheme, you want something low-slung — close to the floor, generous in depth. Bouclé has become the defining texture of the moment, and for good reason: it reads as both textural and neutral, grounding without overwhelming.', version: 1 }],
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          blockType: 'productCard',
          product: sofa.id,
          editorsNote: 'The Florence has been in our studio for three years. The bouclé has worn beautifully — it\'s one of those pieces that just gets better.',
          displayStyle: 'full',
        },
        {
          blockType: 'stylingTip',
          icon: '💡',
          label: 'The 60-30-10 rule',
          content: 'Apply your dominant colour (neutral base) to 60% of the room, a secondary colour (wood, stone) to 30%, and an accent (terracotta, sage, brass) to just 10%. This keeps the space cohesive without feeling flat.',
        },
        {
          blockType: 'sectionHeading',
          number: '02',
          heading: 'Natural materials',
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'Walnut, jute, linen, brass — these are the materials of a Scandinavian room. Each one ages visibly, honestly. A walnut table picks up marks over time; linen softens with every wash. This is not a style that hides its life.', version: 1 }],
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          blockType: 'materialCallout',
          icon: '🪵',
          name: 'Solid walnut',
          description: 'Walnut is warm where oak is cool. The deep, chocolate-brown grain anchors lighter elements — rugs, linen, plaster walls — without going dark. It is also one of the most workable hardwoods, which is why the best makers keep coming back to it.',
        },
        {
          blockType: 'productCard',
          product: coffeeTable.id,
          displayStyle: 'full',
        },
        {
          blockType: 'pullQuote',
          quote: 'The best Scandinavian rooms look like they happened slowly, over years. That is the goal — not a room that was designed, but one that was lived.',
          attribution: 'Sofia Nilsson, Interior editor',
        },
        {
          blockType: 'sectionHeading',
          number: '03',
          heading: 'Light and the room',
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'Scandinavian designers have long understood that light is the most important material in a room. In the long winter months, a single arc lamp positioned above a reading chair can make the difference between a room that feels cosy and one that feels dark.', version: 1 }],
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          blockType: 'imagePair',
          imageOne: media.roomDetail1?.id,
          imageTwo: media.roomDetail2?.id,
          caption: 'Warm, directional light from a single arc lamp versus diffuse ceiling light — the same room, completely different feeling.',
        },
        {
          blockType: 'shoppableScene',
          image: media.heroRoom?.id,
          caption: 'Tap the + markers to shop each item — 4 products tagged in this scene',
          hotspots: [
            { product: sofa.id, x: 35, y: 60 },
            { product: coffeeTable.id, x: 52, y: 72 },
            { product: floorLamp.id, x: 72, y: 38 },
            { product: rug.id, x: 48, y: 82 },
          ],
        },
        {
          blockType: 'budgetBreakdown',
          title: 'Room breakdown',
          items: [
            { product: sofa.id, color: '#C4673A' },
            { product: coffeeTable.id, color: '#8B6914' },
            { product: floorLamp.id, color: '#B8860B' },
            { product: rug.id, color: '#5B7A5E' },
            { product: armchair.id, color: '#3B6FA0' },
          ],
        },
      ],
    },
  })

  const article2 = await payload.create({
    collection: 'articles',
    data: {
      title: 'A minimal home office that actually works',
      slug: 'minimal-home-office',
      excerpt: 'The best home offices disappear when you\'re not using them. Here\'s how to build a workspace that is calm, functional, and beautiful.',
      heroImage: media.homeOffice?.id,
      category: catOffice.id,
      author: authorMarcus.id,
      readTime: '5 min',
      featured: true,
      tags: [
        { tag: 'Home office' },
        { tag: 'Minimal' },
        { tag: 'Workspace' },
        { tag: 'Productivity' },
      ],
      content: [
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'The home office has a design problem. Most are either aggressively corporate — black mesh chairs, monitor arms, cable management panels — or so aesthetically considered that they stop feeling like somewhere you could actually work. The ideal sits between: functional without being clinical, beautiful without being precious.', version: 1 }],
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          blockType: 'sectionHeading',
          number: '01',
          heading: 'The desk as anchor',
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'Invest in the desk surface. Everything else in the room responds to it. A solid wood desk — oak, walnut, ash — will outlast any fashion cycle and only improve with age. Size matters more than most people admit: you need at least 140 cm of width to work comfortably with a laptop and a notebook open simultaneously.', version: 1 }],
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          blockType: 'productCard',
          product: bookshelf.id,
          editorsNote: 'We use this shelf in our own studio. It forces you to edit your objects — there is nowhere to hide the things you don\'t love.',
          displayStyle: 'full',
        },
        {
          blockType: 'sectionHeading',
          number: '02',
          heading: 'The chair question',
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'This is where people make the mistake of prioritising aesthetics over ergonomics. An uncomfortable chair will cost you in productivity and in physical wellbeing. The good news: ergonomic chairs have improved dramatically in design terms. You no longer have to choose between looking good and feeling good.', version: 1 }],
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          blockType: 'productCard',
          product: deskChair.id,
          displayStyle: 'full',
        },
        {
          blockType: 'pullQuote',
          quote: 'A home office should feel like a place you choose to go — not a place you are obligated to be.',
          attribution: 'Marcus Andersen, Furniture specialist',
        },
        {
          blockType: 'stylingTip',
          icon: '🌿',
          label: 'Add one living thing',
          content: 'A single plant — not a collection — grounds a workspace and reduces the visual hardness of screens and cables. A fiddle leaf, a monstera, or a simple pothos on the shelf. One is enough.',
        },
      ],
    },
  })

  const article3 = await payload.create({
    collection: 'articles',
    data: {
      title: 'The bedroom as sanctuary',
      slug: 'bedroom-sanctuary',
      excerpt: 'Good sleep starts with good design. How to layer textures, manage light, and choose the pieces that make a bedroom feel like a retreat.',
      heroImage: media.bedroom?.id,
      category: catBedroom.id,
      author: authorSofia.id,
      readTime: '4 min',
      featured: true,
      tags: [
        { tag: 'Bedroom' },
        { tag: 'Sleep' },
        { tag: 'Linen' },
        { tag: 'Sanctuary' },
      ],
      content: [
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'The bedroom is the one room where restraint matters most. Strip away everything that does not serve rest, and you are left with the essentials: good light control, natural textiles, and a bed that you look forward to getting into.', version: 1 }],
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          blockType: 'productCard',
          product: duvet.id,
          editorsNote: 'Pre-washed linen is the answer to every bedroom textile question. Cool in summer, warm in winter, impossibly soft after six months of washing.',
          displayStyle: 'full',
        },
        {
          blockType: 'stylingTip',
          icon: '🌙',
          label: 'Layer your textiles',
          content: 'Start with a fitted sheet, add a flat sheet, then a duvet, then a lightweight throw at the foot. Each layer serves a purpose: the throw is for the hour before sleep when you\'re reading, the flat sheet for warm nights. Layering is not just aesthetic — it\'s functional.',
        },
      ],
    },
  })

  const article4 = await payload.create({
    collection: 'articles',
    data: {
      title: 'Setting the perfect dining table',
      slug: 'perfect-dining-table',
      excerpt: 'The dining table is the most social piece of furniture in your home. How to choose the right shape, material, and lighting to make every meal feel like an occasion.',
      heroImage: media.diningRoom?.id,
      category: catDining.id,
      author: authorMarcus.id,
      readTime: '5 min',
      featured: false,
      tags: [
        { tag: 'Dining' },
        { tag: 'Entertaining' },
        { tag: 'Oak' },
        { tag: 'Pendant' },
      ],
      content: [
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: 'Round and oval tables are having a moment — and for good reason. Without corners, conversation flows more easily. Everyone can see everyone else. The table stops being a barrier and becomes a gathering point.', version: 1 }],
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          blockType: 'productCard',
          product: diningTable.id,
          displayStyle: 'full',
        },
        {
          blockType: 'productCard',
          product: pendant.id,
          editorsNote: 'Hang the pendant 70–80 cm above the table surface. Lower than you think. It should feel intimate, not distant.',
          displayStyle: 'compact',
        },
      ],
    },
  })

  console.log('  ✓ 4 articles')

  // ── homepage global ───────────────────────────────────────────────────────
  console.log('\n🏠  Updating Homepage global…')
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      hero: {
        heading: 'Shop the room.\nLove the story.',
        subheading: 'Discover beautifully styled rooms, then shop every piece that makes them extraordinary.',
        backgroundImage: media.heroRoom?.id,
        ctaText: 'Explore rooms',
        ctaArticle: article1.id,
      },
      featuredArticles: [article1.id, article2.id, article3.id, article4.id],
      shoppableScene: {
        image: media.heroRoom?.id,
        caption: 'Tap the + markers to shop each item',
        hotspots: [
          { product: sofa.id, x: 35, y: 58 },
          { product: coffeeTable.id, x: 52, y: 72 },
          { product: floorLamp.id, x: 72, y: 38 },
          { product: rug.id, x: 48, y: 82 },
        ],
      },
      trendingProducts: [sofa.id, coffeeTable.id, armchair.id, floorLamp.id, rug.id, duvet.id, pendant.id, diningTable.id, bookshelf.id, deskChair.id],
    },
  })
  console.log('  ✓ homepage updated')

  // ── admin user ────────────────────────────────────────────────────────────
  console.log('\n👤  Creating admin user…')
  await payload.create({
    collection: 'users',
    data: {
      name: 'Admin',
      email: 'admin@habitat.local',
      password: 'habitat2024',
    },
  })
  console.log('  ✓ admin@habitat.local / habitat2024')

  console.log('\n✅  Seed complete!\n')
  console.log('  → Frontend:  http://localhost:3000')
  console.log('  → Admin:     http://localhost:3000/admin')
  console.log('  → Login:     admin@habitat.local / habitat2024\n')

  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
