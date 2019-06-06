
let key = null;

function sendFile(){
    const file = document.getElementById("file").files[0];
    
    if(file){
        const reader = new FileReader();
        reader.onload = () => start(reader.result);
        reader.readAsArrayBuffer(file);
    }
}

function sendMsg(){
    const content = document.getElementById("msgBox").value.trim();
    if(content.length > 0) start(content);
}

function start(content){
    if(!key) loadKey(content);
    else     encrypt(content);
}

function loadKey(msg){
    kbpgp.KeyManager.import_from_armored_pgp({armored: pub_pgp}, (err, p_key) => {
        if (!err) {
            key = p_key;
            encrypt(msg);
        }
    });
}

function encrypt(msg){
    kbpgp.box({ msg, encrypt_for: key }, (err, result_string, result_buffer) => {
        console.log(result_string)
    });
}