from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import random
import psutil

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend cross-origin requests

# Global variables to store memory blocks, process counter, and logs
memory_blocks = []
process_counter = 1
logs = []

# Global variables for paging simulation
frames = []
frame_size = 3
page_faults = 0
page_sequence = []
fifo_queue = []
lru_stack = []
history = []

# Global variables for segmentation simulation
segments = []

def optimal_replace(frames, page_sequence, current_index):
    """Find the index of the frame to replace using Optimal algorithm."""
    farthest_index = -1
    replace_index = -1
    has_future_use = False
    
    for i, frame_page in enumerate(frames):
        # Find next occurrence after current_index
        next_use = -1
        for j in range(current_index + 1, len(page_sequence)):
            if page_sequence[j] == frame_page:
                next_use = j
                has_future_use = True
                break
        
        if next_use == -1:
            if not has_future_use:
                # If no page has future use, keep track of the last index
                replace_index = i
            else:
                # If some pages have future use, replace this one immediately
                return i
        else:
            # Track the page with the farthest next use
            if next_use > farthest_index:
                farthest_index = next_use
                replace_index = i
    
    return replace_index

def simulate_paging_sequence(pages, algorithm, frame_size):
    """Simulate paging for an entire page sequence using the requested algorithm."""
    history = []
    frames = []
    disk = []
    page_sequence = []
    fifo_queue = []
    lru_stack = []
    page_faults = 0

    for i, page in enumerate(pages):
        page_sequence.append(page)

        if page in frames:
            status = "HIT"
            if algorithm == 'LRU':
                # Update LRU on hit
                lru_stack.remove(page)
                lru_stack.append(page)
        else:
            status = "FAULT"
            page_faults += 1

            if len(frames) < frame_size:
                frames.append(page)
                fifo_queue.append(page)
                lru_stack.append(page)
            else:
                if algorithm == 'FIFO':
                    replace_index = 0
                elif algorithm == 'LRU':
                    least_recent = lru_stack.pop(0)
                    replace_index = frames.index(least_recent)
                elif algorithm == 'OPTIMAL':
                    replace_index = optimal_replace(frames, page_sequence, i)
                else:
                    replace_index = 0

                removed_page = frames[replace_index]
                disk.append(removed_page)
                frames[replace_index] = page

                # Keep state queues consistent for FIFO/LRU/OPTIMAL
                if removed_page in fifo_queue:
                    fifo_queue.remove(removed_page)
                fifo_queue.append(page)

                if removed_page in lru_stack:
                    lru_stack.remove(removed_page)
                lru_stack.append(page)

        history.append({
            "step": i + 1,
            "page": page,
            "frames": frames.copy(),
            "status": status
        })

    hits = len(pages) - page_faults
    return {
        'history': history,
        'frames': frames,
        'page_faults': page_faults,
        'hits': hits,
        'disk': disk,
        'sequence': page_sequence
    }

@app.route('/paging/batch', methods=['POST'])
def batch_paging():
    """Process a full page sequence in batch mode and return the complete simulation."""
    data = request.get_json()
    if not data or 'sequence' not in data or 'algorithm' not in data or 'frame_size' not in data:
        return jsonify({'error': 'sequence, algorithm, and frame_size are required'}), 400

    sequence = data.get('sequence')
    algorithm = data.get('algorithm', 'FIFO').upper()

    if algorithm not in ['FIFO', 'LRU', 'OPTIMAL']:
        return jsonify({'error': 'algorithm must be FIFO, LRU, or OPTIMAL'}), 400

    try:
        frame_size = int(data.get('frame_size'))
    except (ValueError, TypeError):
        return jsonify({'error': 'frame_size must be an integer'}), 400

    if frame_size <= 0:
        return jsonify({'error': 'frame_size must be greater than zero'}), 400

    if not isinstance(sequence, str):
        return jsonify({'error': 'sequence must be a comma-separated string'}), 400

    try:
        pages = [int(x.strip()) for x in sequence.split(',') if x.strip() != '']
    except ValueError:
        return jsonify({'error': 'sequence must contain only integers separated by commas'}), 400

    if len(pages) == 0:
        return jsonify({'error': 'sequence must contain at least one page number'}), 400

    result = simulate_paging_sequence(pages, algorithm, frame_size)
    return jsonify(result), 200

