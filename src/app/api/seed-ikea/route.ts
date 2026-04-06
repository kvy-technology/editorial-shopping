import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import ikeaProducts from '@/data/ikea-products.json'

// ── Category config ─────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { slug: string; color: string }> = {
  'Sofas & sectionals':        { slug: 'sofas-sectionals',   color: 'terracotta' },
  'Armchairs & accent chairs': { slug: 'armchairs',          color: 'sage' },
  'Coffee & side tables':      { slug: 'coffee-side-tables', color: 'sand' },
  'Dining tables':             { slug: 'dining-tables',      color: 'blue' },
  'Dining chairs':             { slug: 'dining-chairs',      color: 'terracotta' },
  'Desks':                     { slug: 'desks',              color: 'sand' },
  'Bookcases & shelving':      { slug: 'bookcases-shelving', color: 'sage' },
  'Beds':                      { slug: 'beds',               color: 'blue' },
  'Clock':                     { slug: 'clocks',             color: 'terracotta' },
  'Lighting':                  { slug: 'lighting',           color: 'sand' },
  'Rugs':                      { slug: 'rugs',               color: 'sage' },
  'Plants':                    { slug: 'plants',             color: 'sage' },
  'Home decor & accessories':  { slug: 'home-decor',         color: 'terracotta' },
}

const IKEA_IMG_BASE = 'https://www.ikea.com/us/en/images/products'

// ── Helpers ─────────────────────────────────────────────────────────────────────

/** Clean IKEA title: remove " - IKEA US" and variant details after comma */
function cleanTitle(raw: string): string {
  let t = raw.replace(/\s*-\s*IKEA\s*US$/i, '').trim()
  const comma = t.indexOf(',')
  if (comma > 0) t = t.substring(0, comma).trim()
  return t
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[äåà]/g, 'a').replace(/[öô]/g, 'o').replace(/[üû]/g, 'u').replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Extract a clean description from the raw text */
function cleanDescription(raw: string, title: string): string {
  const titleBase = title.split(',')[0]?.trim() || ''
  let desc = raw
  // Remove the repeated title prefix that IKEA includes
  const idx = desc.indexOf(titleBase, titleBase.length)
  if (idx > 0) desc = desc.substring(idx + titleBase.length)
  desc = desc.replace(/^[,.\s]+/, '').trim()
  if (desc.length > 0) desc = desc.charAt(0).toUpperCase() + desc.slice(1)
  return desc || raw
}

/** Extract first 2-3 materials as a string */
function extractMaterial(materials: string[]): string {
  if (!materials?.length) return ''
  return materials
    .slice(0, 3)
    .map((m) => m.replace(/^[^:]+:\s*/, '').trim())
    .filter(Boolean)
    .join(', ')
    .substring(0, 200)
}

