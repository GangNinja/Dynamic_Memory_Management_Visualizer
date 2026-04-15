from flask import Flask, jsonify, send_from_directory
import psutil
import os
import time

app = Flask(__name__, static_folder='.')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('.', path)

@app.route('/api/memory')
def get_memory():
    try:
        # Virtual Memory
        vm = psutil.virtual_memory()
        # Swap Memory
        swap = psutil.swap_memory()
        
        # Top Processes
        processes = []
        for proc in psutil.process_iter(['name', 'memory_info', 'cpu_percent', 'num_threads', 'create_time']):
            try:
                pinfo = proc.info
                # Group by name
                processes.append({
                    'name': pinfo['name'],
                    'memory': pinfo['memory_info'].rss,
                    'cpu': pinfo['cpu_percent'],
                    'threads': pinfo['num_threads'],
                    'active_time': time.time() - pinfo['create_time']
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        
        # Aggregate by name
        groups = {}
        for p in processes:
            name = p['name']
            if name not in groups:
                groups[name] = {
                    'name': name,
                    'memory': 0,
                    'cpu': 0,
                    'threads': 0,
                    'count': 0,
                    'max_active_time': 0
                }
            groups[name]['memory'] += p['memory']
            groups[name]['cpu'] += p['cpu']
            groups[name]['threads'] += p['threads']
            groups[name]['count'] += 1
            groups[name]['max_active_time'] = max(groups[name]['max_active_time'], p['active_time'])
            
        sorted_groups = sorted(groups.values(), key=lambda x: x['memory'], reverse=True)
        
        return jsonify({
            'total': vm.total,
            'available': vm.available,
            'used': vm.used,
            'free': vm.free,
            'percent': vm.percent,
            'swap_total': swap.total,
            'swap_used': swap.used,
            'swap_free': swap.free,
            'swap_percent': swap.percent,
            'sin': getattr(swap, 'sin', 0),
            'sout': getattr(swap, 'sout', 0),
            'top_groups': sorted_groups[:10]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Port 3000 is required for external access
    app.run(host='0.0.0.0', port=3000)
