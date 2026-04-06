import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

// ── Lexical rich text helpers ────────────────────────────────────────────────

function rt(text: string) {
  return {
    root: {
      type: 'root',
      children: [{ type: 'paragraph', children: [{ type: 'text', text, version: 1 }], version: 1 }],
      direction: 'ltr', format: '', indent: 0, version: 1,
    },
  }
}

function rtMulti(...paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        children: [{ type: 'text', text, version: 1 }],
        version: 1,
      })),
      direction: 'ltr', format: '', indent: 0, version: 1,
    },
  }
}

// ── Hero images (curated room/interior photography from Unsplash) ────────────

const HERO_IMAGES: Record<string, { url: string; alt: string }> = {
  livingRoom: {
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80',
    alt: 'Bright Scandinavian living room with neutral sofa and wooden accents',
  },
  homeOffice: {
    url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1600&q=80',
    alt: 'Minimal home office with wooden desk and natural light',
  },
  bedroom: {
    url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1600&q=80',
    alt: 'Serene bedroom with linen bedding and soft lighting',
  },
  dining: {
    url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&q=80',
    alt: 'Dining room with oval wooden table and pendant light',
  },
  apartment: {
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&q=80',
    alt: 'Compact apartment with clever storage and bright interior',
  },
  lighting: {
    url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1600&q=80',
    alt: 'Interior with layered lighting — pendant, floor lamp, and candles',
  },
  readingCorner: {
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
    alt: 'Cosy reading corner with armchair and floor lamp',
  },
  plants: {
    url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=1600&q=80',
    alt: 'Bright room filled with indoor plants and natural light',
  },
}

