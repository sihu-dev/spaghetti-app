# @unilab/catalog-engine

AI-powered product catalog generation engine for manufacturing SMEs.

## Features

### 🤖 AI Vision (GPT-4o)
Extract product specifications from images automatically:
- Model names, categories
- Technical specifications
- Features and descriptions
- Brand colors from logos

### 🎨 Color Extraction (HCT Algorithm)
Material Design 3 color system:
- Extract 5 dominant colors
- Generate 100-step color ramps
- Automatic dark mode generation
- Accessibility checking (WCAG AA/AAA)

### 📄 PDF Generation (React-PDF)
Professional catalog templates:
- Cover page with logo
- Product detail pages
- Contact information
- Customizable layouts

### 🚀 Autonomous Agent
Goal-based catalog creation:
- Natural language instructions
- Multi-step pipeline execution
- Progress tracking
- Error handling

---

## Installation

```bash
npm install @unilab/catalog-engine
# or
pnpm add @unilab/catalog-engine
```

### Peer Dependencies

```bash
npm install openai react
```

---

## Quick Start

### 1. Extract Product Info from Image

```typescript
import { extractProductInfo } from "@unilab/catalog-engine";

const productInfo = await extractProductInfo("https://example.com/product.jpg");

console.log(productInfo);
// {
//   modelName: "KP-500A",
//   category: "Industrial Pump",
//   specifications: { power: "220V/380V", material: "SUS304" },
//   features: ["Energy efficient", "Corrosion resistant"]
// }
```

### 2. Generate PDF Catalog

```typescript
import { generateCatalogPDF, productInfoToCatalogData } from "@unilab/catalog-engine";

const products = [
  await extractProductInfo("product1.jpg"),
  await extractProductInfo("product2.jpg"),
];

const catalogData = productInfoToCatalogData(products, {
  title: "Product Catalog 2026",
  companyName: "ACME Manufacturing",
  logo: "https://example.com/logo.png",
  contact: {
    address: "123 Factory St, Seoul",
    phone: "+82-2-1234-5678",
    email: "sales@acme.com",
  },
});

const pdfUrl = await generateCatalogPDF(catalogData);
console.log("PDF generated:", pdfUrl);
// /downloads/catalog-1672531200000.pdf
```

### 3. Autonomous Agent

```typescript
import { CatalogAgent } from "@unilab/catalog-engine";

const agent = new CatalogAgent();

const task = await agent.execute({
  goal: "제품 카탈로그를 한국어와 영어로 만들어줘",
  images: [
    "https://example.com/product1.jpg",
    "https://example.com/product2.jpg",
  ],
  logo: "https://example.com/logo.png",
  companyName: "한국펌프",
});

// Track progress
const progress = agent.getProgress();
console.log(`${progress.percentage}% complete`);

// Get result
console.log(task.result);
// {
//   pdfUrl: "/downloads/catalog.pdf",
//   products: [...],
//   brandColors: [...]
// }
```

### 4. Color Extraction

```typescript
import { extractColorsFromImage, generateColorRamp } from "@unilab/catalog-engine";

const colors = await extractColorsFromImage("logo.png");

// Generate 100-step color ramp
const primaryRamp = generateColorRamp(colors.primary);

console.log(primaryRamp);
// {
//   50: "#e3f2fd",
//   100: "#bbdefb",
//   ...
//   900: "#0d47a1",
//   950: "#072a5e"
// }
```

---

## API Reference

### Vision AI

#### `extractProductInfo(imageUrl: string): Promise<ProductInfo>`
Extract product specifications from image.

**Parameters:**
- `imageUrl` - URL or base64 image string

**Returns:**
```typescript
{
  modelName?: string;
  category?: string;
  manufacturer?: string;
  specifications?: Record<string, any>;
  features?: string[];
  description?: string;
}
```

#### `extractBrandColors(imageUrl: string): Promise<string[]>`
Extract brand colors from logo image.

**Returns:** Array of hex color strings

---

### PDF Generation

#### `generateCatalogPDF(data: CatalogData, filename?: string): Promise<string>`
Generate PDF catalog and save to public/downloads.

**Parameters:**
```typescript
{
  title: string;
  companyName: string;
  logo?: string;
  products: ProductInfo[];
  brandColor?: string;
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}
```

**Returns:** Public URL to download PDF

---

### Agent

#### `CatalogAgent.execute(input: AgentInput): Promise<AgentTask>`
Execute autonomous catalog creation pipeline.

**Parameters:**
```typescript
{
  goal: string;              // Natural language instruction
  images: string[];          // Product image URLs
  logo?: string;             // Company logo URL
  companyName?: string;      // Company name
}
```

**Returns:**
```typescript
{
  id: string;
  goal: string;
  status: "pending" | "running" | "completed" | "failed";
  steps: AgentStep[];
  result?: {
    pdfUrl: string;
    products: ProductInfo[];
    brandColors: string[];
  };
}
```

---

## Environment Variables

```env
# Required
OPENAI_API_KEY=sk-proj-...

# Optional (for Supabase integration)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Use Cases

### Manufacturing SMEs
Generate product catalogs from existing images:
- Pumps, valves, machinery
- Electronic components
- Industrial equipment

### E-commerce
Auto-generate product sheets:
- Multi-language support
- Consistent branding
- Professional PDF exports

### Marketing Agencies
Quick catalog creation for clients:
- Brand color extraction
- Template customization
- Batch processing

---

## Tech Stack

- **AI**: OpenAI GPT-4o Vision
- **Color**: Material Color Utilities (HCT)
- **PDF**: React-PDF
- **Color Utilities**: culori

---

## License

MIT

---

## Contributing

This package is part of the uniLAB monorepo.

**Repository:** https://github.com/sihu-dev/spaghetti-app

---

## Credits

Developed by uniLAB for the manufacturing SME ecosystem.
