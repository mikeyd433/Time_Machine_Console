// T.I.M.E. Machine Console JavaScript

// ========== MAIN CONSOLE ==========

// Numpad functionality
let numpadBuffer = '';
let currentTarget = 'dest-month';
const maxLengths = {
    'dest-month': 2,
    'dest-day': 2,
    'dest-year': 4,
    'dest-hour': 2,
    'dest-min': 2
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize menu
    initMenu();

    // Initialize numpad
    initNumpad();

    // Initialize present time display
    updatePresentTime();
    setInterval(updatePresentTime, 1000);

    // Initialize useless controls
    initUselessControls();

    // Initialize indicators
    initIndicators();

    // Check auth status
    checkAuthStatus();
});

function initMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const menuDropdown = document.getElementById('menu-dropdown');
    const forceUpdate = document.getElementById('force-update');
    const resetAuth = document.getElementById('reset-auth');

    if (menuBtn && menuDropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            menuDropdown.classList.remove('show');
        });
    }

    if (forceUpdate) {
        forceUpdate.addEventListener('click', async () => {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const reg of registrations) {
                    await reg.unregister();
                }
            }
            if ('caches' in window) {
                const keys = await caches.keys();
                for (const key of keys) {
                    await caches.delete(key);
                }
            }
            location.reload(true);
        });
    }

    if (resetAuth) {
        resetAuth.addEventListener('click', () => {
            localStorage.removeItem('fingerprint-auth');
            localStorage.removeItem('voice-auth');
            localStorage.removeItem('retina-auth');
            location.reload();
        });
    }
}

function initNumpad() {
    const numButtons = document.querySelectorAll('.num-btn');
    const targetRadios = document.querySelectorAll('input[name="target"]');

    numButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const num = this.dataset.num;
            handleNumpadInput(num);
        });
    });

    targetRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            currentTarget = this.value;
            numpadBuffer = '';
            updateNumpadDisplay();
        });
    });

    // Keyboard support
    document.addEventListener('keydown', function(e) {
        if (e.key >= '0' && e.key <= '9') {
            handleNumpadInput(e.key);
        } else if (e.key === 'Enter') {
            handleNumpadInput('E');
        } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
            handleNumpadInput('C');
        }
    });
}

function handleNumpadInput(input) {
    if (input === 'C') {
        numpadBuffer = '';
    } else if (input === 'E') {
        applyNumpadValue();
    } else {
        const maxLen = maxLengths[currentTarget];
        if (numpadBuffer.length < maxLen) {
            numpadBuffer += input;
        }
    }
    updateNumpadDisplay();
}

function updateNumpadDisplay() {
    const display = document.getElementById('numpad-display');
    if (!display) return;

    const digits = display.querySelectorAll('.digit');
    const padded = numpadBuffer.padStart(4, '-');

    digits.forEach((digit, i) => {
        digit.textContent = padded[i];
    });
}

function applyNumpadValue() {
    const targetDisplay = document.getElementById(currentTarget);
    if (!targetDisplay || !numpadBuffer) return;

    const digits = targetDisplay.querySelectorAll('.digit');
    const maxLen = maxLengths[currentTarget];
    const padded = numpadBuffer.padStart(maxLen, '0');

    digits.forEach((digit, i) => {
        digit.textContent = padded[i];
    });

    // Flash effect
    targetDisplay.style.boxShadow = '0 0 20px #ff0000';
    setTimeout(() => {
        targetDisplay.style.boxShadow = '';
    }, 300);

    numpadBuffer = '';
    updateNumpadDisplay();
}

function updatePresentTime() {
    const now = new Date();

    setDisplayValue('pres-month', String(now.getMonth() + 1).padStart(2, '0'));
    setDisplayValue('pres-day', String(now.getDate()).padStart(2, '0'));
    setDisplayValue('pres-year', String(now.getFullYear()));
    setDisplayValue('pres-hour', String(now.getHours()).padStart(2, '0'));
    setDisplayValue('pres-min', String(now.getMinutes()).padStart(2, '0'));
}

