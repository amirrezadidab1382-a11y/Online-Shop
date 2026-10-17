
const $ = (selector, root = document) =>
  root.querySelector(selector);

const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];

const fa = value =>
  String(value).replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[digit]);

const CART_KEY = 'sabadnoCart';

let toastTimer;

// تبدیل اعداد فارسی و عربی به انگلیسی
function toEnglishDigits(value) {
  return String(value)
    .replace(/[۰-۹]/g, digit => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
    .replace(/[٠-٩]/g, digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit));
}

// نمایش پیام
function toast(message) {
  const element = $('#toast');

  if (!element) {
    console.log(message);
    return;
  }

  element.textContent = message;
  element.classList.add('is-show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    element.classList.remove('is-show');
  }, 2200);
}

// خواندن سبد خرید
function getCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CART_KEY) || '[]'
    );

    if (!Array.isArray(saved)) return [];

    return saved.filter(item =>
      item &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      Number.isFinite(Number(item.price)) &&
      Number(item.price) >= 0 &&
      Number.isFinite(Number(item.quantity)) &&
      Number(item.quantity) > 0
    ).map(item => ({
      ...item,
      price: Number(item.price),
      quantity: Math.floor(Number(item.quantity)),
      icon: item.icon || '🛍️'
    }));
  } catch (error) {
    console.error('خطا در خواندن سبد خرید:', error);
    return [];
  }
}

// ذخیره سبد خرید
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

// به‌روزرسانی شمارنده سبد خرید
function updateCartCount() {
  const countElement = $('#cartCount');

  if (!countElement) return;

  const total = getCart().reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  countElement.textContent = fa(total);
}

// پیدا کردن قیمت محصول، با درنظرگرفتن تخفیف
function getProductPrice(product) {
  const priceElement = $('.price', product);

  if (!priceElement) return NaN;

  let priceText = '';

  if (priceElement.querySelector('del')) {
    const textNodes = [...priceElement.childNodes]
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent.trim())
      .filter(text => /[0-9۰-۹٠-٩]/.test(text));

    priceText = textNodes.at(-1) || '';
  } else {
    priceText = priceElement.textContent.trim();
  }

  const digits = toEnglishDigits(priceText)
    .replace(/[^\d]/g, '');

  return digits ? Number(digits) : NaN;
}

