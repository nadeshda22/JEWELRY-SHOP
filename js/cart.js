// cart.js - Функциональность корзины покупок

// Глобальная переменная для корзины
let cart = [];

// Инициализация корзины при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем корзину из localStorage
    const savedCart = localStorage.getItem('luxuryJewelryCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('Ошибка загрузки корзины:', e);
            cart = [];
        }
    }
    
    // Обновляем счетчик корзины
    updateCartCount();
    
    // Если мы на странице корзины - инициализируем её
    if (window.location.pathname.includes('cart.html')) {
        initCartPage();
    }
    
    // Добавляем обработчики к кнопкам "В корзину" на странице каталога
    if (window.location.pathname.includes('catalog.html')) {
        initCatalogCartButtons();
    }
});

// Инициализация кнопок корзины на странице каталога
function initCatalogCartButtons() {
    // Ждем немного, чтобы товары загрузились
    setTimeout(() => {
        const cartButtons = document.querySelectorAll('.btn-cart');
        cartButtons.forEach(button => {
            // Удаляем старые обработчики
            button.removeEventListener('click', handleAddToCart);
            // Добавляем новый обработчик
            button.addEventListener('click', handleAddToCart);
        });
        console.log(`Инициализировано ${cartButtons.length} кнопок корзины`);
    }, 500);
}

// Обработчик добавления в корзину
function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = this;
    const productCard = button.closest('.product-card');
    
    if (!productCard) {
        console.error('Карточка товара не найдена');
        return;
    }
    
    const product = getProductInfo(productCard);
    addToCart(product);
    
    // Анимация кнопки
    animateAddToCartButton(button);
}

// Получение информации о товаре из карточки
function getProductInfo(productCard) {
    // Пытаемся получить data-id, если нет - создаем уникальный
    let productId = productCard.getAttribute('data-id');
    if (!productId) {
        productId = Date.now() + Math.random().toString(36).substr(2, 9);
        productCard.setAttribute('data-id', productId);
    }
    
    const productName = productCard.querySelector('.product-name').textContent.trim();
    const productPriceText = productCard.querySelector('.product-price').textContent;
    const productPrice = parseInt(productPriceText.replace(/[^\d]/g, ''));
    const productImage = productCard.querySelector('img').src;
    const productMaterial = productCard.getAttribute('data-material') || '';
    const productCategory = productCard.getAttribute('data-category') || '';
    
    return {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        material: productMaterial,
        category: productCategory,
        quantity: 1
    };
}

// Добавление товара в корзину
function addToCart(product) {
    console.log('Добавление в корзину:', product);
    
    // Проверяем, есть ли уже такой товар в корзине
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
        // Увеличиваем количество
        cart[existingItemIndex].quantity += 1;
    } else {
        // Добавляем новый товар
        cart.push(product);
    }
    
    // Сохраняем в localStorage
    saveCart();
    
    // Обновляем счетчик
    updateCartCount();
    
    // Обновляем страницу корзины если мы на ней
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
        updateCartSummary();
    }
    
    // Показываем уведомление
    showNotification(`"${product.name}" добавлен в корзину!`);
}

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('luxuryJewelryCart', JSON.stringify(cart));
}

// Обновление счетчика товаров в корзине
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count, .cart-icon span, .nav-link[href="cart.html"] span');
    
    // Считаем общее количество товаров
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = totalItems;
            if (totalItems > 0) {
                element.style.display = 'inline';
            } else {
                element.style.display = 'none';
            }
        }
    });
    
    console.log('Обновлен счетчик корзины:', totalItems, 'товаров');
}

// Анимация кнопки добавления в корзину
function animateAddToCartButton(button) {
    const originalText = button.textContent;
    
    // Добавляем класс анимации
    button.classList.add('added-animation');
    button.textContent = '✓ Добавлено';
    button.classList.add('added');
    
    // Возвращаем исходный текст через 2 секунды
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('added');
        button.classList.remove('added-animation');
    }, 2000);
}

