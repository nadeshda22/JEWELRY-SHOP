// filter.js - Функциональность фильтрации товаров с data-атрибутами

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация фильтров
    initFilters();
    
    // Инициализация корзины
    initCart();
    
    // Добавляем обработчики к существующим кнопкам корзины
    initExistingCartButtons();
});

// Инициализация фильтров
function initFilters() {
    console.log('Инициализация фильтров...');
    
    // Обработчик для слайдера цены
    const priceSlider = document.getElementById('priceSlider');
    if (priceSlider) {
        priceSlider.addEventListener('input', function() {
            const value = parseInt(this.value).toLocaleString('ru-RU');
            document.getElementById('currentPrice').textContent = `${value} ₽`;
        });
    }
    
    // Обработчик для кнопки "Применить фильтры"
    const applyButton = document.querySelector('.btn-filter');
    if (applyButton) {
        applyButton.addEventListener('click', applyFilters);
    }
    
    // Обработчик для кнопки "Сбросить все"
    const resetButton = document.querySelector('.btn-reset');
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }
    
    // Восстанавливаем сохраненные фильтры
    restoreFilters();
}

// Получение значений фильтров
function getFilterValues() {
    const filters = {
        maxPrice: parseInt(document.getElementById('priceSlider').value),
        materials: [],
        stones: false,
        categories: []
    };
    
    // Получаем выбранные материалы (золото/серебро)
    const materialCheckboxes = document.querySelectorAll('.material-filter:checked');
    materialCheckboxes.forEach(checkbox => {
        filters.materials.push(checkbox.value);
    });
    
    // Получаем выбранные камни
    const stonesCheckbox = document.querySelector('.stones-filter:checked');
    if (stonesCheckbox) {
        filters.stones = true;
    }
    
    // Получаем выбранные категории
    const categoryCheckboxes = document.querySelectorAll('.category-filter:checked');
    categoryCheckboxes.forEach(checkbox => {
        filters.categories.push(checkbox.value);
    });
    
    return filters;
}

// Сохранение фильтров в localStorage
function saveFiltersToLocalStorage(filters) {
    localStorage.setItem('jewelryFilters', JSON.stringify(filters));
}

// Загрузка фильтров из localStorage
function loadFiltersFromLocalStorage() {
    const saved = localStorage.getItem('jewelryFilters');
    return saved ? JSON.parse(saved) : null;
}

