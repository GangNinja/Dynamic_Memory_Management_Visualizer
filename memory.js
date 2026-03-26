let memory = []

function initializeMemory(size){

memory = [
{start:0,size:size,status:"free",pid:null}
]

renderMemory()
}

function resetMemory(){

let total = document.getElementById("totalMemory").value
initializeMemory(parseInt(total))

}

window.onload = function(){
  resetMemory()
}

// Paging state
let frames = []
let refs = []
let currentStep = 0
let faults = 0
let trace = []
let mode = 'partition'  // 'partition' or 'paging'

function initPaging(numFrames, refString) {
  frames = new Array(numFrames).fill(-1)
  refs = refString.split(',').map(Number).filter(n => !isNaN(n))
  currentStep = 0
  faults = 0
  trace = []
  renderPaging()
}

function resetPaging() {
  initPaging(parseInt(document.getElementById('numFrames').value), document.getElementById('refString').value)
  document.getElementById('pagingStats').innerText = 'Page Faults: 0'
}

function getCurrentFramesStr() {
  return frames.map(p => p === -1 ? '-' : p).join(' | ')
}

function renderPaging() {
  let container = document.getElementById('framesContainer')
  if (!container) return
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
