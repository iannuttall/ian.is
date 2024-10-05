# Project Recreation Guide: Linking Bio Tool Powered by Google Sheets

This guide provides a step-by-step process to recreate the linking bio tool project from scratch.

## Step 1: Set Up the Project

- [ ] Create a new Next.js project:
   ```
   npx create-next-app@latest my-bio-link-tool
   ```
   Choose TypeScript, ESLint, Tailwind CSS, and App Router when prompted.

- [ ] Navigate to the project directory:
   ```
   cd my-bio-link-tool
   ```

- [ ] Install additional dependencies:
   ```
   npm install @vercel/og framer-motion lucide-react next-themes node-cache typed.js @radix-ui/react-dropdown-menu @radix-ui/react-slot class-variance-authority clsx tailwind-merge tailwindcss-animate
   ```

## Step 2: Configure the Project

- [ ] Set up Tailwind CSS:
   - Update `tailwind.config.ts` with the provided configuration, including color schemes and animations.

- [ ] Update `tsconfig.json`:
   - Add the path alias for `@/*` to point to the root directory.

- [ ] Create a `components.json` file in the root directory:
   - Add the configuration for shadcn/ui components.

- [ ] Update `next.config.mjs`:
   - Remove any unnecessary configurations.

- [ ] Set up shadcn/ui:
   ```
   npx shadcn@latest init
   ```
   Follow the prompts to configure shadcn/ui for your project.

## Step 3: Create Utility Functions

