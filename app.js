// CS2 Strategy Tool - Main Application

// Application State
const state = {
    currentTool: 'select',
    currentTeam: 'T',
    selectedElement: null,
    elements: [],
    timelineItems: [],
    strategies: [],
    history: [],
    historyIndex: -1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragLine: null
};

// DOM Elements
const elements = {
    mapCanvas: document.getElementById('map-canvas'),
    mapImage: document.getElementById('map-image'),
    strategyElements: document.getElementById('strategy-elements'),
    timelineItems: document.getElementById('timeline-items'),
    propertiesPanel: document.getElementById('properties-panel'),
    strategyList: document.getElementById('strategy-list'),
    strategyNotes: document.getElementById('strategy-notes'),
    saveModal: document.getElementById('save-modal'),
    timelineModal: document.getElementById('timeline-modal'),
    toastContainer: document.getElementById('toast-container')
};

// Tool buttons
const toolButtons = {
    select: document.getElementById('select-tool'),
    player: document.getElementById('player-tool'),
    smoke: document.getElementById('smoke-tool'),
    flash: document.getElementById('flash-tool'),
    he: document.getElementById('he-tool'),
    molotov: document.getElementById('molotov-tool'),
    decoy: document.getElementById('decoy-tool')
};

// Other buttons
const otherButtons = {
    clearAll: document.getElementById('clear-all'),
    undo: document.getElementById('undo-btn'),
    redo: document.getElementById('redo-btn'),
    saveStrategy: document.getElementById('save-strategy'),
    loadStrategy: document.getElementById('load-strategy'),
    exportPng: document.getElementById('export-png'),
    addTimelineItem: document.getElementById('add-timeline-item'),
    mapSelect: document.getElementById('map-select')
};

// Modal elements
const modalElements = {
    saveForm: document.getElementById('save-form'),
    timelineForm: document.getElementById('timeline-form'),
    strategyName: document.getElementById('strategy-name'),
    strategyType: document.getElementById('strategy-type'),
    actionTime: document.getElementById('action-time'),
    actionType: document.getElementById('action-type'),
    actionDescription: document.getElementById('action-description'),
    cancelSave: document.getElementById('cancel-save'),
    cancelTimeline: document.getElementById('cancel-timeline')
};

// Initialize the application
function init() {
    setupEventListeners();
    loadStrategies();
    updateUI();
    showToast('Bienvenue dans CS2 Strategy Tool!', 'info');
}

