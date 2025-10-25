// Головний обробник події: весь код всередині виконається лише ПІСЛЯ того,
// як браузер повністю завантажить та розпарсить HTML-сторінку.
// Це гарантує, що всі елементи (кнопки, форми, секції) вже існують в DOM.
document.addEventListener('DOMContentLoaded', () => {

    // === ЛОГІКА ПАРАЛАКСУ ===
    // Цей блок відповідає за створення ефекту паралаксу для фонового зображення
    // на вкладці "Панель управління".

    // Додаємо обробник події 'scroll' до всього вікна браузера.
    // Ця функція буде викликатися кожного разу, коли користувач прокручує сторінку.
    window.addEventListener('scroll', () => {
        // Знаходимо елемент з класом 'parallax-container', АЛЕ тільки якщо він знаходиться
        // всередині активної секції 'dashboard'. Це потрібно, щоб ефект працював лише
        // коли вкладка "Панель управління" видима.
        const parallaxElement = document.querySelector('#dashboard.active .parallax-container');
        
        // Перевіряємо, чи знайдено елемент паралаксу (тобто чи активна потрібна вкладка).
        if (parallaxElement) {
            // Отримуємо поточну позицію прокрутки сторінки від верху.
            const scrolled = window.scrollY;
            // Змінюємо вертикальну позицію фонового зображення (`backgroundPositionY`).
            // Ми множимо значення прокрутки на коефіцієнт (0.4), щоб фон рухався повільніше,
            // ніж сама сторінка, створюючи ілюзію глибини.
            parallaxElement.style.backgroundPositionY = `${scrolled * 0.4}px`;
        }
    });


    // === ЛОГІКА ВІДКРИТТЯ ВКЛАДОК ===
    // Цей блок керує перемиканням між секціями ("Панель", "Додати", "Звіти").

    // Знаходимо елементи DOM: контейнер навігації, всі посилання в ньому та всі секції контенту.
    const navLinksContainer = document.getElementById('navLinks');
    const navLinks = navLinksContainer.querySelectorAll('a');
    const contentSections = document.querySelectorAll('.section');

    // Додаємо ОДИН обробник події 'click' на ВЕСЬ контейнер навігації (делегування подій).
    // Це ефективніше, ніж додавати обробник на кожне посилання окремо.
    navLinksContainer.addEventListener('click', (event) => {
        // Забороняємо стандартну дію посилання (перехід за href="#").
        event.preventDefault();
        // Знаходимо найближчий батьківський елемент `<a>`, на який клікнули.
        const clickedLink = event.target.closest('a');
        // Якщо клікнули не на посилання, а, наприклад, між ними, то нічого не робимо.
        if (!clickedLink) return;

        // Отримуємо значення атрибута 'data-tab' з натиснутого посилання (напр., 'dashboard').
        const tabId = clickedLink.dataset.tab;
        
        // Оновлюємо вигляд посилань: знімаємо клас 'active' з усіх...
        navLinks.forEach(link => link.classList.remove('active'));
        // ...і додаємо клас 'active' тільки до натиснутого посилання.
        clickedLink.classList.add('active');

        // Оновлюємо вигляд секцій контенту: приховуємо всі секції (знімаємо клас 'active')...
        contentSections.forEach(section => {
            section.classList.remove('active');
            // ...і показуємо (додаємо клас 'active') тільки ту секцію, чий 'id' збігається з 'tabId'.
            if (section.id === tabId) {
                section.classList.add('active');
            }
        });

        // Додаткова дія: якщо користувач перейшов на вкладку "Звіти",
        // оновлюємо статистику, викликаючи відповідну функцію.
        if (tabId === 'reports') {
            updateStats();
        }
    });

    // === ЛОГІКА СТАТИСТИКИ (ДЛЯ "ЗВІТІВ") ===
    // Ця функція відповідає за підрахунок та відображення статистики контейнерів.

    const updateStats = () => {
        // Знаходимо тіло таблиці з контейнерами та отримуємо всі її рядки.
        const rows = document.getElementById('containerTableBody').rows;
        // Ініціалізуємо лічильники для кожного статусу.
        let transit = 0, delivered = 0, pending = 0;

        // Проходимо по кожному рядку таблиці.
        for (const row of rows) {
            // Отримуємо текст статусу з другої комірки (індекс 1).
            const statusText = row.cells[1].textContent;
            // Збільшуємо відповідний лічильник.
            if (statusText === 'У дорозі') transit++;
            else if (statusText === 'Доставлено') delivered++;
            else if (statusText === 'Очікує') pending++;
        }
        // Знаходимо відповідні елементи `<span>` на вкладці "Звіти"
        // і вставляємо в них підраховані значення.
        document.getElementById('stats-total').textContent = rows.length;
        document.getElementById('stats-transit').textContent = transit;
        document.getElementById('stats-delivered').textContent = delivered;
        document.getElementById('stats-pending').textContent = pending;
    };

    // === ЛОГІКА МОДАЛЬНОГО ВІКНА ===
    // Цей блок керує відображенням спливаючого вікна з деталями контейнера.

    // Знаходимо елементи DOM: саме модальне вікно та кнопку його закриття.
    const modal = document.getElementById('detailsModal');
    const closeModalButton = document.querySelector('.modal-close');

    // Функція для ВІДКРИТТЯ модального вікна.
    const openModal = (id, status, location, destination) => {
        // Знаходимо відповідні `<span>` всередині вікна та заповнюємо їх даними.
        document.getElementById('modal-id').textContent = id;
        document.getElementById('modal-status').textContent = status; // Правильний ID
        document.getElementById('modal-location').textContent = location;
        document.getElementById('modal-destination').textContent = destination;
        // Додаємо клас 'open', який робить вікно видимим (через CSS).
        modal.classList.add('open');
    };

    // Функція для ЗАКРИТТЯ модального вікна.
    const closeModal = () => modal.classList.remove('open'); // Прибираємо клас 'open'

    // Функція-обробник для кнопок "Деталі".
    const handleDetailClick = (event) => {
        // Знаходимо рядок таблиці (`<tr>`), в якому знаходиться натиснута кнопка.
        const row = event.target.closest('tr');
        // Витягуємо дані з комірок цього рядка.
        // Викликаємо функцію `openModal`, передаючи їй отримані дані.
        openModal(
            row.cells[0].textContent,
            row.cells[1].textContent,
            row.cells[2].textContent,
            row.cells[3].textContent
        );
    };

    // Функція для "навішування" обробників на кнопки "Деталі".
    // Вона потрібна, щоб нові кнопки (в доданих рядках) теж працювали.
    const attachModalListeners = () => {
        // Знаходимо ВСІ кнопки "Деталі" на сторінці.
        document.querySelectorAll('.btn-details').forEach(button => {
            // Спочатку ВИДАЛЯЄМО старий обробник (якщо він був), щоб уникнути дублів.
            button.removeEventListener('click', handleDetailClick);
            // Потім ДОДАЄМО новий обробник 'click'.
            button.addEventListener('click', handleDetailClick);
        });
    };

    // Додаємо обробники для закриття вікна:
    closeModalButton.addEventListener('click', closeModal); // Клік на "хрестик"
    modal.addEventListener('click', (event) => { // Клік на фон навколо вікна
        if (event.target === modal) closeModal(); // Закриваємо, тільки якщо клікнули саме на фон
    });

    // === ЛОГІКА ВАЛІДАЦІЇ ФОРМИ ===
    // Цей блок відповідає за перевірку даних, введених у форму "Додати контейнер".

    // Знаходимо елементи DOM: форму та її поля вводу.
    const form = document.getElementById('addContainerForm');
    const containerIdInput = document.getElementById('containerId');
    const locationInput = document.getElementById('location');
    const destinationInput = document.getElementById('destination');
    // Визначаємо кольори та тіні для візуальної валідації (беремо з CSS).
    const errorColor = '#e53e3e', successColor = '#38a169';
    const errorShadow = '0 0 5px rgba(229, 62, 62, 0.5)';
    const successShadow = '0 0 5px rgba(56, 161, 105, 0.5)';
    const defaultBorderColor = '#4a5568'; // Колір рамки за замовчуванням

    /**
     * Оновлює вигляд поля вводу та показує/ховає повідомлення про помилку.
     * @param {HTMLElement} inputElement - Поле вводу (`<input>`), яке валідується.
     * @param {'error'|'success'|'neutral'} state - Стан валідації.
     * @param {string} [message] - Повідомлення про помилку (якщо state='error').
     */
    const setValidationState = (inputElement, state, message) => {
        // Знаходимо відповідний елемент для виведення помилки (напр., 'idError').
        let errorId;
        if (inputElement.id === 'containerId') errorId = 'idError';
        else if (inputElement.id === 'location') errorId = 'locationError';
        else if (inputElement.id === 'destination') errorId = 'destinationError';
        else return; // Невідомий інпут

        const errorElement = document.getElementById(errorId);

        // Показуємо або ховаємо текстове повідомлення про помилку.
        if (errorElement) {
            errorElement.textContent = message || '';
        }

        // Змінюємо стиль рамки та тіні поля вводу залежно від стану.
        switch (state) {
            case 'error':
                inputElement.style.borderColor = errorColor;
                inputElement.style.boxShadow = errorShadow;
                break;
            case 'success':
                inputElement.style.borderColor = successColor;
                inputElement.style.boxShadow = successShadow;
                break;
            case 'neutral': // Стан за замовчуванням або коли поле порожнє
                inputElement.style.borderColor = defaultBorderColor;
                inputElement.style.boxShadow = '';
                break;
        }
    };

    // --- Функції валідації для кожного поля (викликаються при вводі) ---

    // Валідація ID: перевіряє формат XX-123456.
    const validateId = () => {
        const idRegex = /^[A-Z]{2}-\d{6}$/;
        // Якщо поле порожнє, скидаємо стиль і повертаємо false (невалідне для відправки).
        if (containerIdInput.value.length === 0) {
            setValidationState(containerIdInput, 'neutral'); return false;
        }
        // Якщо відповідає формату - зелене світло.
        if (idRegex.test(containerIdInput.value)) {
            setValidationState(containerIdInput, 'success'); return true;
        }
        // Інакше - червоне світло і повідомлення.
        setValidationState(containerIdInput, 'error', 'Невірний формат. Очікується XX-123456');
        return false;
    };

    // Валідація Location: перевіряє мінімальну довжину 3 символи.
    const validateLocation = () => {
        if (locationInput.value.length === 0) {
            setValidationState(locationInput, 'neutral'); return false;
        }
        if (locationInput.value.trim().length >= 3) {
            setValidationState(locationInput, 'success'); return true;
        }
        setValidationState(locationInput, 'error', 'Поле має містити мінімум 3 символи');
        return false;
    };

    // Валідація Destination: аналогічно до Location.
    const validateDestination = () => {
        if (destinationInput.value.length === 0) {
            setValidationState(destinationInput, 'neutral'); return false;
        }
        if (destinationInput.value.trim().length >= 3) {
            setValidationState(destinationInput, 'success'); return true;
        }
        setValidationState(destinationInput, 'error', 'Поле має містити мінімум 3 символи');
        return false;
    };

    // --- Додаємо обробники події 'input' до полів ---
    // Тепер функції валідації будуть викликатися ПРИ КОЖНОМУ НАТИСКАННІ КЛАВІШІ.
    containerIdInput.addEventListener('input', validateId);
    locationInput.addEventListener('input', validateLocation);
    destinationInput.addEventListener('input', validateDestination);

    // --- Обробник події 'submit' для форми ---
    // Викликається при натисканні кнопки "Додати".
    form.addEventListener('submit', (event) => {
        // Забороняємо стандартну відправку форми (перезавантаження сторінки).
        event.preventDefault();
        // Запускаємо всі функції валідації ще раз, щоб отримати їх результат (true/false).
        let isIdValid = validateId();
        let isLocationValid = validateLocation();
        let isDestinationValid = validateDestination();

        // Додатково перевіряємо, чи не залишилися поля порожніми саме в момент відправки.
        // Якщо так - показуємо відповідну помилку і відмічаємо поле як невалідне.
        if (containerIdInput.value.trim().length === 0) {
            setValidationState(containerIdInput, 'error', 'Поле не може бути порожнім'); isIdValid = false;
        }
        if (locationInput.value.trim().length === 0) {
            setValidationState(locationInput, 'error', 'Поле не може бути порожнім'); isLocationValid = false;
        }
        if (destinationInput.value.trim().length === 0) {
            setValidationState(destinationInput, 'error', 'Поле не може бути порожнім'); isDestinationValid = false;
        }

        // Якщо ВСІ поля валідні...
        if (isIdValid && isLocationValid && isDestinationValid) {
            // ...показуємо повідомлення про успіх.
            alert('Контейнер успішно додано!');
            // Знаходимо тіло таблиці.
            const tableBody = document.getElementById('containerTableBody');
            // Створюємо новий порожній рядок в кінці таблиці.
            const newRow = tableBody.insertRow();
            // Заповнюємо новий рядок HTML-розміткою з даними з форми.
            newRow.innerHTML = `<td>${containerIdInput.value}</td><td><span class="status status-pending">Очікує</span></td><td>${locationInput.value}</td><td>${destinationInput.value}</td><td><button class="btn-details">Деталі</button></td>`;
            // Очищуємо поля форми.
            form.reset();
            // Скидаємо візуальні стилі валідації для всіх полів.
            setValidationState(containerIdInput, 'neutral');
            setValidationState(locationInput, 'neutral');
            setValidationState(destinationInput, 'neutral');
            // "Оживляємо" кнопку "Деталі" в новому рядку.
            attachModalListeners();
            // Оновлюємо статистику на вкладці "Звіти".
            updateStats();
            // Автоматично переходимо на вкладку "Панель управління", імітуючи клік.
            navLinksContainer.querySelector('a[data-tab="dashboard"]').click();
        }
    });

    // === ЗАПУСК ПРИ СТАРТІ ===
    // Цей код виконується один раз після завантаження сторінки.

    // 1. Одразу "оживляємо" всі кнопки "Деталі", які вже є в HTML.
    attachModalListeners();
    // 2. Одразу розраховуємо та відображаємо початкову статистику.
    updateStats();
});
