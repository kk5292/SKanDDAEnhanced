// js/cart.js

// -------------------------------
// Global cart counter update
// -------------------------------
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalQty = cart.reduce((a, b) => a + (b.quantity || 0), 0);
    
    // Update all cart counters
    document.querySelectorAll("#cart-count-desktop, #cart-count-mobile, #cart-count-mobile-menu")
        .forEach(el => el.textContent = totalQty);
}

document.addEventListener("DOMContentLoaded", () => {
    const cartContainer = document.getElementById("cart-container");
    if (!cartContainer) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function generateOrderNumber() {
        const date = new Date();
        const datePart = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        return `SK-${datePart}-${randomPart}`;
    }

    function renderCart() {
        cartContainer.innerHTML = "";

        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <p style="
                    text-align: center;
                    color: #000;
                    font-size: 1.2rem;
                    font-weight: 600;
                    padding: 2rem;
                ">
                    Your cart is empty.
                </p>
            `;
            updateCartCount();
            return;
        }

        const header = document.createElement("div");
        header.className = "cart-header";
        header.innerHTML = `<div>Image</div><div>Product</div><div>Price</div><div>Quantity</div><div>Subtotal</div>`;
        cartContainer.appendChild(header);

        let total = 0;

        cart.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "cart-row";
            const subtotal = (item.price * item.quantity).toFixed(2);
            total += parseFloat(subtotal);

            row.innerHTML = `
                <div class="cart-img"><img src="assets/${item.image}" alt="${item.name}"></div>
                <div class="cart-name">${item.name} (${item.weight})</div>
                <div class="cart-price">AED ${item.price.toFixed(2)}</div>
                <div class="cart-quantity">
                    <button class="qty-decrease">-</button>
                    <input type="number" min="1" value="${item.quantity}">
                    <button class="qty-increase">+</button>
                    <button class="remove-btn">Remove</button>
                </div>
                <div class="cart-subtotal">AED ${subtotal}</div>
            `;

            const qtyInput = row.querySelector("input");

            row.querySelector(".qty-increase").addEventListener("click", () => {
                item.quantity++;
                qtyInput.value = item.quantity;
                localStorage.setItem("cart", JSON.stringify(cart));
                updateCartCount();
                renderCart();
            });

            row.querySelector(".qty-decrease").addEventListener("click", () => {
                if (item.quantity > 1) {
                    item.quantity--;
                    qtyInput.value = item.quantity;
                    localStorage.setItem("cart", JSON.stringify(cart));
                    updateCartCount();
                    renderCart();
                }
            });

            qtyInput.addEventListener("change", e => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1) val = 1;
                item.quantity = val;
                localStorage.setItem("cart", JSON.stringify(cart));
                updateCartCount();
                renderCart();
            });

            row.querySelector(".remove-btn").addEventListener("click", () => {
                cart.splice(index, 1);
                localStorage.setItem("cart", JSON.stringify(cart));
                updateCartCount();
                renderCart();
            });

            cartContainer.appendChild(row);
        });

        const totalDiv = document.createElement("div");
        totalDiv.id = "cart-total";
        totalDiv.textContent = `Total: AED ${total.toFixed(2)}`;
        cartContainer.appendChild(totalDiv);

        const checkoutForm = document.createElement("div");
        checkoutForm.id = "checkout-form";
        checkoutForm.innerHTML = `
            <h3>Checkout</h3>
            <form id="form-checkout">
                <label>Name: <input type="text" name="name" required></label>
                <label>Email: <input type="email" name="email" required></label>
                <label>Phone: <input type="text" name="phone" required></label>
                <label>Address: <textarea name="address" required></textarea></label>
                <label>Payment Method:
                    <select name="payment" required>
                        <option value="COD">Cash on Delivery (COD)</option>
                    </select>
                </label>
                <button type="submit">Place Order</button>
            </form>
        `;
        cartContainer.appendChild(checkoutForm);

        // ✅ Add readable styling dynamically
        const style = document.createElement("style");
        style.textContent = `
            #checkout-form label {
                color: #000 !important;
            }
            #checkout-form input,
            #checkout-form textarea,
            #checkout-form select {
                background: #fff;
                color: #000;
                border: 1px solid #ccc;
                border-radius: 6px;
                padding: 10px;
                transition: all 0.2s ease;
            }
            #checkout-form input:focus,
            #checkout-form textarea:focus,
            #checkout-form select:focus {
                border-color: #ff5b00;
                box-shadow: 0 0 6px rgba(255, 91, 0, 0.5);
                outline: none;
            }
            #checkout-form button[type="submit"] {
                background: #ff5b00;
                border: none;
                border-radius: 8px;
                color: #fff;
                font-size: 1.1rem;
                font-weight: 600;
                padding: 14px;
                margin-top: 20px;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            #checkout-form button[type="submit"]:hover {
                background: #e04d00;
            }
        `;
        document.head.appendChild(style);

        const form = document.getElementById("form-checkout");
        form.addEventListener("submit", e => {
            e.preventDefault();
            const orderNumber = generateOrderNumber();
            let summary = `Order #${orderNumber} placed successfully!\n\nProducts:\n`;
            cart.forEach(item => {
                summary += `- ${item.name} (${item.weight}) x${item.quantity} = AED ${(item.price * item.quantity).toFixed(2)}\n`;
            });
            summary += `\nTotal: AED ${total.toFixed(2)}\nPayment: ${form.payment.value}`;

            alert(summary);

            // Clear cart
            localStorage.removeItem("cart");
            cart = [];
            updateCartCount();
            renderCart();
            form.reset();
        });
    }

    updateCartCount();
    renderCart();
});
