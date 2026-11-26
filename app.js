import { seedSellers, seedProducts, seedZones, categories, deliveryLabels } from "./data.js";

const STORAGE_KEYS = {
  users: "antojolocal.users.v1",
  products: "antojolocal.products.v1",
  orders: "antojolocal.orders.v1",
  session: "antojolocal.session.v1"
};
const DEFAULT_ZONE = "Centro";
const DEFAULT_COORDINATES = { latitude: 19.4326, longitude: -99.1332 };
const CURRENCY = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const WEATHER_ICONS = {
  clear: "☀",
  cloudy: "☁",
  rain: "🌧",
  snow: "❄",
  storm: "⛈",
  unknown: "⌖"
};
const WEATHER_CODES = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Neblina",
  48: "Neblina",
  51: "Llovizna",
  53: "Llovizna",
  55: "Llovizna intensa",
  56: "Llovizna helada",
  57: "Llovizna helada",
  61: "Lluvia ligera",
  63: "Lluvia",
  65: "Lluvia intensa",
  66: "Lluvia helada",
  67: "Lluvia helada intensa",
  71: "Nevada ligera",
  73: "Nevada",
  75: "Nevada intensa",
  77: "Granizo pequeño",
  80: "Chubascos ligeros",
  81: "Chubascos",
  82: "Chubascos intensos",
  85: "Chubascos de nieve",
  86: "Nevada intensa",
  95: "Tormenta",
  96: "Tormenta con granizo",
  99: "Tormenta fuerte con granizo"
};
const WEATHER_FALLBACKS = {
  "centro": { temperature: 22, description: "Despejado" },
  "san mateo": { temperature: 21, description: "Parcialmente nublado" },
  "las vegas": { temperature: 24, description: "Despejado" },
  "el carmen": { temperature: 23, description: "Despejado" }
};
const FALLBACK_CALLING_CODES = [
  { code: "+52", flag: "🇲🇽", countryName: "México" },
  { code: "+1", flag: "🇺🇸", countryName: "Estados Unidos / Canadá" },
  { code: "+54", flag: "🇦🇷", countryName: "Argentina" },
  { code: "+55", flag: "🇧🇷", countryName: "Brasil" },
  { code: "+56", flag: "🇨🇱", countryName: "Chile" },
  { code: "+57", flag: "🇨🇴", countryName: "Colombia" },
  { code: "+34", flag: "🇪🇸", countryName: "España" },
  { code: "+502", flag: "🇬🇹", countryName: "Guatemala" },
  { code: "+503", flag: "🇸🇻", countryName: "El Salvador" },
  { code: "+504", flag: "🇭🇳", countryName: "Honduras" },
  { code: "+505", flag: "🇳🇮", countryName: "Nicaragua" },
  { code: "+506", flag: "🇨🇷", countryName: "Costa Rica" },
  { code: "+507", flag: "🇵🇦", countryName: "Panamá" },
  { code: "+51", flag: "🇵🇪", countryName: "Perú" },
  { code: "+58", flag: "🇻🇪", countryName: "Venezuela" }
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const elements = {
  accountButton: $("#account-button"),
  currentZone: $("#current-zone"),
  zoneOptions: $("#zone-options"),
  weatherBadge: $("#weather-badge"),
  weatherText: $("#weather-text"),
  search: $("#search-input"),
  category: $("#category-filter"),
  delivery: $("#delivery-filter"),
  grid: $("#product-grid"),
  emptyState: $("#empty-state"),
  resultsCount: $("#results-count"),
  gridViewButton: $("#grid-view-button"),
  mapViewButton: $("#map-view-button"),
  map: $("#catalog-map"),
  sellerCta: $("#seller-cta"),
  dashboard: $("#seller-dashboard"),
  sellerList: $("#seller-list"),
  sellerAvailability: $("#seller-availability"),
  sellerStatusLabel: $("#seller-status-label"),
  sellerProfileForm: $("#seller-profile-form"),
  sellerProfileName: $("#seller-profile-name"),
  sellerProfileBadge: $("#seller-profile-badge"),
  profilePhoneCode: $("#profile-phone-code"),
  profilePhoneNumber: $("#profile-phone-number"),
  profilePhoneMessage: $("#profile-phone-message"),
  authDialog: $("#auth-dialog"),
  loginTab: $("#login-tab"),
  registerTab: $("#register-tab"),
  loginForm: $("#login-panel"),
  registerForm: $("#register-panel"),
  loginMessage: $("#login-message"),
  registerMessage: $("#register-message"),
  otpStep: $("#otp-step"),
  otpForm: $("#otp-form"),
  otpCode: $("#otp-code"),
  otpNotice: $("#otp-notice"),
  otpMessage: $("#otp-message"),
  otpResendButton: $("#otp-resend-button"),
  otpBackButton: $("#otp-back-button"),
  callingCode: $("#calling-code"),
  detailDialog: $("#detail-dialog"),
  detailContent: $("#detail-content"),
  checkoutDialog: $("#checkout-dialog"),
  checkoutForm: $("#checkout-form"),
  checkoutSummary: $("#checkout-summary"),
  checkoutMessage: $("#checkout-message"),
  cardPaymentFields: $("#card-payment-fields"),
  speiPaymentFields: $("#spei-payment-fields"),
  walletPaymentFields: $("#wallet-payment-fields"),
  speiReference: $("#spei-reference"),
  ordersButton: $("#my-orders-button"),
  ordersDialog: $("#orders-dialog"),
  ordersList: $("#orders-list"),
  productDialog: $("#product-dialog"),
  productForm: $("#product-form"),
  productMessage: $("#product-message"),
  smsDialog: $("#sms-dialog"),
  smsPhoneValue: $("#sms-phone-value"),
  smsMessageValue: $("#sms-message-value"),
  smsWhatsAppLink: $("#sms-whatsapp-link"),
  localFields: $("#local-fields"),
  menuItems: $("#menu-items"),
  infoDialog: $("#info-dialog"),
  projectRepo: $("#project-repo"),
  toast: $("#toast")
};

let users = loadCollection(STORAGE_KEYS.users, seedSellers);
let products = loadCollection(STORAGE_KEYS.products, seedProducts);
let orders = loadCollection(STORAGE_KEYS.orders, []);
let currentUser = readSession();
let pendingRegistration = null;
let emailJsReady = false;
let otpSendInProgress = false;
let otpSendRequestId = 0;
let otpResendAvailableAt = 0;
let otpResendInterval = 0;
let currentCheckoutProductId = null;
let activeView = "grid";
let catalogMap = null;
let registrationMap = null;
let productMap = null;
let detailMap = null;
let catalogMarkers = [];
let toastTimer = 0;
let weatherRequestNumber = 0;
let weatherRequestController = null;
let callingCodeOptions = FALLBACK_CALLING_CODES;
const registrationMarker = { current: null };
const productMarker = { current: null };

try {
  if (globalThis.emailjs && typeof globalThis.emailjs.init === "function") {
    emailjs.init("vAXF5XpX15JvdzGUx");
    emailJsReady = true;
  }
} catch {
  emailJsReady = false;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hasCoordinates(point) {
  return Boolean(point && point.latitude !== null && point.latitude !== "" &&
    point.longitude !== null && point.longitude !== "" &&
    Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude)));
}

function loadCollection(key, defaults) {
  const saved = localStorage.getItem(key);
  if (saved === null) {
    const initial = clone(defaults);
    try {
      localStorage.setItem(key, JSON.stringify(initial));
    } catch (error) {
      console.error(`No se pudo guardar ${key} en el almacenamiento local.`, error);
    }
    return initial;
  }
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new TypeError("El contenido guardado no es una lista.");
    }
    return parsed;
  } catch (error) {
    console.error(`No se pudieron leer los datos guardados (${key}). Se restaurarán los datos de ejemplo.`, error);
    const initial = clone(defaults);
    try {
      localStorage.setItem(key, JSON.stringify(initial));
    } catch (storageError) {
      console.error(`No se pudo restaurar ${key} en el almacenamiento local.`, storageError);
    }
    return initial;
  }
}

function readSession() {
  const saved = localStorage.getItem(STORAGE_KEYS.session);
  if (!saved) return null;
  try {
    const session = JSON.parse(saved);
    return users.find(user => user.id === session.userId) || null;
  } catch (error) {
    console.error("No se pudo recuperar la sesión guardada.", error);
    return null;
  }
}

function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`No se pudieron guardar los cambios en ${key}.`, error);
    showToast("No se pudieron guardar los cambios. Revisa el almacenamiento disponible.");
    return false;
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function makeId(prefix) {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 3300);
}

