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
$$('.add').forEach(b => b.onclick = () => {
  count++; const c = $('#cartCount'); c.textContent = fa(count);
  c.classList.remove('is-bump'); void c.offsetWidth; c.classList.add('is-bump');
  b.classList.add('is-done'); b.textContent = '✓'; setTimeout(() => { b.classList.remove('is-done'); b.textContent = '+'; }, 1200);
  toast('به سبد خرید اضافه شد');
});
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