/** Build full IKEA image URL from relative path */
function ikeaImageUrl(relativePath: string): string {
  if (relativePath.startsWith('http')) return relativePath
  const cleaned = relativePath.replace(/^images-us\//, '')
  return `${IKEA_IMG_BASE}/${cleaned}`
}

// ── Main route ──────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const products = ikeaProducts as Array<{
      product_id: string; title: string; description: string
      category_tree: string[]; image_urls: string[]; price: string
      materials: string[]; _category: string
    }>

    // ── Wipe existing data ────────────────────────────────────────────────
    console.log('Wiping existing data...')
    await payload.updateGlobal({
      slug: 'homepage',
      data: { hero: { heading: '', subheading: '' }, featuredArticles: [], shoppableScene: { hotspots: [] }, trendingProducts: [] },
    }).catch(() => {})

    for (const col of ['articles', 'products', 'authors', 'categories', 'media'] as const) {
      let hasMore = true
      while (hasMore) {
        const existing = await payload.find({ collection: col, limit: 100, depth: 0 })
        if (existing.docs.length === 0) { hasMore = false; break }
        for (const doc of existing.docs) {
          await payload.delete({ collection: col, id: doc.id }).catch(() => {})
        }
      }
    }

    // ── Create categories ─────────────────────────────────────────────────
    console.log('Creating categories...')
    const categoryMap: Record<string, any> = {}
    for (const [catName, meta] of Object.entries(CATEGORY_META)) {
      categoryMap[catName] = await payload.create({
        collection: 'categories',
        data: { name: catName, slug: meta.slug, color: meta.color },
      })
    }

    // ── Create products with images ───────────────────────────────────────
    console.log(`Creating ${products.length} products...`)
    let created = 0
    let imageErrors = 0
    const createdProducts: any[] = []

    for (const prod of products) {
      try {
        // Download and upload image
        let mediaDoc: any = null
        if (prod.image_urls?.[0]) {
          const imgUrl = ikeaImageUrl(prod.image_urls[0])
          try {
            const imgRes = await fetch(imgUrl)
            if (imgRes.ok) {
              const ab = await imgRes.arrayBuffer()
              const data = Buffer.from(ab)
              const filename = `${slugify(cleanTitle(prod.title))}-${prod.product_id}.jpg`
              mediaDoc = await payload.create({
                collection: 'media',
                data: { alt: cleanTitle(prod.title) },
                file: { data, mimetype: 'image/jpeg', name: filename, size: data.length },
              })
            } else {
              imageErrors++
            }
          } catch {
            imageErrors++
          }
        }

        const name = cleanTitle(prod.title)
        const product = await payload.create({
          collection: 'products',
          data: {
            name,
            slug: slugify(name) + '-' + prod.product_id,
            image: mediaDoc?.id || undefined,
            price: parseFloat(prod.price) || 0,
            category: categoryMap[prod._category]?.id,
            description: cleanDescription(prod.description, prod.title),
            material: extractMaterial(prod.materials) || undefined,
            inStock: true,
          },
        })

        createdProducts.push(product)
        created++

        if (created % 25 === 0) {
          console.log(`  ${created}/${products.length} products created...`)
        }

        // Small delay every 10 products to avoid overwhelming DB/Blob
        if (created % 10 === 0) {
          await new Promise((r) => setTimeout(r, 100))
        }
      } catch (err: any) {
        console.warn(`Failed: "${prod.title}": ${err.message}`)
      }
    }

    // ── Create authors ─────────────────────────────────────────────────────
    console.log('Creating authors...')
    const authorSofia = await payload.create({
      collection: 'authors',
      data: { name: 'Sofia Nilsson', title: 'Interior Editor' },
    })
    const authorMarcus = await payload.create({
      collection: 'authors',
      data: { name: 'Marcus Andersen', title: 'Furniture Specialist' },
    })
    const authorElena = await payload.create({
      collection: 'authors',
      data: { name: 'Elena Park', title: 'Home Stylist' },
    })

    // ── Helper to pick products by category ─────────────────────────────────
    const productsByCategory: Record<string, any[]> = {}
    for (const p of createdProducts) {
      const catName = products.find((ip) => ip.product_id === p.slug?.split('-').pop())
        ?._category || 'unknown'
      if (!productsByCategory[catName]) productsByCategory[catName] = []
      productsByCategory[catName].push(p)
    }

    function pickProducts(catName: string, count: number): any[] {
      const pool = productsByCategory[catName] || []
      return pool.sort(() => Math.random() - 0.5).slice(0, count)
    }

    function pickRandom(arr: any[], count: number): any[] {
      return [...arr].sort(() => Math.random() - 0.5).slice(0, count)
    }

    const makeRichText = (text: string) => ({
      root: {
        type: 'root',
        children: [{ type: 'paragraph', children: [{ type: 'text', text, version: 1 }], version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    })

    // ── Create articles ──────────────────────────────────────────────────────
    console.log('Creating articles...')

    const sofas = pickProducts('Sofas & sectionals', 5)
    const armchairs = pickProducts('Armchairs & accent chairs', 3)
    const tables = pickProducts('Coffee & side tables', 4)
    const lighting = pickProducts('Lighting', 4)
    const rugs = pickProducts('Rugs', 3)
    const desks = pickProducts('Desks', 3)
    const bookcases = pickProducts('Bookcases & shelving', 3)
    const chairs = pickProducts('Dining chairs', 3)
    const beds = pickProducts('Beds', 4)
    const diningTables = pickProducts('Dining tables', 3)
    const plants = pickProducts('Plants', 3)
    const decor = pickProducts('Home decor & accessories', 5)
    const clocks = pickProducts('Clock', 2)

    const articleDefs = [
      {
        title: 'The Scandinavian Living Room: Warm Minimalism Done Right',
        slug: 'scandinavian-living-room',
        excerpt: 'Warm neutrals, natural materials, and considered negative space — we break down how to build a Scandinavian room that actually feels lived-in.',
        category: 'Sofas & sectionals',
        author: authorSofia.id,
        readTime: '7 min',
        featured: true,
        tags: [{ tag: 'Living room' }, { tag: 'Scandinavian' }, { tag: 'Get the look' }],
        content: [
          { blockType: 'richText', content: makeRichText('There is a quality to Scandinavian interiors that is difficult to name. It is not minimalism exactly — there are objects, warmth, and personality. It is more like a kind of confident restraint. Everything chosen, nothing accidental.') },
          { blockType: 'sectionHeading', number: '01', heading: 'The anchor piece' },
          { blockType: 'richText', content: makeRichText('Every great living room starts with the sofa. In a Scandinavian scheme, you want something that feels substantial but not heavy — generous in depth, with clean lines that let the room breathe around it.') },
          ...(sofas[0] ? [{ blockType: 'productCard', product: sofas[0].id, editorsNote: 'A great starting point for any living room — the form is timeless and the proportions are generous.', displayStyle: 'full' }] : []),
          { blockType: 'stylingTip', icon: '💡', label: 'The 60-30-10 rule', content: 'Apply your dominant colour to 60% of the room, a secondary colour to 30%, and an accent to just 10%. This keeps the space cohesive without feeling flat.' },
          { blockType: 'sectionHeading', number: '02', heading: 'Natural materials' },
          { blockType: 'richText', content: makeRichText('Wood, jute, linen, brass — these are the materials of a Scandinavian room. Each one ages visibly, honestly. A wooden table picks up marks over time; linen softens with every wash.') },
          { blockType: 'materialCallout', icon: '🪵', name: 'Solid wood', description: 'Wood brings warmth that no synthetic material can replicate. The grain tells a story, and the surface develops character over years of use. Choose pieces where the wood is left to speak for itself.' },
          ...(tables[0] ? [{ blockType: 'productCard', product: tables[0].id, displayStyle: 'full' }] : []),
          { blockType: 'pullQuote', quote: 'The best Scandinavian rooms look like they happened slowly, over years. That is the goal — not a room that was designed, but one that was lived.', attribution: 'Sofia Nilsson, Interior editor' },
          { blockType: 'sectionHeading', number: '03', heading: 'Light and atmosphere' },
          { blockType: 'richText', content: makeRichText('Light is the most important material in a room. In the long winter months, a single floor lamp positioned beside a reading chair can make the difference between a room that feels cosy and one that feels dark.') },
          ...(lighting[0] ? [{ blockType: 'productCard', product: lighting[0].id, displayStyle: 'compact' }] : []),
          ...(rugs[0] ? [{ blockType: 'productCard', product: rugs[0].id, editorsNote: 'A rug defines the living area and adds warmth underfoot. Go bigger than you think — it should extend under the sofa.', displayStyle: 'full' }] : []),
          { blockType: 'budgetBreakdown', title: 'Room breakdown', items: [
            ...(sofas[0] ? [{ product: sofas[0].id, color: '#C4673A' }] : []),
            ...(tables[0] ? [{ product: tables[0].id, color: '#8B6914' }] : []),
            ...(lighting[0] ? [{ product: lighting[0].id, color: '#B8860B' }] : []),
            ...(rugs[0] ? [{ product: rugs[0].id, color: '#5B7A5E' }] : []),
            ...(armchairs[0] ? [{ product: armchairs[0].id, color: '#3B6FA0' }] : []),
          ]},
        ],
      },
      {
        title: 'A Home Office That Actually Works',
        slug: 'minimal-home-office',
        excerpt: 'The best home offices disappear when you\'re not using them. Here\'s how to build a workspace that is calm, functional, and beautiful.',
        category: 'Desks',
        author: authorMarcus.id,
        readTime: '5 min',
        featured: true,
        tags: [{ tag: 'Home office' }, { tag: 'Minimal' }, { tag: 'Workspace' }],
        content: [
          { blockType: 'richText', content: makeRichText('The home office has a design problem. Most are either aggressively corporate or so aesthetically considered that they stop feeling like somewhere you could actually work. The ideal sits between: functional without being clinical, beautiful without being precious.') },
          { blockType: 'sectionHeading', number: '01', heading: 'The desk as anchor' },
          { blockType: 'richText', content: makeRichText('Invest in the desk surface. Everything else in the room responds to it. A solid desk will outlast any fashion cycle and only improve with age. Consider depth as well as width — you need space to spread out.') },
          ...(desks[0] ? [{ blockType: 'productCard', product: desks[0].id, displayStyle: 'full' }] : []),
          { blockType: 'sectionHeading', number: '02', heading: 'Storage that edits itself' },
          { blockType: 'richText', content: makeRichText('Open shelving forces discipline. Everything on display should earn its place. A good bookcase is as much an editing tool as a storage solution.') },
          ...(bookcases[0] ? [{ blockType: 'productCard', product: bookcases[0].id, editorsNote: 'Open shelving forces you to edit your objects — there is nowhere to hide the things you don\'t love.', displayStyle: 'full' }] : []),
          { blockType: 'pullQuote', quote: 'A home office should feel like a place you choose to go — not a place you are obligated to be.', attribution: 'Marcus Andersen, Furniture specialist' },
          { blockType: 'stylingTip', icon: '🌿', label: 'Add one living thing', content: 'A single plant — not a collection — grounds a workspace and reduces the visual hardness of screens and cables. One is enough.' },
          ...(plants[0] ? [{ blockType: 'productCard', product: plants[0].id, displayStyle: 'compact' }] : []),
          ...(clocks[0] ? [{ blockType: 'productCard', product: clocks[0].id, displayStyle: 'compact' }] : []),
        ],
      },
      {
        title: 'The Bedroom as Sanctuary',
        slug: 'bedroom-sanctuary',
        excerpt: 'Good sleep starts with good design. How to choose the right bed, layer textures, and create a bedroom that feels like a retreat.',
        category: 'Beds',
        author: authorElena.id,
        readTime: '6 min',
        featured: true,
        tags: [{ tag: 'Bedroom' }, { tag: 'Sleep' }, { tag: 'Textiles' }],
        content: [
          { blockType: 'richText', content: makeRichText('The bedroom is the one room where restraint matters most. Strip away everything that does not serve rest, and you are left with the essentials: good light control, natural textiles, and a bed that you look forward to getting into.') },
          { blockType: 'sectionHeading', number: '01', heading: 'The bed frame' },
          { blockType: 'richText', content: makeRichText('The bed frame sets the tone for the entire room. Choose something with presence but not dominance — it should feel like a natural part of the space, not a monument to sleep.') },
          ...(beds[0] ? [{ blockType: 'productCard', product: beds[0].id, displayStyle: 'full' }] : []),
          ...(beds[1] ? [{ blockType: 'productCard', product: beds[1].id, editorsNote: 'A beautiful alternative if you prefer a lower profile. The proportions are perfect for smaller rooms.', displayStyle: 'full' }] : []),
          { blockType: 'stylingTip', icon: '🌙', label: 'Layer your textiles', content: 'Start with a fitted sheet, add a flat sheet, then a duvet, then a lightweight throw at the foot. Layering is not just aesthetic — it\'s functional temperature regulation.' },
          { blockType: 'sectionHeading', number: '02', heading: 'Light control' },
          { blockType: 'richText', content: makeRichText('Bedside lighting should be warm and dimmable. Avoid overhead fixtures — they create harsh shadows that work against the room\'s purpose. A pendant or table lamp beside the bed is all you need.') },
          ...(lighting[1] ? [{ blockType: 'productCard', product: lighting[1].id, displayStyle: 'compact' }] : []),
          { blockType: 'pullQuote', quote: 'The bedroom should be the quietest room in your home — in every sense. Quiet colours, quiet textures, quiet objects.', attribution: 'Elena Park, Home stylist' },
        ],
      },
      {
        title: 'Setting the Perfect Dining Table',
        slug: 'perfect-dining-table',
        excerpt: 'The dining table is the most social piece of furniture in your home. How to choose the right shape, material, and lighting.',
        category: 'Dining tables',
        author: authorMarcus.id,
        readTime: '5 min',
        featured: true,
        tags: [{ tag: 'Dining' }, { tag: 'Entertaining' }, { tag: 'Wood' }],
        content: [
          { blockType: 'richText', content: makeRichText('Round and oval tables are having a moment — and for good reason. Without corners, conversation flows more easily. Everyone can see everyone else. And they work better in smaller rooms where you need to move around the table.') },
          ...(diningTables[0] ? [{ blockType: 'productCard', product: diningTables[0].id, displayStyle: 'full' }] : []),
          { blockType: 'sectionHeading', number: '01', heading: 'The chair mix' },
          { blockType: 'richText', content: makeRichText('Matching chairs is the safe choice, but mixing two complementary styles creates a room with more personality. Try pairing a solid wooden chair with something lighter — a wire frame or moulded plastic.') },
          ...(chairs[0] ? [{ blockType: 'productCard', product: chairs[0].id, displayStyle: 'full' }] : []),
          ...(chairs[1] ? [{ blockType: 'productCard', product: chairs[1].id, displayStyle: 'compact' }] : []),
          { blockType: 'sectionHeading', number: '02', heading: 'Pendant height matters' },
          { blockType: 'richText', content: makeRichText('The pendant light over the dining table is the single most impactful lighting decision in the room. Hang it 70–80 cm above the table surface — lower than you think. It creates intimacy and pools the light where you need it.') },
          ...(lighting[2] ? [{ blockType: 'productCard', product: lighting[2].id, editorsNote: 'Hang it lower than you think — 70cm above the table creates the perfect pool of light.', displayStyle: 'compact' }] : []),
          { blockType: 'budgetBreakdown', title: 'Dining room budget', items: [
            ...(diningTables[0] ? [{ product: diningTables[0].id, color: '#5C4A32' }] : []),
            ...(chairs[0] ? [{ product: chairs[0].id, color: '#C4673A' }] : []),
            ...(lighting[2] ? [{ product: lighting[2].id, color: '#B8860B' }] : []),
          ]},
        ],
      },
      {
        title: 'Small Space, Big Style: Apartment Living',
        slug: 'small-space-apartment',
        excerpt: 'Limited square footage doesn\'t mean limited style. Our guide to making every corner count.',
        category: 'Bookcases & shelving',
        author: authorElena.id,
        readTime: '6 min',
        featured: false,
        tags: [{ tag: 'Small spaces' }, { tag: 'Apartment' }, { tag: 'Storage' }],
        content: [
          { blockType: 'richText', content: makeRichText('Small-space living demands creativity. Every piece must justify its footprint. The good news: constraints breed the most interesting design solutions. A compact apartment can feel more considered than a sprawling house.') },
          { blockType: 'sectionHeading', number: '01', heading: 'Vertical storage' },
          { blockType: 'richText', content: makeRichText('When floor space is precious, go vertical. Wall-mounted shelving, tall bookcases, and floating desks free up the floor while adding character to blank walls.') },
          ...(bookcases[1] ? [{ blockType: 'productCard', product: bookcases[1].id, displayStyle: 'full' }] : []),
          { blockType: 'stylingTip', icon: '📐', label: 'The 50% rule', content: 'In a small space, try to keep 50% of your floor visible. This creates the perception of more space — rugs, furniture legs, and clear pathways all contribute.' },
          { blockType: 'sectionHeading', number: '02', heading: 'Multi-functional pieces' },
          { blockType: 'richText', content: makeRichText('A coffee table with storage underneath, a desk that doubles as a dining table, a sofa bed for guests — dual-purpose furniture is the secret weapon of small-space living.') },
          ...(sofas[1] ? [{ blockType: 'productCard', product: sofas[1].id, displayStyle: 'full' }] : []),
          ...(desks[1] ? [{ blockType: 'productCard', product: desks[1].id, displayStyle: 'compact' }] : []),
          { blockType: 'pullQuote', quote: 'Small spaces are not problems to solve. They are invitations to be more intentional about what you keep.', attribution: 'Elena Park, Home stylist' },
          ...(decor[0] ? [{ blockType: 'productCard', product: decor[0].id, displayStyle: 'compact' }] : []),
        ],
      },
      {
        title: 'Lighting That Changes Everything',
        slug: 'lighting-guide',
        excerpt: 'The right light transforms a room more than any piece of furniture. Our complete guide to layered lighting.',
        category: 'Lighting',
        author: authorSofia.id,
        readTime: '8 min',
        featured: false,
        tags: [{ tag: 'Lighting' }, { tag: 'Design guide' }, { tag: 'Ambience' }],
        content: [
          { blockType: 'richText', content: makeRichText('Lighting is the most underestimated element in interior design. A beautiful room under bad lighting looks terrible. A simple room under great lighting looks magical. The secret is layers: ambient, task, and accent.') },
          { blockType: 'sectionHeading', number: '01', heading: 'Ambient light' },
          { blockType: 'richText', content: makeRichText('This is your base layer — the overall illumination of the room. Avoid single overhead fixtures. Instead, use multiple sources at different heights: floor lamps, pendants, and wall sconces create a more natural feel.') },
          ...(lighting[0] ? [{ blockType: 'productCard', product: lighting[0].id, displayStyle: 'full' }] : []),
          ...(lighting[1] ? [{ blockType: 'productCard', product: lighting[1].id, displayStyle: 'full' }] : []),
          { blockType: 'sectionHeading', number: '02', heading: 'Task lighting' },
          { blockType: 'richText', content: makeRichText('Reading, cooking, working — each activity needs focused light. Adjustable desk lamps and directional pendants keep the rest of the room soft while illuminating what matters.') },
          ...(lighting[2] ? [{ blockType: 'productCard', product: lighting[2].id, displayStyle: 'compact' }] : []),
          { blockType: 'materialCallout', icon: '💡', name: 'Warm vs. cool light', description: 'Below 3000K is warm (living rooms, bedrooms). Above 4000K is cool (kitchens, offices). Most homes benefit from 2700-3000K — warm white that flatters skin tones and materials.' },
          { blockType: 'sectionHeading', number: '03', heading: 'Accent lighting' },
          { blockType: 'richText', content: makeRichText('The final layer creates drama and draws the eye. A small spotlight on artwork, an LED strip under a shelf, or candles on a dining table — these are the details that make a room feel finished.') },
          ...(decor[1] ? [{ blockType: 'productCard', product: decor[1].id, displayStyle: 'compact' }] : []),
          ...(lighting[3] ? [{ blockType: 'productCard', product: lighting[3].id, displayStyle: 'full' }] : []),
          { blockType: 'pullQuote', quote: 'Never light a room from a single source. Three is the minimum — and five is where it gets interesting.', attribution: 'Sofia Nilsson, Interior editor' },
        ],
      },
      {
        title: 'The Art of the Reading Corner',
        slug: 'reading-corner',
        excerpt: 'Every home deserves a quiet corner. How to carve out a space for slow reading, even in the smallest apartment.',
        category: 'Armchairs & accent chairs',
        author: authorMarcus.id,
        readTime: '4 min',
        featured: false,
        tags: [{ tag: 'Reading nook' }, { tag: 'Armchairs' }, { tag: 'Cosy' }],
        content: [
          { blockType: 'richText', content: makeRichText('A reading corner needs three things: a comfortable chair, good light, and a surface for your coffee. That\'s it. Everything else — the bookshelf, the throw blanket, the plant — is optional enhancement.') },
          ...(armchairs[0] ? [{ blockType: 'productCard', product: armchairs[0].id, editorsNote: 'The perfect reading chair has a high back, generous arms, and a seat deep enough to tuck your legs up.', displayStyle: 'full' }] : []),
          { blockType: 'stylingTip', icon: '📖', label: 'Position for natural light', content: 'Place the chair near a window for daytime reading. Add a floor lamp on the left (or right, if you\'re left-handed) for evenings. The light should fall over your shoulder onto the page.' },
          ...(tables[1] ? [{ blockType: 'productCard', product: tables[1].id, displayStyle: 'compact' }] : []),
          ...(armchairs[1] ? [{ blockType: 'productCard', product: armchairs[1].id, displayStyle: 'full' }] : []),
          { blockType: 'pullQuote', quote: 'A reading corner is not a luxury. It is a daily invitation to slow down.', attribution: 'Marcus Andersen, Furniture specialist' },
        ],
      },
      {
        title: 'Bringing Nature Inside: A Guide to Indoor Plants',
        slug: 'indoor-plants-guide',
        excerpt: 'Plants transform a room like nothing else — adding colour, texture, and life. Our guide for every level of green thumb.',
        category: 'Plants',
        author: authorElena.id,
        readTime: '5 min',
        featured: false,
        tags: [{ tag: 'Plants' }, { tag: 'Indoor garden' }, { tag: 'Low maintenance' }],
        content: [
          { blockType: 'richText', content: makeRichText('There is no faster way to make a room feel alive than adding plants. They soften hard edges, add organic shapes, and genuinely improve air quality. And contrary to popular belief, many plants are remarkably hard to kill.') },
          ...(plants[0] ? [{ blockType: 'productCard', product: plants[0].id, displayStyle: 'full' }] : []),
          { blockType: 'sectionHeading', number: '01', heading: 'Start with the unkillable' },
          { blockType: 'richText', content: makeRichText('Snake plants, pothos, and ZZ plants thrive on neglect. They tolerate low light, irregular watering, and temperature fluctuations. Start with these before graduating to anything that needs a misting schedule.') },
          ...(plants[1] ? [{ blockType: 'productCard', product: plants[1].id, displayStyle: 'compact' }] : []),
          ...(plants[2] ? [{ blockType: 'productCard', product: plants[2].id, displayStyle: 'compact' }] : []),
          { blockType: 'stylingTip', icon: '🪴', label: 'Odd numbers look natural', content: 'Group plants in threes or fives. Vary the heights — a tall floor plant, a medium shelf plant, and a small desk plant. Odd numbers feel organic rather than arranged.' },
          { blockType: 'pullQuote', quote: 'One large plant has more impact than ten small ones scattered around. Go bold, then edit.', attribution: 'Elena Park, Home stylist' },
        ],
      },
    ]

    const createdArticles: any[] = []
    for (const def of articleDefs) {
      try {
        const article = await payload.create({
          collection: 'articles',
          data: {
            title: def.title,
            slug: def.slug,
            excerpt: def.excerpt,
            heroImage: pickRandom(createdProducts.filter((p) => p.image), 1)[0]?.image || undefined,
            category: categoryMap[def.category]?.id,
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

    // ── Update homepage ───────────────────────────────────────────────────
    console.log('Updating homepage...')
    const trendingIds = createdProducts
      .sort(() => Math.random() - 0.5)
      .slice(0, 12)
      .map((p) => p.id)

    await payload.updateGlobal({
      slug: 'homepage',
      data: {
        hero: {
          heading: 'Shop the room.\nLove the story.',
          subheading: 'Discover beautifully styled rooms, then shop every piece that makes them extraordinary.',
          ctaText: 'Explore rooms',
          ctaArticle: createdArticles[0]?.id || undefined,
        },
        featuredArticles: createdArticles.slice(0, 6).map((a) => a.id),
        trendingProducts: trendingIds,
      },
    }).catch(() => {})

    // ── Summary ───────────────────────────────────────────────────────────
    const breakdown: Record<string, number> = {}
    for (const prod of products) {
      breakdown[prod._category] = (breakdown[prod._category] || 0) + 1
    }

    return NextResponse.json({
      ok: true,
      seeded: { categories: Object.keys(categoryMap).length, products: created, articles: createdArticles.length, authors: 3, imageErrors },
      breakdown,
      total: created,
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