// Показ уведомления
function showNotification(message) {
    // Удаляем старое уведомление если есть
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #333, #555);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        font-weight: 500;
        max-width: 300px;
    `;
    
    // Добавляем стили для анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(100%); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление и стили через 3 секунды
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

// Инициализация страницы корзины
function initCartPage() {
    console.log('Инициализация страницы корзины...');
    
    // Загружаем товары в корзину
    renderCartItems();
    
    // Обновляем итоговую сумму
    updateCartSummary();
    
    // Обработчик для кнопки очистки корзины
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    // Обработчик для кнопки оформления заказа
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
}

// Отображение товаров в корзине
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
        }
        cartItemsContainer.innerHTML = '';
        return;
    }
    
    // Скрываем сообщение о пустой корзине
    if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
    }
    
    // Создаем HTML для каждого товара
    let cartHTML = '';
    
    cart.forEach(item => {
        const totalPrice = item.price * item.quantity;
        const formattedPrice = totalPrice.toLocaleString('ru-RU');
        
        cartHTML += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='img/default-product.jpg'">
                </div>
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-material">${getMaterialText(item.material)}</p>
                    <div class="cart-item-price">${item.price.toLocaleString('ru-RU')} ₽</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" onclick="window.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
                    <input type="number" min="1" value="${item.quantity}" 
                           onchange="window.updateQuantity('${item.id}', parseInt(this.value))">
                    <button class="quantity-btn plus" onclick="window.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">
                    <span>${formattedPrice} ₽</span>
                </div>
                <button class="cart-item-remove" onclick="window.removeFromCart('${item.id}')">
                    ×
                </button>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
}

// Получение текста для материала
function getMaterialText(material) {
    const materials = {
        'gold': 'Золото 585',
        'silver': 'Серебро 925'
    };
    return materials[material] || '';
}

// Обновление итоговой суммы
function updateCartSummary() {
    // Считаем сумму товаров
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const formattedSubtotal = subtotal.toLocaleString('ru-RU');
    
    // Считаем доставку (бесплатно от 15000)
    let delivery = 0;
    let deliveryText = 'Бесплатно';
    
    if (subtotal < 15000 && subtotal > 0) {
        delivery = 300;
        deliveryText = '300 ₽';
    }
    
    // Итоговая сумма
    const total = subtotal + delivery;
    const formattedTotal = total.toLocaleString('ru-RU');
    
    // Обновляем элементы на странице
    const subtotalElement = document.getElementById('subtotal-price');
    const deliveryElement = document.getElementById('delivery-price');
    const totalElement = document.getElementById('total-price');
    
    if (subtotalElement) subtotalElement.textContent = `${formattedSubtotal} ₽`;
    if (deliveryElement) deliveryElement.textContent = deliveryText;
    if (totalElement) totalElement.textContent = `${formattedTotal} ₽`;
    
    // Обновляем состояние кнопки оформления заказа
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        if (subtotal === 0) {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = 'Добавьте товары в корзину';
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Оформить заказ';
        }
    }
}

// Удаление товара из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
        updateCartSummary();
    }
    
    showNotification('Товар удален из корзины');
}

// Изменение количества товара
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = newQuantity;
        saveCart();
        
        if (window.location.pathname.includes('cart.html')) {
            renderCartItems();
            updateCartSummary();
        }
    }
}

// Очистка всей корзины
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Вы уверены, что хотите очистить корзину?')) {
        cart = [];
        saveCart();
        updateCartCount();
        
        if (window.location.pathname.includes('cart.html')) {
            renderCartItems();
            updateCartSummary();
        }
        
        showNotification('Корзина очищена');
    }
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста');
        return;
    }
    
    // Собираем информацию о заказе
    const order = {
        id: Date.now(),
        date: new Date().toLocaleString('ru-RU'),
        items: [...cart],
        subtotal: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        total: cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    };
    
    // Сохраняем заказ в localStorage
    const orders = JSON.parse(localStorage.getItem('luxuryJewelryOrders') || '[]');
    orders.push(order);
    localStorage.setItem('luxuryJewelryOrders', JSON.stringify(orders));
    
    // Очищаем корзину
    cart = [];
    saveCart();
    updateCartCount();
    
    // Показываем сообщение об успехе
    showOrderSuccess(order);
}

// Показ успешного оформления заказа
function showOrderSuccess(order) {
    const cartContainer = document.querySelector('.cart-container');
    if (!cartContainer) return;
    
    const totalFormatted = order.total.toLocaleString('ru-RU');
    
    cartContainer.innerHTML = `
        <div class="order-success">
            <div class="success-icon">✓</div>
            <h2>Заказ оформлен успешно!</h2>
            <p>Номер вашего заказа: <strong>#${order.id}</strong></p>
            <p>Сумма заказа: <strong>${totalFormatted} ₽</strong></p>
            <p>Мы свяжемся с вами в ближайшее время для подтверждения заказа.</p>
            
            <div class="success-actions">
                <a href="index.html" class="btn">На главную</a>
                <a href="catalog.html" class="btn btn-secondary">Продолжить покупки</a>
            </div>
        </div>
    `;
}

// Экспортируем функции для использования в HTML
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.initCatalogCartButtons = initCatalogCartButtons;