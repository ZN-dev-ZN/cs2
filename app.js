// EVA Strategy Tool - Main Application with Sequences and Animations

// Application State
const state = {
    currentTool: 'select',
    currentTeam: 'alpha',
    selectedElement: null,
    elements: [],
    sequences: [],
    currentSequence: null,
    isPlaying: false,
    isRecording: false,
    playbackProgress: 0,
    playbackInterval: null,
    history: [],
    historyIndex: -1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    playerCounters: {
        alpha: 0,
        bravo: 0
    },
    equipment: {
        shield: true,
        smoke: false,
        flash: false,
        he: false,
        molotov: false
    }
};

// DOM Elements
const elements = {
    mapCanvas: document.getElementById('map-canvas'),
    mapImage: document.getElementById('map-image'),
    strategyElements: document.getElementById('strategy-elements'),
    sequenceCanvas: document.getElementById('sequence-canvas'),
    sequencesList: document.getElementById('sequences-list'),
    propertiesPanel: document.getElementById('properties-panel'),
    strategyList: document.getElementById('strategy-list'),
    strategyNotes: document.getElementById('strategy-notes'),
    alphaPlayers: document.getElementById('alpha-players'),
    bravoPlayers: document.getElementById('bravo-players'),
    saveModal: document.getElementById('save-modal'),
    sequenceModal: document.getElementById('sequence-modal'),
    toastContainer: document.getElementById('toast-container'),
    playbackIndicator: document.createElement('div'),
    playbackProgress: document.createElement('div'),
    playbackBar: document.createElement('div')
};

// Tool buttons
const toolButtons = {
    select: document.getElementById('select-tool'),
    player: document.getElementById('player-tool'),
    shield: document.getElementById('shield-tool'),
    smoke: document.getElementById('smoke-tool'),
    flash: document.getElementById('flash-tool'),
    he: document.getElementById('he-tool'),
    molotov: document.getElementById('molotov-tool')
};

// Other buttons
const otherButtons = {
    clearAll: document.getElementById('clear-all'),
    undo: document.getElementById('undo-btn'),
    redo: document.getElementById('redo-btn'),
    saveStrategy: document.getElementById('save-strategy'),
    loadStrategy: document.getElementById('load-strategy'),
    exportGif: document.getElementById('export-gif'),
    addSequence: document.getElementById('add-sequence'),
    playSequences: document.getElementById('play-sequences'),
    stopSequences: document.getElementById('stop-sequences'),
    mapSelect: document.getElementById('map-select')
};

// Modal elements
const modalElements = {
    saveForm: document.getElementById('save-form'),
    sequenceForm: document.getElementById('sequence-form'),
    strategyName: document.getElementById('strategy-name'),
    sequenceName: document.getElementById('sequence-name'),
    sequenceDuration: document.getElementById('sequence-duration'),
    sequenceDescription: document.getElementById('sequence-description'),
    cancelSave: document.getElementById('cancel-save'),
    cancelSequence: document.getElementById('cancel-sequence')
};

// Equipment checkboxes
const equipmentCheckboxes = {
    shield: document.getElementById('has-shield'),
    smoke: document.getElementById('has-smoke'),
    flash: document.getElementById('has-flash'),
    he: document.getElementById('has-he'),
    molotov: document.getElementById('has-molotov')
};

// Sequence canvas context
let sequenceCtx = null;

