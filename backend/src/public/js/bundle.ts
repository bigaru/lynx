/// <reference path="../../../node_modules/@types/openpgp/index.d.ts" />
/// <reference path="../../../node_modules/@types/pako/index.d.ts" />

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
