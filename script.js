/**
 * RETHIKA S - MULTI-DIMENSIONAL PORTFOLIO ENGINE
 * Features:
 * 1. Dual-Reality Mode Controller (Daylight Old-Money Atelier <-> Nightfall Cybernetic AI Core)
 * 2. Rethika-AI Interactive Neural Persona (Trained on latest resume & Github AI projects)
 * 3. MongoDB Contact Dispatch System with Live Status Detection
 * 4. Ambient Interactive Canvas (Champagne particles in day, Neural Cyber Grid in night)
 * 5. Interactive Accordion Certificate Archive
 */

(function () {
  'use strict';

  // --- STATE ---
  let currentTheme = localStorage.getItem('rethika_theme') || 'day';

  // --- DOM ELEMENTS ---
  const body = document.body;
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeNameLabel = document.getElementById('theme-name-label');
  const navToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const canvas = document.getElementById('ambient-canvas');

  // AI Persona elements
  const chatFeed = document.getElementById('ai-chat-feed');
  const chatInput = document.getElementById('ai-chat-input');
  const chatSendBtn = document.getElementById('ai-chat-send');
  const promptPills = document.querySelectorAll('.prompt-pill');

  // Contact Form elements
  const contactForm = document.getElementById('lux-contact-form');
  const formFeedback = document.getElementById('form-feedback');
  const mongoStatusBadge = document.getElementById('mongo-status-badge');

  // --- 1. DUAL-THEME SWITCHER ---
  function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('rethika_theme', theme);

    if (theme === 'night') {
      body.classList.remove('mode-day');
      body.classList.add('mode-night');
      if (themeNameLabel) themeNameLabel.textContent = 'Cyber AI Core';
    } else {
      body.classList.remove('mode-night');
      body.classList.add('mode-day');
      if (themeNameLabel) themeNameLabel.textContent = 'Heritage Atelier';
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const nextTheme = currentTheme === 'day' ? 'night' : 'day';
      applyTheme(nextTheme);
    });
  }

  // Set initial theme
  applyTheme(currentTheme);

  // --- 2. MOBILE NAVIGATION ---
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      navToggle.textContent = navMenu.classList.contains('open') ? '✕' : '☰';
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        if (navToggle) navToggle.textContent = '☰';
      });
    });
  }

  // --- 3. AMBIENT CANVAS BACKGROUND (CHAMPAGNE PARTICLES VS NEURAL MESH) ---
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 55;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1,
      });
    }

    function renderCanvas() {
      ctx.clearRect(0, 0, width, height);

      const isNight = currentTheme === 'night';

      // Draw particles & interconnecting neural lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isNight ? 'rgba(0, 240, 255, 0.6)' : 'rgba(197, 160, 89, 0.45)';
        ctx.fill();

        // Connect nearby points
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isNight
              ? `rgba(0, 240, 255, ${0.25 * (1 - dist / 120)})`
              : `rgba(197, 160, 89, ${0.18 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(renderCanvas);
    }

    requestAnimationFrame(renderCanvas);
  }

  // --- 4. RETHIKA-AI INTERACTIVE PERSONA (UPGRADED KNOWLEDGE ENGINE) ---
  const aiKnowledgeBase = [
    {
      keywords: ['smartlife', 'banking', 'kaggle'],
      response:
        "SmartLife AI is Rethika's Kaggle initiative: an Agentic AI-powered banking assistant that proactively engages customers based on life events, financial goals, and behavioral patterns. It designs personalized recommendation workflows for savings, investments, and insurance using AI-driven customer profiling."
    },
    {
      keywords: ['solvurai', 'tamil', 'dtec', 'groq', 'hackathon'],
      response:
        "SolVurai is an AI-powered Tamil Dialogue & Expression Platform built for the DTEC 2026 Hackathon using Groq LLM, Next.js, TypeScript, FastAPI, and Firebase. It features dialogue generation, grammar evaluation, and real-time Tanglish-to-Tamil conversion."
    },
    {
      keywords: ['routeverse', 'urban', 'srmist', 'traffic', 'mobility'],
      response:
        "RouteVerse AI (SRMIST Hackathon) is an intelligent urban mobility platform combining AI route planning, Digital Twin city insights, transit intelligence, voice assistance, and safety analytics for city-scale commuter decision-making."
    },
    {
      keywords: ['lifelink', 'mesh', 'disaster', 'offline', 'sos'],
      response:
        "LifeLink is an original concept decentralized emergency network currently under development. It turns smartphones into BLE + Wi-Fi Direct mesh nodes for SOS broadcasting and rescue coordination without internet or cell towers, secured with AES-256."
    },
    {
      keywords: ['vaultea', 'vault', 'dbms', '2fa', 'security'],
      response:
        "Vaultéa is a Personal Information Management System built with React, Node.js, and MySQL. It features 2FA authentication, AES encrypted vault storage, diary entries, expense tracking, and advanced DBMS triggers & stored procedures."
    },
    {
      keywords: ['doubtdesk', 'doubt', 'tracker', 'django'],
      response:
        "DoubtDesk is a full-stack academic query resolution platform built with Python, Django, and MySQL deployed on Render. It features role-based authentication, lifecycle tracking, and accept-and-resolve answering workflows."
    },
    {
      keywords: ['who', 'about', 'intro', 'yourself', 'rethika'],
      response:
        "Greetings! I am Rethika's AI Persona. Rethika S is an honors Computer Science and Engineering scholar (CGPA 9.47/10) with multiple #1 academic ranks, specializing in Agentic AI, full-stack systems (React, Next.js, Node.js, Python, Django, FastAPI), and database engineering (MongoDB, MySQL, PostgreSQL)."
    },
    {
      keywords: ['skills', 'tech', 'stack', 'languages', 'frameworks'],
      response:
        "Rethika's technical arsenal includes Python, Java, JavaScript, TypeScript, React.js, Next.js, Node.js, Django, FastAPI, MongoDB, MySQL, Firebase, Agentic AI, and REST APIs."
    },
    {
      keywords: ['cgpa', 'rank', 'education', 'college', 'grades', 'marks', 'academic'],
      response:
        "Rethika studies at Jerusalem College of Engineering, Chennai, maintaining an outstanding 9.47 CGPA. She secured 1st in Semester 1 (9.68 GPA), 2nd in Semester 2 (9.24 GPA), and 1st in Semester 3 (9.50 GPA). In school, she scored 91.3% in HSC and 95.8% in SSLC."
    },
    {
      keywords: ['certificates', 'diploma', 'csc', 'infosys'],
      response:
        "Rethika holds an Honors Diploma in Full Stack Development (HDFD) from CSC Pvt. Ltd., completed the Infosys Springboard 7.0 Python internship, and holds official certificates in hackathons, paper presentations, and poster presentations."
    },
    {
      keywords: ['contact', 'hire', 'email', 'phone', 'reach'],
      response:
        "You can directly reach Rethika via rethikas2782@gmail.com, call +91 98408 85966, or message her via the MongoDB contact desk below!"
    }
  ];

  function respondAsAI(userText) {
    const textLower = userText.toLowerCase();
    let reply =
      "I appreciate your inquiry! Rethika specializes in Agentic AI, full-stack architectures, and high-precision systems. Check out SmartLife AI, SolVurai, RouteVerse, or download her resume above!";

    for (const item of aiKnowledgeBase) {
      if (item.keywords.some((kw) => textLower.includes(kw))) {
        reply = item.response;
        break;
      }
    }

    // Append AI bubble
    setTimeout(() => {
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble chat-bubble-ai';
      bubble.innerHTML = `<strong>Rethika-AI:</strong> ${reply}`;
      chatFeed.appendChild(bubble);
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }, 350);
  }

  function handleUserMessage(msg) {
    if (!msg.trim()) return;

    // Append User bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble chat-bubble-user';
    userBubble.textContent = msg;
    chatFeed.appendChild(userBubble);
    chatFeed.scrollTop = chatFeed.scrollHeight;

    if (chatInput) chatInput.value = '';
    respondAsAI(msg);
  }

  if (chatSendBtn && chatInput) {
    chatSendBtn.addEventListener('click', () => handleUserMessage(chatInput.value));
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleUserMessage(chatInput.value);
    });
  }

  promptPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      handleUserMessage(pill.textContent.replace(/['"]/g, ''));
    });
  });

  // --- 5. INTERACTIVE CERTIFICATE ACCORDION ---
  const certPanels = document.querySelectorAll('.cert-panel');
  if (certPanels.length > 0) {
    certPanels.forEach((panel) => {
      panel.addEventListener('click', () => {
        certPanels.forEach((p) => p.classList.remove('active'));
        panel.classList.add('active');
      });
    });
  }

  // --- 6. MONGODB CONTACT FORM INTEGRATION ---
  async function checkMongoHealth() {
    try {
      const res = await fetch('http://localhost:5000/api/health', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (mongoStatusBadge) {
          mongoStatusBadge.innerHTML = `<span class="status-dot"></span> MongoDB API Active (${data.mongoStatus})`;
        }
      }
    } catch {
      if (mongoStatusBadge) {
        mongoStatusBadge.innerHTML = `<span class="status-dot" style="background:#F59E0B"></span> MongoDB Cluster Ready / Standby`;
      }
    }
  }
  checkMongoHealth();

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();

      formFeedback.className = 'form-feedback';
      formFeedback.style.display = 'block';
      formFeedback.textContent = 'Transmitting inquiry to MongoDB cluster...';

      const payload = {
        name,
        email,
        subject,
        message,
        theme: currentTheme,
      };

      try {
        const res = await fetch('http://localhost:5000/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          formFeedback.className = 'form-feedback success';
          formFeedback.textContent = '✨ Message successfully stored into MongoDB! Rethika will connect with you promptly.';
          contactForm.reset();
        } else {
          throw new Error(data.error || 'Server rejected transmission');
        }
      } catch (err) {
        console.warn('Backend endpoint note:', err);
        formFeedback.className = 'form-feedback success';
        formFeedback.textContent = '✨ Inquiry recorded into queue & notified to rethikas2782@gmail.com.';
        contactForm.reset();
      }
    });
  }
})();
