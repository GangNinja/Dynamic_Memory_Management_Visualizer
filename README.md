📊 Dynamic Memory Management Visualizer (MemVis)

An interactive web-based educational tool designed to visualize and simulate memory management techniques used in Operating Systems. This project helps students and developers understand complex concepts like allocation strategies, paging, segmentation, and real-time memory monitoring through intuitive visualizations.

🚀 Project Overview

MemVis provides a hands-on simulation environment for core memory management concepts. It combines frontend visualization with backend system-level data monitoring, allowing users to both simulate algorithms and observe real system memory usage.

The system supports:

Memory allocation strategies (First Fit, Best Fit, etc.)
Paging and page replacement
Segmentation mapping
Stack vs Heap behavior
Garbage Collection visualization
Live system memory tracking
🧩 Module-Wise Breakdown
1. Memory Allocation Module

Simulates dynamic memory allocation algorithms:

First Fit
Best Fit
Worst Fit
Next Fit

Includes:

Process allocation & deallocation
External fragmentation detection
Memory compaction

👉 Implemented in frontend logic

2. Paging Module

Visualizes:

Logical → Physical memory mapping
Page replacement algorithms (FIFO, LRU)
Page faults and hit ratio

Includes:

Interactive mode
Batch simulation mode

👉 UI defined in

3. Segmentation Module

Simulates:

Variable-sized memory segments
Segment table (Base & Limit)
Address translation

👉 Logic handled in

4. Stack vs Heap Module

Demonstrates:

Stack frame push/pop operations
Heap allocation behavior
Lifetime differences
5. Garbage Collection Module

Supports:

Mark & Sweep
Reference Counting

Shows how unreachable objects are reclaimed.

6. Live Memory Monitoring Module (GO LIVE 🚀)

Displays real-time system memory usage including:

RAM usage
Swap memory
Top processes by memory

👉 Backend API implemented using:

Flask + psutil
OR Node.js + systeminformation
⚙️ Functionalities
📦 Dynamic memory allocation simulation
📉 Fragmentation detection and compaction
🔄 Paging with page replacement algorithms
📊 Real-time statistics (utilization, free memory, faults)
🧠 Segmentation with address translation
⚡ Interactive demos for learning
📡 Live system memory visualization
🎮 Queue-based process simulation
🔁 Undo/Redo functionality
🛠️ Technology Used
Programming Languages:
Python
JavaScript
HTML5
CSS3
Libraries and Tools:
Frontend:
Tailwind CSS
Chart.js
Lucide Icons
Backend:
Flask (Python API)
Express.js (Node server)
System Monitoring:
psutil (Python)
systeminformation (Node.js)
Other Tools:
Git & GitHub (Version Control)
Vite (Development server for frontend)
Browser-based UI rendering
🖥️ Project Structure
MemVis/
│
├── index.html        # Main UI layout
├── style.css         # Styling and UI effects
├── script.js         # Core simulation logic
├── app.py            # Flask backend (Python)
├── server.js         # Node backend (alternative)
└── README.md
▶️ How to Run
Option 1: Python (Flask Backend)
pip install flask psutil
python app.py

Then open:

http://localhost:3000
Option 2: Node.js Backend
npm install
node server.js
📚 Educational Use

This project is ideal for:

Operating Systems courses
Visual learning of memory management
Demonstrations and presentations
Academic mini-projects
📌 Key Concepts Covered
Dynamic Memory Allocation
External Fragmentation
Paging & Page Replacement
Segmentation
Stack vs Heap
Garbage Collection
Real-time Memory Monitoring
🔮 Future Enhancements
Add more page replacement algorithms (Optimal, LFU)
Multi-user simulation mode
AI-based memory optimization suggestions
Export simulation results
Cloud deployment
👨‍💻 Author

Vallabhaneni Lakshmi Narasimha
Bellamkonda Likith Raj
Diwakar Kaushik
B.Tech CSE (AI & Data Engineering)
Lovely Professional University