// Setup all event listeners
function setupEventListeners() {
    // Tool selection
    Object.keys(toolButtons).forEach(tool => {
        toolButtons[tool].addEventListener('click', () => setTool(tool));
    });

    // Team selection
    document.querySelectorAll('input[name="team"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.currentTeam = e.target.value;
            updateUI();
        });
    });

    // Map selection
    otherButtons.mapSelect.addEventListener('change', (e) => {
        changeMap(e.target.value);
    });

    // Canvas interactions
    elements.mapCanvas.addEventListener('mousedown', handleCanvasMouseDown);
    elements.mapCanvas.addEventListener('mousemove', handleCanvasMouseMove);
    elements.mapCanvas.addEventListener('mouseup', handleCanvasMouseUp);
    elements.mapCanvas.addEventListener('mouseleave', handleCanvasMouseUp);

    // Clear all
    otherButtons.clearAll.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir tout effacer?')) {
            clearAll();
        }
    });

    // Undo/Redo
    otherButtons.undo.addEventListener('click', undo);
    otherButtons.redo.addEventListener('click', redo);

    // Save/Load
    otherButtons.saveStrategy.addEventListener('click', () => showModal('save'));
    otherButtons.loadStrategy.addEventListener('click', loadStrategy);
    otherButtons.exportPng.addEventListener('click', exportToPNG);

    // Timeline
    otherButtons.addTimelineItem.addEventListener('click', () => showModal('timeline'));

    // Modal buttons
    modalElements.cancelSave.addEventListener('click', () => hideModal('save'));
    modalElements.cancelTimeline.addEventListener('click', () => hideModal('timeline'));

    // Form submissions
    modalElements.saveForm.addEventListener('submit', handleSaveStrategy);
    modalElements.timelineForm.addEventListener('submit', handleAddTimelineItem);

    // Strategy list
    elements.strategyList.addEventListener('click', handleStrategyListClick);

    // Notes
    elements.strategyNotes.addEventListener('input', (e) => {
        // Auto-save notes
        const currentStrategy = getCurrentStrategy();
        if (currentStrategy) {
            currentStrategy.notes = e.target.value;
            saveStrategies();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
}

// Set the current tool
function setTool(tool) {
    state.currentTool = tool;
    
    // Update active button
    Object.values(toolButtons).forEach(btn => btn.classList.remove('active'));
    toolButtons[tool].classList.add('active');
    
    // Clear selection when changing tool
    if (tool !== 'select') {
        state.selectedElement = null;
        updateUI();
    }
}

// Change the current map
function changeMap(mapName) {
    elements.mapImage.src = `maps/${mapName}.jpg`;
    elements.mapImage.alt = mapName.replace('_', ' ').toUpperCase();
    
    // Clear elements when changing map
    clearElements();
    
    showToast(`Carte changée: ${mapName.replace('_', ' ').toUpperCase()}`, 'info');
}

// Handle canvas mouse down
function handleCanvasMouseDown(e) {
    if (e.button !== 0) return; // Only left click
    
    const rect = elements.mapCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (state.currentTool === 'select') {
        // Check if we clicked on an element
        const elementAtPos = getElementAtPosition(x, y);
        if (elementAtPos) {
            state.selectedElement = elementAtPos;
            state.isDragging = true;
            state.dragStart = { x, y };
            
            // Bring to front
            const index = state.elements.indexOf(elementAtPos);
            if (index > -1) {
                state.elements.splice(index, 1);
                state.elements.push(elementAtPos);
            }
            
            updateUI();
            e.preventDefault();
        } else {
            // Deselect
            state.selectedElement = null;
            updateUI();
        }
    } else {
        // Create new element
        createElementAtPosition(x, y, state.currentTool);
    }
}

// Handle canvas mouse move
function handleCanvasMouseMove(e) {
    if (!state.isDragging || !state.selectedElement) return;
    
    const rect = elements.mapCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate delta
    const dx = x - state.dragStart.x;
    const dy = y - state.dragStart.y;
    
    // Update position
    state.selectedElement.x += dx;
    state.selectedElement.y += dy;
    
    // Update drag start
    state.dragStart = { x, y };
    
    // Update UI
    renderElements();
    updatePropertiesPanel();
}

// Handle canvas mouse up
function handleCanvasMouseUp() {
    if (state.isDragging) {
        state.isDragging = false;
        saveState();
    }
}

// Get element at specific position
function getElementAtPosition(x, y) {
    const threshold = 20; // pixels
    
    for (let i = state.elements.length - 1; i >= 0; i--) {
        const el = state.elements[i];
        const dx = x - el.x;
        const dy = y - el.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Different thresholds for different element types
        let elementThreshold = threshold;
        if (el.type === 'player') elementThreshold = 15;
        if (el.type === 'smoke') elementThreshold = 25;
        if (el.type === 'flash') elementThreshold = 20;
        
        if (distance <= elementThreshold) {
            return el;
        }
    }
    return null;
}

// Create element at position
function createElementAtPosition(x, y, type) {
    const newElement = {
        id: Date.now().toString(),
        type,
        x,
        y,
        team: state.currentTeam
    };
    
    // Add type-specific properties
    switch (type) {
        case 'player':
            newElement.number = getNextPlayerNumber();
            break;
        case 'smoke':
        case 'flash':
        case 'he':
        case 'molotov':
        case 'decoy':
            newElement.radius = 20;
            break;
    }
    
    state.elements.push(newElement);
    state.selectedElement = newElement;
    
    saveState();
    renderElements();
    updatePropertiesPanel();
    updateUI();
}

// Get next player number
function getNextPlayerNumber() {
    const playerNumbers = state.elements
        .filter(el => el.type === 'player' && el.team === state.currentTeam)
        .map(el => el.number || 0);
    
    for (let i = 1; i <= 5; i++) {
        if (!playerNumbers.includes(i)) return i;
    }
    return 1;
}

// Clear all elements
function clearAll() {
    clearElements();
    clearTimeline();
    elements.strategyNotes.value = '';
    saveState();
    showToast('Tous les éléments ont été effacés', 'info');
}

// Clear elements only
function clearElements() {
    state.elements = [];
    state.selectedElement = null;
    renderElements();
    updatePropertiesPanel();
    updateUI();
}

// Clear timeline
function clearTimeline() {
    state.timelineItems = [];
    renderTimeline();
}

// Render all elements
function renderElements() {
    elements.strategyElements.innerHTML = '';
    
    state.elements.forEach(el => {
        const element = createElementDOM(el);
        elements.strategyElements.appendChild(element);
    });
}

// Create DOM element for strategy element
function createElementDOM(el) {
    const div = document.createElement('div');
    div.className = `strategy-element ${el.type}-element`;
    div.style.left = `${el.x}px`;
    div.style.top = `${el.y}px`;
    
    if (el.type === 'player') {
        div.classList.add(el.team === 'T' ? 't-team' : 'ct-team');
        div.textContent = el.number || '';
    }
    
    if (state.selectedElement && state.selectedElement.id === el.id) {
        div.classList.add('selected');
    }
    
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        state.selectedElement = el;
        updatePropertiesPanel();
        updateUI();
    });
    
    div.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        // Delete element
        const index = state.elements.indexOf(el);
        if (index > -1) {
            state.elements.splice(index, 1);
            if (state.selectedElement === el) {
                state.selectedElement = null;
            }
            saveState();
            renderElements();
            updatePropertiesPanel();
            updateUI();
            showToast('Élément supprimé', 'info');
        }
    });
    
    return div;
}

