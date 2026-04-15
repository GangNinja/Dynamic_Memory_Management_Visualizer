import express from 'express';
import { createServer as createViteServer } from 'vite';
import si from 'systeminformation';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
    const app = express();
    const PORT = 3000;

    // API Routes
    app.get('/api/memory', async (req, res) => {
        try {
            const mem = await si.mem();
            const proc = await si.processes();
            
            // Group processes by name
            const groups = {};
            proc.list.forEach(p => {
                const name = p.name;
                if (!groups[name]) {
                    groups[name] = {
                        name: name,
                        memory: 0,
                        cpu: 0,
                        threads: 0,
                        count: 0,
                        max_active_time: 0
                    };
                }
                groups[name].memory += p.memRss * 1024; // memRss is in KB
                groups[name].cpu += p.cpu;
                groups[name].threads += p.parentPid ? 1 : 0; // Rough estimate
                groups[name].count += 1;
                // systeminformation doesn't give create_time easily in the same list, so we'll mock active time or omit
                groups[name].max_active_time = 3600; // Mock 1 hour
            });

            const sortedGroups = Object.values(groups).sort((a, b) => b.memory - a.memory);

            res.json({
                total: mem.total,
                available: mem.available,
                used: mem.used,
                free: mem.free,
                percent: (mem.used / mem.total) * 100,
                swap_total: mem.swaptotal,
                swap_used: mem.swapused,
                swap_free: mem.swapfree,
                swap_percent: (mem.swapused / mem.swaptotal) * 100,
                sin: 0, // systeminformation doesn't provide SIN/SOUT directly in mem()
                sout: 0,
                top_groups: sortedGroups.slice(0, 10)
            });
        } catch (error) {
            console.error('Memory API Error:', error);
            res.status(500).json({ error: 'Failed to fetch memory stats' });
        }
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