@app.route('/initialize', methods=['POST'])
def initialize_memory():
    """Initialize memory with a single free block."""
    global memory_blocks

    data = request.get_json()
    if not data or 'total_memory' not in data:
        return jsonify({'error': 'total_memory is required'}), 400

    try:
        total_memory = int(data['total_memory'])
    except (ValueError, TypeError):
        return jsonify({'error': 'total_memory must be an integer'}), 400

    if total_memory <= 0:
        return jsonify({'error': 'total_memory must be greater than zero'}), 400

    # Create one free block spanning the whole memory space
    # Reset process counter and logs when memory is reinitialized
    global process_counter, logs
    process_counter = 1
    logs = []
    
    memory_blocks = [
        {
            'start': 0,
            'size': total_memory,
            'free': True,
            'process_id': None
        }
    ]
    
    logs.append(f'Initialized memory with {total_memory} bytes')

    return jsonify({'memory_blocks': memory_blocks}), 200

@app.route('/memory', methods=['GET'])
def get_memory_state():
    """Return the current memory blocks state."""
    return jsonify({'memory_blocks': memory_blocks}), 200

def first_fit(requested_size):
    """Find first free block with sufficient size. Returns block index or -1."""
    for i, block in enumerate(memory_blocks):
        if block['free'] and block['size'] >= requested_size:
            return i
    return -1

def best_fit(requested_size):
    """Find smallest free block that fits. Returns block index or -1."""
    best_index = -1
    best_size = float('inf')
    
    for i, block in enumerate(memory_blocks):
        if block['free'] and block['size'] >= requested_size and block['size'] < best_size:
            best_index = i
            best_size = block['size']
    
    return best_index

def worst_fit(requested_size):
    """Find largest free block that fits. Returns block index or -1."""
    worst_index = -1
    worst_size = -1
    
    for i, block in enumerate(memory_blocks):
        if block['free'] and block['size'] >= requested_size and block['size'] > worst_size:
            worst_index = i
            worst_size = block['size']
    
    return worst_index

@app.route('/allocate', methods=['POST'])
def allocate_memory():
    """Allocate memory using specified algorithm (first_fit, best_fit, worst_fit)."""
    global memory_blocks, process_counter, logs

    data = request.get_json()
    if not data or 'size' not in data:
        return jsonify({'error': 'size is required'}), 400

    try:
        requested_size = int(data['size'])
    except (ValueError, TypeError):
        return jsonify({'error': 'size must be an integer'}), 400

    if requested_size <= 0:
        return jsonify({'error': 'size must be greater than zero'}), 400

    # Get algorithm (default to first_fit)
    algorithm = data.get('algorithm', 'first_fit').lower()
    if algorithm not in ['first_fit', 'best_fit', 'worst_fit']:
        return jsonify({'error': 'algorithm must be: first_fit, best_fit, or worst_fit'}), 400

    # Select block based on algorithm
    if algorithm == 'first_fit':
        block_index = first_fit(requested_size)
        algorithm_name = 'First Fit'
    elif algorithm == 'best_fit':
        block_index = best_fit(requested_size)
        algorithm_name = 'Best Fit'
    else:  # worst_fit
        block_index = worst_fit(requested_size)
        algorithm_name = 'Worst Fit'

    # Check if block was found
    if block_index == -1:
        return jsonify({'message': 'Allocation failed: not enough contiguous memory'}), 400

    # Allocate the block
    block = memory_blocks[block_index]
    allocated_process = f'P{process_counter}'
    block['free'] = False
    block['process_id'] = allocated_process

    # Split block if there's remaining space
    remaining_size = block['size'] - requested_size
    if remaining_size > 0:
        # Update the allocated block's size
        block['size'] = requested_size

        # Insert a new free block after the allocated block
        new_block = {
            'start': block['start'] + requested_size,
            'size': remaining_size,
            'free': True,
            'process_id': None
        }
        memory_blocks.insert(block_index + 1, new_block)

    # Increment process counter for next allocation
    process_counter += 1

    # Log the allocation
    logs.append(f'Allocated {allocated_process} ({requested_size} bytes)')

    return jsonify({
        'message': f'Allocated {allocated_process} ({requested_size}) using {algorithm_name}',
        'memory_blocks': memory_blocks
    }), 200

