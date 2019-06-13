/// <reference path="../../../node_modules/@types/openpgp/index.d.ts" />
/// <reference path="../../../node_modules/@types/pako/index.d.ts" />

const pub_pgp = ''
let key: openpgp.key.Key[]
init()

function sendFile(){
    const input = document.getElementById('file') as HTMLInputElement
    const file = input.files![0]
    
    if(file){
        const reader = new FileReader()
        reader.onload = () => { 
            const msg = openpgp.message.fromBinary(new Uint8Array(reader.result as ArrayBuffer))
            encrypt(msg, file.name)
        }
        reader.readAsArrayBuffer(file)
    }
}

function sendMsg(){
    const input = document.getElementById('msgBox')! as HTMLInputElement
    const content = input.value.trim()

    if(content.length > 0) {
        const msg = openpgp.message.fromText(content)
        encrypt(msg, makeid(10) + '.txt')
    }
}

function init(){    
    openpgp.key.readArmored(pub_pgp).then(pubKeyObj => {
        key = pubKeyObj.keys
    })
}

function encrypt(msg: openpgp.message.Message, name: string){
    const options: openpgp.EncryptOptions = { message: msg, publicKeys: key, armor: true }

    openpgp.encrypt(options).then(ciphertext => {
        postData({ content:  ciphertext.data, name })
    })
}

function postData(data: object){
    const toast = document.getElementById('toast') as HTMLDivElement

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

        setTimeout(() => {
            toast.innerHTML = ''
            toast.className = ''
        }, 4000)
    })
}

function makeid(length: number) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
 }
