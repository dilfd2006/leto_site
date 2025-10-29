gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

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

// --- Comments widget: save to localStorage and render on page ---
(function() {
  const STORAGE_KEY = 'site_comments_v1';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadComments() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load comments', e);
      return [];
    }
  }

  function saveComments(comments) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    } catch (e) {
      console.error('Failed to save comments', e);
    }
  }

  function renderCommentItem(comment) {
    const li = document.createElement('li');
    li.className = 'comment-item';
    const name = escapeHtml(comment.name || 'Аноним');
    const text = escapeHtml(comment.text || '');
    const date = escapeHtml(comment.date || '');
    li.innerHTML = `
      <div class="comment-body">
        <p class="comment-text">${text}</p>
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

  function commentTimestamp(comment) {
    if (!comment) return 0;
    if (comment.createdAt) {
      const parsed = Date.parse(comment.createdAt);
      if (!Number.isNaN(parsed)) return parsed;
    }
    if (comment.date) {
      const parts = comment.date.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        const fallback = new Date(year, (month || 1) - 1, day || 1).getTime();
        if (!Number.isNaN(fallback)) return fallback;
      }
    }
    return 0;
  }

  function renderAll() {
    const list = document.getElementById('userComments');
    if (!list) return;
    list.innerHTML = '';
    const comments = loadComments();
    comments
      .slice()
      .sort((a, b) => commentTimestamp(b) - commentTimestamp(a))
      .forEach(c => list.appendChild(renderCommentItem(c)));
    list.scrollLeft = 0;
  }

  function addComment(name, text) {
    const comments = loadComments();
    const now = new Date();
    const entry = {
      name: name || 'Аноним',
      text: text || '',
      date: now.toLocaleDateString('ru-RU'),
      createdAt: now.toISOString()
    };
    comments.push(entry);
    saveComments(comments);
    renderAll();
  }

  // wire up form
  document.addEventListener('DOMContentLoaded', function() {
    renderAll();
    const form = document.getElementById('commentForm');
    if (!form) return;
    const modal = document.getElementById('commentModal');
    const openBtn = document.querySelector('[data-open-comment-modal]');
    const closeTriggers = modal ? modal.querySelectorAll('[data-modal-close]') : [];
    let lastFocusedEl = null;

    function isModalOpen() {
      return modal?.classList.contains('is-open');
    }

    function openModal() {
      if (!modal) return;
      lastFocusedEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      const nameField = document.getElementById('commentName');
      if (nameField) {
        setTimeout(() => nameField.focus(), 50);
      }
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
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

    modal?.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', handleKeydown);

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const nameEl = document.getElementById('commentName');
      const textEl = document.getElementById('commentText');
      if (!textEl) return;
      const name = nameEl ? nameEl.value.trim() : '';
      const text = textEl.value.trim();
      if (!text) return;
      addComment(name, text);
      // clear textarea and keep name
      textEl.value = '';
      closeModal();
    });
  });
})();