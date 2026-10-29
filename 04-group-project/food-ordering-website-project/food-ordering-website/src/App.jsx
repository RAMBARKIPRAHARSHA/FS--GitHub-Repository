import { useMemo, useState } from "react";
import foodData from "./food.json";

const categories = ["All", ...new Set(foodData.map((food) => food.category))];

export default function App() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const filteredFoods = useMemo(() => foodData.filter((food) =>
    (category === "All" || food.category === category) &&
    food.name.toLowerCase().includes(search.toLowerCase())
  ), [category, search]);

  function addToCart(food) {
    setCart((old) => {
      const found = old.find((item) => item.id === food.id);
      return found
        ? old.map((item) => item.id === food.id ? { ...item, qty: item.qty + 1 } : item)
        : [...old, { ...food, qty: 1 }];
    });
  }

  function changeQuantity(id, amount) {
    setCart((old) => old
      .map((item) => item.id === id ? { ...item, qty: item.qty + amount } : item)
      .filter((item) => item.qty > 0));
  }

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  function placeOrder() {
    if (!cart.length) return;
    window.alert(`Demo order placed successfully!\nItems: ${itemCount}\nTotal: ₹${total}\n\nThank you for ordering from QuickBite.`);
    setCart([]);
    setCartOpen(false);
  }

  function goToMenu() {
    document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#home">Quick<span>Bite.</span></a>
        <nav className="nav"><a href="#home">Home</a><a href="#menu">Menu</a><a href="#about">About</a></nav>
        <button className="cart-pill" onClick={() => setCartOpen(true)}>🛒 Cart ({itemCount})</button>
      </header>

      <main>
        <section className="hero" id="home">
          <div>
            <p className="eyebrow">Good food, good mood</p>
            <h1>Your cravings,<br />delivered <span>fresh.</span></h1>
            <p className="hero-description">Discover tasty meals made with love. Choose your favourites, add them to your cart, and enjoy a simple food-ordering experience.</p>
            <div className="hero-actions">
              <button className="primary" onClick={goToMenu}>Explore Menu →</button>
              <button className="secondary" onClick={() => setCartOpen(true)}>View Cart ({itemCount})</button>
            </div>
          </div>
          <div className="hero-art" aria-label="Food illustration">
            <div className="float-tag tag-one">⭐ 4.8 rated</div>
            <div className="hero-emoji">🍔</div>
            <div className="float-tag tag-two">⚡ Fast &amp; fresh</div>
          </div>
        </section>

        <section className="section" id="menu">
          <div className="section-head">
            <div><h2>Our Menu</h2><p className="sub">Find something delicious for every mood.</p></div>
            <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search food..." aria-label="Search food" />
          </div>
          <div className="filters">
            {categories.map((item) => <button key={item} className={`filter ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <div className="food-grid">
            {filteredFoods.length ? filteredFoods.map((food) => (
              <article className="food-card" key={food.id}>
                <div className="food-image"><span className="badge">{food.badge}</span><span>{food.emoji}</span></div>
                <div className="food-info">
                  <div className="food-title-row"><h3>{food.name}</h3><span className="price">₹{food.price}</span></div>
                  <p className="description">{food.description}</p>
                  <div className="food-bottom"><span className="rating">⭐ {food.rating} · {food.category}</span><button className="add-btn" onClick={() => addToCart(food)}>+ Add</button></div>
                </div>
              </article>
            )) : <div className="empty">No food found. Try another search.</div>}
          </div>
        </section>

        <section className="promo" id="about">
          <div><h2>Made fresh. Served happy.</h2><p>A mini food-ordering website built with HTML, CSS, React and dummy JSON data.</p></div>
          <button className="primary" onClick={goToMenu}>Order now</button>
        </section>
      </main>

      <footer>© 2026 QuickBite · Mini React project · Demo only, no real payment or delivery</footer>

      {cartOpen && <div className="cart-panel" role="dialog" aria-label="Shopping cart">
        <div className="cart-header"><h3>Your Cart 🛒</h3><button className="close" onClick={() => setCartOpen(false)}>✕</button></div>
        {!cart.length ? <div className="cart-empty"><div className="empty-emoji">🛍️</div><p>Your cart is empty.</p><button className="primary" onClick={() => { setCartOpen(false); goToMenu(); }}>Browse menu</button></div> : <>
          {cart.map((item) => <div className="cart-item" key={item.id}>
            <div className="cart-emoji">{item.emoji}</div>
            <div className="cart-name">{item.name}<div className="cart-price">₹{item.price} each</div></div>
            <div className="quantity">
              <button onClick={() => changeQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}>−</button>
              <span>{item.qty}</span>
              <button onClick={() => changeQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}>+</button>
            </div>
          </div>)}
          <div className="total"><span>Total</span><span>₹{total}</span></div>
          <button className="primary checkout" onClick={placeOrder}>Place Demo Order · ₹{total}</button>
        </>}
      </div>}
    </>
  );
}
