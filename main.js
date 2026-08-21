/* Beyond Limits Therapy & Education Center — interactions */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const formatPhone = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 10);
    return d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
      : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}`
      : d;
  };

  /* ── Preloader → hero entrance ─────────────────────────── */
  const preloader = $('#preloader');
  window.addEventListener('load', () => {
    if (reduceMotion) {
      preloader.classList.add('done');
      document.body.classList.add('is-loaded');
      return;
    }
    // logo beat → gold glint, rings, sparks & light ray → reveal
    setTimeout(() => {
      preloader.classList.add('flash');
      setTimeout(() => {
        preloader.classList.add('done');
        document.body.classList.add('is-loaded');
      }, 680);
    }, 750);
  });
  // Safety net: never trap the user behind the preloader
  setTimeout(() => {
    preloader.classList.add('done');
    document.body.classList.add('is-loaded');
  }, 4000);

  /* ── Nav: glass on scroll, progress bar, active section ── */
  const nav = $('#nav');
  const progress = $('#scrollProgress');
  const toTop = $('#toTop');
  const sections = ['about', 'approach', 'services', 'microschool', 'reviews'].map((id) => document.getElementById(id));
  const navAnchors = $$('#navLinks a');

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 700);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${(y / Math.max(max, 1)) * 100}%`;

    let current = 'home';
    for (const sec of sections) {
      if (sec && y >= sec.offsetTop - innerHeight * 0.4) current = sec.id;
    }
    navAnchors.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ── Mobile menu ───────────────────────────────────────── */
  const burger = $('#navBurger');
  const menu = $('#mobileMenu');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('.mobile-menu a').forEach((a) =>
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    })
  );

  /* ── Service garden: each flower sprouts when revealed ─── */
  // Reveal order within a batch drives the stagger (--sd). On desktop all
  // seven reveal at once; in the mobile carousel each newly-slid-in flower
  // reveals alone and sprouts immediately.
  const garden = $('#gardenRow');
  let batchTime = 0;
  let batchIdx = 0;
  const sproutIO = new IntersectionObserver(
    (entries) => {
      const now = performance.now();
      if (now - batchTime > 300) batchIdx = 0;
      batchTime = now;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.style.setProperty('--sd', `${batchIdx++ * 0.13}s`);
        e.target.classList.add('in');
        sproutIO.unobserve(e.target);
      }
    },
    { threshold: 0.35 }
  );
  const sprouts = $$('.sprout');
  sprouts.forEach((s) => sproutIO.observe(s));

  /* mobile carousel: three plants in view; advancing slides the bed and
     the newly revealed flower grows out of the ground */
  const gViewport = $('#gardenViewport');
  const G_MAX = Math.max(0, sprouts.length - 3);
  const mobileGarden = () => matchMedia('(max-width: 1080px)').matches;
  let gStep = 0;
  let gTimer;
  const gApply = () => {
    garden.style.transform = mobileGarden()
      ? `translateX(${-gStep * (gViewport.clientWidth / 3)}px)`
      : '';
  };
  const gAuto = () => {
    clearInterval(gTimer);
    if (reduceMotion) return;
    gTimer = setInterval(() => {
      if (mobileGarden() && $('.sprout.in')) gGo(gStep + 1);
    }, 4000);
  };
  // a flower re-sprouts EVERY time it slides into the window, wrap-around included
  const resprout = (el, order) => {
    sproutIO.unobserve(el);
    el.classList.add('noanim');
    el.classList.remove('in');
    el.style.setProperty('--sd', `${order * 0.13}s`);
    void el.offsetWidth; // flush so the reset lands before re-entering
    el.classList.remove('noanim');
    requestAnimationFrame(() => el.classList.add('in'));
  };
  const gGo = (n, manual) => {
    const before = new Set([gStep, gStep + 1, gStep + 2]);
    gStep = n > G_MAX ? 0 : n < 0 ? G_MAX : n;
    if (mobileGarden()) {
      const entering = [];
      for (let k = gStep; k < gStep + 3; k++) {
        if (!before.has(k) && sprouts[k]) entering.push(sprouts[k]);
      }
      entering.forEach((el, i) => resprout(el, i));
    }
    gApply();
    if (manual) gAuto();
  };
  $('#gPrev').addEventListener('click', () => gGo(gStep - 1, true));
  $('#gNext').addEventListener('click', () => gGo(gStep + 1, true));
  let gTouchX = null;
  gViewport.addEventListener('touchstart', (e) => { gTouchX = e.touches[0].clientX; }, { passive: true });
  gViewport.addEventListener('touchend', (e) => {
    if (gTouchX === null) return;
    const dx = e.changedTouches[0].clientX - gTouchX;
    if (Math.abs(dx) > 40) gGo(gStep + (dx < 0 ? 1 : -1), true);
    gTouchX = null;
  });
  addEventListener('resize', gApply);
  gAuto();

  /* ── Reveal on scroll ──────────────────────────────────── */
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  $$('[data-reveal]').forEach((el) => io.observe(el));

  /* ── Animated counters ─────────────────────────────────── */
  const counterIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        counterIO.unobserve(e.target);
        const el = e.target;
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || '';
        if (reduceMotion) { el.textContent = target + suffix; continue; }
        const t0 = performance.now();
        const dur = 1400;
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    },
    { threshold: 0.6 }
  );
  $$('[data-count]').forEach((el) => counterIO.observe(el));

  /* ── Hero: trees pop & grass rises when the meadow scrolls
         into view, then both keep parallaxing ─────────────── */
  const stage = $('#meadowStage');
  const treeLine = $('#treeLine');
  const near = $('#meadowNear');
  // The entrance waits for BOTH: the user has actually scrolled down,
  // AND the meadow strip is in view. Visibility alone isn't enough —
  // on tall screens the strip peeks above the fold at load.
  let stageSeen = false;
  let stageInView = false;
  const tryStage = () => {
    if (stageSeen || !stageInView || window.scrollY < 60) return;
    stageSeen = true;
    stage.classList.add('in'); // trees pop via CSS
    stageIO.disconnect();
    removeEventListener('scroll', tryStage);
  };
  const stageIO = new IntersectionObserver(
    (entries) => {
      stageInView = entries.some((e) => e.isIntersecting);
      tryStage();
    },
    { threshold: 0.3 }
  );
  stageIO.observe(stage);
  addEventListener('scroll', tryStage, { passive: true });

  let mouseX = 0;
  if (!reduceMotion && treeLine && near) {
    addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / innerWidth - 0.5) * 2;
    }, { passive: true });
    const easeOut = (p) => 1 - Math.pow(1 - p, 3);
    const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
    let enterStart = 0;
    const drift = (t) => {
      // grass rise begins once the meadow has been scrolled into view
      if (!enterStart && stageSeen) enterStart = t;
      let nearRise = near.offsetHeight + 20;
      if (enterStart) nearRise *= 1 - easeOut(clamp01((t - enterStart - 250) / 1300));
      treeLine.style.transform = `translateX(${mouseX * -9}px)`;
      near.style.transform = `translateX(${mouseX * -26}px) translateY(${nearRise}px)`;
      requestAnimationFrame(drift);
    };
    requestAnimationFrame(drift);
  } else if (near) {
    near.style.transform = 'none';
  }

  /* ── Hero: floating gold sparkle particles ─────────────── */
  const canvas = $('#sparkles');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let W, H, parts;
    const seed = () => {
      W = canvas.width = canvas.offsetWidth * devicePixelRatio;
      H = canvas.height = canvas.offsetHeight * devicePixelRatio;
      parts = Array.from({ length: Math.min(46, W / 30) }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (Math.random() * 1.8 + 0.6) * devicePixelRatio,
        vy: (Math.random() * 0.25 + 0.08) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.15 * devicePixelRatio,
        tw: Math.random() * Math.PI * 2,
        gold: Math.random() < 0.55,
      }));
    };
    seed();
    addEventListener('resize', seed);
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y -= p.vy;
        p.x += p.vx;
        p.tw += 0.03;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        const a = 0.25 + Math.abs(Math.sin(p.tw)) * 0.55;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.gold ? '#c9a03f' : '#8a9a5b';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.gold && p.r > 1.6) {
          // four-point star cross
          ctx.globalAlpha = a * 0.6;
          ctx.fillRect(p.x - p.r * 3, p.y - 0.5, p.r * 6, 1);
          ctx.fillRect(p.x - 0.5, p.y - p.r * 3, 1, p.r * 6);
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ── Pillar tilt on hover ──────────────────────────────── */
  if (!reduceMotion && matchMedia('(hover: hover)').matches) {
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -10;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 10;
        card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ── About: the two photos trade places on a timer ─────── */
  const photoStack = $('#photoStack');
  if (photoStack && !reduceMotion) {
    const stackImgs = $$('.stack-img', photoStack);
    const swap = () => {
      photoStack.classList.add('swapping');
      stackImgs.forEach((img) => {
        img.classList.toggle('pos-big');
        img.classList.toggle('pos-small');
      });
      setTimeout(() => photoStack.classList.remove('swapping'), 1150);
    };
    let stackTimer;
    let stackHover = false;
    let stackInView = false;
    const stackRun = () => {
      clearInterval(stackTimer);
      if (stackInView && !stackHover) stackTimer = setInterval(swap, 3500);
    };
    const stackIO = new IntersectionObserver(
      (entries) => {
        stackInView = entries.some((e) => e.isIntersecting);
        stackRun();
      },
      { threshold: 0.35 }
    );
    stackIO.observe(photoStack);
    photoStack.addEventListener('mouseenter', () => { stackHover = true; stackRun(); });
    photoStack.addEventListener('mouseleave', () => { stackHover = false; stackRun(); });
  }

  /* ── Founder stage: the grove grows only once the user has
         scrolled the stage well into view — its top must reach the
         upper 60% of the viewport. A height-ratio threshold would
         never fire on short windows, since the stage is taller
         than the viewport. ─────────────────────────────────── */
  const founderStage = $('#founderStage');
  if (founderStage) {
    const fIO = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          founderStage.classList.add('in');
          fIO.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -40% 0px' }
    );
    fIO.observe(founderStage);
  }
  /* team carousel: auto-advances every 3s on mobile, pauses while
     touching, and never yanks a card whose bio is open */
  const teamGrid = $('.team-grid');
  if (teamGrid) {
    const teamCards = $$('.team-card', teamGrid);
    const tgMobile = () => matchMedia('(max-width: 860px)').matches;
    let tgIdx = 0;
    let tgTimer;
    let tgHold = false;
    const tgCenter = (el) =>
      el.offsetLeft - teamGrid.offsetLeft - (teamGrid.clientWidth - el.clientWidth) / 2;
    const tgNext = () => {
      if (!tgMobile() || tgHold) return;
      if (teamCards.some((c) => c.classList.contains('open'))) return;
      tgIdx = (tgIdx + 1) % teamCards.length;
      teamGrid.scrollTo({ left: tgCenter(teamCards[tgIdx]), behavior: 'smooth' });
    };
    const tgStart = () => {
      clearInterval(tgTimer);
      if (!reduceMotion) tgTimer = setInterval(tgNext, 3000);
    };
    // re-bloom: when a card slides out of the carousel view, silently
    // reset its flowers so they burst open again on the next pass
    const rebloomIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!tgMobile()) continue;
          const card = e.target;
          if (e.isIntersecting) {
            if (!card.classList.contains('in')) {
              requestAnimationFrame(() => card.classList.add('in'));
            }
          } else if (card.classList.contains('in') && !card.classList.contains('open')) {
            card.classList.add('noanim');
            card.classList.remove('in');
            void card.offsetWidth; // flush so the reset lands before re-entering
            card.classList.remove('noanim');
          }
        }
      },
      { threshold: 0.5 }
    );
    teamCards.forEach((c) => rebloomIO.observe(c));
    teamGrid.addEventListener('touchstart', () => { tgHold = true; }, { passive: true });
    teamGrid.addEventListener('touchend', () => { tgHold = false; tgStart(); }, { passive: true });
    teamGrid.addEventListener('touchcancel', () => { tgHold = false; tgStart(); }, { passive: true });
    // after a manual swipe, continue from wherever the user landed
    let tgScrollT;
    teamGrid.addEventListener('scroll', () => {
      clearTimeout(tgScrollT);
      tgScrollT = setTimeout(() => {
        const center = teamGrid.scrollLeft + teamGrid.clientWidth / 2;
        let best = 0;
        let bd = Infinity;
        teamCards.forEach((el, i) => {
          const d = Math.abs(el.offsetLeft - teamGrid.offsetLeft + el.clientWidth / 2 - center);
          if (d < bd) { bd = d; best = i; }
        });
        tgIdx = best;
      }, 120);
    }, { passive: true });
    tgStart();
  }

  /* mobile-only "Read Her Story" expander in the founder bio */
  const founderToggle = $('#founderToggle');
  if (founderToggle) {
    founderToggle.addEventListener('click', () => {
      const copy = founderToggle.closest('.founder-copy');
      const open = copy.classList.toggle('open');
      founderToggle.setAttribute('aria-expanded', String(open));
      $('.ft-label', founderToggle).textContent = open ? 'Show Less' : 'Read Her Story';
    });
  }

  /* ── Team: expandable bios ─────────────────────────────── */
  $$('.team-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.team-card');
      const open = card.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      $('.tt-label', btn).textContent = open ? 'Lovely to meet you' : btn.dataset.label;
    });
  });

  /* ── Modals: service info + consultation booking ───────── */
  const SERVICES = {
    ot: {
      title: 'Occupational Therapy',
      tag: 'Confidence for the "occupations" of childhood',
      img: 'assets/img/svc-ot.jpg',
      bloom: 'assets/img/bloom-ot.png',
      body: 'Occupational therapy (OT) helps children develop the essential skills needed for the "occupations" of childhood: playing, learning, and performing daily self-care tasks. Our pediatric OT services focus on enhancing fine motor coordination, sensory processing, and emotional regulation to help your child navigate their world with greater independence. By addressing challenges in motor planning or sensory integration, we empower children to gain confidence in their physical abilities and successfully participate in home and school activities.',
      points: ['Fine motor coordination', 'Sensory processing', 'Emotional regulation', 'Independence at home & school'],
      interest: 'Occupational Therapy',
    },
    speech: {
      title: 'Speech Therapy',
      tag: 'Helping children find their voice',
      img: 'assets/img/svc-speech.jpg',
      bloom: 'assets/img/bloom-speech.png',
      body: 'Speech and language therapy is dedicated to helping children find their voice and connect with those around them. We support a wide range of communication needs, from articulation and speech delays to social pragmatics and language comprehension. Our therapists work one-on-one with your child to build the foundational skills necessary for clear expression and meaningful interaction. Whether your child is working on stuttering, expanding their vocabulary, or improving social skills, we provide the tools to help them communicate with ease and confidence.',
      points: ['Articulation & speech delays', 'Language comprehension', 'Social pragmatics', 'Vocabulary & fluency'],
      interest: 'Speech Therapy',
    },
    tutoring: {
      title: 'Academic Tutoring',
      tag: 'Beyond the grade — toward a love of learning',
      img: 'assets/img/svc-tutoring.jpg',
      bloom: 'assets/img/bloom-tutoring.png',
      body: 'Our academic tutoring services go beyond simple homework help to provide a personalized learning experience that builds both competence and confidence. We offer specialized support in core subjects like math, reading, and writing, tailoring every session to your child’s unique learning style and academic goals. By identifying and closing learning gaps while teaching effective study habits, we help students move beyond the grade and develop a genuine love for learning. Our goal is to transform academic frustration into a sense of accomplishment and classroom success.',
      points: ['Math, reading & writing', 'Tailored to learning style', 'Effective study habits', 'Confidence & accomplishment'],
      interest: 'Academic Tutoring',
    },
    micro: {
      title: 'Micro School Program',
      tag: 'A school day that bends to fit your child',
      img: 'assets/img/svc-microschool.jpg',
      bloom: 'assets/img/bloom-micro.png',
      body: 'Our Micro School offers small class sizes with individualized attention in a nurturing, supportive setting designed for children with diverse learning needs. Each student receives an individual evaluation to help create a personalized program focused on their strengths, goals, and unique needs. Our approach combines academics, life skills, movement, creativity, and social development in a meaningful and engaging way.',
      points: ['Small class sizes', 'Individualized learning plans', 'One-on-one support included', 'All staff CPR certified'],
      note: '<strong>Programs from $28,000/year</strong><br />Registration $350 &middot; Hands-on supply fee $500 &middot; Depending on your child’s individual needs and services.',
      link: { href: '#microschool', label: 'See the full program' },
      interest: 'Micro School enrollment',
    },
    art: {
      title: 'Art & Music Therapy',
      tag: 'Creative expression as a path to growth',
      img: 'assets/img/micro-arts.jpg',
      bloom: 'assets/img/bloom-art.png',
      body: 'Part of our Micro School day, art and music give children a joyful way to express themselves, build focus, and grow fine motor and social skills. Creative sessions are woven into each student’s personalized program, so every child can explore, create, and shine in their own way.',
      points: ['Creative self-expression', 'Focus & fine motor skills', 'Confidence through creating', 'Part of the Micro School day'],
      link: { href: '#microschool', label: 'Explore the Micro School' },
      interest: 'Micro School enrollment',
    },
    equine: {
      title: 'Animal & Horse Therapy',
      tag: 'Gentle partners in building confidence',
      img: 'assets/img/micro-horse.jpg',
      bloom: 'assets/img/bloom-equine.png',
      body: 'Time with animals — including our equine sessions — is one of the most loved parts of the Beyond Limits Micro School. Caring for and connecting with a gentle animal helps children practice patience, empathy, communication, and calm confidence in a way no classroom can.',
      points: ['Patience & empathy', 'Calm, regulated confidence', 'Communication without words', 'Part of the Micro School day'],
      link: { href: '#microschool', label: 'Explore the Micro School' },
      interest: 'Micro School enrollment',
    },
    yoga: {
      title: 'Yoga & Physical Education',
      tag: 'Strong bodies, settled minds',
      img: 'assets/img/micro-yoga.jpg',
      bloom: 'assets/img/bloom-yoga.png',
      body: 'Movement is built into every Micro School day. Yoga and physical education help children develop body awareness, balance, and self-regulation — playful, therapeutic movement that supports learning everywhere else in their program.',
      points: ['Body awareness & balance', 'Self-regulation', 'Playful, therapeutic movement', 'Part of the Micro School day'],
      link: { href: '#microschool', label: 'Explore the Micro School' },
      interest: 'Micro School enrollment',
    },
  };

  const INTERESTS = ['General question', 'Occupational Therapy', 'Speech Therapy', 'Academic Tutoring', 'Micro School enrollment'];
  const ov = $('#modalOv');
  const modalBox = $('#modalBox');
  let lastFocus = null;

  const openModal = (html) => {
    lastFocus = document.activeElement;
    modalBox.innerHTML = `<button class="mo-x" aria-label="Close">✕</button>${html}`;
    ov.hidden = false;
    requestAnimationFrame(() => ov.classList.add('open'));
    document.body.style.overflow = 'hidden';
    $('.mo-x', modalBox).addEventListener('click', closeModal);
    $('.mo-x', modalBox).focus();
    const mp = $('#moPhone', modalBox);
    if (mp) mp.addEventListener('input', () => { mp.value = formatPhone(mp.value); });
    const mf = $('#consultForm', modalBox);
    if (mf) mf.addEventListener('submit', submitConsult);
    $$('a[href^="#"]', modalBox).forEach((a) => a.addEventListener('click', closeModal));
  };
  const closeModal = () => {
    ov.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { ov.hidden = true; modalBox.innerHTML = ''; }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  ov.addEventListener('mousedown', (e) => { if (e.target === ov) closeModal(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !ov.hidden) closeModal(); });

  const serviceModal = (key) => {
    const s = SERVICES[key];
    if (!s) return;
    openModal(`
      <div class="mo-media"><img src="${s.img}" alt="" /><img class="mo-bloom" src="${s.bloom}" alt="" /></div>
      <div class="mo-body">
        <span class="mo-kicker">✦ Beyond Limits</span>
        <h3 class="mo-title">${s.title}</h3>
        <p class="mo-tag">${s.tag}</p>
        <p>${s.body}</p>
        <ul class="mo-points">${s.points.map((p) => `<li>${p}</li>`).join('')}</ul>
        ${s.note ? `<div class="mo-note">${s.note}</div>` : ''}
        <div class="mo-ctas">
          <button class="btn gold" data-consult data-interest="${s.interest}">Book a Consultation</button>
          ${s.link ? `<a class="btn ghost" href="${s.link.href}">${s.link.label}</a>` : `<a class="btn ghost" href="#contact">Contact us</a>`}
        </div>
      </div>`);
  };

  const consultModal = (interest) => {
    openModal(`
      <div class="mo-body" style="text-align:center">
        <img class="mo-logo" src="assets/img/logo-icon.png" alt="" />
        <h3 class="mo-title">Book a Consultation</h3>
        <p class="mo-tag">Tell us a little about your child — we’ll reach out within one business day.</p>
        <form class="mo-form" id="consultForm" novalidate>
          <label>Parent / guardian name <input name="name" type="text" required placeholder="Jane Rivera" autocomplete="name" /></label>
          <div class="mo-row">
            <label>Email <input name="email" type="email" required placeholder="you@example.com" autocomplete="email" /></label>
            <label>Phone <input name="phone" id="moPhone" type="tel" required placeholder="(555) 000-0000" autocomplete="tel" inputmode="tel" maxlength="14" /></label>
          </div>
          <div class="mo-row">
            <label>Child’s age <small>(optional)</small> <input name="age" type="text" placeholder="e.g. 7" inputmode="numeric" maxlength="2" /></label>
            <label>I’m interested in
              <select name="interest">${INTERESTS.map((i) => `<option${i === interest ? ' selected' : ''}>${i}</option>`).join('')}</select>
            </label>
          </div>
          <label>What would you like us to know? <textarea name="msg" rows="3" required placeholder="Tell us about your child and what you’re looking for…"></textarea></label>
          <button type="submit" class="btn gold lg block">Request Consultation ✦</button>
          <p class="mo-fine">Submitting opens your email app with everything pre-filled — nothing is sent until you press send.</p>
        </form>
      </div>`);
  };

  function submitConsult(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;
    const f = new FormData(form);
    const subject = encodeURIComponent(`Consultation request from ${f.get('name')} — ${f.get('interest')}`);
    const body = encodeURIComponent([
      `Name: ${f.get('name')}`,
      `Email: ${f.get('email')}`,
      `Phone: ${f.get('phone')}`,
      `Child's age: ${f.get('age') || '—'}`,
      `Interested in: ${f.get('interest')}`,
      '',
      f.get('msg'),
    ].join('\n'));
    window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
    form.outerHTML = `
      <div class="mo-done">
        <div class="fd-check">✓</div>
        <h4>Almost there!</h4>
        <p>Your email app should have opened with your request ready to send. We’ll get back to you within one business day.</p>
      </div>`;
  }

  document.addEventListener('click', (e) => {
    const s = e.target.closest('[data-service]');
    if (s) { e.preventDefault(); serviceModal(s.dataset.service); return; }
    const c = e.target.closest('[data-consult]');
    if (c) { e.preventDefault(); consultModal(c.dataset.interest || 'General question'); }
  });

  /* ── Micro School photobook ────────────────────────────── */
  const bookScene = $('#bookScene');
  if (bookScene) {
    const book = $('#book', bookScene);
    const bkSheets = $$('.sheet', book).sort((a, b) => +a.dataset.sheet - +b.dataset.sheet);
    const bkDots = $('#bkDots');
    const bkPrev = $('#bkPrev');
    const bkNext = $('#bkNext');
    const BN = bkSheets.length;
    let bkStep = 0; // number of sheets turned; 0 = closed on the cover
    let bkBusy = false;
    let bkInView = false;
    let bkTimer;

    for (let i = 0; i <= BN; i++) {
      const b = document.createElement('button');
      b.setAttribute('aria-label', i === 0 ? 'Album cover' : `Album spread ${i}`);
      b.addEventListener('click', () => bkGo(i, true));
      bkDots.appendChild(b);
    }
    const bkPaint = () => {
      $$('button', bkDots).forEach((d, i) => d.classList.toggle('on', i === bkStep));
      bkPrev.disabled = bkStep === 0;
      book.classList.toggle('closed', bkStep === 0);
      bkSheets.forEach((sh, i) => sh.classList.toggle('turned', i < bkStep));
    };
    // resting z-order: right stack shows lowest index on top,
    // left stack shows the most recently turned sheet on top
    const bkSettle = () => {
      bkSheets.forEach((sh, i) => { sh.style.zIndex = i < bkStep ? 1 + i : BN - i; });
    };
    // a page turns every 3 seconds while the album is in view;
    // past the last spread it closes back onto the cover and loops
    const bkAdvance = () => (bkStep >= BN ? 0 : bkStep + 1);
    const bkAuto = () => {
      clearInterval(bkTimer);
      if (reduceMotion) return;
      bkTimer = setInterval(() => {
        if (!bkInView || bkBusy) return;
        bkGo(bkAdvance());
      }, 3000);
    };
    const bkGo = (n, manual) => {
      n = Math.max(0, Math.min(BN, n));
      if (n === bkStep || bkBusy) return;
      if (manual) bkAuto();
      // sheets in flight ride above both stacks; a multi-sheet jump
      // (like closing the whole album) riffles them, and a sheet that
      // departs later must land on top of the ones already down —
      // closing, the cover flies last and finishes above everything
      const lo = Math.min(n, bkStep);
      const hi = Math.max(n, bkStep);
      const span = hi - lo;
      for (let i = lo; i < hi; i++) {
        const sh = bkSheets[i];
        const rank = n > bkStep ? i - lo : hi - 1 - i; // 0 departs first
        sh.style.zIndex = 21 + rank;
        sh.style.transitionDelay = span > 1 ? `${rank * 0.09}s` : '';
      }
      bkStep = n;
      bkBusy = true;
      bkPaint();
      setTimeout(() => {
        bkBusy = false;
        bkSheets.forEach((sh) => { sh.style.transitionDelay = ''; });
        bkSettle();
      }, 1180 + (span > 1 ? span * 90 : 0));
    };
    bkPaint();
    bkSettle();
    bkPrev.addEventListener('click', () => bkGo(bkStep - 1, true));
    bkNext.addEventListener('click', () => bkGo(bkAdvance(), true));
    // tapping a right-hand page turns forward, a left-hand page back
    book.addEventListener('click', (e) => {
      if (e.target.closest('[data-consult]')) return;
      const face = e.target.closest('.face');
      if (!face) return;
      bkGo(bkStep + (face.classList.contains('back') ? -1 : 1), true);
    });
    let bkX = null;
    book.addEventListener('touchstart', (e) => { bkX = e.touches[0].clientX; }, { passive: true });
    book.addEventListener('touchend', (e) => {
      if (bkX === null) return;
      const dx = e.changedTouches[0].clientX - bkX;
      if (Math.abs(dx) > 45) bkGo(bkStep + (dx < 0 ? 1 : -1), true);
      bkX = null;
    }, { passive: true });
    // entrance: the closed album rises in, opens itself, then keeps
    // turning. Top-edge trigger, not a height ratio — on mobile the
    // stacked pages are taller than any viewport, so a ratio
    // threshold would never fire and the book would stay hidden.
    const bkIO = new IntersectionObserver(
      (entries) => {
        bkInView = entries.some((e) => e.isIntersecting);
        if (bkInView && !bookScene.classList.contains('in')) {
          bookScene.classList.add('in');
          setTimeout(() => {
            if (bkStep === 0) bkGo(1);
            bkAuto();
          }, reduceMotion ? 0 : 1400);
        }
      },
      { threshold: 0, rootMargin: '0px 0px -30% 0px' }
    );
    bkIO.observe(bookScene);
  }

  /* ── Reviews: dynamic carousel + submissions + keeper ──── */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PENDING_KEY = 'bl_pending_reviews';
  const getPending = () => {
    try { return JSON.parse(localStorage.getItem(PENDING_KEY)) || []; } catch { return []; }
  };
  const allReviews = () => [
    ...(window.BL_REVIEWS || []),
    ...getPending().map((r) => ({ ...r, pending: true })),
  ];

  const track = $('#reviewTrack');
  const dotsBox = $('#rvDots');
  let rvIndex = 0;
  let rvTimer;
  let rvCount = 0;

  const rvRender = () => {
    $$('.review', track).forEach((r, i) => r.classList.toggle('is-active', i === rvIndex));
    $$('button', dotsBox).forEach((d, i) => d.classList.toggle('on', i === rvIndex));
  };
  const go = (i, manual) => {
    rvIndex = ((i % rvCount) + rvCount) % rvCount;
    rvRender();
    if (manual) restartAuto();
  };
  const restartAuto = () => {
    clearInterval(rvTimer);
    if (!reduceMotion) rvTimer = setInterval(() => go(rvIndex + 1), 6000);
  };
  const buildReviews = (showIndex) => {
    const list = allReviews();
    rvCount = list.length;
    track.innerHTML = list.map((r) => `
      <blockquote class="review">
        <div class="stars">${'★'.repeat(Math.min(5, Math.max(1, r.stars || 5)))}</div>
        <p>“${esc(r.text)}”</p>
        <footer>— ${esc(r.author)}</footer>
        ${r.pending ? '<span class="rv-pending">✦ Pending review — currently visible only on your device</span>' : ''}
      </blockquote>`).join('');
    dotsBox.innerHTML = '';
    list.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Review ${i + 1}`);
      b.addEventListener('click', () => go(i, true));
      dotsBox.appendChild(b);
    });
    rvIndex = Math.min(showIndex ?? 0, rvCount - 1);
    rvRender();
    restartAuto();
  };
  $('#rvPrev').addEventListener('click', () => go(rvIndex - 1, true));
  $('#rvNext').addEventListener('click', () => go(rvIndex + 1, true));
  buildReviews();

  /* flower-themed "share your story" popup */
  let rvStars = 5;
  const starRowHTML = () =>
    [1, 2, 3, 4, 5].map((n) =>
      `<button type="button" class="rate-star${n <= rvStars ? ' on' : ''}" data-star="${n}" aria-label="${n} star${n > 1 ? 's' : ''}">
        <img src="assets/img/bloom-micro.png" alt="" /></button>`).join('');
  const reviewModal = () => {
    rvStars = 5;
    openModal(`
      <div class="mo-body" style="text-align:center">
        <img class="mo-logo" src="assets/img/bloom-art.png" alt="" />
        <h3 class="mo-title">Share Your Story</h3>
        <p class="mo-tag">How has Beyond Limits helped your child grow?</p>
        <form class="mo-form" id="reviewForm" novalidate>
          <div class="rate-row" id="rateRow" role="radiogroup" aria-label="Your rating">${starRowHTML()}</div>
          <div class="mo-row">
            <label>Your name <small>(as shown)</small> <input name="author" type="text" required placeholder="Maria R." maxlength="60" /></label>
            <label>You are
              <select name="role">
                <option>a parent</option><option>a guardian</option><option>a grandparent</option><option>family</option>
              </select>
            </label>
          </div>
          <label>Your review <textarea name="text" rows="4" required maxlength="600" placeholder="Tell other families about your experience…"></textarea></label>
          <button type="submit" class="btn gold lg block">Publish Review ✦</button>
          <p class="mo-fine">Your review appears on this page right away and is sent to our team to be published for everyone.</p>
        </form>
      </div>`);
    $('#rateRow', modalBox).addEventListener('click', (e) => {
      const b = e.target.closest('[data-star]');
      if (!b) return;
      rvStars = +b.dataset.star;
      $$('.rate-star', modalBox).forEach((s) => s.classList.toggle('on', +s.dataset.star <= rvStars));
    });
    $('#reviewForm', modalBox).addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      if (!form.reportValidity()) return;
      const f = new FormData(form);
      const review = {
        stars: rvStars,
        text: f.get('text').trim(),
        author: `${f.get('author').trim()}, ${f.get('role')}`,
      };
      const pending = getPending();
      pending.push(review);
      try { localStorage.setItem(PENDING_KEY, JSON.stringify(pending)); } catch {}
      buildReviews(allReviews().length - 1);
      const subject = encodeURIComponent(`New website review from ${f.get('author')}`);
      const body = encodeURIComponent(
        `Rating: ${'★'.repeat(rvStars)} (${rvStars}/5)\nName: ${review.author}\n\n${review.text}\n\n— Submitted from the website review form. To publish it for everyone, open the site with #garden-keeper and add it, then upload the downloaded reviews.js.`);
      window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
      form.outerHTML = `
        <div class="mo-done">
          <div class="fd-check">✓</div>
          <h4>Thank you for sharing! 🌼</h4>
          <p>Your review is now visible on this device, and your email app should have opened to send it to our team — once approved it will bloom for everyone.</p>
        </div>`;
    });
  };
  $('#addReviewBtn').addEventListener('click', reviewModal);

  /* ── Garden Keeper: owner panel (open site with #garden-keeper).
       Edits the review list and downloads a fresh reviews.js to
       upload to the web host — no backend needed. ─────────── */
  let gkList = null;
  const gkItemHTML = (r, i, n) => `
    <div class="gk-item" data-i="${i}">
      <div class="gk-meta">
        <select class="gk-stars">${[1,2,3,4,5].map((s) =>
          `<option value="${s}"${s === (r.stars || 5) ? ' selected' : ''}>${'★'.repeat(s)}</option>`).join('')}</select>
        <input class="gk-author" value="${esc(r.author)}" placeholder="Shown as (e.g. Maria R., a parent)" />
      </div>
      <textarea class="gk-text" rows="3">${esc(r.text)}</textarea>
      <div class="gk-actions">
        <button type="button" data-act="up" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button type="button" data-act="down" ${i === n - 1 ? 'disabled' : ''}>↓</button>
        <button type="button" data-act="del">Delete</button>
      </div>
    </div>`;
  const keeperModal = () => {
    if (!gkList) gkList = JSON.parse(JSON.stringify(window.BL_REVIEWS || []));
    openModal(`
      <div class="mo-body">
        <span class="mo-kicker">✦ Owner tools</span>
        <h3 class="mo-title">Garden Keeper</h3>
        <p class="mo-tag">Manage the reviews shown on the site</p>
        <div class="gk-list">${gkList.map((r, i) => gkItemHTML(r, i, gkList.length)).join('')}</div>
        <div class="mo-ctas">
          <button type="button" class="btn ghost" id="gkAdd">+ Add review</button>
          <button type="button" class="btn gold" id="gkDownload">Download reviews.js ✦</button>
        </div>
        <div class="mo-note">Reviews submitted by visitors arrive in your <strong>email inbox</strong>. Paste approved ones here, then click
        <strong>Download reviews.js</strong> and replace that file on your web host — the site updates for everyone. Nothing here changes the live site until you upload the file.</div>
      </div>`);
    const syncFromDOM = () => {
      $$('.gk-item', modalBox).forEach((el) => {
        const i = +el.dataset.i;
        gkList[i] = {
          stars: +$('.gk-stars', el).value,
          text: $('.gk-text', el).value.trim(),
          author: $('.gk-author', el).value.trim(),
        };
      });
    };
    if (modalBox._gkHandler) modalBox.removeEventListener('click', modalBox._gkHandler);
    modalBox._gkHandler = gkClicks;
    modalBox.addEventListener('click', gkClicks);
    function gkClicks(e) {
      if (!$('.gk-list', modalBox)) return; // only act while the keeper is open
      const act = e.target.closest('[data-act]');
      if (act) {
        syncFromDOM();
        const i = +act.closest('.gk-item').dataset.i;
        if (act.dataset.act === 'del') gkList.splice(i, 1);
        if (act.dataset.act === 'up' && i > 0) [gkList[i - 1], gkList[i]] = [gkList[i], gkList[i - 1]];
        if (act.dataset.act === 'down' && i < gkList.length - 1) [gkList[i + 1], gkList[i]] = [gkList[i], gkList[i + 1]];
        keeperModal();
        return;
      }
      if (e.target.id === 'gkAdd') {
        syncFromDOM();
        gkList.push({ stars: 5, text: '', author: '' });
        keeperModal();
      }
      if (e.target.id === 'gkDownload') {
        syncFromDOM();
        const clean = gkList.filter((r) => r.text && r.author);
        const content =
          '// Beyond Limits — published reviews.\n' +
          '// Generated by the Garden Keeper panel (open the site with #garden-keeper).\n' +
          '// Replace this file on your web host to update the site for everyone.\n' +
          'window.BL_REVIEWS = ' + JSON.stringify(clean, null, 2) + ';\n';
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([content], { type: 'text/javascript' }));
        a.download = 'reviews.js';
        a.click();
        URL.revokeObjectURL(a.href);
        window.BL_REVIEWS = clean;
        buildReviews();
      }
    }
  };
  const checkKeeper = () => { if (location.hash === '#garden-keeper') keeperModal(); };
  addEventListener('hashchange', checkKeeper);
  checkKeeper();

  /* ── Approach carousel: auto-rotates on mobile, pauses
         while the user is touching, resumes on release ────── */
  const pillarsBox = $('.pillars');
  const pillarEls = $$('.pillar');
  const apMobile = () => matchMedia('(max-width: 700px)').matches;
  let apIdx = 0;
  let apTimer;
  let apHold = false;
  const apCenter = (el) =>
    el.offsetLeft - pillarsBox.offsetLeft - (pillarsBox.clientWidth - el.clientWidth) / 2;
  const apNext = () => {
    if (!apMobile() || apHold) return;
    apIdx = (apIdx + 1) % pillarEls.length;
    pillarsBox.scrollTo({ left: apCenter(pillarEls[apIdx]), behavior: 'smooth' });
  };
  const apStart = () => {
    clearInterval(apTimer);
    if (!reduceMotion) apTimer = setInterval(apNext, 3000);
  };
  pillarsBox.addEventListener('touchstart', () => { apHold = true; }, { passive: true });
  pillarsBox.addEventListener('touchend', () => { apHold = false; apStart(); }, { passive: true });
  pillarsBox.addEventListener('touchcancel', () => { apHold = false; apStart(); }, { passive: true });
  // after a manual swipe, continue rotating from wherever the user landed
  let apScrollT;
  pillarsBox.addEventListener('scroll', () => {
    clearTimeout(apScrollT);
    apScrollT = setTimeout(() => {
      const center = pillarsBox.scrollLeft + pillarsBox.clientWidth / 2;
      let best = 0;
      let bd = Infinity;
      pillarEls.forEach((el, i) => {
        const d = Math.abs(el.offsetLeft - pillarsBox.offsetLeft + el.clientWidth / 2 - center);
        if (d < bd) { bd = d; best = i; }
      });
      apIdx = best;
    }, 120);
  }, { passive: true });
  apStart();

  /* ── Contact ───────────────────────────────────────────── */
  const ADMIN_EMAIL = 'hello@beyondlimitstherapy.com'; // UPDATE before launch

  /* ── Footer year ───────────────────────────────────────── */
  $('#year').textContent = new Date().getFullYear();
})();
