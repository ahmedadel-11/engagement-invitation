/**
 * Ahmed & Manar Engagement Website
 * Main JavaScript File
 */

// =============================================
// DOM Elements
// =============================================
const pageLoader = document.getElementById('pageLoader');
const wishForm = document.getElementById('wishForm');
const messagesGrid = document.getElementById('messagesGrid');
const successMessage = document.getElementById('successMessage');
const bgMusic = document.getElementById('bgMusic');
const musicControl = document.getElementById('musicControl');
const musicIcon = document.getElementById('musicIcon');
const langToggle = document.getElementById('langToggle');
const langText = document.getElementById('langText');

// =============================================
// Configuration
// =============================================
const CONFIG = {
    eventDate: new Date('January 30, 2026 19:00:00'),
    loaderDelay: 1500,
    successMessageDuration: 3000,
    storageKey: 'engagementWishes',
    apiUrl: '/api/messages',
    musicStartTime: 10,  // Start at 10 seconds
    musicEndTime: 44     // End at 44 seconds
};

// =============================================
// Language System
// =============================================
let currentLang = localStorage.getItem('preferredLang') || 'en';

function initLanguageSystem() {
    // Set initial language
    setLanguage(currentLang);
    
    // Toggle language on button click
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'ar' : 'en';
            setLanguage(currentLang);
            localStorage.setItem('preferredLang', currentLang);
        });
    }
}

function setLanguage(lang) {
    const html = document.documentElement;
    
    if (lang === 'ar') {
        html.setAttribute('dir', 'rtl');
        html.setAttribute('lang', 'ar');
        if (langText) langText.textContent = 'En';
    } else {
        html.setAttribute('dir', 'ltr');
        html.setAttribute('lang', 'en');
        if (langText) langText.textContent = 'ع';
    }
    
    // Update all translatable elements
    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-placeholder-en][data-placeholder-ar]').forEach(el => {
        el.placeholder = el.getAttribute(`data-placeholder-${lang}`);
    });
}

// =============================================
// Music System
// =============================================
let isMusicPlaying = false;

function initMusicSystem() {
    if (!bgMusic || !musicControl) return;
    
    // Set initial time and volume
    bgMusic.currentTime = CONFIG.musicStartTime;
    bgMusic.volume = 0.5;
    
    // Handle time updates to loop between 10-44 seconds
    bgMusic.addEventListener('timeupdate', () => {
        if (bgMusic.currentTime >= CONFIG.musicEndTime) {
            bgMusic.currentTime = CONFIG.musicStartTime;
        }
    });
    
    // Music control button
    musicControl.addEventListener('click', toggleMusic);
    
    // Try to autoplay on first user interaction
    document.addEventListener('click', tryAutoplay, { once: true });
    document.addEventListener('touchstart', tryAutoplay, { once: true });
    document.addEventListener('scroll', tryAutoplay, { once: true });
}

function tryAutoplay() {
    if (!isMusicPlaying && bgMusic) {
        bgMusic.currentTime = CONFIG.musicStartTime;
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            updateMusicIcon();
        }).catch(() => {
            // Autoplay blocked, user needs to click music button
        });
    }
}

function toggleMusic() {
    if (!bgMusic) return;
    
    if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
    } else {
        bgMusic.currentTime = CONFIG.musicStartTime;
        bgMusic.play();
        isMusicPlaying = true;
    }
    updateMusicIcon();
}

function updateMusicIcon() {
    if (!musicIcon || !musicControl) return;
    
    if (isMusicPlaying) {
        musicIcon.className = 'fas fa-volume-up';
        musicControl.classList.add('playing');
    } else {
        musicIcon.className = 'fas fa-volume-mute';
        musicControl.classList.remove('playing');
    }
}

// =============================================
// Page Loader
// =============================================
function initPageLoader() {
    window.addEventListener('load', function() {
        setTimeout(() => {
            pageLoader.classList.add('hidden');
        }, CONFIG.loaderDelay);
    });
}

// =============================================
// Scroll Reveal Animation
// =============================================
function initScrollReveal() {
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - revealPoint) {
                reveal.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', revealOnScroll);
    window.addEventListener('load', revealOnScroll);
}

