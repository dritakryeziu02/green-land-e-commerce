const cartRaw = JSON.parse(localStorage.getItem("cart") || "[]");

function normalizeItem(it) {
  const title = it?.title ?? it?.name ?? "Unnamed item";
  const price = Number(it?.price ?? it?.amount ?? it?.cost ?? 0);
  const qty = Number(it?.qty ?? it?.quantity ?? 1);
  const thumb =
    it?.thumbnail ??
    it?.image ??
    it?.img ??
    (Array.isArray(it?.images) ? it.images[0] : "") ??
    "";
  return { title, price, qty, thumbnail: thumb };
}

let cart = cartRaw.map(normalizeItem);

const cartContainer = document.getElementById("cartList");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const cartCountEl = document.getElementById("cartCount");
const footerTotalEl = document.getElementById("footerTotal");
const shippingEl = document.getElementById("shipping");

const PLACEHOLDER = "img/no-image.jpg";

// Render cart items
function renderCart() {
  cartContainer.innerHTML = "";
  let subtotal = 0;
  let count = 0;

  if (!cart.length) {
    cartContainer.innerHTML = `<p class="empty">Your cart is empty</p>`;
  } else {
    cart.forEach((item, i) => {
      const line = (Number(item.price) || 0) * (Number(item.qty) || 0);
      subtotal += line;
      count += item.qty;

      cartContainer.innerHTML += `
        <div class="cart-item">
          <img src="${item.thumbnail || PLACEHOLDER}" alt="${item.title}">
          <div class="item-info">
            <div class="item-title">${item.title}</div>
            <div class="qty">
              <span>${item.qty}</span>
              <div class="v-arrows">
                <button aria-label="increase" onclick="updateQuantity(${i}, 1)">
                  <i class="fa-solid fa-chevron-up"></i>
                </button>
                <button aria-label="decrease" onclick="updateQuantity(${i}, -1)">
                  <i class="fa-solid fa-chevron-down"></i>
                </button>
              </div>
            </div>
            <div class="price">$${line.toFixed(2)}</div>
          </div>
          <button class="remove" title="Remove" onclick="removeItem(${i})">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `;
    });
  }

  const shipping = subtotal > 0 ? 4 : 0;

  cartCountEl.textContent = count;
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  shippingEl.textContent = `$${shipping.toFixed(2)}`;
  totalEl.textContent = `$${(subtotal + shipping).toFixed(2)}`;
  footerTotalEl.textContent = `$${(subtotal + shipping).toFixed(2)}`;

  localStorage.setItem("cart", JSON.stringify(cart));
}

window.updateQuantity = function (index, delta) {
  cart[index].qty = Math.max(0, (Number(cart[index].qty) || 0) + delta);
  if (cart[index].qty === 0) cart.splice(index, 1);
  renderCart();
};

window.removeItem = function (index) {
  cart.splice(index, 1);
  renderCart();
};

const nameInput = document.getElementById("nameOnCard");
const numberInput = document.getElementById("cardNumber");
const expInput = document.getElementById("exp");
const cvvInput = document.getElementById("cvv");
const form = document.getElementById("paymentForm");

// Form validation
function validate() {
  let ok = true;

  if (!/^[A-Za-z ]{2,}$/.test(nameInput.value.trim())) {
    nameInput.classList.add("invalid");
    ok = false;
  } else nameInput.classList.remove("invalid");

  if (!/^[0-9]{16}$/.test(numberInput.value.replace(/\s+/g, ""))) {
    numberInput.classList.add("invalid");
    ok = false;
  } else numberInput.classList.remove("invalid");

  const expVal = expInput.value.trim();
  const match = expVal.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) {
    expInput.classList.add("invalid");
    ok = false;
  } else {
    const mm = parseInt(match[1], 10);
    const yy = parseInt("20" + match[2], 10);
    const expDate = new Date(yy, mm - 1, 1);
    const now = new Date();

    if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
      expInput.classList.add("invalid");
      ok = false;
    } else {
      expInput.classList.remove("invalid");
    }
  }

  if (!/^[0-9]{3,4}$/.test(cvvInput.value.trim())) {
    cvvInput.classList.add("invalid");
    ok = false;
  } else cvvInput.classList.remove("invalid");

  return ok;
}

[nameInput, numberInput, expInput, cvvInput].forEach((inp) =>
  inp.addEventListener("input", validate)
);

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (cart.length === 0) {
    const errorModal = document.getElementById("errorModal");
    errorModal.style.display = "flex";

    setTimeout(() => {
      errorModal.style.display = "none";
    }, 2500);

    errorModal.addEventListener("click", () => {
      errorModal.style.display = "none";
    });

    return;
  }

  if (validate()) {
    cart = [];
    localStorage.removeItem("cart");
    renderCart();

    document.getElementById("successModal").style.display = "flex";

    setTimeout(() => {
      document.getElementById("successModal").style.display = "none";
    }, 2500);
  }
});

renderCart();
