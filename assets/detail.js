/* ============================================================
   项目详情页逻辑 —— 根据 ?id= 渲染案例研究
   支持：coverImg 封面图、gallery 产品图、links 外部链接
   ============================================================ */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var id = parseInt(params.get('id'), 10);
  var project = (window.PROJECTS || []).find(function (p) { return p.id === id; });

  /* 导航栏滚动状态 */
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', function () { navLinks.classList.toggle('open'); });
  }

  /* 未找到项目 */
  if (!project) {
    document.getElementById('dTitle').textContent = '项目不存在';
    document.getElementById('dSub').textContent = '可能链接已失效，返回项目列表看看其他案例吧。';
    document.getElementById('dCover').style.display = 'none';
    document.getElementById('dStats').style.display = 'none';
    document.getElementById('dSide').style.display = 'none';
    document.getElementById('dContent').innerHTML = '<p style="text-align:center;padding:60px 0;"><a href="index.html#works" class="btn btn-primary">返回项目</a></p>';
    document.title = '项目不存在 · Rachel';
    return;
  }

  /* 标题 */
  document.title = project.title + ' · 项目详情 · Rachel';

  /* Hero 区 */
  document.getElementById('dCat').innerHTML = '<span class="detail-cat">' + project.cat + '</span>';
  document.getElementById('dTitle').textContent = project.title;
  document.getElementById('dSub').textContent = project.summary;

  /* 封面 —— 优先使用图片，否则用渐变兜底 */
  var cover = document.getElementById('dCover');
  cover.style.background = project.cover;
  if (project.coverImg) {
    cover.classList.add('has-img');
    cover.innerHTML =
      '<img src="' + project.coverImg + '" alt="' + project.title + '" class="detail-cover-img">' +
      '<span class="detail-cover-num">0' + project.id + '</span>';
  } else {
    cover.innerHTML =
      '<span style="font-family:var(--font-display);font-weight:700;font-size:clamp(80px,12vw,160px);color:rgba(255,255,255,0.9);letter-spacing:-0.04em;">0' + project.id + '</span>' +
      '<span style="position:absolute;top:28px;left:32px;font-size:14px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.92);">' + project.cat + '</span>';
  }

  /* 数据高光 */
  var statsHTML = project.stats.map(function (s) {
    return '<div class="ds"><div class="v">' + s.v + '</div><div class="l">' + s.l + '</div></div>';
  }).join('');
  document.getElementById('dStats').innerHTML = statsHTML;

  /* 侧栏信息 */
  document.getElementById('dSide').innerHTML =
    '<div class="row"><h5>角色</h5><p>' + project.role + '</p></div>' +
    '<div class="row"><h5>周期</h5><p>' + project.period + '</p></div>' +
    '<div class="row"><h5>团队</h5><p>' + project.team + '</p></div>' +
    '<div class="row"><h5>标签</h5><p>' + project.tags.join(' · ') + '</p></div>';

  /* 正文 · 案例研究 */
  var content = document.getElementById('dContent');
  var galleryInserted = false;

  project.blocks.forEach(function (b, i) {
    var h = document.createElement('h3');
    h.textContent = b.h;
    content.appendChild(h);

    if (b.p) {
      var p = document.createElement('p');
      p.textContent = b.p;
      content.appendChild(p);
    }

    if (b.list && b.list.length) {
      var ul = document.createElement('ul');
      ul.className = 'bullets';
      b.list.forEach(function (it) {
        var li = document.createElement('li');
        li.textContent = it;
        ul.appendChild(li);
      });
      content.appendChild(ul);
    }

    /* 插入产品图 gallery —— 在包含"功能""产品""工作"的 block 之后插入 */
    if (!galleryInserted && project.gallery && project.gallery.length) {
      var shouldInsert = b.h.indexOf('功能') > -1 || b.h.indexOf('产品') > -1 || b.h.indexOf('工作') > -1 || i >= 1;
      if (shouldInsert) {
        var gal = document.createElement('div');
        gal.className = 'detail-gallery';
        project.gallery.forEach(function (g) {
          gal.innerHTML +=
            '<figure class="gallery-item">' +
              '<img src="' + g.src + '" alt="' + (g.caption || '') + '">' +
              (g.caption ? '<figcaption>' + g.caption + '</figcaption>' : '') +
            '</figure>';
        });
        content.appendChild(gal);
        galleryInserted = true;
      }
    }

    /* 插入外部链接 —— 使用 createElement 确保点击可靠 */
    if (b.links && b.links.length) {
      var linksDiv = document.createElement('div');
      linksDiv.className = 'detail-links';
      b.links.forEach(function (l) {
        var linkEl = document.createElement('a');
        linkEl.href = l.url;
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';
        linkEl.className = 'detail-link';
        linkEl.innerHTML =
          '<span class="dl-label">' + l.label + '</span>' +
          '<span class="dl-arrow">↗</span>';
        /* 显式点击处理：优先 window.open，被拦截则降级为当前页跳转 */
        linkEl.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var win = window.open(l.url, '_blank');
          if (!win) {
            window.location.href = l.url;
          }
        });
        linksDiv.appendChild(linkEl);
      });
      content.appendChild(linksDiv);
    }

    /* 在「主要工作」「关键设计」之后插入引言金句 */
    if (project.callout && (b.h.indexOf('设计') > -1 || b.h.indexOf('工作') > -1)) {
      var co = document.createElement('div');
      co.className = 'detail-callout';
      co.innerHTML = '<p>" ' + project.callout + ' "</p>';
      content.appendChild(co);
    }
  });

  /* 上一篇 / 下一篇 */
  var idx = PROJECTS.indexOf(project);
  var prevP = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  var nextP = PROJECTS[(idx + 1) % PROJECTS.length];
  document.getElementById('dNav').innerHTML =
    '<a href="detail.html?id=' + prevP.id + '" class="prev"><div class="l">← 上一篇</div><div class="t">' + prevP.title + '</div></a>' +
    '<a href="detail.html?id=' + nextP.id + '" class="next"><div class="l">下一篇 →</div><div class="t">' + nextP.title + '</div></a>';

  /* 滚动入场 */
  if ('IntersectionObserver' in window) {
    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
  }
})();