def merge_free_blocks():
    """Merge adjacent free blocks and update start positions."""
    global memory_blocks
    
    i = 0
    while i < len(memory_blocks) - 1:
        current_block = memory_blocks[i]
        next_block = memory_blocks[i + 1]
        
        # If both blocks are free, merge them
        if current_block['free'] and next_block['free']:
            current_block['size'] += next_block['size']
            memory_blocks.pop(i + 1)
            # Don't increment i, check the merged block again
        else:
            i += 1

@app.route('/deallocate', methods=['POST'])
def deallocate_memory():
    """Deallocate memory for a given process and merge free blocks."""
    global memory_blocks
    
    data = request.get_json()
    if not data or 'process_id' not in data:
        return jsonify({'error': 'process_id is required'}), 400
    
    process_id = data['process_id']
    
    # Find the block with the given process_id
    found = False
    for block in memory_blocks:
        if block['process_id'] == process_id:
            block['free'] = True
            block['process_id'] = None
            found = True
            break
    
    if not found:
        return jsonify({'error': f'Process {process_id} not found in memory'}), 404
    
    # Merge adjacent free blocks
    merge_free_blocks()
    
    # Log the deallocation
    global logs
    logs.append(f'Deallocated {process_id}')
    
    return jsonify({
        'message': f'Deallocated {process_id} and merged free blocks',
        'memory_blocks': memory_blocks
    }), 200

@app.route('/compact', methods=['POST'])
def compact_memory():
    """Compact memory by shifting allocated blocks to the left and merging free space."""
    global memory_blocks, logs
    
    # STEP 1: Separate blocks
    allocated_blocks = [block for block in memory_blocks if not block['free']]
    free_blocks = [block for block in memory_blocks if block['free']]
    
    # STEP 2: Reassign start addresses for allocated blocks
    current_address = 0
    for block in allocated_blocks:
        block['start'] = current_address
        current_address += block['size']
    
    # STEP 3: Calculate total free memory
    total_free = sum(block['size'] for block in free_blocks)
    
    # STEP 4: Create ONE free block if there's free space
    if total_free > 0:
        free_block = {
            'start': current_address,
            'size': total_free,
            'free': True,
            'process_id': None
        }
        memory_blocks = allocated_blocks + [free_block]
    else:
        memory_blocks = allocated_blocks
    
    # STEP 5: Log the compaction
    logs.append('Memory compacted: all free space merged')
    
    return jsonify({
        'message': 'Memory compacted successfully',
        'memory_blocks': memory_blocks
    }), 200

@app.route('/stats', methods=['GET'])
def get_stats():
    """Return memory statistics including fragmentation."""
    if not memory_blocks:
        return jsonify({
            'total_memory': 0,
            'used_memory': 0,
            'free_memory': 0,
            'fragmentation': 0
        }), 200
    
    # Calculate total, used, and free memory
    total_memory = sum(block['size'] for block in memory_blocks)
    used_memory = sum(block['size'] for block in memory_blocks if not block['free'])
    free_memory = sum(block['size'] for block in memory_blocks if block['free'])
    
    # Calculate fragmentation
    # Find the largest contiguous free block
    largest_free_block = max([block['size'] for block in memory_blocks if block['free']], default=0)
    
    # Fragmentation = (unused free memory) / total memory * 100
    if total_memory > 0 and largest_free_block > 0:
        fragmentation = ((free_memory - largest_free_block) / total_memory) * 100
    else:
        fragmentation = 0
    
    return jsonify({
        'total_memory': total_memory,
        'used_memory': used_memory,
        'free_memory': free_memory,
        'fragmentation': round(fragmentation, 2)
    }), 200

@app.route('/logs', methods=['GET'])
def get_logs():
    """Return operation logs."""
    return jsonify({'logs': logs}), 200

@app.route('/paging/init', methods=['POST'])
def init_paging():
    """Initialize paging system with specified frame size."""
    global frames, frame_size, page_faults, page_sequence, fifo_queue, lru_stack, history
    
    data = request.get_json()
    if not data or 'frame_size' not in data:
        return jsonify({'error': 'frame_size is required'}), 400
    
    try:
        frame_size = int(data['frame_size'])
    except (ValueError, TypeError):
        return jsonify({'error': 'frame_size must be an integer'}), 400
    
    if frame_size <= 0:
        return jsonify({'error': 'frame_size must be greater than zero'}), 400
    
    # Reset all paging variables
    frames = []
    page_faults = 0
    page_sequence = []
    fifo_queue = []
    lru_stack = []
    history = []
    
    return jsonify({
        'message': f'Paging initialized with {frame_size} frames',
        'frame_size': frame_size,
        'frames': frames,
        'page_faults': page_faults
    }), 200