function setDisplayValue(displayId, value) {
    const display = document.getElementById(displayId);
    if (!display) return;

    const digits = display.querySelectorAll('.digit');
    digits.forEach((digit, i) => {
        digit.textContent = value[i] || '-';
    });
}

function initUselessControls() {
    // Flip switches make sounds and flash
    const switches = document.querySelectorAll('.flip-switch input');
    switches.forEach(sw => {
        sw.addEventListener('change', function() {
            playClick();
            flashRandom();
        });
    });

    // Useless buttons
    const buttons = document.querySelectorAll('.useless-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            playClick();
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);

            // Random gauge movement
            randomizeGauges();
        });
    });

    // Engage button
    const engageBtn = document.getElementById('engage-btn');
    if (engageBtn) {
        engageBtn.addEventListener('click', function() {
            initiateEngageSequence();
        });
    }
}

function playClick() {
    // Could add audio here if desired
}

function flashRandom() {
    const indicators = document.querySelectorAll('.indicator-light');
    const randomIndex = Math.floor(Math.random() * indicators.length);
    const indicator = indicators[randomIndex];

    indicator.classList.add('active');
    setTimeout(() => {
        indicator.classList.remove('active');
    }, 500);
}

function randomizeGauges() {
    const gauges = document.querySelectorAll('.gauge-fill');
    gauges.forEach(gauge => {
        const newWidth = 50 + Math.random() * 50;
        gauge.style.width = newWidth + '%';
    });
}

function initIndicators() {
    // Make standby indicator active by default
    const standby = document.getElementById('ind-standby');
    if (standby) {
        standby.classList.add('active');
    }
}

function initiateEngageSequence() {
    const engageBtn = document.getElementById('engage-btn');
    const indicators = document.querySelectorAll('.indicator-light');

    // Check if all auth is complete
    const fp = localStorage.getItem('fingerprint-auth') === 'true';
    const voice = localStorage.getItem('voice-auth') === 'true';
    const retina = localStorage.getItem('retina-auth') === 'true';

    if (!fp || !voice || !retina) {
        // Flash warning
        const warning = document.getElementById('ind-warning');
        if (warning) {
            warning.classList.add('active');
            setTimeout(() => warning.classList.remove('active'), 2000);
        }
        alert('AUTHORIZATION INCOMPLETE\n\nAll biometric scans must be verified before temporal displacement.');
        return;
    }

    // Engage sequence
    indicators.forEach(ind => ind.classList.remove('active'));

    let step = 0;
    const sequence = setInterval(() => {
        if (step < indicators.length) {
            indicators[step].classList.add('active');
            step++;
        } else {
            clearInterval(sequence);
            startStrobeSequence(engageBtn);
        }
    }, 300);
}

