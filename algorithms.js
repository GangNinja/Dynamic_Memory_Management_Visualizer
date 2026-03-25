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