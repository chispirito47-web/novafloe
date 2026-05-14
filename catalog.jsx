// =========================================================
// Novafloe — Catálogo (app + admin) — Supabase edition
// =========================================================
const { useState, useEffect, useMemo, useRef } = React;

const WHATSAPP_NUMBER = "573003547932"; // +57 300 354 7932
const INSTAGRAM_HANDLE = "novafloe.col";

// ---- Supabase ----
const SUPA_URL = "https://sgfsdzknjlrbkgylkrpw.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnZnNkemtuamxyYmtneWxrcnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjUwMTEsImV4cCI6MjA5NDM0MTAxMX0.53nfTnWCANM8zvSlOH439laW18F0gEuciNyUxDtZanw";
const supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);

// Map between Supabase row (snake_case) and frontend product (camelCase)
function rowToProduct(row) {
  return {
    id: row.id,
    ref: row.ref || "",
    name: row.name,
    category: row.category,
    price: row.price,
    isNew: !!row.is_new,
    status: row.status || "available",
    image: row.image_url || "",
    colors: row.colors || [],
    sizes: row.sizes || [],
    desc: row.description || "",
    sortOrder: row.sort_order || 0,
  };
}

function productToRow(p) {
  return {
    id: p.id,
    ref: p.ref || "",
    name: p.name,
    category: p.category,
    price: p.price,
    is_new: !!p.isNew,
    status: p.status || "available",
    image_url: p.image || null,
    colors: p.colors || [],
    sizes: p.sizes || [],
    description: p.desc || "",
    sort_order: p.sortOrder || 0,
    updated_at: new Date().toISOString(),
  };
}

// Sample products to seed an empty database (one-time)
const SEED_PRODUCTS = [
  { id: "p001", ref: "CR-101", name: "Runchi Sofía", category: "crunchies", price: 38000, isNew: true,  status: "available", image: "", colors: [{name:"Rosa pastel",hex:"#f4c9d7"},{name:"Blanco",hex:"#fdfaf7"}], sizes:["S","M","L"], desc: "Crunchie en algodón suave con detalle fruncido." },
  { id: "p002", ref: "CR-102", name: "Runchi Lola",  category: "crunchies", price: 35000, isNew: false, status: "low",       image: "", colors: [{name:"Negro",hex:"#1a1614"},{name:"Beige",hex:"#e8dcc8"}], sizes:["S","M"], desc: "Top corto con tirante delgado." },
  { id: "p003", ref: "CR-103", name: "Runchi Camila",category: "crunchies", price: 42000, isNew: true,  status: "available", image: "", colors: [{name:"Rosa",hex:"#e89bb3"}], sizes:["Único"], desc: "Manga abullonada, escote corazón." },
  { id: "p006", ref: "JN-201", name: "Jean Mariana", category: "jeans",     price: 68000, isNew: false, status: "available", image: "", colors: [{name:"Azul medio",hex:"#7895b8"}], sizes:["6","8","10","12"], desc: "Tiro alto, bota recta." },
  { id: "p007", ref: "JN-202", name: "Jean Valentina",category:"jeans",     price: 72000, isNew: false, status: "low",       image: "", colors: [{name:"Azul oscuro",hex:"#3a4c66"}], sizes:["8","10"], desc: "Wide leg, denim grueso." },
  { id: "p009", ref: "JN-204", name: "Jean Antonella",category:"jeans",     price: 69000, isNew: true,  status: "available", image: "", colors: [{name:"Azul claro",hex:"#a8c0d6"}], sizes:["6","8","10"], desc: "Mom fit, deslavado bonito." },
  { id: "p010", ref: "CN-301", name: "Conjunto Domingo", category: "conjuntos", price: 75000, isNew: false, status: "available", image: "", colors: [{name:"Crema",hex:"#f6efe4"}], sizes:["S","M","L"], desc: "Top + short en lino." },
  { id: "p011", ref: "CN-302", name: "Conjunto Verano",  category: "conjuntos", price: 70000, isNew: true,  status: "available", image: "", colors: [{name:"Rosa",hex:"#f4c9d7"}], sizes:["S","M"], desc: "Crop top + falda midi." },
];

// ---- Icons ----
const Icon = {
  Heart: ({ filled }) => (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
  ),
  Bag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  ),
  Arrow: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
  ),
  WhatsApp: () => (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.9L4 20l4.22-1.11a7.94 7.94 0 0 0 3.82.97h.01a7.94 7.94 0 0 0 7.94-7.94 7.9 7.9 0 0 0-2.39-5.6zm-5.55 12.21a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.66.67-2.45-.16-.25a6.6 6.6 0 1 1 12.25-3.49 6.6 6.6 0 0 1-6.66 6.59zm3.62-4.94c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.45.1s-.51.64-.62.77c-.11.13-.23.15-.43.05-.2-.1-.84-.31-1.6-.99-.6-.53-1-1.18-1.11-1.38-.12-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.45-1.08-.62-1.48-.16-.39-.33-.34-.45-.34l-.39-.01c-.13 0-.34.05-.52.25s-.69.67-.69 1.65.7 1.91.8 2.04c.1.13 1.4 2.13 3.38 2.99.47.2.84.32 1.13.41.47.15.9.13 1.24.08.38-.06 1.17-.48 1.33-.94.17-.46.17-.86.12-.94-.05-.08-.18-.13-.39-.23z"></path></svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  Minus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"></path></svg>
  ),
};

