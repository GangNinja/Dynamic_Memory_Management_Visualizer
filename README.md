# MemVis – Dynamic Memory Management Visualizer (v2)

MemVis is an interactive educational tool that visualizes how memory management works inside an operating system. It allows students to explore concepts such as **memory allocation algorithms, paging, stack vs heap memory behavior, and garbage collection** through real-time simulations and visual representations.

This project is designed to help students understand complex OS memory concepts in a simple and interactive way.

---

# Overview

Operating Systems manage memory using different strategies and algorithms. These mechanisms are often difficult to understand through theory alone. MemVis solves this by providing **interactive simulations and visual representations** of how memory behaves during allocation, paging, and garbage collection.

Users can dynamically allocate memory, simulate page replacement, observe stack and heap growth, and visualize garbage collection algorithms.

---

# Features

## Memory Allocation Simulator

Simulate contiguous memory allocation algorithms and observe how processes occupy memory blocks.

Algorithms supported:

* First Fit
* Best Fit
* Worst Fit
* Next Fit

Features:

* Interactive memory map visualization
* Process allocation and deallocation
* External fragmentation tracking
* Memory utilization statistics
* Memory compaction
* Process queue simulation

---

## Paging Visualization

Simulates logical to physical memory mapping and page replacement.

Features:

* Page hits and page faults tracking
* Frame allocation visualization
* Page table representation
* Logical memory vs physical memory view
* FIFO page replacement algorithm
* Hit ratio calculation

---

## Stack vs Heap Visualization

Demonstrates how memory behaves during program execution.

Features:

* Call stack simulation
* Function frame creation
* Stack growth (High → Low addresses)
* Heap object allocation
* Heap growth (Low → High addresses)

This module helps students understand runtime memory organization.

---

## Garbage Collection Simulation

Visualizes automatic memory management used by modern programming languages.

Algorithms included:

* Mark and Sweep
* Reference Counting

Features:

* Object graph visualization
* Root set tracking
* Object reference relationships
* Manual object creation and deletion
* Run garbage collector simulation

---

# Project Structure

```
directory/
│
├── index.html     # Main UI and layout
├── style.css      # Styling and UI design
└── script.js      # Simulation logic and algorithms
```

The project runs completely in the browser using JavaScript.

---

# Technologies Used

* HTML5
* CSS3
* JavaScript (Vanilla JS)

No external frameworks are required.

---

# Educational Value

MemVis helps students understand:

* Contiguous memory allocation
* External fragmentation
* Virtual memory and paging
* Page replacement algorithms
* Stack frame execution
* Heap memory allocation
* Automatic garbage collection

It is especially useful for courses such as:

* Operating Systems
* Computer Architecture
* Systems Programming
* Memory Management

---

# How to Run the Project

1. Download or clone the repository

2. Navigate to the project folder

3. Open the project

Simply open **index.html** in your browser.

No installation or dependencies are required.

---

# Future Improvements

Possible enhancements for future versions:

* LRU and Optimal page replacement algorithms
* Internal fragmentation visualization
* Algorithm comparison mode
* Memory usage graphs
* Step-by-step simulation mode
* Export simulation reports
* CPU scheduling visualizer
* Disk scheduling simulator

---


# Author

Vallabhaneni Lakshmi Narasimha
Bellamkonda Likith
Diwakar Koushik

---

# License

This project is open-source and available under the MIT License.
