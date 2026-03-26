function allocate(){

let pid=document.getElementById("pid").value
let size=parseInt(document.getElementById("psize").value)
let algo=document.getElementById("algorithm").value

let success=false

if(algo=="first")
success=firstFit(pid,size)

if(algo=="best")
success=bestFit(pid,size)

if(algo=="worst")
success=worstFit(pid,size)

if(!success)
alert("Allocation Failed")

renderMemory()

}



function allocateBlock(index,pid,size){

let block=memory[index]

let remaining=block.size-size

memory.splice(index,1,
{start:block.start,size:size,status:"used",pid:pid})

if(remaining>0){

memory.splice(index+1,0,
{start:block.start+size,size:remaining,status:"free",pid:null})

}

}



function renderMemory(){
  let container=document.getElementById("memoryContainer")
  container.innerHTML=""
  let totalFree=0
  memory.forEach(block=>{
    let div=document.createElement("div")
    div.classList.add("block")
    if(block.status=="free"){
      div.classList.add("free")
      totalFree+=block.size
    }else{
      div.classList.add("used")
    }
    div.style.width=(block.size/10)+"px"
    div.innerHTML=block.pid?block.pid:"FREE"
    container.appendChild(div)
  })
  document.getElementById("fragmentation").innerText="Total Free Memory: "+totalFree
}

// Paging functions
function switchMode(newMode) {
  mode = newMode
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'))
  document.getElementById(newMode + 'Section').classList.add('active')
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
  event.target.classList.add('active')
  
  if (newMode === 'partition') {
    resetMemory()
  } else {
    resetPaging()
  }
}

function runPaging() {
  let algo = document.getElementById('pagingAlgo').value
  initPaging(parseInt(document.getElementById('numFrames').value), document.getElementById('refString').value)
  
  let result
  switch(algo) {
    case 'fifo': result = fifoPaging(); break
    case 'lru': result = lruPaging(); break
    case 'optimal': result = optimalPaging(); break
  }
  
  faults = result.faults
  frames = result.frames
  trace = result.trace
  
  document.getElementById('pagingStats').innerText = `Page Faults: ${faults}`
  renderPaging()
  renderTrace()
}

function renderPaging() {
  let container = document.getElementById('framesContainer')
  container.innerHTML = ''
  for(let i = 0; i < frames.length; i++) {
    let div = document.createElement('div')
    div.className = 'frame'
    if (frames[i] === -1) {
      div.classList.add('empty')
      div.innerText = '-'
    } else {
      div.innerText = frames[i]
    }
    container.appendChild(div)
  }
}

function renderTrace() {
  let tbody = document.getElementById('traceBody')
  tbody.innerHTML = ''
  trace.forEach(entry => {
    let row = tbody.insertRow()
    row.insertCell(0).textContent = entry.ref
    row.insertCell(1).textContent = entry.frames.map(p => p === -1 ? '-' : p).join(' | ')
    row.insertCell(2).textContent = entry.fault
    if (entry.fault === 'FAULT') {
      row.style.background = 'rgba(255,68,68,0.3)'
    }
  })
}

function stepPaging() {
  if (currentStep >= refs.length) return
  // Step logic using trace or simulate - for simplicity use full run
  runPaging() // TODO: make true step later
}

function resetPagingHandler() {
  resetPaging()
}
