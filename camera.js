// camera.js - recursos da camera e da galeria
// Projeto Cafe Mobile - Dia 4

const areaCamera = document.querySelector('#area-camera');
const video = document.querySelector('#video');
const canvas = document.querySelector('#canvas');
const btnLigarCamera = document.querySelector('#btn-ligar-camera');
const btnFoto = document.querySelector('#btn-foto');
const btnTrocarCamera = document.querySelector('#btn-trocar-camera');
const inputFoto = document.querySelector('#input-foto');
const galeria = document.querySelector('#galeria');
const contadorFotos = document.querySelector('#contador-fotos');

let camera = null;
let cameraAtual = 'environment';

// Abre a camera do celular
function ligarCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    mostrarAviso('A camera precisa de HTTPS para funcionar.');
    return;
  }

  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: cameraAtual,
      width: { ideal: 1080 }
    },
    audio: false
  }).then(function (stream) {
    camera = stream;
    video.srcObject = camera;
    video.play();
    areaCamera.classList.add('ligada');
    btnFoto.disabled = false;
    btnTrocarCamera.disabled = false;
    btnLigarCamera.textContent = 'Desligar camera';
  }).catch(function (erro) {
    if (erro.name === 'NotAllowedError' || erro.name === 'PermissionDeniedError') {
      mostrarAviso('Permissao negada. Libere a camera nas configuracoes do site.');
      document.querySelector('#ajuda-permissao').hidden = false;
    } else {
      mostrarAviso('Nao foi possivel abrir a camera.');
    }
  });
}

// Fecha a camera
function desligarCamera() {
  if (camera) {
    camera.getTracks().forEach(function (faixa) {
      faixa.stop();
    });
  }

  camera = null;
  video.srcObject = null;
  areaCamera.classList.remove('ligada');
  btnFoto.disabled = true;
  btnTrocarCamera.disabled = true;
  btnLigarCamera.textContent = 'Ligar camera';
}

btnLigarCamera.addEventListener('click', function () {
  if (camera) {
    desligarCamera();
  } else {
    ligarCamera();
  }
});

// Troca entre camera da frente e de tras
btnTrocarCamera.addEventListener('click', function () {
  if (cameraAtual === 'environment') {
    cameraAtual = 'user';
  } else {
    cameraAtual = 'environment';
  }
  desligarCamera();
  ligarCamera();
});

// Carrega as fotos que ja foram salvas
let fotos = [];
let fotosSalvas = localStorage.getItem('fotos');
if (fotosSalvas) {
  fotos = JSON.parse(fotosSalvas);
}

function salvarFotos() {
  localStorage.setItem('fotos', JSON.stringify(fotos));
}

// Pede uma legenda antes de salvar
function pedirLegenda() {
  let legenda = prompt('Legenda da foto:');
  if (legenda === null || legenda.trim() === '') {
    legenda = 'Sem legenda';
  }
  return legenda;
}

// Guarda a foto com largura de 1080 e qualidade 0.95
function guardarFoto(imagem, larguraOriginal, alturaOriginal, legenda) {
  let largura = 1080;
  let altura = (alturaOriginal / larguraOriginal) * largura;

  canvas.width = largura;
  canvas.height = altura;

  let contexto = canvas.getContext('2d');
  contexto.drawImage(imagem, 0, 0, largura, altura);

  let foto = canvas.toDataURL('image/jpeg', 0.95);
  fotos.push({ imagem: foto, legenda: legenda });
  salvarFotos();
  mostrarGaleria();
}

// Tira uma foto usando a camera
btnFoto.addEventListener('click', function () {
  if (camera && video.videoWidth > 0) {
    let legenda = pedirLegenda();
    guardarFoto(video, video.videoWidth, video.videoHeight, legenda);
    mostrarAviso('Foto salva na galeria!');
  }
});

// Tambem permite escolher uma foto do celular
inputFoto.addEventListener('change', function () {
  let arquivo = inputFoto.files[0];
  if (arquivo) {
    let legenda = pedirLegenda();
    let imagem = new Image();

    imagem.onload = function () {
      guardarFoto(imagem, imagem.width, imagem.height, legenda);
      mostrarAviso('Foto salva na galeria!');
    };

    imagem.src = URL.createObjectURL(arquivo);
  }
});

// Apaga uma foto depois de confirmar
function apagarFoto(indice) {
  let confirmar = confirm('Deseja apagar esta foto?');
  if (confirmar) {
    fotos.splice(indice, 1);
    salvarFotos();
    mostrarGaleria();
  }
}

// Mostra as fotos e a quantidade na tela
function mostrarGaleria() {
  galeria.innerHTML = '';
  contadorFotos.textContent = 'Galeria (' + fotos.length + ')';

  if (fotos.length === 0) {
    galeria.innerHTML = '<p class="vazio">Nenhuma foto ainda.</p>';
  }

  for (let i = 0; i < fotos.length; i++) {
    let caixa = document.createElement('div');
    caixa.className = 'foto';

    let imagem = document.createElement('img');
    imagem.src = fotos[i].imagem;
    imagem.alt = 'Foto da galeria';

    let legenda = document.createElement('small');
    legenda.textContent = fotos[i].legenda;

    let botaoApagar = document.createElement('button');
    botaoApagar.textContent = 'Apagar';
    botaoApagar.className = 'btn-apagar-foto';
    botaoApagar.addEventListener('click', function () {
      apagarFoto(i);
    });

    caixa.appendChild(imagem);
    caixa.appendChild(legenda);
    caixa.appendChild(botaoApagar);
    galeria.appendChild(caixa);
  }
}

mostrarGaleria();
