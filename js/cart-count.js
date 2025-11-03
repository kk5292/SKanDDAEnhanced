document.addEventListener("DOMContentLoaded", () => {
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((a, b) => a + b.quantity, 0);
    document.querySelectorAll("#cart-count").forEach(el => el.textContent = total);
  };
  updateCartCount();
});
