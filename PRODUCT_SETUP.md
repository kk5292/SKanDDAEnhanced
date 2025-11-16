# Product Setup Guide

This guide explains how to add, edit, and manage products in your e-commerce website. Products are managed through the `data/products.json` file.

## Table of Contents

1. [Product JSON Structure](#product-json-structure)
2. [Adding New Products](#adding-new-products)
3. [Product Properties Explained](#product-properties-explained)
4. [Product Images](#product-images)
5. [Categories and Organization](#categories-and-organization)
6. [Special Product Types](#special-product-types)
7. [Product Features](#product-features)
8. [Examples](#examples)
9. [Tips and Best Practices](#tips-and-best-practices)

---

## Product JSON Structure

All products are stored in `data/products.json` as a JSON array. Here's the basic structure:

```json
[
  {
    "productCode": "UNIQUE-CODE",
    "name": "Product Name",
    "image": "path/to/image.png",
    "price": 10.00,
    "weight": "100g",
    "benefit": "Product description",
    "available": 1,
    "category": "Category",
    "subcategory": "Subcategory",
    "isBanner": false,
    "minDeliveryDays": 2,
    "isTrending": false,
    "isNew": false,
    "discount": 0
  }
]
```

---

## Adding New Products

### Step 1: Prepare Product Information

Gather the following details:
- Product name
- Price
- Product code (unique identifier)
- Category and subcategory
- Description/benefits
- Image(s)
- Weight/dimensions
- Delivery time
- Any special attributes (trending, new, discount)

### Step 2: Add Product Images

1. Create a folder structure:
   ```
   assets/
   └── YourCategory/
       └── YourSubcategory/
           └── PRODUCT-CODE/
               ├── product-main.png
               ├── product-image-1.png
               └── product-image-2.png
   ```

2. **Image requirements**:
   - Format: JPG or PNG
   - Resolution: 800x800 pixels (square, 1:1 ratio)
   - File size: Under 200KB recommended
   - Background: White or transparent

### Step 3: Add to products.json

1. Open `data/products.json` in your text editor
2. Add your product entry:

```json
{
  "productCode": "PROD-001",
  "name": "Your Product Name",
  "image": "assets/YourCategory/YourSubcategory/product-image.png",
  "price": 29.99,
  "weight": "500g",
  "benefit": "What makes this product special",
  "available": 1,
  "category": "Your Category",
  "subcategory": "Your Subcategory",
  "isBanner": false,
  "minDeliveryDays": 3,
  "isTrending": false,
  "isNew": true,
  "discount": 0
}
```

3. **Important**: Make sure to add a comma after the previous product entry!

4. Save and test your website

---

## Product Properties Explained

### Required Properties

#### productCode (string)
- **Purpose**: Unique identifier for the product
- **Example**: `"PROD-001"`, `"SN-CHIKKI-100"`
- **Rules**: 
  - Must be unique
  - Use uppercase letters, numbers, and hyphens
  - No spaces or special characters
  - Keep it short and meaningful

#### name (string)
- **Purpose**: Display name of the product
- **Example**: `"Organic Cotton T-Shirt"`
- **Tips**: 
  - Keep it clear and descriptive
  - Include key features if relevant
  - 50 characters or less recommended

#### image (string)
- **Purpose**: Path to the product's main image
- **Example**: `"assets/Fashion/Shirts/blue-shirt.png"`
- **Note**: Relative path from the root of your website

#### price (number)
- **Purpose**: Product price
- **Example**: `29.99`, `10.0`, `150`
- **Important**: 
  - Use numbers only (no currency symbols)
  - Decimals are supported
  - This is the base price before discounts

#### category (string)
- **Purpose**: Main product category
- **Example**: `"Fashion"`, `"Food & Grocery"`, `"Electronics"`
- **Note**: Used for filtering and organization

#### subcategory (string)
- **Purpose**: Product subcategory
- **Example**: `"Snacks"`, `"Women Wear"`, `"Accessories"`
- **Note**: Further classification within a category

### Optional Properties

#### weight (string)
- **Purpose**: Product weight, size, or dimensions
- **Example**: `"100 g"`, `"500ml"`, `"Large"`, `"10 × 5 × 3 cm"`
- **Default**: `"-"` if not applicable

#### benefit (string)
- **Purpose**: Short description or key benefit
- **Example**: `"High in protein & fiber; good for digestion"`
- **Tips**: 
  - One sentence preferred
  - Highlight main selling point
  - 100 characters or less recommended

#### available (number)
- **Purpose**: Stock availability
- **Values**:
  - `1` = Available / In stock
  - `0` = Out of stock / Coming soon
- **Default**: `0`

#### isBanner (boolean)
- **Purpose**: Mark as a banner/category header
- **Values**: `true` or `false`
- **Default**: `false`
- **Note**: Banners don't have "Add to Cart" buttons

#### minDeliveryDays (number)
- **Purpose**: Minimum delivery time in days
- **Example**: `2`, `5`, `7`
- **Default**: `0`

#### isTrending (boolean)
- **Purpose**: Mark product as trending
- **Values**: `true` or `false`
- **Default**: `false`
- **Note**: Trending products get a "TREND" badge

#### isNew (boolean)
- **Purpose**: Mark product as new arrival
- **Values**: `true` or `false`
- **Default**: `false`
- **Note**: New products get a "NEW" badge

#### discount (number)
- **Purpose**: Discount percentage
- **Example**: `10`, `25`, `50`
- **Default**: `0`
- **Note**: 
  - Value is percentage (10 = 10% off)
  - Displays discounted price automatically
  - Shows "X% OFF" badge

### Advanced Properties

#### images (array of strings)
- **Purpose**: Multiple product images for gallery view
- **Example**: 
  ```json
  "images": [
    "assets/Product/image1.jpg",
    "assets/Product/image2.jpg",
    "assets/Product/image3.jpg"
  ]
  ```
- **Note**: Use this instead of `image` for multiple photos

#### subsubcategory (string)
- **Purpose**: Third level of categorization
- **Example**: `"Tops"` under `"Women Wear"` under `"Fashion"`
- **Optional**: Use only if you need deep categorization

#### material (string)
- **Purpose**: Product material or composition
- **Example**: `"100% Organic Cotton"`, `"MDF Wood (Handcrafted)"`

#### highlights (array of strings)
- **Purpose**: List of product features/benefits
- **Example**:
  ```json
  "highlights": [
    "Handcrafted with care",
    "Eco-friendly materials",
    "Perfect for gifting"
  ]
  ```

#### customizable (boolean)
- **Purpose**: Indicate if product can be customized
- **Values**: `true` or `false`
- **Example**: Engraving, personalization options

---

## Product Images

### Single Image Products

Use the `image` property:

```json
{
  "productCode": "PROD-001",
  "name": "Blue Shirt",
  "image": "assets/Fashion/Shirts/blue-shirt.png",
  ...
}
```

### Multiple Image Products (Gallery)

Use the `images` array property:

```json
{
  "productCode": "GIFT-001",
  "name": "Wooden Gift Box",
  "images": [
    "assets/Gifts/GiftBoxes/GIFT-001/front.jpg",
    "assets/Gifts/GiftBoxes/GIFT-001/side.jpg",
    "assets/Gifts/GiftBoxes/GIFT-001/open.jpg",
    "assets/Gifts/GiftBoxes/GIFT-001/detail.jpg"
  ],
  ...
}
```

**Note**: When using `images`, don't include the `image` property.

### Image Best Practices

1. **Consistent sizing**: All product images should be the same dimensions
2. **High quality**: Use clear, well-lit photos
3. **Multiple angles**: Show different views of the product
4. **Zoom capability**: Ensure images are high-res enough for zoom
5. **Optimization**: Compress images to reduce load time

---

## Categories and Organization

### Setting Up Categories

Products are automatically grouped by their `category` and `subcategory` values.

**Example hierarchy**:
```
Food & Grocery
├── Snacks
├── Beverages
└── Groceries

Fashion
├── Women Wear
│   ├── Tops
│   └── Sarees
├── Men Wear
└── Kids Wear

Gifts
├── Return Gifts
└── Festival Gifts
```

### Adding a New Category

1. Simply add a product with a new category name:
   ```json
   {
     "category": "Electronics",
     "subcategory": "Phones",
     ...
   }
   ```

2. The category will automatically appear in the products page navigation

### Category Banners

Add visual banners for each category/subcategory:

```json
{
  "productCode": "ELECTRONICS-BANNER",
  "name": "Electronics",
  "image": "assets/Electronics/electronics-banner.png",
  "price": 0,
  "weight": "-",
  "benefit": "-",
  "available": 0,
  "category": "Electronics",
  "subcategory": "All",
  "isBanner": true,
  "minDeliveryDays": 0
}
```

**Banner Image Size**: 1200x400 pixels recommended

---

## Special Product Types

### Banner Products

Used as category headers/banners:

```json
{
  "productCode": "CAT-BANNER",
  "name": "Category Name",
  "image": "assets/category-banner.png",
  "price": 0,
  "weight": "-",
  "benefit": "-",
  "available": 0,
  "category": "Your Category",
  "subcategory": "Subcategory",
  "isBanner": true,
  "minDeliveryDays": 0
}
```

### Customizable Products

Products that can be personalized:

```json
{
  "productCode": "CUSTOM-001",
  "name": "Engraved Wooden Box",
  "image": "assets/Gifts/wooden-box.png",
  "price": 25.00,
  "benefit": "Customizable engraving available",
  "customizable": true,
  ...
}
```

### Variable Products

Products with variations (sizes, colors):

Currently, you need to create separate product entries for each variation:

```json
{
  "productCode": "SHIRT-BLUE-M",
  "name": "Cotton T-Shirt - Blue (Medium)",
  ...
},
{
  "productCode": "SHIRT-BLUE-L",
  "name": "Cotton T-Shirt - Blue (Large)",
  ...
}
```

---

## Product Features

### Trending Products

Mark popular or bestselling products:

```json
{
  "isTrending": true
}
```

- Shows "TREND" badge
- Appears in "Trending Products" section
- Gets priority in search results

### New Arrivals

Mark recently added products:

```json
{
  "isNew": true
}
```

- Shows "NEW" badge
- Appears in "New Products" section
- Highlighted in product listings

### Discounted Products

Add discounts to products:

```json
{
  "price": 100.00,
  "discount": 20
}
```

- Shows "20% OFF" badge
- Displays original price (strikethrough)
- Shows discounted price (highlighted)
- Calculated price: $100 - 20% = $80

### Out of Stock

Mark unavailable products:

```json
{
  "available": 0
}
```

- Shows "Coming Soon" or "Out of Stock" message
- Disables "Add to Cart" button
- Product still visible in catalog

---

## Examples

### Example 1: Simple Product

```json
{
  "productCode": "TEA-GREEN-100",
  "name": "Organic Green Tea",
  "image": "assets/Beverages/Tea/green-tea.png",
  "price": 12.50,
  "weight": "100g",
  "benefit": "Rich in antioxidants, promotes wellness",
  "available": 1,
  "category": "Food & Grocery",
  "subcategory": "Beverages",
  "isBanner": false,
  "minDeliveryDays": 2,
  "isTrending": false,
  "isNew": true,
  "discount": 0
}
```

### Example 2: Featured Product with Discount

```json
{
  "productCode": "DRESS-001",
  "name": "Summer Floral Dress",
  "image": "assets/Fashion/Dresses/floral-dress.png",
  "price": 49.99,
  "weight": "Medium",
  "benefit": "Perfect for summer occasions",
  "available": 1,
  "category": "Fashion",
  "subcategory": "Women Wear",
  "isBanner": false,
  "minDeliveryDays": 3,
  "isTrending": true,
  "isNew": true,
  "discount": 15
}
```

### Example 3: Product with Multiple Images

```json
{
  "productCode": "GIFT-BOX-001",
  "name": "Luxury Gift Hamper",
  "images": [
    "assets/Gifts/Hampers/GIFT-BOX-001/main.jpg",
    "assets/Gifts/Hampers/GIFT-BOX-001/contents.jpg",
    "assets/Gifts/Hampers/GIFT-BOX-001/packaging.jpg",
    "assets/Gifts/Hampers/GIFT-BOX-001/detail.jpg"
  ],
  "price": 75.00,
  "weight": "2 kg",
  "benefit": "Curated selection of premium items",
  "available": 1,
  "category": "Gifts",
  "subcategory": "Gift Hampers",
  "isBanner": false,
  "minDeliveryDays": 5,
  "material": "Premium packaging with ribbon",
  "highlights": [
    "Includes 10+ premium items",
    "Beautiful gift packaging",
    "Perfect for special occasions",
    "Customization available"
  ],
  "customizable": true,
  "isTrending": true,
  "isNew": false,
  "discount": 10
}
```

### Example 4: Category Banner

```json
{
  "productCode": "ELECTRONICS-BANNER",
  "name": "Electronics",
  "image": "assets/Electronics/category-banner.png",
  "price": 0,
  "weight": "-",
  "benefit": "-",
  "available": 0,
  "category": "Electronics",
  "subcategory": "All",
  "isBanner": true,
  "minDeliveryDays": 0
}
```

---

## Tips and Best Practices

### General Tips

1. **Unique Product Codes**: Always use unique codes for each product
2. **Consistent Naming**: Use consistent naming conventions
3. **Regular Updates**: Keep product information current
4. **Accurate Pricing**: Double-check all prices before publishing
5. **Clear Descriptions**: Write clear, benefit-focused descriptions

### JSON Formatting

1. **Validate JSON**: Use [jsonlint.com](https://jsonlint.com) to check syntax
2. **Proper Commas**: Each product needs a comma after it (except the last one)
3. **Quotation Marks**: Always use double quotes for strings
4. **No Trailing Commas**: Don't add comma after the last product

### Image Management

1. **Organized Structure**: Keep images in category folders
2. **Descriptive Names**: Use clear file names (e.g., `blue-cotton-shirt.png`)
3. **Consistent Format**: Stick to JPG or PNG
4. **Optimize Size**: Compress images before uploading
5. **Backup Images**: Keep original high-res versions

### Inventory Management

1. **Track Stock**: Update `available` status regularly
2. **Seasonal Products**: Mark seasonal items appropriately
3. **Discontinued Items**: Remove or mark as unavailable
4. **New Arrivals**: Remember to unmark `isNew` after a few weeks

### SEO and Marketing

1. **Descriptive Names**: Include keywords in product names
2. **Benefits Over Features**: Focus on customer benefits
3. **Strategic Discounts**: Use discounts to highlight promotions
4. **Trending Tags**: Mark bestsellers as trending
5. **Fresh Content**: Regularly add new products

### Testing

After adding/editing products:

1. **Reload Website**: Clear cache and refresh
2. **Check Display**: Verify product appears correctly
3. **Test Cart**: Add to cart and checkout
4. **Mobile View**: Check on mobile devices
5. **Cross-Browser**: Test in different browsers

---

## Bulk Operations

### Adding Multiple Products

When adding many products at once:

1. **Create a template** with one product
2. **Duplicate the template** for each new product
3. **Update values** for each product
4. **Validate JSON** before saving
5. **Test in batches** (add 5-10 at a time)

### Product Import Tool (Future Enhancement)

Consider creating a spreadsheet-to-JSON converter:
- Manage products in Excel/Google Sheets
- Export to CSV
- Convert CSV to JSON format
- Import to products.json

---

## Troubleshooting

### Product Not Showing

- Check JSON syntax (no errors)
- Verify image path is correct
- Ensure category spelling is consistent
- Check if `isBanner` is correctly set to `false`

### Image Not Loading

- Verify file exists at specified path
- Check file extension matches (case-sensitive)
- Ensure image format is JPG or PNG
- Test image URL in browser

### Prices Not Displaying Correctly

- Use numbers only (no $ or currency symbols)
- Use dot for decimals (29.99, not 29,99)
- Check discount calculation

### Category Not Appearing

- Check spelling is consistent across all products
- Verify at least one non-banner product exists in category
- Refresh browser cache

---

## Maintenance Checklist

Regular maintenance tasks:

- [ ] Update out-of-stock products
- [ ] Remove old "NEW" tags
- [ ] Adjust trending products
- [ ] Update seasonal discounts
- [ ] Add new products
- [ ] Remove discontinued items
- [ ] Optimize images
- [ ] Update prices
- [ ] Backup products.json
- [ ] Test website functionality

---

**Ready to add products?** Start with a few test products, validate your JSON, and expand from there!
