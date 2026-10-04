/* 
   GYMFUEL — App Logic
    */

/* Data comes from the backend (GET /api/plan). */
var WORKOUT_SCHEDULE = {};
var MEAL_PLAN = [];
var DISHES = {};

// Fetch the plan from the API and store it in the globals above.
function loadPlan() {
  return fetch('/api/plan')
    .then(function (res) {
      if (!res.ok) throw new Error('API returned ' + res.status);
      return res.json();
    })
    .then(function (data) {
      WORKOUT_SCHEDULE = data.schedule;
      MEAL_PLAN = data.mealPlan;
      DISHES = data.dishes;
    });
}

/*  helpers  */
function el(tag, classes) {
  var node = document.createElement(tag);
  if (classes) node.className = classes;
  return node;
}

function txt(node, text) {
  node.textContent = text;
  return node;
}

function dishLabel(n) {
  return 'DISH ' + (n < 10 ? '0' : '') + n;
}

/*  SVG icons (safe: no user content, no escaping issues)  */
function sunIcon() {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.innerHTML =
    '<circle cx="12" cy="12" r="5"/>' +
    '<line x1="12" y1="1" x2="12" y2="3"/>' +
    '<line x1="12" y1="21" x2="12" y2="23"/>' +
    '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>' +
    '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>' +
    '<line x1="1" y1="12" x2="3" y2="12"/>' +
    '<line x1="21" y1="12" x2="23" y2="12"/>' +
    '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>' +
    '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  return svg;
}

function moonIcon() {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  return svg;
}

function clockIcon() {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('width', '13');
  svg.setAttribute('height', '13');
  svg.innerHTML = '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>';
  return svg;
}

function imgIcon() {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.5');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.innerHTML =
    '<rect x="3" y="3" width="18" height="18" rx="2"/>' +
    '<circle cx="8.5" cy="8.5" r="1.5"/>' +
    '<polyline points="21 15 16 10 5 21"/>';
  return svg;
}

/*  build a single meal slot (Lunch or Dinner)  */
function buildMealSlot(type, dishNum, dayName) {
  var isLunch = (type === 'lunch');
  var typeLabel = isLunch ? 'Lunch' : 'Dinner';

  var slot = el('div', 'meal-slot');

  /* label row */
  var labelRow = el('div', 'meal-label-row');

  var mealType = el('div', 'meal-type');
  var iconWrap = el('div', 'meal-type-icon');
  iconWrap.appendChild(isLunch ? sunIcon() : moonIcon());

  var typeText = txt(el('span', 'meal-type-text'), typeLabel);
  mealType.appendChild(iconWrap);
  mealType.appendChild(typeText);

  var dishId = txt(el('span', 'meal-dish-id'), dishLabel(dishNum));

  labelRow.appendChild(mealType);
  labelRow.appendChild(dishId);

  /* image wrapper */
  var imgWrap = el('div', 'meal-image-wrap');
  imgWrap.setAttribute('role', 'button');
  imgWrap.setAttribute('tabindex', '0');
  imgWrap.setAttribute('aria-label', typeLabel + ' for ' + dayName);
  imgWrap.dataset.day  = dayName;
  imgWrap.dataset.type = typeLabel;
  imgWrap.dataset.dish = dishNum;

  var image = document.createElement('img');
  image.src     = 'images/' + dishNum + '.png';
  image.alt     = typeLabel + ' — ' + dishLabel(dishNum);
  image.loading = 'lazy';

  /* fallback — never touches innerHTML with dynamic content */
  image.addEventListener('error', function () {
    /* replace image with a clean placeholder div */
    var ph = el('div', 'meal-image-placeholder');
    ph.appendChild(imgIcon());
    ph.appendChild(txt(el('span'), dishLabel(dishNum)));
    imgWrap.replaceChild(ph, image);
  });

  imgWrap.appendChild(image);

  slot.appendChild(labelRow);
  slot.appendChild(imgWrap);
  return slot;
}

