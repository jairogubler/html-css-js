function exibirModal(event) {
    document.querySelector(".modal").style.display = "block";
}

function fecharModal(event) {
    document.querySelector(".modal").style.display = "none";
}

function teste() {
    var xhr = new XMLHttpRequest();
    let result = xhr.open('GET', "https://ipinfo.io/json", true);
    xhr.send();
    xhr.addEventListener("readystatechange", processRequest, false);

    function processRequest(e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            alert(response.ip);
        }
    
    }
    
}


document.querySelector(".gatilho-modal").addEventListener("dblclick", exibirModal);
/*document.querySelector(".btn-close").addEventListener("dblclick", fecharModal); */
document.querySelector(".btn-close").addEventListener("blur", fecharModal);
document.querySelector(".btn-x").addEventListener("keypress", fecharModal);
/*document.querySelector(".btn-save").addEventListener("dblclick", fecharModal); */
document.querySelector(".btn-save").addEventListener("click", teste); 


window.addEventListener("load", function () {
  let customBackground = document.querySelector(".custom-background");
  let contador = 0;
  setInterval(function () {
      if (contador == 0) {
          customBackground.style.background = "url(img/background.jpg) no-repeat";
      }
      else {
          customBackground.style.background = `url(img/background${contador}.jpg) no-repeat`;
      }
      contador = (contador +1) %4;
  }, 5000);
});

