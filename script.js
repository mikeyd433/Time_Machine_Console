// T.I.M.E. Machine Console JavaScript

// ========== 7-SEGMENT DISPLAY ==========

// Segment map: which segments are ON for each character
// Segments: a=top, b=top-right, c=bottom-right, d=bottom, e=bottom-left, f=top-left, g=middle
const SEGMENT_MAP = {
    '0': ['a', 'b', 'c', 'd', 'e', 'f'],
    '1': ['b', 'c'],
    '2': ['a', 'b', 'g', 'e', 'd'],
    '3': ['a', 'b', 'g', 'c', 'd'],
    '4': ['f', 'g', 'b', 'c'],
    '5': ['a', 'f', 'g', 'c', 'd'],
    '6': ['a', 'f', 'g', 'e', 'd', 'c'],
    '7': ['a', 'b', 'c'],
    '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    '9': ['a', 'b', 'c', 'd', 'f', 'g'],
    '-': ['g'],
    ' ': [],
    '': []
};

// Create segment HTML for a single digit
function createSegmentDigit() {
    const digit = document.createElement('div');
    digit.className = 'seg-digit';
    digit.innerHTML = `
        <div class="seg seg-a"></div>
        <div class="seg seg-b"></div>
        <div class="seg seg-c"></div>
        <div class="seg seg-d"></div>
        <div class="seg seg-e"></div>
        <div class="seg seg-f"></div>
        <div class="seg seg-g"></div>
        <div class="seg seg-dp"></div>
    `;
    return digit;
}

// Initialize all 7-segment displays on the page
function initSevenSegDisplays() {
    const displays = document.querySelectorAll('.seven-seg-display');
    displays.forEach(display => {
        const numDigits = parseInt(display.dataset.digits) || 2;
        const initialValue = display.dataset.value || '';

        // Clear existing content
        display.innerHTML = '';

        // Create segment digits
        for (let i = 0; i < numDigits; i++) {
            display.appendChild(createSegmentDigit());
        }

        // Set initial value
        if (initialValue) {
            setSegmentDisplay(display, initialValue);
        }
    });
}

// Update a 7-segment display with a value
function setSegmentDisplay(display, value) {
    if (typeof display === 'string') {
        display = document.getElementById(display);
    }
    if (!display) return;

    const digits = display.querySelectorAll('.seg-digit');
    const numDigits = digits.length;
    const paddedValue = String(value).padStart(numDigits, ' ');

    digits.forEach((digit, i) => {
        const char = paddedValue[i];
        const segments = SEGMENT_MAP[char] || [];

        // Update each segment
        ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach(seg => {
            const segEl = digit.querySelector(`.seg-${seg}`);
            if (segEl) {
                if (segments.includes(seg)) {
                    segEl.classList.add('on');
                } else {
                    segEl.classList.remove('on');
                }
            }
        });
    });
}

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
    // Check if we're on the main page and need to redirect to auth
    if (document.querySelector('.console-frame') && !document.querySelector('.auth-page')) {
        const redirectToAuth = checkAuthAndRedirect();
        if (redirectToAuth) return; // Don't initialize if redirecting
    }

    // Initialize 7-segment displays
    initSevenSegDisplays();

    // Initialize menu
    initMenu();

    // Initialize numpad
    initNumpad();

    // Initialize step navigation
    initStepNavigation();

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

// Check auth status and redirect to first incomplete auth page
function checkAuthAndRedirect() {
    const fp = localStorage.getItem('fingerprint-auth') === 'true';
    const voice = localStorage.getItem('voice-auth') === 'true';
    const retina = localStorage.getItem('retina-auth') === 'true';

    if (!fp) {
        window.location.href = 'fingerprint.html';
        return true;
    } else if (!voice) {
        window.location.href = 'voice.html';
        return true;
    } else if (!retina) {
        window.location.href = 'retina.html';
        return true;
    }
    return false;
}

// Get the next auth page after completing current one
function getNextAuthPage(current) {
    const fp = localStorage.getItem('fingerprint-auth') === 'true';
    const voice = localStorage.getItem('voice-auth') === 'true';
    const retina = localStorage.getItem('retina-auth') === 'true';

    if (current === 'fingerprint') {
        if (!voice) return 'voice.html';
        if (!retina) return 'retina.html';
        return 'index.html';
    } else if (current === 'voice') {
        if (!retina) return 'retina.html';
        return 'index.html';
    } else if (current === 'retina') {
        return 'index.html';
    }
    return 'index.html';
}

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

// Step navigation
function initStepNavigation() {
    const btnToControls = document.getElementById('btn-to-controls');
    const btnBackDate = document.getElementById('btn-back-date');
    const btnArm = document.getElementById('btn-arm');
    const btnBackControls = document.getElementById('btn-back-controls');

    if (btnToControls) {
        btnToControls.addEventListener('click', () => showStep('step-controls'));
    }
    if (btnBackDate) {
        btnBackDate.addEventListener('click', () => showStep('step-date'));
    }
    if (btnArm) {
        btnArm.addEventListener('click', () => {
            // Arm the system - show engage step
            showStep('step-engage');
            // Activate indicators
            const standby = document.getElementById('ind-standby');
            const ready = document.getElementById('ind-ready');
            if (standby) standby.classList.remove('active');
            if (ready) ready.classList.add('active');
        });
    }
    if (btnBackControls) {
        btnBackControls.addEventListener('click', () => {
            // Disarm - go back to controls
            showStep('step-controls');
            const standby = document.getElementById('ind-standby');
            const ready = document.getElementById('ind-ready');
            if (standby) standby.classList.add('active');
            if (ready) ready.classList.remove('active');
        });
    }
}

