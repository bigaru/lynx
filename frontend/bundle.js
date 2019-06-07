window.$ = window.jQuery = require('jquery');
window.Bootstrap = require('bootstrap');

function setData(data){
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

const URL = 'http://localhost'

fetch(URL + '/posts/')
    .then(res => 
        res.json()
            .then(setData))