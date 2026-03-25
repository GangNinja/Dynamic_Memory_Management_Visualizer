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

document.getElementById("fragmentation").innerText=
"Total Free Memory: "+totalFree

}