# 🧠 Dynamic Memory Management Visualizer

An interactive, full-stack web application that visualizes core Operating System memory management concepts — from contiguous allocation and paging to segmentation, stack/heap operations, and garbage collection. Includes a **Live System Monitor** that displays real-time RAM, swap, and per-process memory usage from your actual machine.

---

## ✨ Features

### 1. Contiguous Memory Allocation
- Initialize a custom-sized memory space
- Allocate processes using **First Fit**, **Best Fit**, or **Worst Fit** algorithms
- Deallocate processes and observe automatic merging of adjacent free blocks
- **Memory Compaction** — shift all allocated blocks to one end and consolidate free space
- Real-time statistics: total, used, free memory & external fragmentation percentage
- Visual memory bar and operation logs

### 2. Paging Simulation
- Configurable frame size for physical memory
- **Manual Mode** — add pages one at a time and watch frame updates live
- **Batch Mode** — enter a full reference string and simulate the entire sequence at once
- Page replacement algorithms: **FIFO**, **LRU**, **Optimal**
- Visual frame display with hit/fault animations
- Step-by-step history table with disk-access indicators
- Page table, virtual memory sequence, physical memory frames, and disk (swap space) views
- Hit rate, fault count, and hit/fault ratio stats

### 3. Segmentation
- Create multiple segments with custom limits
- Random non-overlapping base address generation simulating real OS behavior
- **Logical → Physical address translation** with segmentation fault detection
- Segment table and visual memory map

### 4. Stack, Heap & Garbage Collection
- **Stack (LIFO)** — push function calls and pop returns with drop-in animations
- **Heap (Dynamic)** — allocate objects simulating `malloc` / `new`
- **Mark & Sweep Garbage Collection** — orphaned heap objects are highlighted and swept clean
- Side-by-side stack vs heap visualization

### 5. 🚀 Live System Monitor (Real-Time Dashboard)
- Reads **real RAM and swap data** from your machine using `psutil`
- Displays **Total / Used / Free RAM** with live-updating stats
- **Live Virtual Memory (Swap Space)** panel — Swap Used, Swap In (SIN), Swap Out (SOUT)
- **Real-time line chart** graphing swap activity over time (powered by Chart.js)
- **Top App Groups** — top 10 processes sorted by memory, grouped by name, showing:
  - Process count, CPU %, thread count, memory usage, and uptime
- Click any process card to open a **Segment Modal** with:
  - Real OS memory maps (or logical fallback segments on access-denied)
  - Live address translation test (base + offset → physical address)
- **Simulate Memory Pressure** button — injects fake swap spikes to demonstrate page fault activity on the graph

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| **Backend** | Python 3, Flask, Flask-CORS, psutil |
| **Frontend**| HTML5, CSS3, Vanilla JavaScript     |
| **Charts**  | Chart.js (CDN)                      |
| **Fonts**   | Google Fonts — Inter                |

---

## 📁 Project Structure

```
├── app.py              # Flask backend — all API routes & simulation logic
├── main.html           # Main UI — allocation, paging, segmentation, stack/heap/GC
├── index.html          # Entry point — loads main.html in an iframe
├── templates/
│   └── live.html       # Live System Monitor dashboard (Jinja2 template)
└── README.md           # You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.7+** installed
- `pip` package manager

### Installation

```bash
# 1. Clone or download the project
cd "Added stack heap gc and improvisation in whole UI"

# 2. Install dependencies
pip install flask flask-cors psutil

# 3. Run the server
python app.py
```

### Access the Application

| Page                | URL                          |
|---------------------|------------------------------|
| Home (Visualizer)   | http://localhost:5000        |
| Live System Monitor | http://localhost:5000/live   |

> The server runs on `0.0.0.0:5000` with debug mode enabled by default.

---

## 📡 API Reference

### Contiguous Allocation

| Method | Endpoint         | Description                                     |
|--------|------------------|-------------------------------------------------|
| POST   | `/initialize`    | Initialize memory with a given `total_memory`   |
| GET    | `/memory`        | Get current memory block state                  |
| POST   | `/allocate`      | Allocate a process (`size`, `algorithm`)         |
| POST   | `/deallocate`    | Free a process by `process_id`                  |
| POST   | `/compact`       | Compact memory — merge all free space           |
| GET    | `/stats`         | Memory statistics & fragmentation               |
| GET    | `/logs`          | Operation history logs                          |

### Paging

| Method | Endpoint           | Description                                     |
|--------|--------------------|-------------------------------------------------|
| POST   | `/paging/init`     | Initialize paging with `frame_size`             |
| POST   | `/paging/request`  | Process a single page request (`page`, `algorithm`) |
| POST   | `/paging/batch`    | Run a full page `sequence` with chosen `algorithm`  |
| GET    | `/paging/state`    | Current frames, page faults, LRU/FIFO queues   |
| GET    | `/paging/history`  | Full step-by-step paging history                |

### Segmentation

| Method | Endpoint                   | Description                                |
|--------|----------------------------|--------------------------------------------|
| POST   | `/segmentation/create`     | Create segments with `limit` values        |
| POST   | `/segmentation/translate`  | Translate `(segment, offset)` → physical   |
| GET    | `/segmentation/table`      | Get the segment table                      |

### Live System Monitor

| Method | Endpoint                  | Description                                  |
|--------|---------------------------|----------------------------------------------|
| GET    | `/system-data`            | Real-time RAM, swap, and top process data    |
| GET    | `/process-details/<pid>`  | Memory maps / segments for a specific PID    |
| POST   | `/simulate-fault`         | Trigger fake swap spikes for demonstration   |

---

## 🎨 UI Highlights

- **Dark mode dashboard** with a deep navy color scheme
- **Glassmorphism** cards and backdrop blur effects
- **Smooth micro-animations** — fade-ins, drop-in stack frames, pop-in heap objects, flash on page faults
- **Responsive grid layouts** for controls and process cards
- **Custom scrollbar** styling for a polished feel
- **Color-coded memory bars** — green for free, red for allocated, per-process colors in live mode
- **Interactive process cards** with hover lift effects and click-to-inspect modals

---

## 📝 How It Works

1. **Simulator Mode** (`/`) — Use the tabbed interface to explore four memory management concepts side by side. All simulations run against the Flask backend via REST API calls.

2. **Live Mode** (`/live`) — The dashboard polls `/system-data` every 2 seconds, pulling real metrics from `psutil`. The swap chart updates in real-time. Clicking a process card fetches its OS memory maps (or generates logical segments as a fallback when access is restricted).

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

# Author

Diwakar Kaushik
Vallabhaneni Lakshmi Narasimha
Bellamkonda Likith

---

## 📜 License

This project is open source and available for educational use.

---

> **Built for understanding OS internals through visualization** 🎓
