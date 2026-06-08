const categoriesBar = document.getElementById("categoriesBar");
const productsGrid = document.getElementById("productsGrid");

// API
const API_ALL = "https://dummyjson.com/products";
const API_CATS = "https://dummyjson.com/products/categories";
const API_BY_CAT = (cat) =>
  `https://dummyjson.com/products/category/${encodeURIComponent(cat)}`;

// Cart state
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
const saveCart = () => localStorage.setItem("cart", JSON.stringify(cart));

function updateCartCount() {
  let total = 0;
  cart.forEach((item) => (total += item.qty));
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) cartCountEl.textContent = total;
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Load categries
async function loadCategories() {
  try {
    const res = await fetch(API_CATS);
    const cats = await res.json();
    renderCategories(cats);
  } catch (e) {
    console.error("Error loading categories:", e);
    categoriesBar.innerHTML = `<p style="opacity:.7">Nuk u ngarkuan kategoritë.</p>`;
  }
}

// Load products
async function loadProducts(category = "all") {
  try {
    const url = category === "all" ? API_ALL : API_BY_CAT(category);
    const res = await fetch(url);
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.products || [];
    renderProducts(list);
  } catch (e) {
    console.error("Error loading products:", e);
    productsGrid.innerHTML = `<p style="opacity:.7">Nuk u ngarkuan produktet.</p>`;
  }
}

// Render categories
function renderCategories(cats) {
  categoriesBar.innerHTML = "";

  const all = document.createElement("button");
  all.className = "chip active";
  all.dataset.cat = "all";
  all.textContent = "All";
  categoriesBar.appendChild(all);

  cats.forEach((c) => {
    const name = typeof c === "string" ? c : c.name || c.slug;
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.dataset.cat = name;
    btn.textContent = capitalize(name.replaceAll("-", " "));
    categoriesBar.appendChild(btn);
  });

  // Category filter events
  categoriesBar.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      categoriesBar
        .querySelectorAll(".chip")
        .forEach((x) => x.classList.remove("active"));
      chip.classList.add("active");
      loadProducts(chip.dataset.cat);
    });
  });
}

// Render products
function renderProducts(products) {
  productsGrid.innerHTML = "";
  if (!products.length) {
    productsGrid.innerHTML = `<p style="opacity:.7">Nuk u gjetën produkte.</p>`;
    return;
  }

  products.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <figure class="card-figure">
        <img src="${p.thumbnail}" alt="${p.title}">
      </figure>

      <div class="card-body">
        <h4 class="card-title">${p.title}</h4>
        <p class="card-desc">${(p.description || "").slice(0, 60)}${
      (p.description || "").length > 60 ? "…" : ""
    }</p>
      </div>

      <div class="card-foot">
        <span class="price-tag">${p.price}$</span>
        <button class="btn-add" type="button">Add to Cart</button>
        <button class="fav" type="button" title="Save"><i class="fa-solid fa-heart"></i></button>
      </div>
    `;

    // Add to cart
    card.querySelector(".btn-add").addEventListener("click", () => {
      const found = cart.find((i) => i.id === p.id);
      if (found) found.qty += 1;
      else
        cart.push({
          id: p.id,
          title: p.title,
          price: p.price,
          thumbnail: p.thumbnail,
          qty: 1,
        });
      saveCart();
      updateCartCount();

      card.querySelector(".btn-add").textContent = "Added";
      setTimeout(
        () => (card.querySelector(".btn-add").textContent = "Add to Cart"),
        900
      );
    });

    updateCartCount();

    card.querySelector(".fav").addEventListener("click", (e) => {
      e.currentTarget.classList.toggle("active");
    });

    productsGrid.appendChild(card);
  });
}

updateCartCount();
loadCategories();
loadProducts("all");
