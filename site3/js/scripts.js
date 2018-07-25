
function getIP() {
    var paragrafo = $(".modal-body p");
    paragrafo.html("Consultando IP");

    var xhr = new XMLHttpRequest();
    let result = xhr.open('GET', "https://ipinfo.io/json", true);
    xhr.send();
    xhr.addEventListener("readystatechange", processRequest, false);

    function processRequest(e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            paragrafo.html("Seu IP é " + response.ip);
        }
    }

}


/*
document.querySelector(".gatilho-modal").addEventListener("click", exibirModal);
document.querySelector(".btn-close").addEventListener("click", fecharModal);
document.querySelector(".btn-x").addEventListener("click", fecharModal);
document.querySelector(".btn-save").addEventListener("click", teste); 
*/

$(".gatilho-modal").on("click", function (event) {
    /*    document.querySelector(".modal").style.display = "block"; */
    $(".modal").css('display', 'block');
});


$(".btn-close, .btn-x").on("click", function (event) {
    $(".modal").css({ 'display': 'none' });
});

$(".btn-save").on("click", getIP);


//  window.addEventListener("load", function () {

$(document).ready(function () {
    let customBackground = $(".custom-background");
    let contador = 1;
    setInterval(function () {
        customBackground.css("background", `url(img/background${contador}.jpg) no-repeat`);
        customBackground.css("background-size", "cover");
        contador = (contador + 1) % 6;
    }, 4000);
});

