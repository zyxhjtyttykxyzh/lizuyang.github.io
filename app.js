// Basic store and cart via localStorage
const STORAGE_KEYS = {
	cart: 'ipshop_cart_v1'
};

function readCart(){
	try{ return JSON.parse(localStorage.getItem(STORAGE_KEYS.cart)||'[]'); }catch(e){ return []; }
}
function writeCart(items){
	localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items));
	dispatchCartCount();
}
function clearCart(){ writeCart([]); }
function addToCart(product){
	const cart = readCart();
	const idx = cart.findIndex(i=>i.id===product.id);
	if(idx>-1){ cart[idx].qty += product.qty||1; }
	else{ cart.push({ id:product.id, name:product.name, price:product.price, image:product.image, qty:product.qty||1 }); }
	writeCart(cart);
}
function updateQty(id, qty){
	const cart = readCart().map(i=> i.id===id ? { ...i, qty: Math.max(1, qty)} : i);
	writeCart(cart);
}
function removeFromCart(id){
	writeCart(readCart().filter(i=>i.id!==id));
}
function cartCount(){ return readCart().reduce((s,i)=>s+i.qty,0); }
function cartTotal(){ return readCart().reduce((s,i)=>s+i.qty*i.price,0); }

function dispatchCartCount(){
	const detail = { count: cartCount() };
	document.dispatchEvent(new CustomEvent('cart:changed',{ detail }));
}

function formatPrice(n){ return `¥${n.toFixed(2)}`; }

// Mount cart count to any element with [data-cart-count]
function mountCartBadge(){
	const els = document.querySelectorAll('[data-cart-count]');
	const update = ()=> els.forEach(el=> el.textContent = String(cartCount()));
	update();
	document.addEventListener('cart:changed', update);
}

// Simple router helpers
function activeNav(){
	const path = location.pathname.split('/').pop() || 'index.html';
	document.querySelectorAll('nav a').forEach(a=>{
		const href = a.getAttribute('href');
		if(href && href.indexOf(path)>-1){ a.style.color = 'var(--brand)'; }
	});
}

// Page-specific bootstraps
function bootstrapIndex(){
	// Hero carousel
	const carousel = document.querySelector('.hero-carousel');
	if(carousel){
		const slides = carousel.querySelectorAll('.carousel-slide');
		const prevBtn = document.querySelector('.carousel-btn-prev');
		const nextBtn = document.querySelector('.carousel-btn-next');
		let currentIndex = 0;
		let autoSlideTimer = null;
		
		function goToSlide(index){
			slides[currentIndex].classList.remove('active');
			currentIndex = index;
			slides[currentIndex].classList.add('active');
		}
		
		function nextSlide(){
			goToSlide((currentIndex + 1) % slides.length);
		}
		
		function prevSlide(){
			goToSlide((currentIndex - 1 + slides.length) % slides.length);
		}
		
		function startAutoSlide(){
			clearInterval(autoSlideTimer);
			autoSlideTimer = setInterval(nextSlide, 4000);
		}
		
		function resetAutoSlide(){
			clearInterval(autoSlideTimer);
			startAutoSlide();
		}
		
		if(prevBtn){
			prevBtn.addEventListener('click', ()=>{
				prevSlide();
				resetAutoSlide();
			});
		}
		
		if(nextBtn){
			nextBtn.addEventListener('click', ()=>{
				nextSlide();
				resetAutoSlide();
			});
		}
		
		startAutoSlide(); // 启动自动轮播
	}
	// Showcase emoji strip: load from hardcoded list if present in DOM
	const strip = document.querySelector('#emoji-strip');
	if(strip){
		const sample = [
			'images/taotao_01.jpg',
			'images/sisi_01.jpg',
			'images/qiqi_01.jpg',
			'images/taotao_02.jpg',
			'images/sisi_02.jpg'
		];
		sample.forEach(src=>{
			const img = new Image();
			img.src = src;
			img.loading = 'lazy';
			img.alt = '表情包';
			img.style.height = '64px';
			img.style.width = '64px';
			img.style.objectFit = 'contain';
			img.onerror = ()=> img.style.opacity = .15;
			strip.appendChild(img);
		});
	}
}