/*  build a full day card */
function buildDayCard(entry, idx) {
  var sched  = WORKOUT_SCHEDULE[entry.day];
  var dayNum = idx + 1;

  var card = el('article', 'day-card' + (sched.isWorkout ? ' day-card--workout' : ''));
  card.dataset.day = entry.day;

  /* header */
  var header = el('div', 'day-header');

  var left = el('div', 'day-left');
  left.appendChild(txt(el('span', 'day-number'), 'Day ' + (dayNum < 10 ? '0' : '') + dayNum));
  left.appendChild(txt(el('h2', 'day-name'), entry.day.toUpperCase()));

  var right = el('div', 'day-right');

  var statusRow = el('div', 'day-status');
  statusRow.appendChild(el('span', 'status-dot'));
  statusRow.appendChild(txt(el('span', 'status-text'), sched.isWorkout ? 'Workout Day' : 'Rest Day'));
  right.appendChild(statusRow);

  if (sched.isWorkout) {
    var wb = el('div', 'workout-block');
    wb.appendChild(clockIcon());
    wb.appendChild(txt(el('span', 'workout-time'), sched.time));
    wb.appendChild(el('span', 'workout-sep'));
    wb.appendChild(txt(el('span', 'workout-focus'), sched.focus));
    right.appendChild(wb);
  }

  header.appendChild(left);
  header.appendChild(right);

  /* meals */
  var mealsGrid = el('div', 'meals-grid');
  mealsGrid.appendChild(buildMealSlot('lunch',  entry.lunch,  entry.day));
  mealsGrid.appendChild(buildMealSlot('dinner', entry.dinner, entry.day));

  card.appendChild(header);
  card.appendChild(mealsGrid);
  return card;
}

/*  render all days */
function renderDays() {
  var grid = document.getElementById('daysGrid');
  MEAL_PLAN.forEach(function (entry, idx) {
    grid.appendChild(buildDayCard(entry, idx));
  });
}

/* 
   MODAL
 */
var modal, modalImg, modalType, modalDay;

function buildModal() {
  modal = el('div', 'modal-overlay');
  modal.id = 'mealModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  var inner = el('div', 'modal-inner');

  var imgWrap = el('div', 'modal-img-wrap');

  var closeBtn = el('button', 'modal-close');
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closeModal);

  modalImg = document.createElement('img');
  modalImg.id  = 'modalImg';
  modalImg.alt = '';

  imgWrap.appendChild(closeBtn);
  imgWrap.appendChild(modalImg);

  var body = el('div', 'modal-body');
  modalType = txt(el('p', 'modal-meal-type'), '');
  modalDay  = txt(el('h3', 'modal-day-name'), '');
  body.appendChild(modalType);
  body.appendChild(modalDay);

  inner.appendChild(imgWrap);
  inner.appendChild(body);
  modal.appendChild(inner);
  document.body.appendChild(modal);

  /* close on backdrop click */
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  /* close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
}

function openModal(src, day, type, dish) {
  modalImg.src       = src;
  modalImg.alt       = type + ' — ' + day;
  modalType.textContent = type + ' · ' + (DISHES[dish] || dishLabel(dish));
  modalDay.textContent  = day.toUpperCase();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

/*  click / keyboard on image cards */
function attachClicks() {
  var grid = document.getElementById('daysGrid');

  grid.addEventListener('click', function (e) {
    var wrap = e.target.closest('.meal-image-wrap');
    if (!wrap) return;
    var img = wrap.querySelector('img');
    if (!img) return;
    openModal(img.src, wrap.dataset.day, wrap.dataset.type, Number(wrap.dataset.dish));
  });

  grid.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var wrap = e.target.closest('.meal-image-wrap');
    if (!wrap) return;
    e.preventDefault();
    var img = wrap.querySelector('img');
    if (!img) return;
    openModal(img.src, wrap.dataset.day, wrap.dataset.type, Number(wrap.dataset.dish));
  });
}

/*  scroll-reveal  */
function initReveal() {
  var cards = document.querySelectorAll('.day-card');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06 });

  cards.forEach(function (card, i) {
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(28px)';
    card.style.transition =
      'opacity 0.55s ease ' + (i * 0.07) + 's, ' +
      'transform 0.55s cubic-bezier(0.4,0,0.2,1) ' + (i * 0.07) + 's, ' +
      'border-color 0.28s ease, box-shadow 0.28s ease';
    observer.observe(card);
  });
}

// Load the plan from the API first, then render the page.
document.addEventListener('DOMContentLoaded', function () {
  loadPlan()
    .then(function () {
      renderDays();
      buildModal();
      attachClicks();
      initReveal();
    })
    .catch(function (err) {
      var grid = document.getElementById('daysGrid');
      grid.appendChild(txt(el('p', 'load-error'), 'Could not load the meal plan. Is the backend running?'));
      console.error(err);
    });
});