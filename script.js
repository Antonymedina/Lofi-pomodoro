let countdownInterval;
let timeLeft = 25 * 60; // 25 minutos
let pomodoroIndex = 0;
const phases = ["Focus", "Pause", "Focus", "Pause", "Focus", "Pause", "Focus", "Long pause"];

const countdownElement = document.querySelector('.countdown');
const startButton = document.getElementById('start-btn');
const resetButton = document.getElementById('reset-btn');
const musicButton = document.getElementById('music-btn');
const songStatus = document.getElementById('song-status');
const pomodoroListItems = document.querySelectorAll('.pomodoro-list li');
const musicIcon = document.getElementById('music-icon');

const minuteTens = document.getElementById('minute-tens');
const minuteUnits = document.getElementById('minute-units');
const secondTens = document.getElementById('second-tens');
const secondUnits = document.getElementById('second-units');

// Elementos para el control de pantalla completa
const fullscreenButton = document.getElementById('fullscreen-btn');
const fullscreenIcon = document.getElementById('fullscreen-icon');
const fullscreenStatus = document.getElementById('fullscreen-status');

let audio = new Audio();
let isPlaying = false;

// Lista predefinida de canciones
const songs = [
  'songs/song1.mp3',
  'songs/song2.mp3',
  'songs/song3.mp3',
  'songs/song4.mp3',
  'songs/song5.mp3',
  'songs/song6.mp3',
  'songs/song7.mp3',
  'songs/song8.mp3',
];

function updateCountdownDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  updateDigit(minuteTens, minutes.charAt(0));
  updateDigit(minuteUnits, minutes.charAt(1));
  updateDigit(secondTens, seconds.charAt(0));
  updateDigit(secondUnits, seconds.charAt(1));
}

function updateDigit(element, newDigit) {
  const span = element.querySelector('span');
  if (span.textContent !== newDigit) {
    span.textContent = newDigit;
  }
}

function updateBackground() {
  let bgColor = '#F2674A'; // Color por defecto para "Focus"

  if (phases[pomodoroIndex] === "Pause") {
    bgColor = '#F3CF77';
  } else if (phases[pomodoroIndex] === "Long pause") {
    bgColor = '#77F3DC';
  }

  document.body.style.backgroundColor = bgColor;
}

function updatePhaseStyles() {
  // Remover clases de fase anteriores
  document.body.classList.remove('phase-focus', 'phase-pause', 'phase-long-pause');

  // Añadir clase según la fase actual
  if (phases[pomodoroIndex] === "Focus") {
    document.body.classList.add('phase-focus');
  } else if (phases[pomodoroIndex] === "Pause") {
    document.body.classList.add('phase-pause');
  } else if (phases[pomodoroIndex] === "Long pause") {
    document.body.classList.add('phase-long-pause');
  }

  // Actualizar los iconos y textos de música y pantalla completa
  updateMusicIcon();
  updateFullscreenIcon();
}

function playNotificationSound() {
  let phaseName = phases[pomodoroIndex];
  let notificationAudio = new Audio();

  if (phaseName === "Focus") {
    notificationAudio.src = 'notifications/focus.MP3';
  } else if (phaseName === "Pause" || phaseName === "Long pause") {
    notificationAudio.src = 'notifications/pause.MP3';
  }
  notificationAudio.play();
}

function startPomodoro() {
  if (!countdownInterval) {
    playNotificationSound(); // Reproducir sonido solo al inicio de la cuenta regresiva
    countdownInterval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        countdownInterval = null;

        // Si la fase actual es "Long pause", mostrar el botón "Restart" y mantener la pantalla
        if (phases[pomodoroIndex] === "Long pause") {
          updateCountdownDisplay(); // Asegurar que muestre 00:00
          showRestartButton();
          return;
        }

        switchToNextPhase();
      } else {
        timeLeft--;
        updateCountdownDisplay();

        // Fade-out del audio cuando quedan 5 segundos en la "Long pause"
        if (phases[pomodoroIndex] === "Long pause" && timeLeft === 5) {
          fadeOutAudio();
        }
      }
    }, 1000);
    startButton.textContent = "Pause";
    playMusic();
  }
}

function pausePomodoro() {
  clearInterval(countdownInterval);
  countdownInterval = null;
  startButton.textContent = "Resume";
  pauseMusic();
}

function resetPomodoro() {
  clearInterval(countdownInterval);
  countdownInterval = null;
  pomodoroIndex = 0;
  timeLeft = 25 * 60;
  updateCountdownDisplay();
  resetPomodoroList();
  startButton.textContent = "Start";
  updateBackground();
  updatePhaseStyles();
  resetMusic();
}

function switchToNextPhase() {
  pomodoroListItems[pomodoroIndex].classList.remove('live');
  pomodoroListItems[pomodoroIndex].classList.add('used');

  pomodoroIndex = (pomodoroIndex + 1) % phases.length;

  pomodoroListItems.forEach((item, index) => {
    item.classList.remove('live');
    if (index > pomodoroIndex) {
      item.classList.remove('used');
      item.classList.add('coming');
    }
  });

  pomodoroListItems[pomodoroIndex].classList.add('live');
  pomodoroListItems[pomodoroIndex].classList.remove('used', 'coming');

  if (phases[pomodoroIndex] === "Focus") {
    timeLeft = 25 * 60;
  } else if (phases[pomodoroIndex] === "Pause") {
    timeLeft = 5 * 60;
  } else {
    timeLeft = 15 * 60;
  }

  updateBackground();
  updatePhaseStyles();
  updateCountdownDisplay();
  playNotificationSound(); // Reproducir sonido al cambiar de fase
  startPomodoro();
}

