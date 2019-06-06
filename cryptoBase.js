
let key = null;

function sendFile(){
    const file = document.getElementById("file").files[0];
    
    if(file){
        const reader = new FileReader();
        reader.onload = () => start(reader.result, file.name);
        reader.readAsArrayBuffer(file);
    }
}

function sendMsg(){
    const content = document.getElementById("msgBox").value.trim();
    if(content.length > 0) start(content, ".txt");
}

function start(content, name){
    if(!key) loadKey(content, name);
    else     encrypt(content, name);
}

function loadKey(msg, name){
    kbpgp.KeyManager.import_from_armored_pgp({armored: pub_pgp}, (err, p_key) => {
        if (!err) {
            key = p_key;
            encrypt(msg, name);
        }
    });
}

function encrypt(msg, name){
    kbpgp.box({ msg, encrypt_for: key }, (err, result_string, result_buffer) => {
        postData({ content: result_string, name })
    });
}

function postData(data){
    const toast = document.getElementById("toast")

    fetch('posts/', { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
    })
    .then(response => {
        if(response.status === 201){ 
            toast.innerHTML = 'message successfully transmitted'
            toast.className = 'alert alert-success'
        }
        else{
            toast.innerHTML = 'failed'
            toast.className = 'alert alert-danger'
        }
    })
}
