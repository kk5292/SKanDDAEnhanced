document.addEventListener("DOMContentLoaded", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = document.getElementById("cart-count");
  if (cartCount) cartCount.textContent = cart.reduce((a,b)=>a+b.quantity,0);

  if (document.getElementById("home-products")) renderHomeProducts();
});

function renderHomeProducts() {
  fetch("products.json")
    .then(res => res.json())
    .then(data => {
      const section = document.getElementById("home-products");
      let html = "";
      data.forEach(category => {
        category.Subcategories.forEach(sub => {
          sub.Products.forEach(prod => {
            if (prod.Status === "In Stock") {
              html += `
              <div class="product-card in-stock">
                <img src="assets/${prod.ImageName}" alt="${prod.ProductName}">
                <div class="stock-overlay">In Stock</div>
                <h4>${prod.ProductName}</h4>
                <p>AED ${prod.Price.toFixed(2)}</p>
                <button class="add-cart" onclick='addToCart(${JSON.stringify(prod)})'>Add to Cart</button>
              </div>`;
            }
          });
        });
      });
      section.innerHTML = html;
    })
    .catch(err => {
      document.getElementById("home-products").innerHTML = "<p>Failed to load products. Please try again later.</p>";
      console.error(err);
    });
}

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(p => p.ProductName === product.ProductName);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`Added ${product.ProductName} to cart`);
  const cartCount = document.getElementById("cart-count");
  if (cartCount) cartCount.textContent = cart.reduce((a,b)=>a+b.quantity,0);
}
