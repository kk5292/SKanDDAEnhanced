# Website Customization Guide

This guide will walk you through customizing the SKanDDA e-commerce template for your own products and brand. Follow these steps to transform this template into your own website.

## Table of Contents

1. [Before You Start](#before-you-start)
2. [Branding & Identity](#branding--identity)
3. [Homepage Customization](#homepage-customization)
4. [Product Setup](#product-setup)
5. [Pages Customization](#pages-customization)
6. [Styling & Colors](#styling--colors)
7. [Images & Media](#images--media)
8. [Contact & Social Media](#contact--social-media)
9. [Testing Your Changes](#testing-your-changes)
10. [Going Live](#going-live)

---

## Before You Start

### What You'll Need

- **Text Editor**: VS Code, Sublime Text, or any code editor
- **Image Editor**: Photoshop, GIMP, Canva, or similar (for logo and images)
- **Your Content**:
  - Company/brand name
  - Logo (PNG format with transparent background recommended)
  - Product images
  - Product descriptions and prices
  - About Us content
  - Contact information

### Make a Backup

Before making changes, create a backup of the original template:
```bash
cp -r SKanDDAEnhanced SKanDDAEnhanced-backup
```

---

## Branding & Identity

### Step 1: Update Company Name

Replace "SKanDDA" with your company name in all HTML files:

1. **Search and Replace**: Use your text editor's find-and-replace feature
   - Find: `SKanDDA`
   - Replace: `Your Company Name`
   
2. **Files to Update**:
   - `index.html` (line 6, title tag)
   - `products.html` (line 6)
   - `cart.html` (line 6)
   - `checkout.html` (line 6)
   - `about.html` (line 6)
   - `contact.html` (line 6)

3. **Footer Copyright**: Update in all HTML files (near the bottom):
   ```html
   <!-- Change from: -->
   <p>&copy; 2025 SKanDDa Worldwide LLC. All Rights Reserved.</p>
   
   <!-- To: -->
   <p>&copy; 2025 Your Company Name. All Rights Reserved.</p>
   ```

### Step 2: Replace Logo

1. **Create Your Logo**:
   - Recommended size: 200x200 pixels minimum
   - Format: PNG with transparent background
   - Keep it simple and recognizable

2. **Replace Logo Files**:
   - Replace `assets/logo.png` with your logo
   - Optionally update `assets/logo with Company name.png`

3. **Adjust Logo Size** (if needed):
   - Open each HTML file
   - Find the logo img tag (search for `logo.png`)
   - Adjust height in the CSS:
   ```css
   .logo img {
       height: 50px; /* Adjust this value */
   }
   ```

### Step 3: Update Favicon

The small icon that appears in browser tabs:

1. Create a favicon (16x16 or 32x32 pixels)
2. Save as `favicon.ico` or `favicon.png`
3. Add to the `<head>` section of all HTML files:
   ```html
   <link rel="icon" type="image/png" href="favicon.png">
   ```

---

## Homepage Customization

### Step 4: Update Hero Section

The hero section is the large banner on the homepage.

1. **Change Hero Text** in `index.html` (around line 100):
   ```html
   <!-- Find these lines: -->
   <h1>From Our Roots to Your Home</h1>
   <p>SKanDDA brings together the essence of India...</p>
   
   <!-- Replace with your message: -->
   <h1>Your Catchy Headline Here</h1>
   <p>Your compelling description that explains what you offer...</p>
   ```

2. **Replace Hero Background Image**:
   - Create/find a high-quality hero image (1920x1080 pixels recommended)
   - Save as `assets/home-hero.png` (or rename your file)
   - Update the path in `index.html` (around line 26):
   ```css
   body {
       background: url("assets/your-hero-image.png") center/cover no-repeat fixed;
   }
   ```

### Step 5: Customize Product Categories Section

1. **Update Section Title** in `index.html` (around line 200):
   ```html
   <h2>Our Products</h2>
   ```

2. The product categories are automatically loaded from `data/products.json`. Update your products there (see [Product Setup](#product-setup) section).

---

## Product Setup

### Step 6: Understanding Product Structure

Products are stored in `data/products.json`. Each product has these properties:

```json
{
  "productCode": "UNIQUE-CODE",
  "name": "Product Name",
  "image": "path/to/image.png",
  "price": 10.00,
  "weight": "100g",
  "benefit": "Product description or benefit",
  "available": 1,
  "category": "Category Name",
  "subcategory": "Subcategory Name",
  "isBanner": false,
  "minDeliveryDays": 2,
  "isTrending": false,
  "isNew": false,
  "discount": 0
}
```

### Step 7: Adding Your Products

See [PRODUCT_SETUP.md](PRODUCT_SETUP.md) for detailed product management instructions.

**Quick Steps**:

1. **Open** `data/products.json`
2. **Remove** existing products (or keep as examples)
3. **Add your products** using this template:

```json
{
  "productCode": "PROD-001",
  "name": "Your Product Name",
  "image": "assets/YourCategory/product-image.png",
  "price": 29.99,
  "weight": "500g",
  "benefit": "Why customers should buy this product",
  "available": 1,
  "category": "Your Category",
  "subcategory": "Your Subcategory",
  "isBanner": false,
  "minDeliveryDays": 3,
  "isTrending": true,
  "isNew": true,
  "discount": 10
}
```

4. **Save the file** and refresh your website

### Step 8: Organizing Product Images

Create a clear folder structure for your images:

```
assets/
├── YourCategory1/
│   ├── Subcategory1/
│   │   ├── product1.png
│   │   ├── product2.png
│   ├── Subcategory2/
│       ├── product3.png
├── YourCategory2/
    └── product4.png
```

**Image Guidelines**:
- Format: JPG or PNG
- Size: 800x800 pixels (square) recommended
- File size: Keep under 200KB for faster loading
- Background: White or transparent preferred

---

## Pages Customization

### Step 9: About Us Page

1. **Open** `about.html`
2. **Update the content** (around line 150):
   - Company history
   - Mission and values
   - Team information
   - What makes you unique

```html
<div class="about-content">
    <h2>About Your Company</h2>
    <p>Your company story...</p>
    
    <h3>Our Mission</h3>
    <p>Your mission statement...</p>
    
    <h3>What We Offer</h3>
    <p>Your unique value proposition...</p>
</div>
```

3. **Update Hero Image**: Replace `assets/about-hero.png` with your image

### Step 10: Contact Page

1. **Open** `contact.html`
2. **Update Contact Information** (around line 150):
   ```html
   <div class="contact-info">
       <h3>Get in Touch</h3>
       <p><strong>Email:</strong> your-email@example.com</p>
       <p><strong>Phone:</strong> +1 (123) 456-7890</p>
       <p><strong>Address:</strong> Your Business Address</p>
       <p><strong>Hours:</strong> Mon-Fri: 9am-6pm</p>
   </div>
   ```

3. **Configure Contact Form**:
   - The form currently uses client-side JavaScript
   - To make it functional, you'll need to:
     - Use a service like Formspree, EmailJS, or Web3Forms
     - Or set up server-side processing (PHP, Node.js, etc.)

**Example with Formspree**:
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
    <!-- form fields -->
</form>
```

4. **Update Hero Image**: Replace `assets/contact-hero.png`

### Step 11: Products Page

The products page is mostly automated, but you can:

1. **Update filters and categories** by modifying your `products.json`
2. **Adjust the layout** in `css/04_products.css`
3. **Modify search and filter options** in `js/products.js`

---

## Styling & Colors

### Step 12: Change Brand Colors

Your main brand color appears throughout the site. To change it:

1. **Open** `css/01_base.css`
2. **Find and replace** the primary color (currently `#ff5b00`):
   ```css
   /* Example: Change orange to blue */
   /* Find: #ff5b00 */
   /* Replace with: #0066cc */
   ```

3. **Update in all CSS files**:
   - `css/01_base.css`
   - `css/02_layout.css`
   - `css/04_products.css`

**Common Color Locations**:
- Links hover effect
- Button backgrounds
- Badges (NEW, TRENDING, etc.)
- Price highlights
- Active navigation items

### Step 13: Customize Fonts

1. **Choose a font** from [Google Fonts](https://fonts.google.com)
2. **Add the font link** to all HTML files in the `<head>`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Your+Font:wght@400;500;600;700&display=swap" rel="stylesheet">
   ```

3. **Update CSS** in `css/01_base.css`:
   ```css
   body {
       font-family: 'Your Font', sans-serif;
   }
   ```

### Step 14: Adjust Layout & Spacing

- **Page padding**: Edit in `css/02_layout.css`
- **Product grid**: Modify in `css/04_products.css`
- **Hero section**: Adjust in `css/03_hero.css`

---

## Images & Media

### Step 15: Prepare Your Images

**Product Images**:
- Resolution: 800x800px (1:1 ratio)
- Format: JPG for photos, PNG for graphics
- Optimize: Use tools like TinyPNG or ImageOptim
- Naming: Use descriptive names (e.g., `blue-widget-front.jpg`)

**Hero/Banner Images**:
- Resolution: 1920x1080px minimum
- Format: JPG
- File size: Under 500KB

**Logo**:
- Format: PNG with transparency
- Size: 200x200px or larger
- Keep it clean and simple

### Step 16: Image Optimization

Compress images before uploading:
- **Online tools**: TinyPNG, Squoosh.app
- **Desktop tools**: ImageOptim (Mac), RIOT (Windows)
- **Target**: Keep images under 200KB each

---

## Contact & Social Media

### Step 17: Update Social Media Links

In all HTML files, find the footer section and update:

```html
<!-- Facebook -->
<a href="https://www.facebook.com/yourpage" target="_blank">
    <img src="assets/facebook-icon.png" alt="Facebook">
</a>

<!-- Instagram -->
<a href="https://www.instagram.com/youraccount" target="_blank">
    <img src="assets/instagram-icon.png" alt="Instagram">
</a>

<!-- WhatsApp -->
<a href="https://wa.me/1234567890" target="_blank">
    <img src="assets/whatsapp-icon.png" alt="WhatsApp">
</a>
```

**Note**: Replace the phone number in WhatsApp link with your own (include country code).

### Step 18: Add More Social Links

Want to add Twitter, LinkedIn, or others?

1. **Download icon** for the platform (PNG, 32x32px)
2. **Add to footer** in all HTML files:
   ```html
   <a href="https://twitter.com/yourhandle" target="_blank">
       <img src="assets/twitter-icon.png" alt="Twitter">
   </a>
   ```

---

## Testing Your Changes

### Step 19: Local Testing

1. **Start a local server**:
   ```bash
   python3 -m http.server 8080
   ```

2. **Open in browser**: `http://localhost:8080`

3. **Test everything**:
   - [ ] All pages load correctly
   - [ ] All images display
   - [ ] Navigation works
   - [ ] Products display properly
   - [ ] Cart functionality works
   - [ ] Mobile responsive (resize browser)
   - [ ] Links work (especially social media)
   - [ ] Forms submit (if configured)

### Step 20: Cross-Browser Testing

Test in multiple browsers:
- Chrome
- Firefox
- Safari
- Edge

### Step 21: Mobile Testing

1. **Use browser dev tools**:
   - Chrome: F12 → Toggle Device Toolbar
   - Test iPhone, iPad, and Android sizes

2. **Test on real devices** if possible

**Common mobile issues to check**:
- Text is readable
- Buttons are large enough to tap
- Images scale properly
- Navigation menu works
- Horizontal scrolling is prevented

---

## Going Live

### Step 22: Pre-Launch Checklist

- [ ] All content reviewed and proofread
- [ ] All images optimized and loading
- [ ] Contact information correct
- [ ] Social media links working
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Forms working (if applicable)
- [ ] Copyright year current
- [ ] No broken links
- [ ] Products accurate (names, prices, descriptions)

### Step 23: Deployment Options

#### Option 1: GitHub Pages (Free)

1. Create a GitHub account if you don't have one
2. Create a new repository
3. Upload your files
4. Go to Settings → Pages
5. Select main branch and root folder
6. Your site will be at: `https://yourusername.github.io/repositoryname`

#### Option 2: Netlify (Free)

1. Create a Netlify account
2. Drag and drop your folder to Netlify
3. Get a free subdomain or connect your own domain
4. Auto-deploys when you update files

#### Option 3: Traditional Web Hosting

1. Purchase hosting from any provider
2. Upload files via FTP/SFTP
3. Point your domain to the hosting

### Step 24: Custom Domain (Optional)

To use your own domain (e.g., www.yourstore.com):

1. **Purchase a domain** from GoDaddy, Namecheap, etc.
2. **Configure DNS** to point to your hosting
3. **Update settings** in your hosting platform
4. **Wait** for DNS propagation (can take 24-48 hours)

---

## Troubleshooting

### Common Issues

**Images not showing**:
- Check file path is correct
- Ensure case sensitivity (image.png vs Image.PNG)
- Verify files are uploaded

**Products not appearing**:
- Validate JSON syntax in `products.json`
- Check browser console for errors (F12)
- Ensure image paths are correct

**Layout broken on mobile**:
- Check for horizontal scrolling issues
- Verify responsive CSS is not overridden
- Test in browser dev tools

**Cart not working**:
- Check browser console for JavaScript errors
- Clear browser cache and cookies
- Ensure all JS files are loaded

---

## Next Steps

After customization:

1. **Add Google Analytics** to track visitors
2. **Set up SEO** (meta descriptions, keywords)
3. **Create a sitemap** for search engines
4. **Add SSL certificate** (HTTPS)
5. **Set up payment processing** (if selling online)
6. **Create a blog** section (optional)
7. **Add customer reviews** functionality

---

## Need More Help?

- Review the code comments in HTML and JavaScript files
- Check the browser console (F12) for errors
- Validate your JSON at [jsonlint.com](https://jsonlint.com)
- Test your HTML at [validator.w3.org](https://validator.w3.org)

---

**Congratulations!** You've customized your e-commerce template. Good luck with your online store! 🎉
