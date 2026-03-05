// js/Dashboard.js
import { MovieSearchWidget } from './MovieSearchWidget.js';
import { WatchlistWidget } from './WatchlistWidget.js';

export class Dashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }
        
        this.widgets = [];
        this.widgetCounter = 0;
        console.log('Dashboard initialized');
    }
    
    addWidget(widgetType) {
        this.widgetCounter++;
        const widgetId = `${widgetType}-${this.widgetCounter}-${Date.now()}`;
        let widget = null;
        
        console.log(`Creating widget: ${widgetType} with id: ${widgetId}`);
        
        switch(widgetType) {
            case 'search':
                widget = new MovieSearchWidget({
                    id: widgetId,
                    title: '🔍 NOW PLAYING SEARCH'
                });
                break;
            case 'watchlist':
                widget = new WatchlistWidget({
                    id: widgetId,
                    title: '📋 MY WATCHLIST'
                });
                break;
            default:
                console.error('Unknown widget type:', widgetType);
                return null;
        }
        
        // Рендерим виджет и добавляем в DOM
        const widgetElement = widget.render();
        this.container.appendChild(widgetElement);
        
        // Добавляем в коллекцию
        this.widgets.push(widget);
        
        // Настраиваем обработчики для закрытия и минимизации
        this.setupWidgetControls(widget);
        
        // Принудительно вызываем bindEvents для watchlist
        if (widgetType === 'watchlist' && typeof widget.bindEvents === 'function') {
            setTimeout(() => {
                console.log('Forcing bindEvents for watchlist');
                widget.bindEvents();
            }, 200);
        }
        
        return widget;
    }
    
    setupWidgetControls(widget) {
        // Используем сам элемент виджета, а не поиск по ID
        const widgetElement = widget.element;
        if (!widgetElement) return;
        
        const minimizeBtn = widgetElement.querySelector('.minimize-btn');
        const closeBtn = widgetElement.querySelector('.close-btn');
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                widget.minimize();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.removeWidget(widget.id);
            });
        }
    }
    
    removeWidget(widgetId) {
        console.log('Removing widget:', widgetId);
        const index = this.widgets.findIndex(w => w.id === widgetId);
        if (index !== -1) {
            const widget = this.widgets[index];
            widget.destroy();
            this.widgets.splice(index, 1);
        }
    }
    
    removeAllWidgets() {
        for (let i = this.widgets.length - 1; i >= 0; i--) {
            this.widgets[i].destroy();
        }
        this.widgets = [];
        this.widgetCounter = 0;
    }
    
    getWidgetsCount() {
        return this.widgets.length;
    }
}