window.$ = window.jQuery = require('jquery');
window.Bootstrap = require('bootstrap');
window.speakeasy = require("speakeasy")

function loadIncomings(data){
    $('#incoming-body').html("")

    for(let d of data){
        $('#incoming-body').append(`
        <tr>
            <td>${d._id}</td>
            <td>${d.name}</td>
            <td></td>
        </tr>
        `)
    }
}


const shared_totp = 'ig3t 76td vmok rffh iqgh 7kx5 kp2c ons6'
var token = speakeasy.totp({
    secret: shared_totp,
    encoding: 'base32'
  });

const myHeaders = new Headers();
myHeaders.append('Authorization', token);

const URL = 'http://localhost'
const getIncomings = new Request(URL + '/posts/', { method: 'GET', headers: myHeaders })

fetch(getIncomings)
    .then(res => 
        res.json()
            .then(loadIncomings)
        )
