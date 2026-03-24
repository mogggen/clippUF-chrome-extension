const MOCK_COUPONS = [
  { code: "FAMILY20", discount: "20%", description: "Mode för hela familjen", expires: "2025-03-15" },
  { code: "VÅRREA10", discount: "10%", description: "Vårkampanj på allt", expires: "2025-04-01" },
];

let selectedCode = null;

function init() {
  detectStore();
  renderCoupons();
  setupAddSection();
}

function detectStore() {
  const nameEl = document.getElementById("storeName");
  const statusEl = document.getElementById("storeStatus");
  const indicator = document.getElementById("storeIndicator");

  // Try to detect store from active tab
  if (typeof chrome !== "undefined" && chrome.tabs) {
    indicator.className = "store-indicator loading";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || "";
      let store = null;
      try {
        const hostname = new URL(url).hostname.replace("www.", "");
        store = hostname.split(".")[0];
        store = store.charAt(0).toUpperCase() + store.slice(1);
      } catch (e) {}

      if (store) {
        nameEl.textContent = store;
        statusEl.textContent = "Butik identifierad";
        indicator.className = "store-indicator detected";
      } else {
        nameEl.textContent = "Okänd sida";
        statusEl.textContent = "Ingen butik hittades";
        indicator.className = "store-indicator";
      }
    });
  } else {
    // Fallback for non-extension context
    nameEl.textContent = "H&M";
    statusEl.textContent = "Butik identifierad";
    indicator.className = "store-indicator detected";
  }
}

function renderCoupons() {
  const list = document.getElementById("couponList");
  list.innerHTML = "";

  MOCK_COUPONS.forEach((c) => {
    const card = document.createElement("button");
    card.className = "coupon-card" + (selectedCode === c.code ? " selected" : "");
    card.innerHTML = `
      <p class="coupon-desc">${c.description}</p>
      <div class="coupon-meta">
        <span class="coupon-discount">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
          ${c.discount}
        </span>
        <code class="coupon-code">${c.code}</code>
        <svg class="coupon-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </div>
      <p class="coupon-expires">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
        Gäller till ${c.expires}
      </p>
    `;
    card.addEventListener("click", () => {
      selectedCode = c.code;
      renderCoupons();
      updateApplyBtn();
    });
    list.appendChild(card);
  });
}

function updateApplyBtn() {
  const btn = document.getElementById("applyBtn");
  const text = document.getElementById("applyBtnText");
  btn.disabled = !selectedCode;
  text.textContent = selectedCode ? `Tillämpa ${selectedCode}` : "Välj en rabattkod";
}

function setupAddSection() {
  const toggle = document.getElementById("addToggle");
  const form = document.getElementById("addForm");
  const codeInput = document.getElementById("newCode");
  const addBtn = document.getElementById("addBtn");

  toggle.addEventListener("click", () => {
    toggle.classList.add("hidden");
    form.classList.remove("hidden");
    codeInput.focus();
  });

  codeInput.addEventListener("input", () => {
    addBtn.disabled = !codeInput.value.trim();
  });

  addBtn.addEventListener("click", () => {
    const desc = document.getElementById("newDesc").value || codeInput.value;
    MOCK_COUPONS.push({
      code: codeInput.value.trim().toUpperCase(),
      discount: "?%",
      description: desc,
      expires: "—",
    });
    codeInput.value = "";
    document.getElementById("newDesc").value = "";
    addBtn.disabled = true;
    renderCoupons();
  });
}

document.addEventListener("DOMContentLoaded", init);