// ---- Helpers ----
const formatPrice = (n) => "$" + n.toLocaleString("es-CO");

// Default labels for product categories (editable from admin)
const DEFAULT_CAT_LABELS = {
  crunchies: "Runchis",
  jeans: "Jeans",
  conjuntos: "Conjuntos",
};
const CAT_IDS = ["crunchies", "jeans", "conjuntos"];

// Build the filter list using dynamic labels
function buildCategories(labels) {
  return [
    { id: "todo", label: "Todo", filter: () => true },
    { id: "nuevo", label: "Novedades", filter: (p) => p.isNew },
    ...CAT_IDS.map((id) => ({
      id,
      label: labels[id] || DEFAULT_CAT_LABELS[id],
      filter: (p) => p.category === id,
    })),
    { id: "low", label: "¡Pocas!", filter: (p) => p.status === "low" },
  ];
}

function buildWhatsappLink(items) {
  if (!items || items.length === 0) return `https://wa.me/${WHATSAPP_NUMBER}`;
  const lines = ["Hola Novafloe 💕 quiero pedir:\n"];
  let total = 0;
  items.forEach((it) => {
    const lineTotal = it.product.price * it.qty;
    total += lineTotal;
    lines.push(
      `• ${it.product.name} (Ref. ${it.product.ref})\n   Talla: ${it.size || "—"} · Color: ${it.color || "—"} · Cant: ${it.qty} · ${formatPrice(lineTotal)}`
    );
  });
  lines.push(`\nTotal: ${formatPrice(total)}`);
  lines.push("\n¿Está disponible? 🌸");
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

// ---- Product placeholder image ----
function ProductImage({ product }) {
  if (product.image) {
    return <img src={product.image} alt={product.name} />;
  }
  return (
    <div className="ph-product">
      <div className="ph-name">{product.name}</div>
    </div>
  );
}

// ---- Product marquee (auto-scrolling strip) ----
function Marquee({ products }) {
  // Pick up to 8, then duplicate for seamless loop
  const items = products.slice(0, 8);
  const repeated = [...items, ...items, ...items];
  if (items.length === 0) return null;
  return (
    <div className="marquee">
      <div className="marquee-eyebrow">· Lookbook en vivo ·</div>
      <div className="marquee-fade-l"></div>
      <div className="marquee-fade-r"></div>
      <div className="marquee-track">
        {repeated.map((p, i) => (
          <div className="marquee-card" key={i}>
            <ProductImage product={p} />
            <span className="label">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Topbar ----
function Topbar({ cartCount, onOpenCart, adminMode, onOpenExport, onLogoTap }) {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="topbar-logo" onClick={onLogoTap} style={{ cursor: "pointer", userSelect: "none" }}>
          <span className="nova">Nova</span><span className="floe">floe</span>
        </div>
        <div className="topbar-actions">
          {adminMode && (
            <button className="icon-btn" onClick={onOpenExport} title="Exportar">
              <Icon.Edit />
            </button>
          )}
          <button className="icon-btn" onClick={onOpenCart} aria-label="Carrito">
            <Icon.Bag />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Flower SVGs (decorative) ----
const Flower = ({ variant = 1, ...props }) => {
  if (variant === 1) {
    // 5-petal pink flower with yellow center
    return (
      <svg viewBox="0 0 100 100" {...props}>
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="50" cy="22" rx="14" ry="22"
            fill="url(#petalGrad1)"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="9" fill="#f9d56e" />
        <circle cx="50" cy="50" r="5" fill="#e8a737" />
        <defs>
          <radialGradient id="petalGrad1" cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="40%" stopColor="#fde7ed" />
            <stop offset="100%" stopColor="#e89bb3" />
          </radialGradient>
        </defs>
      </svg>
    );
  }
  if (variant === 2) {
    // 6-petal soft pink flower
    return (
      <svg viewBox="0 0 100 100" {...props}>
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="50" cy="26" rx="11" ry="18"
            fill="url(#petalGrad2)"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="7" fill="#fff5d6" />
        <circle cx="50" cy="50" r="3.5" fill="#e89bb3" />
        <defs>
          <radialGradient id="petalGrad2" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="60%" stopColor="#f8d6df" />
            <stop offset="100%" stopColor="#c46e8a" />
          </radialGradient>
        </defs>
      </svg>
    );
  }
  if (variant === 3) {
    // 8-petal star flower (rosa más intensa)
    return (
      <svg viewBox="0 0 100 100" {...props}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse
            key={i}
            cx="50" cy="20" rx="8" ry="22"
            fill="url(#petalGrad3)"
            transform={`rotate(${i * 45} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="8" fill="#fff" />
        <circle cx="50" cy="50" r="4" fill="#c46e8a" />
        <defs>
          <radialGradient id="petalGrad3" cx="50%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#fde7ed" />
            <stop offset="100%" stopColor="#c46e8a" />
          </radialGradient>
        </defs>
      </svg>
    );
  }
  // variant 4 — tiny daisy
  return (
    <svg viewBox="0 0 100 100" {...props}>
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="50" cy="30" rx="9" ry="14"
          fill="#fff"
          stroke="#f4c9d7"
          strokeWidth="1.5"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="8" fill="#f9d56e" />
    </svg>
  );
};

// ---- Hero ----
function Hero({ onScrollToCatalog }) {
  return (
    <section className="hero">
      <div className="hero-flora" aria-hidden="true">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
        <Flower variant={1} className="flower flower-1" />
        <Flower variant={2} className="flower flower-2" />
        <Flower variant={3} className="flower flower-3" />
        <Flower variant={1} className="flower flower-4" />
        <Flower variant={4} className="flower flower-5" />
        <Flower variant={2} className="flower flower-6" />
        <Flower variant={4} className="flower flower-7" />
        <Flower variant={3} className="flower flower-8" />
        <span className="petal petal-a"></span>
        <span className="petal petal-b"></span>
        <span className="petal petal-c"></span>
        <span className="petal petal-d"></span>
        <span className="petal petal-e"></span>
        <span className="petal petal-f"></span>
      </div>
      <div className="hero-eyebrow">Colección Primavera · 2026</div>
      <h1 className="hero-title">
        <span className="ink">Nova</span><span className="pink">floe</span>
      </h1>
      <p className="hero-tagline">prendas cool, de calidad,<br/>y a precios que amas.</p>
      <button className="hero-cta" onClick={onScrollToCatalog}>
        Ver catálogo <Icon.Arrow />
      </button>
      <div className="hero-meta">
        <span>Bogotá</span>
        <span className="dot"></span>
        <span>Envíos nacionales</span>
        <span className="dot"></span>
        <span>Pago contra entrega</span>
      </div>
    </section>
  );
}

// ---- Lookbook strip ----
function Lookbook() {
  return (
    <div className="lookbook" aria-hidden="true">
      <div className="lookbook-tile tall">
        <div className="ph"></div>
        <span className="label">Look 01 · Crunchie Camila</span>
      </div>
      <div className="lookbook-tile">
        <div className="ph"></div>
        <span className="label">Look 02 · Jean Mariana</span>
      </div>
      <div className="lookbook-tile dark">
        <div className="ph"></div>
        <span className="label">Look 03 · Conjunto Domingo</span>
      </div>
      <div className="lookbook-tile">
        <div className="ph"></div>
        <span className="label">Look 04 · Mix &amp; match</span>
      </div>
      <div className="lookbook-tile">
        <div className="ph"></div>
        <span className="label">Look 05 · Wide leg</span>
      </div>
    </div>
  );
}

// ---- Product card ----
function Card({ product, onOpen, isFav, onFav, adminMode, onEdit }) {
  const isSold = product.status === "soldout";
  return (
    <button className={"card" + (isSold ? " sold" : "")} onClick={() => onOpen(product)}>
      <div className="card-media">
        <ProductImage product={product} />
        <div className="card-tags">
          {product.isNew && <span className="tag new">Nuevo</span>}
          {product.status === "low" && <span className="tag low">Pocas</span>}
          {product.status === "soldout" && <span className="tag sold">Agotado</span>}
        </div>
        <span
          className={"fav-btn" + (isFav ? " active" : "")}
          onClick={(e) => { e.stopPropagation(); onFav(product.id); }}
          role="button"
          aria-label="Favorito"
        >
          <Icon.Heart filled={isFav} />
        </span>
        {adminMode && (
          <span className="admin-edit" role="button" onClick={(e) => { e.stopPropagation(); onEdit(product); }}>
            <Icon.Edit />
          </span>
        )}
      </div>
      <div className="card-info">
        <div className="card-ref">Ref. {product.ref}</div>
        <h3 className="card-name">{product.name}</h3>
        <div className={"card-price" + (isSold ? " sold" : "")}>{formatPrice(product.price)}</div>
        {product.colors && product.colors.length > 0 && (
          <div className="card-swatches">
            {product.colors.map((c, i) => (
              <span key={i} className="swatch" style={{ background: c.hex }} title={c.name}></span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

// ---- Product detail modal ----
function ProductDetail({ product, onClose, onAdd }) {
  const [size, setSize] = useState(product.sizes[0] || "");
  const [color, setColor] = useState(product.colors[0]?.name || "");
  const isSold = product.status === "soldout";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar"><Icon.Close /></button>
        <div className="modal-media">
          <ProductImage product={product} />
        </div>
        <div className="modal-body">
          <div className="modal-ref">Ref. {product.ref}</div>
          <h2 className="modal-name">{product.name}</h2>
          <div className="modal-price">{formatPrice(product.price)}</div>
          {product.desc && <p style={{ color: "var(--ink-soft)", marginTop: "-10px", marginBottom: "22px" }}>{product.desc}</p>}

          {product.sizes && product.sizes.length > 0 && (
            <div className="field">
              <div className="field-label">
                <span>Talla</span>
                <span>{size}</span>
              </div>
              <div className="options">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={"opt-size" + (size === s ? " active" : "") + (isSold ? " disabled" : "")}
                    onClick={() => !isSold && setSize(s)}
                    disabled={isSold}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="field">
              <div className="field-label">
                <span>Color</span>
                <span>{color}</span>
              </div>
              <div className="options">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    className={"opt-color" + (color === c.name ? " active" : "")}
                    onClick={() => !isSold && setColor(c.name)}
                    disabled={isSold}
                  >
                    <span className="swatch" style={{ background: c.hex }}></span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="modal-cta">
            {isSold ? (
              <button className="btn btn-primary" disabled>Agotado</button>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={() => { onAdd(product, size, color); onClose(); }}>
                  Añadir al pedido
                </button>
                <a
                  className="btn btn-whatsapp"
                  href={buildWhatsappLink([{ product, size, color, qty: 1 }])}
                  target="_blank"
                  rel="noopener"
                >
                  <Icon.WhatsApp /> Pedir ya
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Cart drawer ----
function CartDrawer({ items, onClose, onQty, onRemove }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const total = items.reduce((sum, it) => sum + it.product.price * it.qty, 0);
  const isEmpty = items.length === 0;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3 className="drawer-title">Tu pedido</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar"><Icon.Close /></button>
        </div>
        <div className="drawer-body">
          {isEmpty ? (
            <div className="drawer-empty">
              <div className="icon">🌸</div>
              <h4>Tu pedido está vacío</h4>
              <p>Cuando añadas prendas, aparecerán aquí.</p>
            </div>
          ) : items.map((it, idx) => (
            <div className="cart-item" key={idx}>
              <div className="cart-thumb">
                <ProductImage product={it.product} />
              </div>
              <div className="cart-info">
                <h4 className="cart-name">{it.product.name}</h4>
                <div className="cart-meta">{it.size || "—"} · {it.color || "—"}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, gap: 8 }}>
                  <div className="cart-qty">
                    <button onClick={() => onQty(idx, -1)}><Icon.Minus /></button>
                    <span className="qty">{it.qty}</span>
                    <button onClick={() => onQty(idx, 1)}><Icon.Plus /></button>
                  </div>
                  <span className="cart-price">{formatPrice(it.product.price * it.qty)}</span>
                </div>
              </div>
              <button className="cart-remove" onClick={() => onRemove(idx)} aria-label="Quitar"><Icon.Trash /></button>
            </div>
          ))}
        </div>
        {!isEmpty && (
          <div className="drawer-foot">
            <div className="totals-row">
              <span className="totals-label">Total estimado</span>
              <span className="totals-val">{formatPrice(total)}</span>
            </div>
            <a className="btn btn-whatsapp" href={buildWhatsappLink(items)} target="_blank" rel="noopener" style={{ width: "100%" }}>
              <Icon.WhatsApp /> Mandar pedido por WhatsApp
            </a>
            <p style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", textAlign: "center", marginTop: 12, marginBottom: 0 }}>
              Te confirmamos disponibilidad y envío
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Footer ----
function Footer() {
  return (
    <div className="footer">
      <div className="footer-logo">
        <span>Nova</span><span className="pink">floe</span>
      </div>
      <div className="footer-tagline">prendas cool, de calidad, a precios que amas.</div>
      <div className="footer-links">
        <a className="footer-link" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener">
          <Icon.WhatsApp /> +57 300 354 7932
        </a>
        <a className="footer-link" href={`https://instagram.com/${INSTAGRAM_HANDLE}`} target="_blank" rel="noopener">
          <Icon.Instagram /> @{INSTAGRAM_HANDLE}
        </a>
      </div>
      <div className="footer-fine">Novafloe · 2026 · Hecho con cariño en Colombia</div>
    </div>
  );
}

// ---- Product editor (admin) ----
function ProductEditor({ target, products, catLabels, onUpdateLabels, onClose, onSave, onDelete, onReset }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (target.exportAll) {
    return (
      <div className="modal-scrim" onClick={onClose}>
        <div className="editor" onClick={(e) => e.stopPropagation()}>
          <div className="editor-head">
            <h3 className="drawer-title">Ajustes</h3>
            <button className="icon-btn" onClick={onClose}><Icon.Close /></button>
          </div>
          <div className="editor-body">
            <div style={{
              background: "var(--bg-pink)", borderRadius: 12, padding: "14px 16px",
              fontSize: 13, color: "var(--ink-soft)", marginBottom: 22
            }}>
              ✨ Cualquier cambio que hagas aquí <strong>se publica al instante</strong> en novafloe.vercel.app — todas tus clientas lo ven enseguida.
            </div>

            <h4 style={{ fontFamily: "var(--display)", fontSize: 22, margin: "0 0 4px" }}>Nombres de categorías</h4>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 14px" }}>
              Edita cómo aparecen los filtros. Los productos no se mueven de categoría.
            </p>
            {CAT_IDS.map(id => (
              <div key={id} style={{ marginBottom: 10 }}>
                <label className="flabel" style={{ marginTop: 0 }}>
                  {DEFAULT_CAT_LABELS[id]} <span style={{ color: "var(--muted)", textTransform: "none", letterSpacing: 0, fontSize: 10 }}>(id interno: {id})</span>
                </label>
                <input
                  className="input"
                  value={catLabels[id] || ""}
                  onChange={(e) => onUpdateLabels({ ...catLabels, [id]: e.target.value })}
                  placeholder={DEFAULT_CAT_LABELS[id]}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isNew = !target.id;
  const initial = isNew ? {
    id: "p" + Date.now().toString().slice(-6),
    ref: "",
    name: "",
    category: "crunchies",
    price: 35000,
    isNew: true,
    status: "available",
    image: "",
    colors: [{ name: "Rosa", hex: "#f4c9d7" }],
    sizes: ["S", "M", "L"],
    desc: ""
  } : { ...target };

  const [draft, setDraft] = useState(initial);
  const upd = (patch) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="editor" onClick={(e) => e.stopPropagation()}>
        <div className="editor-head">
          <h3 className="drawer-title">{isNew ? "Nuevo producto" : "Editar"}</h3>
          <button className="icon-btn" onClick={onClose}><Icon.Close /></button>
        </div>
        <div className="editor-body">
          <label className="flabel">Nombre</label>
          <input className="input" value={draft.name} onChange={(e) => upd({ name: e.target.value })} placeholder="Crunchie Sofía" />

          <div className="input-row">
            <div>
              <label className="flabel">Referencia</label>
              <input className="input" value={draft.ref} onChange={(e) => upd({ ref: e.target.value })} placeholder="CR-101" />
            </div>
            <div>
              <label className="flabel">Precio (COP)</label>
              <input className="input" type="number" value={draft.price} onChange={(e) => upd({ price: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          <label className="flabel">Categoría</label>
          <div className="status-row">
            {CAT_IDS.map(id => ({ id, label: (catLabels && catLabels[id]) || DEFAULT_CAT_LABELS[id] })).map(c => (
              <button
                key={c.id}
                className={"status-pill" + (draft.category === c.id ? " active" : "")}
                onClick={() => upd({ category: c.id })}
              >{c.label}</button>
            ))}
          </div>

          <label className="flabel">Estado</label>
          <div className="status-row">
            {[
              { id: "available", label: "Disponible" },
              { id: "low", label: "Pocas unidades" },
              { id: "soldout", label: "Agotado" },
            ].map(s => (
              <button
                key={s.id}
                className={"status-pill" + (draft.status === s.id ? " active" : "")}
                onClick={() => upd({ status: s.id })}
              >{s.label}</button>
            ))}
          </div>

          <label className="flabel" style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={draft.isNew}
              onChange={(e) => upd({ isNew: e.target.checked })}
              style={{ marginRight: 8, verticalAlign: "middle" }}
            />
            Marcar como novedad
          </label>

          <label className="flabel">Tallas</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {(draft.sizes || []).map((s, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "var(--ink)", color: "#fff",
                  padding: "6px 8px 6px 14px", borderRadius: 999,
                  fontSize: 13, fontWeight: 600
                }}
              >
                {s}
                <button
                  onClick={() => upd({ sizes: draft.sizes.filter((_, j) => j !== i) })}
                  style={{
                    width: 20, height: 20, borderRadius: 999, background: "rgba(255,255,255,0.2)",
                    color: "#fff", display: "grid", placeItems: "center", fontSize: 13, lineHeight: 1
                  }}
                  aria-label={`Quitar ${s}`}
                >×</button>
              </span>
            ))}
            {(!draft.sizes || draft.sizes.length === 0) && (
              <span style={{ fontSize: 12, color: "var(--muted)", padding: "8px 0" }}>
                Sin tallas — toca abajo para agregar
              </span>
            )}
          </div>
          <div style={{ fontSize: 10, fontFamily: "var(--mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
            Rápido — toca para agregar:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
            {["XS", "S", "M", "L", "XL", "Único"].map((s) => {
              const has = (draft.sizes || []).includes(s);
              return (
                <button
                  key={s}
                  className={"status-pill" + (has ? " active" : "")}
                  style={{ fontSize: 12, padding: "6px 12px", opacity: has ? 0.4 : 1 }}
                  onClick={() => {
                    if (has) {
                      upd({ sizes: draft.sizes.filter(x => x !== s) });
                    } else {
                      upd({ sizes: [...(draft.sizes || []), s] });
                    }
                  }}
                >{s}</button>
              );
            })}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {["6", "8", "10", "12", "14", "16"].map((s) => {
              const has = (draft.sizes || []).includes(s);
              return (
                <button
                  key={s}
                  className={"status-pill" + (has ? " active" : "")}
                  style={{ fontSize: 12, padding: "6px 12px", opacity: has ? 0.4 : 1 }}
                  onClick={() => {
                    if (has) {
                      upd({ sizes: draft.sizes.filter(x => x !== s) });
                    } else {
                      upd({ sizes: [...(draft.sizes || []), s] });
                    }
                  }}
                >{s}</button>
              );
            })}
          </div>
          <div className="input-row" style={{ gap: 6, marginBottom: 4 }}>
            <input
              className="input"
              placeholder="Otra talla (ej: 8/10)"
              style={{ marginBottom: 0 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const v = e.target.value.trim();
                  if (v && !(draft.sizes || []).includes(v)) {
                    upd({ sizes: [...(draft.sizes || []), v] });
                    e.target.value = "";
                  }
                }
              }}
            />
            <button
              className="btn btn-ghost"
              style={{ flex: "0 0 auto", padding: "0 16px", height: 44, fontSize: 12 }}
              onClick={(e) => {
                const input = e.currentTarget.previousSibling;
                const v = input.value.trim();
                if (v && !(draft.sizes || []).includes(v)) {
                  upd({ sizes: [...(draft.sizes || []), v] });
                  input.value = "";
                }
              }}
            >Agregar</button>
          </div>

          <label className="flabel">Colores</label>
          {(draft.colors || []).map((c, i) => (
            <div key={i} className="input-row" style={{ marginBottom: 6, alignItems: "center" }}>
              <input
                className="input"
                value={c.name}
                onChange={(e) => {
                  const next = [...draft.colors];
                  next[i] = { ...next[i], name: e.target.value };
                  upd({ colors: next });
                }}
                placeholder="Nombre"
                style={{ marginBottom: 0 }}
              />
              <div style={{ display: "flex", gap: 6, alignItems: "center", flex: "0 0 auto" }}>
                <input
                  type="color"
                  value={c.hex}
                  onChange={(e) => {
                    const next = [...draft.colors];
                    next[i] = { ...next[i], hex: e.target.value };
                    upd({ colors: next });
                  }}
                  style={{ width: 44, height: 44, border: "1px solid var(--line)", borderRadius: 8, padding: 0, background: "#fff" }}
                />
                <button
                  className="icon-btn"
                  onClick={() => {
                    const next = draft.colors.filter((_, j) => j !== i);
                    upd({ colors: next });
                  }}
                  style={{ width: 36, height: 36 }}
                ><Icon.Trash /></button>
              </div>
            </div>
          ))}
          <button
            className="btn btn-ghost"
            style={{ height: 36, fontSize: 12, width: "auto", padding: "0 14px" }}
            onClick={() => upd({ colors: [...(draft.colors || []), { name: "Color", hex: "#f4c9d7" }] })}
          >
            <Icon.Plus /> Añadir color
          </button>

          <label className="flabel">Foto del producto</label>
          {draft.image === "uploading" ? (
            <div style={{ marginBottom: 10, padding: "40px 16px", borderRadius: 10, background: "var(--bg-pink)", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pink-ink)" }}>
                Subiendo foto…
              </div>
            </div>
          ) : draft.image ? (
            <div style={{ position: "relative", marginBottom: 10, borderRadius: 8, overflow: "hidden", background: "var(--bg-soft)", aspectRatio: "1 / 1", maxWidth: 200 }}>
              <img src={draft.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                onClick={() => upd({ image: "" })}
                style={{
                  position: "absolute", top: 6, right: 6, width: 30, height: 30,
                  borderRadius: 999, background: "rgba(0,0,0,0.7)", color: "#fff",
                  display: "grid", placeItems: "center"
                }}
                aria-label="Quitar foto"
              ><Icon.Close /></button>
            </div>
          ) : (
            <div style={{ marginBottom: 10 }}>
              <label
                htmlFor={`file-${draft.id}`}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 8, padding: "28px 16px", borderRadius: 10,
                  border: "1.5px dashed var(--pink-deep)", background: "var(--bg-pink)",
                  cursor: "pointer", textAlign: "center"
                }}
              >
                <div style={{ fontSize: 28 }}>📸</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pink-ink)", fontWeight: 600 }}>
                  Subir foto del celular
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  Toca aquí · JPG o PNG
                </div>
              </label>
              <input
                id={`file-${draft.id}`}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  // Resize, then upload to Supabase Storage
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const img = new Image();
                    img.onload = async () => {
                      const MAX = 1000;
                      const scale = Math.min(1, MAX / img.width);
                      const w = Math.round(img.width * scale);
                      const h = Math.round(img.height * scale);
                      const canvas = document.createElement("canvas");
                      canvas.width = w; canvas.height = h;
                      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                      upd({ image: "uploading" }); // placeholder while uploading
                      canvas.toBlob(async (blob) => {
                        const filename = `${draft.id || ("p" + Date.now())}-${Date.now()}.jpg`;
                        const { data, error } = await supa.storage
                          .from("product-photos")
                          .upload(filename, blob, { contentType: "image/jpeg", upsert: true });
                        if (error) {
                          alert("Error subiendo foto: " + error.message);
                          upd({ image: "" });
                          return;
                        }
                        const { data: { publicUrl } } = supa.storage
                          .from("product-photos")
                          .getPublicUrl(data.path);
                        upd({ image: publicUrl });
                      }, "image/jpeg", 0.88);
                    };
                    img.src = ev.target.result;
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>
          )}
          <details style={{ marginBottom: 10 }}>
            <summary style={{ fontSize: 11, color: "var(--muted)", cursor: "pointer", fontFamily: "var(--mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              ¿o pegar una URL?
            </summary>
            <input
              className="input"
              value={draft.image && draft.image.startsWith("data:") ? "" : draft.image}
              onChange={(e) => upd({ image: e.target.value })}
              placeholder="https://..."
              style={{ marginTop: 8 }}
            />
          </details>

          <label className="flabel">Descripción</label>
          <textarea
            className="textarea"
            value={draft.desc}
            onChange={(e) => upd({ desc: e.target.value })}
            placeholder="Cuenta algo lindo del producto..."
          />
        </div>
        <div className="editor-foot">
          {!isNew && (
            <button
              className="btn btn-ghost danger"
              style={{ flex: "0 0 auto", padding: "0 18px", borderColor: "#e0b4b4" }}
              onClick={() => {
                if (confirm("¿Eliminar este producto?")) {
                  onDelete(draft.id);
                  onClose();
                }
              }}
            >
              <Icon.Trash />
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { onSave(draft); onClose(); }}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Login prompt for admin access (Supabase auth) ----
function LoginPrompt({ onSubmit, onClose }) {
  const [email, setEmail] = useState(localStorage.getItem("novafloe-admin-email") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const passRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    if (email) passRef.current?.focus();
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    const err = await onSubmit(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      setPassword("");
      passRef.current?.focus();
    } else {
      localStorage.setItem("novafloe-admin-email", email);
    }
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 380, borderRadius: 16, padding: 0 }}
      >
        <form onSubmit={handleSubmit} style={{ padding: "32px 28px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
            <h3 style={{ fontFamily: "var(--display)", fontSize: 28, margin: "0 0 4px" }}>Acceso admin</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: 0 }}>
              Inicia sesión para editar el catálogo
            </p>
          </div>
          <label className="flabel" style={{ marginTop: 0 }}>Email</label>
          <input
            className="input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            required
          />
          <label className="flabel">Contraseña</label>
          <input
            ref={passRef}
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={error ? { borderColor: "#c0392b", animation: "shake 0.4s" } : {}}
          />
          {error && (
            <div style={{ color: "#c0392b", fontSize: 12, marginTop: 4, marginBottom: 8 }}>
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !email || !password}>
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Main App ----
function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catLabels, setCatLabels] = useState({ ...DEFAULT_CAT_LABELS });
  const CATEGORIES_DYN = useMemo(() => buildCategories(catLabels), [catLabels]);
  const [activeCat, setActiveCat] = useState("todo");
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("novafloe-favs") || "[]"); } catch (e) { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [session, setSession] = useState(null);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const adminMode = !!session;

  // ---- Load products + categories from Supabase ----
  const loadAll = async () => {
    const [{ data: rows }, { data: labels }] = await Promise.all([
      supa.from("products").select("*").order("sort_order", { ascending: true }),
      supa.from("category_labels").select("*"),
    ]);
    if (rows) setProducts(rows.map(rowToProduct));
    if (labels) {
      const map = { ...DEFAULT_CAT_LABELS };
      labels.forEach(l => { map[l.id] = l.label; });
      setCatLabels(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();

    // Subscribe to real-time changes
    const ch = supa
      .channel("nf-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "category_labels" }, () => loadAll())
      .subscribe();

    return () => { supa.removeChannel(ch); };
    // eslint-disable-next-line
  }, []);

  // ---- Auth session ----
  useEffect(() => {
    supa.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supa.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---- Restore cart once products are loaded (so we can re-attach product refs) ----
  useEffect(() => {
    if (!products.length) return;
    try {
      const raw = JSON.parse(localStorage.getItem("novafloe-cart") || "[]");
      const restored = raw.map(it => {
        const product = products.find(p => p.id === it.productId);
        return product ? { product, size: it.size, color: it.color, qty: it.qty } : null;
      }).filter(Boolean);
      setCart(restored);
    } catch (e) {}
    // eslint-disable-next-line
  }, [products.length === 0]);

  // ---- Tap logo 5 times → show login (or log out if already in) ----
  const tapsRef = useRef([]);
  const onLogoTap = () => {
    const now = Date.now();
    tapsRef.current = [...tapsRef.current.filter(t => now - t < 3000), now];
    if (tapsRef.current.length >= 5) {
      tapsRef.current = [];
      if (adminMode) {
        supa.auth.signOut();
        setToast("Cerraste sesión 🔒");
        setTimeout(() => setToast(""), 1800);
      } else {
        setLoginPrompt(true);
      }
    }
  };

  const onLoginSubmit = async (email, password) => {
    const { error } = await supa.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message?.toLowerCase().includes("invalid")) return "Email o contraseña incorrectos";
      return error.message || "Error al iniciar sesión";
    }
    setLoginPrompt(false);
    setToast("¡Hola! Modo admin activado 🔓");
    setTimeout(() => setToast(""), 1800);
    return null;
  };

  const [editing, setEditing] = useState(null);
  const catalogRef = useRef(null);

  // Persist cart and favs locally (per-client)
  useEffect(() => {
    localStorage.setItem("novafloe-cart", JSON.stringify(cart.map(it => ({
      productId: it.product.id, size: it.size, color: it.color, qty: it.qty
    }))));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("novafloe-favs", JSON.stringify(favs));
  }, [favs]);

  const filtered = useMemo(() => {
    const cat = CATEGORIES_DYN.find(c => c.id === activeCat);
    return products.filter(cat.filter);
  }, [products, activeCat, CATEGORIES_DYN]);

  // Scroll-reveal observer for cards and section headings
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    const targets = document.querySelectorAll(".card, .reveal");
    targets.forEach((el, i) => {
      if (el.classList.contains("card")) {
        el.style.animationDelay = `${(i % 4) * 0.06}s`;
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [filtered]);

  const cartCount = cart.reduce((sum, it) => sum + it.qty, 0);

  const addToCart = (product, size, color) => {
    setCart((prev) => {
      const existing = prev.findIndex(it => it.product.id === product.id && it.size === size && it.color === color);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], qty: next[existing].qty + 1 };
        return next;
      }
      return [...prev, { product, size, color, qty: 1 }];
    });
    showToast(`Añadido al pedido ✓`);
  };

  const updateQty = (idx, delta) => {
    setCart((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], qty: Math.max(1, next[idx].qty + delta) };
      return next;
    });
  };

  const removeItem = (idx) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleFav = (id) => {
    setFavs((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  // ---- Supabase-backed product mutations ----
  const saveProduct = async (product) => {
    const row = productToRow(product);
    const { error } = await supa.from("products").upsert(row);
    if (error) {
      showToast("Error al guardar: " + error.message);
      return;
    }
    // Optimistic — real-time will reconfirm
    setProducts((prev) => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        const next = [...prev]; next[idx] = product; return next;
      }
      return [...prev, product];
    });
    showToast("Producto guardado ✓");
  };

  const deleteProduct = async (id) => {
    const { error } = await supa.from("products").delete().eq("id", id);
    if (error) { showToast("Error al borrar: " + error.message); return; }
    setProducts((prev) => prev.filter(p => p.id !== id));
    showToast("Producto eliminado");
  };

  const updateCategoryLabels = async (next) => {
    setCatLabels(next);
    // Upsert each label
    const rows = Object.entries(next).map(([id, label]) => ({ id, label }));
    await supa.from("category_labels").upsert(rows);
  };

  const seedSamples = async () => {
    if (!confirm("Esto agregará 8 productos de muestra para que veas cómo se ve. ¿Continuar?")) return;
    const rows = SEED_PRODUCTS.map(productToRow);
    const { error } = await supa.from("products").upsert(rows);
    if (error) { showToast("Error: " + error.message); return; }
    showToast("¡Listo! 8 productos importados");
    loadAll();
  };

  const scrollToCatalog = () => {
    if (catalogRef.current) {
      window.scrollTo({ top: catalogRef.current.offsetTop - 60, behavior: "smooth" });
    }
  };

  return (
    <div className={"app" + (adminMode ? " admin-on" : "")}>
      {adminMode && (
        <div className="admin-bar">
          <span>Modo edición · {session?.user?.email}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditing({ isNew: true })}>+ Producto</button>
            <button onClick={() => setEditing({ exportAll: true })}>Categorías</button>
            <button onClick={() => supa.auth.signOut()}>Salir</button>
          </div>
        </div>
      )}

      <Topbar
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        adminMode={adminMode}
        onOpenExport={() => setEditing({ exportAll: true })}
        onLogoTap={onLogoTap}
      />

      <Hero onScrollToCatalog={scrollToCatalog} />
      <Marquee products={products} />

      <section className="section" ref={catalogRef}>
        <div className="section-head reveal">
          <div>
            <div className="section-eyebrow">El catálogo</div>
            <h2 className="section-title">Lo <span className="pink">nuevo</span> de hoy</h2>
          </div>
        </div>
        <div className="chips">
          {CATEGORIES_DYN.map((c) => {
            const count = products.filter(c.filter).length;
            return (
              <button
                key={c.id}
                className={"chip" + (activeCat === c.id ? " active" : "")}
                onClick={() => setActiveCat(c.id)}
              >
                {c.label} <span className="chip-count">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="grid">
          {filtered.map((p) => (
            <Card
              key={p.id}
              product={p}
              onOpen={setSelected}
              isFav={favs.includes(p.id)}
              onFav={toggleFav}
              adminMode={adminMode}
              onEdit={setEditing}
            />
          ))}
        </div>
        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🌸</div>
            {products.length === 0 ? (
              <>
                <p style={{ margin: "0 0 16px" }}>Tu catálogo está vacío.</p>
                {adminMode && (
                  <button className="btn btn-primary" onClick={seedSamples} style={{ padding: "0 22px", width: "auto" }}>
                    Importar 8 productos de muestra
                  </button>
                )}
                {!adminMode && (
                  <p style={{ fontSize: 13 }}>Vuelve pronto, estamos preparando algo lindo 💕</p>
                )}
              </>
            ) : (
              <p>No hay productos en esta categoría todavía.</p>
            )}
          </div>
        )}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Cargando catálogo…
            </div>
          </div>
        )}
      </section>

      <Footer />

      {cartCount > 0 && !cartOpen && !selected && !editing && (
        <button className="cart-fab" onClick={() => setCartOpen(true)}>
          <Icon.Bag />
          <span>{cartCount} {cartCount === 1 ? "prenda" : "prendas"}</span>
          <span className="dot"></span>
          <span>Ver pedido</span>
        </button>
      )}

      {selected && (
        <ProductDetail
          product={selected}
          onClose={() => setSelected(null)}
          onAdd={addToCart}
        />
      )}

      {cartOpen && (
        <CartDrawer
          items={cart}
          onClose={() => setCartOpen(false)}
          onQty={updateQty}
          onRemove={removeItem}
        />
      )}

      {editing && (
        <ProductEditor
          target={editing}
          products={products}
          catLabels={catLabels}
          onUpdateLabels={updateCategoryLabels}
          onClose={() => setEditing(null)}
          onSave={saveProduct}
          onDelete={deleteProduct}
        />
      )}

      {toast && <div className="toast">{toast}</div>}

      {loginPrompt && (
        <LoginPrompt
          onSubmit={onLoginSubmit}
          onClose={() => setLoginPrompt(false)}
        />
      )}
    </div>
  );
}

// ---- Mount ----
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
