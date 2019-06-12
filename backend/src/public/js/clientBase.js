
let key = null;
init()

function sendFile(){
    const file = document.getElementById("file").files[0];
    
    if(file){
        const reader = new FileReader();
        reader.onload = () => { 
            const msg = openpgp.message.fromBinary(new Uint8Array(reader.result))
            encrypt(msg, file.name)
        }
        reader.readAsArrayBuffer(file);
    }
}

function sendMsg(){
    const content = document.getElementById("msgBox").value.trim();
    if(content.length > 0) {
        const msg = openpgp.message.fromText(content)
        encrypt(msg, makeid(10) + ".txt")
    }
}

function init(){    
    openpgp.key.readArmored(pub_pgp).then(pubKeyObj => {
        key = pubKeyObj.keys
    })
}

function encrypt(msg, name){
    const options = { message: msg, publicKeys: key, armor: true }

    openpgp.encrypt(options).then(ciphertext => {
        postData({ content:  ciphertext.data, name })
    })
}

function postData(data){
    const toast = document.getElementById("toast")

    fetch('memos/', { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json', 'Content-Encoding': 'gzip' },
        body: pako.gzip(JSON.stringify(data))
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

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
 }
