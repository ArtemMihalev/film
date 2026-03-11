// main.js
import { Dashboard } from './js/Dashboard.js';

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 Cinema Dashboard initializing...');
    
    // Создаем экземпляр Dashboard
    const dashboard = new Dashboard('dashboard-container');
    
    // Добавляем обработчики для кнопок добавления виджетов
    const addButtons = document.querySelectorAll('[data-add]');
    
    addButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const widgetType = button.dataset.add;
            console.log('Adding widget:', widgetType);
            
            // Добавляем виджет (максимум 6 виджетов для красоты)
            if (dashboard.getWidgetsCount() < 6) {
                const widget = dashboard.addWidget(widgetType);
                console.log('Widget added:', widget);
            } else {
                alert('Максимум 6 виджетов. Закройте несколько, чтобы добавить новые. 🎬');
            }
        });
    });
    
    // Добавляем один виджет по умолчанию для примера
    setTimeout(() => {
        console.log('Adding default watchlist widget');
        dashboard.addWidget('watchlist');
    }, 1500);
});