// Восстановление фильтров при загрузке страницы
function restoreFilters() {
    const savedFilters = loadFiltersFromLocalStorage();
    
    if (!savedFilters) return;
    
    // Восстанавливаем слайдер цены
    const priceSlider = document.getElementById('priceSlider');
    const currentPrice = document.getElementById('currentPrice');
    
    if (priceSlider && currentPrice && savedFilters.maxPrice) {
        priceSlider.value = savedFilters.maxPrice;
        currentPrice.textContent = `${savedFilters.maxPrice.toLocaleString('ru-RU')} ₽`;
    }
    
    // Восстанавливаем чекбоксы материалов
    if (savedFilters.materials) {
        savedFilters.materials.forEach(material => {
            const checkbox = document.querySelector(`.material-filter[value="${material}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Восстанавливаем чекбокс камней
    if (savedFilters.stones) {
        const stonesCheckbox = document.querySelector('.stones-filter');
        if (stonesCheckbox) stonesCheckbox.checked = true;
    }
    
    // Восстанавливаем чекбоксы категорий
    if (savedFilters.categories) {
        savedFilters.categories.forEach(category => {
            const checkbox = document.querySelector(`.category-filter[value="${category}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Применяем восстановленные фильтры
    setTimeout(() => applyFilters(), 100);
}

// Применение фильтров
function applyFilters() {
    console.log('Применение фильтров...');
    
    // Получаем значения фильтров
    const filters = getFilterValues();
    console.log('Фильтры:', filters);
    
    // Получаем все существующие карточки товаров
    const allProductCards = document.querySelectorAll('.product-card');
    
    // Показываем/скрываем карточки в зависимости от фильтров
    filterAndDisplayProducts(allProductCards, filters);
    
    // Сохраняем фильтры в localStorage
    saveFiltersToLocalStorage(filters);
    
    // Показываем уведомление
    showNotification('Фильтры применены');
}

// Фильтрация и отображение товаров с data-атрибутами
function filterAndDisplayProducts(productCards, filters) {
    let visibleCount = 0;
    
    productCards.forEach(card => {
        // Получаем данные из data-атрибутов
        const price = parseInt(card.getAttribute('data-price'));
        const material = card.getAttribute('data-material');
        const hasStones = card.getAttribute('data-stones') === 'true';
        const category = card.getAttribute('data-category');
        
        let shouldShow = true;
        
        // 1. Проверяем фильтр по цене
        if (price > filters.maxPrice) {
            shouldShow = false;
        }
        
        // 2. Проверяем фильтр по материалам (логика ИЛИ для золото/серебро)
        if (shouldShow && filters.materials.length > 0) {
            const materialMatch = filters.materials.includes(material);
            if (!materialMatch) {
                shouldShow = false;
            }
        }
        
        // 3. Проверяем фильтр по камням (если выбрано "с камнями")
        if (shouldShow && filters.stones && !hasStones) {
            shouldShow = false;
        }
        
        // 4. Проверяем фильтр по категориям (логика ИЛИ)
        if (shouldShow && filters.categories.length > 0) {
            const categoryMatch = filters.categories.includes(category);
            if (!categoryMatch) {
                shouldShow = false;
            }
        }
        
        // Показываем или скрываем карточку с анимацией
        if (shouldShow) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease-in-out';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Показываем сообщение, если товаров не найдено
    showNoProductsMessage(visibleCount);
}

// Показываем сообщение, если товаров не найдено
function showNoProductsMessage(visibleCount) {
    let message = document.querySelector('.no-products-message');
    const productsGrid = document.querySelector('.products-grid');
    
    if (visibleCount === 0 && productsGrid) {
        if (!message) {
            message = document.createElement('div');
            message.className = 'no-products-message';
            message.innerHTML = `
                <div class="message-content">
                    <h3>😔 Товары не найдены</h3>
                    <p>Попробуйте изменить параметры фильтрации или сбросить фильтры</p>
                </div>
            `;
            
            // Добавляем стиль для анимации
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .no-products-message {
                    animation: fadeIn 0.5s ease-in-out;
                }
            `;
            document.head.appendChild(style);
            
            // Добавляем сообщение после сетки товаров
            productsGrid.parentNode.appendChild(message);
            
            // Удаляем стиль через время
            setTimeout(() => style.remove(), 1000);
        }
    } else if (message) {
        message.remove();
    }
}

// Сброс фильтров
function resetFilters() {
    console.log('Сброс фильтров...');
    
    // Сбрасываем слайдер цены
    const priceSlider = document.getElementById('priceSlider');
    const currentPrice = document.getElementById('currentPrice');
    
    if (priceSlider && currentPrice) {
        priceSlider.value = 100000;
        currentPrice.textContent = '100 000 ₽';
    }
    
    // Сбрасываем все чекбоксы (снимаем все галочки)
    const allCheckboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Показываем все товары
    const allProductCards = document.querySelectorAll('.product-card');
    allProductCards.forEach(card => {
        card.style.display = 'block';
        card.style.animation = 'fadeIn 0.5s ease-in-out';
    });
    
    // Удаляем сообщение "товары не найдены"
    const message = document.querySelector('.no-products-message');
    if (message) message.remove();
    
    // Очищаем localStorage
    localStorage.removeItem('jewelryFilters');
    
    // Показываем уведомление
    showNotification('Фильтры сброшены');
}

// Уведомления
function showNotification(message) {
    // Проверяем, есть ли уже уведомление
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Добавляем стили для анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-20px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

// Корзина (базовая реализация)
let cart = [];

function initCart() {
    // Загружаем корзину из localStorage
    const savedCart = localStorage.getItem('jewelryCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

function updateCartCount() {
    const cartIcon = document.querySelector('.icon-link[href="#"]:nth-child(3)');
    if (cartIcon && cart.length > 0) {
        const count = cart.length;
        cartIcon.innerHTML = `🛒<span style="background: red; color: white; border-radius: 50%; padding: 2px 6px; font-size: 12px; margin-left: 5px;">${count}</span>`;
    }
}

function addToCart(productName, price) {
    // Создаем объект товара
    const product = {
        id: Date.now(),
        name: productName,
        price: price,
        quantity: 1
    };
    
    // Проверяем, есть ли уже такой товар в корзине
    const existingProductIndex = cart.findIndex(item => item.name === productName);
    
    if (existingProductIndex !== -1) {
        // Увеличиваем количество
        cart[existingProductIndex].quantity += 1;
    } else {
        // Добавляем новый товар
        cart.push(product);
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('jewelryCart', JSON.stringify(cart));
    
    // Обновляем счетчик
    updateCartCount();
    
    // Показываем уведомление
    showCartNotification(productName);
}

function showCartNotification(productName) {
    showNotification(`"${productName}" добавлен в корзину!`);
}

// Добавляем обработчики к уже существующим кнопкам "В корзину"
function initExistingCartButtons() {
    const existingCartButtons = document.querySelectorAll('.product-card .btn-cart');
    
    existingCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent.trim();
            const productPriceText = productCard.querySelector('.product-price').textContent;
            const productPrice = parseInt(productPriceText.replace(/[^\d]/g, ''));
            
            addToCart(productName, productPrice);
        });
    });
}

// Добавляем стили для анимации товаров
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .product-card {
        animation: fadeIn 0.3s ease-in-out;
    }
`;
document.head.appendChild(animationStyle);