@app.route('/paging/request', methods=['POST'])
def process_page_request():
    """Process a page request with specified replacement algorithm."""
    global frames, frame_size, page_faults, page_sequence, fifo_queue, lru_stack, history
    
    data = request.get_json()
    if not data or 'page' not in data:
        return jsonify({'error': 'page is required'}), 400
    
    try:
        page = int(data['page'])
    except (ValueError, TypeError):
        return jsonify({'error': 'page must be an integer'}), 400
    
    algorithm = data.get('algorithm', 'FIFO').upper()
    if algorithm not in ['FIFO', 'LRU', 'OPTIMAL']:
        return jsonify({'error': 'algorithm must be FIFO, LRU, or OPTIMAL'}), 400
    
    # Add to page sequence
    page_sequence.append(page)
    
    # Check if page is already in frames
    if page in frames:
        status = "HIT"
        message = f"Page {page} hit (already in memory)"
        
        # Update LRU stack if using LRU
        if algorithm == 'LRU':
            lru_stack.remove(page)
            lru_stack.append(page)
    else:
        # Page fault occurred
        status = "FAULT"
        page_faults += 1
        message = f"Page fault occurred for page {page}"
        
        # If frames not full, add page
        if len(frames) < frame_size:
            frames.append(page)
            fifo_queue.append(page)
            lru_stack.append(page)
        else:
            # Need to replace a page
            if algorithm == 'FIFO':
                # Remove oldest page (first in queue)
                removed_page = fifo_queue.pop(0)
                frames.remove(removed_page)
                frames.append(page)
                fifo_queue.append(page)
                message += f" (replaced page {removed_page})"
                
            elif algorithm == 'LRU':
                # Remove least recently used page (first in stack)
                removed_page = lru_stack.pop(0)
                frames.remove(removed_page)
                frames.append(page)
                lru_stack.append(page)
                message += f" (replaced page {removed_page})"
                
            elif algorithm == 'OPTIMAL':
                # Use optimal replacement
                current_index = len(page_sequence) - 1
                replace_idx = optimal_replace(frames, page_sequence, current_index)
                removed_page = frames[replace_idx]
                frames[replace_idx] = page
                # Update queues for consistency (even though OPTIMAL doesn't use them)
                if removed_page in fifo_queue:
                    fifo_queue.remove(removed_page)
                fifo_queue.append(page)
                if removed_page in lru_stack:
                    lru_stack.remove(removed_page)
                lru_stack.append(page)
                message = f"Page fault occurred - replaced using Optimal (replaced page {removed_page})"
    
    # Store snapshot in history
    current_frames = frames.copy()
    history.append({
        "page": page,
        "frames": current_frames,
        "status": status
    })
    
    return jsonify({
        'frames': frames,
        'page_faults': page_faults,
        'message': message,
        'algorithm': algorithm,
        'page_sequence': page_sequence
    }), 200

@app.route('/paging/state', methods=['GET'])
def get_paging_state():
    """Return current paging state."""
    return jsonify({
        'frames': frames,
        'frame_size': frame_size,
        'page_faults': page_faults,
        'page_sequence': page_sequence,
        'fifo_queue': fifo_queue,
        'lru_stack': lru_stack
    }), 200

@app.route('/paging/history', methods=['GET'])
def get_paging_history():
    """Return the full paging history."""
    return jsonify({
        'history': history
    }), 200

