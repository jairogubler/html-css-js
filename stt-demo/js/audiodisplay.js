function drawBuffer( width, height, context, data ) {
    var step = Math.ceil( data.length / width );
    var amp = height / 2;
    context.fillStyle = "silver";
    context.clearRect(0,0,width,height);
    for(var i=0; i < width; i++){
        var min = 1.0;
        var max = -1.0;
        for (j=0; j<step; j++) {
            var datum = data[(i*step)+j]; 
            if (datum < min)
                min = datum;
            if (datum > max)
                max = datum;
        }
        context.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
    }
}

function clearPlayPosition (width, height, context, data, lastPosX) {
   if (lastPosX && data) {
      var step = Math.ceil( data.length / width );
      var amp = height / 2;
      var min = 1.0;
      var max = -1.0;
      for (j=0; j< step; j++) {
        var datum = data[(lastPosX * step) + j];
        if (datum < min)
           min = datum;
        if (datum > max)
            max = datum;
      }
      context.clearRect(lastPosX,0,1, height);
      context.fillStyle = "silver";
      context.fillRect(lastPosX,(1+min)*amp,1,Math.max(1,(max-min)*amp));
   }
}

function drawPlayPosition ( width, height, context, data, length, newPosition, lastPosX) {
    if (context && length && length > 0 && newPosition && width && width > 0) {
       var posx = Math.ceil(width * newPosition / length);
       context.fillStyle = "red";
       context.fillRect(posx,0,1,height);

       clearPlayPosition (width, height, context, data, lastPosX);
       return posx;
    }
    return null;
}
