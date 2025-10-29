<<<<<<< HEAD
gsap.registerPlugin(ScrollTrigger)

const spacing = 0.1;
const snap = gsap.utils.snap(spacing);
const cards = gsap.utils.toArray('.cards li');

const seamlessLoop = buildSeamlessLoop(cards, spacing);

let currentTime = 0;

function scrubTo(time) {
  currentTime = snap(time);
  gsap.to(seamlessLoop, {
    totalTime: currentTime,
    duration: 0.5,
    ease: "power3.out"
  });
}

document.querySelector(".next").addEventListener("click", () => {
  scrubTo(currentTime + spacing);
});

document.querySelector(".prev").addEventListener("click", () => {
  scrubTo(currentTime - spacing);
});

function buildSeamlessLoop(items, spacing) {
  let overlap = Math.ceil(1 / spacing),
    startTime = items.length * spacing + 0.5,
    loopTime = (items.length + overlap) * spacing + 1,
    rawSequence = gsap.timeline({ paused: true }),
    seamlessLoop = gsap.timeline({
      paused: true,
      repeat: -1,
      onRepeat() {
        this._time === this._dur && (this._tTime += this._dur - 0.01);
      }
    }),
    l = items.length + overlap * 2,
    time = 0;

  gsap.set(items, { xPercent: 400, opacity: 0, scale: 0 });

  for (let i = 0; i < l; i++) {
    let index = i % items.length;
    let item = items[index];
    time = i * spacing;
    rawSequence
      .fromTo(
        item,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          zIndex: 100,
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          ease: "power1.in",
          immediateRender: false
        },
        time
      )
      .fromTo(
        item,
        { xPercent: 400 },
        {
          xPercent: -400,
          duration: 1,
          ease: "none",
          immediateRender: false
        },
        time
      );
  }

  rawSequence.time(startTime);
  seamlessLoop
    .to(rawSequence, {
      time: loopTime,
      duration: loopTime - startTime,
      ease: "none"
    })
    .fromTo(
      rawSequence,
      { time: overlap * spacing + 1 },
      {
        time: startTime,
        duration: startTime - (overlap * spacing + 1),
        immediateRender: false,
        ease: "none"
      }
    );

  return seamlessLoop;
}


gsap.registerPlugin(SplitText, ScrollTrigger);

gsap.set(".split", { opacity: 1 });

document.fonts.ready.then(() => {
  const blocks = gsap.utils.toArray(".container_new");

  blocks.forEach((block) => {
    const text = block.querySelector(".split");

    const split = new SplitText(text, {
      type: "lines",
      linesClass: "line"
    });

    gsap.from(split.lines, {
      yPercent: 100,
      opacity: 0,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
  trigger: block,
  start: "top 80%",
  end: "bottom center",
  scrub: true
}
    });
  });
});


gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);
=======
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
>>>>>>> 67918cfcbeae1322217ce826db704234ef6d4300

let panelsSection = document.querySelector("#panels"),
	panelsContainer = document.querySelector("#panels-container"),
	tween;
document.querySelectorAll(".anchor").forEach(anchor => {
	anchor.addEventListener("click", function(e) {
		e.preventDefault();
		let targetElem = document.querySelector(e.target.getAttribute("href")),
			y = targetElem;
		if (targetElem && panelsContainer.isSameNode(targetElem.parentElement)) {
			let totalScroll = tween.scrollTrigger.end - tween.scrollTrigger.start,
				totalMovement = (panels.length - 1) * targetElem.offsetWidth;
			y = Math.round(tween.scrollTrigger.start + (targetElem.offsetLeft / totalMovement) * totalScroll);
		}
		gsap.to(window, {
			scrollTo: {
				y: y,
				autoKill: false
			},
			duration: 1
		});
	});
});

const panels = gsap.utils.toArray("#panels-container .panel");
tween = gsap.to(panels, {
	xPercent: -100 * ( panels.length - 1 ),
	ease: "none",
	scrollTrigger: {
		trigger: "#panels-container",
		pin: true,
		start: "top top",
		scrub: 1,
		snap: {
			snapTo: 1 / (panels.length - 1),
			inertia: false,
			duration: {min: 0.1, max: 0.1}
		},
end: () => "+=" + (panelsContainer.scrollWidth - innerWidth)
	}
});