function currentZone() {
  return elements.currentZone.value.trim() || DEFAULT_ZONE;
}

function normalized(value) {
  return String(value ?? "").trim().toLocaleLowerCase("es-MX");
}

function getCoordinates(zone = currentZone(), preferredCoordinates = null) {
  if (hasCoordinates(preferredCoordinates)) {
    return {
      latitude: Number(preferredCoordinates.latitude),
      longitude: Number(preferredCoordinates.longitude)
    };
  }
  const normalizedZone = normalized(zone);
  if (seedZones[zone]) return seedZones[zone];
  const zoneOwner = users.find(user => normalized(user.zone) === normalizedZone && hasCoordinates(user));
  if (zoneOwner) return { latitude: Number(zoneOwner.latitude), longitude: Number(zoneOwner.longitude) };
  const zoneProduct = products.find(product => normalized(product.zone) === normalizedZone && hasCoordinates(product));
  if (zoneProduct) return { latitude: Number(zoneProduct.latitude), longitude: Number(zoneProduct.longitude) };
  return DEFAULT_COORDINATES;
}

function getZoneCoordinates(zone) {
  const key = Object.keys(seedZones).find(name => normalized(name) === normalized(zone));
  if (key) return seedZones[key];
  const zoneOwner = users.find(user => normalized(user.zone) === normalized(zone) && hasCoordinates(user));
  if (zoneOwner) return { latitude: Number(zoneOwner.latitude), longitude: Number(zoneOwner.longitude) };
  const zoneProduct = products.find(product => normalized(product.zone) === normalized(zone) && hasCoordinates(product));
  return zoneProduct ? { latitude: Number(zoneProduct.latitude), longitude: Number(zoneProduct.longitude) } : null;
}

function distanceBetweenZones(fromZone, toZone) {
  const from = getZoneCoordinates(fromZone);
  const to = getZoneCoordinates(toZone);
  if (!from || !to) return null;
  const radians = degrees => degrees * Math.PI / 180;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const value = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) *
    Math.sin(longitudeDelta / 2) ** 2;
  const clampedValue = Math.min(1, Math.max(0, value));
  return 6371 * 2 * Math.atan2(Math.sqrt(clampedValue), Math.sqrt(1 - clampedValue));
}

function deliveryRadius(product) {
  const radius = Number(product.deliveryRadiusKm);
  return [2, 5, 8, 12, 15].includes(radius) ? radius : 5;
}

function productDistance(product) {
  const seller = sellerFor(product);
  return distanceBetweenZones(seller && seller.zone || product.zone, currentZone());
}

function productOffersDelivery(product) {
  return ["delivery", "both"].includes(product.delivery);
}

function updateZoneOptions() {
  const zones = new Set([
    ...Object.keys(seedZones),
    ...users.map(user => user.zone),
    ...products.map(product => product.zone)
  ].filter(Boolean));
  const selectedZone = currentZone();
  zones.add(selectedZone);
  elements.zoneOptions.innerHTML = Array.from(zones)
    .sort((left, right) => left.localeCompare(right, "es-MX"))
    .map(zone => `<option value="${escapeHtml(zone)}"></option>`)
    .join("");
}

function sellerFor(product) {
  return users.find(user => user.id === product.sellerId) || null;
}

function sellerIsAvailable(seller) {
  return !seller || seller.available !== false;
}

function deliveryText(delivery) {
  return deliveryLabels[delivery] || "Entrega por confirmar";
}

function productPrice(product) {
  return CURRENCY.format(Number(product.price) || 0);
}

function matchingProducts() {
  const zone = normalized(currentZone());
  const query = normalized(elements.search.value);
  const category = elements.category.value;
  const delivery = elements.delivery.value;
  return products.filter(product => {
    const inZone = normalized(product.zone) === zone;
    if (!inZone && !productOffersDelivery(product)) return false;
    if (category && product.category !== category) return false;
    if (delivery === "local" && (!["local", "both"].includes(product.delivery) || !inZone)) return false;
    if (delivery === "delivery" && !productOffersDelivery(product)) return false;
    if (query) {
      const seller = sellerFor(product);
      const searchable = [
        product.name, product.category, product.description, product.zone,
        seller && seller.name, ...(Array.isArray(product.menu) ? product.menu.map(item => item.name) : [])
      ].join(" ");
      if (!normalized(searchable).includes(query)) return false;
    }
    return true;
  });
}

function renderCatalog() {
  updateZoneOptions();
  const matches = matchingProducts();
  elements.resultsCount.textContent = `${matches.length} ${matches.length === 1 ? "antojo" : "antojos"} en ${currentZone()}`;
  elements.grid.innerHTML = matches.map(product => {
    const seller = sellerFor(product);
    const available = sellerIsAvailable(seller);
    const sellerName = seller ? seller.name : "Vendedor local";
    const emoji = product.emoji || "🍽️";
    const tone = product.imageTone || "image-orange";
    const distance = productDistance(product);
    const deliverySummary = productOffersDelivery(product)
      ? `Entrega hasta ${deliveryRadius(product)} km · ${distance === null ? "Distancia no disponible" : `A ${distance.toFixed(1)} km de ti`}`
      : "Para recoger";
    const verifiedBadge = seller && seller.verified ? '<span class="verified-badge" aria-label="Perfil verificado" title="Perfil verificado">Perfil verificado ✓</span>' : "";
    return `
      <article class="product-card">
        <div class="product-image ${escapeHtml(tone)}">
          <span class="food-emoji" aria-hidden="true">${escapeHtml(emoji)}</span>
          <span class="product-tag">${escapeHtml(product.category || "Antojito")}</span>
          <span class="product-status ${available ? "" : "is-closed"}">${available ? "Disponible" : "Cerrado"}</span>
        </div>
        <div class="product-card-body">
          <div class="product-card-title-line">
            <h3>${escapeHtml(product.name)}</h3><span class="product-price">${escapeHtml(productPrice(product))}</span>
          </div>
          <p class="product-card-description">${escapeHtml(product.description)}</p>
          <div class="product-card-meta"><span>⌖ ${escapeHtml(product.zone)}</span><span>${escapeHtml(deliverySummary)}</span></div>
          <div class="product-card-footer">
            <span class="seller-byline"><span class="seller-avatar">${escapeHtml(initials(sellerName))}</span>${escapeHtml(sellerName)}${verifiedBadge}</span>
            <button class="detail-link" type="button" data-detail-id="${escapeHtml(product.id)}">Ver detalle <span aria-hidden="true">→</span></button>
          </div>
        </div>
      </article>`;
  }).join("");
  elements.emptyState.hidden = matches.length > 0;
  elements.grid.hidden = activeView !== "grid" || matches.length === 0;
  elements.map.hidden = activeView !== "map";
  if (activeView === "map") {
    ensureCatalogMap();
    window.setTimeout(() => refreshCatalogMap(matches), 80);
  }
}

function initials(name) {
  return String(name || "?").trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toLocaleUpperCase("es-MX");
}

function setActiveView(view) {
  activeView = view;
  const isGrid = view === "grid";
  elements.gridViewButton.classList.toggle("is-active", isGrid);
  elements.gridViewButton.setAttribute("aria-pressed", String(isGrid));
  elements.mapViewButton.classList.toggle("is-active", !isGrid);
  elements.mapViewButton.setAttribute("aria-pressed", String(!isGrid));
  renderCatalog();
}

function hasLeaflet() {
  return typeof window.L !== "undefined";
}

function makeMap(container, center, zoom = 13) {
  if (!hasLeaflet()) {
    container.innerHTML = '<div class="map-fallback">No se pudo cargar el mapa. Revisa tu conexión a internet e inténtalo de nuevo.</div>';
    return null;
  }
  const map = window.L.map(container, { scrollWheelZoom: false }).setView([center.latitude, center.longitude], zoom);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
  }).addTo(map);
  return map;
}

function ensureCatalogMap() {
  if (!catalogMap) {
    catalogMap = makeMap(elements.map, getCoordinates());
    if (catalogMap) {
      elements.map.addEventListener("click", event => {
        const detailButton = event.target.closest("[data-detail-id]");
        if (detailButton) openProductDetail(detailButton.dataset.detailId);
      });
    }
  }
  if (catalogMap) {
    catalogMap.setView([getCoordinates().latitude, getCoordinates().longitude], 13);
    window.setTimeout(() => catalogMap && catalogMap.invalidateSize(), 50);
  }
}

