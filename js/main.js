/* The Club Customs: site interactions */
(function () {
  const CFG = window.CLUB_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------------- data ---------------- */
  const GALLERY = [
    { src: 'assets/img/bmw-peach-garage.jpg', title: 'BMW E46 · Gloss Peach + Bandana Roof', cat: 'color' },
    { src: 'assets/img/wrx-teal.jpg', title: 'Subaru WRX · Gloss Teal', cat: 'color' },
    { src: 'assets/img/camry-green.jpg', title: 'Toyota Camry XSE · Satin Military Green', cat: 'color' },
    { src: 'assets/img/fleet-signature-truck.jpg', title: 'Signature Fabrication · Full Truck Wrap', cat: 'fleet' },
    { src: 'assets/img/civic-purple.jpg', title: 'Honda Civic EG · Two-Tone Purple', cat: 'color' },
    { src: 'assets/img/kia-k5-side.jpg', title: 'Kia K5 · Nardo Grey Color Change', cat: 'color' },
    { src: 'assets/img/fleet-carpet-van.jpg', title: 'Biggest Little Carpet Cleaners · Van Graphics', cat: 'fleet' },
    { src: 'assets/img/bmw-peach-shop.jpg', title: 'Peach E46 · Reveal Day at The Club', cat: 'shop' },
    { src: 'assets/img/bmw-x6-green.jpg', title: 'BMW X6 · Matte Military Green', cat: 'color' },
    { src: 'assets/img/fleet-ace-trailer.jpg', title: 'Ace Flooring · Trailer Wrap', cat: 'fleet' },
    { src: 'assets/img/kia-k5-shop.jpg', title: 'Kia K5 · Red Calipers + Wrap', cat: 'shop' },
    { src: 'assets/img/fleet-janitorial-van.jpg', title: 'Express Janitorial · Printed Van Panels', cat: 'fleet' }
  ];
  const FLEET = [
    { src: 'assets/img/fleet-signature-truck.jpg', title: 'Signature Fabrication', tag: 'Full truck wrap' },
    { src: 'assets/img/fleet-ace-trailer.jpg', title: 'Ace Flooring', tag: 'Trailer wrap' },
    { src: 'assets/img/fleet-carpet-van.jpg', title: 'Biggest Little Carpet Cleaners', tag: 'Partial van wrap' },
    { src: 'assets/img/fleet-janitorial-van.jpg', title: 'Express Janitorial', tag: 'Printed door panels' }
  ];
  const REELS = [
    { src: 'assets/video/reel-pink-evo.mp4', poster: 'assets/video/reel-pink-evo.jpg', title: 'Pink Evo glow-up' },
    { src: 'assets/video/reel-livery-wrap.mp4', poster: 'assets/video/reel-livery-wrap.jpg', title: 'Custom livery install' },
    { src: 'assets/video/reel-gold-print.mp4', poster: 'assets/video/reel-gold-print.jpg', title: 'Printed gold graphic wrap' },
    { src: 'assets/video/reel-shop-tour.mp4', poster: 'assets/video/reel-shop-tour.jpg', title: 'Welcome to The Club' }
  ];
  const FAQ = [
    ['How much does a wrap cost?', 'It depends on the vehicle size, how much is covered (full, partial, roof, accents), the film and finish, and how complex the body lines are. Fill out the estimate form with your year, make, model and the look you want, and we\'ll send you a quote.'],
    ['How do I book? Is a deposit required?', 'Yes. A deposit is required for every project to lock in your spot. Deposits are valid for 30 days from the date they\'re paid, so plan your install within that window.'],
    ['What is your refund policy?', 'Everything we make is custom to your vehicle or brand, so there are no returns or refunds. That\'s why we go over the design, colors and coverage with you before anything is printed or installed.'],
    ['What vinyl brands do you use?', 'We install premium films from Inozetek, 3M, Avery Dennison, Hexis and KPMF. We\'ll help you pick the right film for the color, finish and budget you want.'],
    ['How long does a wrap last?', 'A quality film that\'s installed right and cared for usually lasts for years. Exact life depends on the film, the finish and how much sun and weather the vehicle sees. We\'ll go over what to expect for your specific film.'],
    ['Will a wrap damage my paint?', 'On healthy factory paint, a professionally installed and removed wrap protects the paint underneath. Repainted panels, chips, peeling clear coat or rust can be affected, so let us know about any paint issues on the estimate form.'],
    ['How long will my vehicle be at the shop?', 'Partial wraps, decals and lettering can often be done quickly. Full color changes and fleet wraps take longer because of prep, disassembly and post-heating. You\'ll get a time estimate with your quote.'],
    ['How should I wash my wrapped car?', 'Hand wash is best. Skip automatic brush car washes, keep pressure washers at a distance from edges, and use wrap-safe products. Matte and satin finishes shouldn\'t be waxed or polished.'],
    ['Do you design fleet graphics and logos?', 'Yes. We handle fleet graphics from concept to install: logo placement, lettering, contact info and full printed wraps. Use the Fleet Mockup Studio above to start, then send it to us with your estimate.'],
    ['Can I wrap a leased vehicle?', 'In most cases, yes. Wraps can be removed, which makes them popular for leased vehicles. Check your lease terms first.'],
    ['Do you paint brake calipers?', 'Yes. Caliper painting is a popular add-on with a wrap, in any color you want.'],
    ['Do you do embroidery and custom apparel?', 'Yes. We do embroidery and screen printing on hats, tees, hoodies, polos and uniforms for crews, teams, businesses and brands. Choose "Embroidery / Apparel" on the estimate form and tell us the items and quantity.'],
    ['Can I bring my own design?', 'Absolutely. Send your artwork or logo with the estimate form (vector files like .AI, .EPS, .SVG or .PDF are best). If you only have a rough idea, we can design it for you.']
  ];
  const SWATCH_NAME = {};

  /* ---------------- nav ---------------- */
  const nav = $('.nav'), burger = $('#burger'), links = $('#navLinks'), floatCta = $('#floatCta');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', scrollY > 30);
    const est = $('#estimate').getBoundingClientRect();
    floatCta.classList.toggle('is-visible', scrollY > innerHeight * 0.8 && (est.top > innerHeight || est.bottom < 0));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => { links.classList.remove('is-open'); burger.setAttribute('aria-expanded', false); }));

  // Logo / brand: always scroll back to the very top
  $$('a[href="#top"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    links.classList.remove('is-open'); burger.setAttribute('aria-expanded', false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, '', location.pathname);
  }));

  /* ---------------- socials & contact ---------------- */
  const socials = CFG.socials || {};
  $$('[data-social]').forEach(a => { const u = socials[a.dataset.social]; if (u) a.href = u; else a.remove(); });

  function contactItems() {
    const items = [];
    if (CFG.phone) items.push(['📞', `<a href="tel:${CFG.phone.replace(/[^\d+]/g, '')}">${CFG.phone}</a>`]);
    if (CFG.email) items.push(['✉️', `<a href="mailto:${CFG.email}">${CFG.email}</a>`]);
    if (CFG.address) items.push(['📍', CFG.mapsUrl ? `<a href="${CFG.mapsUrl}" target="_blank" rel="noopener">${CFG.address}</a>` : CFG.address]);
    if (CFG.hours) items.push(['🕒', CFG.hours]);
    if (socials.instagram) items.push(['📸', `<a href="${socials.instagram}" target="_blank" rel="noopener">DM @theclubcustoms</a>`]);
    return items.map(([i, h]) => `<li><span class="ic">${i}</span><span>${h}</span></li>`).join('');
  }
  $('#contactList').innerHTML = contactItems();
  $('#footerContact').innerHTML = contactItems();
  $('#year').textContent = new Date().getFullYear();

  /* ---------------- reveal on scroll ---------------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  const observe = () => $$('.reveal:not(.is-in)').forEach(el => io.observe(el));

  /* ---------------- lightbox ---------------- */
  const lb = $('#lightbox'), lbMedia = $('#lightboxMedia'), lbCap = $('#lightboxCap');
  let lbList = [], lbIdx = 0;
  function openLB(list, idx) { lbList = list; lbIdx = idx; renderLB(); lb.hidden = false; document.body.style.overflow = 'hidden'; }
  function renderLB() {
    const it = lbList[lbIdx];
    lbMedia.innerHTML = it.video
      ? `<video src="${it.video}" poster="${it.poster || ''}" controls autoplay playsinline></video>`
      : `<img src="${it.src}" alt="${it.title}">`;
    lbCap.textContent = it.title;
    $$('.lightbox__nav').forEach(b => b.hidden = lbList.length < 2);
  }
  function closeLB() { lb.hidden = true; lbMedia.innerHTML = ''; document.body.style.overflow = ''; }
  $('.lightbox__close').onclick = closeLB;
  $('.lightbox__prev').onclick = () => { lbIdx = (lbIdx - 1 + lbList.length) % lbList.length; renderLB(); };
  $('.lightbox__next').onclick = () => { lbIdx = (lbIdx + 1) % lbList.length; renderLB(); };
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') $('.lightbox__prev').click();
    if (e.key === 'ArrowRight') $('.lightbox__next').click();
  });

  /* ---------------- gallery ---------------- */
  const CAT = { color: 'Color Change', fleet: 'Fleet & Commercial', shop: 'At The Club' };
  const gallery = $('#gallery');
  gallery.innerHTML = GALLERY.map((g, i) => `
    <figure class="g-item reveal" data-cat="${g.cat}" data-i="${i}">
      <img src="${g.src}" alt="${g.title}" loading="lazy">
      <figcaption><small>${CAT[g.cat]}</small>${g.title}</figcaption>
    </figure>`).join('');
  gallery.addEventListener('click', e => {
    const f = e.target.closest('.g-item'); if (!f) return;
    const visible = $$('.g-item:not(.is-hidden)', gallery).map(el => GALLERY[+el.dataset.i]);
    openLB(visible, visible.indexOf(GALLERY[+f.dataset.i]));
  });
  $('#galleryFilters').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#galleryFilters button').forEach(x => x.classList.toggle('is-active', x === b));
    $$('.g-item', gallery).forEach(el => el.classList.toggle('is-hidden', b.dataset.filter !== 'all' && el.dataset.cat !== b.dataset.filter));
  });

  /* ---------------- reels ---------------- */
  const reelsGrid = $('#reelsGrid');
  reelsGrid.innerHTML = REELS.map((r, i) => `
    <div class="reel reveal" data-i="${i}" tabindex="0" role="button" aria-label="Play reel: ${r.title}">
      <video src="${r.src}" poster="${r.poster}" muted loop playsinline preload="none"></video>
      <div class="reel__ui">
        <div class="reel__top"><img src="assets/img/logo-badge.png" alt="">theclubcustoms</div>
        <div class="reel__play">▶</div>
        <div class="reel__title">${r.title}</div>
      </div>
    </div>`).join('');
  const reelItems = REELS.map(r => ({ video: r.src, poster: r.poster, title: r.title }));
  $$('.reel', reelsGrid).forEach(el => {
    const v = $('video', el);
    el.addEventListener('mouseenter', () => { v.play().catch(() => {}); });
    el.addEventListener('mouseleave', () => { v.pause(); });
    const open = () => { v.pause(); openLB(reelItems, +el.dataset.i); };
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
  });
  // autoplay muted on small screens when in view
  if (matchMedia('(hover: none)').matches) {
    const vio = new IntersectionObserver(es => es.forEach(e => { const v = $('video', e.target); e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }), { threshold: 0.6 });
    $$('.reel', reelsGrid).forEach(el => vio.observe(el));
  }

  /* ---------------- fleet showcase ---------------- */
  const fs = $('#fleetShowcase');
  fs.innerHTML = FLEET.map((f, i) => `
    <div class="fleet-card reveal" data-i="${i}"><img src="${f.src}" alt="${f.title} ${f.tag}" loading="lazy">
    <span><small>${f.tag}</small>${f.title}</span></div>`).join('');
  fs.addEventListener('click', e => { const c = e.target.closest('.fleet-card'); if (c) openLB(FLEET.map(f => ({ src: f.src, title: `${f.title} · ${f.tag}` })), +c.dataset.i); });

  /* ---------------- FAQ ---------------- */
  $('#faqList').innerHTML = FAQ.map(([q, a]) => `
    <div class="faq__item reveal"><button class="faq__q" aria-expanded="false">${q}</button>
    <div class="faq__a"><div><p>${a}</p></div></div></div>`).join('');
  $('#faqList').addEventListener('click', e => {
    const q = e.target.closest('.faq__q'); if (!q) return;
    const item = q.parentElement, open = !item.classList.contains('is-open');
    item.classList.toggle('is-open', open); q.setAttribute('aria-expanded', open);
  });

  /* ---------------- service deep links ---------------- */
  function checkService(name) {
    const cb = $(`#serviceChecks input[value="${name}"]`);
    if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); }
  }
  $$('[data-service]').forEach(a => a.addEventListener('click', () => checkService(a.dataset.service)));

  /* ---------------- estimate form ---------------- */
  const form = $('#estimateForm'), status = $('#formStatus');
  const apparelFs = $('.apparel-fields');
  const syncApparel = () => { apparelFs.hidden = !$('#serviceChecks input[value="Embroidery / Apparel"]').checked; };
  $('#serviceChecks').addEventListener('change', syncApparel);

  const photos = $('#formPhotos'), fileList = $('#fileList');
  photos.addEventListener('change', () => {
    if (photos.files.length > 5) { status.textContent = 'Please attach up to 5 files.'; status.className = 'form__status err'; }
    fileList.innerHTML = [...photos.files].slice(0, 5).map(f => `<span>${f.name}</span>`).join('');
  });

  // Attached design from visualizer / fleet studio
  let attached = null; // { blob, label, name }
  const attBox = $('#attachedDesign');
  window.ClubQuote = {
    attach(dataUrl, label, fields = {}) {
      fetch(dataUrl).then(r => r.blob()).then(blob => {
        attached = { blob, label, name: fields.fileName || 'design-preview.jpg' };
        $('#attachedImg').src = dataUrl;
        $('#attachedLabel').textContent = label;
        attBox.hidden = false;
      });
      if (fields.service) checkService(fields.service);
      if (fields.finish) { const sel = $('#formFinish'); [...sel.options].forEach(o => { if (o.text === fields.finish) sel.value = o.value; }); }
      if (fields.color) $('#formColor').value = fields.color;
      if (fields.business) form.business.value = fields.business;
      if (fields.vehicleType) [...form.vehicle_type.options].forEach(o => { if (o.text === fields.vehicleType) form.vehicle_type.value = o.value; });
      document.getElementById('estimate').scrollIntoView({ behavior: 'smooth' });
    }
  };
  $('#attachedRemove').addEventListener('click', () => { attached = null; attBox.hidden = true; });

  function validate() {
    let ok = true;
    $$('[required]', form).forEach(el => {
      const bad = el.type === 'checkbox' ? !el.checked : !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
      el.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!$$('#serviceChecks input:checked').length) { ok = false; status.textContent = 'Pick at least one service.'; }
    return ok;
  }

  function summary(fd) {
    const lines = [];
    const add = (k, v) => { if (v) lines.push(`${k}: ${v}`); };
    add('Name', fd.get('name')); add('Business', fd.get('business')); add('Phone', fd.get('phone')); add('Email', fd.get('email'));
    add('Preferred contact', fd.get('contact_pref')); add('Services', fd.getAll('services').join(', '));
    add('Vehicle', [fd.get('year'), fd.get('make'), fd.get('model')].filter(Boolean).join(' '));
    add('Vehicle type', fd.get('vehicle_type')); add('Vehicle count', fd.get('vehicle_count'));
    add('Coverage', fd.get('coverage')); add('Finish', fd.get('finish')); add('Color / design', fd.get('color_idea'));
    add('Notes', fd.getAll('extras').join(', '));
    add('Apparel', [fd.get('apparel_items'), fd.get('apparel_qty') && `qty ${fd.get('apparel_qty')}`, fd.get('apparel_method')].filter(Boolean).join(' · '));
    add('Budget', fd.get('budget')); add('Timeline', fd.get('timeline')); add('Heard about us', fd.get('referral'));
    add('Message', fd.get('message'));
    if (attached) add('Design', attached.label + ' (preview attached)');
    return lines.join('\n');
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.className = 'form__status'; status.textContent = '';
    if (form._gotcha.value) return;
    if (!validate()) { status.className = 'form__status err'; status.textContent ||= 'Please fill in the highlighted fields.'; return; }

    const fd = new FormData(form);
    fd.delete('photos');
    [...photos.files].slice(0, 5).forEach(f => fd.append('photos', f));
    if (attached) { fd.append('design_preview', attached.blob, attached.name); fd.append('design_label', attached.label); }
    fd.set('services', fd.getAll('services').join(', '));
    fd.set('extras', fd.getAll('extras').join(', '));
    fd.append('_subject', `New estimate request: ${fd.get('name')} (${fd.get('services')})`);

    const btn = $('#formSubmit'); btn.disabled = true; btn.textContent = 'Sending…';
    try {
      if (CFG.formEndpoint) {
        const res = await fetch(CFG.formEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error('Server responded ' + res.status);
        form.reset(); fileList.innerHTML = ''; attached = null; attBox.hidden = true; syncApparel();
        status.className = 'form__status ok';
        status.textContent = 'Got it! We\'ll reach out soon with your estimate. 🔥';
      } else if (CFG.email) {
        const body = summary(new FormData(form)) + (photos.files.length || attached ? '\n\n(Please attach your photos / design to this email.)' : '');
        location.href = `mailto:${CFG.email}?subject=${encodeURIComponent('Estimate request from ' + form.name.value)}&body=${encodeURIComponent(body)}`;
        status.className = 'form__status ok';
        status.textContent = 'Your email app is opening with your request. Hit send and we\'ll get back to you!';
      } else {
        // No delivery set up yet: copy the request and point to Instagram DMs
        const text = summary(new FormData(form));
        try { await navigator.clipboard.writeText(text); } catch (_) {}
        status.className = 'form__status ok';
        status.innerHTML = `Your request is copied to your clipboard. Paste it in a DM to <a href="${socials.instagram}" target="_blank" rel="noopener">@theclubcustoms</a> and we'll get you a quote.`;
      }
    } catch (err) {
      status.className = 'form__status err';
      status.textContent = 'Something went wrong sending your request. Please try again or DM us on Instagram.';
      console.error(err);
    } finally {
      btn.disabled = false; btn.textContent = 'Send My Estimate Request';
    }
  });
  $$('[required]', form).forEach(el => el.addEventListener('input', () => el.classList.remove('invalid')));

  observe();
  window.ClubObserve = observe;
})();
