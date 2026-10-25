// Homepage hero (_includes/sort-hero.html): sorts a scrambled phrase step by step.
(function () {
  var line = document.getElementById('sort-line');
  if (!line) return;
  var cmpOut = document.getElementById('sort-cmps');
  var swapOut = document.getElementById('sort-swaps');
  var nameOut = document.getElementById('sort-name');
  var buttons = document.querySelectorAll('.algos button');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Each tile's id is its index in the phrase, so sorting ids spells the phrase.
  var tiles = Array.prototype.map.call(line.dataset.phrase || '', function (ch, i) {
    var el = document.createElement('span');
    el.className = 'tile' + (ch === ' ' ? ' space' : '');
    var c = document.createElement('span');
    c.className = 'ch';
    c.textContent = ch === ' ' ? ' ' : ch;
    var ix = document.createElement('span');
    ix.className = 'ix';
    ix.textContent = String(i);
    el.appendChild(c);
    el.appendChild(ix);
    return el;
  });
  line.textContent = '';

  function swap(a, i, j) { var t = a[i]; a[i] = a[j]; a[j] = t; }

  // Each algorithm returns steps: { c: [i, j] } for a comparison, plus { o: order } after a swap.
  var algos = {
    insertion: function (a) {
      var s = [];
      for (var i = 1; i < a.length; i++) {
        for (var j = i; j > 0; j--) {
          s.push({ c: [j - 1, j] });
          if (a[j - 1] <= a[j]) break;
          swap(a, j - 1, j);
          s.push({ o: a.slice(), c: [j - 1, j] });
        }
      }
      return s;
    },
    bubble: function (a) {
      var s = [];
      for (var end = a.length - 1; end > 0; end--) {
        var swapped = false;
        for (var j = 0; j < end; j++) {
          s.push({ c: [j, j + 1] });
          if (a[j] > a[j + 1]) {
            swap(a, j, j + 1);
            swapped = true;
            s.push({ o: a.slice(), c: [j, j + 1] });
          }
        }
        if (!swapped) break;
      }
      return s;
    },
    selection: function (a) {
      var s = [];
      for (var i = 0; i < a.length - 1; i++) {
        var min = i;
        for (var j = i + 1; j < a.length; j++) {
          s.push({ c: [min, j] });
          if (a[j] < a[min]) min = j;
        }
        if (min !== i) {
          swap(a, i, min);
          s.push({ o: a.slice(), c: [i, min] });
        }
      }
      return s;
    }
  };
  var names = { insertion: 'Insertion sort', bubble: 'Bubble sort', selection: 'Selection sort' };

  var order = [];
  var timer;

  // FLIP: measure, reorder the DOM, then animate each tile from its old spot.
  function render(next, animate) {
    var first = animate ? tiles.map(function (t) { return t.getBoundingClientRect().left; }) : [];
    next.forEach(function (id) { line.appendChild(tiles[id]); });
    order = next.slice();
    if (!animate) return;
    tiles.forEach(function (t, id) {
      var dx = first[id] - t.getBoundingClientRect().left;
      if (!dx) return;
      t.style.transition = 'none';
      t.style.transform = 'translateX(' + dx + 'px)';
      requestAnimationFrame(function () {
        t.style.transition = 'transform 140ms ease-out, color 120ms';
        t.style.transform = '';
      });
    });
  }

  function shuffled() {
    var a = tiles.map(function (_, i) { return i; });
    for (var i = a.length - 1; i > 0; i--) swap(a, i, Math.floor(Math.random() * (i + 1)));
    return a;
  }

  function run(algo) {
    clearTimeout(timer);
    nameOut.textContent = names[algo];
    var start = shuffled();
    var steps = algos[algo](start.slice());
    render(start, false);
    line.classList.add('running');
    var i = 0, cmps = 0, swaps = 0;
    // Reduced motion: tiles swap in place (no sliding) at a calmer pace.
    var delay = reduced ? 140 : Math.max(18, Math.min(80, 4200 / steps.length));
    function tick() {
      tiles.forEach(function (t) { t.classList.remove('cmp', 'swap'); });
      if (i >= steps.length) {
        timer = setTimeout(function () { line.classList.remove('running'); }, 600);
        return;
      }
      var step = steps[i++];
      if (step.o) { swaps++; render(step.o, !reduced); } else { cmps++; }
      step.c.forEach(function (pos) { tiles[order[pos]].classList.add(step.o ? 'swap' : 'cmp'); });
      cmpOut.textContent = String(cmps);
      swapOut.textContent = String(swaps);
      timer = setTimeout(tick, delay);
    }
    timer = setTimeout(tick, 500);
  }

  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(buttons, function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      run(btn.dataset.algo);
    });
  });

  run('insertion');
})();
