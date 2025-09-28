// --- Жақсартылған ойын логикасы ---
// Рандомайзер, персонаж бір раундта тұрақты, таймер тексту жоңгартылған, кастомный диалог

defineCharacters = () => ({
    7: {
        1: ["Бауыржан Момышұлы","Қызтумас әже","Зияш анасы","Зияш атасы","Момынқұл","Серкебай"],
        2: ["Жуанқұл","Ахмет","Байшынар ағашы","Қабасақал","Кенжегүл"],
        3: ["Көксерек","Құрмаш","Хасен","Құрмаштың әжесі","Дастан","Тастан","Досбол ағай","Тоқтаров (инспектор)","Бекен","Рауан","Қожайын"],
        4: ["Әйтеке би","Қазыбек би","Қолдан бошақту хан","Майқы би","Қозы","Баян","Қарабай","Жынтық","Қодар","Күнікей","Мақбал"]},
    8: {
        1: ["Оралханның әпкесі","Оралханның әжесі","Бөкей","Оралхан Бөкей","Қашыбай","Күлия (Оралханның анасы)","Хачико","Профессор Уэно","Йошикава","Такахаши ханым","Йосуо","Йосуоның әкесі"],
        2: ["Володя ковбой","Жеңіс-беларусь","Саша-швед","Полина","Төлеген (Толя, жазушы)","Екатерина Никитична","Том Кенти","Пірадар-Эндрю","Эдуард Тюдор","Қалмақ қызы","Ноян","Батыр Баян","Ұса","Серен","Қанай би","Абылай хан"],
        3: ["Ана","Ауру бала","Әке","Аңшы ата","Тәуіп шал","Ләйлә","Құмар","Қатира тәте","Ханшайым","Дюпен","Ханди піл","Доктор Кэльвин","Хиппи","Робот-тонаушы","Джим Дигриз","Ханшайым","Доктор Донова"],
        4: ["Абай Құнанбаев","Ақан сері","Құлагер","Анна Ивановна","Айтпай","Құлтума","Жарылғапберді","Алашабыр хан","Айкүнім"]
    }
});

const roundTimes = [300, 240, 180, 120, 60]; // секунд
const roundScores = [10, 8, 6, 4, 2];

let ch, cls, term, deck, currentChar;
let playerNames = [], playerScores = [];
let currentPlayerIdx = 0, round = 1, score = 0, timer = null, timeLeft = 0, timerRunning = false;

const setup = document.getElementById("setup");
const playerSetup = document.getElementById("playerSetup");
const game = document.getElementById("game");
const results = document.getElementById("results");
const classSel = document.getElementById("classSelect");
const termSel = document.getElementById("termSelect");
const startBtn = document.getElementById("startBtn");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const playerNameInput = document.getElementById("playerName");
const playersList = document.getElementById("playersList");
const playerCount = document.getElementById("playerCount");
const startGameBtn = document.getElementById("startGameBtn");
const backToSetupBtn = document.getElementById("backToSetupBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const currentPlayerName = document.getElementById("currentPlayerName");
const playerTurn = document.getElementById("playerTurn");
const roundHeader = document.getElementById("roundHeader");
const timerDisplay = document.getElementById("timerDisplay");
const charBox = document.getElementById("character");
const revealBtn = document.getElementById("revealBtn");
const startTimerBtn = document.getElementById("startTimerBtn");
const guessedBtn = document.getElementById("guessedBtn");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const currentPoints = document.getElementById("currentPoints");
const scoreTableBody = document.getElementById("scoreTableBody");
const newGameBtn = document.getElementById("newGameBtn");
const changePlayersBtn = document.getElementById("changePlayersBtn");

// Кастомный диалог элементы
const customConfirm = document.getElementById("customConfirm");
const confirmMessage = document.getElementById("confirmMessage");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

// --- Кастомный диалог функция ---
function showCustomConfirm(message, callback) {
    confirmMessage.textContent = message;
    customConfirm.classList.remove('hidden');
    
    confirmYes.onclick = () => {
        customConfirm.classList.add('hidden');
        callback(true);
    };
    
    confirmNo.onclick = () => {
        customConfirm.classList.add('hidden');
        callback(false);
    };
}

// --- LocalStorage функциялары ---
function savePlayersToStorage() {
    localStorage.setItem('gamePlayerNames', JSON.stringify(playerNames));
}

function loadPlayersFromStorage() {
    const saved = localStorage.getItem('gamePlayerNames');
    if (saved) {
        playerNames = JSON.parse(saved);
        playerScores = new Array(playerNames.length).fill(0);
        updatePlayersList();
    }
}

function updatePlayersList() {
    playersList.innerHTML = "";
    playerNames.forEach((name, index) => {
        let li = document.createElement('li');
        li.innerHTML = `
            <span class="player-name">${name}</span>
            <button class="btn btn-danger" onclick="removePlayer(${index})">🗑️</button>
        `;
        playersList.appendChild(li);
    });
    playerCount.textContent = playerNames.length;
    startGameBtn.disabled = playerNames.length < 2;
}

function removePlayer(index) {
    playerNames.splice(index, 1);
    playerScores.splice(index, 1);
    updatePlayersList();
    savePlayersToStorage();
}

// --- Беттің жүктелуі ---
window.onload = () => {
    loadPlayersFromStorage();
}

// --- Этап 1: класс/тоқсан таңдау ---
startBtn.onclick = () => {
    cls = classSel.value;
    term = termSel.value;
    setup.classList.add('hidden');
    playerSetup.classList.remove('hidden');
}

backToSetupBtn.onclick = () => {
    playerSetup.classList.add('hidden');
    setup.classList.remove('hidden');
}

// --- Этап 2: ойыншыларды басқару ---
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPlayerBtn.click();
    }
});