function startStrobeSequence(engageBtn) {
    const totalDuration = 8000;
    const startTime = Date.now();
    let strobeOn = false;

    // Create overlay for strobe effect
    const overlay = document.createElement('div');
    overlay.id = 'strobe-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        opacity: 0;
        pointer-events: none;
        z-index: 9999;
    `;
    document.body.appendChild(overlay);

    engageBtn.style.boxShadow = '0 0 100px #ff0000';

    function strobe() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / totalDuration;

        if (elapsed >= totalDuration) {
            // Hold on white screen for 3 seconds
            overlay.style.opacity = 1;
            overlay.style.background = 'white';

            setTimeout(() => {
                overlay.remove();
                engageBtn.style.boxShadow = '';
            }, 3000);
            return;
        }

        // Increase intensity and speed as we progress
        // Start at 500ms interval, end at 30ms
        const interval = Math.max(30, 500 - (progress * 470));
        // Start at 0.3 opacity, end at 1.0
        const maxOpacity = 0.3 + (progress * 0.7);

        strobeOn = !strobeOn;
        overlay.style.opacity = strobeOn ? maxOpacity : 0;
        overlay.style.background = strobeOn ? (Math.random() > 0.5 ? 'white' : '#ff0000') : 'white';

        setTimeout(strobe, interval);
    }

    strobe();
}

function copyDestToLast() {
    const fields = ['month', 'day', 'year', 'hour', 'min'];
    fields.forEach(field => {
        const destDisplay = document.getElementById(`dest-${field}`);
        const lastDisplay = document.getElementById(`last-${field}`);
        if (destDisplay && lastDisplay) {
            const destDigits = destDisplay.querySelectorAll('.digit');
            const lastDigits = lastDisplay.querySelectorAll('.digit');
            destDigits.forEach((d, i) => {
                if (lastDigits[i]) {
                    lastDigits[i].textContent = d.textContent;
                }
            });
        }
    });
}

function checkAuthStatus() {
    const fp = localStorage.getItem('fingerprint-auth') === 'true';
    const voice = localStorage.getItem('voice-auth') === 'true';
    const retina = localStorage.getItem('retina-auth') === 'true';

    const fpStatus = document.querySelector('#fingerprint-status .status-light');
    const voiceStatus = document.querySelector('#voice-status .status-light');
    const retinaStatus = document.querySelector('#retina-status .status-light');

    if (fpStatus) {
        fpStatus.classList.toggle('on', fp);
        fpStatus.classList.toggle('off', !fp);
    }
    if (voiceStatus) {
        voiceStatus.classList.toggle('on', voice);
        voiceStatus.classList.toggle('off', !voice);
    }
    if (retinaStatus) {
        retinaStatus.classList.toggle('on', retina);
        retinaStatus.classList.toggle('off', !retina);
    }

    // Update ready indicator
    if (fp && voice && retina) {
        const ready = document.getElementById('ind-ready');
        if (ready) ready.classList.add('active');
    }
}

// ========== FINGERPRINT AUTHENTICATION ==========

function initFingerprint() {
    const scanner = document.getElementById('scanner-glass');
    const scanLine = document.getElementById('scan-line');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const authMessage = document.getElementById('auth-message');
    const authStatus = document.querySelector('.status-text');
    const resetBtn = document.getElementById('reset-btn');

    let isScanning = false;
    let scanInterval;
    let progress = 0;

    if (scanner) {
        // Mouse events
        scanner.addEventListener('mousedown', startScan);
        scanner.addEventListener('mouseup', stopScan);
        scanner.addEventListener('mouseleave', stopScan);

        // Touch events
        scanner.addEventListener('touchstart', function(e) {
            e.preventDefault();
            startScan();
        });
        scanner.addEventListener('touchend', stopScan);
    }

    function startScan() {
        if (isScanning || localStorage.getItem('fingerprint-auth') === 'true') return;

        isScanning = true;
        scanLine.classList.add('scanning');
        scanner.classList.add('active');
        authStatus.textContent = 'SCANNING...';
        authMessage.textContent = 'Keep finger steady on scanner...';

        scanInterval = setInterval(() => {
            progress += 2;
            progressFill.style.width = progress + '%';
            progressText.textContent = progress + '%';

            if (progress >= 100) {
                clearInterval(scanInterval);
                completeScan();
            }
        }, 40);
    }

    function stopScan() {
        if (!isScanning || progress >= 100) return;

        isScanning = false;
        clearInterval(scanInterval);
        scanLine.classList.remove('scanning');
        scanner.classList.remove('active');
        authStatus.textContent = 'SCAN INTERRUPTED';
        authMessage.textContent = 'Hold finger until scan completes...';

        // Reset progress slowly
        const resetInterval = setInterval(() => {
            progress -= 5;
            if (progress <= 0) {
                progress = 0;
                clearInterval(resetInterval);
                authStatus.textContent = 'AWAITING FINGERPRINT';
                authMessage.textContent = 'Hold finger on scanner to begin';
            }
            progressFill.style.width = progress + '%';
            progressText.textContent = progress + '%';
        }, 30);
    }

    function completeScan() {
        scanLine.classList.remove('scanning');
        isScanning = false;

        setTimeout(() => {
            authStatus.textContent = 'FINGERPRINT VERIFIED';
            authStatus.style.color = '#00ff00';
            authMessage.textContent = 'Identity confirmed. Access granted.';
            authMessage.style.color = '#00ff00';
            scanner.classList.add('verified');

            localStorage.setItem('fingerprint-auth', 'true');
        }, 500);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            localStorage.removeItem('fingerprint-auth');
            location.reload();
        });
    }
}

// ========== VOICE AUTHENTICATION ==========

function initVoice() {
    const recordBtn = document.getElementById('record-btn');
    const waveform = document.getElementById('waveform');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const authMessage = document.getElementById('auth-message');
    const authStatus = document.querySelector('.status-text');
    const voiceMatch = document.getElementById('voice-match');
    const freqAnalysis = document.getElementById('freq-analysis');
    const toneSig = document.getElementById('tone-sig');
    const resetBtn = document.getElementById('reset-btn');

    let isRecording = false;
    let recordInterval;

    if (recordBtn) {
        // Mouse events
        recordBtn.addEventListener('mousedown', startRecording);
        recordBtn.addEventListener('mouseup', stopRecording);
        recordBtn.addEventListener('mouseleave', stopRecording);

        // Touch events
        recordBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            startRecording();
        });
        recordBtn.addEventListener('touchend', stopRecording);
    }

    function startRecording() {
        if (isRecording) return;

        isRecording = true;
        recordBtn.classList.add('recording');
        waveform.classList.add('active');
        authStatus.textContent = 'RECORDING...';
        authMessage.textContent = 'Speak the phrase clearly...';
        freqAnalysis.textContent = 'ANALYZING';

        // Animate waveform bars
        const bars = waveform.querySelectorAll('.wave-bar');
        recordInterval = setInterval(() => {
            bars.forEach(bar => {
                bar.style.height = (10 + Math.random() * 50) + 'px';
            });
        }, 100);
    }

    function stopRecording() {
        if (!isRecording) return;

        isRecording = false;
        recordBtn.classList.remove('recording');
        waveform.classList.remove('active');
        clearInterval(recordInterval);

        // Reset bars
        const bars = waveform.querySelectorAll('.wave-bar');
        bars.forEach(bar => bar.style.height = '10px');

        // Process "voice"
        authStatus.textContent = 'PROCESSING...';
        authMessage.textContent = 'Analyzing voice patterns...';

        // Animate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            progressFill.style.width = progress + '%';
            progressText.textContent = progress + '%';

            if (progress >= 30) {
                freqAnalysis.textContent = 'MATCHING';
                toneSig.textContent = 'PROCESSING';
            }

            if (progress >= 60) {
                voiceMatch.textContent = '78%';
            }

            if (progress >= 80) {
                voiceMatch.textContent = '94%';
                toneSig.textContent = 'VERIFIED';
            }

            if (progress >= 100) {
                clearInterval(progressInterval);

                setTimeout(() => {
                    authStatus.textContent = 'VOICE VERIFIED';
                    authStatus.style.color = '#00ff00';
                    authMessage.textContent = 'Voice pattern authenticated. Access granted.';
                    authMessage.style.color = '#00ff00';
                    voiceMatch.textContent = '99.7%';
                    freqAnalysis.textContent = 'COMPLETE';

                    localStorage.setItem('voice-auth', 'true');
                }, 500);
            }
        }, 50);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            localStorage.removeItem('voice-auth');
            location.reload();
        });
    }
}

// ========== RETINA AUTHENTICATION ==========

function initRetina() {
    const scanBtn = document.getElementById('scan-btn');
    const scanRing = document.getElementById('scan-ring');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const authMessage = document.getElementById('auth-message');
    const authStatus = document.querySelector('.status-text');
    const irisDiam = document.getElementById('iris-diam');
    const pupilResp = document.getElementById('pupil-resp');
    const patternNodes = document.getElementById('pattern-nodes');
    const vesselMap = document.getElementById('vessel-map');
    const retinaMatch = document.getElementById('retina-match');
    const scanQuality = document.getElementById('scan-quality');
    const liveness = document.getElementById('liveness');
    const canvas = document.getElementById('retina-canvas');
    const resetBtn = document.getElementById('reset-btn');

    let isScanning = false;

    // Draw initial retina pattern on canvas
    if (canvas) {
        drawRetinaPattern(canvas, false);
    }

    if (scanBtn) {
        scanBtn.addEventListener('click', function() {
            if (isScanning) return;

            isScanning = true;
            scanRing.classList.add('scanning');
            authStatus.textContent = 'SCANNING RETINA...';
            authMessage.textContent = 'Hold still. Do not blink.';

            // Animate progress and readings
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 2;
                progressFill.style.width = progress + '%';
                progressText.textContent = progress + '%';

                // Update readings as scan progresses
                if (progress >= 15) {
                    irisDiam.textContent = '11.3 mm';
                    drawRetinaPattern(canvas, true, progress);
                }

                if (progress >= 30) {
                    pupilResp.textContent = 'NORMAL';
                    scanQuality.textContent = 'GOOD';
                }

                if (progress >= 50) {
                    patternNodes.textContent = '247';
                    liveness.textContent = 'CONFIRMED';
                }

                if (progress >= 70) {
                    vesselMap.textContent = 'CAPTURED';
                    retinaMatch.textContent = '87%';
                }

                if (progress >= 90) {
                    retinaMatch.textContent = '98.3%';
                    scanQuality.textContent = 'EXCELLENT';
                }

                if (progress >= 100) {
                    clearInterval(progressInterval);
                    scanRing.classList.remove('scanning');

                    setTimeout(() => {
                        authStatus.textContent = 'RETINA VERIFIED';
                        authStatus.style.color = '#00ff00';
                        authMessage.textContent = 'Retinal pattern authenticated. Access granted.';
                        authMessage.style.color = '#00ff00';
                        retinaMatch.textContent = '99.9%';

                        localStorage.setItem('retina-auth', 'true');
                        isScanning = false;
                    }, 500);
                }
            }, 40);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            localStorage.removeItem('retina-auth');
            location.reload();
        });
    }
}

function drawRetinaPattern(canvas, active, progress = 0) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!active) {
        // Draw placeholder
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('AWAITING SCAN', centerX, centerY);
        return;
    }

    // Draw retina blood vessel pattern
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1;

    // Main circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Optic disc
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(centerX + 30, centerY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw blood vessels based on progress
    const numVessels = Math.floor(progress / 10);
    for (let i = 0; i < numVessels; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const length = 40 + Math.random() * 30;

        ctx.strokeStyle = `rgba(255, 0, 0, ${0.3 + Math.random() * 0.7})`;
        ctx.lineWidth = 1 + Math.random();
        ctx.beginPath();
        ctx.moveTo(centerX + 30, centerY);

        // Branching path
        let x = centerX + 30;
        let y = centerY;
        for (let j = 0; j < 5; j++) {
            x += Math.cos(angle + (Math.random() - 0.5) * 0.5) * (length / 5);
            y += Math.sin(angle + (Math.random() - 0.5) * 0.5) * (length / 5);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // Scan line effect
    if (progress < 100) {
        const scanY = (progress / 100) * canvas.height;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(canvas.width, scanY);
        ctx.stroke();
    }
}

// Add CSS animation for flash
const style = document.createElement('style');
style.textContent = `
    @keyframes flash {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(2); }
    }
`;
document.head.appendChild(style);