// افزودن محصول به سبد خرید
$$('.add').forEach(button => {
  button.addEventListener('click', () => {
    const product = button.closest('.product');

    if (!product) return;

    const titleElement = $('.product-title', product);
    const iconElement = $('.product-media > span', product);

    const title = titleElement?.textContent.trim();
    const icon = iconElement?.textContent.trim() || '🛍️';
    const price = getProductPrice(product);

    if (!title || !Number.isFinite(price)) {
      toast('اطلاعات محصول یا قیمت آن پیدا نشد.');
      return;
    }

    // اگر شناسه مشخصی در HTML وجود دارد، از آن استفاده کن
    const productId =
      product.dataset.id || `${title}-${price}`;

    const cart = getCart();

    const existing = cart.find(
      item => item.id === productId
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: productId,
        title,
        icon,
        price,
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

    toast('محصول به سبد خرید اضافه شد.');
  });
});

// نمایش محصولات در صفحه card.html
function renderCartPage() {
  const container = $('#cartProducts');

  // این بخش فقط در صفحه سبد خرید اجرا می‌شود
  if (!container) return;

  const cart = getCart();

  container.replaceChildren();

  if (cart.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-cart';
    empty.textContent = 'سبد خرید شما خالی است.';
    container.appendChild(empty);
  } else {
    cart.forEach(item => {
      const row = document.createElement('article');
      row.className = 'cart-product';

      const heading = document.createElement('h3');
      heading.textContent = `${item.icon} ${item.title}`;

      const price = document.createElement('p');
      price.textContent =
        `قیمت واحد: ${fa(item.price.toLocaleString('en-US'))} تومان`;

      const controls = document.createElement('div');
      controls.className = 'cart-controls';

      const decrease = document.createElement('button');
      decrease.type = 'button';
      decrease.textContent = '−';
      decrease.setAttribute('aria-label', 'کاهش تعداد');

      decrease.addEventListener('click', () => {
        changeQuantity(item.id, -1);
      });

      const quantity = document.createElement('span');
      quantity.textContent = fa(item.quantity);

      const increase = document.createElement('button');
      increase.type = 'button';
      increase.textContent = '+';
      increase.setAttribute('aria-label', 'افزایش تعداد');

      increase.addEventListener('click', () => {
        changeQuantity(item.id, 1);
      });

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-item';
      remove.textContent = 'حذف';

      remove.addEventListener('click', () => {
        removeItem(item.id);
      });

      const subtotal = document.createElement('p');
      subtotal.className = 'cart-subtotal';
      subtotal.textContent =
        `جمع این کالا: ${fa(
          (item.price * item.quantity).toLocaleString('en-US')
        )} تومان`;

      controls.append(
        decrease,
        quantity,
        increase,
        remove
      );

      row.append(
        heading,
        price,
        controls,
        subtotal
      );

      container.appendChild(row);
    });
  }

  const totalCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const countElement = $('#totalCount');
  const priceElement = $('#totalPrice');

  if (countElement) {
    countElement.textContent = fa(totalCount);
  }

  if (priceElement) {
    priceElement.textContent =
      `${fa(totalPrice.toLocaleString('en-US'))} تومان`;
  }
}

// تغییر تعداد کالا
function changeQuantity(id, amount) {
  const cart = getCart();
  const item = cart.find(product => product.id === id);

  if (!item) return;

  item.quantity += amount;

  const updatedCart = cart.filter(
    product => product.quantity > 0
  );

  saveCart(updatedCart);
  renderCartPage();
}

// حذف کالا
function removeItem(id) {
  const cart = getCart().filter(
    item => item.id !== id
  );

  saveCart(cart);
  renderCartPage();

  toast('محصول از سبد خرید حذف شد.');
}

// دکمه ثبت سفارش
const submitOrder = $('#submitOrder');

if (submitOrder) {
  submitOrder.addEventListener('click', () => {
    const cart = getCart();
    location.removeItem("sabadnoCart")

    if (cart.length === 0) {
      toast('سبد خرید شما خالی است.');
      return;
    }

    // toast("در خواست شما با موفقعیت ثبت شد ")
    toast("درخواست با موفقعیت ثبت شد")
  });
}

// هدر
addEventListener('scroll', () => {
  const header = $('#header');

  if (header) {
    header.classList.toggle(
      'is-scrolled',
      scrollY > 10
    );
  }
}, { passive: true });

// منوی سایت
const menuBtn = $('#menuBtn');

if (menuBtn) {
  menuBtn.addEventListener('click', event => {
    const nav = $('#nav');

    if (!nav) return;

    const open = nav.classList.toggle('is-open');

    event.currentTarget.setAttribute(
      'aria-expanded',
      String(open)
    );
  });
}

// علاقه‌مندی‌ها
$$('.wish').forEach(button => {
  button.addEventListener('click', () => {
    const on =
      button.getAttribute('aria-pressed') !== 'true';

    button.setAttribute('aria-pressed', String(on));
    button.textContent = on ? '♥' : '♡';
  });
});

// فیلتر محصولات
function filter(key) {
  $$('.chip').forEach(element => {
    element.classList.toggle(
      'is-active',
      element.dataset.filter === key
    );
  });

  $$('.cat').forEach(element => {
    element.classList.toggle(
      'is-active',
      element.dataset.cat === key
    );
  });

  $$('.product').forEach(product => {
    product.classList.toggle(
      'is-hidden',
      key !== 'all' && product.dataset.cat !== key
    );
  });
}

$$('.chip').forEach(element => {
  element.addEventListener('click', () => {
    filter(element.dataset.filter);
  });
});

$$('.cat').forEach(element => {
  element.addEventListener('click', () => {
    filter(element.dataset.cat);
  });
});

// جستجو
const searchInput = $('#q');

if (searchInput) {
  searchInput.addEventListener('input', event => {
    const value = event.target.value.trim();

    $$('.product').forEach(product => {
      product.classList.toggle(
        'is-hidden',
        !product.textContent.includes(value)
      );
    });
  });
}

// شمارش معکوس؛ فقط اگر عناصر آن در صفحه موجود باشند
const hoursElement = $('#cdH');
const minutesElement = $('#cdM');
const secondsElement = $('#cdS');

if (hoursElement && minutesElement && secondsElement) {
  const end = Date.now() + 6 * 3600e3;

  setInterval(() => {
    const seconds = Math.max(
      0,
      Math.floor((end - Date.now()) / 1000)
    );

    const pad = number =>
      fa(String(number).padStart(2, '0'));

    hoursElement.textContent =
      pad(Math.floor(seconds / 3600));

    minutesElement.textContent =
      pad(Math.floor((seconds % 3600) / 60));

    secondsElement.textContent =
      pad(seconds % 60);
  }, 1000);
}

// خروج از حساب
const logoutButton = $('#log-out');

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('username');
    localStorage.removeItem('password');

    window.location.href = 'Login.html';
  });
}

// در هر صفحه، شمارنده را به‌روز کن و اگر صفحه سبد خرید است، آن را نمایش بده
updateCartCount();
renderCartPage();