function refreshCatalogMap(matches = matchingProducts()) {
  if (!catalogMap) return;
  catalogMarkers.forEach(marker => catalogMap.removeLayer(marker));
  catalogMarkers = [];
  const localProducts = matches.filter(product =>
    ["local", "both"].includes(product.delivery) &&
    hasCoordinates(product) &&
    sellerIsAvailable(sellerFor(product))
  );
  localProducts.forEach(product => {
    const seller = sellerFor(product);
    const markerIcon = window.L.divIcon({
      className: "custom-food-marker",
      html: `<span aria-hidden="true">${escapeHtml(product.emoji || "🍽️")}</span>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });
    const marker = window.L.marker([Number(product.latitude), Number(product.longitude)], { icon: markerIcon });
    const popup = `<strong>${escapeHtml(product.name)}</strong><br>${escapeHtml(seller ? seller.name : "Vendedor local")}<br><button class="map-popup-button" type="button" data-detail-id="${escapeHtml(product.id)}">Ver detalle</button>`;
    marker.bindPopup(popup).addTo(catalogMap);
    catalogMarkers.push(marker);
  });
  if (catalogMarkers.length > 0) {
    const group = window.L.featureGroup(catalogMarkers);
    catalogMap.fitBounds(group.getBounds().pad(0.18), { maxZoom: 15 });
  }
}

function setWeatherIcon(icon) {
  const iconElement = $("#weather-badge > span:first-child");
  if (iconElement) iconElement.textContent = icon;
}

function weatherIcon(code) {
  if (code === 0 || code === 1) return WEATHER_ICONS.clear;
  if ([2, 3, 45, 48].includes(code)) return WEATHER_ICONS.cloudy;
  if (code >= 51 && code <= 67 || code >= 80 && code <= 82) return WEATHER_ICONS.rain;
  if (code >= 71 && code <= 77 || code === 85 || code === 86) return WEATHER_ICONS.snow;
  if (code >= 95) return WEATHER_ICONS.storm;
  return WEATHER_ICONS.unknown;
}

async function updateWeather() {
  const requestNumber = ++weatherRequestNumber;
  const zone = currentZone();
  const coordinates = getCoordinates(zone);
  const fallback = WEATHER_FALLBACKS[normalized(zone)] || { temperature: 22, description: "Despejado" };
  if (weatherRequestController) weatherRequestController.abort();
  const controller = new AbortController();
  weatherRequestController = controller;
  const timeoutId = window.setTimeout(() => controller.abort(), 4000);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&current_weather=true`;
  elements.weatherText.textContent = `${fallback.temperature}°C · ${fallback.description} en ${zone}`;
  setWeatherIcon(weatherIcon(fallback.description === "Despejado" ? 0 : 2));
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Open-Meteo respondió ${response.status}.`);
    const data = await response.json();
    if (requestNumber !== weatherRequestNumber) return;
    if (!data || !data.current_weather ||
      data.current_weather.temperature === null || data.current_weather.temperature === undefined ||
      data.current_weather.weathercode === null || data.current_weather.weathercode === undefined) {
      throw new Error("Open-Meteo no devolvió los datos actuales del clima.");
    }
    const temperature = Number(data.current_weather.temperature);
    const weatherCode = Number(data.current_weather.weathercode);
    if (!Number.isFinite(temperature) || !Number.isFinite(weatherCode)) {
      throw new Error("Open-Meteo no devolvió los datos actuales del clima.");
    }
    elements.weatherText.textContent = `${Math.round(temperature)}°C · ${WEATHER_CODES[weatherCode] || fallback.description} en ${zone}`;
    setWeatherIcon(weatherIcon(weatherCode));
  } catch {
    if (requestNumber === weatherRequestNumber) {
      elements.weatherText.textContent = `${fallback.temperature}°C · ${fallback.description} en ${zone}`;
      setWeatherIcon(weatherIcon(fallback.description === "Despejado" ? 0 : 2));
    }
  } finally {
    window.clearTimeout(timeoutId);
    if (requestNumber === weatherRequestNumber) weatherRequestController = null;
  }
}

function openDialog(dialog) {
  if (!dialog.open) dialog.showModal();
}

function openAuth(mode = "login") {
  setAuthMode(mode);
  elements.loginMessage.textContent = "";
  elements.registerMessage.textContent = "";
  openDialog(elements.authDialog);
  if (mode === "register") {
    loadCallingCodes();
    window.setTimeout(initializeRegistrationMap, 100);
  }
}

function setAuthMode(mode) {
  const register = mode === "register";
  pendingRegistration = null;
  resetOtpResendCooldown();
  elements.otpStep.hidden = true;
  $(".auth-tabs").hidden = false;
  elements.otpForm.reset();
  elements.otpMessage.textContent = "";
  elements.loginTab.classList.toggle("is-active", !register);
  elements.registerTab.classList.toggle("is-active", register);
  elements.loginTab.setAttribute("aria-selected", String(!register));
  elements.registerTab.setAttribute("aria-selected", String(register));
  elements.loginForm.hidden = register;
  elements.registerForm.hidden = !register;
  if (register) {
    loadCallingCodes();
    window.setTimeout(initializeRegistrationMap, 100);
  }
}

function populateCallingCodeSelect(select, options, selectedCode = "+52") {
  const sorted = [...options].sort((left, right) => {
    if (left.code === "+52") return -1;
    if (right.code === "+52") return 1;
    return left.countryName.localeCompare(right.countryName, "es-MX") || left.code.localeCompare(right.code);
  });
  select.innerHTML = sorted.map(entry =>
    `<option value="${escapeHtml(entry.code)}">${escapeHtml(entry.flag)} ${escapeHtml(entry.code)}</option>`
  ).join("");
  select.value = sorted.some(entry => entry.code === selectedCode) ? selectedCode : "+52";
}

function setCallingCodeOptions(options) {
  callingCodeOptions = options;
  [elements.profilePhoneCode, elements.productForm.elements.orderPhoneCode].forEach(select => {
    populateCallingCodeSelect(select, options, select.value || "+52");
  });
  if (currentUser && currentUser.role === "seller") {
    setSellerPhoneFields(elements.profilePhoneCode, elements.profilePhoneNumber);
    setSellerPhoneFields(elements.productForm.elements.orderPhoneCode, elements.productForm.elements.orderPhone);
  }
}

function setSellerPhoneFields(codeSelect, phoneInput) {
  if (!currentUser) return;
  const savedPhone = String(currentUser.phone || "");
  const digits = savedPhone.replace(/\D/g, "");
  const codeOptions = [...callingCodeOptions].sort((left, right) => right.code.length - left.code.length);
  const knownCode = codeOptions.find(entry => digits.startsWith(entry.code.replace(/\D/g, "")));
  const explicitCode = /^\s*\+(\d{1,4})/.exec(savedPhone);
  const code = knownCode ? knownCode.code : explicitCode ? `+${explicitCode[1]}` : "+52";
  if (!Array.from(codeSelect.options).some(option => option.value === code)) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `🌐 ${code}`;
    codeSelect.add(option);
  }
  codeSelect.value = code;
  const prefixDigits = code.replace(/\D/g, "");
  phoneInput.value = digits.startsWith(prefixDigits) ? digits.slice(prefixDigits.length) : digits;
}

function phoneFromFields(codeSelect, phoneInput) {
  const code = String(codeSelect.value || "+52").trim();
  const codeDigits = code.replace(/\D/g, "");
  const rawPhone = String(phoneInput.value || "").trim();
  if (!/^\+\d{1,4}$/.test(code) || !codeDigits) {
    throw new Error("Selecciona una lada telefónica válida.");
  }
  let localDigits = rawPhone.replace(/\D/g, "");
  const explicitPrefix = /^\s*\+/.test(rawPhone) || new RegExp(`^\\s*${codeDigits}[\\s-]`).test(rawPhone);
  if (explicitPrefix && localDigits.startsWith(codeDigits)) {
    localDigits = localDigits.slice(codeDigits.length);
  }
  if (localDigits.length < 7 || codeDigits.length + localDigits.length > 15) {
    throw new Error("Escribe un teléfono válido de 7 a 15 dígitos.");
  }
  return `+${codeDigits}${localDigits}`;
}

function persistBatch(entries) {
  const previous = entries.map(([key]) => [key, localStorage.getItem(key)]);
  try {
    entries.forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
    return true;
  } catch (error) {
    console.error("No se pudieron guardar los cambios del vendedor en el almacenamiento local.", error);
    previous.forEach(([key, value]) => {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch (restoreError) {
        console.error(`No se pudo restaurar el valor anterior de ${key}.`, restoreError);
      }
    });
    showToast("No se pudieron guardar los cambios. Revisa el almacenamiento disponible.");
    return false;
  }
}

function submitSellerProfile(event) {
  event.preventDefault();
  if (!currentUser || currentUser.role !== "seller") return;
  elements.profilePhoneMessage.textContent = "";
  let phone;
  try {
    phone = phoneFromFields(elements.profilePhoneCode, elements.profilePhoneNumber);
  } catch (error) {
    elements.profilePhoneMessage.textContent = error.message;
    return;
  }
  const updatedUsers = users.map(user => user.id === currentUser.id ? { ...user, phone } : user);
  if (!persistBatch([[STORAGE_KEYS.users, updatedUsers]])) {
    elements.profilePhoneMessage.textContent = "No se pudo guardar el teléfono. Inténtalo de nuevo.";
    return;
  }
  users = updatedUsers;
  currentUser = users.find(user => user.id === currentUser.id);
  setSellerPhoneFields(elements.profilePhoneCode, elements.profilePhoneNumber);
  setSellerPhoneFields(elements.productForm.elements.orderPhoneCode, elements.productForm.elements.orderPhone);
  elements.profilePhoneMessage.textContent = "Teléfono actualizado para todas tus publicaciones.";
  showToast("Teléfono para pedidos actualizado.");
}

function updateAccountUI() {
  if (!currentUser) {
    elements.accountButton.textContent = "Ingresar";
    elements.accountButton.removeAttribute("aria-label");
    elements.dashboard.hidden = true;
    const cta = $(".seller-callout");
    if (cta) cta.hidden = false;
    return;
  }
  elements.accountButton.textContent = "Cerrar sesión";
  elements.accountButton.setAttribute("aria-label", `Cerrar sesión de ${currentUser.name}`);
  const isSeller = currentUser.role === "seller";
  elements.dashboard.hidden = !isSeller;
  if (isSeller) {
    elements.sellerProfileName.textContent = currentUser.name;
    elements.sellerProfileBadge.hidden = !currentUser.verified;
    elements.sellerAvailability.checked = currentUser.available !== false;
    setSellerPhoneFields(elements.profilePhoneCode, elements.profilePhoneNumber);
    setSellerPhoneFields(elements.productForm.elements.orderPhoneCode, elements.productForm.elements.orderPhone);
    renderSellerProducts();
  }
  const cta = $(".seller-callout");
  if (cta) cta.hidden = isSeller;
}

function authenticate(identity, password) {
  const sought = normalized(identity);
  return users.find(user =>
    [user.identity, user.email, user.username].some(value => normalized(value) === sought) &&
    user.password === password
  ) || null;
}

function startSession(user) {
  currentUser = user;
  if (user.zone) elements.currentZone.value = user.zone;
  persist(STORAGE_KEYS.session, { userId: user.id });
  updateAccountUI();
  renderCatalog();
  updateWeather();
  closeDialog(elements.authDialog);
  showToast(`¡Hola, ${user.name}!`);
}

function signOut() {
  currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.session);
  updateAccountUI();
  renderCatalog();
  showToast("Has cerrado sesión.");
}

function closeDialog(dialog) {
  if (dialog.open) dialog.close();
}

function loadCallingCodes() {
  if (elements.callingCode.dataset.loaded === "true") return;
  setCallingCodeOptions(FALLBACK_CALLING_CODES);
  elements.callingCode.innerHTML = FALLBACK_CALLING_CODES.map(entry =>
    `<option value="${escapeHtml(entry.code)}">${escapeHtml(entry.flag)} ${escapeHtml(entry.code)} · ${escapeHtml(entry.countryName)}</option>`
  ).join("");
  elements.callingCode.value = "+52";
  elements.callingCode.dataset.loaded = "true";
}

function mapClickToHiddenFields(map, marker, form) {
  map.on("click", event => {
    const latitude = event.latlng.lat;
    const longitude = event.latlng.lng;
    if (marker.current) marker.current.setLatLng(event.latlng);
    else marker.current = window.L.marker(event.latlng).addTo(map);
    form.elements.latitude.value = latitude.toFixed(6);
    form.elements.longitude.value = longitude.toFixed(6);
  });
}

function initializeRegistrationMap() {
  if (!elements.authDialog.open || elements.registerForm.hidden || !hasLeaflet()) return;
  const container = $("#registration-map");
  const form = elements.registerForm;
  if (!registrationMap) {
    registrationMap = makeMap(container, getCoordinates(form.elements.zone.value || currentZone()));
    if (registrationMap) mapClickToHiddenFields(registrationMap, registrationMarker, form);
  }
  if (!registrationMap) return;
  const chosenZone = form.elements.zone.value.trim() || currentZone();
  const center = getCoordinates(chosenZone);
  registrationMap.setView([center.latitude, center.longitude], 13);
  if (form.elements.latitude.value && form.elements.longitude.value) {
    setMapMarker(registrationMap, registrationMarker, form.elements.latitude.value, form.elements.longitude.value);
  }
  window.setTimeout(() => registrationMap && registrationMap.invalidateSize(), 60);
}

function setMapMarker(map, markerState, latitude, longitude) {
  if (!map || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) return;
  const point = [Number(latitude), Number(longitude)];
  if (markerState.current) markerState.current.setLatLng(point);
  else markerState.current = window.L.marker(point).addTo(map);
}

async function submitRegistration(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const identity = String(data.get("identity") || "").trim();
  const password = String(data.get("password") || "");
  const phoneValue = String(data.get("phone") || "").trim();
  const phoneDigits = phoneValue.replace(/\D/g, "");
  const callingCode = String(data.get("callingCode") || "+52");
  const zone = String(data.get("zone") || "").trim();
  const role = String(data.get("role") || "buyer");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity)) {
    elements.registerMessage.textContent = "Escribe un correo electrónico válido.";
    return;
  }
  if (!/^[\d\s()+-]+$/.test(phoneValue) || phoneDigits.length !== 10) {
    elements.registerMessage.textContent = "Escribe un teléfono válido de exactamente 10 dígitos.";
    return;
  }
  const identityExists = users.some(user =>
    [user.identity, user.email, user.username].some(value => normalized(value) === normalized(identity))
  );
  if (identityExists) {
    elements.registerMessage.textContent = "Ese correo o usuario ya está registrado.";
    return;
  }
  if (!zone) {
    elements.registerMessage.textContent = "Escribe tu zona o colonia habitual.";
    return;
  }
  pendingRegistration = {
    otpCode: null,
    user: {
      id: makeId("user"),
      name,
      identity,
      password,
      phone: `${callingCode}${phoneDigits}`,
      role,
      zone,
      latitude: form.elements.latitude.value ? Number(form.elements.latitude.value) : null,
      longitude: form.elements.longitude.value ? Number(form.elements.longitude.value) : null,
      available: true
    }
  };
  resetOtpResendCooldown();
  elements.otpMessage.textContent = "";
  elements.otpForm.reset();
  elements.otpNotice.textContent = "Enviando código a tu correo...";
  elements.registerForm.hidden = true;
  elements.otpStep.hidden = false;
  $(".auth-tabs").hidden = true;
  elements.otpCode.focus();
  await sendRegistrationOtp();
}

function generateOtp() {
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") {
    const value = new Uint32Array(1);
    globalThis.crypto.getRandomValues(value);
    return String(value[0] % 1000000).padStart(6, "0");
  }
  return String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
}

async function sendRegistrationOtp() {
  if (!pendingRegistration || otpSendInProgress || Date.now() < otpResendAvailableAt) return false;
  const registration = pendingRegistration;
  const requestId = ++otpSendRequestId;
  otpSendInProgress = true;
  registration.otpCode = null;
  elements.otpCode.value = "";
  elements.otpCode.disabled = true;
  elements.otpForm.querySelector('button[type="submit"]').disabled = true;
  elements.otpResendButton.disabled = true;
  elements.otpNotice.textContent = "Enviando código a tu correo...";
  elements.otpMessage.textContent = "";
  try {
    if (!emailJsReady || !globalThis.emailjs || typeof emailjs.send !== "function") {
      throw new Error("El servicio de correo no está disponible.");
    }
    const generatedOtp = generateOtp();
    registration.otpCode = generatedOtp;
    await emailjs.send("service_cc2uhka", "template_xq67b9e", {
      to_email: registration.user.identity,
      to_name: registration.user.name,
      otp_code: generatedOtp
    });
    if (pendingRegistration !== registration || requestId !== otpSendRequestId) return false;
    elements.otpNotice.textContent = `Hemos enviado un código de 6 dígitos a ${registration.user.identity}. Revisa tu bandeja de entrada o spam.`;
    startOtpResendCooldown();
    return true;
  } catch {
    if (pendingRegistration === registration && requestId === otpSendRequestId) {
      registration.otpCode = null;
      elements.otpNotice.textContent = "";
      elements.otpMessage.textContent = "No pudimos enviar el código. Revisa tu conexión e inténtalo nuevamente.";
      elements.otpResendButton.disabled = false;
    }
    return false;
  } finally {
    if (requestId === otpSendRequestId) {
      otpSendInProgress = false;
      if (pendingRegistration === registration) {
        elements.otpCode.disabled = false;
        elements.otpForm.querySelector('button[type="submit"]').disabled = !registration.otpCode;
      }
    }
  }
}

function startOtpResendCooldown() {
  window.clearInterval(otpResendInterval);
  otpResendAvailableAt = Date.now() + 30000;
  const updateButton = () => {
    const secondsRemaining = Math.ceil((otpResendAvailableAt - Date.now()) / 1000);
    if (secondsRemaining <= 0) {
      window.clearInterval(otpResendInterval);
      otpResendInterval = 0;
      elements.otpResendButton.disabled = false;
      elements.otpResendButton.textContent = "Reenviar código";
      return;
    }
    elements.otpResendButton.disabled = true;
    elements.otpResendButton.textContent = `Reenviar código (${secondsRemaining} s)`;
  };
  updateButton();
  otpResendInterval = window.setInterval(updateButton, 1000);
}

function resetOtpResendCooldown() {
  window.clearInterval(otpResendInterval);
  otpResendInterval = 0;
  otpResendAvailableAt = 0;
  elements.otpResendButton.disabled = false;
  elements.otpResendButton.textContent = "Reenviar código";
}

function submitOtpVerification(event) {
  event.preventDefault();
  if (!pendingRegistration || !pendingRegistration.otpCode) {
    elements.otpMessage.textContent = "Primero envía correctamente el código a tu correo.";
    return;
  }
  if (elements.otpCode.value !== pendingRegistration.otpCode) {
    elements.otpMessage.textContent = "El código no coincide. Revisa el aviso e inténtalo de nuevo.";
    return;
  }
  const user = { ...pendingRegistration.user, verified: true };
  const nextUsers = [...users, user];
  if (!persistBatch([
    [STORAGE_KEYS.users, nextUsers],
    [STORAGE_KEYS.session, { userId: user.id }]
  ])) {
    elements.otpMessage.textContent = "No se pudo guardar la cuenta. Revisa el almacenamiento disponible e inténtalo de nuevo.";
    return;
  }
  users = nextUsers;
  currentUser = user;
  pendingRegistration = null;
  resetOtpResendCooldown();
  elements.registerForm.reset();
  elements.registerForm.elements.role.value = "buyer";
  elements.registerForm.elements.latitude.value = "";
  elements.registerForm.elements.longitude.value = "";
  if (registrationMap && registrationMarker.current) {
    registrationMap.removeLayer(registrationMarker.current);
    registrationMarker.current = null;
  }
  elements.currentZone.value = user.zone;
  updateZoneOptions();
  updateAccountUI();
  renderCatalog();
  updateWeather();
  closeDialog(elements.authDialog);
  showToast(`¡Perfil verificado! Bienvenido, ${user.name}.`);
}

function showLoginError(message) {
  elements.loginMessage.textContent = message;
}

function submitLogin(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const user = authenticate(data.get("identity"), data.get("password"));
  if (!user) {
    showLoginError("No encontramos esa cuenta. Revisa tus datos o regístrate.");
    return;
  }
  elements.loginForm.reset();
  startSession(user);
}

function sellerProducts() {
  if (!currentUser || currentUser.role !== "seller") return [];
  return products.filter(product => product.sellerId === currentUser.id);
}

function renderSellerProducts() {
  const ownProducts = sellerProducts();
  if (ownProducts.length === 0) {
    elements.sellerList.innerHTML = '<div class="empty-state"><span>🍋</span><h3>Tu menú empieza aquí</h3><p>Agrega tu primera publicación para que tu colonia te encuentre.</p></div>';
    return;
  }
  elements.sellerList.innerHTML = ownProducts.map(product => `
    <article class="seller-item">
      <div><strong>${escapeHtml(product.name)}</strong><p>${escapeHtml(product.zone)} · ${escapeHtml(product.category)} · ${escapeHtml(productPrice(product))}</p></div>
      <div class="seller-item-actions">
        <button type="button" data-edit-product="${escapeHtml(product.id)}">Editar</button>
        <button class="delete-button" type="button" data-delete-product="${escapeHtml(product.id)}">Eliminar</button>
      </div>
    </article>`).join("");
}

function setProductDeliveryFields() {
  const delivery = elements.productForm.elements.delivery.value;
  const needsLocal = delivery === "local" || delivery === "both";
  const needsDelivery = delivery === "delivery" || delivery === "both";
  elements.localFields.hidden = !needsLocal;
  $("#delivery-radius-field").hidden = !needsDelivery;
  const address = elements.productForm.elements.address;
  elements.productForm.elements.deliveryRadiusKm.required = needsDelivery;
  address.required = needsLocal;
  if (needsLocal) {
    window.setTimeout(() => {
      if (productMap) productMap.invalidateSize();
    }, 60);
  }
}

function addMenuItemRow(item = {}) {
  const row = document.createElement("div");
  row.className = "menu-item-row";
  row.innerHTML = `
    <input type="text" name="menuName" maxlength="70" aria-label="Nombre del ítem del menú" placeholder="Ej. Sabor o tamaño" value="${escapeHtml(item.name || "")}">
    <input type="number" name="menuPrice" min="1" step="0.5" aria-label="Precio del ítem del menú" placeholder="Precio" value="${item.price ? escapeHtml(item.price) : ""}">
    <button class="remove-menu-item" type="button" aria-label="Quitar ítem">×</button>`;
  $(".remove-menu-item", row).addEventListener("click", () => row.remove());
  elements.menuItems.append(row);
}

function resetProductForm() {
  elements.productForm.reset();
  elements.productForm.elements.productId.value = "";
  elements.productForm.elements.delivery.value = "local";
  elements.productForm.elements.latitude.value = "";
  elements.productForm.elements.longitude.value = "";
  elements.productForm.elements.address.value = "";
  elements.menuItems.replaceChildren();
  elements.productMessage.textContent = "";
  setProductDeliveryFields();
  setSellerPhoneFields(elements.productForm.elements.orderPhoneCode, elements.productForm.elements.orderPhone);
  if (productMap) {
    if (productMarker.current) {
      productMap.removeLayer(productMarker.current);
      productMarker.current = null;
    }
    const center = getCoordinates(currentUser && currentUser.zone || currentZone(), currentUser);
    productMap.setView([center.latitude, center.longitude], 14);
  }
}

function initializeProductMap(product = null) {
  if (!hasLeaflet()) return;
  const container = $("#product-map");
  if (!productMap) {
    const center = product ? getCoordinates(product.zone, product) :
      getCoordinates(currentUser && currentUser.zone || currentZone(), currentUser);
    productMap = makeMap(container, center, 14);
    if (productMap) mapClickToHiddenFields(productMap, productMarker, elements.productForm);
  }
  if (!productMap) return;
  const center = product ? getCoordinates(product.zone, product) :
    getCoordinates(currentUser && currentUser.zone || currentZone(), currentUser);
  productMap.setView([center.latitude, center.longitude], 14);
  if (product && hasCoordinates(product)) {
    setMapMarker(productMap, productMarker, product.latitude, product.longitude);
  } else if (productMarker.current) {
    productMap.removeLayer(productMarker.current);
    productMarker.current = null;
  }
  window.setTimeout(() => productMap && productMap.invalidateSize(), 60);
}

function openNewProduct() {
  if (!currentUser || currentUser.role !== "seller") {
    openAuth("register");
    elements.registerForm.elements.role.value = "seller";
    return;
  }
  resetProductForm();
  $("#product-dialog-title").textContent = "Nueva publicación";
  openDialog(elements.productDialog);
  window.setTimeout(() => initializeProductMap(), 100);
}

function openEditProduct(productId) {
  const product = products.find(item => item.id === productId && currentUser && item.sellerId === currentUser.id);
  if (!product) {
    showToast("No se encontró esa publicación.");
    return;
  }
  resetProductForm();
  $("#product-dialog-title").textContent = "Editar publicación";
  elements.productForm.elements.productId.value = product.id;
  elements.productForm.elements.name.value = product.name;
  elements.productForm.elements.category.value = product.category;
  elements.productForm.elements.price.value = product.price;
  elements.productForm.elements.description.value = product.description;
  elements.productForm.elements.delivery.value = product.delivery;
  elements.productForm.elements.deliveryRadiusKm.value = String(deliveryRadius(product));
  elements.productForm.elements.address.value = product.address || "";
  elements.productForm.elements.latitude.value = Number.isFinite(Number(product.latitude)) ? product.latitude : "";
  elements.productForm.elements.longitude.value = Number.isFinite(Number(product.longitude)) ? product.longitude : "";
  (product.menu || []).forEach(item => addMenuItemRow(item));
  setProductDeliveryFields();
  openDialog(elements.productDialog);
  window.setTimeout(() => initializeProductMap(product), 100);
}

function readProductMenu() {
  const names = $$('input[name="menuName"]', elements.menuItems);
  const prices = $$('input[name="menuPrice"]', elements.menuItems);
  const menu = [];
  for (let index = 0; index < names.length; index += 1) {
    const name = names[index].value.trim();
    const price = Number(prices[index].value);
    if (!name && !prices[index].value) continue;
    if (!name || !Number.isFinite(price) || price <= 0) {
      throw new Error("Completa el nombre y un precio válido de cada ítem del menú.");
    }
    menu.push({ name, price });
  }
  return menu;
}

function submitProduct(event) {
  event.preventDefault();
  if (!currentUser || currentUser.role !== "seller") {
    elements.productMessage.textContent = "Inicia sesión con una cuenta de vendedor para publicar.";
    return;
  }
  const form = elements.productForm;
  const data = new FormData(form);
  const delivery = String(data.get("delivery"));
  const needsLocal = delivery === "local" || delivery === "both";
  const deliveryRadiusValue = Number(data.get("deliveryRadiusKm"));
  const needsDelivery = delivery === "delivery" || delivery === "both";
  let orderPhone;
  try {
    orderPhone = phoneFromFields(form.elements.orderPhoneCode, form.elements.orderPhone);
  } catch (error) {
    elements.productMessage.textContent = error.message;
    return;
  }
  let menu;
  try {
    menu = readProductMenu();
  } catch (error) {
    elements.productMessage.textContent = error.message;
    return;
  }
  const latitude = String(data.get("latitude") || "");
  const longitude = String(data.get("longitude") || "");
  if (needsLocal && (!data.get("address") || !latitude || !longitude)) {
    elements.productMessage.textContent = "Para publicar con entrega en local, agrega la dirección y marca el punto exacto en el mapa.";
    return;
  }
  if (needsDelivery && ![2, 5, 8, 12, 15].includes(deliveryRadiusValue)) {
    elements.productMessage.textContent = "Selecciona un radio de entrega válido.";
    return;
  }
  const existingId = String(data.get("productId") || "");
  const existing = products.find(product => product.id === existingId && product.sellerId === currentUser.id);
  const nextProduct = {
    id: existing ? existing.id : makeId("product"),
    sellerId: currentUser.id,
    name: String(data.get("name")).trim(),
    category: String(data.get("category")),
    price: Number(data.get("price")),
    description: String(data.get("description")).trim(),
    delivery,
    deliveryRadiusKm: needsDelivery ? deliveryRadiusValue : null,
    address: needsLocal ? String(data.get("address")).trim() : "",
    zone: currentUser.zone,
    latitude: needsLocal ? Number(latitude) : null,
    longitude: needsLocal ? Number(longitude) : null,
    emoji: existing ? existing.emoji : "🍽️",
    imageTone: existing ? existing.imageTone : "image-orange",
    menu
  };
  const nextProducts = existing
    ? products.map(product => product.id === existing.id ? nextProduct : product)
    : [nextProduct, ...products];
  const nextUsers = users.map(user => user.id === currentUser.id ? { ...user, phone: orderPhone } : user);
  if (!persistBatch([
    [STORAGE_KEYS.products, nextProducts],
    [STORAGE_KEYS.users, nextUsers]
  ])) {
    elements.productMessage.textContent = "No se pudieron guardar la publicación y el teléfono. Inténtalo de nuevo.";
    return;
  }
  products = nextProducts;
  users = nextUsers;
  currentUser = users.find(user => user.id === currentUser.id);
  setSellerPhoneFields(elements.profilePhoneCode, elements.profilePhoneNumber);
  setSellerPhoneFields(form.elements.orderPhoneCode, form.elements.orderPhone);
  closeDialog(elements.productDialog);
  renderCatalog();
  renderSellerProducts();
  showToast(existing ? "Publicación actualizada." : "¡Tu publicación ya está en AntojoLocal!");
}

function deleteProduct(productId) {
  const product = products.find(item => item.id === productId && currentUser && item.sellerId === currentUser.id);
  if (!product) {
    showToast("No se encontró esa publicación.");
    return;
  }
  if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
  const previous = products;
  products = products.filter(item => item.id !== productId);
  if (!persist(STORAGE_KEYS.products, products)) {
    products = previous;
    return;
  }
  renderSellerProducts();
  renderCatalog();
  showToast("Publicación eliminada.");
}

function updateSellerAvailability(available) {
  if (!currentUser || currentUser.role !== "seller") return;
  const previous = currentUser.available;
  currentUser.available = available;
  users = users.map(user => user.id === currentUser.id ? currentUser : user);
  if (!persist(STORAGE_KEYS.users, users)) {
    currentUser.available = previous;
    elements.sellerAvailability.checked = previous !== false;
    return;
  }
  elements.sellerStatusLabel.textContent = available ? "Disponible ahora" : "Cerrado por hoy";
  elements.sellerStatusLabel.style.color = available ? "" : "#8b7971";
  renderCatalog();
  showToast(available ? "Tu puesto aparece disponible." : "Tu puesto aparece cerrado por hoy.");
}

function buildOrderPanel(product, available) {
  const offersDelivery = productOffersDelivery(product);
  const radius = deliveryRadius(product);
  const distance = productDistance(product);
  const outOfRange = distance === null || distance > radius;
  const distanceText = distance === null ? "Distancia no disponible" : `A ${distance.toFixed(1)} km de ti`;
  const deliveryOption = offersDelivery ? `
    <label class="order-choice">
      <input type="radio" name="order-method" value="delivery" ${outOfRange || !available ? "disabled" : ""}>
      <span><strong>A domicilio</strong><small>Entrega hasta ${radius} km · ${escapeHtml(distanceText)}</small></span>
    </label>` : "";
  const rangeMessage = offersDelivery && outOfRange
    ? `<p class="delivery-warning">${distance === null ? "No se pudo calcular tu distancia. " : ""}Fuera del rango de entrega de este vendedor. Recoge en punto.</p>`
    : "";
  return `
    <section class="order-panel" aria-label="Opciones de pedido">
      <h3 class="detail-section-title">Haz tu pedido</h3>
      ${deliveryOption}
      <label class="order-choice">
        <input type="radio" name="order-method" value="pickup" checked>
        <span><strong>Recoger en punto</strong><small>${escapeHtml(product.address || product.zone)}</small></span>
      </label>
      ${rangeMessage}
      <button class="button button-primary button-full" type="button" data-start-order="${escapeHtml(product.id)}" ${available ? "" : "disabled"}>${available ? "Continuar con pedido" : "Vendedor cerrado por hoy"}</button>
    </section>`;
}

function buildDetailContent(product) {
  const seller = sellerFor(product);
  const sellerName = seller ? seller.name : "Vendedor local";
  const menu = Array.isArray(product.menu) ? product.menu : [];
  const available = sellerIsAvailable(seller);
  const hasLocation = ["local", "both"].includes(product.delivery) && hasCoordinates(product);
  const verifiedBadge = seller && seller.verified ? '<span class="verified-badge" aria-label="Perfil verificado" title="Perfil verificado">Perfil verificado ✓</span>' : "";
  const phone = seller ? normalizePhoneForSms(seller.phone) : "";
  const menuHtml = menu.length ? `
    <h3 class="detail-section-title">Menú</h3>
    ${menu.map(item => `<div class="detail-menu-row"><span>${escapeHtml(item.name)}</span><strong>${escapeHtml(CURRENCY.format(Number(item.price) || 0))}</strong></div>`).join("")}` : "";
  const locationHtml = hasLocation ? `
    <h3 class="detail-section-title">Punto de venta</h3>
    <p class="detail-address">${escapeHtml(product.address || product.zone)}</p>
    <div class="detail-map" id="detail-map" aria-label="Mapa del local"></div>` : "";
  const orderPanel = buildOrderPanel(product, available);
  return `
    <div class="detail-hero ${escapeHtml(product.imageTone || "image-orange")}">${escapeHtml(product.emoji || "🍽️")}</div>
    <div class="detail-body">
      <span class="eyebrow">${escapeHtml(product.category || "Antojito")} · ${escapeHtml(product.zone)}</span>
      <div class="detail-title-row"><h2 id="detail-title">${escapeHtml(product.name)}</h2><strong class="product-price">${escapeHtml(productPrice(product))}</strong></div>
      <div class="detail-meta"><span>${escapeHtml(deliveryText(product.delivery))}</span><span>${available ? "Disponible ahora" : "Cerrado por hoy"}</span><span>Por ${escapeHtml(sellerName)}${verifiedBadge}</span></div>
      <p class="detail-description">${escapeHtml(product.description)}</p>
      ${menuHtml}${orderPanel}${locationHtml}
      ${phone
        ? `<button class="button sms-button" type="button" data-sms-product="${escapeHtml(product.id)}">Contactar por SMS <span aria-hidden="true">↗</span></button>`
        : '<p class="form-message">Este vendedor no agregó un teléfono para contacto.</p>'}
    </div>`;
}

function normalizePhoneForSms(phone) {
  const rawPhone = String(phone || "").trim();
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return "";
  if (rawPhone.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("52") && digits.length >= 12) return `+${digits}`;
  return `+52${digits}`;
}

function contactSellerBySms(productId) {
  const product = products.find(item => item.id === productId);
  const seller = product ? sellerFor(product) : null;
  const phone = seller ? normalizePhoneForSms(seller.phone) : "";
  if (!product || !seller || !phone) {
    showToast("No encontramos un teléfono válido para este vendedor.");
    return;
  }
  const message = `Hola ${seller.name}, me interesa ${product.name} que vi en AntojoLocal para la zona ${currentZone()}.`;
  const smsLink = document.createElement("a");
  smsLink.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
  smsLink.target = "_blank";
  smsLink.rel = "noopener noreferrer";
  smsLink.setAttribute("aria-hidden", "true");
  smsLink.tabIndex = -1;
  document.body.append(smsLink);
  try {
    smsLink.click();
  } catch (error) {
    console.warn("No se pudo abrir la aplicación SMS. El teléfono y el mensaje siguen disponibles para copiar.", error);
  } finally {
    smsLink.remove();
  }
  elements.smsPhoneValue.textContent = phone;
  elements.smsMessageValue.value = message;
  elements.smsWhatsAppLink.href = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  openDialog(elements.smsDialog);
}

async function copyTextToClipboard(text, label) {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copiado.`);
      return;
    }
  } catch (error) {
    console.warn("El portapapeles del navegador no está disponible; se intentará el método alternativo.", error);
  }
  const temporaryInput = document.createElement("textarea");
  temporaryInput.value = text;
  temporaryInput.setAttribute("readonly", "");
  temporaryInput.style.position = "fixed";
  temporaryInput.style.opacity = "0";
  document.body.append(temporaryInput);
  temporaryInput.select();
  try {
    if (!document.execCommand("copy")) throw new Error("El navegador no permitió copiar al portapapeles.");
    showToast(`${label} copiado.`);
  } catch (error) {
    console.error(`No se pudo copiar ${label.toLocaleLowerCase("es-MX")} al portapapeles.`, error);
    showToast(`No se pudo copiar ${label.toLocaleLowerCase("es-MX")}.`);
  } finally {
    temporaryInput.remove();
  }
}

function openProductDetail(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) {
    showToast("Este antojito ya no está disponible.");
    return;
  }
  if (detailMap) {
    detailMap.remove();
    detailMap = null;
  }
  elements.detailContent.innerHTML = buildDetailContent(product);
  openDialog(elements.detailDialog);
  if (["local", "both"].includes(product.delivery) && hasCoordinates(product)) {
    window.setTimeout(() => {
      if (!elements.detailDialog.open || !hasLeaflet()) return;
      detailMap = makeMap($("#detail-map", elements.detailContent), product, 15);
      if (detailMap) {
        window.L.marker([Number(product.latitude), Number(product.longitude)]).addTo(detailMap)
          .bindPopup(escapeHtml(product.name)).openPopup();
        window.setTimeout(() => detailMap && detailMap.invalidateSize(), 50);
      }
    }, 100);
  }
}