function showStep(stepId) {
    const steps = document.querySelectorAll('.console-step');
    steps.forEach(step => step.classList.remove('active'));

    const targetStep = document.getElementById(stepId);
    if (targetStep) {
        targetStep.classList.add('active');
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
    const padded = numpadBuffer.padStart(4, '-');
    setSegmentDisplay('numpad-display', padded);
}

function applyNumpadValue() {
    const targetDisplay = document.getElementById(currentTarget);
    if (!targetDisplay || !numpadBuffer) return;

    const maxLen = maxLengths[currentTarget];
    const padded = numpadBuffer.padStart(maxLen, '0');

    setSegmentDisplay(targetDisplay, padded);

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
    setSegmentDisplay(displayId, value);
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

    // Useless buttons - now just flash random indicators
    const buttons = document.querySelectorAll('.useless-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            playClick();
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
            flashRandom();
        });
    });

    // Initialize sliders
    initSliders();

    // Engage button
    const engageBtn = document.getElementById('engage-btn');
    if (engageBtn) {
        engageBtn.addEventListener('click', function() {
            initiateEngageSequence();
        });
    }
}

function initSliders() {
    const powerSlider = document.getElementById('power-slider');
    const fluxSlider = document.getElementById('flux-slider');
    const stabilitySlider = document.getElementById('stability-slider');

    const sliders = [powerSlider, fluxSlider, stabilitySlider].filter(Boolean);

    sliders.forEach(slider => {
        slider.addEventListener('input', updateGaugesFromSliders);

        // Prevent page scroll while dragging slider on mobile
        slider.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        }, { passive: true });

        slider.addEventListener('touchmove', function(e) {
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });
    });

    // Initial update
    updateGaugesFromSliders();
}

function updateGaugesFromSliders() {
    const powerSlider = document.getElementById('power-slider');
    const fluxSlider = document.getElementById('flux-slider');
    const stabilitySlider = document.getElementById('stability-slider');

    const power = powerSlider ? parseInt(powerSlider.value) : 50;
    const flux = fluxSlider ? parseInt(fluxSlider.value) : 50;
    const stability = stabilitySlider ? parseInt(stabilitySlider.value) : 50;

    // Update slider value displays
    const powerValue = document.getElementById('power-slider-value');
    const fluxValue = document.getElementById('flux-slider-value');
    const stabilityValue = document.getElementById('stability-slider-value');

    if (powerValue) powerValue.textContent = power + '%';
    if (fluxValue) fluxValue.textContent = flux + '%';
    if (stabilityValue) stabilityValue.textContent = stability + '%';

    // Calculate gauge values with cross-effects
    // Power gauge: affected by power (80%) and stability (20%)
    const powerGaugeVal = Math.min(100, (power * 0.8) + (stability * 0.2));
    // Flux gauge: affected by flux (70%) and power (30%)
    const fluxGaugeVal = Math.min(100, (flux * 0.7) + (power * 0.3));
    // Integrity gauge: affected by stability (75%) and inverse of flux (25%)
    const integrityGaugeVal = Math.min(100, (stability * 0.75) + ((100 - flux) * 0.25));

    // Update gauge bars
    const powerGauge = document.getElementById('power-gauge');
    const fluxGauge = document.getElementById('flux-gauge');
    const integrityGauge = document.getElementById('integrity-gauge');

    if (powerGauge) powerGauge.style.width = powerGaugeVal + '%';
    if (fluxGauge) fluxGauge.style.width = fluxGaugeVal + '%';
    if (integrityGauge) integrityGauge.style.width = integrityGaugeVal + '%';

    // Update gauge value text
    const powerGaugeText = powerGauge?.parentElement?.nextElementSibling;
    const fluxGaugeText = fluxGauge?.parentElement?.nextElementSibling;
    const integrityGaugeText = integrityGauge?.parentElement?.nextElementSibling;

    if (powerGaugeText) powerGaugeText.textContent = (powerGaugeVal * 0.0165).toFixed(2) + ' GW';
    if (fluxGaugeText) fluxGaugeText.textContent = Math.round(fluxGaugeVal * 0.88) + ' MPH';
    if (integrityGaugeText) integrityGaugeText.textContent = integrityGaugeVal.toFixed(1) + '%';
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

            // Redirect to next auth page after short delay
            setTimeout(() => {
                window.location.href = getNextAuthPage('fingerprint');
            }, 1500);
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

                    // Redirect to next auth page after short delay
                    setTimeout(() => {
                        window.location.href = getNextAuthPage('voice');
                    }, 1500);
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

                        // Redirect to main console after short delay
                        setTimeout(() => {
                            window.location.href = getNextAuthPage('retina');
                        }, 1500);
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
