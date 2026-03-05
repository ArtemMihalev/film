// js/WatchlistWidget.js
import { UIComponent } from './UIComponent.js';

export class WatchlistWidget extends UIComponent {
    constructor(config) {
        super(config);
        // Загружаем сохраненные задачи из localStorage
        this.items = this.loadFromStorage();
        console.log('WatchlistWidget created with items:', this.items);
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(`watchlist-${this.id}`);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return [];
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem(`watchlist-${this.id}`, JSON.stringify(this.items));
            console.log('Saved to storage:', this.items);
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }
    
    addItem(text) {
        if (!text || !text.trim()) {
            console.log('Empty text, not adding');
            return;
        }
        
        const trimmedText = text.trim();
        console.log('Adding item:', trimmedText);
        
        const newItem = {
            id: Date.now(),
            text: trimmedText,
            completed: false,
            timestamp: new Date().toISOString()
        };
        
        this.items.push(newItem);
        this.saveToStorage();
        this.renderContent();
    }
    
    toggleItem(id) {
        console.log('Toggling item:', id);
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.completed = !item.completed;
            this.saveToStorage();
            this.renderContent();
        }
    }
    
    deleteItem(id) {
        console.log('Deleting item:', id);
        this.items = this.items.filter(i => i.id !== id);
        this.saveToStorage();
        this.renderContent();
    }
    
    render() {
        console.log('Rendering WatchlistWidget');
        this.element = this.createContainer();
        
        // Создаем шапку
        const { header } = this.createHeader();
        this.element.appendChild(header);
        
        // Создаем контент
        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'widget-content';
        this.element.appendChild(this.contentDiv);
        
        // Рендерим начальное состояние
        this.renderContent();
        
        return this.element;
    }
    
    renderContent() {
        if (!this.contentDiv) return;
        
        // Генерируем HTML
        this.contentDiv.innerHTML = this.generateHTML();
        
        // Используем MutationObserver для обнаружения когда элементы добавлены в DOM
        this.observeAndBind();
    }
    
    observeAndBind() {
        // Ждем следующий кадр анимации чтобы гарантировать что DOM обновился
        requestAnimationFrame(() => {
            // Пробуем найти элементы
            const input = document.getElementById(`${this.id}-input`);
            const addBtn = document.getElementById(`${this.id}-add-btn`);
            
            if (input && addBtn) {
                // Если нашли - привязываем события
                this.bindEvents();
            } else {
                console.log('Elements not found yet, retrying...');
                // Если не нашли - пробуем еще раз через небольшую задержку
                setTimeout(() => this.bindEvents(), 50);
            }
        });
    }
    
    generateHTML() {
        const inputId = `${this.id}-input`;
        const addBtnId = `${this.id}-add-btn`;
        
        return `
            <div class="watchlist-container">
                <div class="watchlist-input-group">
                    <input type="text" 
                           class="watchlist-input" 
                           placeholder="ADD MOVIE TO WATCH..."
                           id="${inputId}"
                           value="">
                    <button class="watchlist-add-btn" id="${addBtnId}">
                        + ADD
                    </button>
                </div>
                
                <ul class="watchlist-items" id="${this.id}-list">
                    ${this.generateItemsHTML()}
                </ul>
                
                ${this.items.length > 0 ? `
                    <div style="margin-top:1rem;text-align:right;color:var(--text-secondary);">
                        🎬 ${this.items.length} movie${this.items.length !== 1 ? 's' : ''} in watchlist
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    generateItemsHTML() {
        if (this.items.length === 0) {
            return `
                <li class="watchlist-item" style="justify-content:center; list-style:none;">
                    <span style="color:var(--text-secondary);">🍿 NO MOVIES IN WATCHLIST</span>
                </li>
            `;
        }
        
        return this.items.map(item => `
            <li class="watchlist-item ${item.completed ? 'completed' : ''}" 
                style="list-style:none;"
                data-item-id="${item.id}">
                <input type="checkbox" 
                       class="watchlist-checkbox" 
                       id="watch-${item.id}"
                       ${item.completed ? 'checked' : ''}>
                <span class="watchlist-title">${this.escapeHtml(item.text)}</span>
                <button class="watchlist-delete" id="delete-${item.id}">✕</button>
            </li>
        `).join('');
    }
    
    bindEvents() {
        console.log('Binding events for watchlist:', this.id);
        
        // Находим элементы
        const input = document.getElementById(`${this.id}-input`);
        const addBtn = document.getElementById(`${this.id}-add-btn`);
        
        console.log('Found input:', input);
        console.log('Found addBtn:', addBtn);
        
        if (input && addBtn) {
            // Убираем старые обработчики
            input.onkeypress = null;
            addBtn.onclick = null;
            
            // Обработчик для кнопки Add
            addBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const value = input.value;
                console.log('Add button clicked, input value:', value);
                if (value && value.trim()) {
                    this.addItem(value);
                    input.value = ''; // Очищаем поле
                    input.focus(); // Возвращаем фокус
                } else {
                    alert('Please enter a movie name!');
                }
                return false;
            };
            
            // Обработчик для клавиши Enter
            input.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = input.value;
                    console.log('Enter pressed, input value:', value);
                    if (value && value.trim()) {
                        this.addItem(value);
                        input.value = '';
                    }
                    return false;
                }
            };
            
            console.log('Events bound successfully');
        } else {
            console.error('Could not find input or add button');
            // Пробуем еще раз через 100мс
            setTimeout(() => {
                const retryInput = document.getElementById(`${this.id}-input`);
                const retryBtn = document.getElementById(`${this.id}-add-btn`);
                if (retryInput && retryBtn) {
                    console.log('Retry successful!');
                    this.bindEvents();
                }
            }, 100);
        }
        
        // Привязываем события к элементам списка
        this.items.forEach(item => {
            const checkbox = document.getElementById(`watch-${item.id}`);
            const deleteBtn = document.getElementById(`delete-${item.id}`);
            
            if (checkbox) {
                checkbox.onchange = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Checkbox changed for item:', item.id);
                    this.toggleItem(item.id);
                };
            }
            
            if (deleteBtn) {
                deleteBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Delete clicked for item:', item.id);
                    this.deleteItem(item.id);
                    return false;
                };
            }
        });
    }
    
    // Защита от XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    destroy() {
        // Очищаем localStorage при удалении виджета
        try {
            localStorage.removeItem(`watchlist-${this.id}`);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
        super.destroy();
    }
}