- [ ] Create `utils/fetchSheetData.ts`:
   - Implement the function to fetch and parse data from Google Sheets:
     ```typescript
     import NodeCache from 'node-cache';

     export interface LinkItem {
       type: string;
       title: string;
       description: string;
       logo: string;
       url: string;
       order: number;
       bg_color?: string;
       text_color?: string;
       border_color?: string;
       hover_border_color?: string;
       live: boolean;
     }

     const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours
     const CACHE_KEY = 'sheetData';

     function parseCSVRow(row: string): string[] {
       const fields = [];
       let field = '';
       let inQuotes = false;

       for (let i = 0; i < row.length; i++) {
         if (row[i] === '"') {
           inQuotes = !inQuotes;
         } else if (row[i] === ',' && !inQuotes) {
           fields.push(field.trim());
           field = '';
         } else {
           field += row[i];
         }
       }
       fields.push(field.trim());

       return fields.map(f => f.replace(/^"|"$/g, ''));
     }

     export async function fetchSheetData(forceFetch: boolean = false): Promise<LinkItem[]> {
       if (!forceFetch) {
         const cachedData = cache.get<LinkItem[]>(CACHE_KEY);
         if (cachedData) {
           return cachedData;
         }
       }

       const SHEET_ID = process.env.GOOGLE_SHEET_ID
       const GID = process.env.GOOGLE_SHEET_GID
       if (!SHEET_ID || !GID) {
         throw new Error('Google Sheet ID or GID is not set in environment variables')
       }
       const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?gid=${GID}&format=csv&_cb=${Date.now()}`

       const response = await fetch(url)
       const csvData = await response.text()

       const rows = csvData.split('\n')
       const headers = parseCSVRow(rows[0]).map(header => header.toLowerCase())

       const links = rows.slice(1).map(row => {
         const values = parseCSVRow(row);
         const item: Partial<LinkItem> = {};

         headers.forEach((header, index) => {
           switch (header) {
             case 'type':
             case 'title':
             case 'description':
             case 'logo':
             case 'url':
             case 'bg_color':
             case 'text_color':
             case 'border_color':
             case 'hover_border_color':
               item[header] = values[index];
               break;
             case 'order':
               item.order = parseInt(values[index], 10);
               break;
             case 'live':
               item.live = values[index].toLowerCase() === 'true' || values[index] === '1';
               break;
           }
         });

         return item as LinkItem;
       }).sort((a, b) => a.order - b.order);

       const isProduction = process.env.NODE_ENV === 'production';
       const filteredLinks = isProduction ? links.filter(link => link.live) : links;

       cache.set(CACHE_KEY, filteredLinks);
       return filteredLinks;
     }
     ```

## Step 4: Set Up API Routes

- [ ] Create `pages/api/og.tsx`:
   - Implement the OpenGraph image generation API.

- [ ] Create `pages/api/subscribe.ts`:
   - Implement the newsletter subscription API:
     ```typescript
     import type { NextApiRequest, NextApiResponse } from 'next'

     export default async function handler(req: NextApiRequest, res: NextApiResponse) {
       if (req.method !== 'POST') {
         return res.status(405).json({ error: 'Method not allowed' })
       }

       const { email } = req.body

       if (!email) {
         return res.status(400).json({ error: 'Email is required' })
       }

       try {
         const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY
         const CONVERTKIT_FORM_ID = process.env.CONVERTKIT_FORM_ID

         const response = await fetch(
           `https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
           {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
             body: JSON.stringify({
               api_key: CONVERTKIT_API_KEY,
               email,
             }),
           }
         )

         if (response.ok) {
           res.status(200).json({ message: 'Subscribed successfully' })
         } else {
           const error = await response.json()
           res.status(400).json({ error: error.message || 'Failed to subscribe' })
         }
       } catch {
         res.status(500).json({ error: 'Internal server error' })
       }
     }
     ```

- [ ] Create `pages/api/refreshSheetData.ts`:
   - Implement the API to manually refresh sheet data.

## Step 5: Create UI Components

- [ ] Use shadcn/ui to add reusable UI components:
   ```
   npx shadcn@latest add button
   npx shadcn@latest add card
   npx shadcn@latest add dropdown-menu
   npx shadcn@latest add input
   ```
   This will create the components in the `components/ui` directory.

- [ ] Create custom components:
   - `LinkItem.tsx`: For rendering individual link items.
   - `NewsletterSignup.tsx`: For newsletter signup functionality.
   - `theme-toggle.tsx`: For theme switching functionality.
     ```
     npx shadcn@latest add dropdown-menu
     ```
     Then customize the generated component for theme toggling.
   - `theme-provider.tsx`: For providing theme context (already set up by shadcn/ui).

## Step 6: Set Up Main Pages

- [ ] Update `app/page.tsx`:
   - Implement the main page layout and logic for fetching and displaying links.

- [ ] Update `app/layout.tsx`:
   - Set up the root layout with theme provider and global styles.

## Step 7: Styling and Assets

- [ ] Update `app/globals.css`:
   - Add global styles and Tailwind CSS imports.

- [ ] Add custom fonts to the `app/fonts` directory.

- [ ] Create `styles/og-styles.ts` for OpenGraph image styles.

## Step 8: Environment Setup

- [ ] Create a `.env.local` file:
   ```
   CONVERTKIT_API_KEY=your_convertkit_api_key
   CONVERTKIT_FORM_ID=your_convertkit_form_id
   NEXT_PUBLIC_MINIMAL_MODE=false
   GOOGLE_SHEET_ID=your_google_sheet_id
   GOOGLE_SHEET_GID=your_google_sheet_gid
   ```

## Step 9: Google Sheets Setup

- [ ] Create a Google Sheet with the following columns:
   - type
   - title
   - description
   - logo (should be a base64 encoded SVG, as it will be masked with a background color in the app)
   - url
   - order
   - bg_color
   - text_color
   - border_color
   - hover_border_color
   - live

- [ ] For the logo column:
  - Use base64 encoded SVG images
  - These will be masked with a background color in the app
  - To convert an SVG to base64, you can use online tools or a simple script

- [ ] Make the sheet publicly accessible and copy the Sheet ID and GID.

- [ ] Update the `GOOGLE_SHEET_ID` and `GOOGLE_SHEET_GID` in your `.env.local` file.

## Step 10: Deployment

- [ ] Create a Vercel account if you don't have one.

- [ ] Connect your GitHub repository to Vercel.

- [ ] Configure environment variables in Vercel:
   - Add the same variables as in your `.env.local` file, including `GOOGLE_SHEET_ID` and `GOOGLE_SHEET_GID`.

- [ ] Deploy the project on Vercel.

## Step 11: Customization

- [ ] Modify the `LinkItem` component to add or remove social media types.

- [ ] Customize the styling in `tailwind.config.ts` and individual components.

- [ ] Update the OpenGraph image generation in `pages/api/og.tsx` to match your branding.

## Step 12: Implement Sheet Data Fetching

- [ ] In your `app/page.tsx`, use the `fetchSheetData` function to retrieve and display link items:
   ```typescript
   import { fetchSheetData } from '../utils/fetchSheetData'
   import LinkItem from '../components/LinkItem'

   export default async function Home() {
     const links = await fetchSheetData()

     return (
       <main>
         {links.map((link, index) => (
           <LinkItem key={index} item={link} index={index} />
         ))}
       </main>
     )
   }
   ```

## Step 13: Implement Newsletter Signup

- [ ] In your `NewsletterSignup.tsx` component, implement the form submission:
   ```typescript
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault()
     const formData = new FormData(e.currentTarget)
     const email = formData.get('email')

     try {
       const response = await fetch('/api/subscribe', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email }),
       })

       if (response.ok) {
         // Handle successful subscription
       } else {
         // Handle error
       }
     } catch (error) {
       // Handle network error
     }
   }
   ```

By following these steps, you'll be able to recreate the linking bio tool project and customize it for your needs. Remember to replace placeholder values (like API keys and Sheet ID) with your actual data.