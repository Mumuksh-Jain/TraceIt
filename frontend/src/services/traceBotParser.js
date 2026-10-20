/**
 * TraceBot NLP Parser
 * Zero-cost client-side natural language extractor for campus lost & found reports.
 * Extracts title, category, campus location, colors, and brands from natural sentences.
 */

const CATEGORY_MAP = {
  Electronics: [
    'laptop', 'macbook', 'notebook', 'phone', 'iphone', 'samsung', 'android', 'tablet',
    'ipad', 'charger', 'cable', 'headphones', 'earphones', 'airpods', 'earbuds', 'mouse',
    'keyboard', 'powerbank', 'calculator', 'smartwatch', 'watch', 'camera', 'usb', 'pendrive', 'hard disk'
  ],
  Documents: [
    'id', 'id card', 'student id', 'admit card', 'wallet', 'purse', 'license', 'driving license',
    'passport', 'folder', 'certificate', 'keys', 'keychain', 'card', 'metro card', 'bus pass'
  ],
  Clothing: [
    'jacket', 'hoodie', 'sweater', 'coat', 'cap', 'hat', 'scarf', 'gloves', 'shirt',
    't-shirt', 'pants', 'jeans', 'shoes', 'sneakers', 'umbrella', 'sunglasses', 'glasses'
  ],
  Bags: [
    'bag', 'backpack', 'tote', 'duffel', 'laptop bag', 'handbag', 'pouch', 'luggage', 'suitcase'
  ],
  Books: [
    'book', 'notebook', 'register', 'diary', 'textbook', 'novel', 'notes', 'binder', 'assignment'
  ],
  Accessories: [
    'bottle', 'flask', 'water bottle', 'ring', 'chain', 'bracelet', 'necklace', 'earring',
    'lunchbox', 'tiffin', 'thermos'
  ]
}

const BRANDS = [
  'apple', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'samsung', 'sony', 'boat', 'jbl',
  'bose', 'oneplus', 'xiaomi', 'realme', 'nike', 'adidas', 'puma', 'wildcraft', 'fastrack',
  'casio', 'titan', 'hydro flask', 'milton', 'tupperware'
]

const COLORS = [
  'black', 'white', 'blue', 'navy', 'red', 'crimson', 'green', 'yellow', 'gold', 'silver',
  'grey', 'gray', 'pink', 'purple', 'orange', 'brown', 'matte black', 'space gray'
]

export function parseNaturalReport(text) {
  if (!text || typeof text !== 'string') {
    return null
  }

  const clean = text.trim()
  const lower = clean.toLowerCase()

  // 1. Detect Category
  let detectedCategory = 'Other'
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some((k) => new RegExp(`\\b${k}\\b`, 'i').test(lower))) {
      detectedCategory = cat
      break
    }
  }

  // 2. Detect Brand
  let detectedBrand = ''
  for (const b of BRANDS) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(lower)) {
      detectedBrand = b.charAt(0).toUpperCase() + b.slice(1)
      break
    }
  }

  // 3. Detect Color
  let detectedColor = ''
  for (const c of COLORS) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(lower)) {
      detectedColor = c.charAt(0).toUpperCase() + c.slice(1)
      break
    }
  }

  // 4. Extract Location
  let detectedLocation = ''
  const locationPatterns = [
    /(?:in|at|near|around|by|outside|inside)\s+(?:the\s+)?([A-Za-z0-9\s,\-\/]{3,35}?)(?=\s+(?:at|around|near|on|\.|\,|$|\d{1,2}\s*(?:am|pm)))/i,
    /(?:library|lab|canteen|cafeteria|audi|auditorium|hostel|block\s*[a-z0-9]|room\s*[0-9]+|ground|parking|bus\s*stand|stairs|elevator|gym)[A-Za-z0-9\s,\-\/]*/i
  ]

  for (const pattern of locationPatterns) {
    const match = clean.match(pattern)
    if (match) {
      detectedLocation = match[1] ? match[1].trim() : match[0].trim()
      // Clean trailing prepositions
      detectedLocation = detectedLocation.replace(/\s+(at|on|in|around)$/i, '').trim()
      break
    }
  }

  // 5. Generate Smart Title
  let titleParts = []
  if (detectedColor) titleParts.push(detectedColor)
  if (detectedBrand) titleParts.push(detectedBrand)

  // Find the primary noun keyword
  let mainNoun = ''
  for (const keywords of Object.values(CATEGORY_MAP)) {
    for (const k of keywords) {
      if (new RegExp(`\\b${k}\\b`, 'i').test(lower)) {
        mainNoun = k.charAt(0).toUpperCase() + k.slice(1)
        break
      }
    }
    if (mainNoun) break
  }

  if (mainNoun) {
    titleParts.push(mainNoun)
  }

  let finalTitle = titleParts.join(' ')
  if (!finalTitle || finalTitle.length < 3) {
    // Fallback: take first 5-6 words of user text
    finalTitle = clean.split(/\s+/).slice(0, 5).join(' ')
  }

  return {
    title: finalTitle.trim(),
    category: detectedCategory,
    location: detectedLocation || 'Campus Campus Area',
    description: clean,
    detectedBrand,
    detectedColor
  }
}
