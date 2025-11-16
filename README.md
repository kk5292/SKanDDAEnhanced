# SKanDDA E-Commerce Template

A modern, responsive e-commerce website template for selling products online. This template features a beautiful hero section, product catalog, shopping cart, and checkout functionality.

> **Note:** This is an older version of the template. It is fully functional and ready to use. See [VERSION_INFO.md](VERSION_INFO.md) for details about the version and potential upgrades.

## 🌟 Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Product Management**: Easy-to-update JSON-based product catalog
- **Shopping Cart**: Add to cart functionality with persistent storage
- **Product Categories**: Organized by categories and subcategories
- **Product Features**: Support for trending items, new arrivals, discounts, and banners
- **Image Gallery**: Multiple product images with gallery view
- **Search & Filter**: Product search and filtering by category, price, etc.
- **Checkout Process**: Multi-step checkout flow
- **Contact Form**: Contact page with form functionality
- **Social Media Integration**: Links to Facebook, Instagram, and WhatsApp

## 📁 Project Structure

```
SKanDDAEnhanced/
├── index.html          # Homepage with hero section
├── products.html       # Product catalog page
├── cart.html          # Shopping cart page
├── checkout.html      # Checkout page
├── about.html         # About Us page
├── contact.html       # Contact Us page
├── css/               # Stylesheets
│   ├── 01_base.css
│   ├── 02_layout.css
│   ├── 03_hero.css
│   ├── 04_products.css
│   ├── 05_cart_checkout.css
│   └── 06_pages_responsive.css
├── js/                # JavaScript files
│   ├── products.js
│   ├── cart.js
│   ├── home-products.js
│   ├── scroll-animations.js
│   └── site-ui.js
├── data/              # Data files
│   └── products.json  # Product catalog
└── assets/            # Images and media files
    ├── logo.png
    ├── home-hero.png
    └── [Product Images]
```

## 🚀 Getting Started

### Prerequisites

- A web browser (Chrome, Firefox, Safari, Edge)
- A text editor (VS Code, Sublime Text, Atom, etc.)
- Basic knowledge of HTML, CSS, and JavaScript (optional but helpful)

### Quick Start

1. **Clone or Download** this repository
2. **Open** `index.html` in your web browser to view the website
3. **For local development**, use a simple web server:
   ```bash
   # Using Python 3
   python3 -m http.server 8080
   
   # Using Node.js
   npx http-server -p 8080
   
   # Using PHP
   php -S localhost:8080
   ```
4. **Visit** `http://localhost:8080` in your browser

## 📝 Customization Guide

See [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md) for detailed instructions on how to customize this template for your own products and brand.

Quick customization checklist:
- [ ] Update branding (logo, company name, colors)
- [ ] Modify hero text and images
- [ ] Update product catalog (data/products.json)
- [ ] Replace product images
- [ ] Update contact information
- [ ] Modify social media links
- [ ] Update footer copyright

## 🛍️ Managing Products

See [PRODUCT_SETUP.md](PRODUCT_SETUP.md) for detailed instructions on adding, editing, and managing products.

### Quick Product Addition

1. Add product images to `assets/[Category]/[Subcategory]/`
2. Add product entry to `data/products.json`
3. Products will automatically appear on the website

## 🎨 Customizing Appearance

### Colors

The main brand colors are defined in the CSS files. To change colors:

1. Open `css/01_base.css`
2. Update the color values (search for hex codes like `#ff5b00`)
3. Common places to update:
   - Primary color: `#ff5b00` (orange accent)
   - Background colors
   - Text colors
   - Button colors

### Fonts

The template uses the 'Poppins' font. To change:

1. Update the Google Fonts link in HTML files
2. Update `font-family` in CSS files

### Layout

Layout can be modified in:
- `css/02_layout.css` - Overall layout structure
- `css/03_hero.css` - Hero section styling
- `css/04_products.css` - Product display styling

## 🌐 Deployment

### Deploy to GitHub Pages

1. Push your customized repository to GitHub
2. Go to repository Settings → Pages
3. Select branch (usually `main`) and folder (`/root`)
4. Save and wait for deployment
5. Your site will be available at `https://[username].github.io/[repository-name]`

### Deploy to Other Platforms

This is a static website and can be deployed to:
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload files to S3 bucket with static hosting
- **Firebase Hosting**: Use Firebase CLI
- Any web hosting service with HTML support

## 🔧 Configuration

### Important Files to Customize

1. **data/products.json** - Product catalog
2. **index.html** - Homepage hero text
3. **about.html** - About Us content
4. **contact.html** - Contact information
5. **All HTML files** - Update company name in headers/footers
6. **assets/** - Replace images with your own

### Contact Information

Update contact details in:
- `contact.html` - Contact form and information
- Footer section in all HTML files
- Social media links in footer

## 📱 Mobile Responsiveness

The template is fully responsive and includes:
- Mobile navigation menu
- Touch-friendly product carousels
- Responsive product grids
- Mobile-optimized forms

## 🤝 Support

For questions or issues:
- Check the [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md)
- Review the code comments in HTML and JavaScript files
- Check browser console for JavaScript errors

## 📄 License

This template is provided as-is for customization and use in your own projects.

## 🙏 Acknowledgments

- Template originally from SKanDDA
- Icons and social media integration
- Responsive design patterns

---

**Ready to customize?** Start with the [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md)!