// Initialize the application
function init() {
    // Initialize sequence canvas
    sequenceCtx = elements.sequenceCanvas.getContext('2d');
    resizeSequenceCanvas();
    
    // Setup playback indicator
    elements.playbackIndicator.className = 'playback-indicator';
    elements.playbackProgress.className = 'playback-progress';
    elements.playbackBar.className = 'playback-progress-bar';
    elements.playbackProgress.appendChild(elements.playbackBar);
    elements.playbackIndicator.appendChild(elements.playbackProgress);
    document.body.appendChild(elements.playbackIndicator);
    
    setupEventListeners();
    loadStrategies();
    updateUI();
    updatePlayerSlots();
    showToast('Bienvenue dans EVA Strategy Tool!', 'info');
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
            updatePlayerSlots();
        });
    });

    // Equipment selection
    Object.keys(equipmentCheckboxes).forEach(key => {
        equipmentCheckboxes[key].addEventListener('change', (e) => {
            state.equipment[key] = e.target.checked;
            if (state.selectedElement && state.selectedElement.type === 'player') {
                state.selectedElement.equipment = { ...state.equipment };
                renderElements();
            }
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
    
    // Resize handler
    window.addEventListener('resize', () => {
        resizeSequenceCanvas();
        renderSequencePaths();
    });

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
    otherButtons.exportGif.addEventListener('click', exportToGIF);

    // Sequences
    otherButtons.addSequence.addEventListener('click', () => showModal('sequence'));
    otherButtons.playSequences.addEventListener('click', playSequences);
    otherButtons.stopSequences.addEventListener('click', stopSequences);

    // Modal buttons
    modalElements.cancelSave.addEventListener('click', () => hideModal('save'));
    modalElements.cancelSequence.addEventListener('click', () => hideModal('sequence'));

    // Form submissions
    modalElements.saveForm.addEventListener('submit', handleSaveStrategy);
    modalElements.sequenceForm.addEventListener('submit', handleAddSequence);

    // Strategy list
    elements.strategyList.addEventListener('click', handleStrategyListClick);

    // Notes
    elements.strategyNotes.addEventListener('input', (e) => {
        const currentStrategy = getCurrentStrategy();
        if (currentStrategy) {
            currentStrategy.notes = e.target.value;
            saveStrategies();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
}

// Resize sequence canvas
function resizeSequenceCanvas() {
    const rect = elements.mapCanvas.getBoundingClientRect();
    elements.sequenceCanvas.width = rect.width;
    elements.sequenceCanvas.height = rect.height;
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
    elements.mapImage.src = `maps/${mapName}.png`;
    elements.mapImage.alt = mapName.replace('_', ' ').toUpperCase();
    
    // Clear elements when changing map
    clearElements();
    
    showToast(`Carte changée: ${mapName.replace('_', ' ')}`, 'info');
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
            updatePropertiesPanel();
            e.preventDefault();
        } else {
            // Deselect
            state.selectedElement = null;
            updateUI();
        }
    } else {
        // Check if we can add more players
        if (state.currentTool === 'player') {
            const currentCount = state.elements.filter(
                el => el.type === 'player' && el.team === state.currentTeam
            ).length;
            
            if (currentCount >= 4) {
                showToast(`Maximum de 4 joueurs atteints pour l'équipe ${state.currentTeam}`, 'error');
                return;
            }
        }
        
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
    renderSequencePaths();
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
        if (el.type === 'player') elementThreshold = 20;
        if (el.type === 'shield') elementThreshold = 25;
        if (el.type === 'smoke') elementThreshold = 30;
        if (el.type === 'flash') elementThreshold = 25;
        
        if (distance <= elementThreshold) {
            return el;
        }
    }
    return null;
}

// Create element at position
function createElementAtPosition(x, y, type) {
    // Check player limit
    if (type === 'player') {
        const currentCount = state.elements.filter(
            el => el.type === 'player' && el.team === state.currentTeam
        ).length;
        
        if (currentCount >= 4) {
            showToast(`Maximum de 4 joueurs atteints pour l'équipe ${state.currentTeam}`, 'error');
            return;
        }
        
        // Increment player counter
        state.playerCounters[state.currentTeam]++;
    }
    
    const newElement = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        type,
        x,
        y,
        team: state.currentTeam
    };
    
    // Add type-specific properties
    switch (type) {
        case 'player':
            newElement.number = state.playerCounters[state.currentTeam];
            newElement.equipment = { ...state.equipment };
            break;
        case 'shield':
            newElement.size = 30;
            break;
        case 'smoke':
        case 'flash':
        case 'he':
        case 'molotov':
            newElement.radius = 20;
            break;
    }
    
    state.elements.push(newElement);
    state.selectedElement = newElement;
    
    saveState();
    renderElements();
    renderSequencePaths();
    updatePropertiesPanel();
    updateUI();
    updatePlayerSlots();
}

// Update player slots display
function updatePlayerSlots() {
    // Update Alpha team slots
    const alphaSlots = elements.alphaPlayers.querySelectorAll('.player-slot');
    const alphaPlayers = state.elements.filter(
        el => el.type === 'player' && el.team === 'alpha'
    ).length;
    
    alphaSlots.forEach((slot, index) => {
        if (index < alphaPlayers) {
            slot.classList.add('used');
            slot.textContent = index + 1;
        } else {
            slot.classList.remove('used');
            slot.textContent = '';
        }
    });
    
    // Update Bravo team slots
    const bravoSlots = elements.bravoPlayers.querySelectorAll('.player-slot');
    const bravoPlayers = state.elements.filter(
        el => el.type === 'player' && el.team === 'bravo'
    ).length;
    
    bravoSlots.forEach((slot, index) => {
        if (index < bravoPlayers) {
            slot.classList.add('used', 'bravo');
            slot.textContent = index + 1;
        } else {
            slot.classList.remove('used', 'bravo');
            slot.textContent = '';
        }
    });
}

// Clear all elements
function clearAll() {
    clearElements();
    clearSequences();
    elements.strategyNotes.value = '';
    state.playerCounters = { alpha: 0, bravo: 0 };
    saveState();
    showToast('Tous les éléments ont été effacés', 'info');
}

// Clear elements only
function clearElements() {
    state.elements = [];
    state.selectedElement = null;
    renderElements();
    renderSequencePaths();
    updatePropertiesPanel();
    updateUI();
    updatePlayerSlots();
}

// Clear sequences
function clearSequences() {
    state.sequences = [];
    state.currentSequence = null;
    renderSequences();
    renderSequencePaths();
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
    div.className = `strategy-element ${el.type}-element ${el.team}-team`;
    div.style.left = `${el.x}px`;
    div.style.top = `${el.y}px`;
    div.dataset.id = el.id;
    
    if (el.type === 'player') {
        div.textContent = el.number || '';
        if (el.equipment && el.equipment.shield) {
            div.classList.add('has-shield');
        }
    }
    
    if (state.selectedElement && state.selectedElement.id === el.id) {
        div.classList.add('selected');
    }
    
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        state.selectedElement = el;
        updatePropertiesPanel();
        updateUI();
        
        // Update equipment checkboxes
        if (el.type === 'player' && el.equipment) {
            Object.keys(equipmentCheckboxes).forEach(key => {
                equipmentCheckboxes[key].checked = el.equipment[key] || false;
            });
        }
    });
    
    div.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        // Delete element
        const index = state.elements.indexOf(el);
        if (index > -1) {
            // Decrement player counter if it's a player
            if (el.type === 'player') {
                state.playerCounters[el.team]--;
            }
            
            state.elements.splice(index, 1);
            if (state.selectedElement === el) {
                state.selectedElement = null;
            }
            saveState();
            renderElements();
            renderSequencePaths();
            updatePropertiesPanel();
            updateUI();
            updatePlayerSlots();
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
                    <input type="number" value="${el.number || 1}" min="1" max="4" onchange="updateElementProperty('number', this.value)">
                </div>
                <div class="property-row">
                    <label>Équipe</label>
                    <select onchange="updateElementProperty('team', this.value)">
                        <option value="alpha" ${el.team === 'alpha' ? 'selected' : ''}>Alpha</option>
                        <option value="bravo" ${el.team === 'bravo' ? 'selected' : ''}>Bravo</option>
                    </select>
                </div>
            `;
            break;
            
        case 'shield':
        case 'smoke':
        case 'flash':
        case 'he':
        case 'molotov':
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
                        <option value="shield" ${el.type === 'shield' ? 'selected' : ''}>Bouclier</option>
                        <option value="smoke" ${el.type === 'smoke' ? 'selected' : ''}>Fumigène</option>
                        <option value="flash" ${el.type === 'flash' ? 'selected' : ''}>Flash</option>
                        <option value="he" ${el.type === 'he' ? 'selected' : ''}>Grenade</option>
                        <option value="molotov" ${el.type === 'molotov' ? 'selected' : ''}>Feu</option>
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
    
    // Handle team change
    if (property === 'team') {
        const oldTeam = state.selectedElement.team;
        state.selectedElement[property] = value;
        
        // Update player counters
        if (state.selectedElement.type === 'player') {
            state.playerCounters[oldTeam]--;
            state.playerCounters[value]++;
            updatePlayerSlots();
        }
    } else {
        state.selectedElement[property] = value;
    }
    
    saveState();
    renderElements();
    renderSequencePaths();
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
        sequences: JSON.parse(JSON.stringify(state.sequences)),
        playerCounters: JSON.parse(JSON.stringify(state.playerCounters))
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
        state.sequences = JSON.parse(JSON.stringify(previousState.sequences));
        state.playerCounters = JSON.parse(JSON.stringify(previousState.playerCounters));
        state.selectedElement = null;
        
        renderElements();
        renderSequences();
        renderSequencePaths();
        updatePropertiesPanel();
        updateUI();
        updatePlayerSlots();
    }
}

// Redo action
function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const nextState = state.history[state.historyIndex];
        state.elements = JSON.parse(JSON.stringify(nextState.elements));
        state.sequences = JSON.parse(JSON.stringify(nextState.sequences));
        state.playerCounters = JSON.parse(JSON.stringify(nextState.playerCounters));
        state.selectedElement = null;
        
        renderElements();
        renderSequences();
        renderSequencePaths();
        updatePropertiesPanel();
        updateUI();
        updatePlayerSlots();
    }
}

// Render sequences
function renderSequences() {
    elements.sequencesList.innerHTML = '';
    
    state.sequences.forEach(sequence => {
        const div = document.createElement('div');
        div.className = `sequence-item ${state.currentSequence && state.currentSequence.id === sequence.id ? 'active' : ''}`;
        div.dataset.id = sequence.id;
        
        div.innerHTML = `
            <div class="sequence-info">
                <span class="sequence-name">${sequence.name}</span>
                <span class="sequence-duration">${sequence.duration}s</span>
            </div>
            ${sequence.description ? `<div class="sequence-description">${sequence.description}</div>` : ''}
            <div class="sequence-actions">
                <button class="seq-btn" onclick="selectSequence('${sequence.id}')">Sélectionner</button>
                <button class="seq-btn" onclick="editSequence('${sequence.id}')">Modifier</button>
                <button class="seq-btn danger" onclick="deleteSequence('${sequence.id}')">×</button>
            </div>
        `;
        
        elements.sequencesList.appendChild(div);
    });
}

// Select sequence
function selectSequence(sequenceId) {
    const sequence = state.sequences.find(s => s.id === sequenceId);
    if (sequence) {
        state.currentSequence = sequence;
        renderSequences();
        renderSequencePaths();
        showToast(`Séquence "${sequence.name}" sélectionnée`, 'info');
    }
}

// Edit sequence
function editSequence(sequenceId) {
    const sequence = state.sequences.find(s => s.id === sequenceId);
    if (sequence) {
        modalElements.sequenceName.value = sequence.name;
        modalElements.sequenceDuration.value = sequence.duration;
        modalElements.sequenceDescription.value = sequence.description || '';
        
        // Store the sequence ID for editing
        modalElements.sequenceForm.dataset.editingId = sequenceId;
        
        showModal('sequence');
    }
}

// Delete sequence
function deleteSequence(sequenceId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette séquence?')) {
        state.sequences = state.sequences.filter(s => s.id !== sequenceId);
        if (state.currentSequence && state.currentSequence.id === sequenceId) {
            state.currentSequence = null;
        }
        renderSequences();
        renderSequencePaths();
        saveState();
        showToast('Séquence supprimée', 'info');
    }
}

// Add sequence
function handleAddSequence(e) {
    e.preventDefault();
    
    const name = modalElements.sequenceName.value.trim();
    const duration = parseInt(modalElements.sequenceDuration.value) || 5;
    const description = modalElements.sequenceDescription.value.trim();
    
    if (!name) {
        showToast('Veuillez entrer un nom pour la séquence', 'error');
        return;
    }
    
    const editingId = modalElements.sequenceForm.dataset.editingId;
    
    if (editingId) {
        // Update existing sequence
        const sequence = state.sequences.find(s => s.id === editingId);
        if (sequence) {
            sequence.name = name;
            sequence.duration = duration;
            sequence.description = description;
        }
    } else {
        // Create new sequence
        const newSequence = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name,
            duration,
            description,
            frames: []
        };
        
        // Add current elements as first frame
        newSequence.frames.push({
            time: 0,
            elements: JSON.parse(JSON.stringify(state.elements))
        });
        
        state.sequences.push(newSequence);
        state.currentSequence = newSequence;
    }
    
    modalElements.sequenceForm.reset();
    delete modalElements.sequenceForm.dataset.editingId;
    hideModal('sequence');
    
    renderSequences();
    saveState();
    showToast(`Séquence "${name}" ${editingId ? 'modifiée' : 'créée'}`, 'success');
}

// Add current state to current sequence
function addFrameToSequence() {
    if (!state.currentSequence) {
        showToast('Aucune séquence sélectionnée', 'error');
        return;
    }
    
    const lastFrame = state.currentSequence.frames[state.currentSequence.frames.length - 1];
    const lastTime = lastFrame ? lastFrame.time : 0;
    const duration = state.currentSequence.duration || 5;
    const frameCount = state.currentSequence.frames.length;
    
    // Calculate time for new frame
    const newTime = Math.min(lastTime + (duration / frameCount), duration);
    
    // Add frame
    state.currentSequence.frames.push({
        time: newTime,
        elements: JSON.parse(JSON.stringify(state.elements))
    });
    
    // Sort frames by time
    state.currentSequence.frames.sort((a, b) => a.time - b.time);
    
    renderSequencePaths();
    saveState();
    showToast(`Cadre ajouté à ${newTime.toFixed(1)}s`, 'success');
}

// Render sequence paths
function renderSequencePaths() {
    if (!state.currentSequence || !sequenceCtx) return;
    
    // Clear canvas
    sequenceCtx.clearRect(0, 0, elements.sequenceCanvas.width, elements.sequenceCanvas.height);
    
    const frames = state.currentSequence.frames;
    if (frames.length < 2) return;
    
    // Draw paths between frames
    sequenceCtx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
    sequenceCtx.lineWidth = 2;
    sequenceCtx.setLineDash([5, 3]);
    
    // For each element type, draw paths
    const elementTypes = ['player', 'shield', 'smoke', 'flash', 'he', 'molotov'];
    
    elementTypes.forEach(type => {
        // Get elements of this type from all frames
        const typeElements = frames.map(frame => {
            return frame.elements.filter(el => el.type === type);
        });
        
        // For each element (matched by ID or index), draw path
        const maxElements = Math.max(...typeElements.map(arr => arr.length));
        
        for (let i = 0; i < maxElements; i++) {
            const pathPoints = [];
            
            for (let frameIndex = 0; frameIndex < frames.length; frameIndex++) {
                const frameElements = typeElements[frameIndex];
                if (frameElements[i]) {
                    const el = frameElements[i];
                    const canvasRect = elements.mapCanvas.getBoundingClientRect();
                    const x = el.x + canvasRect.left;
                    const y = el.y + canvasRect.top;
                    pathPoints.push({ x, y, frameIndex });
                }
            }
            
            if (pathPoints.length >= 2) {
                sequenceCtx.beginPath();
                sequenceCtx.moveTo(pathPoints[0].x, pathPoints[0].y);
                
                for (let j = 1; j < pathPoints.length; j++) {
                    sequenceCtx.lineTo(pathPoints[j].x, pathPoints[j].y);
                }
                
                sequenceCtx.stroke();
            }
        }
    });
    
    // Draw markers at key points
    frames.forEach((frame, index) => {
        frame.elements.forEach(el => {
            const canvasRect = elements.mapCanvas.getBoundingClientRect();
            const x = el.x + canvasRect.left;
            const y = el.y + canvasRect.top;
            
            sequenceCtx.fillStyle = 'rgba(0, 212, 255, 0.8)';
            sequenceCtx.beginPath();
            sequenceCtx.arc(x, y, 4, 0, Math.PI * 2);
            sequenceCtx.fill();
        });
    });
}

// Play sequences
function playSequences() {
    if (!state.currentSequence || state.isPlaying) return;
    
    state.isPlaying = true;
    state.playbackProgress = 0;
    
    // Show playback indicator
    elements.playbackIndicator.classList.add('active');
    elements.playbackBar.style.width = '0%';
    
    const duration = state.currentSequence.duration * 1000; // in ms
    const frames = state.currentSequence.frames;
    const startTime = Date.now();
    
    // Clear any existing interval
    if (state.playbackInterval) {
        clearInterval(state.playbackInterval);
    }
    
    // Update elements for first frame
    if (frames.length > 0) {
        state.elements = JSON.parse(JSON.stringify(frames[0].elements));
        renderElements();
        updatePlayerSlots();
    }
    
    // Start playback interval
    state.playbackInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        state.playbackProgress = Math.min(elapsed / duration, 1);
        elements.playbackBar.style.width = `${state.playbackProgress * 100}%`;
        
        // Find the current frame based on progress
        const currentTime = (elapsed / 1000) % state.currentSequence.duration;
        
        let currentFrame = null;
        for (let i = frames.length - 1; i >= 0; i--) {
            if (frames[i].time <= currentTime) {
                currentFrame = frames[i];
                break;
            }
        }
        
        // If we have a current frame, update elements
        if (currentFrame) {
            state.elements = JSON.parse(JSON.stringify(currentFrame.elements));
            renderElements();
            updatePlayerSlots();
        }
        
        // Check if playback is complete
        if (elapsed >= duration) {
            stopSequences();
        }
    }, 50); // Update every 50ms
}

// Stop sequences
function stopSequences() {
    state.isPlaying = false;
    
    // Hide playback indicator
    elements.playbackIndicator.classList.remove('active');
    
    // Clear interval
    if (state.playbackInterval) {
        clearInterval(state.playbackInterval);
        state.playbackInterval = null;
    }
    
    // Restore original elements
    if (state.currentSequence && state.currentSequence.frames.length > 0) {
        state.elements = JSON.parse(JSON.stringify(
            state.currentSequence.frames[state.currentSequence.frames.length - 1].elements
        ));
        renderElements();
        updatePlayerSlots();
    }
    
    renderSequencePaths();
}

// Show modal
function showModal(modalName) {
    const modal = modalName === 'save' ? elements.saveModal : elements.sequenceModal;
    modal.classList.add('active');
}

// Hide modal
function hideModal(modalName) {
    const modal = modalName === 'save' ? elements.saveModal : elements.sequenceModal;
    modal.classList.remove('active');
}

// Handle save strategy
function handleSaveStrategy(e) {
    e.preventDefault();
    
    const name = modalElements.strategyName.value.trim();
    
    if (!name) {
        showToast('Veuillez entrer un nom pour la stratégie', 'error');
        return;
    }
    
    const strategy = {
        id: Date.now().toString(),
        name,
        map: otherButtons.mapSelect.value,
        elements: JSON.parse(JSON.stringify(state.elements)),
        sequences: JSON.parse(JSON.stringify(state.sequences)),
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

// Load strategies from localStorage
function loadStrategies() {
    try {
        const saved = localStorage.getItem('eva-strategy-tool');
        if (saved) {
            const data = JSON.parse(saved);
            state.strategies = data.strategies || [];
            state.elements = data.elements || [];
            state.sequences = data.sequences || [];
            state.playerCounters = data.playerCounters || { alpha: 0, bravo: 0 };
        }
    } catch (e) {
        console.error('Error loading strategies:', e);
    }
    
    renderStrategyList();
    renderElements();
    renderSequences();
    renderSequencePaths();
    updatePlayerSlots();
}

// Save strategies to localStorage
function saveStrategies() {
    try {
        const data = {
            strategies: state.strategies,
            elements: state.elements,
            sequences: state.sequences,
            playerCounters: state.playerCounters
        };
        localStorage.setItem('eva-strategy-tool', JSON.stringify(data));
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
            <span class="icon">🎯</span>
            <span class="name">${strategy.name}</span>
            <span class="meta">${strategy.map.replace('_', ' ')}</span>
        `;
        elements.strategyList.appendChild(div);
    });
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
    
    // Load sequences
    state.sequences = JSON.parse(JSON.stringify(strategy.sequences));
    
    // Load player counters
    state.playerCounters = strategy.playerCounters || { alpha: 0, bravo: 0 };
    
    // Load notes
    elements.strategyNotes.value = strategy.notes || '';
    
    // Reset selection
    state.selectedElement = null;
    state.currentSequence = state.sequences.length > 0 ? state.sequences[0] : null;
    
    // Render
    renderElements();
    renderSequences();
    renderSequencePaths();
    updatePropertiesPanel();
    updateUI();
    updatePlayerSlots();
    
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

// Export to GIF (simplified - would need a library for real GIF export)
function exportToGIF() {
    if (!state.currentSequence) {
        showToast('Aucune séquence sélectionnée', 'error');
        return;
    }
    
    // This is a placeholder - real GIF export would require a library like gif.js
    showToast('Export GIF nécessiterait une bibliothèque. Utilise l\'export manuel pour l\'instant.', 'info');
    
    // Alternative: Save as JSON with sequence data
    const data = {
        name: `eva-sequence-${Date.now()}`,
        date: new Date().toISOString(),
        map: otherButtons.mapSelect.value,
        sequence: state.currentSequence,
        elements: state.elements
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eva-sequence-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Get current strategy
function getCurrentStrategy() {
    return {
        name: 'Stratégie actuelle',
        map: otherButtons.mapSelect.value,
        elements: state.elements,
        sequences: state.sequences,
        notes: elements.strategyNotes.value
    };
}

// Handle keyboard shortcuts
function handleKeyDown(e) {
    // Delete selected element
    if (e.key === 'Delete' && state.selectedElement) {
        const index = state.elements.indexOf(state.selectedElement);
        if (index > -1) {
            // Decrement player counter if it's a player
            if (state.selectedElement.type === 'player') {
                state.playerCounters[state.selectedElement.team]--;
            }
            
            state.elements.splice(index, 1);
            state.selectedElement = null;
            saveState();
            renderElements();
            renderSequencePaths();
            updatePropertiesPanel();
            updateUI();
            updatePlayerSlots();
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
    
    // Space to add frame to sequence
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        addFrameToSequence();
    }
    
    // Escape to deselect
    if (e.key === 'Escape') {
        state.selectedElement = null;
        updatePropertiesPanel();
        updateUI();
    }
    
    // Play/pause sequences with P key
    if (e.code === 'KeyP' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (state.isPlaying) {
            stopSequences();
        } else {
            playSequences();
        }
    }
}

// Update UI based on state
function updateUI() {
    // Update undo/redo buttons
    otherButtons.undo.disabled = state.historyIndex <= 0;
    otherButtons.redo.disabled = state.historyIndex >= state.history.length - 1;
    
    // Update team colors in toolbar
    const teamColor = state.currentTeam === 'alpha' ? 'var(--alpha-color)' : 'var(--bravo-color)';
    Object.values(toolButtons).forEach(btn => {
        if (btn.id === 'player-tool') {
            btn.style.backgroundColor = teamColor;
        }
    });
    
    // Update play button text based on state
    if (state.isPlaying) {
        otherButtons.playSequences.textContent = '⏸ Pause';
    } else {
        otherButtons.playSequences.textContent = '▶ Lecture';
    }
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
window.selectSequence = selectSequence;
window.editSequence = editSequence;
window.deleteSequence = deleteSequence;
