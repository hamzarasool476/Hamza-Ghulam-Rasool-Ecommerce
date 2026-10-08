
const money = n => `Rs. ${Number(n).toLocaleString('en-PK')}`;
const getCart = () => JSON.parse(localStorage.getItem('hgr_cart') || '[]');
const saveCart = c => { localStorage.setItem('hgr_cart', JSON.stringify(c)); updateCartCount(); };
const getWishlist = () => JSON.parse(localStorage.getItem('hgr_wishlist') || '[]');
const saveWishlist = w => localStorage.setItem('hgr_wishlist', JSON.stringify(w));
const productById = id => PRODUCTS.find(p=>p.id==id);

function updateCartCount(){
  const n=getCart().reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll('.cart-count').forEach(x=>x.textContent=n);
}
function stars(r){ return '★'.repeat(Math.round(r))+'☆'.repeat(5-Math.round(r)); }
function toast(msg){
  const el=document.getElementById('toast'); if(!el)return;
  el.querySelector('.toast-body').textContent=msg;
  bootstrap.Toast.getOrCreateInstance(el).show();
}
function addToCart(id, qty=1){
  const cart=getCart(), item=cart.find(i=>i.id==id);
  if(item)item.qty+=qty; else cart.push({id:Number(id),qty});
  saveCart(cart); toast('Product added to cart.');
}
function toggleWish(id){
  let w=getWishlist(); id=Number(id);
  if(w.includes(id)){w=w.filter(x=>x!==id);toast('Removed from wishlist.')}
  else{w.push(id);toast('Added to wishlist.')}
  saveWishlist(w); renderCurrent();
}
function productCard(p){
  const w=getWishlist().includes(p.id);
  return `<div class="product-card">
    <div class="product-img"><button class="wishlist" onclick="toggleWish(${p.id})"><i class="${w?'fa-solid':'fa-regular'} fa-heart ${w?'text-danger':''}"></i></button>
      <span class="mock-product">${p.icon}</span>
      <span class="position-absolute bottom-0 start-0 m-2 badge text-bg-dark">${p.discount}% OFF</span>
    </div>
    <div class="product-body">
      <div class="small text-muted">${p.category}</div><div class="product-title">${p.name}</div>
      <div class="rating">${stars(p.rating)} <span class="text-muted">(${p.reviews})</span></div>
      <div class="mt-1"><span class="price">${money(p.price)}</span><span class="old-price">${money(p.oldPrice)}</span></div>
      <div class="product-actions">
        <button class="btn btn-outline-dark" onclick="openQuick(${p.id})"><i class="fa-regular fa-eye"></i></button>
        <a class="btn btn-gold" href="product.html?id=${p.id}">View</a>
        <button class="btn btn-dark" onclick="addToCart(${p.id})"><i class="fa-solid fa-cart-plus"></i></button>
      </div>
    </div>
  </div>`;
}
function renderProducts(list, target='productGrid'){
  const el=document.getElementById(target); if(!el)return;
  el.innerHTML=list.length?list.map(productCard).join(''):`<div class="col-12"><div class="empty-state"><i class="fa-regular fa-face-frown"></i><h4>No products found</h4><p>Try another search or filter.</p></div></div>`;
}
function openQuick(id){
  const p=productById(id), el=document.getElementById('quickModal'); if(!el)return;
  el.querySelector('.quick-img').textContent=p.icon;
  el.querySelector('.quick-title').textContent=p.name;
  el.querySelector('.quick-desc').textContent=p.desc;
  el.querySelector('.quick-price').textContent=money(p.price);
  el.querySelector('.quick-add').onclick=()=>addToCart(p.id);
  bootstrap.Modal.getOrCreateInstance(el).show();
}
function renderCurrent(){
  if(document.getElementById('productGrid')) initShop();
  if(document.getElementById('homeProducts')) renderProducts(PRODUCTS.slice(0,8),'homeProducts');
  if(document.getElementById('wishlistGrid')) initWishlist();
  if(document.getElementById('productDetail')) initProduct();
}
function initShop(){
  const search=(document.getElementById('shopSearch')?.value||'').toLowerCase();
  const cat=document.getElementById('categoryFilter')?.value||'All';
  const sort=document.getElementById('sortFilter')?.value||'featured';
  let list=PRODUCTS.filter(p=>(cat==='All'||p.category===cat)&&(!search||p.name.toLowerCase().includes(search)||p.category.toLowerCase().includes(search)));
  if(sort==='low')list.sort((a,b)=>a.price-b.price); if(sort==='high')list.sort((a,b)=>b.price-a.price); if(sort==='rating')list.sort((a,b)=>b.rating-a.rating);
  renderProducts(list);
}
function initProduct(){
  const id=new URLSearchParams(location.search).get('id')||1,p=productById(id),el=document.getElementById('productDetail');
  if(!p||!el)return;
  el.innerHTML=`<div class="row g-5"><div class="col-lg-6"><div class="quick-img" style="min-height:480px;font-size:12rem">${p.icon}</div></div>
  <div class="col-lg-6"><div class="eyebrow">Premium Collection</div><h1 class="fw-bold mt-2">${p.name}</h1><div class="rating mb-3">${stars(p.rating)} <span class="text-muted"> ${p.rating} (${p.reviews} reviews)</span></div>
  <h2 class="price">${money(p.price)} <span class="old-price fs-6">${money(p.oldPrice)}</span></h2><p class="text-muted">${p.desc}</p>
  <div class="mb-3"><label class="fw-bold">Color</label><div class="d-flex gap-2 mt-2"><button class="btn btn-outline-dark">Black</button><button class="btn btn-outline-dark">Gold</button></div></div>
  <div class="mb-3"><label class="fw-bold">Size</label><select class="form-select mt-2" style="max-width:220px"><option>Standard</option><option>Small</option><option>Large</option></select></div>
  <div class="d-flex gap-2"><button class="btn btn-dark btn-lg" onclick="addToCart(${p.id})">Add to Cart</button><button class="btn btn-gold btn-lg" onclick="addToCart(${p.id});location.href='checkout.html'">Buy Now</button></div>
  <hr><div class="row g-3 mt-2"><div class="col-4"><i class="fa-solid fa-truck text-warning"></i><small class="d-block">Fast Delivery</small></div><div class="col-4"><i class="fa-solid fa-rotate-left text-warning"></i><small class="d-block">7-Day Returns</small></div><div class="col-4"><i class="fa-solid fa-shield-halved text-warning"></i><small class="d-block">Secure Pay</small></div></div></div></div>`;
  const rel=PRODUCTS.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,4); renderProducts(rel,'relatedProducts');
}
function initCart(){
  const cart=getCart(), el=document.getElementById('cartItems'), summary=document.getElementById('cartSummary'); if(!el)return;
  if(!cart.length){el.innerHTML=`<div class="empty-state"><i class="fa-solid fa-cart-shopping"></i><h3>Your cart is empty</h3><a href="shop.html" class="btn btn-gold">Start Shopping</a></div>`;summary.innerHTML='';return}
  el.innerHTML=cart.map(i=>{const p=productById(i.id);return `<div class="cart-item"><div class="row align-items-center g-3"><div class="col-auto"><div class="cart-thumb">${p.icon}</div></div><div class="col"><strong>${p.name}</strong><div class="text-muted small">${p.category}</div><span class="price">${money(p.price)}</span></div><div class="col-auto"><div class="input-group" style="width:130px"><button class="btn btn-outline-secondary" onclick="changeQty(${p.id},-1)">−</button><input class="form-control text-center" value="${i.qty}" readonly><button class="btn btn-outline-secondary" onclick="changeQty(${p.id},1)">+</button></div></div><div class="col-auto fw-bold">${money(p.price*i.qty)}</div><div class="col-auto"><button class="btn btn-sm btn-outline-danger" onclick="removeCart(${p.id})"><i class="fa-regular fa-trash-can"></i></button></div></div></div>`}).join('');
  const sub=cart.reduce((s,i)=>s+productById(i.id).price*i.qty,0),ship=sub>=10000?0:250,total=sub+ship;
  summary.innerHTML=`<h5 class="fw-bold">Order Summary</h5><div class="d-flex justify-content-between"><span>Subtotal</span><b>${money(sub)}</b></div><div class="d-flex justify-content-between"><span>Shipping</span><b>${ship?money(ship):'FREE'}</b></div><hr><div class="d-flex justify-content-between fs-5"><b>Total</b><b class="price">${money(total)}</b></div><a href="checkout.html" class="btn btn-dark w-100 mt-3">Proceed to Checkout</a>`;
}
function changeQty(id,d){let c=getCart(),i=c.find(x=>x.id==id);i.qty=Math.max(1,i.qty+d);saveCart(c);initCart()}
function removeCart(id){saveCart(getCart().filter(x=>x.id!=id));initCart();toast('Item removed.')}
function initWishlist(){
  const list=getWishlist().map(productById).filter(Boolean); renderProducts(list,'wishlistGrid');
}
function initCheckout(){
  const cart=getCart(),el=document.getElementById('checkoutSummary'); if(!el)return;
  const sub=cart.reduce((s,i)=>s+productById(i.id).price*i.qty,0),ship=sub>=10000?0:250;
  el.innerHTML=`${cart.map(i=>{const p=productById(i.id);return `<div class="d-flex justify-content-between mb-2"><span>${p.name} × ${i.qty}</span><b>${money(p.price*i.qty)}</b></div>`}).join('')}<hr><div class="d-flex justify-content-between"><span>Subtotal</span><b>${money(sub)}</b></div><div class="d-flex justify-content-between"><span>Shipping</span><b>${ship?money(ship):'FREE'}</b></div><hr><div class="d-flex justify-content-between fs-5"><b>Total</b><b class="price">${money(sub+ship)}</b></div>`;
  document.getElementById('placeOrder')?.addEventListener('click',()=>{if(!document.getElementById('checkoutForm').checkValidity()){document.getElementById('checkoutForm').reportValidity();return} localStorage.setItem('hgr_last_order',JSON.stringify({number:'HGR-'+Date.now().toString().slice(-7),date:new Date().toLocaleDateString(),total:sub+ship}));localStorage.removeItem('hgr_cart');location.href='order-success.html'});
}
document.addEventListener('DOMContentLoaded',()=>{
  updateCartCount();
  document.querySelectorAll('[data-year]').forEach(x=>x.textContent=new Date().getFullYear());
  const path=location.pathname;
  if(document.getElementById('homeProducts'))renderProducts(PRODUCTS.slice(0,8),'homeProducts');
  if(document.getElementById('productGrid')){const cf=document.getElementById('categoryFilter');[...new Set(PRODUCTS.map(p=>p.category))].sort().forEach(c=>cf?.insertAdjacentHTML('beforeend',`<option>${c}</option>`));initShop();['shopSearch','categoryFilter','sortFilter'].forEach(id=>document.getElementById(id)?.addEventListener('input',initShop));}
  if(document.getElementById('cartItems'))initCart(); if(document.getElementById('wishlistGrid'))initWishlist(); if(document.getElementById('productDetail'))initProduct(); if(document.getElementById('checkoutSummary'))initCheckout();
  document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>addToCart(Number(b.dataset.add))));
});

document.addEventListener('DOMContentLoaded',()=>{
  const qcat=new URLSearchParams(location.search).get('category');
  const cf=document.getElementById('categoryFilter');
  if(qcat && cf){setTimeout(()=>{cf.value=qcat;initShop()},50);}
});
