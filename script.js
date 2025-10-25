// Чекаємо, поки вся HTML-сторінка завантажиться
document.addEventListener('DOMContentLoaded', () => {

    // === ЛОГІКА ПАРАЛАКСУ ===
    window.addEventListener('scroll', () => {
        const parallaxElement = document.querySelector('#dashboard.active .parallax-container');
        if (parallaxElement) {
            const scrolled = window.scrollY;
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
        navLinks.forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === tabId) {
                section.classList.add('active');
            }
        });
        if (tabId === 'reports') {
            updateStats();
        }
    });

    // === ЛОГІКА СТАТИСТИКИ (ДЛЯ "ЗВІТІВ") ===
    const updateStats = () => {
        const rows = document.getElementById('containerTableBody').rows;
        let transit = 0, delivered = 0, pending = 0;
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

    // === ЛОГІКА МОДАЛЬНОГО ВІКНА ===
    const modal = document.getElementById('detailsModal');
    const closeModalButton = document.querySelector('.modal-close');
    const openModal = (id, status, location, destination) => {
        document.getElementById('modal-id').textContent = id;
        document.getElementById('modal-status').textContent = status; // Правильний ID
        document.getElementById('modal-location').textContent = location;
        document.getElementById('modal-destination').textContent = destination;
        modal.classList.add('open');
    };
    const closeModal = () => modal.classList.remove('open');
    const handleDetailClick = (event) => {
        const row = event.target.closest('tr');
        openModal(
            row.cells[0].textContent,
            row.cells[1].textContent,
            row.cells[2].textContent,
            row.cells[3].textContent
        );
    };
    const attachModalListeners = () => {
        document.querySelectorAll('.btn-details').forEach(button => {
            button.removeEventListener('click', handleDetailClick);
            button.addEventListener('click', handleDetailClick);
        });
    };
    closeModalButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    // === ЛОГІКА ВАЛІДАЦІЇ ФОРМИ ===
    const form = document.getElementById('addContainerForm');
    const containerIdInput = document.getElementById('containerId');
    const locationInput = document.getElementById('location');
    const destinationInput = document.getElementById('destination');
    const errorColor = '#e53e3e', successColor = '#38a169';
    const errorShadow = '0 0 5px rgba(229, 62, 62, 0.5)';
    const successShadow = '0 0 5px rgba(56, 161, 105, 0.5)';
    const defaultBorderColor = '#4a5568';

    /**
     * Оновлює вигляд поля та показує/ховає повідомлення про помилку.
     * state: 'error', 'success', або 'neutral'
     */
    const setValidationState = (inputElement, state, message) => {
        // --- ВИПРАВЛЕННЯ ТУТ ---
        // Ми беремо ID інпута (напр. 'containerId') і шукаємо ID помилки ('idError')
        let errorId;
        if (inputElement.id === 'containerId') errorId = 'idError';
        else if (inputElement.id === 'location') errorId = 'locationError';
        else if (inputElement.id === 'destination') errorId = 'destinationError';
        else return; // Якщо ID невідомий, нічого не робимо

        const errorElement = document.getElementById(errorId);
        // --- КІНЕЦЬ ВИПРАВЛЕННЯ ---

        if (errorElement) {
            errorElement.textContent = message || ''; // Показуємо повідомлення або очищуємо
        }

        switch (state) {
            case 'error':
                inputElement.style.borderColor = errorColor;
                inputElement.style.boxShadow = errorShadow;
                break;
            case 'success':
                inputElement.style.borderColor = successColor;
                inputElement.style.boxShadow = successShadow;
                break;
            case 'neutral':
                inputElement.style.borderColor = defaultBorderColor;
                inputElement.style.boxShadow = '';
                break;
        }
    };

    const validateId = () => {
        const idRegex = /^[A-Z]{2}-\d{6}$/;
        if (containerIdInput.value.length === 0) {
            setValidationState(containerIdInput, 'neutral'); return false;
        }
        if (idRegex.test(containerIdInput.value)) {
            setValidationState(containerIdInput, 'success'); return true;
        }
        setValidationState(containerIdInput, 'error', 'Невірний формат. Очікується XX-123456');
        return false;
    };
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

    containerIdInput.addEventListener('input', validateId);
    locationInput.addEventListener('input', validateLocation);
    destinationInput.addEventListener('input', validateDestination);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        let isIdValid = validateId();
        let isLocationValid = validateLocation();
        let isDestinationValid = validateDestination();

        if (containerIdInput.value.trim().length === 0) {
            setValidationState(containerIdInput, 'error', 'Поле не може бути порожнім'); isIdValid = false;
        }
        if (locationInput.value.trim().length === 0) {
            setValidationState(locationInput, 'error', 'Поле не може бути порожнім'); isLocationValid = false;
        }
        if (destinationInput.value.trim().length === 0) {
            setValidationState(destinationInput, 'error', 'Поле не може бути порожнім'); isDestinationValid = false;
        }

        if (isIdValid && isLocationValid && isDestinationValid) {
            alert('Контейнер успішно додано!');
            const tableBody = document.getElementById('containerTableBody');
            const newRow = tableBody.insertRow();
            newRow.innerHTML = `<td>${containerIdInput.value}</td><td><span class="status status-pending">Очікує</span></td><td>${locationInput.value}</td><td>${destinationInput.value}</td><td><button class="btn-details">Деталі</button></td>`;
            form.reset();
            setValidationState(containerIdInput, 'neutral');
            setValidationState(locationInput, 'neutral');
            setValidationState(destinationInput, 'neutral');
            attachModalListeners();
            updateStats();
            navLinksContainer.querySelector('a[data-tab="dashboard"]').click();
        }
    });

    // === ЗАПУСК ПРИ СТАРТІ ===
    attachModalListeners();
    updateStats();
});
