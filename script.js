
const TG_WEBAPP="https://script.google.com/macros/s/AKfycby69uPxgQrfYFrqMrJiEx0716jpM2lU6V75UIjn4rlH1DyfylMz8Maub_OQIE3gw2w/exec";
const SOCIAL={
  telegram:"https://t.me/essenseparfumeua",
  tiktok:"https://www.tiktok.com/@essenseparfum1?_r=1&_t=ZS-99Z1DR98iiC"
};

let products=[], cart=JSON.parse(localStorage.getItem("essenseCart")||"[]"), selected=null;

const $=s=>document.querySelector(s);
const money=n=>n.toLocaleString("uk-UA")+" грн";

function save(){localStorage.setItem("essenseCart",JSON.stringify(cart));renderCart();updateCount()}
function updateCount(){$("#cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0)}
function renderGrid(list=products){
  $("#grid").innerHTML=list.map(p=>`
  <article class="card" data-id="${p.id}">
    <div class="photo"><span class="sale">${p.price<749?"SALE":"HIT"}</span><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
    <div class="card-body"><p class="brand">${p.brand}</p><h3>${p.name}</h3><div class="rating">★★★★★ <span>${p.rating}</span></div><div class="prices"><strong>${money(p.price)}</strong><del>${money(p.oldPrice)}</del></div><button class="add" data-add="${p.id}">ЗАМОВИТИ</button></div>
  </article>`).join("");
}
function openProduct(p){
 selected=p; $("#detailImg").src=p.image; $("#detailImg").alt=p.name; $("#detailBrand").textContent=p.brand; $("#detailName").textContent=p.name;
 $("#detailDesc").textContent=p.description; $("#detailPrice").textContent=money(p.price); $("#detailOld").textContent=money(p.oldPrice);
 $("#detailNotes").innerHTML=p.notes.map(x=>`<span>${x}</span>`).join("");
 $("#productModal").classList.add("open");
}
function addToCart(id){
 const p=products.find(x=>x.id==id); if(!p)return;
 const item=cart.find(x=>x.id==id); item?item.qty++:cart.push({...p,qty:1}); save();
 alert("Замовлення додано до кошика ✅");
}
function renderCart(){
 if(!cart.length){$("#cartItems").innerHTML="<p>Кошик порожній.</p>";$("#cartTotal").textContent="0 грн";return}
 $("#cartItems").innerHTML=cart.map(x=>`<div class="cart-row"><img src="${x.image}"><div><h4>${x.name}</h4><div>${money(x.price)}</div><div class="qty"><button data-minus="${x.id}">−</button><b>${x.qty}</b><button data-plus="${x.id}">+</button></div></div><button class="close" style="position:static" data-remove="${x.id}">×</button></div>`).join("");
 $("#cartTotal").textContent=money(cart.reduce((s,x)=>s+x.price*x.qty,0));
}
function summaryText(){return cart.map(x=>`${x.name} — ${x.qty} шт. × ${x.price} грн = ${x.qty*x.price} грн`).join("\n")}
function showCheckout(){
 if(!cart.length){alert("Кошик порожній.");return}
 $("#checkoutSummary").textContent=summaryText()+"\n\nРазом: "+money(cart.reduce((s,x)=>s+x.price*x.qty,0));
 $("#checkoutModal").classList.add("open");
}
document.addEventListener("click",e=>{
 const card=e.target.closest(".card"); const add=e.target.closest("[data-add]");
 if(add){e.stopPropagation();addToCart(+add.dataset.add);return}
 if(card){openProduct(products.find(p=>p.id==card.dataset.id));return}
 if(e.target.matches("[data-close]"))$("#productModal").classList.remove("open");
 if(e.target.matches("[data-cart-close]"))$("#cartDrawer").classList.remove("open");
 if(e.target.matches("[data-checkout-close]"))$("#checkoutModal").classList.remove("open");
 if(e.target.id==="cartOpen")$("#cartDrawer").classList.add("open");
 if(e.target.id==="checkoutOpen")showCheckout();
 if(e.target.id==="detailAdd"){addToCart(selected.id);$("#productModal").classList.remove("open");$("#cartDrawer").classList.add("open")}
 if(e.target.dataset.remove){cart=cart.filter(x=>x.id!=e.target.dataset.remove);save()}
 if(e.target.dataset.plus){cart.find(x=>x.id==e.target.dataset.plus).qty++;save()}
 if(e.target.dataset.minus){const x=cart.find(x=>x.id==e.target.dataset.minus);x.qty--;if(x.qty<=0)cart=cart.filter(i=>i.id!=x.id);save()}
});
$("#search").addEventListener("input",e=>{const q=e.target.value.toLowerCase();renderGrid(products.filter(p=>(p.name+" "+p.brand).toLowerCase().includes(q)))});
$("#checkoutOpen").addEventListener("click",showCheckout);
$("#orderForm").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!cart.length)return;
 const name=$("#orderName").value.trim(), phone=$("#orderPhone").value.trim();
 if(!name || !phone){alert("Вкажіть ім'я та номер телефону.");return}
 const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
 const details=summaryText();
 const data=new URLSearchParams();
 data.append("name",name);
 data.append("phone",phone);
 data.append("product",details+"\\nРазом: "+money(total));

 try{
   // Apps Script can redirect its response; no-cors lets the browser submit
   // the order without the GitHub Pages CORS error.
   await fetch(TG_WEBAPP,{method:"POST",body:data,mode:"no-cors"});
   alert("Замовлення додано ✅\\nДякуємо! Ми зв'яжемося з вами.");
   cart=[]; save();
   $("#checkoutModal").classList.remove("open");
   $("#cartDrawer").classList.remove("open");
   $("#orderForm").reset();
 }catch(err){
   alert("Не вдалося відправити замовлення. Перевірте інтернет і спробуйте ще раз.");
 }
});
function setSocial(){
 ["telegramLink","telegramLink2"].forEach(id=>$("#"+id).href=SOCIAL.telegram);
 ["tiktokLink","tiktokLink2","tiktokContact"].forEach(id=>{if($("#"+id)) $("#"+id).href=SOCIAL.tiktok;});
 ["telegramContact"].forEach(id=>{if($("#"+id)) $("#"+id).href=SOCIAL.telegram;});
}
fetch("products.json").then(r=>r.json()).then(d=>{products=d;renderGrid();renderCart();updateCount();setSocial()});
