 var express = require("express");
 var app = express();
 var http = require('http'); // requisição HTTP
 var fs = require('fs');     // para ver o tamanho do arquivo e ler o arquivo
var util = require('util');
 
 /* serves main page */
 app.get("/", function(req, res) {
    res.sendFile( __dirname +'/index.html')
 });
 
  app.post("/process", function(req, res) { 
     //http://stt.linse.ufsc.br/process
     var audio = '';
     var headerFlag = true;
     req.on('data', function (raw) {
        console.log('recebi ', raw.length);

        audio += raw.toString('binary', 0, raw.length);
        console.log('actual file size: ' + audio.length);
/*
var i = 0;
    while (i < raw.length)
      if (headerFlag) {
        var chars = raw.slice(i, i+4).toString();
        if (chars === '\r\n\r\n') {
          headerFlag = false;
          header = raw.slice(0, i+4).toString();
          console.log('header length: ' + header.length);
          console.log('header: ');
          console.log(header);
          i = i + 4;
          console.log('header done');
        }
        else {
          i += 1;
        }
      }
      else { 
        // parsing body including footer
        audio += raw.toString('binary', i, raw.length);
        i = raw.length;
        console.log('actual file size: ' + audio.length);
      }
*/
     });
     req.on('end', function() {
        var requestType = req.get('Content-Type'); 
        var fileType = '';
        if (requestType == 'audio/mpeg')
           fileType = '.mp3';
        else if (requestType = 'audio/wav')
           fileType = '.wav';
        fs.writeFile( 'audio/'+ new Date().toISOString() + fileType, audio, 'binary', function(err) {
        }); 
        console.log('end:', audio.length);
        var options = { 
/*                    path : 'http://localhost:8000/process', */
                    path : 'https://q4scms0fyk.execute-api.sa-east-1.amazonaws.com/BETA/process/',
                    method: 'POST',
                    headers : {
                                'Content-Type': requestType,
                                'Content-Length': audio.length
                              }
                   };


         var body='';
         console.log("options: ", JSON.stringify(options));
         var request = http.request(options, function(response) {
              response.on('data', function (chunk) {
                  body += chunk;
              });

              response.on('end',function() {
                  console.log('end: ' + body);
                  var result = null;
                  var err = null;
                  try{
                    result = JSON.parse(body);
                    res.send(result);
                  }catch(e){
                    console.log("erro no parse");
                    res.send(e);
                  }
              });
         });

         request.on('error', function(e) {
              console.log('problem with request: ' + JSON.stringify(e));
         });
         console.log("enviando... " + audio.length + " bytes");

/*
         fs.createReadStream("audio.wav", { bufferSize: 64 * 1024 })
             .on('end', function () {
                  request.end();
                })
             .pipe(request, { end : false } );
*/

         request.end(audio, 'binary', function (err) {
                 if (err)
                   console.log("falha no envio");
                 else
                   console.log("envio do arquivo finalizado");
         });
       });
  });
 
 /* serves all the static files */
 app.get(/^(.+)$/, function(req, res){ 
     console.log('static file request : ' + JSON.stringify(req.params));
     res.sendFile( __dirname + req.params[0]); 
 });
 app.use(error);

function error(err, req, res, next) {
    // log it
    console.error('error: ', JSON.stringify(err.stack));

    // respond with 500 "Internal Server Error".
    res.send(500);
}

 
 var rimraf = require('rimraf');
 rimraf('audio/', function() {
         fs.mkdir('audio', function () { 
         });
 });
 

 var port = process.env.PORT || 5000;
 app.listen(port, '::0', function() {
   console.log("Listening on " + port);
 });
