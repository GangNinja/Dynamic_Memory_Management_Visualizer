// Navigation Logic
function switchSection(sectionId) {
    document.querySelectorAll('.simulator-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(`nav-${sectionId}`).classList.add('active');
}

// --- About Section Tabs ---
function switchAboutTab(tabId) {
    document.querySelectorAll('.about-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`about-${tabId}`).classList.remove('hidden');
    
    document.querySelectorAll('.about-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`tab-${tabId}`).classList.add('active');
}

// --- Demo Functions ---
async function showDemoExplanation(text, duration = 3000) {
    const overlay = document.getElementById('demo-explanation');
    const textEl = document.getElementById('demo-text');
    textEl.innerText = text;
    overlay.classList.remove('hidden');
    overlay.classList.add('animate-bounce-in'); // Optional: add a simple animation class if defined
    await new Promise(r => setTimeout(r, duration));
    overlay.classList.add('hidden');
}

async function runAllocationDemo() {
    const algo = document.getElementById('alloc-algo').value;
    resetAllocation();
    await showDemoExplanation(`Starting ${algo} Demo. Resetting memory...`, 2000);
    
    // Setup a specific fragmented state to highlight differences
    // Total 1024: [Sys: 100] [Hole1: 150] [Drv: 100] [Hole2: 350] [Cache: 100] [Hole3: 120] [Data: 104]
    memoryBlocks = [
        { id: 'System', size: 100, start: 0, end: 100, status: 'allocated' },
        { id: null, size: 150, start: 100, end: 250, status: 'free' },
        { id: 'Drivers', size: 100, start: 250, end: 350, status: 'allocated' },
        { id: null, size: 350, start: 350, end: 700, status: 'free' },
        { id: 'Cache', size: 100, start: 700, end: 800, status: 'allocated' },
        { id: null, size: 120, start: 800, end: 920, status: 'free' },
        { id: 'Data', size: 104, start: 920, end: 1024, status: 'allocated' }
    ];
    updateAllocationUI();
    await showDemoExplanation("Memory fragmented. We have holes of 150KB, 350KB, and 120KB.", 3500);

    const requestSize = 115;
    document.getElementById('proc-id').value = "Demo_P";
    document.getElementById('proc-size').value = requestSize;
    
    if (algo === 'First Fit') {
        await showDemoExplanation(`First Fit: Searching from the start. First hole > ${requestSize}KB is the 150KB hole.`, 4000);
        allocateProcess();
    } else if (algo === 'Best Fit') {
        await showDemoExplanation(`Best Fit: Searching for the SMALLEST hole > ${requestSize}KB. That's the 120KB hole.`, 4000);
        allocateProcess();
    } else if (algo === 'Worst Fit') {
        await showDemoExplanation(`Worst Fit: Searching for the LARGEST hole. That's the 350KB hole.`, 4000);
        allocateProcess();
    } else if (algo === 'Next Fit') {
        await showDemoExplanation("Next Fit: First, let's allocate something to set the 'last position' pointer...", 3000);
        // Allocate something in the first hole to move the pointer
        document.getElementById('proc-id').value = "Setup_P";
        document.getElementById('proc-size').value = 50;
        allocateProcess();
        await new Promise(r => setTimeout(r, 1000));
        
        await showDemoExplanation(`Now, Next Fit starts searching AFTER Setup_P. It will skip the rest of the 150KB hole and look at the 350KB hole.`, 5000);
        document.getElementById('proc-id').value = "Demo_P";
        document.getElementById('proc-size').value = requestSize;
        allocateProcess();
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Final Step: Demonstrate External Fragmentation
    await showDemoExplanation("Now, let's see EXTERNAL FRAGMENTATION. Requesting 400KB...", 4000);
    document.getElementById('proc-id').value = "Frag_P";
    document.getElementById('proc-size').value = 400;
    allocateProcess();
    
    await new Promise(r => setTimeout(r, 2000));
    await showDemoExplanation("External fragmentation happens when total free memory is enough, but not contiguous.", 4000);
    
    await showDemoExplanation("To fix this, we use COMPACTION to shuffle blocks and combine free space...", 4000);
    compactMemory();
    await new Promise(r => setTimeout(r, 1500));
    
    await showDemoExplanation("Now that memory is contiguous, we can finally allocate the 400KB process!", 4000);
    allocateProcess();
    
    await new Promise(r => setTimeout(r, 1000));
    await showDemoExplanation("Demo complete! You've seen allocation strategies, fragmentation, and compaction.", 5000);
}

async function runPagingDemo() {
    const algo = document.getElementById('paging-algo').value;
    resetPaging();
    await showDemoExplanation(`Starting ${algo} Paging Demo with 3 Physical Frames...`, 2500);
    
    document.getElementById('paging-frames-input').value = 3;
    resetPaging();
    
    let sequence = (algo === 'FIFO') ? [1, 2, 3, 4, 1] : [1, 2, 3, 1, 4];
    
    for (const page of sequence) {
        let explanation = `Accessing Page ${page}. `;
        const isHit = pagingState.frames.includes(page);
        
        if (isHit) {
            explanation += "PAGE HIT! It's already in memory.";
        } else {
            explanation += "PAGE FAULT! ";
            if (pagingState.frames.length >= 3) {
                explanation += (algo === 'FIFO') 
                    ? `Replacing the OLDEST page (FIFO).` 
                    : `Replacing the LEAST RECENTLY USED page.`;
            } else {
                explanation += "Loading into empty frame.";
            }
        }
        
        await showDemoExplanation(explanation, 3000);
        accessPage(page, false);
        await new Promise(r => setTimeout(r, 500));
    }
    
    await showDemoExplanation("Paging demo complete.", 2000);
}

async function runStackHeapDemo() {
    stack = [{ id: 1, label: 'main()', size: 64 }];
    heap = [];
    updateStackHeapUI();
    await showDemoExplanation("Stack vs Heap Demo: main() function starts on the Stack.", 3000);
    
    await showDemoExplanation("Calling render()... A new frame is pushed to the Stack.", 3000);
    document.getElementById('stack-input').value = "render()";
    pushStack();
    await new Promise(r => setTimeout(r, 1000));
    
    await showDemoExplanation("render() needs to store a large image. Allocating on the Heap...", 3000);
    document.getElementById('heap-input').value = "Image_Data";
    mallocHeap();
    await new Promise(r => setTimeout(r, 1000));
    
    await showDemoExplanation("render() finishes. Its frame is popped from the Stack.", 3000);
    popStack();
    await new Promise(r => setTimeout(r, 1000));
    
    await showDemoExplanation("Notice: The Heap data stays until manually freed or GC'd!", 4000);
}

async function runGCDemo() {
    const strategy = document.getElementById('gc-strategy').value;
    await showDemoExplanation(`Starting ${strategy} Garbage Collection Demo...`, 2500);
    
    gcObjects = [
        { id: 1, label: 'Root', x: 100, y: 100, isRoot: true, isReachable: true, marked: false, refs: [2], refCount: 0, selected: false },
        { id: 2, label: 'Obj_A', x: 300, y: 150, isRoot: false, isReachable: true, marked: false, refs: [3], refCount: 1, selected: false },
        { id: 3, label: 'Obj_B', x: 500, y: 100, isRoot: false, isReachable: true, marked: false, refs: [], refCount: 1, selected: false }
    ];
    recalculateReachability();
    updateGCUI();
    
    await showDemoExplanation("Initial state: Root -> Obj_A -> Obj_B. All are reachable.", 3500);
    
    await showDemoExplanation("The program removes the reference from Root to Obj_A.", 3500);
    gcObjects[0].refs = [];
    recalculateReachability();
    updateGCUI();
    await new Promise(r => setTimeout(r, 1000));
    
    if (strategy === 'Mark and Sweep') {
        await showDemoExplanation("Mark & Sweep: Running... It will find Obj_A and Obj_B are unreachable.", 4000);
        runGC();
    } else {
        await showDemoExplanation("Reference Counting: Obj_A's count dropped to 0. It is reclaimed immediately.", 4000);
        runGC();
    }
}

// --- Allocation Simulator ---
let totalMemory = 1024;
let memoryBlocks = [{ id: null, size: 1024, start: 0, end: 1024, status: 'free' }];
let lastAllocIndex = 0; // For Next Fit
let processQueue = [];
let allocHistory = [];
let redoHistory = [];
let autoAllocate = false;
let autoInterval = null;

const allocationColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
    '#a855f7', '#14b8a6', '#f43f5e', '#84cc16'
];

function getProcessColor(id) {
    if (!id) return '#475569'; // Default slate color for free blocks
    // Simple hash to get consistent color for same ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % allocationColors.length;
    return allocationColors[index];
}

function updateAllocationUI() {
    const memoryMap = document.getElementById('memory-map');
    const activeProcesses = document.getElementById('active-processes');
    const queueList = document.getElementById('process-queue');
    
    // Memory Map
    memoryMap.innerHTML = '';
    memoryBlocks.forEach((block, index) => {
        const width = (block.size / totalMemory) * 100;
        const blockEl = document.createElement('div');
        blockEl.className = `memory-block h-full relative border-r border-slate-900/20 flex items-center justify-center text-[10px] font-bold overflow-hidden has-tooltip cursor-pointer`;
        blockEl.style.width = `${width}%`;
        
        if (block.status === 'allocated') {
            const color = getProcessColor(block.id);
            blockEl.style.backgroundColor = color;
            blockEl.style.color = '#000'; // Dark text for better contrast on colors
            blockEl.innerHTML = `<span>${block.id}</span>`;
        } else if (block.status === 'fragmented') {
            blockEl.classList.add('bg-red-500', 'text-red-950');
            blockEl.innerHTML = `<span>FRAG</span>`;
        } else {
            blockEl.classList.add('bg-slate-700', 'text-slate-500');
            blockEl.innerHTML = `<span>${block.size}K</span>`;
        }
        
        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        const color = block.id ? getProcessColor(block.id) : '#3b82f6';
        tooltip.innerHTML = `
            <p class="font-bold mb-1" style="color: ${color}">${block.status.toUpperCase()}</p>
            <p>Size: ${block.size} KB</p>
            <p>Range: ${block.start} - ${block.end}</p>
            ${block.id ? `<p>Process: ${block.id}</p>` : ''}
        `;
        blockEl.appendChild(tooltip);
        
        blockEl.onclick = () => {
            if (block.status === 'allocated') deallocateProcess(block.id);
        };
        
        memoryMap.appendChild(blockEl);
    });
    
    // Active Processes
    activeProcesses.innerHTML = '';
    const uniqueProcesses = [...new Set(memoryBlocks.filter(b => b.status === 'allocated').map(b => b.id))];
    uniqueProcesses.forEach(id => {
        const block = memoryBlocks.find(b => b.id === id);
        const color = getProcessColor(id);
        const card = document.createElement('div');
        card.className = 'bg-slate-800 border border-slate-700 p-3 rounded-xl flex justify-between items-center';
        card.innerHTML = `
            <div>
                <p class="text-xs font-bold" style="color: ${color}">${id}</p>
                <p class="text-[10px] text-slate-500">${block.size} KB</p>
            </div>
            <button onclick="deallocateProcess('${id}')" class="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors">
                <i data-lucide="x" size="14"></i>
            </button>
        `;
        activeProcesses.appendChild(card);
    });
    
    // Queue
    queueList.innerHTML = '';
    if (processQueue.length === 0) {
        queueList.innerHTML = '<p class="text-xs text-slate-600 italic text-center py-4">Queue is empty</p>';
    } else {
        processQueue.forEach((p, i) => {
            const item = document.createElement('div');
            item.className = 'bg-slate-900 border border-slate-800 p-2 rounded-lg flex justify-between items-center text-xs';
            item.innerHTML = `
                <span class="font-bold text-purple-400">${p.id} (${p.size}K)</span>
                <button onclick="removeFromQueue(${i})" class="text-slate-600 hover:text-red-400"><i data-lucide="trash-2" size="12"></i></button>
            `;
            queueList.appendChild(item);
        });
    }
    
    // Stats
    const allocatedSize = memoryBlocks.filter(b => b.status === 'allocated').reduce((acc, b) => acc + b.size, 0);
    const freeBlocks = memoryBlocks.filter(b => b.status === 'free');
    const freeSize = freeBlocks.reduce((acc, b) => acc + b.size, 0);
    
    // External Fragmentation: Total free memory that is not in the largest contiguous block
    const maxFreeBlock = freeBlocks.length > 0 ? Math.max(...freeBlocks.map(b => b.size)) : 0;
    const fragSize = freeBlocks.length > 1 ? (freeSize - maxFreeBlock) : 0;
    
    document.getElementById('stat-utilization').innerText = `${Math.round((allocatedSize / totalMemory) * 100)}%`;
    document.getElementById('stat-free').innerText = `${freeSize} KB`;
    document.getElementById('stat-fragmentation').innerText = `${fragSize} KB`;
    document.getElementById('stat-blocks').innerText = memoryBlocks.length;
    
    lucide.createIcons();
}

function saveState() {
    allocHistory.push(JSON.parse(JSON.stringify(memoryBlocks)));
    if (allocHistory.length > 20) allocHistory.shift();
    redoHistory = [];
}

function undoAllocation() {
    if (allocHistory.length > 0) {
        redoHistory.push(JSON.parse(JSON.stringify(memoryBlocks)));
        memoryBlocks = allocHistory.pop();
        updateAllocationUI();
    }
}

function redoAllocation() {
    if (redoHistory.length > 0) {
        allocHistory.push(JSON.parse(JSON.stringify(memoryBlocks)));
        memoryBlocks = redoHistory.pop();
        updateAllocationUI();
    }
}

function allocateProcess() {
    const id = document.getElementById('proc-id').value;
    const size = parseInt(document.getElementById('proc-size').value);
    const algo = document.getElementById('alloc-algo').value;
    
    if (!id || isNaN(size) || size <= 0) return;
    if (memoryBlocks.some(b => b.id === id)) {
        alert("Process ID already exists");
        return;
    }
    
    saveState();
    
    let targetIndex = -1;
    const freeBlocks = memoryBlocks.map((b, i) => ({ ...b, index: i })).filter(b => b.status === 'free' && b.size >= size);
    
    if (algo === 'First Fit') {
        targetIndex = freeBlocks.length > 0 ? freeBlocks[0].index : -1;
    } else if (algo === 'Best Fit') {
        freeBlocks.sort((a, b) => a.size - b.size);
        targetIndex = freeBlocks.length > 0 ? freeBlocks[0].index : -1;
    } else if (algo === 'Worst Fit') {
        freeBlocks.sort((a, b) => b.size - a.size);
        targetIndex = freeBlocks.length > 0 ? freeBlocks[0].index : -1;
    } else if (algo === 'Next Fit') {
        // Find first suitable block starting from lastAllocIndex
        let found = false;
        for (let i = 0; i < memoryBlocks.length; i++) {
            let idx = (lastAllocIndex + i) % memoryBlocks.length;
            if (memoryBlocks[idx].status === 'free' && memoryBlocks[idx].size >= size) {
                targetIndex = idx;
                found = true;
                break;
            }
        }
    }
    
    if (targetIndex !== -1) {
        lastAllocIndex = targetIndex;
        const block = memoryBlocks[targetIndex];
        const remainingSize = block.size - size;
        
        if (remainingSize > 0) {
            const newBlock = { id, size, start: block.start, end: block.start + size, status: 'allocated' };
            const freeBlock = { id: null, size: remainingSize, start: block.start + size, end: block.end, status: 'free' };
            memoryBlocks.splice(targetIndex, 1, newBlock, freeBlock);
        } else {
            block.id = id;
            block.status = 'allocated';
        }

        // Auto-increment Process ID
        const match = id.match(/(\d+)$/);
        if (match) {
            const num = parseInt(match[1]);
            document.getElementById('proc-id').value = id.replace(/\d+$/, num + 1);
        } else {
            document.getElementById('proc-id').value = id + "1";
        }

        updateAllocationUI();
    } else {
        const totalFree = memoryBlocks.filter(b => b.status === 'free').reduce((acc, b) => acc + b.size, 0);
        if (totalFree >= size) {
            showDemoExplanation(`EXTERNAL FRAGMENTATION! Total free memory (${totalFree}KB) is enough, but no single block can fit ${size}KB. Try Compaction!`, 5000);
            
            // Temporarily highlight free blocks as fragmented
            const originalBlocks = JSON.parse(JSON.stringify(memoryBlocks));
            memoryBlocks.forEach(b => {
                if (b.status === 'free') b.status = 'fragmented';
            });
            updateAllocationUI();
            setTimeout(() => {
                memoryBlocks = originalBlocks;
                updateAllocationUI();
            }, 3000);
        } else {
            alert("Insufficient total memory for this process!");
        }
    }
}

function deallocateProcess(id) {
    saveState();
    memoryBlocks = memoryBlocks.map(block => {
        if (block.id === id) {
            return { ...block, id: null, status: 'free' };
        }
        return block;
    });
    
    // Merge adjacent free blocks
    for (let i = 0; i < memoryBlocks.length - 1; i++) {
        if (memoryBlocks[i].status === 'free' && memoryBlocks[i+1].status === 'free') {
            memoryBlocks[i].size += memoryBlocks[i+1].size;
            memoryBlocks[i].end = memoryBlocks[i+1].end;
            memoryBlocks.splice(i + 1, 1);
            i--;
        }
    }
    updateAllocationUI();
}

function compactMemory() {
    saveState();
    const allocated = memoryBlocks.filter(b => b.status === 'allocated');
    const totalAllocated = allocated.reduce((acc, b) => acc + b.size, 0);
    
    let currentStart = 0;
    const newBlocks = allocated.map(b => {
        const nb = { ...b, start: currentStart, end: currentStart + b.size };
        currentStart += b.size;
        return nb;
    });
    
    if (currentStart < totalMemory) {
        newBlocks.push({ id: null, size: totalMemory - currentStart, start: currentStart, end: totalMemory, status: 'free' });
    }
    
    memoryBlocks = newBlocks;
    updateAllocationUI();
}

function resetAllocation() {
    saveState();
    totalMemory = parseInt(document.getElementById('total-memory-input').value) || 1024;
    memoryBlocks = [{ id: null, size: totalMemory, start: 0, end: totalMemory, status: 'free' }];
    processQueue = [];
    document.getElementById('proc-id').value = "P1";
    updateAllocationUI();
}

function addToQueue() {
    const id = document.getElementById('proc-id').value;
    const size = parseInt(document.getElementById('proc-size').value);
    if (id && !isNaN(size)) {
        processQueue.push({ id, size });
        
        // Auto-increment Process ID
        const match = id.match(/(\d+)$/);
        if (match) {
            const num = parseInt(match[1]);
            document.getElementById('proc-id').value = id.replace(/\d+$/, num + 1);
        } else {
            document.getElementById('proc-id').value = id + "1";
        }

        updateAllocationUI();
    }
}

function removeFromQueue(index) {
    processQueue.splice(index, 1);
    updateAllocationUI();
}

function stepQueue() {
    if (processQueue.length > 0) {
        const p = processQueue[0];
        document.getElementById('proc-id').value = p.id;
        document.getElementById('proc-size').value = p.size;
        allocateProcess();
        processQueue.shift();
        updateAllocationUI();
    }
}

function toggleAutoAllocate() {
    autoAllocate = !autoAllocate;
    const btn = document.getElementById('btn-auto');
    if (autoAllocate) {
        btn.classList.add('bg-blue-600', 'text-white');
        autoInterval = setInterval(() => {
            if (processQueue.length > 0) stepQueue();
            else toggleAutoAllocate();
        }, 1000);
    } else {
        btn.classList.remove('bg-blue-600', 'text-white');
        clearInterval(autoInterval);
    }
}

// --- Paging Simulator ---
let pagingState = {
    physicalFrames: 4,
    logicalPages: 8,
    pageTable: Object.fromEntries(Array.from({ length: 8 }, (_, i) => [i, { frame: null, dirty: false }])),
    frames: new Array(4).fill(null),
    history: [],
    algo: 'FIFO',
    fifoQueue: [],
    lruStack: [],
    hits: 0,
    faults: 0,
    lastAccessed: null,
    isFault: false
};

const pageColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

function updatePagingUI() {
    const logicalGrid = document.getElementById('logical-pages-grid');
    const logicalList = document.getElementById('logical-memory-list');
    const tableBody = document.getElementById('page-table-body');
    const physicalList = document.getElementById('physical-memory-list');
    const historyList = document.getElementById('paging-history');
    
    document.getElementById('paging-hits').innerText = pagingState.hits;
    document.getElementById('paging-faults').innerText = pagingState.faults;
    document.getElementById('paging-frames-count').innerText = pagingState.physicalFrames;
    const total = pagingState.hits + pagingState.faults;
    document.getElementById('paging-ratio').innerText = total > 0 ? `${Math.round((pagingState.hits / total) * 100)}%` : '0%';
    
    // Logical Grid
    logicalGrid.innerHTML = '';
    for (let i = 0; i < pagingState.logicalPages; i++) {
        const entry = pagingState.pageTable[i];
        const color = pageColors[i % pageColors.length];
        const btn = document.createElement('div');
        btn.className = 'group relative';
        btn.innerHTML = `
            <button onclick="accessPage(${i}, false)" class="w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${pagingState.lastAccessed === i ? (pagingState.isFault ? "bg-red-500/20 border-red-500 text-red-400" : "bg-emerald-500/20 border-emerald-500 text-emerald-400") : "bg-slate-900 border-slate-700 hover:border-blue-500 text-slate-400"}" style="${pagingState.lastAccessed !== i ? `border-color: ${color}44; color: ${color}` : ''}">
                <span class="text-xs opacity-50">Page</span>
                <span class="text-lg font-bold">${i}</span>
                <div class="absolute top-1 right-1 flex gap-1">
                    <button onclick="event.stopPropagation(); accessPage(${i}, true)" class="p-1 hover:bg-amber-500/20 rounded text-amber-500 transition-colors" title="Write to Page">
                        <i data-lucide="edit-3" size="10"></i>
                    </button>
                </div>
            </button>
            <div class="tooltip">
                <p class="font-bold mb-1" style="color: ${color}">Logical Page ${i}</p>
                <p>Status: ${entry.frame !== null ? 'In RAM' : 'On Disk'}</p>
                <p>Frame: ${entry.frame !== null ? entry.frame : 'N/A'}</p>
                <p>Dirty: ${entry.dirty ? 'Yes' : 'No'}</p>
            </div>
        `;
        logicalGrid.appendChild(btn);
    }
    
    // Logical List
    logicalList.innerHTML = '';
    for (let i = 0; i < pagingState.logicalPages; i++) {
        const entry = pagingState.pageTable[i];
        const color = pageColors[i % pageColors.length];
        const item = document.createElement('div');
        item.className = `p-4 border-b border-slate-800 flex justify-between items-center ${pagingState.lastAccessed === i ? "bg-blue-500/10" : ""}`;
        item.innerHTML = `
            <span class="font-mono font-bold" style="color: ${color}">Page ${i}</span>
            <div class="flex items-center gap-2">
                ${entry.dirty ? '<span class="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase">Dirty</span>' : ''}
                ${entry.frame !== null ? `<span class="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">In Frame ${entry.frame}</span>` : '<span class="text-xs bg-slate-800 text-slate-500 px-2 py-1 rounded">Not in RAM</span>'}
            </div>
        `;
        logicalList.appendChild(item);
    }
    
    // Table Body
    tableBody.innerHTML = '';
    for (let i = 0; i < pagingState.logicalPages; i++) {
        const entry = pagingState.pageTable[i];
        const color = pageColors[i % pageColors.length];
        const row = document.createElement('tr');
        row.className = `border-b border-slate-800/50 group relative ${pagingState.lastAccessed === i ? "bg-blue-500/5" : ""}`;
        row.innerHTML = `
            <td class="py-2 font-bold" style="color: ${color}">P${i}</td>
            <td class="py-2 text-center"><div class="w-2 h-2 rounded-full mx-auto ${entry.frame !== null ? "bg-emerald-500" : "bg-slate-700"}"></div></td>
            <td class="py-2 text-center"><div class="w-2 h-2 rounded-full mx-auto ${entry.dirty ? "bg-amber-500" : "bg-slate-700"}"></div></td>
            <td class="py-2 text-right font-mono" style="color: ${color}">${entry.frame !== null ? `F${entry.frame}` : '-'}</td>
            <div class="tooltip" style="left: 100%; margin-left: 8px; top: 50%; transform: translateY(-50%);">
                <p class="font-bold mb-1" style="color: ${color}">PTE ${i}</p>
                <p>Valid Bit: ${entry.frame !== null ? '1' : '0'}</p>
                <p>Dirty Bit: ${entry.dirty ? '1' : '0'}</p>
                <p>Frame Number: ${entry.frame !== null ? entry.frame : 'None'}</p>
            </div>
        `;
        tableBody.appendChild(row);
    }
    
    // Physical List
    physicalList.innerHTML = '';
    pagingState.frames.forEach((page, i) => {
        const item = document.createElement('div');
        const color = page !== null ? pageColors[page % pageColors.length] : null;
        item.className = `p-4 border-b border-slate-800 flex justify-between items-center h-[60px] ${page !== null ? "bg-emerald-500/5" : "bg-slate-900"}`;
        item.innerHTML = `
            <span class="font-mono text-emerald-400">Frame ${i}</span>
            ${page !== null ? `<div class="flex items-center gap-2"><span class="text-sm font-bold" style="color: ${color}">Page ${page}</span><div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div></div>` : '<span class="text-xs text-slate-600 italic">Empty</span>'}
        `;
        physicalList.appendChild(item);
    });
    
    // History
    historyList.innerHTML = '';
    if (pagingState.history.length === 0) {
        historyList.innerHTML = '<p class="text-slate-600 italic text-center text-xs">No history yet</p>';
    } else {
        pagingState.history.forEach(h => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between text-xs';
            item.innerHTML = `
                <span class="text-slate-400">Page ${h.page} → Frame ${h.frame}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${h.type === 'hit' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}">${h.type}</span>
            `;
            historyList.appendChild(item);
        });
    }
    
    document.getElementById('page-fault-alert').classList.toggle('hidden', !pagingState.isFault);
    lucide.createIcons();
}

function accessPage(pageIndex, isWrite = false) {
    pagingState.lastAccessed = pageIndex;
    pagingState.isFault = false;
    
    if (pagingState.pageTable[pageIndex].frame !== null) {
        pagingState.hits++;
        const frameIndex = pagingState.pageTable[pageIndex].frame;
        pagingState.history.unshift({ page: pageIndex, frame: frameIndex, type: 'hit' });
        if (pagingState.algo === 'LRU') {
            pagingState.lruStack = [pageIndex, ...pagingState.lruStack.filter(p => p !== pageIndex)];
        }
        if (isWrite) pagingState.pageTable[pageIndex].dirty = true;
    } else {
        pagingState.faults++;
        pagingState.isFault = true;
        const emptyFrameIndex = pagingState.frames.findIndex(f => f === null);
        
        if (emptyFrameIndex !== -1) {
            pagingState.pageTable[pageIndex] = { frame: emptyFrameIndex, dirty: isWrite };
            pagingState.frames[emptyFrameIndex] = pageIndex;
            pagingState.fifoQueue.push(pageIndex);
            pagingState.lruStack.unshift(pageIndex);
            pagingState.history.unshift({ page: pageIndex, frame: emptyFrameIndex, type: 'fault' });
        } else {
            let pageToReplace = -1;
            if (pagingState.algo === 'FIFO') {
                pageToReplace = pagingState.fifoQueue.shift();
                pagingState.fifoQueue.push(pageIndex);
            } else {
                pageToReplace = pagingState.lruStack.pop();
                pagingState.lruStack.unshift(pageIndex);
            }
            
            const frameIndex = pagingState.pageTable[pageToReplace].frame;
            pagingState.pageTable[pageToReplace] = { frame: null, dirty: false };
            pagingState.pageTable[pageIndex] = { frame: frameIndex, dirty: isWrite };
            pagingState.frames[frameIndex] = pageIndex;
            pagingState.history.unshift({ page: pageIndex, frame: frameIndex, type: 'fault' });
        }
    }
    pagingState.history = pagingState.history.slice(0, 10);
    updatePagingUI();
}

function resetPaging() {
    const framesCount = parseInt(document.getElementById('paging-frames-input').value) || 4;
    pagingState = {
        physicalFrames: framesCount,
        logicalPages: 8,
        pageTable: Object.fromEntries(Array.from({ length: 8 }, (_, i) => [i, { frame: null, dirty: false }])),
        frames: new Array(framesCount).fill(null),
        history: [],
        algo: document.getElementById('paging-algo').value,
        fifoQueue: [],
        lruStack: [],
        hits: 0,
        faults: 0,
        lastAccessed: null,
        isFault: false
    };
    updatePagingUI();
}

function switchPagingMode(mode) {
    document.querySelectorAll('.paging-mode-btn').forEach(btn => btn.classList.remove('bg-blue-600', 'text-white'));
    document.querySelectorAll('.paging-mode-btn').forEach(btn => btn.classList.add('text-slate-400'));
    document.getElementById(`paging-btn-${mode}`).classList.add('bg-blue-600', 'text-white');
    document.getElementById(`paging-btn-${mode}`).classList.remove('text-slate-400');
    
    document.querySelectorAll('.paging-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(`paging-${mode}`).classList.remove('hidden');
}

function runBatchSimulation() {
    const refString = document.getElementById('batch-ref-string').value;
    const algo = document.getElementById('batch-algo').value;
    const framesCount = parseInt(document.getElementById('batch-frames-input').value) || 4;
    
    const pages = refString.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    let currentFrames = new Array(framesCount).fill(null);
    let currentFifo = [];
    let currentLru = [];
    let hits = 0;
    let faults = 0;
    const steps = [];
    
    pages.forEach(page => {
        const frameIdx = currentFrames.indexOf(page);
        let isFault = false;
        if (frameIdx !== -1) {
            hits++;
            if (algo === 'LRU') {
                currentLru = [page, ...currentLru.filter(p => p !== page)];
            }
        } else {
            faults++;
            isFault = true;
            const emptyIdx = currentFrames.indexOf(null);
            if (emptyIdx !== -1) {
                currentFrames[emptyIdx] = page;
                currentFifo.push(page);
                currentLru.unshift(page);
            } else {
                let toReplace = -1;
                if (algo === 'FIFO') {
                    toReplace = currentFifo.shift();
                    currentFifo.push(page);
                } else {
                    toReplace = currentLru.pop();
                    currentLru.unshift(page);
                }
                const replaceIdx = currentFrames.indexOf(toReplace);
                currentFrames[replaceIdx] = page;
            }
        }
        steps.push({ page, frames: [...currentFrames], isFault });
    });
    
    const resultsEl = document.getElementById('batch-results');
    resultsEl.classList.remove('hidden');
    resultsEl.innerHTML = `
        <div class="p-6 bg-slate-900 rounded-2xl border border-slate-700">
            <h4 class="font-bold text-white mb-4">Final Paging State</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="space-y-2">
                    <p class="text-xs text-slate-500 uppercase font-bold">Physical Frames</p>
                    <div class="space-y-2">
                        ${currentFrames.map((p, i) => `
                            <div class="bg-slate-800 p-3 rounded-lg flex justify-between items-center border border-slate-700">
                                <span class="text-xs text-slate-500">Frame ${i}</span>
                                <span class="font-bold text-emerald-400">${p !== null ? `Page ${p}` : 'Empty'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="md:col-span-2 grid grid-cols-2 gap-4">
                    <div class="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center">
                        <p class="text-xs text-emerald-500 font-bold uppercase">Total Hits</p>
                        <p class="text-3xl font-bold text-emerald-400">${hits}</p>
                    </div>
                    <div class="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
                        <p class="text-xs text-red-500 font-bold uppercase">Total Faults</p>
                        <p class="text-3xl font-bold text-red-400">${faults}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="p-6 bg-slate-900 rounded-2xl border border-slate-700 overflow-x-auto">
            <h4 class="font-bold text-white mb-4 flex items-center gap-2">
                <i data-lucide="table" size="20" class="text-blue-400"></i> Step-by-Step Solution Table
            </h4>
            <table class="w-full text-sm text-center border-collapse">
                <thead>
                    <tr class="text-slate-500 border-b border-slate-700">
                        <th class="p-3 text-left">Reference</th>
                        ${Array.from({ length: framesCount }).map((_, i) => `<th class="p-3">Frame ${i}</th>`).join('')}
                        <th class="p-3 text-right">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${steps.map(step => `
                        <tr class="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                            <td class="p-3 text-left font-bold text-blue-400">Page ${step.page}</td>
                            ${step.frames.map(f => `<td class="p-3">${f !== null ? `<span class="bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-300">${f}</span>` : '<span class="text-slate-600">-</span>'}</td>`).join('')}
                            <td class="p-3 text-right">
                                <span class="px-2 py-1 rounded text-[10px] font-bold uppercase ${step.isFault ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}">${step.isFault ? 'Fault' : 'Hit'}</span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    lucide.createIcons();
}

// --- Stack vs Heap ---
let stack = [{ id: 1, label: 'main()', size: 64 }];
let heap = [{ id: 1, label: 'config_obj', size: 128, color: 'bg-emerald-500' }];

function updateStackHeapUI() {
    const stackContainer = document.getElementById('stack-container');
    const heapContainer = document.getElementById('heap-container');
    
    stackContainer.innerHTML = '';
    stack.forEach((item, i) => {
        const el = document.createElement('div');
        el.className = 'bg-blue-600/20 border-2 border-blue-500/30 p-4 rounded-xl flex justify-between items-center group hover:border-blue-500 transition-all';
        el.innerHTML = `
            <div>
                <p class="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Frame ${item.id}</p>
                <p class="font-bold text-white">${item.label}</p>
            </div>
            <p class="text-xs text-slate-500 font-mono">${item.size} bytes</p>
        `;
        stackContainer.appendChild(el);
    });
    
    heapContainer.innerHTML = '';
    heap.forEach((item, i) => {
        const el = document.createElement('div');
        el.className = `${item.color} border-2 border-white/10 p-4 rounded-2xl flex flex-col justify-between h-24 group hover:scale-105 transition-all cursor-pointer relative overflow-hidden`;
        el.innerHTML = `
            <div class="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="freeHeap(${item.id})" class="text-white/50 hover:text-white"><i data-lucide="trash-2" size="14"></i></button>
            </div>
            <p class="text-[10px] text-white/60 font-bold uppercase">${item.label}</p>
            <div class="flex justify-between items-end">
                <p class="text-xs font-mono text-white/80">${item.size} bytes</p>
                <i data-lucide="database" size="16" class="text-white/20"></i>
            </div>
        `;
        heapContainer.appendChild(el);
    });
    lucide.createIcons();
}

function pushStack() {
    const label = document.getElementById('stack-input').value || `func_${stack.length + 1}()`;
    stack.push({ id: Date.now(), label, size: Math.floor(Math.random() * 64) + 32 });
    updateStackHeapUI();
}

function popStack() {
    if (stack.length > 1) {
        stack.pop();
        updateStackHeapUI();
    }
}

function mallocHeap() {
    const label = document.getElementById('heap-input').value || `obj_${heap.length + 1}`;
    const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'];
    heap.push({
        id: Date.now(),
        label,
        size: Math.floor(Math.random() * 256) + 64,
        color: colors[Math.floor(Math.random() * colors.length)]
    });
    updateStackHeapUI();
}

function freeHeap(id) {
    heap = heap.filter(h => h.id !== id);
    updateStackHeapUI();
}

// --- Garbage Collection ---
let gcObjects = [
    { id: 1, label: 'RootA', x: 100, y: 100, isRoot: true, isReachable: true, marked: false, refs: [2], refCount: 0, selected: false },
    { id: 2, label: 'ObjB', x: 300, y: 150, isRoot: false, isReachable: true, marked: false, refs: [3], refCount: 1, selected: false },
    { id: 3, label: 'ObjC', x: 500, y: 100, isRoot: false, isReachable: true, marked: false, refs: [], refCount: 1, selected: false },
    { id: 4, label: 'ObjD', x: 400, y: 300, isRoot: false, isReachable: false, marked: false, refs: [], refCount: 0, selected: false }
];
let dragStartId = null;
let mousePos = { x: 0, y: 0 };
let dragStartTime = 0;
let dragStartPos = { x: 0, y: 0 };

function updateGCUI() {
    const container = document.getElementById('gc-objects-container');
    const rootList = document.getElementById('gc-root-list');
    const svg = document.getElementById('gc-svg');
    
    container.innerHTML = '';
    rootList.innerHTML = '';
    svg.innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
            </marker>
        </defs>
    `;
    
    gcObjects.forEach(obj => {
        // Render Object
        const el = document.createElement('div');
        el.className = `absolute w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center cursor-move transition-all group ${obj.selected ? "ring-4 ring-blue-500 ring-offset-2 ring-offset-slate-900" : ""} ${obj.isRoot ? "border-blue-500 bg-blue-500/10" : (obj.marked ? "border-emerald-500 bg-emerald-500/20" : (obj.isReachable ? "border-slate-600 bg-slate-800" : "border-red-500/50 bg-red-500/10"))}`;
        el.style.left = `${obj.x}px`;
        el.style.top = `${obj.y}px`;
        el.innerHTML = `
            <span class="text-[10px] font-bold text-slate-500">${obj.isRoot ? 'ROOT' : 'OBJ'}</span>
            <span class="font-bold text-white">${obj.label}</span>
            <div class="mt-1 flex gap-1">
                <span class="text-[8px] bg-slate-700 px-1 rounded">RC: ${obj.refCount}</span>
            </div>
        `;
        el.onmousedown = (e) => handleGCMouseDown(e, obj.id);
        container.appendChild(el);
        
        if (obj.isRoot) {
            const rootItem = document.createElement('div');
            rootItem.className = 'px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-bold text-blue-400';
            rootItem.innerText = obj.label;
            rootList.appendChild(rootItem);
        }
        
        // Render Refs
        obj.refs.forEach(targetId => {
            const target = gcObjects.find(o => o.id === targetId);
            if (target) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", obj.x + 48);
                line.setAttribute("y1", obj.y + 48);
                line.setAttribute("x2", target.x + 48);
                line.setAttribute("y2", target.y + 48);
                line.setAttribute("stroke", obj.isReachable ? "#3b82f6" : "#ef4444");
                line.setAttribute("stroke-width", "2");
                line.setAttribute("marker-end", "url(#arrowhead)");
                svg.appendChild(line);
            }
        });
    });
    
    if (dragStartId) {
        const startObj = gcObjects.find(o => o.id === dragStartId);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", startObj.x + 48);
        line.setAttribute("y1", startObj.y + 48);
        line.setAttribute("x2", mousePos.x);
        line.setAttribute("y2", mousePos.y);
        line.setAttribute("stroke", "#3b82f6");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-dasharray", "5,5");
        svg.appendChild(line);
    }
    
    lucide.createIcons();
}

function handleGCMouseDown(e, id) {
    dragStartId = id;
    dragStartTime = Date.now();
    const rect = document.getElementById('gc-canvas-container').getBoundingClientRect();
    dragStartPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    mousePos = { ...dragStartPos };
    updateGCUI();
}

function handleGCMouseMove(e) {
    if (dragStartId) {
        const rect = document.getElementById('gc-canvas-container').getBoundingClientRect();
        mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        updateGCUI();
    }
}

function handleGCMouseUp(e) {
    if (dragStartId) {
        const rect = document.getElementById('gc-canvas-container').getBoundingClientRect();
        const endPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        
        const dist = Math.sqrt(Math.pow(endPos.x - dragStartPos.x, 2) + Math.pow(endPos.y - dragStartPos.y, 2));
        const duration = Date.now() - dragStartTime;
        
        if (dist < 5 && duration < 200) {
            // It's a click -> Toggle Selection
            toggleGCSelect(dragStartId);
        } else {
            // It's a drag
            const target = gcObjects.find(obj => 
                obj.id !== dragStartId && 
                endPos.x > obj.x && endPos.x < obj.x + 96 && 
                endPos.y > obj.y && endPos.y < obj.y + 96
            );
            
            if (target) {
                const startObj = gcObjects.find(o => o.id === dragStartId);
                const refIndex = startObj.refs.indexOf(target.id);
                if (refIndex !== -1) {
                    // Unlink
                    startObj.refs.splice(refIndex, 1);
                } else {
                    // Link
                    startObj.refs.push(target.id);
                }
                recalculateReachability();
            } else {
                // Move the object
                const startObj = gcObjects.find(o => o.id === dragStartId);
                startObj.x = endPos.x - 48; // Center on mouse
                startObj.y = endPos.y - 48;
                // Clamp to canvas
                startObj.x = Math.max(0, Math.min(rect.width - 96, startObj.x));
                startObj.y = Math.max(0, Math.min(rect.height - 96, startObj.y));
            }
        }
        
        dragStartId = null;
        updateGCUI();
    }
}

function addGCObject() {
    const id = Date.now();
    const isRoot = Math.random() > 0.8;
    
    let x, y;
    let attempts = 0;
    const container = document.getElementById('gc-canvas-container');
    const rect = container.getBoundingClientRect();
    
    while (attempts < 50) {
        x = Math.random() * (rect.width - 150) + 50;
        y = isRoot ? 20 : Math.random() * (rect.height - 200) + 100;
        
        // Check for overlap
        const overlap = gcObjects.some(obj => {
            const dist = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2));
            return dist < 120; // Minimum distance
        });
        
        if (!overlap) break;
        attempts++;
    }

    gcObjects.push({
        id,
        label: `Obj_${gcObjects.length + 1}`,
        x,
        y,
        isRoot,
        isReachable: isRoot,
        marked: false,
        refs: [],
        refCount: 0,
        selected: false
    });
    recalculateReachability();
    updateGCUI();
}

function deleteGCObject(id) {
    gcObjects = gcObjects.filter(o => o.id !== id);
    // Remove references to this object
    gcObjects.forEach(o => {
        o.refs = o.refs.filter(refId => refId !== id);
    });
    recalculateReachability();
    updateGCUI();
}

function clearGCRefs(id) {
    const obj = gcObjects.find(o => o.id === id);
    if (obj) {
        obj.refs = [];
        recalculateReachability();
        updateGCUI();
    }
}

function toggleGCSelect(id) {
    const obj = gcObjects.find(o => o.id === id);
    if (obj) {
        obj.selected = !obj.selected;
        updateGCUI();
    }
}

function deleteUnselectedGC() {
    gcObjects = gcObjects.filter(o => o.selected);
    // Remove references to deleted objects
    const remainingIds = new Set(gcObjects.map(o => o.id));
    gcObjects.forEach(o => {
        o.refs = o.refs.filter(refId => remainingIds.has(refId));
    });
    recalculateReachability();
    updateGCUI();
}

function toggleGCRoot(id) {
    const obj = gcObjects.find(o => o.id === id);
    if (obj) {
        obj.isRoot = !obj.isRoot;
        recalculateReachability();
        updateGCUI();
    }
}

function recalculateReachability() {
    gcObjects.forEach(o => {
        o.isReachable = false;
        o.refCount = 0;
    });
    
    // Count references
    gcObjects.forEach(o => {
        o.refs.forEach(refId => {
            const target = gcObjects.find(obj => obj.id === refId);
            if (target) target.refCount++;
        });
    });

    const roots = gcObjects.filter(o => o.isRoot);
    const queue = [...roots];
    const visited = new Set();
    
    while (queue.length > 0) {
        const curr = queue.shift();
        if (visited.has(curr.id)) continue;
        visited.add(curr.id);
        curr.isReachable = true;
        curr.refs.forEach(refId => {
            const target = gcObjects.find(o => o.id === refId);
            if (target) queue.push(target);
        });
    }
}

async function runGC() {
    const strategy = document.getElementById('gc-strategy').value;
    const status = document.getElementById('gc-status');
    const btn = document.getElementById('btn-run-gc');
    
    btn.disabled = true;
    status.innerText = "Running...";
    status.className = "text-sm font-bold text-blue-400";
    
    if (strategy === 'Mark and Sweep') {
        // Mark
        status.innerText = "Marking...";
        await new Promise(r => setTimeout(r, 1000));
        gcObjects.forEach(obj => obj.marked = obj.isReachable);
        updateGCUI();
        
        // Sweep
        status.innerText = "Sweeping...";
        await new Promise(r => setTimeout(r, 1000));
        gcObjects = gcObjects.filter(obj => obj.isReachable);
        gcObjects.forEach(obj => obj.marked = false);
    } else {
        // Reference Counting
        status.innerText = "Counting...";
        await new Promise(r => setTimeout(r, 1000));
        gcObjects = gcObjects.filter(obj => obj.refCount > 0 || obj.isRoot);
    }
    
    recalculateReachability();
    updateGCUI();
    status.innerText = "Idle";
    status.className = "text-sm font-bold text-emerald-400";
    btn.disabled = false;
}

// Initialize
window.onload = () => {
    totalMemory = parseInt(document.getElementById('total-memory-input').value) || 1024;
    memoryBlocks = [{ id: null, size: totalMemory, start: 0, end: totalMemory, status: 'free' }];
    updateAllocationUI();
    updatePagingUI();
    updateStackHeapUI();
    updateGCUI();
    lucide.createIcons();
};

// Expose functions to window for HTML onclick handlers
Object.assign(window, {
    switchSection,
    switchAboutTab,
    runAllocationDemo,
    runPagingDemo,
    runStackHeapDemo,
    runGCDemo,
    undoAllocation,
    redoAllocation,
    allocateProcess,
    deallocateProcess,
    compactMemory,
    resetAllocation,
    addToQueue,
    removeFromQueue,
    stepQueue,
    toggleAutoAllocate,
    switchPagingMode,
    accessPage,
    resetPaging,
    runBatchSimulation,
    pushStack,
    popStack,
    mallocHeap,
    freeHeap,
    addGCObject,
    deleteGCObject,
    clearGCRefs,
    toggleGCSelect,
    deleteUnselectedGC,
    runGC,
    toggleGCRoot,
    handleGCMouseMove,
    handleGCMouseUp
});
