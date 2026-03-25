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