// =============================================
// Countdown Timer
// =============================================
function initCountdown() {
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = CONFIG.eventDate.getTime() - now;

        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            animateValue('days', days);
            animateValue('hours', hours);
            animateValue('minutes', minutes);
            animateValue('seconds', seconds);
        } else {
            // Event has passed
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }

    function animateValue(id, value) {
        const element = document.getElementById(id);
        if (!element) return;
        
        const newValue = value.toString().padStart(2, '0');
        if (element.textContent !== newValue) {
            element.style.transform = 'scale(1.1)';
            element.textContent = newValue;
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // Update countdown every second
    setInterval(updateCountdown, 1000);
    updateCountdown();
}

// =============================================
// Messages / Wishes System
// =============================================
function initMessagesSystem() {
    // Load messages on page load
    loadMessages();
    
    // Handle form submission
    if (wishForm) {
        wishForm.addEventListener('submit', handleFormSubmit);
    }
}

async function loadMessages() {
    if (!messagesGrid) return;
    
    let messages = [];
    
    try {
        // Try to fetch from API first
        const response = await fetch(CONFIG.apiUrl);
        const data = await response.json();
        
        if (data.success && data.messages) {
            messages = data.messages;
            // Also update localStorage as backup
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(messages));
        } else {
            // Fallback to localStorage
            messages = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
        }
    } catch (error) {
        console.log('API not available, using localStorage');
        messages = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
    }
    
    // Add sample message if empty
    if (messages.length === 0) {
        const sampleMessages = [
            { 
                id: 'sample1',
                name: 'Family', 
                message: 'Wishing you both a lifetime of love and happiness! May Allah bless your union. 💕', 
                date: new Date().toISOString() 
            }
        ];
        messages = sampleMessages;
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(messages));
    }
    
    renderMessages(messages);
}

function renderMessages(messages) {
    if (!messagesGrid) return;
    
    messagesGrid.innerHTML = '';
    
    messages.forEach((msg, index) => {
        const card = createMessageCard(msg.name, msg.message);
        card.style.animationDelay = `${index * 0.1}s`;
        messagesGrid.appendChild(card);
    });
}

function createMessageCard(name, message) {
    const card = document.createElement('div');
    card.className = 'message-card';
    card.innerHTML = `
        <div class="guest-name">
            <i class="fas fa-user-circle"></i>
            ${escapeHtml(name)}
        </div>
        <p class="guest-message">"${escapeHtml(message)}"</p>
    `;
    return card;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('guestName');
    const messageInput = document.getElementById('guestMessage');
    
    if (!nameInput || !messageInput) return;
    
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    
    if (name && message) {
        const newMessage = {
            id: Date.now().toString(),
            name,
            message,
            date: new Date().toISOString()
        };
        
        try {
            // Try to save to API
            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, message })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                // If API fails, save to localStorage
                saveToLocalStorage(newMessage);
            }
        } catch (error) {
            console.log('API not available, saving to localStorage');
            saveToLocalStorage(newMessage);
        }
        
        // Show success message
        if (successMessage) {
            successMessage.style.display = 'block';
        }
        
        // Reset form
        wishForm.reset();
        
        // Reload messages
        loadMessages();
        
        // Hide success message after delay
        setTimeout(() => {
            if (successMessage) {
                successMessage.style.display = 'none';
            }
        }, CONFIG.successMessageDuration);
    }
}

function saveToLocalStorage(newMessage) {
    const messages = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
    messages.unshift(newMessage);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(messages));
}

// =============================================
// Smooth Scrolling
// =============================================
function initSmoothScroll() {
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Handle scroll indicator click
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const countdownSection = document.querySelector('.countdown-section');
            if (countdownSection) {
                countdownSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// =============================================
// Touch Support for Mobile
// =============================================
function initTouchSupport() {
    if ('ontouchstart' in window) {
        const interactiveItems = document.querySelectorAll('.countdown-item, .message-card');
        
        interactiveItems.forEach(item => {
            item.addEventListener('touchstart', function() {
                this.style.transform = 'translateY(-8px)';
            });
            item.addEventListener('touchend', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
}

// =============================================
// Initialize Everything
// =============================================
function init() {
    initPageLoader();
    initLanguageSystem();
    initMusicSystem();
    initScrollReveal();
    initCountdown();
    initMessagesSystem();
    initSmoothScroll();
    initTouchSupport();
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);
