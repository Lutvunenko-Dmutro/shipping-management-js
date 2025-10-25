// Чекаємо, поки вся HTML-сторінка завантажиться
document.addEventListener('DOMContentLoaded', () => {

    // === ЛОГІКА ПАРАЛАКСУ ===
    // Ми будемо слухати прокрутку всього вікна
    window.addEventListener('scroll', () => {
        // Знаходимо елемент паралаксу, АЛЕ ТІЛЬКИ ЯКЩО ВІН ВИДИМИЙ
        // (тобто, якщо ми на вкладці 'dashboard')
        const parallaxElement = document.querySelector('#dashboard.active .parallax-container');
        
        if (parallaxElement) {
            const scrolled = window.scrollY; // Скільки прокручено від верху
            
            // Рухаємо фон ВНИЗ (позитивне значення) зі швидкістю 0.4 від швидкості скролу
            // Це створює ілюзію, що фон рухається повільніше, ніж сторінка
            parallaxElement.style.backgroundPositionY = `${scrolled * 0.4}px`;
        }
    });


    // === ЛОГІКА ВІДКРИТТЯ ВКЛАДОК ===
    const navLinksContainer = document.getElementById('navLinks');
    const navLinks = navLinksContainer.querySelectorAll('a');
    const contentSections = document.querySelectorAll('.section');

    navLinksContainer.addEventListener('click', (event) => {
        event.preventDefault(); 
        const clickedLink = event.target.closest('a');
        if (!clickedLink) return;

        const tabId = clickedLink.dataset.tab; 
        
        // 1. Оновлюємо посилання
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        clickedLink.classList.add('active');

        // 2. Оновлюємо контент
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === tabId) {
                section.classList.add('active');
            }
        });

        // 3. Якщо перейшли на звіти, оновлюємо статистику
        if (tabId === 'reports') {
            updateStats();
        }
    });

    // === ЛОГІКА СТАТИСТИКИ (ДЛЯ "ЗВІТІВ") ===
    const updateStats = () => {
        const rows = document.getElementById('containerTableBody').rows;
        let transit = 0;
        let delivered = 0;
        let pending = 0;

        for (const row of rows) {
            const statusText = row.cells[1].textContent;
            if (statusText === 'У дорозі') transit++;
            else if (statusText === 'Доставлено') delivered++;
            else if (statusText === 'Очікує') pending++;
        }

        document.getElementById('stats-total').textContent = rows.length;
        document.getElementById('stats-transit').textContent = transit;
        document.getElementById('stats-delivered').textContent = delivered;
        document.getElementById('stats-pending').textContent = pending;
    };
    

    // === ЛОГІКА МОДАЛЬНОГО ВІКНА (Розділ 2.1) ===
    const modal = document.getElementById('detailsModal');
    const closeModalButton = document.querySelector('.modal-close');

    const openModal = (id, status, location, destination) => {
        document.getElementById('modal-id').textContent = id;
        document.getElementById('modal-status').textContent = status;
        document.getElementById('modal-location').textContent = location;
        document.getElementById('modal-destination').textContent = destination;
        modal.classList.add('open');
    };

    const closeModal = () => {
        modal.classList.remove('open');
    };

    const attachModalListeners = () => {
        const detailButtons = document.querySelectorAll('.btn-details'); 
        
        detailButtons.forEach(button => {
            button.removeEventListener('click', handleDetailClick);
            button.addEventListener('click', handleDetailClick);
        });
    };
    
    const handleDetailClick = (event) => {
        const row = event.target.closest('tr');
        const id = row.cells[0].textContent;
        const status = row.cells[1].textContent;
        const location = row.cells[2].textContent;
        const destination = row.cells[3].textContent;
        openModal(id, status, location, destination);
    };

    closeModalButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });


    // === ЛОГІКА ВАЛІДАЦІЇ ФОРМИ (Розділ 2.2, 2.3) ===
    const form = document.getElementById('addContainerForm');
    const containerIdInput = document.getElementById('containerId');
    const locationInput = document.getElementById('location');
    const destinationInput = document.getElementById('destination');

    const showError = (inputElement, message) => {
        const errorElement = document.getElementById(inputElement.id + 'Error');
        errorElement.textContent = message;
    };

    const clearErrors = () => {
        document.getElementById('idError').textContent = '';
        document.getElementById('locationError').textContent = '';
        document.getElementById('destinationError').textContent = '';
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault(); 
        clearErrors(); 
        let isValid = true;

        const idRegex = /^[A-Z]{2}-\d{6}$/;
        if (!idRegex.test(containerIdInput.value)) {
            showError(containerIdInput, 'Невірний формат. Очікується XX-123456');
            isValid = false;
        }
        if (locationInput.value.trim().length < 3) {
            showError(locationInput, 'Поле має містити мінімум 3 символи');
            isValid = false;
        }
        if (destinationInput.value.trim().length < 3) {
            showError(destinationInput, 'Поле має містити мінімум 3 символи');
            isValid = false;
        }

        if (isValid) {
            alert('Контейнер успішно додано!');
            
            const tableBody = document.getElementById('containerTableBody');
            const newRow = tableBody.insertRow(); 
            
            newRow.innerHTML = `
                <td>${containerIdInput.value}</td>
                <td><span class="status status-pending">Очікує</span></td>
                <td>${locationInput.value}</td>
                <td>${destinationInput.value}</td>
                <td><button class="btn-details">Деталі</button></td>
            `;
            
            form.reset(); 
            attachModalListeners(); // "Оживляємо" нову кнопку
            
            // Оновлюємо статистику (оскільки ми додали новий)
            updateStats();

            // Переходимо на вкладку "Панель управління"
            navLinksContainer.querySelector('a[data-tab="dashboard"]').click();
        }
    });

    // === ЗАПУСК ПРИ СТАРТІ ===
    attachModalListeners();
    updateStats();

});