// Update properties panel
function updatePropertiesPanel() {
    if (!state.selectedElement) {
        elements.propertiesPanel.innerHTML = '<p class="no-selection">Aucun élément sélectionné</p>';
        return;
    }
    
    const el = state.selectedElement;
    let html = '';
    
    switch (el.type) {
        case 'player':
            html = `
                <div class="property-row">
                    <label>Position X</label>
                    <input type="number" value="${el.x}" onchange="updateElementProperty('x', this.value)">
                </div>
                <div class="property-row">
                    <label>Position Y</label>
                    <input type="number" value="${el.y}" onchange="updateElementProperty('y', this.value)">
                </div>
                <div class="property-row">
                    <label>Numéro</label>
                    <input type="number" value="${el.number || 1}" min="1" max="5" onchange="updateElementProperty('number', this.value)">
                </div>
                <div class="property-row">
                    <label>Équipe</label>
                    <select onchange="updateElementProperty('team', this.value)">
                        <option value="T" ${el.team === 'T' ? 'selected' : ''}>Terroristes</option>
                        <option value="CT" ${el.team === 'CT' ? 'selected' : ''}>Contre-Terroristes</option>
                    </select>
                </div>
            `;
            break;
            
        case 'smoke':
        case 'flash':
        case 'he':
        case 'molotov':
        case 'decoy':
            html = `
                <div class="property-row">
                    <label>Position X</label>
                    <input type="number" value="${el.x}" onchange="updateElementProperty('x', this.value)">
                </div>
                <div class="property-row">
                    <label>Position Y</label>
                    <input type="number" value="${el.y}" onchange="updateElementProperty('y', this.value)">
                </div>
                <div class="property-row">
                    <label>Type</label>
                    <select onchange="updateElementProperty('type', this.value)">
                        <option value="smoke" ${el.type === 'smoke' ? 'selected' : ''}>Fumigène</option>
                        <option value="flash" ${el.type === 'flash' ? 'selected' : ''}>Flash</option>
                        <option value="he" ${el.type === 'he' ? 'selected' : ''}>HE Grenade</option>
                        <option value="molotov" ${el.type === 'molotov' ? 'selected' : ''}>Molotov</option>
                        <option value="decoy" ${el.type === 'decoy' ? 'selected' : ''}>Leurre</option>
                    </select>
                </div>
            `;
            break;
    }
    
    elements.propertiesPanel.innerHTML = html;
}

// Update element property
function updateElementProperty(property, value) {
    if (!state.selectedElement) return;
    
    // Convert value
    if (property === 'x' || property === 'y' || property === 'number') {
        value = parseInt(value) || 0;
    }
    
    state.selectedElement[property] = value;
    saveState();
    renderElements();
    updatePropertiesPanel();
}

// Save current state to history
function saveState() {
    // If we're not at the end of history, truncate
    if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
    }
    
    // Add new state
    const currentState = {
        elements: JSON.parse(JSON.stringify(state.elements)),
        timelineItems: JSON.parse(JSON.stringify(state.timelineItems))
    };
    
    state.history.push(currentState);
    state.historyIndex = state.history.length - 1;
    
    // Limit history size
    if (state.history.length > 50) {
        state.history.shift();
        state.historyIndex--;
    }
    
    updateUI();
}