function bootstrapProducts(){
	const list = document.querySelector('#product-list');
	if(!list) return;
	const products = [
		{ id:'p1', name:'陶陶·青花杯', price:59, image:'images/cup_taotao.jpg' },
		{ id:'p2', name:'思思·瓷纹帆布袋', price:89, image:'images/tote_sisi.jpg' },
		{ id:'p3', name:'琦琦·釉彩挂件', price:49, image:'images/charm_qiqi.jpg' },
		{ id:'p4', name:'三人·限量拼图', price:129, image:'images/puzzle_trio.jpg' }
	];
	products.forEach(p=>{
		const card = document.createElement('div');
		card.className = 'card product-card';
		card.innerHTML = `
			<div class="thumb" style="background-image:url('${p.image}');background-size:cover;background-position:center"></div>
			<div class="body">
				<div class="meta">
					<strong>${p.name}</strong>
					<span class="price">${formatPrice(p.price)}</span>
				</div>
				<div class="cta-group">
					<button class="btn primary" data-add="${p.id}">加入购物车</button>
				</div>
			</div>
		`;
		list.appendChild(card);
	});
	list.addEventListener('click', (e)=>{
		const target = e.target.closest('[data-add]');
		if(!target) return;
		const id = target.getAttribute('data-add');
		const name = target.parentElement.parentElement.querySelector('strong').textContent;
		const price = Number(target.parentElement.parentElement.querySelector('.price').textContent.replace('¥',''));
		const image = list.querySelector(`[data-add="${id}"]`).closest('.card').querySelector('.thumb').style.backgroundImage.replace(/url\("?|"?\)/g,'');
		addToCart({ id, name, price, image, qty:1 });
		alert('已加入购物车');
	});
}

function bootstrapCheckout(){
	const tbody = document.querySelector('#cart-body');
	const totalEl = document.querySelector('#cart-total');
	const form = document.querySelector('#checkout-form');
	if(!tbody || !totalEl || !form) return;
	const render = ()=>{
		tbody.innerHTML = '';
		readCart().forEach(item=>{
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td><div style="display:flex;align-items:center;gap:10px"><img src="${item.image}" alt="${item.name}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid var(--border)"><span>${item.name}</span></div></td>
				<td>${formatPrice(item.price)}</td>
				<td><input type="number" min="1" value="${item.qty}" data-qty="${item.id}" style="width:70px"></td>
				<td>${formatPrice(item.price*item.qty)}</td>
				<td><button class="btn" data-remove="${item.id}">移除</button></td>
			`;
			tbody.appendChild(tr);
		});
		totalEl.textContent = formatPrice(cartTotal());
	};
	render();
	tbody.addEventListener('input', (e)=>{
		const qtyEl = e.target.closest('[data-qty]');
		if(qtyEl){ updateQty(qtyEl.getAttribute('data-qty'), Number(qtyEl.value||1)); render(); }
	});
	tbody.addEventListener('click', (e)=>{
		const rm = e.target.closest('[data-remove]');
		if(rm){ removeFromCart(rm.getAttribute('data-remove')); render(); }
	});
	form.addEventListener('submit', (e)=>{
		e.preventDefault();
		if(readCart().length===0){ alert('购物车为空'); return; }
		// mock payment delay
		const btn = form.querySelector('button[type="submit"]');
		btn.disabled = true; btn.textContent = '支付中…';
		setTimeout(()=>{
			btn.disabled = false; btn.textContent = '支付';
			clearCart();
			location.href = 'checkout.html?success=1';
		}, 900);
	});
	if(new URLSearchParams(location.search).get('success')==='1'){
		const note = document.querySelector('#pay-success');
		if(note){ note.style.display = 'block'; }
	}
}

function mountHeader(){
	// cart badge
	mountCartBadge();
	activeNav();
}

document.addEventListener('DOMContentLoaded', ()=>{
	mountHeader();
	dispatchCartCount();
	const page = document.body.getAttribute('data-page');
	switch(page){
		case 'index': bootstrapIndex(); break;
		case 'products': bootstrapProducts(); break;
		case 'checkout': bootstrapCheckout(); break;
		default: break;
	}
});
