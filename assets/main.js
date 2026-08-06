/* ============================================================
   主页交互逻辑
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Hero 简介 ---------- */
  var introEl = document.getElementById('heroIntro');
  if (introEl && window.SITE) introEl.innerHTML = SITE.intro;

  /* ---------- Hero 图片上传 ---------- */
  var frame = document.getElementById('heroImageFrame');
  var fileInput = document.getElementById('heroImageInput');
  if (frame && fileInput) {
    frame.addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        frame.classList.add('has-image');
        var img = frame.querySelector('img');
        if (img) { img.src = ev.target.result; }
        else {
          img = document.createElement('img');
          img.src = ev.target.result;
          frame.appendChild(img);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- 作品 · 3D 透视轮播（3 卡片可见） ---------- */
  var carousel = document.getElementById('carousel');
  var dotsContainer = document.getElementById('carouselDots');
  var prevBtn = document.getElementById('prevWork');
  var nextBtn = document.getElementById('nextWork');

  if (carousel && window.PROJECTS) {
    var current = 0;
    var total = PROJECTS.length;
    var cards = [];

    // 创建卡片
    PROJECTS.forEach(function (p, i) {
      var card = document.createElement('a');
      card.className = 'work-card-3d';
      card.href = 'detail.html?id=' + p.id;
      card.dataset.idx = i;
      var tagsHTML = p.tags.slice(0, 2).map(function (t) { return '<span>' + t + '</span>'; }).join('');
      var coverInner = '<span class="cat">' + p.cat + '</span>' +
        '<span class="num">0' + p.id + '</span>' +
        '<span class="arrow-go"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 17L17 7M9 7h8v8"/></svg></span>';
      if (p.coverImg) {
        coverInner = '<img src="' + p.coverImg + '" alt="' + p.title + '" class="cover-img">' + coverInner;
      }
      card.innerHTML =
        '<div class="cover" style="background:' + p.cover + '">' + coverInner + '</div>' +
        '<div class="body">' +
          '<h3>' + p.title + '</h3>' +
          '<div class="meta">' + tagsHTML + '</div>' +
        '</div>';
      card.addEventListener('click', function (e) {
        var idx = parseInt(this.dataset.idx, 10);
        if (idx !== current) {
          e.preventDefault();
          current = idx;
          layout();
        } else {
          e.preventDefault();
          window.location.href = this.href;
        }
      });
      carousel.appendChild(card);
      cards.push(card);
    });

    // 创建指示点
    if (dotsContainer) {
      PROJECTS.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.addEventListener('click', function () { current = i; layout(); });
        dotsContainer.appendChild(dot);
      });
    }

    function layout() {
      var cardW = 340;
      cards.forEach(function (card, i) {
        var pos = i - current;
        /* 无限轮播：将 pos 归一化到 [-total/2, total/2] */
        if (pos > total / 2) pos -= total;
        if (pos < -total / 2) pos += total;
        var abs = Math.abs(pos);
        var tx, rotY, scale, opacity, z, tz, blur;

        if (abs === 0) {
          /* 中心卡：前推、全清晰、最大阴影 */
          tx = 0; rotY = 0; scale = 1; opacity = 1; z = 10; tz = 50; blur = 0;
        } else if (abs === 1) {
          /* 左右邻卡：旋转、后推、轻微缩放 */
          tx = pos * 300; rotY = -pos * 24; scale = 0.87; opacity = 1; z = 8; tz = -50; blur = 1;
        } else if (abs === 2) {
          /* 远处卡：大旋转、远推、半透明（营造景深） */
          tx = pos * 430; rotY = -pos * 38; scale = 0.7; opacity = 0.3; z = 5; tz = -130; blur = 3;
        } else {
          /* 隐藏卡 */
          tx = pos * 600; rotY = -pos * 45; scale = 0.6; opacity = 0; z = 0; tz = -220; blur = 6;
        }

        card.dataset.pos = pos;
        card.style.transform =
          'translate(-50%, -50%) translateX(' + tx + 'px) translateZ(' + tz + 'px) rotateY(' + rotY + 'deg) scale(' + scale + ')';
        card.style.opacity = opacity;
        card.style.zIndex = z;
        card.style.pointerEvents = abs <= 1 ? 'auto' : 'none';
        card.style.filter = blur > 0 ? 'blur(' + blur + 'px)' : 'none';
      });

      if (dotsContainer) {
        var dots = dotsContainer.querySelectorAll('button');
        dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
      }

      /* 无限轮播：不禁用按钮 */
      if (prevBtn) prevBtn.disabled = false;
      if (nextBtn) nextBtn.disabled = false;
    }

    if (prevBtn) prevBtn.addEventListener('click', function () {
      current = (current - 1 + total) % total;
      layout();
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      current = (current + 1) % total;
      layout();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { current = (current - 1 + total) % total; layout(); }
      if (e.key === 'ArrowRight') { current = (current + 1) % total; layout(); }
    });

    var touchStartX = 0;
    carousel.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) { current = (current + 1) % total; layout(); }
        if (dx > 0) { current = (current - 1 + total) % total; layout(); }
      }
    }, { passive: true });

    layout();
  }

  /* ---------- 能力工具箱 · 3 项核心能力卡片 ---------- */
  var toolboxGrid = document.getElementById('toolboxGrid');
  if (toolboxGrid && window.TOOLS) {
    TOOLS.forEach(function (t, i) {
      var card = document.createElement('div');
      card.className = 'tool-card reveal d' + ((i % 3) + 1);
      var extraHTML = '';
      if (t.tools) {
        extraHTML += '<div class="tool-tools">' + t.tools + '</div>';
      }
      if (t.desc) {
        extraHTML += '<div class="tool-desc">' + t.desc + '</div>';
      }
      card.innerHTML =
        '<div class="tool-ic" style="background:' + t.color + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + t.icon + '</svg>' +
        '</div>' +
        '<h4>' + t.title + '</h4>' +
        '<p class="tool-sub">' + t.sub + '</p>' +
        extraHTML;
      toolboxGrid.appendChild(card);
    });
  }

  /* ---------- 工作之外的我 · 6 项爱好（上图下字） ---------- */
  var hobbiesGrid = document.getElementById('hobbiesGrid');
  if (hobbiesGrid && window.HOBBIES) {
    /* 投资 SVG 插画 */
    var investSVG =
      '<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="hobby-illust">' +
        '<rect width="200" height="200" fill="var(--bg2)"/>' +
        '<path d="M30 160 L30 50" stroke="var(--rule-2)" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M30 160 L180 160" stroke="var(--rule-2)" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M40 140 L70 110 L100 120 L130 80 L170 50" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '<circle cx="70" cy="110" r="4" fill="var(--accent)"/>' +
        '<circle cx="100" cy="120" r="4" fill="var(--accent)"/>' +
        '<circle cx="130" cy="80" r="4" fill="var(--accent)"/>' +
        '<circle cx="170" cy="50" r="5" fill="var(--accent)"/>' +
        '<path d="M155 55 L170 50 L168 66" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '<text x="100" y="185" text-anchor="middle" font-family="var(--font-body)" font-size="11" fill="var(--muted)" letter-spacing="0.1em">INVEST</text>' +
      '</svg>';

    HOBBIES.forEach(function (h, i) {
      var card = document.createElement('div');
      card.className = 'hobby-card reveal d' + ((i % 3) + 1);
      var mediaHTML;
      if (h.img) {
        var imgStyle = h.imgPos ? ' style="object-position:' + h.imgPos + '"' : '';
        mediaHTML = '<div class="hobby-img"><img src="' + h.img + '" alt="' + h.title + '"' + imgStyle + '></div>';
      } else {
        mediaHTML = '<div class="hobby-img hobby-illust-wrap">' + investSVG + '</div>';
      }
      card.innerHTML =
        mediaHTML +
        '<div class="hobby-body">' +
          '<h4 class="hobby-title">' + h.title + '</h4>' +
          '<p class="hobby-desc">' + h.desc + '</p>' +
        '</div>';
      hobbiesGrid.appendChild(card);
    });
  }

  /* ---------- 人生旅程 · 插画树形曲线时间轴 ---------- */
  var journey = document.getElementById('journey');
  if (journey && window.TIMELINE) {
    /* 树枝数据：起点(树干上的连接点)、控制点、终点(叶子卡片方向) */
    var branchData = [
      { x1: 448, y1: 745, cx1: 380, cy1: 758, cx2: 280, cy2: 748, x2: 165, y2: 735, side: 'left' },
      { x1: 452, y1: 585, cx1: 520, cy1: 598, cx2: 620, cy2: 588, x2: 735, y2: 575, side: 'right' },
      { x1: 448, y1: 425, cx1: 380, cy1: 438, cx2: 280, cy2: 428, x2: 165, y2: 415, side: 'left' },
      { x1: 452, y1: 265, cx1: 520, cy1: 278, cx2: 620, cy2: 268, x2: 735, y2: 255, side: 'right' },
      { x1: 448, y1: 100, cx1: 380, cy1: 88, cx2: 300, cy2: 68, x2: 220, y2: 48, side: 'left' }
    ];

    /* 卡片垂直位置百分比（基于容器 880px 高度） */
    var cardTops = ['80%', '61%', '43%', '25%', '3%'];

    var svgInner = '';

    /* 树根装饰 */
    svgInner += '<path class="root" d="M 450 855 Q 390 872, 340 868 Q 400 870, 450 858" />';
    svgInner += '<path class="root" d="M 450 855 Q 510 872, 560 868 Q 500 870, 450 858" />';
    svgInner += '<path class="root" d="M 450 855 Q 420 875, 390 872 Q 430 870, 450 858" />';
    svgInner += '<path class="root" d="M 450 855 Q 480 875, 510 872 Q 470 870, 450 858" />';

    /* 树冠装饰圆 */
    svgInner += '<circle class="canopy" cx="450" cy="35" r="65" />';
    svgInner += '<circle class="canopy" cx="400" cy="55" r="45" />';
    svgInner += '<circle class="canopy" cx="500" cy="48" r="50" />';
    svgInner += '<circle class="canopy" cx="430" cy="20" r="38" />';

    /* 树干 —— 从底部弯曲向上 */
    svgInner += '<path class="trunk" d="M 450 855 C 432 710, 468 560, 450 420 C 432 280, 468 140, 450 35" />';

    /* 树枝 + 果实 + 小叶子装饰 */
    TIMELINE.forEach(function (t, i) {
      var b = branchData[i];
      if (!b) return;
      var delayClass = i > 0 ? ' delay-' + i : '';

      /* 树枝曲线 */
      svgInner += '<path class="branch' + delayClass + '" stroke="' + t.color + '" ' +
        'd="M ' + b.x1 + ' ' + b.y1 + ' C ' + b.cx1 + ' ' + b.cy1 + ', ' + b.cx2 + ' ' + b.cy2 + ', ' + b.x2 + ' ' + b.y2 + '" />';

      /* 果实/节点 */
      svgInner += '<circle class="fruit" cx="' + b.x2 + '" cy="' + b.y2 + '" r="7" fill="' + t.color + '"' + delayClass + ' />';

      /* 小叶子装饰 —— 沿树枝散布 */
      var midX = (b.x1 + b.x2) / 2;
      var midY = (b.y1 + b.y2) / 2;
      var leafSize = 8 + Math.random() * 4;
      svgInner += '<ellipse class="leaf-deco' + delayClass + '" cx="' + (midX - 15) + '" cy="' + (midY - 8) + '" rx="' + leafSize + '" ry="' + (leafSize * 0.5) + '" fill="' + t.color + '" transform="rotate(-30 ' + (midX - 15) + ' ' + (midY - 8) + ')" />';
      svgInner += '<ellipse class="leaf-deco' + delayClass + '" cx="' + (midX + 10) + '" cy="' + (midY + 5) + '" rx="' + (leafSize * 0.8) + '" ry="' + (leafSize * 0.4) + '" fill="' + t.color + '" transform="rotate(25 ' + (midX + 10) + ' ' + (midY + 5) + ')" />';
    });

    /* 组装 HTML */
    var html = '<div class="tree-timeline">';
    html += '<svg class="tree-svg" viewBox="0 0 900 880" preserveAspectRatio="xMidYMid meet">';
    html += svgInner;
    html += '</svg>';

    /* 叶子卡片 */
    TIMELINE.forEach(function (t, i) {
      var b = branchData[i];
      if (!b) return;
      var sideClass = b.side === 'left' ? 'tree-leaf-left' : 'tree-leaf-right';
      var posStyle = b.side === 'left'
        ? 'left: 1%; top: ' + cardTops[i] + ';'
        : 'right: 1%; top: ' + cardTops[i] + ';';

      html += '<div class="tree-leaf ' + sideClass + ' reveal d' + ((i % 3) + 1) + '" style="' + posStyle + '">';
      html += '<div class="tree-leaf-year">' + t.year + '</div>';
      html += '<div class="tree-leaf-role" style="background:' + t.color + ';">' + t.role + '</div>';
      html += '<p class="tree-leaf-desc">' + t.desc + '</p>';
      html += '</div>';
    });

    html += '</div>';
    journey.innerHTML = html;
  }

  /* ---------- 导航栏滚动状态 ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 移动端菜单 ---------- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', function () { navLinks.classList.toggle('open'); });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.remove('open'); });
    });
  }

  /* ---------- 导航高亮（当前章节） ---------- */
  var sectionIds = ['hero', 'works', 'about', 'toolbox-section', 'hobbies', 'journey-section', 'contact'];
  var aboutSectionIds = ['about', 'toolbox-section', 'hobbies', 'journey-section'];
  var sections = sectionIds.map(function (id) { return document.getElementById(id); });
  var linkMap = {};
  navLinks && navLinks.querySelectorAll('a').forEach(function (a) {
    linkMap[a.getAttribute('href').slice(1)] = a;
  });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          Object.keys(linkMap).forEach(function (k) { linkMap[k].classList.remove('active'); });
          var navKey = en.target.id;
          if (aboutSectionIds.indexOf(navKey) > -1) navKey = 'about';
          if (linkMap[navKey]) linkMap[navKey].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------- 滚动入场动画 ---------- */
  if ('IntersectionObserver' in window) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          revealer.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { revealer.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 联系页打字机效果 ---------- */
  var contactTitle = document.getElementById('contactTitle');
  var contactSub = document.getElementById('contactSub');
  var titleText = '如果你正在思考，\nAI能为业务做什么？';
  var subText = '无论是从0开始搭建，还是让现有流程更智能，我都很乐意听听你的想法。我们一起，把好点子变成好产品。';

  function typeWriter(element, text, speed, callback) {
    var i = 0;
    element.innerHTML = '';
    function type() {
      if (i < text.length) {
        var char = text.charAt(i);
        if (char === '\n') {
          element.innerHTML += '<br>';
        } else {
          element.innerHTML += char;
        }
        i++;
        setTimeout(type, speed);
      } else if (callback) {
        callback();
      }
    }
    type();
  }

  if (contactTitle && contactSub && 'IntersectionObserver' in window) {
    var contactObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          typeWriter(contactTitle, titleText, 80, function () {
            contactTitle.classList.add('done');
            typeWriter(contactSub, subText, 40);
          });
          contactObs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    contactObs.observe(document.getElementById('contact'));
  } else if (contactTitle && contactSub) {
    contactTitle.innerHTML = titleText.replace(/\n/g, '<br>');
    contactSub.innerHTML = subText;
  }

  /* ---------- 平滑滚动偏移修正 ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