// Undo action
function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        const previousState = state.history[state.historyIndex];
        state.elements = JSON.parse(JSON.stringify(previousState.elements));
        state.timelineItems = JSON.parse(JSON.stringify(previousState.timelineItems));
        state.selectedElement = null;
        
        renderElements();
        renderTimeline();
        updatePropertiesPanel();
        updateUI();
    }
}

// Redo action
function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const nextState = state.history[state.historyIndex];
        state.elements = JSON.parse(JSON.stringify(nextState.elements));
        state.timelineItems = JSON.parse(JSON.stringify(nextState.timelineItems));
        state.selectedElement = null;
        
        renderElements();
        renderTimeline();
        updatePropertiesPanel();
        updateUI();
    }
}

// Render timeline
function renderTimeline() {
    elements.timelineItems.innerHTML = '';
    
    state.timelineItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.innerHTML = `
            <span class="time">${item.time}s</span>
            <span class="action">${getActionText(item)}</span>
            <span class="delete" onclick="deleteTimelineItem('${item.id}')">×</span>
        `;
        elements.timelineItems.appendChild(div);
    });
}

// Get action text for timeline
function getActionText(item) {
    const actionTypes = {
        move: 'Déplacement',
        smoke: 'Fumigène',
        flash: 'Flash',
        he: 'HE Grenade',
        molotov: 'Molotov',
        decoy: 'Leurre',
        plant: 'Pose de la bombe',
        defuse: 'Désamorçage'
    };
    
    return `${actionTypes[item.type] || item.type}${item.description ? ` - ${item.description}` : ''}`;
}

// Delete timeline item
function deleteTimelineItem(id) {
    state.timelineItems = state.timelineItems.filter(item => item.id !== id);
    renderTimeline();
    saveState();
}

// Show modal
function showModal(modalName) {
    const modal = modalName === 'save' ? elements.saveModal : elements.timelineModal;
    modal.classList.add('active');
}

// Hide modal
function hideModal(modalName) {
    const modal = modalName === 'save' ? elements.saveModal : elements.timelineModal;
    modal.classList.remove('active');
}

// Handle save strategy
function handleSaveStrategy(e) {
    e.preventDefault();
    
    const name = modalElements.strategyName.value.trim();
    const type = modalElements.strategyType.value;
    
    if (!name) {
        showToast('Veuillez entrer un nom pour la stratégie', 'error');
        return;
    }
    
    const strategy = {
        id: Date.now().toString(),
        name,
        type,
        map: otherButtons.mapSelect.value,
        elements: JSON.parse(JSON.stringify(state.elements)),
        timelineItems: JSON.parse(JSON.stringify(state.timelineItems)),
        notes: elements.strategyNotes.value,
        createdAt: new Date().toISOString()
    };
    
    state.strategies.push(strategy);
    saveStrategies();
    
    modalElements.saveForm.reset();
    hideModal('save');
    renderStrategyList();
    showToast(`Stratégie "${name}" sauvegardée`, 'success');
}

// Handle add timeline item
function handleAddTimelineItem(e) {
    e.preventDefault();
    
    const time = parseInt(modalElements.actionTime.value) || 0;
    const type = modalElements.actionType.value;
    const description = modalElements.actionDescription.value.trim();
    
    const newItem = {
        id: Date.now().toString(),
        time,
        type,
        description
    };
    
    state.timelineItems.push(newItem);
    state.timelineItems.sort((a, b) => a.time - b.time);
    
    saveState();
    renderTimeline();
    
    modalElements.timelineForm.reset();
    hideModal('timeline');
    showToast('Action ajoutée à la timeline', 'success');
}

