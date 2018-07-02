   window.AudioContext = window.AudioContext || window.webkitAudioContext;

  var audioContext = new AudioContext();
  var audioInput = null,
      realAudioInput = null,
      inputPoint = null;
  var rafID = null;
  var analyserContext = null;
  var canvasWidth, canvasHeight;
  var audio_context;
  var recorder;
  var recid = 0;

  function __log(e, data) {
    log.innerHTML += "\n" + e + " " + (data || '');
  }

  function clickOnWord(au, event){
      if (au && event && event.target) {
          var position = event.target.getAttribute('data-begin')
          if (position)
            au.currentTime = position;
      }
  }


  function formataTexto(resposta, paragraphText, div, au) {
    if (resposta && resposta.parts) {
     for (var i = 0; i < resposta.parts.length; i++) {
         var part = resposta.parts[i];
         if (part && part.words) {
           for (var w = 0; w < part.words.length; w++) {
             var word = part.words[w];
             if (word) {
               var span = document.createElement('span');
               var text = document.createTextNode(word.word + ' ');
               if (word.score < 1) {
                 span.setAttribute('class','textred');
               }
               else
                 span.setAttribute('class','textblack');
               span.title = word.score;
               span.appendChild(text);
               span.setAttribute('data-begin', word.begin);
               span.setAttribute('data-end', word.end);
               span.setAttribute('id', div['data-id'] + '-p'+ i + '-w' + w);
               span.onclick = function (event) { 
                       clickOnWord(au, event);
               };
               paragraphText.appendChild(span);
             }
           }
           paragraphText.appendChild(document.createElement('br'));
         }
      }
    }
  }


  function atualizaTempoPlay(div, au, lastPos, canvas, data) {
    if (!lastPos)
        lastPos = {};
    if (canvas) {
      lastPos.posX = drawPlayPosition(canvas.width,canvas.height, canvas.getContext('2d'), data, au.duration, au.currentTime, lastPos.posX );
    }

    var newSelected = null;
    var lastSelected = null;
    if (lastPos && lastPos.wordSelected) {
        newSelected = lastPos.wordSelected;
        lastSelected = lastPos.wordSelected;
    }
    if (div && div['data-json'] && div['data-id']) {
       var resposta = JSON.parse(div['data-json']);
       if (resposta && resposta.parts) {
         for (var i = 0; i < resposta.parts.length; i++) {
             var part = resposta.parts[i];
             if (part && part.words) {
               for (var w = 0; w < part.words.length; w++) {
                   var word = part.words[w];
                   if (word && au.currentTime >= word.begin && au.currentTime <= word.end) {
                     var id = div['data-id'] + '-p'+ i + '-w' + w;
                     newSelected = document.getElementById(id);
                     if (newSelected && newSelected != lastSelected) {
                       var classe = newSelected.getAttribute('class').replace('textnormal','').replace('textbold','').trim() + ' textbold';
                       newSelected.setAttribute('class', classe);
                       if (lastSelected) {
                           setTimeout( function () { 
                             classe = lastSelected.getAttribute('class').replace('textnormal','').replace('textbold','').trim() + ' textnormal';
                             lastSelected.setAttribute('class', classe);
                             }, 100);
                       }
                     }
                   }
               }
             }
         }
       }
    }
    lastPos.wordSelected = newSelected;
    return lastPos;
  }

  function processaResposta(resposta) {
      var texto = '';
      if (! resposta || ! resposta.parts)
          return texto;

      for (var i = 0; i < resposta.parts.length; i++) {
          var part = resposta.parts[i];
          if (part && part.words) {
            for (var w = 0; w < part.words.length; w++) {
                var word = part.words[w];
                if (texto.length > 0)
                    texto += ' ';
                if (word.score == 1) 
                    texto += word.word;
                else {
                    texto += '[' + word.word + '](' + (Math.trunc(word.score * 100)/100)  + ')';
                }
            }
          }
      }
      return texto;
  }

  function createLoadedFileLink(blob, file) {
      var fileType = blob.type;
      if (blob.type == 'audio/mp3')
          fileType = 'audio/mpeg';
      
      var url = URL.createObjectURL(blob);
      var li = document.createElement('li');
      var div = document.createElement('div');
      var au = document.createElement('audio');
      var hf = document.createElement('a');
      
      recid++;
      div['data-id'] = recid;
      div.id = "record";
      li.appendChild(div);
      au.controls = true;
      au.src = url;
      hf.href = url;
      hf.download = file.name
      hf.innerHTML = hf.download;
      div.appendChild(au);
      div.appendChild(hf);

      var paragraphText = document.createElement('p');
      paragraphText.setAttribute('style', 'font-size:20px');
      var msg = document.createTextNode('processando...');
      paragraphText.appendChild(msg);
      div.appendChild(paragraphText);

      if (recordingslist.childNodes.length > 0)
        recordingslist.insertBefore(li, recordingslist.childNodes[0]);
      else
        recordingslist.appendChild(li);

      var playPosition = null;
      au.ontimeupdate = function() { 
          playPosition = atualizaTempoPlay(div, au, playPosition, null, null);
      };
      au.onended = function () {
          if (playPosition && playPosition.wordSelected) {
             var palavraDestacada = playPosition.wordSelected;
             palavraDestacada.setAttribute('class', palavraDestacada.getAttribute('class').replace('textbold', 'textnormal'));
          }
      }

        var request = new XMLHttpRequest();
        request.onreadystatechange= function () {
          if (request.readyState==4) {
            paragraphText.removeChild(msg);
             var resposta = null;
             __log('recebeu resposta: ', request.responseText);
             try { 
                var resposta = JSON.parse(request.responseText);
                if (resposta.parts) {
                   if (div)     
                       div['data-json'] = JSON.stringify(resposta);
                   formataTexto(resposta, paragraphText, div, au);
                }
                else
                   paragraphText.appendChild(document.createTextNode(request.responseText));
                
             }
             catch(e) {
               paragraphText.appendChild(document.createTextNode(request.responseText));
             }
          }
        }
/*        request.open("POST", "/process", true); */
        var url = '/process';
        var stturl = document.getElementById("stt-url");
        if (stturl) {
            url = stturl.options[stturl.selectedIndex].value;
        }
      __log('enviando para stt em ' + url);
        request.open("POST", url, true);
        request.setRequestHeader("Content-Type", fileType);
        request.setRequestHeader("Accept","text/plain");
        request.send( blob  );
  };

  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

      __log('file type ' + f.type);
      if (!f.type.match('audio*')) {
        continue;
      }

      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          var blob = new Blob([e.currentTarget.result ], {type: theFile.type})
          createLoadedFileLink(blob, theFile) 
        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsArrayBuffer(f);
    }
  }

  var botao_gravando = false;
  function botao_start_stop (button) {
      var button = document.getElementById('start_stop');
      var mic = document.getElementById('record');
      if (botao_gravando) { 
        botao_gravando = false;
        mic.classList.remove("recording");
        button.innerHTML = "Iniciar grava&ccedil;&atilde;o";
        stopRecording(button);
      }
      else {
        botao_gravando = true;
        button.innerHTML = "Parar grava&ccedil;&atilde;o";
        mic.classList.add("recording");
        startRecording(button);
      }
  } 

  
  function updateAnalysers(time) {
      if (!analyserContext) {
          var canvas = document.getElementById("analyser");
          canvasWidth = canvas.width;
          canvasHeight = canvas.height;
          analyserContext = canvas.getContext('2d');
      }

      // analyzer draw code here
      {
          var SPACING = 3;
          var BAR_WIDTH = 1;
          var numBars = Math.round(canvasWidth / SPACING);
          var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

          analyserNode.getByteFrequencyData(freqByteData);

          analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
          analyserContext.fillStyle = '#F6D565';
          analyserContext.lineCap = 'round';
          var multiplier = analyserNode.frequencyBinCount / numBars;

          // Draw rectangle for each frequency bin.
          for (var i = 0; i < numBars; ++i) {
              var magnitude = 0;
              var offset = Math.floor( i * multiplier );
              // gotta sum/average the block, or we miss narrow-bandwidth spikes
              for (var j = 0; j< multiplier; j++)
                  magnitude += freqByteData[offset + j];
              magnitude = magnitude / multiplier;
              var magnitude2 = freqByteData[i * multiplier];
              analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
              analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
          }
      }
      rafID = window.requestAnimationFrame( updateAnalysers );
  }


  function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    //
    inputPoint = audio_context.createGain();
    input.connect(inputPoint);
    analyserNode = audio_context.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );
    // 

    __log('Media stream created.');

    // Uncomment if you want the audio to feedback directly
    //input.connect(audio_context.destination);
    //__log('Input connected to audio context destination.');
    
    //recorder = new Recorder(inputPoint);
    recorder = new Recorder(input, { numChannels : 1} );
    __log('Recorder initialised.');
 
    //
    zeroGain = audio_context.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audio_context.destination );
    updateAnalysers();
  }

  function startRecording(button) {
    recorder && recorder.record();
    //button.disabled = true;
    //button.nextElementSibling.disabled = false;
    __log('Recording...');
  }

       

  function stopRecording(button) {
    recorder && recorder.stop();
    //button.disabled = true;
    //button.previousElementSibling.disabled = false;
    __log('Stopped recording.');
    
    // create WAV download link using audio data blob
    createDownloadLink();
    
  }


  function createDownloadLink(fnDone) {
    recorder && recorder.exportWAV(function(blob) {
      var url = URL.createObjectURL(blob);
      var li = document.createElement('li');
      var div = document.createElement('div');
      var au = document.createElement('audio');
      var hf = document.createElement('a');
      
      recid++;
      div['data-id'] = recid;
      div.id = "record";
      li.appendChild(div);
      au.controls = true;
      au.src = url;
      hf.href = url;
      hf.download = new Date().toISOString() + '.wav';
      hf.innerHTML = hf.download;
      div.appendChild(au);
      div.appendChild(hf);

      var paragraphText = document.createElement('p');
      paragraphText.setAttribute('style', 'font-size:20px');
      var msg = document.createTextNode('processando...');
      paragraphText.appendChild(msg);
      div.appendChild(paragraphText);

      if (recordingslist.childNodes.length > 0)
         recordingslist.insertBefore(li, recordingslist.childNodes[0]);
      else
         recordingslist.appendChild(li);

      recorder.getBuffer(function (buffers) { 
         recorder.clear();
         var divc = document.createElement('div');
         var canvas = document.createElement('canvas');
         canvas.id = 'wavedisplay';
         canvas.width = 800;
         canvas.heigth = 300;
         divc.appendChild(canvas);
         div.appendChild(divc);
         drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );

         var playPosition = null;
         au.ontimeupdate = function() { 
             playPosition = atualizaTempoPlay(div, au, playPosition, canvas, buffers[0]);
         };
         au.onended = function () {
             if (playPosition) {
                if (playPosition.wordSelected) {
                  var palavraDestacada = playPosition.wordSelected;
                  palavraDestacada.setAttribute('class', palavraDestacada.getAttribute('class').replace('textbold', 'textnormal'));
                }
                if (playPosition.posX)
                   clearPlayPosition(canvas.width, canvas.height, canvas.getContext('2d'), buffers[0], playPosition.posX);
                 
             }
         }
         canvas.addEventListener("mousedown", function (event) { 
              var x = event.x- canvas.offsetLeft;
              if (x >=0 && x <= canvas.width) {
                  au.currentTime= x * au.duration / canvas.width;
              }
         }, false);

      });

      __log('enviando para stt.');

        var request = new XMLHttpRequest();
        request.onreadystatechange= function () {
          if (request.readyState==4) {
             paragraphText.removeChild(msg);
             var resposta = null;
             __log('recebeu resposta: ', request.responseText);
             try { 
                var resposta = JSON.parse(request.responseText);
                if (resposta.parts) {
                   if (div)     
                       div['data-json'] = JSON.stringify(resposta);
                   formataTexto(resposta, paragraphText, div, au);
                }
                else
                   //text.value = request.responseText;
                   paragraphText.appendChild(document.createTextNode(request.responseText));
             }
             catch(e) {
               //text.value = request.responseText;
               paragraphText.appendChild(document.createTextNode(resposta.responseText));
             }
          }
        }
        request.open("POST", "/process", true);
        request.setRequestHeader("Content-Type", "audio/wav");
        request.setRequestHeader("Accept","text/plain");
        request.send( blob );
    });
  }

  window.onload = function init() {
    var getUserMedia = null;
    try {
      // webkit shim
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      window.URL = window.URL || window.webkitURL;
      
      audio_context = new AudioContext;
      __log('Audio context set up.');
      __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
      alert('No web audio support in this browser!');
    }
    
    navigator.mediaDevices.getUserMedia({audio: true}, startUserMedia, function(e) {
      __log('No live audio input: ' + e);
    });
  };

  function logCheckBoxChanged(cb) {
    var log = document.getElementById('div-log'); 
    if (cb.checked) { 
      log.style = "display:block";
    } else { 
      log.style = "display:none";
    }
  }
