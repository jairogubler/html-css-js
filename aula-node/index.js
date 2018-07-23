let a = 10;
let b = 20;
let c = a + b;
console.log(`o resultado da soma de a+b é ${c}`); 

function minhafuncao() {
    console.log("olá mundo");
}

function somar(a,b) {
    return a+b;
}

minhafuncao();

let resultado = somar(30,20);
console.log(resultado);

let referencia = somar;
console.log(referencia(40,15));

let funcaoX = function (a, b) {
  console.log(a+b)
  return function (c,d) {
      return a*b*c*d;
  }
}

let resultado1 = funcaoX(20,15);
let resultado2 = funcaoX(10,20);
console.log(resultado1(10,10));
console.log(resultado2(10,10));

function fluxo (a, b) {
    if (a > b) {
      console.log("a é maior que b");
    }
    else if (a === b) {
        console.log("iguais");
    }
    else {
        console.log("a é menor que b");
    }
}

fluxo(1,"1");