// --- Comments widget: sync with backend API ---
(function() {
  const STORAGE_KEY = 'site_comments_v1';
  const API_ENDPOINTS = {
    list: '/api/feedback/all',
    create: '/api/feedback/'
  };

  let listEl = null;
  let statusEl = null;
  let submitBtn = null;
  let modalEl = null;
  let lastFocusedEl = null;
  let commentsCache = [];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function coerceDate(value) {
    if (!value) return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'number') {
      const byNumber = new Date(value);
      return Number.isNaN(byNumber.getTime()) ? null : byNumber;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const parsed = Date.parse(trimmed);
      if (!Number.isNaN(parsed)) {
        return new Date(parsed);
      }
      const match = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
      if (match) {
        const [ , d, m, y ] = match;
        const year = Number(y.length === 2 ? `20${y}` : y);
        const dateFromParts = new Date(year, Number(m) - 1, Number(d));
        return Number.isNaN(dateFromParts.getTime()) ? null : dateFromParts;
      }
    }
    return null;
  }

  function normalizeComment(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const nameSource = raw.name ?? raw.userName ?? raw.username ?? raw.author ?? raw.fullName ?? '';
    const textSource = raw.comment ?? raw.text ?? raw.message ?? raw.body ?? '';
    const dateSource = raw.createdAt ?? raw.created_at ?? raw.created ?? raw.date ?? raw.updatedAt ?? raw.timestamp;
    const dateObj = coerceDate(dateSource);
    const timestamp = dateObj ? dateObj.getTime() : (typeof raw.timestamp === 'number' ? raw.timestamp : 0);
    const dateDisplay = dateObj ? dateObj.toLocaleDateString('ru-RU') : (typeof raw.date === 'string' ? raw.date : '');

    return {
      id: raw.id ?? raw._id ?? null,
      name: String(nameSource || 'Аноним').trim() || 'Аноним',
      text: String(textSource || ''),
      createdAt: dateObj ? dateObj.toISOString() : (typeof dateSource === 'string' ? dateSource : null),
      timestamp,
      dateDisplay
    };
  }

  function loadCommentsBackup() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeComment).filter(Boolean);
    } catch (error) {
      console.error('Failed to load comments backup', error);
      return [];
    }
  }

  function saveCommentsBackup(comments) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    } catch (error) {
      console.error('Failed to save comments backup', error);
    }
  }

  function commentTimestamp(comment) {
    return Number(comment?.timestamp) || 0;
  }

  function renderCommentItem(comment) {
    const li = document.createElement('li');
    li.className = 'comment-item';
    const name = escapeHtml(comment.name || 'Аноним');
    const safeText = escapeHtml(comment.text || '').replace(/\n/g, '<br>');
    const date = escapeHtml(comment.dateDisplay || '');
    li.innerHTML = `
      <div class="comment-body">
        <p class="comment-text">${safeText}</p>
      </div>
      <div class="comment-meta">
        <div class="comment-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div class="comment-info">
          <span class="comment-name">${name}</span>
          <span class="comment-date">${date}</span>
        </div>
      </div>`;
    return li;
  }

  function renderAll() {
    if (!listEl) return;
    listEl.innerHTML = '';

    if (!commentsCache.length) {
      const placeholder = document.createElement('li');
      placeholder.className = 'comment-item comment-item--empty';
      placeholder.innerHTML = `
        <div class="comment-body">
          <p class="comment-text">Пока нет отзывов. Будьте первым, кто поделится впечатлением!</p>
        </div>`;
      listEl.appendChild(placeholder);
      return;
    }

    commentsCache
      .slice()
      .sort((a, b) => commentTimestamp(b) - commentTimestamp(a))
      .forEach(c => listEl.appendChild(renderCommentItem(c)));
    listEl.scrollLeft = 0;
  }

  function ensureStatusElement() {
    if (statusEl) return statusEl;
    const container = document.getElementById('feedback_user');
    if (!container) return null;
    statusEl = document.createElement('p');
    statusEl.className = 'comment-status-message';
    statusEl.setAttribute('role', 'status');
    statusEl.style.margin = '0';
    statusEl.style.fontSize = '16px';
    statusEl.style.display = 'none';
    const trigger = container.querySelector('.add-comment-btn');
    container.insertBefore(statusEl, trigger || null);
    return statusEl;
  }

  function setStatus(message, type = 'info') {
    const el = ensureStatusElement();
    if (!el) return;
    if (!message) {
      el.textContent = '';
      el.style.display = 'none';
      return;
    }
    el.textContent = message;
    el.style.display = 'block';
    switch (type) {
      case 'error':
        el.style.color = '#B3261E';
        break;
      case 'success':
        el.style.color = '#2D4F2B';
        break;
      default:
        el.style.color = '#1d1d1d';
    }
  }

  async function fetchComments(options = {}) {
    const { showLoading = true } = options;
    if (!listEl) return false;
    if (showLoading) {
      setStatus('Загружаем отзывы...', 'info');
    }
    try {
      const response = await fetch(API_ENDPOINTS.list, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch feedback: ${response.status}`);
      }
      const data = await response.json().catch(() => []);
      const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      commentsCache = items.map(normalizeComment).filter(Boolean);
      renderAll();
      saveCommentsBackup(commentsCache);
      setStatus('', 'info');
      return true;
    } catch (error) {
      console.error('Failed to fetch comments from API', error);
      const fallback = loadCommentsBackup();
      if (fallback.length) {
        commentsCache = fallback;
        renderAll();
        setStatus('Не удалось обновить отзывы, отображаются сохранённые ранее данные.', 'error');
      } else {
        commentsCache = [];
        renderAll();
        setStatus('Не удалось загрузить отзывы. Попробуйте ещё раз позже.', 'error');
      }
      return false;
    }
  }

  async function postComment({ name, text }) {
    const payload = {
      name: name || 'Аноним',
      comment: text || ''
    };
    const response = await fetch(API_ENDPOINTS.create, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Failed to submit feedback: ${response.status} ${errorText}`);
    }
    return response.json().catch(() => null);
  }

  function isModalOpen() {
    return modalEl?.classList.contains('is-open');
  }

  function openModal() {
    if (!modalEl) return;
    lastFocusedEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalEl.classList.add('is-open');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const nameField = document.getElementById('commentName');
    if (nameField) {
      setTimeout(() => nameField.focus(), 50);
    }
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocusedEl) {
      lastFocusedEl.focus();
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && isModalOpen()) {
      event.preventDefault();
      closeModal();
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    listEl = document.getElementById('userComments');
    const form = document.getElementById('commentForm');
    modalEl = document.getElementById('commentModal');
    submitBtn = form ? form.querySelector('.submit-comment') : null;
    const openBtn = document.querySelector('[data-open-comment-modal]');
    const closeTriggers = modalEl ? modalEl.querySelectorAll('[data-modal-close]') : [];

    fetchComments();

    if (!form) return;

    openBtn?.addEventListener('click', (event) => {
      event.preventDefault();
      openModal();
    });

    closeTriggers.forEach(trigger => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        closeModal();
      });
    });

    modalEl?.addEventListener('click', (event) => {
      if (event.target === modalEl) {
        closeModal();
      }
    });

    document.addEventListener('keydown', handleKeydown);

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const nameEl = document.getElementById('commentName');
      const textEl = document.getElementById('commentText');
      if (!textEl) return;
      const name = nameEl ? nameEl.value.trim() : '';
      const text = textEl.value.trim();
      if (!text) {
        setStatus('Пожалуйста, введите текст отзыва.', 'error');
        textEl.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.initialText = submitBtn.dataset.initialText || submitBtn.textContent;
        submitBtn.textContent = 'Отправляем...';
      }

      try {
        await postComment({ name, text });
        const fetched = await fetchComments({ showLoading: false });
        if (fetched) {
          setStatus('Спасибо! Ваш отзыв отправлен.', 'success');
          textEl.value = '';
          closeModal();
        }
      } catch (error) {
        console.error('Failed to submit feedback', error);
        setStatus('Не удалось отправить отзыв. Попробуйте ещё раз позже.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.initialText || 'Отправить';
        }
      }
    });
  });
})();