addPlayerBtn.onclick = () => {
    let name = playerNameInput.value.trim();
    if (!name || playerNames.includes(name)) return;
    
    playerNames.push(name);
    playerScores.push(0);
    updatePlayersList();
    savePlayersToStorage();
    playerNameInput.value = "";
    playerNameInput.focus();
};

// Кастомный диалог вместо confirm
clearAllBtn.onclick = () => {
    showCustomConfirm('Барлық ойыншыларды жою керек пе?', (result) => {
        if (result) {
            playerNames = [];
            playerScores = [];
            updatePlayersList();
            savePlayersToStorage();
        }
    });
};

startGameBtn.onclick = () => {
    playerSetup.classList.add('hidden');
    game.classList.remove('hidden');
    currentPlayerIdx = 0;
    // Reset all scores
    playerScores = new Array(playerNames.length).fill(0);
    nextPlayer();
};

function shuffle(arr) {
    return arr.map(v=>({v, sort:Math.random()})).sort((a,b)=>a.sort-b.sort).map(({v})=>v);
}

function randomCharacter(characters) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
}

// --- Ойын логикасы ---
function nextPlayer() {
    ch = defineCharacters();
    deck = shuffle([...ch[cls][term]]);
    score = 0;
    round = 1;
    timerRunning = false;
    currentPlayerName.textContent = playerNames[currentPlayerIdx];
    playerTurn.textContent = `${currentPlayerIdx+1}/${playerNames.length}`;
    
    // Жаңа ойыншы үшін жаңа кейіпкер таңдау
    currentChar = randomCharacter(deck);
    
    startRound();
}

function startRound() {
    if (round > 5) {
        // Егер 5 раундта таппаса
        endTurn();
        return;
    }
    
    // Тек 1-раундта ғана жаңа кейіпкер таңдау
    if (round === 1 && currentChar === undefined) {
        currentChar = randomCharacter(deck);
    }
    // 2-5 раундтарда кейіпкер сол бойынша қалады
    
    roundHeader.textContent = `${round}-раунд / 5`;
    charBox.textContent = currentChar;
    charBox.classList.add("hidden-text");
    
    // Кнопкаларды баптау
    revealBtn.disabled = false;
    startTimerBtn.disabled = false;
    startTimerBtn.textContent = "⏰ Таймерді бастау"; // Мәтінді қалпына келтіру
    guessedBtn.disabled = true;
    nextRoundBtn.disabled = true;
    
    // Таймерді баптау
    timeLeft = roundTimes[round-1];
    timerRunning = false;
    updateTimerDisplay();
    timerDisplay.className = "timer-display";
    
    // Обновленные описания раундов
    const roundDescriptions = [
        "ең қиын сұрақтар",
        "нақтылау сұрақтары", 
        "оқиға желісі бойынша",
        "кейіпкердің әрекеті/мінезі",
        "жеңіл сипаттама"
    ];
    
    currentPoints.textContent = `Ағымдағы раунд: ${roundScores[round-1]} ұпай • ${roundDescriptions[round-1]} (${Math.floor(timeLeft/60)} мин)`;
    
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function startTimer() {
    if (timerRunning) return;
    
    timerRunning = true;
    timerDisplay.classList.add("running");
    startTimerBtn.disabled = true;
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            timerDisplay.classList.remove("running");
            timerDisplay.classList.add("danger");
            guessedBtn.disabled = true;
            nextRoundBtn.disabled = false;
            startTimerBtn.textContent = "⏰ Уақыт бітті!";
            startTimerBtn.disabled = true;
        } else if (timeLeft <= 30) {
            timerDisplay.classList.add("warning");
        }
    }, 1000);
}

function updateTimerDisplay() {
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;
    timerDisplay.textContent = `${m}:${s.toString().padStart(2, "0")}`;
}

revealBtn.onclick = () => {
    charBox.classList.remove("hidden-text");
    guessedBtn.disabled = false;
};

startTimerBtn.onclick = () => {
    startTimer();
};

guessedBtn.onclick = () => {
    if (timer) clearInterval(timer);
    timerRunning = false;
    
    // Егер уақыт ішінде тапса
    playerScores[currentPlayerIdx] += roundScores[round-1];
    nextPlayerTurn();
};

nextRoundBtn.onclick = () => {
    round++;
    startRound();
};

function endTurn() {
    if (timer) clearInterval(timer);
    timerRunning = false;
    // Егер 5 раундта да таба алмаса - 0 балл
    nextPlayerTurn();
}

function nextPlayerTurn() {
    game.classList.add('hidden');
    
    if (currentPlayerIdx + 1 < playerNames.length) {
        currentPlayerIdx++;
        // Келесі ойыншы үшін кейіпкерді анықтамау (nextPlayer функциясында орындалады)
        currentChar = undefined;
        setTimeout(() => {
            game.classList.remove('hidden');
            nextPlayer();
        }, 700);
    } else {
        showResults();
    }
}

function showResults() {
    results.classList.remove('hidden');
    
    let sorted = playerNames.map((name, i) => ({name, score: playerScores[i]}))
        .sort((a, b) => b.score - a.score);
    
    scoreTableBody.innerHTML = "";
    sorted.forEach((p, i) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${i+1}</td><td>${p.name}</td><td>${p.score}</td>`;
        scoreTableBody.appendChild(tr);
    });
}

newGameBtn.onclick = () => {
    results.classList.add('hidden');
    setup.classList.remove('hidden');
    
    // Тек ойынды ысыру, ойыншылар қалады
    currentPlayerIdx = 0;
    currentChar = undefined;
    if (timer) clearInterval(timer);
    timerRunning = false;
};

changePlayersBtn.onclick = () => {
    results.classList.add('hidden');
    playerSetup.classList.remove('hidden');
};