// ── Route ────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const payload = await getPayload({ config })

    // ── Wipe articles, authors & article hero media ─────────────────────
    console.log('Wiping articles & authors...')
    await payload.updateGlobal({
      slug: 'homepage',
      data: { featuredArticles: [] },
    }).catch(() => {})

    for (const col of ['articles', 'authors'] as const) {
      let hasMore = true
      while (hasMore) {
        const existing = await payload.find({ collection: col, limit: 100, depth: 0 })
        if (existing.docs.length === 0) { hasMore = false; break }
        for (const doc of existing.docs) {
          await payload.delete({ collection: col, id: doc.id }).catch(() => {})
        }
      }
    }

    // ── Upload hero images ──────────────────────────────────────────────
    console.log('Uploading hero images...')
    const heroMedia: Record<string, any> = {}
    for (const [key, img] of Object.entries(HERO_IMAGES)) {
      try {
        const res = await fetch(img.url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const ab = await res.arrayBuffer()
        const data = Buffer.from(ab)
        heroMedia[key] = await payload.create({
          collection: 'media',
          data: { alt: img.alt },
          file: { data, mimetype: 'image/jpeg', name: `hero-${key}.jpg`, size: data.length },
        })
        console.log(`  Hero image: ${key}`)
      } catch (err) {
        console.warn(`  Skipped hero image: ${key}`)
      }
    }

    // ── Create authors ──────────────────────────────────────────────────
    console.log('Creating authors...')
    const authorSofia = await payload.create({
      collection: 'authors',
      data: { name: 'Sofia Nilsson', title: 'Interior Editor', bio: 'Sofia has spent fifteen years writing about Scandinavian design. She believes the best rooms tell a story about the people who live in them.' },
    })
    const authorMarcus = await payload.create({
      collection: 'authors',
      data: { name: 'Marcus Andersen', title: 'Furniture Specialist', bio: 'Marcus trained as a cabinetmaker before moving into design journalism. He can tell you the species of wood in any table from across the room.' },
    })
    const authorElena = await payload.create({
      collection: 'authors',
      data: { name: 'Elena Park', title: 'Home Stylist', bio: 'Elena styles rooms for editorial shoots and real clients. Her philosophy: buy less, choose well, make it last.' },
    })

    // ── Load existing products & categories ─────────────────────────────
    const { docs: allProducts } = await payload.find({ collection: 'products', limit: 300, depth: 1 })
    const { docs: allCategories } = await payload.find({ collection: 'categories', limit: 50, depth: 0 })

    const catMap: Record<string, any> = {}
    for (const c of allCategories) catMap[(c as any).name] = c

    const byCat: Record<string, any[]> = {}
    for (const p of allProducts) {
      const catId = typeof (p as any).category === 'object' ? (p as any).category?.id : (p as any).category
      const cat = allCategories.find((c) => c.id === catId) as any
      const name = cat?.name || 'unknown'
      if (!byCat[name]) byCat[name] = []
      byCat[name].push(p)
    }

    const pick = (cat: string, n: number) => (byCat[cat] || []).sort(() => Math.random() - 0.5).slice(0, n)

    const sofas = pick('Sofas & sectionals', 6)
    const armchairs = pick('Armchairs & accent chairs', 4)
    const tables = pick('Coffee & side tables', 5)
    const lighting = pick('Lighting', 6)
    const rugs = pick('Rugs', 3)
    const desks = pick('Desks', 3)
    const bookcases = pick('Bookcases & shelving', 3)
    const diningChairs = pick('Dining chairs', 4)
    const beds = pick('Beds', 5)
    const diningTables = pick('Dining tables', 4)
    const plants = pick('Plants', 4)
    const decor = pick('Home decor & accessories', 6)
    const clocks = pick('Clock', 2)

    // ── Article definitions ─────────────────────────────────────────────
    console.log('Creating articles...')

    const articleDefs = [
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 1. SCANDINAVIAN LIVING ROOM
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      {
        title: 'The Scandinavian Living Room: Warm Minimalism Done Right',
        slug: 'scandinavian-living-room',
        excerpt: 'Warm neutrals, natural materials, and considered negative space — we break down how to recreate the effortless Scandinavian look that actually feels lived-in, not staged.',
        heroImage: heroMedia.livingRoom?.id,
        category: catMap['Sofas & sectionals']?.id,
        author: authorSofia.id,
        readTime: '8 min',
        featured: true,
        tags: [{ tag: 'Living room' }, { tag: 'Scandinavian' }, { tag: 'Get the look' }, { tag: 'Shoppable' }],
        content: [
          { blockType: 'richText', content: rtMulti(
            'There is a quality to Scandinavian interiors that is difficult to name. It is not minimalism exactly — there are objects, warmth, and personality everywhere you look. It is more like a kind of confident restraint. Everything chosen, nothing accidental. The room breathes, but it does not feel empty.',
            'This particular tension — between fullness and space, warmth and simplicity — is what makes the Scandinavian approach so enduring. It has outlasted every trend cycle of the last half-century because it is not really a trend at all. It is a way of thinking about how spaces serve the people who live in them.',
          )},
          { blockType: 'sectionHeading', number: '01', heading: 'Start with the sofa' },
          { blockType: 'richText', content: rtMulti(
            'Every great living room begins with the sofa. Not the coffee table, not the rug, not the art on the wall — the sofa. It is the piece around which everything else orbits, and getting it right sets the tone for the entire room.',
            'In a Scandinavian scheme, you want something low-slung and generous. Close to the floor, deep enough to curl up in, wide enough to stretch out across. The silhouette should be clean but not rigid — think soft cushions within a structured frame. The tension between the two is what makes it interesting.',
            'Fabric matters enormously here. Bouclé has become the defining texture of the moment, and for good reason: it reads as both textural and neutral, grounding the room without overwhelming it. But linen and cotton blends work beautifully too — anything that ages gracefully and invites touch.',
          )},
          ...(sofas[0] ? [{ blockType: 'productCard' as const, product: sofas[0].id, editorsNote: 'This is the kind of sofa that anchors a room for a decade. The proportions are generous without being overwhelming, and the fabric softens beautifully over time.', displayStyle: 'full' as const }] : []),
          { blockType: 'stylingTip', icon: '💡', label: 'The 60-30-10 rule', content: 'Apply your dominant colour to 60% of the room (walls, large furniture), a secondary colour to 30% (upholstery, curtains), and an accent to just 10% (cushions, objects). This keeps the space cohesive without feeling flat or monotonous.' },
          { blockType: 'sectionHeading', number: '02', heading: 'The material palette' },
          { blockType: 'richText', content: rtMulti(
            'Wood, jute, linen, brass, ceramic — these are the materials of a Scandinavian room. What they share is honesty. Each one ages visibly, developing character rather than deteriorating. A walnut table picks up marks over time that tell the story of meals shared and books read. Linen softens with every wash until it feels like something that has always been part of your life.',
            'The key is mixing textures within a restrained colour palette. When your colours are quiet — oat, chalk, sage, stone — the textures do the talking. A nubby wool throw against a smooth leather cushion. A rough jute rug beneath a polished wooden table. These contrasts create richness without visual noise.',
          )},
          { blockType: 'materialCallout', icon: '🪵', name: 'Why Scandinavians love wood', description: 'In countries with long, dark winters, wood brings a psychological warmth that no synthetic material can replicate. Oak, birch, pine, and walnut each have distinct personalities — from the pale, clean grain of ash to the deep chocolate tones of walnut. The best Scandinavian furniture lets the wood speak for itself, with minimal finishing that reveals rather than conceals the grain.' },
          ...(tables[0] ? [{ blockType: 'productCard' as const, product: tables[0].id, editorsNote: 'A good coffee table is the social centre of the living room. Look for something with enough surface area to be useful, but not so large that it dominates the floor plan.', displayStyle: 'full' as const }] : []),
          ...(tables[1] ? [{ blockType: 'productCard' as const, product: tables[1].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'pullQuote', quote: 'The best Scandinavian rooms look like they happened slowly, over years. That is the goal — not a room that was designed in a weekend, but one that was lived into existence.', attribution: 'Sofia Nilsson, Interior editor' },
          { blockType: 'sectionHeading', number: '03', heading: 'Light as a material' },
          { blockType: 'richText', content: rtMulti(
            'Scandinavian designers have long understood something that the rest of the world is only beginning to grasp: light is the most important material in any room. More than the furniture, more than the paint colour, more than the objects on the shelves — it is light that determines how a space feels.',
            'In the Nordic countries, where winter daylight is precious and fleeting, the relationship with light is almost reverential. Rooms are designed to capture and amplify every available ray. Curtains are light and sheer. Mirrors are placed strategically. And artificial lighting is layered with the same care that a chef layers flavours.',
            'The single most impactful change you can make to a living room is to replace one overhead light with three or four different sources at different heights. A floor lamp beside the sofa. A table lamp on the sideboard. A pendant over the reading chair. Suddenly the room has depth, warmth, and atmosphere.',
          )},
          ...(lighting[0] ? [{ blockType: 'productCard' as const, product: lighting[0].id, displayStyle: 'full' as const }] : []),
          ...(lighting[1] ? [{ blockType: 'productCard' as const, product: lighting[1].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'sectionHeading', number: '04', heading: 'The ground layer' },
          { blockType: 'richText', content: rt('A rug does more than add warmth underfoot — it defines the living area within a larger space, anchors the furniture grouping, and adds a layer of texture that softens hard floors. In a Scandinavian room, choose natural fibres: wool, jute, or cotton. The rug should be large enough that at least the front legs of the sofa sit on it. Bigger than you think is almost always right.') },
          ...(rugs[0] ? [{ blockType: 'productCard' as const, product: rugs[0].id, editorsNote: 'Go bigger than you think — the rug should extend well under the sofa and reach past the coffee table on all sides.', displayStyle: 'full' as const }] : []),
          ...(armchairs[0] ? [{ blockType: 'productCard' as const, product: armchairs[0].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'budgetBreakdown', title: 'Living room cost breakdown', items: [
            ...(sofas[0] ? [{ product: sofas[0].id, color: '#C4673A' }] : []),
            ...(tables[0] ? [{ product: tables[0].id, color: '#8B6914' }] : []),
            ...(lighting[0] ? [{ product: lighting[0].id, color: '#B8860B' }] : []),
            ...(rugs[0] ? [{ product: rugs[0].id, color: '#5B7A5E' }] : []),
            ...(armchairs[0] ? [{ product: armchairs[0].id, color: '#3B6FA0' }] : []),
          ]},
        ],
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 2. HOME OFFICE
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      {
        title: 'The Home Office That Disappears: Designing a Workspace You Actually Want to Use',
        slug: 'home-office-design',
        excerpt: 'Most home offices are either aggressively corporate or so precious they feel unusable. Here is how to find the middle ground — calm, functional, and genuinely beautiful.',
        heroImage: heroMedia.homeOffice?.id,
        category: catMap['Desks']?.id,
        author: authorMarcus.id,
        readTime: '7 min',
        featured: true,
        tags: [{ tag: 'Home office' }, { tag: 'Productivity' }, { tag: 'Workspace' }, { tag: 'Desk setup' }],
        content: [
          { blockType: 'richText', content: rtMulti(
            'The home office occupies an awkward position in our homes and our lives. It needs to be functional enough for eight hours of focused work, but it also needs to coexist peacefully with the rest of a home that is supposed to be a place of rest. Get the balance wrong in either direction and something suffers — either your productivity or your peace of mind.',
            'The best home offices solve this tension not by compromise, but by clarity. Every element has a purpose. The desk is generous enough to work at but beautiful enough to live with. The chair supports your back for hours without looking like it belongs in a conference room. Storage exists, but it is edited and intentional.',
          )},
          { blockType: 'sectionHeading', number: '01', heading: 'The desk: your most important decision' },
          { blockType: 'richText', content: rtMulti(
            'The desk is the anchor of the room, and it deserves your biggest investment — both financial and in terms of the time you spend choosing it. Everything else in the office responds to this one piece.',
            'Think about depth as much as width. Most people buy desks that are too shallow. You need at least 60cm of depth to push a monitor back far enough to be comfortable. And if you work with papers, sketches, or physical materials alongside your screen, aim for 75cm or more.',
            'Material matters. A solid wood surface will outlast any fashion cycle and develop a patina that synthetic materials never achieve. It also feels different under your hands — warmer, more grounding, more human.',
          )},
          ...(desks[0] ? [{ blockType: 'productCard' as const, product: desks[0].id, editorsNote: 'Depth is the most underrated desk dimension. This one gives you room to spread out without feeling like you are working at a dining table.', displayStyle: 'full' as const }] : []),
          ...(desks[1] ? [{ blockType: 'productCard' as const, product: desks[1].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'sectionHeading', number: '02', heading: 'Storage that forces discipline' },
          { blockType: 'richText', content: rtMulti(
            'The temptation in a home office is to add more storage. Another drawer unit. Another shelf. Another filing cabinet. But excess storage is just permission to accumulate things you do not need.',
            'Open shelving is the antidote. Everything on display has to earn its place. A bookcase with five or six shelves is not just storage — it is a curation exercise. Books you actually reference. Objects that inspire you. One plant. Nothing else.',
          )},
          ...(bookcases[0] ? [{ blockType: 'productCard' as const, product: bookcases[0].id, editorsNote: 'We use open shelving in our own studio. It forces you to edit ruthlessly — every object on display should be something you genuinely love or use.', displayStyle: 'full' as const }] : []),
          { blockType: 'stylingTip', icon: '📐', label: 'The one-arm-reach rule', content: 'Everything you use daily should be within one arm\'s reach of your seated position. Everything else can live further away. This simple test usually eliminates half the objects on your desk.' },
          { blockType: 'sectionHeading', number: '03', heading: 'The details that matter' },
          { blockType: 'richText', content: rt('A clock on the wall (not on your screen) helps you maintain a physical relationship with time. A single plant introduces a living element that counterbalances the digital world. And good lighting — always good lighting — makes the difference between a space that energises and one that drains.') },
          ...(clocks[0] ? [{ blockType: 'productCard' as const, product: clocks[0].id, displayStyle: 'compact' as const }] : []),
          ...(plants[0] ? [{ blockType: 'productCard' as const, product: plants[0].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'pullQuote', quote: 'A home office should feel like a place you choose to go — not a place you are obligated to be. That distinction is entirely a matter of design.', attribution: 'Marcus Andersen, Furniture specialist' },
        ],
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 3. BEDROOM
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      {
        title: 'The Bedroom as Sanctuary: A Case for Radical Simplicity',
        slug: 'bedroom-sanctuary',
        excerpt: 'Good sleep starts with good design. We make the case for stripping the bedroom back to its essentials — and show you exactly which essentials to keep.',
        heroImage: heroMedia.bedroom?.id,
        category: catMap['Beds']?.id,
        author: authorElena.id,
        readTime: '7 min',
        featured: true,
        tags: [{ tag: 'Bedroom' }, { tag: 'Sleep' }, { tag: 'Textiles' }, { tag: 'Wellness' }],
        content: [
          { blockType: 'richText', content: rtMulti(
            'We spend a third of our lives in the bedroom, yet it is often the last room we invest in. The living room gets the statement sofa. The kitchen gets the renovation. The bedroom gets whatever is left over — a mattress on a frame, some mismatched bedside tables, a pile of clothes on the chair we swore we would sit in.',
            'This is backwards. If any room deserves our full attention, it is the one where we rest, recover, and begin each day. A well-designed bedroom is not a luxury — it is one of the most practical investments you can make in your own wellbeing.',
          )},
          { blockType: 'sectionHeading', number: '01', heading: 'The bed frame sets the tone' },
          { blockType: 'richText', content: rtMulti(
            'Before you think about textiles or lighting or colour, choose the bed frame. It is the largest object in the room and it will define the character of everything around it.',
            'An upholstered frame brings softness and warmth. A wooden frame brings structure and honesty. A metal frame brings lightness and a hint of industrial edge. There is no wrong answer — only the answer that matches the atmosphere you want to create.',
            'Pay attention to height. A lower bed makes the ceiling feel higher and the room feel more spacious. A taller bed creates a sense of grandeur and makes getting in and out easier. Both have their place.',
          )},
          ...(beds[0] ? [{ blockType: 'productCard' as const, product: beds[0].id, editorsNote: 'The proportions here are what make it special — substantial enough to feel anchoring, but not so imposing that it overwhelms a normal-sized bedroom.', displayStyle: 'full' as const }] : []),
          ...(beds[1] ? [{ blockType: 'productCard' as const, product: beds[1].id, displayStyle: 'full' as const }] : []),
          { blockType: 'sectionHeading', number: '02', heading: 'The textile equation' },
          { blockType: 'richText', content: rtMulti(
            'Bedding is where the bedroom either succeeds or fails. You can have the most beautiful frame in the world, but if the sheets are scratchy and the duvet is lumpy, none of it matters.',
            'The formula is simpler than the bedding industry wants you to believe. Start with the best sheets you can afford — linen if you like texture, cotton sateen if you like smoothness. Add a duvet that suits your climate. Then layer: a flat sheet, the duvet, and a lighter throw folded at the foot for temperature regulation. That is it. Four layers, and you have solved the bed.',
          )},
          { blockType: 'stylingTip', icon: '🌙', label: 'The pillow edit', content: 'Two sleeping pillows each, plus one or two decorative shams. That is the maximum. Anything more than six pillows on a bed is a storage problem masquerading as a design choice.' },
          { blockType: 'sectionHeading', number: '03', heading: 'Light control' },
          { blockType: 'richText', content: rt('The bedroom has two lighting modes: evening wind-down and morning wake-up. Both require warm, dimmable sources positioned low — bedside table lamps or wall-mounted reading lights. Overhead lighting in a bedroom should be a last resort, not a default. If you must have a ceiling fixture, put it on a dimmer and use it sparingly.') },
          ...(lighting[2] ? [{ blockType: 'productCard' as const, product: lighting[2].id, displayStyle: 'compact' as const }] : []),
          ...(decor[0] ? [{ blockType: 'productCard' as const, product: decor[0].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'pullQuote', quote: 'The bedroom should be the quietest room in your home — in every sense. Quiet colours. Quiet textures. Quiet objects. Let the noise of the day stop at the threshold.', attribution: 'Elena Park, Home stylist' },
        ],
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 4. DINING TABLE
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      {
        title: 'The Dining Table: Where Design Meets Daily Life',
        slug: 'dining-table-guide',
        excerpt: 'The dining table is the most social piece of furniture in your home. We explore shape, material, lighting, and the art of the well-set table.',
        heroImage: heroMedia.dining?.id,
        category: catMap['Dining tables']?.id,
        author: authorMarcus.id,
        readTime: '6 min',
        featured: true,
        tags: [{ tag: 'Dining' }, { tag: 'Entertaining' }, { tag: 'Wood' }, { tag: 'Family' }],
        content: [
          { blockType: 'richText', content: rtMulti(
            'Round and oval tables are having a moment — and for good reason. Without corners, conversation flows more easily. Everyone can see everyone else. There is a democracy to a round table that rectangles simply cannot achieve. And in smaller rooms, the absence of corners means easier movement around the table.',
            'But rectangular tables have their own strengths: they seat more people in less floor space, they work better against walls, and they create a natural visual axis in a room. The choice between round and rectangular is less about which is better and more about how you eat, entertain, and use the space.',
          )},
          ...(diningTables[0] ? [{ blockType: 'productCard' as const, product: diningTables[0].id, editorsNote: 'The shape and material of this table would work in almost any dining room. It is the kind of piece that disappears into the background of daily life — which is exactly what a dining table should do.', displayStyle: 'full' as const }] : []),
          { blockType: 'sectionHeading', number: '01', heading: 'The chair question' },
          { blockType: 'richText', content: rtMulti(
            'Matching chairs is the safe choice, but mixing two complementary styles creates a room with more personality. The trick is to keep one element consistent — either the colour, the material, or the height — while varying the form.',
            'Comfort is non-negotiable. A beautiful dining chair that becomes uncomfortable after twenty minutes will change the way you use the table. You will eat faster, linger less, and eventually stop hosting. Choose chairs you can sit in through a long Sunday lunch.',
          )},
          ...(diningChairs[0] ? [{ blockType: 'productCard' as const, product: diningChairs[0].id, displayStyle: 'full' as const }] : []),
          ...(diningChairs[1] ? [{ blockType: 'productCard' as const, product: diningChairs[1].id, displayStyle: 'compact' as const }] : []),
          ...(diningChairs[2] ? [{ blockType: 'productCard' as const, product: diningChairs[2].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'sectionHeading', number: '02', heading: 'The pendant makes the room' },
          { blockType: 'richText', content: rt('The pendant light over the dining table is the single most impactful lighting decision in any dining room. It creates a pool of warmth that draws people in and defines the table as the heart of the space. Hang it 70–80cm above the table surface — lower than your instinct tells you. The intimacy it creates is worth the slight visual obstruction.') },
          ...(lighting[3] ? [{ blockType: 'productCard' as const, product: lighting[3].id, editorsNote: 'The rule is 70–80cm above the table surface. Lower than you think. The pool of light it creates is what makes dinner feel special.', displayStyle: 'compact' as const }] : []),
          { blockType: 'budgetBreakdown', title: 'Dining room budget', items: [
            ...(diningTables[0] ? [{ product: diningTables[0].id, color: '#5C4A32' }] : []),
            ...(diningChairs[0] ? [{ product: diningChairs[0].id, color: '#C4673A' }] : []),
            ...(lighting[3] ? [{ product: lighting[3].id, color: '#B8860B' }] : []),
          ]},
        ],
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 5. SMALL SPACE
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      {
        title: 'Small Space, Big Life: The Complete Apartment Guide',
        slug: 'small-space-apartment',
        excerpt: 'Limited square footage is not a limitation — it is an invitation to be more intentional. Our definitive guide to apartment living.',
        heroImage: heroMedia.apartment?.id,
        category: catMap['Bookcases & shelving']?.id,
        author: authorElena.id,
        readTime: '8 min',
        featured: false,
        tags: [{ tag: 'Small spaces' }, { tag: 'Apartment' }, { tag: 'Storage' }, { tag: 'Multi-functional' }],
        content: [
          { blockType: 'richText', content: rtMulti(
            'The apartments where I have been happiest were never the biggest. They were the ones that felt most considered — where every piece of furniture justified its footprint and every corner had a purpose. Small-space living is not about sacrifice. It is about clarity.',
            'The constraints of a compact apartment produce some of the most creative, personal interiors I have ever seen. When you cannot hide behind square footage, you have to get specific about what matters to you. And that specificity is what makes a home feel like yours.',
          )},
          { blockType: 'sectionHeading', number: '01', heading: 'Think vertically' },
          { blockType: 'richText', content: rt('When floor space is limited, walls become your primary storage surface. Tall bookshelves, wall-mounted shelves, hooks, and floating desks free up the floor while adding visual interest to otherwise blank walls. The eye travels upward, and the room feels taller.') },
          ...(bookcases[1] ? [{ blockType: 'productCard' as const, product: bookcases[1].id, displayStyle: 'full' as const }] : []),
          { blockType: 'stylingTip', icon: '📐', label: 'The 50% floor rule', content: 'In a small space, aim to keep at least 50% of your floor visible at all times. This creates the perception of more space. Rugs, visible furniture legs, and clear pathways all contribute to this openness.' },
          { blockType: 'sectionHeading', number: '02', heading: 'Dual-purpose everything' },
          { blockType: 'richText', content: rt('A coffee table with storage underneath. A desk that folds away. A sofa that converts for guests. In a small apartment, every piece of furniture should serve at least two purposes. This is not about compromise — many dual-purpose pieces are more thoughtfully designed than their single-purpose equivalents.') },
          ...(sofas[2] ? [{ blockType: 'productCard' as const, product: sofas[2].id, displayStyle: 'full' as const }] : []),
          ...(tables[2] ? [{ blockType: 'productCard' as const, product: tables[2].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'sectionHeading', number: '03', heading: 'Light opens everything' },
          { blockType: 'richText', content: rt('In a small apartment, light is your most powerful tool. Sheer curtains instead of heavy drapes. Mirrors placed to reflect windows. Light-coloured walls that bounce daylight deeper into the room. Every decision that increases the amount of light in the space will make it feel larger.') },
          ...(lighting[4] ? [{ blockType: 'productCard' as const, product: lighting[4].id, displayStyle: 'compact' as const }] : []),
          ...(decor[1] ? [{ blockType: 'productCard' as const, product: decor[1].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'pullQuote', quote: 'Small spaces are not problems to solve. They are invitations to be more intentional about what you keep, what you display, and what you let go.', attribution: 'Elena Park, Home stylist' },
        ],
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 6. LIGHTING GUIDE
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      {
        title: 'Lighting That Changes Everything: A Room-by-Room Guide',
        slug: 'lighting-guide',
        excerpt: 'The right light transforms a room more dramatically than any piece of furniture. Our complete guide to the art of layered lighting.',
        heroImage: heroMedia.lighting?.id,
        category: catMap['Lighting']?.id,
        author: authorSofia.id,
        readTime: '9 min',
        featured: false,
        tags: [{ tag: 'Lighting' }, { tag: 'Design guide' }, { tag: 'Ambience' }, { tag: 'Interiors' }],
        content: [
          { blockType: 'richText', content: rtMulti(
            'I once visited two identical apartments in the same building — same layout, same square footage, same windows. One felt cold and institutional. The other felt like a Parisian salon. The only difference was the lighting.',
            'This is not an exaggeration. Lighting is the single most transformative element in interior design, and it is also the most neglected. We obsess over sofa fabrics and paint swatches, then plug in whatever floor lamp is on sale and wonder why the room does not feel right.',
            'The solution is not more light. It is better light. And better light always means layered light.',
          )},
          { blockType: 'sectionHeading', number: '01', heading: 'The three layers' },
          { blockType: 'richText', content: rtMulti(
            'Ambient lighting is your base layer — the overall illumination that lets you move through the room safely. Task lighting is focused illumination for specific activities: reading, cooking, working. Accent lighting is the drama — it highlights objects, creates shadows, and adds depth.',
            'A well-lit room has all three, and the key is that each layer can be controlled independently. You want the ambient light for a dinner party but not the task light. You want the task light for reading but dimmer ambient light. This independent control is what separates a considered lighting scheme from a room with lamps.',
          )},
          ...(lighting[0] ? [{ blockType: 'productCard' as const, product: lighting[0].id, editorsNote: 'A great ambient source that provides soft, diffused light without harsh shadows. Position it in the corner of the room for maximum effect.', displayStyle: 'full' as const }] : []),
          ...(lighting[1] ? [{ blockType: 'productCard' as const, product: lighting[1].id, displayStyle: 'full' as const }] : []),
          { blockType: 'materialCallout', icon: '💡', name: 'Understanding colour temperature', description: 'Colour temperature is measured in Kelvin (K). Below 3000K is warm — think candlelight, golden hour, living rooms and bedrooms. 3000–4000K is neutral — good for kitchens and bathrooms. Above 4000K is cool — clinical, energising, best reserved for garages and hospitals. Most homes benefit from 2700–3000K throughout.' },
          { blockType: 'sectionHeading', number: '02', heading: 'Room by room' },
          { blockType: 'richText', content: rtMulti(
            'Living room: three to five sources at different heights. At least one floor lamp, one table lamp, and one overhead or wall-mounted fixture. All on dimmers.',
            'Bedroom: two bedside sources (lamps or wall-mounted readers) and nothing else. The bedroom should never be brightly lit.',
            'Kitchen: strong task lighting over work surfaces, softer ambient lighting elsewhere. Under-cabinet LED strips are one of the best investments in any kitchen.',
            'Dining room: a single pendant hung low over the table, with candles on the table itself. The rest of the room can stay relatively dark — the pool of light over the table creates all the intimacy you need.',
          )},
          ...(lighting[2] ? [{ blockType: 'productCard' as const, product: lighting[2].id, displayStyle: 'compact' as const }] : []),
          ...(lighting[3] ? [{ blockType: 'productCard' as const, product: lighting[3].id, displayStyle: 'full' as const }] : []),
          ...(lighting[4] ? [{ blockType: 'productCard' as const, product: lighting[4].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'pullQuote', quote: 'Never light a room from a single source. Three is the minimum. Five is where it starts to get interesting. And every single one should be on a dimmer.', attribution: 'Sofia Nilsson, Interior editor' },
        ],
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 7. READING CORNER
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      {
        title: 'The Art of the Reading Corner',
        slug: 'reading-corner',
        excerpt: 'Every home deserves a quiet corner dedicated to the simple pleasure of reading. Here is how to create one — even in the smallest apartment.',
        heroImage: heroMedia.readingCorner?.id,
        category: catMap['Armchairs & accent chairs']?.id,
        author: authorMarcus.id,
        readTime: '5 min',
        featured: false,
        tags: [{ tag: 'Reading nook' }, { tag: 'Armchairs' }, { tag: 'Cosy' }, { tag: 'Slow living' }],
        content: [
          { blockType: 'richText', content: rtMulti(
            'A reading corner needs three things: a comfortable chair, good light, and a surface for your coffee. That is the complete list. Everything beyond these three elements — the bookshelf, the throw blanket, the plant on the windowsill — is lovely enhancement, but it is not essential.',
            'What is essential is intention. A reading corner only works if it feels like a place specifically designed for reading, not a chair that happens to be near a lamp. The difference is subtle but profound: one invites you to sit down and stay; the other is just furniture.',
          )},
          { blockType: 'sectionHeading', number: '01', heading: 'The chair' },
          { blockType: 'richText', content: rt('The perfect reading chair has a high back that supports your head, arms wide enough to rest a book on, and a seat deep enough to sit cross-legged in. It should feel like a gentle embrace — supportive but not restrictive. Avoid anything too upright (you will not last an hour) or too reclined (you will fall asleep by page three).') },
          ...(armchairs[0] ? [{ blockType: 'productCard' as const, product: armchairs[0].id, editorsNote: 'The seat depth here is what makes it special — deep enough to curl up in, structured enough to stay comfortable for hours.', displayStyle: 'full' as const }] : []),
          ...(armchairs[1] ? [{ blockType: 'productCard' as const, product: armchairs[1].id, displayStyle: 'full' as const }] : []),
          { blockType: 'stylingTip', icon: '📖', label: 'Position for natural light', content: 'Place the chair near a window so natural light falls over your shoulder during the day. Add a floor lamp on the same side for evenings — the light should come from behind and above, illuminating the page without creating glare or casting your shadow onto it.' },
          { blockType: 'sectionHeading', number: '02', heading: 'The supporting cast' },
          { blockType: 'richText', content: rt('A small side table within arm\'s reach for your drink and your phone (face down). A floor lamp with a warm, focused beam. And if space allows, a low bookshelf or stack of books nearby — not for storage, but as a visual reminder of why this corner exists.') },
          ...(tables[3] ? [{ blockType: 'productCard' as const, product: tables[3].id, displayStyle: 'compact' as const }] : []),
          ...(lighting[5] ? [{ blockType: 'productCard' as const, product: lighting[5].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'pullQuote', quote: 'A reading corner is not an indulgence. It is a daily invitation to slow down, to pay attention, and to give your mind something richer than a screen.', attribution: 'Marcus Andersen, Furniture specialist' },
        ],
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 8. INDOOR PLANTS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      {
        title: 'Bringing Nature Inside: The Complete Guide to Indoor Plants',
        slug: 'indoor-plants-guide',
        excerpt: 'Plants transform a room like nothing else — adding colour, texture, movement, and life. Our guide for beginners and seasoned plant parents alike.',
        heroImage: heroMedia.plants?.id,
        category: catMap['Plants']?.id,
        author: authorElena.id,
        readTime: '6 min',
        featured: false,
        tags: [{ tag: 'Plants' }, { tag: 'Indoor garden' }, { tag: 'Biophilic design' }, { tag: 'Wellness' }],
        content: [
          { blockType: 'richText', content: rtMulti(
            'There is no faster way to make a room feel alive than adding a plant. Not a fake plant, not a botanical print, not a green accent wall — an actual living plant that grows and changes and occasionally drops a leaf on the floor. Plants bring something into a room that no manufactured object can replicate: the quiet, grounding presence of something alive.',
            'Beyond the aesthetic, the evidence for indoor plants is compelling. They improve air quality, reduce stress, boost concentration, and dampen sound. A room with plants genuinely feels different to be in — calmer, fresher, more connected to the natural world outside the window.',
          )},
          { blockType: 'sectionHeading', number: '01', heading: 'Start with the unkillable' },
          { blockType: 'richText', content: rtMulti(
            'If you are new to plants, begin with species that thrive on neglect. Snake plants tolerate everything — low light, irregular watering, dry air, and the complete absence of attention. Pothos grows in water or soil, in bright light or shade, and will forgive weeks of forgotten watering. ZZ plants are so tough they are sometimes mistaken for artificial.',
            'Start with one of these. Keep it alive for three months. Then — and only then — graduate to something that requires a misting schedule.',
          )},
          ...(plants[0] ? [{ blockType: 'productCard' as const, product: plants[0].id, editorsNote: 'The perfect starter plant — nearly impossible to kill, and it looks beautiful doing absolutely nothing.', displayStyle: 'full' as const }] : []),
          ...(plants[1] ? [{ blockType: 'productCard' as const, product: plants[1].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'sectionHeading', number: '02', heading: 'Placement principles' },
          { blockType: 'richText', content: rtMulti(
            'Group plants in odd numbers — threes and fives look natural, while pairs and fours can feel symmetrical and staged. Vary the heights within each grouping: a tall floor plant, a medium plant on a stand, and a small trailing plant on a shelf.',
            'Place the biggest plant in the room first, then work down in size. One large statement plant has more visual impact than ten small pots scattered across every surface. Go bold, then edit.',
          )},
          ...(plants[2] ? [{ blockType: 'productCard' as const, product: plants[2].id, displayStyle: 'compact' as const }] : []),
          ...(plants[3] ? [{ blockType: 'productCard' as const, product: plants[3].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'stylingTip', icon: '🪴', label: 'Match the pot to the room', content: 'The pot is as important as the plant. A beautiful plant in a cheap plastic pot undermines the whole effect. Terracotta works everywhere. Ceramic adds colour. Woven baskets add texture. Choose pots that complement your existing materials palette.' },
          ...(decor[2] ? [{ blockType: 'productCard' as const, product: decor[2].id, displayStyle: 'compact' as const }] : []),
          { blockType: 'pullQuote', quote: 'One large plant has more impact than ten small ones scattered around a room. Go bold with your first choice, then build around it. And always, always use a proper pot.', attribution: 'Elena Park, Home stylist' },
        ],
      },
    ]

    // ── Write articles to DB ────────────────────────────────────────────
    const createdArticles: any[] = []
    for (const def of articleDefs) {
      try {
        const article = await payload.create({
          collection: 'articles',
          data: {
            title: def.title,
            slug: def.slug,
            excerpt: def.excerpt,
            heroImage: def.heroImage || undefined,
            category: def.category || undefined,
            author: def.author,
            readTime: def.readTime,
            featured: def.featured,
            tags: def.tags,
            content: def.content,
          },
        })
        createdArticles.push(article)
        console.log(`  Article: "${def.title}"`)
      } catch (err: any) {
        console.warn(`Failed article "${def.title}": ${err.message}`)
      }
    }

    // ── Update homepage ─────────────────────────────────────────────────
    console.log('Updating homepage with articles...')
    await payload.updateGlobal({
      slug: 'homepage',
      data: {
        hero: {
          heading: 'Shop the room.\nLove the story.',
          subheading: 'Discover beautifully styled rooms, then shop every piece that makes them extraordinary.',
          ctaText: 'Explore rooms',
          backgroundImage: heroMedia.livingRoom?.id || undefined,
          ctaArticle: createdArticles[0]?.id || undefined,
        },
        featuredArticles: createdArticles.slice(0, 6).map((a) => a.id),
      },
    }).catch(() => {})

    return NextResponse.json({
      ok: true,
      seeded: {
        authors: 3,
        articles: createdArticles.length,
        heroImages: Object.keys(heroMedia).length,
        titles: createdArticles.map((a) => a.title),
      },
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