// Mantén las demás funciones existentes (showRestartButton, restartPomodoro, etc.)
function showRestartButton() {
    // Ocultar los botones existentes con una transición suave
    startButton.style.opacity = '0';
    resetButton.style.opacity = '0';
    setTimeout(() => {
      startButton.style.display = 'none';
      resetButton.style.display = 'none';
  
      // Crear el botón "Restart"
      const restartButton = document.createElement('button');
      restartButton.id = 'restart-btn';
      restartButton.className = 'button restart-button';
      restartButton.textContent = 'Restart';
      // Añadir evento al botón
      restartButton.addEventListener('click', restartPomodoro);
  
      // Añadir el botón al contenedor de controles
      document.querySelector('.controls').appendChild(restartButton);
      // Mostrar el botón con transición
      setTimeout(() => {
        restartButton.style.opacity = '1';
      }, 10);
    }, 500); // Coincidir con la duración de la transición CSS
  }

  function restartPomodoro() {
    // Restablecer todo al estado inicial
    resetPomodoro();
  
    // Eliminar el botón "Restart"
    const restartButton = document.getElementById('restart-btn');
    restartButton.style.opacity = '0';
    setTimeout(() => {
      restartButton.remove();
  
      // Mostrar nuevamente los botones "Start" y "Reset"
      startButton.style.display = '';
      resetButton.style.display = '';
      setTimeout(() => {
        startButton.style.opacity = '1';
        resetButton.style.opacity = '1';
  
        // Iniciar automáticamente el temporizador en la fase "Focus"
        startPomodoro();
      }, 10);
    }, 500); // Coincidir con la duración de la transición CSS
  }

  function resetPomodoroList() {
    pomodoroListItems.forEach((item, index) => {
      item.classList.remove('used', 'live', 'coming');
      if (index === 0) {
        item.classList.add('live');
      } else {
        item.classList.add('coming');
      }
    });
  }
  
  function playMusic() {
    if (!audio.src || audio.ended) {
      selectRandomSong();
    }
    audio.play();
    songStatus.textContent = "Song playing";
    isPlaying = true;
    updateMusicIcon();
  }
  
  function pauseMusic() {
    audio.pause();
    songStatus.textContent = "Song paused";
    isPlaying = false;
    updateMusicIcon();
  }
  
  function resetMusic() {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1; // Restablecer el volumen
    audio = new Audio(); // Crear un nuevo objeto Audio
    isPlaying = false;
    songStatus.textContent = "Song paused";
    updateMusicIcon();
  }
  
  function selectRandomSong() {
    const randomIndex = Math.floor(Math.random() * songs.length);
    audio.src = songs[randomIndex];
  }

  // Event listener para reproducir una nueva canción cuando termina la actual
audio.addEventListener('ended', () => {
    if (isPlaying) {
      selectRandomSong();
      audio.play();
    }
  });
  
  function fadeOutAudio() {
    let fadeDuration = 5000; // 5 segundos
    let fadeSteps = 50; // Número de pasos
    let fadeStepTime = fadeDuration / fadeSteps;
    let originalVolume = audio.volume;
    let fadeStep = originalVolume / fadeSteps;
  
    let fadeInterval = setInterval(() => {
      if (audio.volume > 0) {
        audio.volume = Math.max(0, audio.volume - fadeStep);
      } else {
        clearInterval(fadeInterval);
      }
    }, fadeStepTime);
  }
  
  function updateMusicIcon() {
    // Determinar el nombre del archivo de imagen según la fase y el estado
    let phaseName = phases[pomodoroIndex].toLowerCase().replace(' ', '-'); // 'focus', 'pause', 'long-pause'
    let playPause = isPlaying ? 'Pause' : 'Play';
    let imageFilename = `${playPause}-${phaseName}.png`; // Ejemplo: 'Play-focus.png'
  
    musicIcon.src = `assets/${imageFilename}`;
  }
  
  function updateFullscreenIcon() {
    let phaseName = phases[pomodoroIndex].toLowerCase().replace(' ', '-'); // 'focus', 'pause', 'long-pause'
    let fullscreenState = document.fullscreenElement ? 'Full-screen-exit' : 'Full-screen';
    let imageFilename = `${fullscreenState}-${phaseName}.png`; // Ejemplo: 'Full-screen-focus.png'
  
    fullscreenIcon.src = `assets/${imageFilename}`;
    fullscreenStatus.textContent = document.fullscreenElement ? 'Exit Full Screen' : 'Full Screen';
  }
  
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        alert(`Error al intentar activar el modo de pantalla completa: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
    // Actualizar el icono y el texto
    updateFullscreenIcon();
  }

// Listeners
fullscreenButton.addEventListener('click', toggleFullScreen);
startButton.addEventListener('click', () => {
  if (countdownInterval) {
    pausePomodoro();
  } else {
    startPomodoro();
  }
});
resetButton.addEventListener('click', resetPomodoro);
musicButton.addEventListener('click', () => {
  if (isPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
});

// Actualización inicial
updateCountdownDisplay();
updateBackground();
updatePhaseStyles();
updateMusicIcon();
updateFullscreenIcon();