function startOrder(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) {
    showToast("Este antojito ya no está disponible.");
    return;
  }
  if (!sellerIsAvailable(sellerFor(product))) {
    showToast("Este vendedor está cerrado por hoy.");
    return;
  }
  const selectedMethod = $('input[name="order-method"]:checked', elements.detailContent);
  if (!selectedMethod) {
    showToast("Selecciona cómo quieres recibir tu pedido.");
    return;
  }
  if (selectedMethod.value === "pickup") {
    const order = saveOrder(product, "Recoger en punto", "Pago al recoger", "Pedido confirmado · pago al recoger");
    if (!order) return;
    closeDialog(elements.detailDialog);
    openOrders();
    showToast(`Pedido ${order.folio} confirmado.`);
    return;
  }
  const distance = productDistance(product);
  if (!productOffersDelivery(product) || distance === null || distance > deliveryRadius(product)) {
    showToast("Fuera del rango de entrega de este vendedor. Recoge en punto.");
    elements.detailContent.innerHTML = buildDetailContent(product);
    return;
  }
  currentCheckoutProductId = product.id;
  elements.checkoutSummary.textContent = `${product.name} · ${productPrice(product)}`;
  elements.checkoutMessage.textContent = "";
  elements.checkoutForm.reset();
  elements.speiReference.textContent = makeSpeiReference();
  updatePaymentFields();
  closeDialog(elements.detailDialog);
  openDialog(elements.checkoutDialog);
}