@app.route('/segmentation/create', methods=['POST'])
def create_segments():
    """Create segments with given limits and assign random non-contiguous base addresses."""
    global segments
    
    data = request.get_json()
    if not data or 'segments' not in data:
        return jsonify({'error': 'segments is required'}), 400
    
    if not isinstance(data['segments'], list):
        return jsonify({'error': 'segments must be a list'}), 400
    
    # Reset segments
    segments = []
    
    # Memory bounds (configurable)
    memory_start = 0
    memory_end = 1000  # Total memory size
    
    # List to track occupied ranges: [(start, end), ...]
    occupied_ranges = []
    
    for i, segment_data in enumerate(data['segments']):
        if not isinstance(segment_data, dict) or 'limit' not in segment_data:
            return jsonify({'error': f'Segment {i} must have a limit field'}), 400
        
        try:
            limit = int(segment_data['limit'])
        except (ValueError, TypeError):
            return jsonify({'error': f'Segment {i} limit must be an integer'}), 400
        
        if limit <= 0:
            return jsonify({'error': f'Segment {i} limit must be greater than zero'}), 400
        
        # Generate random non-overlapping base address
        max_attempts = 100  # Prevent infinite loops
        attempts = 0
        base_assigned = False
        
        while attempts < max_attempts and not base_assigned:
            # Generate random base within memory bounds
            base = random.randint(memory_start, memory_end - limit)
            
            # Check for overlaps with existing segments
            segment_end = base + limit
            overlap = False
            
            for occupied_start, occupied_end in occupied_ranges:
                if not (segment_end <= occupied_start or base >= occupied_end):
                    overlap = True
                    break
            
            if not overlap:
                # No overlap, assign this base
                occupied_ranges.append((base, segment_end))
                base_assigned = True
            else:
                # Try a different random base
                attempts += 1
        
        if not base_assigned:
            return jsonify({'error': f'Could not find non-overlapping space for segment {i} after {max_attempts} attempts'}), 400
        
        # Create segment with random base address
        segment = {
            'id': i,
            'base': base,
            'limit': limit
        }
        segments.append(segment)
    
    # Sort segments by ID for display (not by base address)
    segments.sort(key=lambda x: x['id'])
    
    return jsonify({
        'message': f'Created {len(segments)} segments with random non-contiguous base addresses successfully',
        'segments': segments
    }), 200

@app.route('/segmentation/translate', methods=['POST'])
def translate_address():
    """Translate logical address (segment, offset) to physical address."""
    global segments
    
    data = request.get_json()
    if not data or 'segment' not in data or 'offset' not in data:
        return jsonify({'error': 'segment and offset are required'}), 400
    
    try:
        segment_id = int(data['segment'])
        offset = int(data['offset'])
    except (ValueError, TypeError):
        return jsonify({'error': 'segment and offset must be integers'}), 400
    
    if segment_id < 0 or segment_id >= len(segments):
        return jsonify({
            'valid': False,
            'message': f'Segmentation Fault: Invalid segment {segment_id}'
        }), 400
    
    segment = segments[segment_id]
    
    if offset < 0 or offset >= segment['limit']:
        return jsonify({
            'valid': False,
            'segment': segment_id,
            'base': segment['base'],
            'offset': offset,
            'limit': segment['limit'],
            'physical_address': None,
            'message': f'Segmentation Fault! Offset ({offset}) exceeds limit ({segment["limit"]})'
        }), 400
    
    # Valid address translation
    physical_address = segment['base'] + offset
    
    return jsonify({
        'valid': True,
        'segment': segment_id,
        'base': segment['base'],
        'offset': offset,
        'limit': segment['limit'],
        'physical_address': physical_address,
        'message': f'Valid Address! Physical Address = Base ({segment["base"]}) + Offset ({offset}) = {physical_address}'
    }), 200

@app.route('/segmentation/table', methods=['GET'])
def get_segment_table():
    """Return the segment table."""
    return jsonify({
        'segments': segments
    }), 200

@app.route('/system-data')
def system_data():
    import psutil

    ram = psutil.virtual_memory()

    processes = []
    for proc in psutil.process_iter(['pid','name','memory_info']):
        try:
            processes.append({
                "pid": proc.info['pid'],
                "name": proc.info['name'],
                "memory": proc.info['memory_info'].rss
            })
        except:
            continue

    processes = sorted(processes, key=lambda x: x['memory'], reverse=True)[:5]

    return jsonify({
        "total_ram": ram.total,
        "used_ram": ram.used,
        "free_ram": ram.available,
        "processes": processes
    })

@app.route('/')
def index():
    """Serve the main application page."""
    return '''
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Home</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #fff;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <iframe src="main.html" title="Application"></iframe>
</body>
</html>
'''

@app.route('/main.html')
def main_page():
    """Serve the main HTML page."""
    with open('main.html', 'r', encoding='utf-8') as f:
        return f.read()

@app.route('/live')
def live_page():
    return render_template('live.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
