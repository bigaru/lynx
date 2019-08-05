/// <reference path="../../../node_modules/@types/openpgp/index.d.ts" />
/// <reference path="../../../node_modules/@types/pako/index.d.ts" />

document.addEventListener('DOMContentLoaded', event => { 
    const btnSendMsg = document.getElementById('btnSendMsg')
    const btnSendFile = document.getElementById('btnSendFile')
    
    if (btnSendMsg) btnSendMsg.addEventListener('click', sendMsg)
    if (btnSendFile) btnSendFile.addEventListener('click', sendFile)

    document.getElementById('slider')!.addEventListener('change', (event:any) => {
        const val = event.target.value;
        const cube = document.getElementById('cube')!;
        cube.style.left = val + 'px';
    })
})

function XOR_hex(a: any, b: any) {
    var res = "",
        l = Math.max(a.length, b.length);
    for (var i=0; i<l; i+=4)
        res = ("000"+(parseInt(a.slice(-i-4, -i||a.length), 16) ^ parseInt(b.slice(-i-4, -i||b.length), 16)).toString(16)).slice(-4) + res;
    return res;
}

type Message = openpgp.message.Message
type Key = openpgp.key.Key[]

class CryptoHelper{
    private key: Key

    constructor(){
        openpgp.key.readArmored(pub_pgp).then(pubKeyObj => {
            this.key = pubKeyObj.keys
        })
    }

    encryptMessage = (buffer: Uint8Array | string) => {
        let msg: Message
        
        if(typeof buffer === 'string') msg = openpgp.message.fromText(buffer)
        else                           msg = openpgp.message.fromBinary(buffer)
        
        return this.encrypt(msg);
    }

    private encrypt = (msg: Message): Promise<string> => {
        const options: openpgp.EncryptOptions = { 
            message: msg,
            publicKeys: this.key,
            armor: true 
        }

        return openpgp.encrypt(options).then(ciphertext => ciphertext.data)
    }
}

const pub_pgp = ''
let key: openpgp.key.Key[]

const cryptoHelper = new CryptoHelper()

const postMsg = (name: string) => (msg: string) => {
    const httpBody = { content: msg, name }
    const toast = document.getElementById('toast') as HTMLDivElement

    fetch('memos/', { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json', 'Content-Encoding': 'gzip' },
        body: pako.gzip(JSON.stringify(httpBody))
    })
    .then(response => {
        if(response.status === 201){ 
            toast.textContent = 'message successfully transmitted'
            toast.className = 'alert alert-success'
        }
        else{
            toast.textContent = 'failed'
            toast.className = 'alert alert-danger'
        }

        setTimeout(() => {
            toast.textContent = ''
            toast.className = ''
        }, 4000)
    })
}

function sendFile(){
    const input = document.getElementById('file') as HTMLInputElement
    
    if(input.files && input.files[0]){
        const file = input.files![0]
        const reader = new FileReader()

        reader.onload = () => { 
            const binary = new Uint8Array(reader.result as ArrayBuffer)
            const postMsgWithName = postMsg(file.name)
            
            cryptoHelper.encryptMessage(binary)
                        .then(postMsgWithName)
        }

        reader.readAsArrayBuffer(file)
    }
}

function sendMsg(){
    const input = document.getElementById('msgBox')! as HTMLInputElement
    const content = input.value.trim()

    if(content.length > 0) {
        const postMsgWithName = postMsg(makeid(10) + '.txt')

        cryptoHelper.encryptMessage(content)
                    .then(postMsgWithName)
    }
}

function makeid(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const randFn = () => characters.charAt(Math.floor(Math.random() * characters.length))

    return Array.from(Array(length), randFn)
                .reduce((a, b) => a + b)
}