function makeSpeiReference() {
  const random = globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function"
    ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0]
    : Math.floor(Math.random() * 1000000000);
  return `AL-${String(random).padStart(9, "0").slice(-9)}`;
}

function updatePaymentFields() {
  const method = new FormData(elements.checkoutForm).get("paymentMethod");
  const card = method === "card";
  const spei = method === "spei";
  elements.cardPaymentFields.hidden = !card;
  elements.speiPaymentFields.hidden = !spei;
  elements.walletPaymentFields.hidden = method !== "wallet";
  ["cardNumber", "cardExpiry", "cardCvv"].forEach(name => {
    elements.checkoutForm.elements[name].required = card;
  });
}

function nextOrderFolio() {
  const highest = orders.reduce((max, order) => {
    const match = /^#AL-(\d+)$/.exec(String(order.folio || ""));
    return match ? Math.max(max, Number(match[1])) : max;
  }, 1041);
  return `#AL-${highest + 1}`;
}

function saveOrder(product, deliveryMethod, paymentMethod, status) {
  const seller = sellerFor(product);
  const order = {
    id: makeId("order"),
    folio: nextOrderFolio(),
    buyerId: currentUser ? currentUser.id : null,
    buyerName: currentUser ? currentUser.name : "Invitado",
    productId: product.id,
    productName: product.name,
    sellerId: product.sellerId,
    sellerName: seller ? seller.name : "Vendedor local",
    amount: Number(product.price) || 0,
    deliveryMethod,
    paymentMethod,
    status,
    createdAt: new Date().toISOString(),
    reference: paymentMethod === "Transferencia SPEI" ? elements.speiReference.textContent : ""
  };
  const nextOrders = [order, ...orders];
  if (!persist(STORAGE_KEYS.orders, nextOrders)) return null;
  orders = nextOrders;
  return order;
}

