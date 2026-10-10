const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
let count = 0, tt;

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('is-show');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('is-show'), 2200);
}

// هدر
addEventListener('scroll', () => $('#header').classList.toggle('is-scrolled', scrollY > 10), { passive: true });
$('#menuBtn').onclick = e => {
  const open = $('#nav').classList.toggle('is-open');
  e.currentTarget.setAttribute('aria-expanded', open);
};

// سبد و علاقه‌مندی
// $$('.add').forEach(b => b.onclick = () => {
//   count++; const c = $('#cartCount'); c.textContent = fa(count);
//   c.classList.remove('is-bump'); void c.offsetWidth; c.classList.add('is-bump');
//   b.classList.add('is-done'); b.textContent = '✓'; setTimeout(() => { b.classList.remove('is-done'); b.textContent = '+'; }, 1200);
//   toast('به سبد خرید اضافه شد');
// });
const CART_KEY = 'sabadnoCart';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cartCount = $('#cartCount');
  if (!cartCount) return;

  const total = getCart().reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  cartCount.textContent = fa(total);
}

$$('.add').forEach(button => {
  button.onclick = () => {
    const product = button.closest('.product');
    if (!product) return;

    const title = product.querySelector('.product-title')?.textContent.trim();
    const icon = product.querySelector('.product-media > span')?.textContent.trim() || '🛍️';
    const priceElement = product.querySelector('.price');

    if (!title || !priceElement) {
      toast('اطلاعات محصول پیدا نشد');
      return;
    }

    // اگر محصول تخفیف دارد، قیمت بعد از تخفیف را بردار
    const priceText = [...priceElement.childNodes]
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent.trim())
      .find(text => /[0-9۰-۹٠-٩]/.test(text))
      || priceElement.textContent.trim();

    const normalizedPrice = priceText
      .replace(/[۰-۹]/g, digit => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
      .replace(/[٠-٩]/g, digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
      .replace(/[^\d]/g, '');

    if (!normalizedPrice) {
      toast('قیمت محصول قابل تشخیص نیست');
      return;
    }

    const cart = getCart();
    const id = title + '-' + normalizedPrice;
    const existing = cart.find(item => item.id === id);

    if (existing) {
      existing.quantity++;
    } else {
      cart.push({
        id,
        title,
        icon,
        price: Number(normalizedPrice),
        quantity: 1
      });
    }

    saveCart(cart);

    button.classList.add('is-done');
    button.textContent = '✓';

    setTimeout(() => {
      button.classList.remove('is-done');
      button.textContent = '+';
    }, 1200);

    toast('به سبد خرید اضافه شد');
  };
});

updateCartCount();
$$('.wish').forEach(b => b.onclick = () => {
  const on = b.getAttribute('aria-pressed') !== 'true';
  b.setAttribute('aria-pressed', on); b.textContent = on ? '♥' : '♡';
});

// فیلتر محصولات (چیپ‌ها و دسته‌ها)
function filter(key) {
  $$('.chip').forEach(c => c.classList.toggle('is-active', c.dataset.filter === key));
  $$('.cat').forEach(c => c.classList.toggle('is-active', c.dataset.cat === key));
  $$('.product').forEach(p => p.classList.toggle('is-hidden', key !== 'all' && p.dataset.cat !== key));
}
$$('.chip').forEach(c => c.onclick = () => filter(c.dataset.filter));
$$('.cat').forEach(c => c.addEventListener('click', () => filter(c.dataset.cat)));

// جستجوی ساده
$('#q').addEventListener('input', e => {
  const v = e.target.value.trim();
  $$('.product').forEach(p => p.classList.toggle('is-hidden', !p.textContent.includes(v)));
});

// شمارش معکوس (۶ ساعت از بار شدن صفحه)
const end = Date.now() + 6 * 3600e3;
setInterval(() => {
  const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
  const p = n => fa(String(n).padStart(2, '0'));
  $('#cdH').textContent = p(Math.floor(s / 3600));
  $('#cdM').textContent = p(Math.floor(s % 3600 / 60));
  $('#cdS').textContent = p(s % 60);
}, 1000);
const logoutButton = document.getElementById("log-out")

logoutButton.addEventListener("click", function () {
    localStorage.removeItem("username");
    localStorage.removeItem("password");

    window.location.href = "Login.html"
})

// for card

function renderCartPage() {
  const container = $('#cartProducts');

  // در صفحه اصلی این عنصر وجود ندارد؛ پس کاری انجام نده
  if (!container) return;

  const cart = getCart();
  container.replaceChildren();

  if (cart.length === 0) {
    container.textContent = 'سبد خرید شما خالی است.';
  } else {
    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-product';

      const name = document.createElement('p');
      name.textContent = `${item.icon} ${item.title}`;

      const details = document.createElement('p');
      details.textContent =
        `${fa(item.quantity)} عدد × ${fa(item.price.toLocaleString('en-US'))} تومان`;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'حذف';
      remove.addEventListener('click', () => {
        saveCart(getCart().filter(product => product.id !== item.id));
        renderCartPage();
      });

      row.append(name, details, remove);
      container.appendChild(row);
    });
  }

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  $('#totalCount').textContent = fa(totalCount);
  $('#totalPrice').textContent =
    `${fa(totalPrice.toLocaleString('en-US'))} تومان`;
}

renderCartPage();



