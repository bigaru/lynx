/// <reference path="../../../node_modules/@types/openpgp/index.d.ts" />
/// <reference path="../../../node_modules/@types/pako/index.d.ts" />

let response: string;

document.addEventListener('DOMContentLoaded', event => { 
    const btnSendMsg = document.getElementById('btnSendMsg')
    const btnSendFile = document.getElementById('btnSendFile')
    
    if (btnSendMsg) btnSendMsg.addEventListener('click', sendMsg)
    if (btnSendFile) btnSendFile.addEventListener('click', sendFile)

    document.getElementById('slider')!.addEventListener('input', (event:any) => {
        let val = event.target.value;
        const cube = document.getElementById('cube')!;
        cube.style.left = val + 'px';
        
        response = val;
    })
})

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

    document.cookie = "Captcha-Response="+response

    fetch('memos/', { 
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
            'Content-Encoding': 'gzip',
        },
        body: pako.gzip(JSON.stringify(httpBody))
    })
    .then(response => {
        if(response.status === 201){ 
            (document.getElementById('slider')! as HTMLInputElement).value = '0';
            location.reload(); 
        }
        else if(response.status === 400){
            toast.textContent = 'wrong captcha'
            toast.className = 'alert alert-warning'
        }
        else{
            toast.textContent = 'failed'
            toast.className = 'alert alert-danger'
        }
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