function submitCheckout(event) {
  event.preventDefault();
  const product = products.find(item => item.id === currentCheckoutProductId);
  if (!product) {
    elements.checkoutMessage.textContent = "Este antojito ya no está disponible.";
    return;
  }
  const distance = productDistance(product);
  if (!productOffersDelivery(product) || distance === null || distance > deliveryRadius(product)) {
    elements.checkoutMessage.textContent = "Fuera del rango de entrega de este vendedor. Elige recoger en punto.";
    return;
  }
  const data = new FormData(elements.checkoutForm);
  const method = String(data.get("paymentMethod") || "");
  const methodNames = {
    card: "Tarjeta de crédito/débito",
    spei: "Transferencia SPEI",
    wallet: "Billetera digital"
  };
  if (method === "card") {
    const cardNumber = String(data.get("cardNumber") || "").replace(/\D/g, "");
    const expiry = /^(\d{2})\/(\d{2})$/.exec(String(data.get("cardExpiry") || "").trim());
    const cvv = String(data.get("cardCvv") || "").trim();
    if (cardNumber.length !== 16) {
      elements.checkoutMessage.textContent = "La tarjeta debe tener exactamente 16 dígitos.";
      return;
    }
    if (!expiry || Number(expiry[1]) < 1 || Number(expiry[1]) > 12) {
      elements.checkoutMessage.textContent = "Escribe un vencimiento válido en formato MM/AA.";
      return;
    }
    const expiryYear = 2000 + Number(expiry[2]);
    const now = new Date();
    if (expiryYear < now.getFullYear() ||
      expiryYear === now.getFullYear() && Number(expiry[1]) < now.getMonth() + 1) {
      elements.checkoutMessage.textContent = "La tarjeta está vencida.";
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      elements.checkoutMessage.textContent = "El CVV debe tener 3 o 4 dígitos.";
      return;
    }
  } else if (!["spei", "wallet"].includes(method)) {
    elements.checkoutMessage.textContent = "Selecciona un método de pago válido.";
    return;
  }
  if (!sellerIsAvailable(sellerFor(product))) {
    elements.checkoutMessage.textContent = "Este vendedor está cerrado por hoy.";
    return;
  }
  const order = saveOrder(product, "A domicilio", methodNames[method], "Pagado y confirmado");
  if (!order) return;
  currentCheckoutProductId = null;
  closeDialog(elements.checkoutDialog);
  openOrders();
  showToast(`Pago simulado y pedido ${order.folio} confirmado.`);
}

