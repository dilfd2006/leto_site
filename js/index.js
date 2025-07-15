gsap.registerPlugin(ScrollTrigger); // Можно удалить, если ScrollTrigger вообще не нужен

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