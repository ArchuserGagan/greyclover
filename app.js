document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Header Scroll Effect & Active Navigation Link Sync
       ========================================================================== */
    const header = document.getElementById('main-header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Toggle header background on scroll
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active link sync based on section intersection
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}` || 
                (currentSectionId === 'home' && link.getAttribute('href') === '#')) {
                link.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       2. Scroll Reveal Animations (Slide & Fade in)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Reveal once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    /* ==========================================================================
       3. Dynamic Cursor-Aware Glowing Cards
       ========================================================================== */
    const glowCards = document.querySelectorAll('.glow-card');
    
    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    /* ==========================================================================
       4. How It Works Timeline Activations
       ========================================================================== */
    const timelineSteps = document.querySelectorAll('.timeline-step');
    
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    });

    timelineSteps.forEach(step => timelineObserver.observe(step));

    /* ==========================================================================
       5. Interactive Company Brain Terminal Simulation
       ========================================================================== */
    const terminalScreen = document.getElementById('terminal-screen');
    const queryButtons = document.querySelectorAll('.terminal-btn');
    
    const responses = {
        onboarding: {
            question: "How do we onboard new developers?",
            source: "developer_onboarding_guide_v4.md",
            confidence: "99.4%",
            steps: [
                "1. Provision workspace permissions (GitHub, Slack, AWS Cloud).",
                "2. Environment setup: run local script `npm run setup-dev`.",
                "3. Secure authorization keys via the password manager.",
                "4. Pair-program with onboarding buddy for first branch deployment."
            ]
        },
        security: {
            question: "Where is the security policy?",
            source: "security_protocol_rev2.pdf",
            confidence: "97.8%",
            steps: [
                "- Access control: Enforce multi-factor authentication (MFA) across tools.",
                "- Cryptography: Store credentials inside internal hardware keys.",
                "- Machine lock: Encrypt local volumes using disk encryption software.",
                "- Incidents: Immediately notify the systems security operations room."
            ]
        },
        holiday: {
            question: "What is the process for holiday requests?",
            source: "employee_handbook_2026.pdf",
            confidence: "95.2%",
            steps: [
                "1. Submit leave timeline through HR system 14 business days prior.",
                "2. Confirm coverage with team leads for key sprint pipelines.",
                "3. Set automated email responders and update project boards.",
                "4. Final sign-off is automatically issued upon manager approval."
            ]
        }
    };

    let typingTimeout = null;
    let sequenceTimeouts = [];

    function clearTimeouts() {
        if (typingTimeout) clearTimeout(typingTimeout);
        sequenceTimeouts.forEach(t => clearTimeout(t));
        sequenceTimeouts = [];
    }

    function typeText(element, text, speed = 20, callback = null) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                // Scroll terminal body down as we type
                terminalScreen.scrollTop = terminalScreen.scrollHeight;
                typingTimeout = setTimeout(type, speed);
            } else {
                if (callback) callback();
            }
        }
        type();
    }

    function simulateQuery(queryKey) {
        clearTimeouts();
        const data = responses[queryKey];
        if (!data) return;

        // Clear terminal display and show query entry
        terminalScreen.innerHTML = '';
        
        const queryLine = document.createElement('div');
        queryLine.className = 'terminal-line';
        queryLine.innerHTML = `<span class="terminal-prompt">></span> <span class="terminal-text"></span><span class="cursor-blink"></span>`;
        terminalScreen.appendChild(queryLine);

        const textSpan = queryLine.querySelector('.terminal-text');
        const cursor = queryLine.querySelector('.cursor-blink');

        // Step 1: Type the simulated query
        typeText(textSpan, `query --brain "${data.question}"`, 25, () => {
            cursor.remove(); // Remove blinker from the command line

            // Step 2: Show scanning/retrieval logs
            const logs = [
                `Searching 142 integrated documents...`,
                `Matching semantic nodes inside particle index...`,
                `File found: [${data.source}] (Confidence: ${data.confidence})`,
                `Synthesizing response...`
            ];

            logs.forEach((logText, index) => {
                const t = setTimeout(() => {
                    const logLine = document.createElement('div');
                    logLine.className = 'terminal-line terminal-log';
                    logLine.innerHTML = `<span class="terminal-text">${logText}</span>`;
                    terminalScreen.appendChild(logLine);
                    terminalScreen.scrollTop = terminalScreen.scrollHeight;
                }, (index + 1) * 350);
                sequenceTimeouts.push(t);
            });

            // Step 3: Type out response content
            const responseDelay = (logs.length + 1.2) * 350;
            const t = setTimeout(() => {
                const answerLine = document.createElement('div');
                answerLine.className = 'terminal-line';
                answerLine.innerHTML = `<span class="terminal-prompt">></span> <div class="terminal-text terminal-answer"></div>`;
                terminalScreen.appendChild(answerLine);

                const answerText = answerLine.querySelector('.terminal-answer');
                
                // Construct structured typewriter content
                let contentText = `### ${data.source} Answer\n\n`;
                data.steps.forEach(step => {
                    contentText += `${step}\n`;
                });
                
                // Format code linebreaks to HTML
                const htmlFormatted = contentText
                    .replace(/\n/g, '<br>')
                    .replace(/### (.*?)<br>/g, '<strong style="color: var(--accent-green)">$1</strong><br><br>');

                typeText(answerText, htmlFormatted, 10);
            }, responseDelay);
            sequenceTimeouts.push(t);
        });
    }

    // Bind click handlers to simulation buttons
    queryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const query = e.target.getAttribute('data-query');
            simulateQuery(query);
        });
    });

    // Run first simulation on load
    simulateQuery('onboarding');

    /* ==========================================================================
       6. Booking Scheduler Modal Control & Logic
       ========================================================================== */
    const modal = document.getElementById('scheduler-modal');
    const openModalButtons = document.querySelectorAll('.btn-trigger-modal');
    const closeModalButton = document.getElementById('btn-close-modal');
    const returnButton = document.getElementById('btn-success-close');
    const bookingForm = document.getElementById('booking-form');
    const bookingSuccess = document.getElementById('booking-success');
    const timeSlots = document.querySelectorAll('.time-slot');
    const bookDate = document.getElementById('book-date');
    const confirmedEmail = document.getElementById('confirmed-email');
    
    let selectedTimeSlot = '';

    // Set default booking date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    bookDate.value = `${yyyy}-${mm}-${dd}`;
    bookDate.min = `${yyyy}-${mm}-${dd}`;

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop page scrolling
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Reset form views
        setTimeout(() => {
            bookingForm.style.display = 'block';
            bookingSuccess.style.display = 'none';
            bookingForm.reset();
            selectedTimeSlot = '';
            timeSlots.forEach(s => s.classList.remove('selected'));
            bookDate.value = `${yyyy}-${mm}-${dd}`;
        }, 500);
    }

    openModalButtons.forEach(btn => btn.addEventListener('click', openModal));
    closeModalButton.addEventListener('click', closeModal);
    returnButton.addEventListener('click', closeModal);

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Handle Time Slot Selection
    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            timeSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            selectedTimeSlot = slot.getAttribute('data-time');
        });
    });

    // Handle Form Submit
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('book-email').value;
        const name = document.getElementById('book-name').value;
        
        if (!selectedTimeSlot) {
            alert('Please select a time slot.');
            return;
        }

        // Show simulated loading/sending state on the button
        const submitBtn = document.getElementById('btn-submit-booking');
        const origText = submitBtn.innerText;
        submitBtn.innerText = 'Reserving...';
        submitBtn.disabled = true;

        setTimeout(() => {
            // Transition to success state
            confirmedEmail.innerText = email;
            bookingForm.style.display = 'none';
            bookingSuccess.style.display = 'block';
            submitBtn.innerText = origText;
            submitBtn.disabled = false;
        }, 1200);
    });
});