function openOrders() {
  const visibleOrders = orders.filter(order =>
    currentUser ? order.buyerId === currentUser.id || order.sellerId === currentUser.id : !order.buyerId
  );
  elements.ordersList.innerHTML = visibleOrders.length ? visibleOrders.map(order => `
    <article class="order-summary">
      <div class="order-summary-heading"><strong>${escapeHtml(order.folio)}</strong><span>${escapeHtml(order.status)}</span></div>
      <p>${escapeHtml(order.productName)} · ${escapeHtml(CURRENCY.format(Number(order.amount) || 0))}</p>
      <small>${escapeHtml(order.deliveryMethod)} · ${escapeHtml(order.paymentMethod)}</small>
      <small>Vendedor: ${escapeHtml(order.sellerName)}</small>
      ${order.reference ? `<small>Referencia: ${escapeHtml(order.reference)}</small>` : ""}
    </article>`).join("") : '<div class="empty-state"><span>🧾</span><h3>Aún no tienes pedidos</h3><p>Cuando confirmes uno, aparecerá aquí.</p></div>';
  openDialog(elements.ordersDialog);
}

function loadProjectRepository() {
  elements.projectRepo.innerHTML = 'Información del proyecto y dependencias disponibles en <a href="https://github.com/leaflet/leaflet" target="_blank" rel="noopener noreferrer">GitHub →</a>';
}

