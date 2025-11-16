# Quick Start Guide

Get your e-commerce website up and running in 30 minutes!

## ⚡ Express Setup (5 Steps)

### Step 1: Replace the Logo (2 minutes)
1. Create your logo (PNG format, 200x200px)
2. Replace `assets/logo.png` with your logo
3. Done!

### Step 2: Update Company Name (3 minutes)
1. Open each HTML file (index.html, products.html, etc.)
2. Find and replace: `SKanDDA` → `Your Company Name`
3. Update footer: `SKanDDa Worldwide LLC` → `Your Company Name`
4. Save all files

### Step 3: Change Hero Section (5 minutes)
1. Open `index.html`
2. Find the hero section (around line 100):
   ```html
   <h1>From Our Roots to Your Home</h1>
   <p>SKanDDA brings together...</p>
   ```
3. Replace with your headline and description
4. Save the file

### Step 4: Add Your First Product (10 minutes)
1. Take a photo of your product (or use existing image)
2. Resize to 800x800px and save in `assets/YourCategory/`
3. Open `data/products.json`
4. Copy this template and add your product:
   ```json
   {
     "productCode": "PROD-001",
     "name": "Your Product Name",
     "image": "assets/YourCategory/your-product.png",
     "price": 29.99,
     "weight": "500g",
     "benefit": "Why customers should buy this",
     "available": 1,
     "category": "Your Category",
     "subcategory": "Your Subcategory",
     "isBanner": false,
     "minDeliveryDays": 3,
     "isTrending": true,
     "isNew": true,
     "discount": 0
   }
   ```
5. Save and test!

### Step 5: Test Your Site (10 minutes)
1. Open terminal/command prompt
2. Navigate to your project folder:
   ```bash
   cd path/to/SKanDDAEnhanced
   ```
3. Start a local server:
   ```bash
   python3 -m http.server 8080
   ```
4. Open browser: `http://localhost:8080`
5. Check:
   - ✅ Logo appears
   - ✅ Company name updated
   - ✅ Hero text changed
   - ✅ Your product shows up
   - ✅ Click your product (opens detail view)
   - ✅ Add to cart works
   - ✅ Test on mobile (resize browser)

**Congratulations! 🎉** Your basic website is ready!

---

## 🚀 What's Next?

### Immediate Next Steps
1. **Add More Products** - Follow [PRODUCT_SETUP.md](PRODUCT_SETUP.md)
2. **Update Contact Info** - Edit `contact.html`
3. **Update Social Links** - Update footer in all HTML files
4. **Customize Colors** - See [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md)

### Before Going Live
- [ ] Add all your products
- [ ] Replace all images
- [ ] Update About Us page
- [ ] Add contact information
- [ ] Update social media links
- [ ] Test on mobile devices
- [ ] Test in different browsers
- [ ] Proofread all content
- [ ] Optimize images
- [ ] Check all links work

### Deployment Options (Pick One)

#### GitHub Pages (Free, Easy)
1. Create GitHub account
2. Create new repository
3. Upload your files
4. Settings → Pages → Enable
5. Live in 2 minutes!

#### Netlify (Free, Easiest)
1. Go to netlify.com
2. Drag and drop your folder
3. Live in 30 seconds!

#### Traditional Hosting
1. Buy hosting (Bluehost, HostGator, etc.)
2. Upload via FTP
3. Point domain to hosting

---

## 📚 Full Documentation

For detailed customization:

| Guide | What It Covers | Time Needed |
|-------|----------------|-------------|
| [README.md](README.md) | Project overview & structure | 5 min read |
| [VERSION_INFO.md](VERSION_INFO.md) | About this template version | 5 min read |
| [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md) | Complete customization | 1-2 hours |
| [PRODUCT_SETUP.md](PRODUCT_SETUP.md) | Product management | 30 min read |

---

## 🆘 Common Issues

### Images Not Showing?
- Check file path is correct
- Ensure filename matches exactly (case-sensitive!)
- Verify image file exists in folder

### Products Not Appearing?
- Validate JSON syntax at jsonlint.com
- Check for missing commas
- Ensure all quotes are double quotes ("not ')

### Layout Looks Broken?
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors (F12)
- Ensure all CSS files are loading

### Can't Start Local Server?
```bash
# Try Python 3
python3 -m http.server 8080

# Or Python 2
python -m SimpleHTTPServer 8080

# Or Node.js
npx http-server -p 8080

# Or PHP
php -S localhost:8080
```

---

## 💡 Pro Tips

### Use a Code Editor
Download VS Code (free) for easier editing:
- Syntax highlighting
- Error detection
- Built-in terminal
- Extensions for web development

### Keep Backups
Before making big changes:
```bash
# Copy your folder
cp -r SKanDDAEnhanced SKanDDAEnhanced-backup

# Or use Git
git add .
git commit -m "Before making changes"
```

### Test Frequently
- Make small changes
- Test after each change
- Don't change too much at once

### Use Browser Dev Tools
Press F12 to:
- See console errors
- Test mobile view
- Inspect elements
- Debug JavaScript

---

## 📱 Mobile Testing

Test your site on real devices:
1. Start local server on your computer
2. Find your computer's IP address:
   ```bash
   # On Mac/Linux
   ifconfig | grep inet
   
   # On Windows
   ipconfig
   ```
3. On your phone, visit: `http://[YOUR-IP]:8080`
4. Test everything on mobile

---

## 🎨 Quick Customization Cheat Sheet

### Change Primary Color
Find and replace `#ff5b00` in CSS files with your color.

### Change Font
1. Add Google Font link to HTML `<head>`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
   ```
2. Update CSS:
   ```css
   body { font-family: 'Roboto', sans-serif; }
   ```

### Update Social Links
Find in footer of each HTML file:
```html
<a href="https://www.facebook.com/yourpage">
<a href="https://www.instagram.com/youraccount">
<a href="https://wa.me/1234567890">
```

---

## ✅ Launch Checklist

Before going live:

**Content**
- [ ] All products added
- [ ] All images replaced
- [ ] About Us written
- [ ] Contact info updated
- [ ] Company name changed everywhere
- [ ] Copyright year current

**Technical**
- [ ] All links work
- [ ] Images load fast
- [ ] Mobile responsive
- [ ] Browser testing done
- [ ] No console errors
- [ ] Forms work (if using)

**SEO & Marketing**
- [ ] Page titles updated
- [ ] Social media links added
- [ ] Contact methods clear
- [ ] Product descriptions complete
- [ ] Prices accurate

**Legal**
- [ ] Privacy policy added (if needed)
- [ ] Terms of service added (if needed)
- [ ] Return policy clear (if needed)

---

## 🎯 Success Tips

1. **Start Simple** - Don't try to perfect everything at once
2. **Focus on Products** - Great product photos matter most
3. **Clear Descriptions** - Help customers understand what they're buying
4. **Easy Contact** - Make it easy for customers to reach you
5. **Mobile First** - Most visitors will be on mobile
6. **Test Everything** - Click every button, test every page
7. **Get Feedback** - Ask friends/family to test your site
8. **Launch Early** - You can improve after launch

---

## 📞 Need More Help?

1. **Read the full guides** - Most questions are answered there
2. **Check browser console** - Errors show up there (F12)
3. **Validate your code** - Use W3C validators
4. **Google your error** - Someone else has likely solved it
5. **Take it step by step** - Don't rush

---

**Ready to customize?** Pick a task above and start building your store! 🚀

**Good luck with your online business!** 🎊
