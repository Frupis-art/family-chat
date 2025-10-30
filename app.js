// 🔧 КОНФИГУРАЦИЯ FIREBASE - ТВОИ ДАННЫЕ
const firebaseConfig = {
    apiKey: "AIzaSyDwSyBLQy-t9eHfktI91hrzypBolg_G0JI",
    authDomain: "family-chat-musik.firebaseapp.com",
    databaseURL: "https://family-chat-musik-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "family-chat-musik",
    storageBucket: "family-chat-musik.firebasestorage.app",
    messagingSenderId: "85762848411",
    appId: "1:85762848411:web:bf6a6249f60b345ecb383e"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Элементы DOM
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const nicknameBtn = document.getElementById('nicknameBtn');
const currentNickname = document.getElementById('currentNickname');

// Переменные
let userNickname = localStorage.getItem('chatNickname') || 'Гость';

// Инициализация
function init() {
    currentNickname.textContent = userNickname;
    loadMessages();
    setupEventListeners();
}

// Загрузка сообщений
function loadMessages() {
    const messagesRef = database.ref('messages');
    
    messagesRef.on('child_added', (snapshot) => {
        const message = snapshot.val();
        displayMessage(message);
    });
}

// Отображение сообщения
function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    const timestamp = new Date(message.timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageElement.innerHTML = `
        <div>
            <span class="nickname">${escapeHtml(message.nickname)}:</span>
            <span class="message-text">${escapeHtml(message.text)}</span>
        </div>
        <div class="timestamp">${timestamp}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Отправка сообщения
function sendMessage() {
    const text = messageInput.value.trim();
    
    if (!text) {
        alert('Введите сообщение!');
        return;
    }
    
    if (userNickname === 'Гость') {
        alert('Сначала установите никнейм!');
        return;
    }
    
    const message = {
        nickname: userNickname,
        text: text,
        timestamp: Date.now()
    };
    
    // Отправляем в Firebase
    database.ref('messages').push(message)
        .then(() => {
            messageInput.value = '';
            messageInput.focus();
        })
        .catch((error) => {
            console.error('Ошибка отправки:', error);
            alert('Ошибка отправки сообщения');
        });
}

// Установка никнейма
function setNickname() {
    const nickname = prompt('Введите ваш никнейм (не более 10 символов):', userNickname);
    
    if (nickname) {
        const trimmedNickname = nickname.trim().substring(0, 10);
        if (trimmedNickname) {
            userNickname = trimmedNickname;
            currentNickname.textContent = userNickname;
            localStorage.setItem('chatNickname', userNickname);
        }
    }
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Настройка обработчиков событий
function setupEventListeners() {
    sendBtn.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    nicknameBtn.addEventListener('click', setNickname);
    
    // Ограничение ввода
    messageInput.addEventListener('input', () => {
        if (messageInput.value.length > 500) {
            messageInput.value = messageInput.value.substring(0, 500);
        }
    });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);