function openSellerSignup() {
  if (currentUser && currentUser.role === "seller") {
    elements.dashboard.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  openAuth("register");
  elements.registerForm.elements.role.value = "seller";
}

function attachEvents() {
  elements.accountButton.addEventListener("click", () => {
    if (currentUser) signOut();
    else openAuth("login");
  });
  elements.ordersButton.addEventListener("click", openOrders);
  elements.currentZone.addEventListener("input", () => {
    updateZoneOptions();
    renderCatalog();
  });
  elements.currentZone.addEventListener("change", () => {
    const typedZone = currentZone();
    elements.currentZone.value = typedZone;
    renderCatalog();
    updateWeather();
    if (registrationMap) initializeRegistrationMap();
    if (activeView === "map" && catalogMap) refreshCatalogMap();
  });
  elements.search.addEventListener("input", renderCatalog);
  elements.category.addEventListener("change", renderCatalog);
  elements.delivery.addEventListener("change", renderCatalog);
  $("#clear-filters").addEventListener("click", () => {
    elements.search.value = "";
    elements.category.value = "";
    elements.delivery.value = "";
    renderCatalog();
  });
  elements.gridViewButton.addEventListener("click", () => setActiveView("grid"));
  elements.mapViewButton.addEventListener("click", () => setActiveView("map"));
  elements.grid.addEventListener("click", event => {
    const button = event.target.closest("[data-detail-id]");
    if (button) openProductDetail(button.dataset.detailId);
  });
  elements.detailContent.addEventListener("click", event => {
    const button = event.target.closest("[data-sms-product]");
    if (button) contactSellerBySms(button.dataset.smsProduct);
    const orderButton = event.target.closest("[data-start-order]");
    if (orderButton) startOrder(orderButton.dataset.startOrder);
  });
  elements.sellerCta.addEventListener("click", openSellerSignup);
  $("#new-product-button").addEventListener("click", openNewProduct);
  elements.sellerProfileForm.addEventListener("submit", submitSellerProfile);
  $("#copy-sms-phone").addEventListener("click", () =>
    copyTextToClipboard(elements.smsPhoneValue.textContent, "El teléfono")
  );
  $("#copy-sms-message").addEventListener("click", () =>
    copyTextToClipboard(elements.smsMessageValue.value, "El mensaje")
  );
  elements.sellerList.addEventListener("click", event => {
    const editButton = event.target.closest("[data-edit-product]");
    const deleteButton = event.target.closest("[data-delete-product]");
    if (editButton) openEditProduct(editButton.dataset.editProduct);
    if (deleteButton) deleteProduct(deleteButton.dataset.deleteProduct);
  });
  elements.sellerAvailability.addEventListener("change", event => updateSellerAvailability(event.target.checked));
  elements.loginTab.addEventListener("click", () => setAuthMode("login"));
  elements.registerTab.addEventListener("click", () => setAuthMode("register"));
  elements.loginForm.addEventListener("submit", submitLogin);
  elements.registerForm.addEventListener("submit", submitRegistration);
  elements.otpForm.addEventListener("submit", submitOtpVerification);
  elements.otpResendButton.addEventListener("click", sendRegistrationOtp);
  elements.otpBackButton.addEventListener("click", () => {
    pendingRegistration = null;
    setAuthMode("register");
    elements.registerMessage.textContent = "";
  });
  elements.authDialog.addEventListener("close", () => {
    if (pendingRegistration) {
      pendingRegistration = null;
      otpSendRequestId += 1;
      otpSendInProgress = false;
      resetOtpResendCooldown();
    }
  });
  elements.registerForm.elements.zone.addEventListener("input", () => {
    if (registrationMap) {
      const center = getCoordinates(elements.registerForm.elements.zone.value || currentZone());
      registrationMap.setView([center.latitude, center.longitude], 13);
    }
  });
  elements.registerForm.elements.zone.addEventListener("change", initializeRegistrationMap);
  $("#add-menu-item").addEventListener("click", () => addMenuItemRow());
  $$('input[name="delivery"]', elements.productForm).forEach(input =>
    input.addEventListener("change", setProductDeliveryFields)
  );
  elements.productForm.addEventListener("submit", submitProduct);
  elements.checkoutForm.addEventListener("change", updatePaymentFields);
  elements.checkoutForm.addEventListener("submit", submitCheckout);
  $("#project-info-button").addEventListener("click", () => {
    openDialog(elements.infoDialog);
    loadProjectRepository();
  });
  document.addEventListener("click", event => {
    if (event.target.closest("[data-close-dialog]")) {
      const dialog = event.target.closest("dialog");
      if (dialog) closeDialog(dialog);
    }
  });
  [
    elements.authDialog, elements.detailDialog, elements.checkoutDialog, elements.ordersDialog,
    elements.productDialog, elements.infoDialog, elements.smsDialog
  ].forEach(dialog => {
    dialog.addEventListener("click", event => {
      if (event.target === dialog) closeDialog(dialog);
    });
  });
  elements.detailDialog.addEventListener("close", () => {
    if (detailMap) {
      detailMap.remove();
      detailMap = null;
    }
  });
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
      event.preventDefault();
      elements.search.focus();
    }
    if (event.key === "Escape") {
      [
        elements.authDialog, elements.detailDialog, elements.checkoutDialog, elements.ordersDialog,
        elements.productDialog, elements.infoDialog, elements.smsDialog
      ]
        .forEach(dialog => closeDialog(dialog));
    }
  });
}

function initialize() {
  $("#current-year").textContent = String(new Date().getFullYear());
  elements.currentZone.value = currentUser && currentUser.zone ? currentUser.zone : DEFAULT_ZONE;
  updateZoneOptions();
  attachEvents();
  updateAccountUI();
  renderCatalog();
  updateWeather();
  loadCallingCodes();
}

initialize();
