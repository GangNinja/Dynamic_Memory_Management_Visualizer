function firstFit(pid,size){

for(let i=0;i<memory.length;i++){

let block = memory[i]

if(block.status=="free" && block.size>=size){

allocateBlock(i,pid,size)
return true
}

}

return false
}



function bestFit(pid,size){

let bestIndex=-1
let minDiff=Infinity

for(let i=0;i<memory.length;i++){

let block=memory[i]

if(block.status=="free" && block.size>=size){

let diff=block.size-size

if(diff<minDiff){
minDiff=diff
bestIndex=i
}

}

}

if(bestIndex!=-1){
allocateBlock(bestIndex,pid,size)
return true
}

return false
}



function worstFit(pid,size){

let worstIndex=-1
let maxDiff=-1

for(let i=0;i<memory.length;i++){

let block=memory[i]

if(block.status=="free" && block.size>=size){

let diff=block.size-size

if(diff>maxDiff){
maxDiff=diff
worstIndex=i
}

}

}

if(worstIndex!=-1){
allocateBlock(worstIndex,pid,size)
return true
}

return false
}

// Paging Algorithms - return {faults, frames, trace}
function fifoPaging() {
  let queue = []
  let localFrames = [...frames]
  let localFaults = 0
  let localTrace = []
  
  for(let i = 0; i < refs.length; i++) {
    let page = refs[i]
    let fault = true
    let frameIdx = localFrames.indexOf(page)
    
    if (frameIdx !== -1) {
      fault = false
    } else if (localFrames.some(f => f === -1)) {
      let emptyIdx = localFrames.indexOf(-1)
      localFrames[emptyIdx] = page
    } else {
      let victim = queue.shift()
      let victimIdx = localFrames.indexOf(victim)
      localFrames[victimIdx] = page
    }
    
    queue.push(page)
    if (fault) localFaults++
    localTrace.push({
      ref: page,
      frames: [...localFrames],
      fault: fault ? 'FAULT' : 'HIT'
    })
  }
  
  return {faults: localFaults, frames: localFrames, trace: localTrace}
}

function lruPaging() {
  let localFrames = [...frames]
  let localFaults = 0
  let localTrace = []
  let useOrder = []
  
  for(let i = 0; i < refs.length; i++) {
    let page = refs[i]
    let frameIdx = localFrames.indexOf(page)
    let fault = frameIdx === -1
    
    if (fault) {
      if (localFrames.some(f => f === -1)) {
        let emptyIdx = localFrames.indexOf(-1)
        localFrames[emptyIdx] = page
        useOrder.push(page)
      } else {
        // Find LRU
        let lruPage = useOrder[0]
        let lruIdx = localFrames.indexOf(lruPage)
        localFrames[lruIdx] = page
        useOrder.shift()
        useOrder.push(page)
      }
      localFaults++
    } else {
      // Update use order
      useOrder = useOrder.filter(p => p !== page)
      useOrder.push(page)
    }
    
    localTrace.push({
      ref: page,
      frames: [...localFrames],
      fault: fault ? 'FAULT' : 'HIT'
    })
  }
  
  return {faults: localFaults, frames: localFrames, trace: localTrace}
}

function optimalPaging() {
  let localFrames = [...frames]
  let localFaults = 0
  let localTrace = []
  
  for(let i = 0; i < refs.length; i++) {
    let page = refs[i]
    let frameIdx = localFrames.indexOf(page)
    let fault = frameIdx === -1
    
    if (fault) {
      if (localFrames.some(f => f === -1)) {
        let emptyIdx = localFrames.indexOf(-1)
        localFrames[emptyIdx] = page
      } else {
        // Find page with farthest next use
        let farthestIdx = -1
        let maxDist = -1
        for(let j = 0; j < localFrames.length; j++) {
          let p = localFrames[j]
          let nextUse = refs.slice(i+1).indexOf(p)
          if (nextUse === -1) nextUse = Infinity
          if (nextUse > maxDist) {
            maxDist = nextUse
            farthestIdx = j
          }
        }
        localFrames[farthestIdx] = page
      }
      localFaults++
    }
    
    localTrace.push({
      ref: page,
      frames: [...localFrames],
      fault: fault ? 'FAULT' : 'HIT'
    })
  }
  
  return {faults: localFaults, frames: localFrames, trace: localTrace}
}