// Load strategies from localStorage
function loadStrategies() {
    try {
        const saved = localStorage.getItem('cs2-strategy-tool');
        if (saved) {
            state.strategies = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading strategies:', e);
    }
    
    renderStrategyList();
}

// Save strategies to localStorage
function saveStrategies() {
    try {
        localStorage.setItem('cs2-strategy-tool', JSON.stringify(state.strategies));
    } catch (e) {
        console.error('Error saving strategies:', e);
    }
}

// Render strategy list
function renderStrategyList() {
    elements.strategyList.innerHTML = `
        <div class="strategy-item new-strategy">
            <span class="icon">+</span>
            <span>Nouvelle Stratégie</span>
        </div>
    `;
    
    state.strategies.forEach(strategy => {
        const div = document.createElement('div');
        div.className = 'strategy-item';
        div.dataset.id = strategy.id;
        div.innerHTML = `
            <span class="icon">${getStrategyIcon(strategy.type)}</span>
            <span class="name">${strategy.name}</span>
            <span class="meta">${strategy.map.replace('_', ' ')} - ${strategy.type}</span>
        `;
        elements.strategyList.appendChild(div);
    });
}

// Get strategy icon based on type
function getStrategyIcon(type) {
    const icons = {
        attack: '⚔️',
        defense: '🛡️',
        retake: '🔄',
        execute: '🎯'
    };
    return icons[type] || '📋';
}

// Handle strategy list click
function handleStrategyListClick(e) {
    const strategyItem = e.target.closest('.strategy-item');
    if (!strategyItem) return;
    
    if (strategyItem.classList.contains('new-strategy')) {
        // Create new strategy
        clearAll();
        showToast('Nouvelle stratégie créée', 'info');
    } else {
        const strategyId = strategyItem.dataset.id;
        const strategy = state.strategies.find(s => s.id === strategyId);
        if (strategy) {
            loadStrategyFromObject(strategy);
        }
    }
}

// Load strategy from object
function loadStrategyFromObject(strategy) {
    // Change map
    otherButtons.mapSelect.value = strategy.map;
    changeMap(strategy.map);
    
    // Load elements
    state.elements = JSON.parse(JSON.stringify(strategy.elements));
    
    // Load timeline
    state.timelineItems = JSON.parse(JSON.stringify(strategy.timelineItems));
    
    // Load notes
    elements.strategyNotes.value = strategy.notes || '';
    
    // Reset selection
    state.selectedElement = null;
    
    // Render
    renderElements();
    renderTimeline();
    updatePropertiesPanel();
    updateUI();
    
    // Save to history
    saveState();
    
    showToast(`Stratégie "${strategy.name}" chargée`, 'success');
}

// Load strategy (from file)
function loadStrategy() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const strategy = JSON.parse(event.target.result);
                loadStrategyFromObject(strategy);
            } catch (e) {
                showToast('Erreur lors du chargement du fichier', 'error');
            }
        };
        reader.readAsText(file);
    });
    
    input.click();
}

// Export to PNG
function exportToPNG() {
    // Use html2canvas library if available
    if (typeof html2canvas !== 'undefined') {
        html2canvas(elements.mapCanvas).then(canvas => {
            const link = document.createElement('a');
            link.download = `cs2-strategy-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    } else {
        showToast('html2canvas non chargé. Export non disponible.', 'error');
    }
}

// Get current strategy
function getCurrentStrategy() {
    // For now, just return a temporary strategy object
    return {
        name: 'Stratégie actuelle',
        type: 'attack',
        map: otherButtons.mapSelect.value,
        elements: state.elements,
        timelineItems: state.timelineItems,
        notes: elements.strategyNotes.value
    };
}

// Handle keyboard shortcuts
function handleKeyDown(e) {
    // Delete selected element
    if (e.key === 'Delete' && state.selectedElement) {
        const index = state.elements.indexOf(state.selectedElement);
        if (index > -1) {
            state.elements.splice(index, 1);
            state.selectedElement = null;
            saveState();
            renderElements();
            updatePropertiesPanel();
            updateUI();
        }
    }
    
    // Undo/Redo
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
            e.preventDefault();
            undo();
        }
        if (e.key === 'y') {
            e.preventDefault();
            redo();
        }
    }
    
    // Escape to deselect
    if (e.key === 'Escape') {
        state.selectedElement = null;
        updatePropertiesPanel();
        updateUI();
    }
}

// Update UI based on state
function updateUI() {
    // Update undo/redo buttons
    otherButtons.undo.disabled = state.historyIndex <= 0;
    otherButtons.redo.disabled = state.historyIndex >= state.history.length - 1;
    
    // Update team colors in toolbar
    const teamColor = state.currentTeam === 'T' ? 'var(--t-color)' : 'var(--ct-color)';
    Object.values(toolButtons).forEach(btn => {
        if (btn.id === 'player-tool') {
            btn.style.backgroundColor = teamColor;
        }
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Make functions globally available for onclick handlers
window.updateElementProperty = updateElementProperty;
window.deleteTimelineItem = deleteTimelineItem;
