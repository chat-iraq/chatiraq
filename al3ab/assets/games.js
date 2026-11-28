/* games.js — منصة دردشة وألعاب حقيقية على Firebase RTDB الموجود مسبقاً
   لا تحتاج قواعد جديدة: كل البيانات تُكتب ضمن chat/presence/rate/block المسموحة أصلاً.
   المضيف هو صاحب رسالة «create» الأولى، وهو الوحيد الذي يكتب حالة اللعبة. */
(function () {
  'use strict';

  var D = window.GAME_DATA || {};
  var cfg = window.CHAT_FIREBASE;
  var appRef = null, db = null, authRef = null;
  var myUid = '', myNick = '', roomCode = '', myTab = '';
  var msgsRef = null, presRef = null, roomKey = '';
  var hostUid = '', state = null, stateV = 0, selectedGame = 'xo';
  var players = {}, blocked = {}, lastSent = {}, presenceTimer = null;
  var voice = { on: false, stream: null, pcs: {}, audios: {}, pendingIce: {}, muted: false };
  var quizTimer = null, quizTimerKey = '', ludoTimer = null;
  var GAME_NAMES = { xo: 'إكس أو', ludo: 'لودو', quiz: 'مسابقة سوالف', hangman: 'خمّن الكلمة', riddles: 'فزورة اليوم', words: 'سباق الكلمات' };

  function $(s, r) { return (r || document).querySelector(s); }
  function $$ (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = String(text);
    return n;
  }
  function show(node, yes) { if (node) node.hidden = !yes; }
  function cleanName(raw) {
    var s = String(raw || '').replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim();
    s = s.replace(/[<>{}[\]\\\t\r\n]/g, '').replace(/\s{2,}/g, ' ');
    return s.slice(0, 20);
  }
  function cleanText(raw) { return String(raw || '').replace(/[\u200e\u200f]/g, '').trim().slice(0, 300); }
  function norm(s) {
    return String(s || '').toLowerCase().replace(/[\u064b-\u065f\u0670]/g, '')
      .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
  }
  function fmtTime(ts) { try { return new Date(ts).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }
  function toast(msg, ms) {
    var t = el('div', 'ag-toast', msg);
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('is-out'); }, ms || 2600);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, (ms || 2600) + 350);
  }
  function status(msg) { var n = $('#agStatus'); if (n) n.textContent = msg; }
  function canSend(kind, ms) {
    var now = Date.now(), last = lastSent[kind] || 0;
    if (now - last < (ms || 250)) return false;
    lastSent[kind] = now;
    return true;
  }
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h >>> 0;
  }
  function todaySeed() {
    var d = new Date();
    return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate();
  }
  function shuffled(arr, seed) {
    var a = arr.slice(), s = seed >>> 0;
    for (var i = a.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      var j = s % (i + 1), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function tabKey() {
    try {
      var k = sessionStorage.getItem('ag-tab');
      if (!k) { k = 'g' + (Math.random() * 1e9 | 0) + Date.now(); sessionStorage.setItem('ag-tab', k); }
      return k;
    } catch (e) { return 'g' + (Math.random() * 1e9 | 0) + Date.now(); }
  }
  function makeCode() {
    var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)];
    return s;
  }
  function roomId(code) { return 'asltime-game-' + String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8); }
  function requiredPlayers(game) { return (game === 'xo' || game === 'quiz' || game === 'ludo') ? 2 : 1; }
  function roomQuestions() { return shuffled(D.questions || [], hash(roomCode + ':' + todaySeed())).slice(0, 10); }

  /* ───────── Firebase ───────── */
  function loadFirebase(cb, fail, depth) {
    if (window.firebase && window.firebase.database && window.firebase.initializeApp) return cb();
    if ((depth || 0) > 4) return fail();
    var base = 'https://www.gstatic.com/firebasejs/10.12.2/';
    var files = ['firebase-app-compat.js', 'firebase-database-compat.js', 'firebase-auth-compat.js'];
    var i = 0;
    (function next() {
      if (i >= files.length) {
        if (window.firebase && window.firebase.database && window.firebase.initializeApp) cb();
        else setTimeout(loadFirebase, 500, cb, fail, (depth || 0) + 1);
        return;
      }
      var s = document.createElement('script');
      s.src = base + files[i];
      s.onload = function () { i++; next(); };
      s.onerror = function () { setTimeout(loadFirebase, 500, cb, fail, (depth || 0) + 1); };
      document.head.appendChild(s);
    })();
  }
  function bootFirebase(done) {
    if (!cfg || !cfg.databaseURL) { status('خدمة الألعاب غير مهيّأة الآن.'); return; }
    loadFirebase(function () {
      try {
        appRef = window.firebase.apps().length
          ? (window.firebase.app('ds-games') || window.firebase.initializeApp(cfg, 'ds-games'))
          : window.firebase.initializeApp(cfg, 'ds-games');
      } catch (e) { appRef = window.firebase.initializeApp(cfg, 'ds-games-' + Date.now()); }
      db = window.firebase.database(appRef);
      authRef = window.firebase.auth(appRef);
      var booted = false;
      function onUser(user) {
        if (!user || !user.uid || booted) return;
        booted = true; myUid = user.uid; done();
      }
      authRef.onAuthStateChanged(onUser);
      if (authRef.currentUser) onUser(authRef.currentUser);
      else authRef.signInAnonymously().then(onUser).catch(function () { status('تعذّر الدخول كزائر — جرّب تحديث الصفحة.'); });
      setTimeout(function () { if (!booted) status('تعذّر الاتصال بالألعاب — تحقق من الإنترنت ثم أعد المحاولة.'); }, 8000);
    }, function () { status('تعذّر تحميل خدمة الألعاب — جرّب بعد قليل.'); });
  }
  function send(kind, payload, extra) {
    if (!msgsRef || !myUid) return;
    var msg = { n: myNick || 'زائر', u: myUid, ts: Date.now(), k: kind, t: '' };
    if (kind === 'signal') {
      /* وصف WebRTC قد يتجاوز 2000 حرف في t؛ قواعد الشات تسمح بـ a/c فقط كحقول إضافية،
         لذلك يُغلَّف المستلم داخل c ولا يُضاف حقل to مستقل وإلا رفضت القواعد الرسالة. */
      var sig = payload || {};
      msg.a = String(sig.type || '');
      msg.c = JSON.stringify({ to: sig.to || '', d: sig.data || {} });
      msg.t = 'signal';
    } else {
      var text = typeof payload === 'string' ? payload : JSON.stringify(payload);
      if (text.length > 1900) { toast('البيانات أكبر من الحد المسموح.'); return false; }
      msg.t = text;
    }
    if (extra) Object.keys(extra).forEach(function (k) { msg[k] = extra[k]; });
    msgsRef.push(msg);
    return true;
  }
  function publish(patch) {
    if (myUid !== hostUid || !state) return;
    var next = {};
    Object.keys(state).forEach(function (k) { next[k] = state[k]; });
    Object.keys(patch).forEach(function (k) { next[k] = patch[k]; });
    next.v = (state.v || 0) + 1;
    next.u = myUid;
    next.host = hostUid;
    if (JSON.stringify(next).length > 1900) { toast('حالة اللعبة كبيرة جداً.'); return; }
    state = next;
    send('state', state);
    renderState();
  }

  /* ─────────Room ───────── */
  function joinRoom(code) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    if (code.length < 5) { toast('اكتب رمز الغرفة بشكل صحيح.'); return; }
    myNick = cleanName($('#agNick') && $('#agNick').value);
    if (myNick.length < 2) { toast('اكتب اسماً مستعاراً من حرفين على الأقل.'); return; }
    roomCode = code; roomKey = roomId(code);
    myTab = tabKey();
    msgsRef = db.ref('chat/' + roomKey);
    presRef = db.ref('presence/' + roomKey);
    msgsRef.limitToLast(200).on('child_added', onMessage);
    presRef.on('value', onPresence);
    writePresence();
    presenceTimer = setInterval(writePresence, 20000);
    show($('#agSetup'), false); show($('#agRoom'), true);
    $('#agRoomCode').textContent = code;
    var url = location.href.split('?')[0] + '?room=' + code;
    $('#agShare').value = url;
    history.replaceState(null, '', url);
    status('تم الاتصال بالغرفة ' + code + '.');
    try { window.localStorage.setItem('ag-nick', myNick); } catch (e) {}
  }
  function createRoom() {
    var code = makeCode();
    myNick = cleanName($('#agNick') && $('#agNick').value);
    if (myNick.length < 2) { toast('اكتب اسماً مستعاراً أولاً.'); return; }
    joinRoom(code);
    send('sys', 'create');
    hostUid = myUid;
    state = { v: 1, u: myUid, phase: 'lobby', game: selectedGame, host: myUid, players: [] };
    send('state', state);
    renderState();
    toast('أنت مضيف الغرفة ' + code + '.');
  }
  function presenceStatus() {
    var parts = [];
    if (myUid === hostUid) parts.push('host');
    if (voice.on) parts.push('voice');
    return parts.join(':');
  }
  function writePresence() {
    if (!presRef || !myUid) return;
    presRef.child(myTab).set({
      n: myNick || 'زائر', u: myUid, t: Date.now(),
      a: $('#agReady') && $('#agReady').checked ? 1 : 0,
      c: hash(myUid) % 20, s: presenceStatus()
    });
  }
  function resolveHost() {
    if (hostUid && players[hostUid]) return false;
    var ids = Object.keys(players).sort(function (a, b) { return (players[a].t || 0) - (players[b].t || 0); });
    if (!ids.length) return false;
    hostUid = ids[0];
    status(hostUid === myUid ? 'أنت مضيف الغرفة الآن.' : ('المضيف: ' + (players[hostUid].n || 'عضو')));
    writePresence();
    renderPlayers();
    renderState();
    return true;
  }
  function onPresence(snap) {
    players = {};
    var vals = snap.val() || {};
    Object.keys(vals).forEach(function (k) {
      var p = vals[k];
      if (!p || !p.u || (Date.now() - (p.t || 0) > 90000)) return;
      if (!players[p.u] || (p.t || 0) > (players[p.u].t || 0)) players[p.u] = p;
    });
    renderPlayers();
    resolveHost();
    if (voice.on) syncVoicePeers();
  }
  function onMessage(snap) {
    var m = snap.val();
    if (!m || !m.u || !m.k) return;
    if (!hostUid && m.k === 'sys' && m.t === 'create') hostUid = m.u;
    if (m.k === 'state') {
      var s;
      try { s = JSON.parse(m.t); } catch (e) { return; }
      if (s && s.u === m.u && s.host === m.u && m.u === hostUid && (s.v || 0) > stateV) {
        stateV = s.v; state = s; renderState();
      }
      return;
    }
    if (m.k === 'move') {
      if (myUid !== hostUid) return;
      var mv; try { mv = JSON.parse(m.t); } catch (e) { return; }
      handleMove(m.u, m.n, mv);
      return;
    }
    if (m.k === 'chat') { appendChat(m); return; }
    if (m.k === 'signal') { onSignal(m.u, m.a, m.c); return; }
  }
  function leaveRoom() {
    if (presRef) presRef.child(myTab).remove();
    if (presenceTimer) clearInterval(presenceTimer);
    if (quizTimer) clearTimeout(quizTimer);
    quizTimerKey = '';
    if (ludoTimer) clearTimeout(ludoTimer);
    stopVoice();
    if (msgsRef) { msgsRef.off(); msgsRef = null; }
    if (presRef) { presRef.off(); presRef = null; }
    state = null; stateV = 0; hostUid = '';
    show($('#agRoom'), false); show($('#agSetup'), true);
    $('#agGameArea').innerHTML = '';
    $('#agChatList').innerHTML = '';
    status('غادرت الغرفة.');
  }

  /* ─────────Rendering room ───────── */
  function renderPlayers() {
    var box = $('#agPlayers'); if (!box) return;
    box.innerHTML = '';
    var list = Object.keys(players);
    list.sort(function (a, b) { return (players[a].t || 0) - (players[b].t || 0); });
    list.forEach(function (u) {
      var p = players[u];
      var row = el('div', 'ag-player' + (u === hostUid ? ' is-host' : ''));
      row.appendChild(el('span', 'ag-dot', ''));
      row.lastChild.style.background = u === myUid ? '#4d388f' : ['#e0543f','#2e9e68','#3f74d6','#d8a02c'][p.c % 4];
      row.appendChild(el('strong', '', p.n || 'زائر'));
      row.appendChild(el('span', 'ag-muted', u === hostUid ? ' · مضيف' : ''));
      row.appendChild(el('span', 'ag-spacer'));
      row.appendChild(el('span', 'ag-tag', p.a ? 'جاهز' : 'ينتظر'));
      box.appendChild(row);
    });
    var ready = list.filter(function (u) { return players[u].a; }).length;
    var need = requiredPlayers((state && state.game) || selectedGame);
    var start = $('#agStart');
    if (start) start.disabled = !(myUid === hostUid && ready >= need && state && state.phase === 'lobby');
    var who = $('#agWho'); if (who) who.textContent = list.length + ' في الغرفة · ' + ready + ' جاهز';
  }
  function renderState() {
    if (!state) return;
    selectedGame = state.game || selectedGame;
    if (myUid === hostUid && state.game === 'quiz' && state.phase === 'playing') scheduleQuiz();
    $$('[data-game]').forEach(function (b) {
      var on = b.getAttribute('data-game') === selectedGame;
      b.classList.toggle('is-active', on);
      b.disabled = !(myUid === hostUid && state.phase === 'lobby');
    });
    var start = $('#agStart');
    if (start) {
      start.hidden = !(myUid === hostUid && state.phase === 'lobby');
      start.textContent = 'ابدأ ' + (GAME_NAMES[selectedGame] || 'اللعبة');
    }
    var waiting = $('#agWaiting');
    if (waiting) waiting.hidden = !(state.phase === 'lobby' && myUid !== hostUid);
    var area = $('#agGameArea'); if (!area) return;
    area.innerHTML = '';
    if (state.phase === 'lobby') {
      area.appendChild(el('p', 'ag-muted', 'الغرفة جاهزة. اختر لعبة من القائمة، واضغط «أنا جاهز»، ثم يبدأ المضيف الجولة.'));
      return;
    }
    if (state.phase === 'finished') {
      var h = el('h3', '', state.winnerName ? ('فاز ' + state.winnerName + ' 🎉') : 'انتهت الجولة');
      area.appendChild(h);
      if (state.scores) {
        var ul = el('ul', 'ag-scores');
        Object.keys(state.scores).sort(function (a, b) { return state.scores[b] - state.scores[a]; }).forEach(function (u) {
          ul.appendChild(el('li', '', (players[u] ? players[u].n : (state.names && state.names[u] || 'عضو')) + ' — ' + state.scores[u]));
        });
        area.appendChild(ul);
      }
      var again = el('button', 'ag-btn', 'جولة جديدة');
      again.onclick = function () { if (myUid === hostUid) resetGame(); };
      area.appendChild(again);
      return;
    }
    if (state.game === 'xo') renderXO(area);
    else if (state.game === 'ludo') renderLudo(area);
    else if (state.game === 'quiz') renderQuiz(area);
    else renderSolo(area, state.game);
  }
  function renderSolo(area, game) {
    var box = el('div', 'ag-solo');
    box.appendChild(el('h3', '', GAME_NAMES[game] || 'لعبة'));
    box.appendChild(el('p', 'ag-muted', 'هذه اللعبة تعمل فوراً على جهازك داخل الغرفة؛ يمكنك مشاركة نتيجتها في الدردشة.'));
    var host = el('div', 'ag-solo-host'); host.id = 'agSoloHost'; box.appendChild(host);
    area.appendChild(box);
    if (game === 'hangman') renderHangman(host);
    else if (game === 'riddles') renderRiddle(host);
    else if (game === 'words') renderWords(host);
  }

  /* ─────────XO ───────── */
  function buildPlayers(max) {
    var ready = Object.keys(players).filter(function (u) { return players[u].a; })
      .sort(function (a, b) { return (players[a].t || 0) - (players[b].t || 0); }).slice(0, max);
    return ready.map(function (u, i) { return { u: u, n: players[u].n || 'زائر', c: i }; });
  }
  function startGame(game) {
    if (myUid !== hostUid) return;
    var ps = buildPlayers(game === 'ludo' ? 4 : game === 'quiz' ? 8 : (game === 'xo' ? 2 : 8));
    var need = requiredPlayers(game);
    if (ps.length < need) { toast('يلزم ' + (need === 1 ? 'لاعب جاهز واحد' : 'لاعبان جاهزان') + ' على الأقل.'); return; }
    var base = { phase: 'playing', game: game, players: ps, names: {}, scores: {} };
    ps.forEach(function (p, i) { base.names[p.u] = p.n; base.scores[p.u] = 0; });
    if (game === 'xo') { base.board = ['','','','','','','','','']; base.turn = 0; base.mark = ['x','o']; base.winner = null; base.line = []; }
    if (game === 'ludo') { base.tokens = ps.map(function () { return [-1,-1,-1,-1]; }); base.turn = 0; base.roll = 0; base.sixStreak = 0; base.winner = null; }
    if (game === 'quiz') {
      base.qIndex = 0; base.answers = {}; base.deadline = Date.now() + 20000;
    }
    selectedGame = game;
    publish(base);
  }
  function resetGame() { if (myUid === hostUid) startGame(state.game); }
  function renderXO(area) {
    var turn = state.players[state.turn];
    var head = el('p', 'ag-turn', state.winner ? '' : 'دور ' + (turn ? turn.n : '—') + ' (' + (state.mark[state.turn] === 'x' ? '×' : '○') + ')');
    area.appendChild(head);
    var grid = el('div', 'ag-xo');
    (state.board || []).forEach(function (v, i) {
      var b = el('button', 'ag-cell' + (v ? ' is-filled' : ''), v || '');
      b.setAttribute('aria-label', 'خانة ' + (i + 1));
      b.disabled = !!v || !!state.winner || !turn || turn.u !== myUid;
      b.onclick = function () { if (canSend('move', 200)) send('move', { type: 'move', cell: i }); };
      grid.appendChild(b);
    });
    area.appendChild(grid);
  }
  function winningLine(b) {
    var L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (var i = 0; i < L.length; i++) {
      var a = L[i]; if (b[a[0]] && b[a[0]] === b[a[1]] && b[a[1]] === b[a[2]]) return a;
    }
    return null;
  }

  /* ─────────Ludo ───────── */
  function ludoCell(pid, p, ti) {
    var L = D.ludo || {};
    if (p === -1) return (L.yard[pid] || [])[ti] || [7, 7];
    if (p >= 0 && p < 52) return L.path[(L.start[pid] + p) % 52] || [7, 7];
    if (p >= 100 && p < 200) return (L.homeCells[pid] || [])[Math.min(5, p - 100)] || [7, 7];
    return [7, 7];
  }
  function renderLudo(area) {
    var L = D.ludo || {};
    var turn = state.players[state.turn];
    var bar = el('div', 'ag-ludo-bar');
    bar.appendChild(el('strong', '', 'دور ' + (turn ? turn.n : '—')));
    var dice = el('span', 'ag-dice', state.roll ? String(state.roll) : '—');
    bar.appendChild(dice);
    var roll = el('button', 'ag-btn ag-btn-sm', 'ارمِ النرد');
    roll.disabled = !turn || turn.u !== myUid || !!state.roll || !!state.winner;
    roll.onclick = function () { if (canSend('move', 400)) send('move', { type: 'roll' }); };
    bar.appendChild(roll);
    area.appendChild(bar);
    var board = el('div', 'ag-ludo');
    var grid = [];
    for (var r = 0; r < 15; r++) { grid[r] = []; for (var c = 0; c < 15; c++) grid[r][c] = el('div', 'ag-ludo-cell'); }
    for (var pid = 0; pid < (state.players || []).length; pid++) {
      var color = (L.colors || [])[pid] || '#4d388f';
      for (var ti = 0; ti < 4; ti++) {
        var p = (state.tokens[pid] || [])[ti];
        var cell = ludoCell(pid, p, ti), row = cell[0], col = cell[1];
        if (!grid[row] || !grid[row][col]) continue;
        var piece = el('span', 'ag-piece', '');
        piece.style.background = color;
        piece.title = (state.players[pid].n || '') + ' · قطعة ' + (ti + 1);
        if (turn && turn.u === myUid && state.roll && canMove(pid, ti)) {
          piece.classList.add('is-movable');
          (function (idx) { piece.onclick = function () { if (canSend('move', 250)) send('move', { type: 'move', token: idx }); }; })(ti);
        }
        grid[row][col].appendChild(piece);
      }
    }
    grid.forEach(function (row) { row.forEach(function (cell) { board.appendChild(cell); }); });
    area.appendChild(board);
    area.appendChild(el('p', 'ag-muted', 'الرمي 6 يمنح دوراً إضافياً؛ ثلاث رميات 6 متتالية تُلغي الدور. القطع تُؤكل إلا في الخانات الآمنة.'));
  }
  function canMove(pid, ti) {
    var p = (state.tokens[pid] || [])[ti], r = state.roll || 0;
    if (p === -1) return r === 6;
    if (p >= 0 && p < 52) {
      var entry = ((D.ludo.homeEntry[pid] - D.ludo.start[pid]) % 52 + 52) % 52;
      return p + r <= entry;
    }
    if (p >= 100 && p < 200) return (p - 100) + r <= 5;
    return false;
  }

  /* ─────────Quiz ───────── */
  function scheduleQuiz() {
    if (!state || state.game !== 'quiz' || state.phase !== 'playing') { quizTimerKey = ''; return; }
    var key = (state.qIndex || 0) + ':' + (state.deadline || 0);
    if (quizTimerKey === key) return;
    if (quizTimer) clearTimeout(quizTimer);
    quizTimerKey = key;
    var left = Math.max(200, (state.deadline || Date.now()) - Date.now());
    quizTimer = setTimeout(function () {
      if (!state || state.game !== 'quiz' || state.phase !== 'playing') return;
      if (myUid !== hostUid) { quizTimerKey = ''; scheduleQuiz(); return; }
      if ((state.qIndex || 0) + 1 >= roomQuestions().length) {
        var sorted = Object.keys(state.scores || {}).sort(function (a, b) { return state.scores[b] - state.scores[a]; });
        publish({ phase: 'finished', winner: sorted[0] || '', winnerName: (state.names && state.names[sorted[0]]) || '' });
      } else {
        publish({ qIndex: (state.qIndex || 0) + 1, answers: {}, deadline: Date.now() + 20000 });
      }
    }, left);
  }
  function renderQuiz(area) {
    var qs = roomQuestions(), q = qs[state.qIndex || 0];
    if (!q) return;
    area.appendChild(el('p', 'ag-muted', 'السؤال ' + ((state.qIndex || 0) + 1) + ' من ' + qs.length + ' · التصنيف: ' + q.c));
    area.appendChild(el('h3', 'ag-q', q.q));
    var count = el('p', 'ag-muted', '');
    area.appendChild(count);
    var answers = el('div', 'ag-answers');
    q.o.forEach(function (opt, i) {
      var b = el('button', 'ag-answer', opt);
      b.disabled = !!(state.answers || {})[myUid] || Date.now() > (state.deadline || 0);
      b.onclick = function () { if (canSend('answer', 400)) send('move', { type: 'answer', q: state.qIndex, a: i }); };
      answers.appendChild(b);
    });
    area.appendChild(answers);
    var deadline = state.deadline || 0;
    function tick() {
      if (!state || state.game !== 'quiz' || (state.deadline || 0) !== deadline) return;
      var left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      count.textContent = left ? ('الوقت المتبقي: ' + left + ' ثانية') : 'انتهى الوقت — جاري الانتقال…';
      if (left && left < 6) setTimeout(tick, 1000);
    }
    tick();
    var ranked = el('ul', 'ag-scores');
    Object.keys(state.scores || {}).sort(function (a, b) { return state.scores[b] - state.scores[a]; }).forEach(function (u) {
      ranked.appendChild(el('li', '', (state.names[u] || 'عضو') + ' — ' + state.scores[u]));
    });
    area.appendChild(ranked);
  }

  /* ─────────Solo games ───────── */
  function renderHangman(host) {
    var words = D.words || ['عراق'];
    var word = words[hash(todaySeed() + ':hangman') % words.length];
    var letters = Array.prototype.slice.call(word);
    var guessed = {}, wrong = 0, max = 6;
    var wordBox = el('div', 'ag-word');
    var msg = el('p', 'ag-muted', 'خمّن الكلمة من الجوال. لديك 6 محاولات.');
    var keys = el('div', 'ag-keys');
    function draw() {
      wordBox.innerHTML = '';
      letters.forEach(function (ch) { wordBox.appendChild(el('span', 'ag-letter', guessed[ch] ? ch : 'ـ')); });
      msg.textContent = wrong >= max ? ('انتهت المحاولات — الكلمة: ' + word) :
        (letters.every(function (c) { return guessed[c]; }) ? ('أحسنت! الكلمة: ' + word) : ('الأخطاء: ' + wrong + ' / ' + max));
    }
    'ابجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ'.split('').forEach(function (ch) {
      var b = el('button', 'ag-key', ch);
      b.onclick = function () {
        if (guessed[ch] || wrong >= max) return;
        guessed[ch] = true;
        if (letters.indexOf(ch) < 0) wrong++;
        b.disabled = true; draw();
      };
      keys.appendChild(b);
    });
    var hint = el('button', 'ag-btn ag-btn-sm', 'تلميح');
    hint.onclick = function () { toast('أول حرف: ' + letters[0]); };
    var share = el('button', 'ag-btn ag-btn-sm', 'شارك النتيجة');
    share.onclick = function () { shareResult('خمّن الكلمة · ' + (wrong < max ? 'حللتُها بـ' + wrong + ' أخطاء' : 'لم أصل')); };
    host.appendChild(msg); host.appendChild(wordBox); host.appendChild(keys);
    var row = el('div', 'ag-row'); row.appendChild(hint); row.appendChild(share); host.appendChild(row);
    draw();
  }
  function renderRiddle(host) {
    var rs = D.riddles || [];
    var seed = hash(todaySeed() + ':riddle');
    var r = rs[seed % rs.length];
    var next = seed;
    var q = el('h3', 'ag-q', r.q);
    var h = el('p', 'ag-muted', 'تلميح: ' + r.h);
    var input = el('input', 'ag-input'); input.type = 'text'; input.maxLength = 40; input.placeholder = 'اكتب إجابتك…';
    var btn = el('button', 'ag-btn', 'تحقّق');
    var out = el('p', 'ag-muted', '');
    btn.onclick = function () {
      out.textContent = norm(input.value) === norm(r.a) ? 'إجابة صحيحة! أحسنت 🎉' : ('الإجابة: ' + r.a + ' — جرّب غيرها.');
    };
    var more = el('button', 'ag-btn ag-btn-sm', 'فزورة أخرى');
    more.onclick = function () {
      next = (next + 1) % rs.length; r = rs[next];
      q.textContent = r.q; h.textContent = 'تلميح: ' + r.h; input.value = ''; out.textContent = '';
    };
    var share = el('button', 'ag-btn ag-btn-sm', 'شارك التحدي');
    share.onclick = function () { shareResult('فزورة اليوم: ' + r.q); };
    host.appendChild(q); host.appendChild(h); host.appendChild(input); host.appendChild(btn); host.appendChild(out);
    var row = el('div', 'ag-row'); row.appendChild(more); row.appendChild(share); host.appendChild(row);
  }
  function renderWords(host) {
    var words = D.words || ['عراق'];
    var letter = words[hash(todaySeed() + ':words') % words.length][0];
    var used = {}, score = 0, left = 60, timer = null;
    var head = el('h3', 'ag-q', 'سباق الكلمات: ابدأ بحرف «' + letter + '»');
    var clock = el('p', 'ag-muted', 'الوقت: 60 ثانية');
    var input = el('input', 'ag-input'); input.type = 'text'; input.maxLength = 24; input.placeholder = 'كلمة تبدأ بالحرف…';
    var add = el('button', 'ag-btn', 'أضف الكلمة');
    var list = el('ul', 'ag-scores');
    add.onclick = function () {
      var w = cleanName(input.value);
      if (left <= 0) return;
      if (w.length < 3 || norm(w)[0] !== norm(letter) || used[norm(w)]) { toast('كلمة غير صالحة أو مكرّرة.'); return; }
      used[norm(w)] = true; score += w.length; list.appendChild(el('li', '', w + ' +' + w.length)); input.value = '';
    };
    var share = el('button', 'ag-btn ag-btn-sm', 'شارك النتيجة');
    share.onclick = function () { shareResult('سباق الكلمات · ' + score + ' نقطة'); };
    host.appendChild(head); host.appendChild(clock); host.appendChild(input); host.appendChild(add); host.appendChild(list);
    var row = el('div', 'ag-row'); row.appendChild(share); host.appendChild(row);
    timer = setInterval(function () {
      left--; clock.textContent = left > 0 ? ('الوقت: ' + left + ' ثانية · النقاط: ' + score) : ('انتهى الوقت! النقاط: ' + score + ' — ' + Object.keys(used).length + ' كلمة');
      if (left <= 0) { clearInterval(timer); input.disabled = true; add.disabled = true; }
    }, 1000);
  }
  function shareResult(text) {
    var input = $('#agChatInput');
    if (input) { input.value = text; input.focus(); }
    else toast(text);
  }

  /* ─────────Host move handling ───────── */
  function handleMove(uid, nick, mv) {
    if (!state || state.phase !== 'playing' || !mv) return;
    if (state.game === 'xo') {
      var t = state.players[state.turn];
      if (!t || t.u !== uid) return;
      var i = mv.cell;
      if (typeof i !== 'number' || i < 0 || i > 8 || state.board[i]) return;
      var board = state.board.slice();
      board[i] = state.mark[state.turn];
      var line = winningLine(board);
      var patch = { board: board };
      if (line) {
        patch.phase = 'finished'; patch.line = line; patch.winner = uid; patch.winnerName = nick;
        var sc = {}; Object.keys(state.scores).forEach(function (u) { sc[u] = state.scores[u]; });
        sc[uid] = (sc[uid] || 0) + 1; patch.scores = sc;
      } else if (board.indexOf('') < 0) {
        patch.phase = 'finished'; patch.winner = ''; patch.winnerName = '';
      } else patch.turn = (state.turn + 1) % state.players.length;
      publish(patch); return;
    }
    if (state.game === 'ludo') {
      var idx = state.players.findIndex(function (p) { return p.u === uid; });
      if (idx < 0 || idx !== state.turn || !state.roll) return;
      var tokens = state.tokens.map(function (a) { return a.slice(); });
      if (mv.type === 'roll') {
        if (ludoTimer) clearTimeout(ludoTimer);
        var r = 1 + Math.floor(Math.random() * 6);
        var streak = r === 6 ? (state.sixStreak || 0) + 1 : 0;
        if (streak >= 3) {
          publish({ roll: 0, sixStreak: 0, turn: (state.turn + 1) % state.players.length });
          toast('ثلاث رميات 6 — تم تمرير الدور.');
        } else {
          var moves = [];
          for (var k = 0; k < 4; k++) if (canMoveFor(tokens, idx, k, r)) moves.push(k);
          if (!moves.length) {
            publish({ roll: 0, sixStreak: 0, turn: (state.turn + 1) % state.players.length });
          } else publish({ roll: r, sixStreak: streak });
        }
        return;
      }
      if (mv.type === 'move') {
        var ti = mv.token;
        if (typeof ti !== 'number' || ti < 0 || ti > 3 || !canMoveFor(tokens, idx, ti, state.roll)) return;
        var p = tokens[idx][ti], np;
        if (p === -1) np = 0;
        else if (p >= 0 && p < 52) {
          var entry = ((D.ludo.homeEntry[idx] - D.ludo.start[idx]) % 52 + 52) % 52;
          if (p + state.roll > entry) return;
          np = p + state.roll === entry ? 100 : p + state.roll;
        } else if (p >= 100 && p < 200) {
          var n = p - 100 + state.roll;
          if (n > 5) return;
          np = n === 5 ? 200 : 100 + n;
        } else return;
        tokens[idx][ti] = np;
        if (np >= 0 && np < 52) {
          var here = (D.ludo.start[idx] + np) % 52;
          if (D.ludo.safe.indexOf(here) < 0) {
            state.players.forEach(function (other, oi) {
              if (oi === idx) return;
              for (var q = 0; q < 4; q++) {
                var op = tokens[oi][q];
                if (op >= 0 && op < 52 && (D.ludo.start[oi] + op) % 52 === here) tokens[oi][q] = -1;
              }
            });
          }
        }
        var won = tokens[idx].every(function (v) { return v === 200; });
        var patch2 = { tokens: tokens, roll: 0 };
        if (won) {
          patch2.phase = 'finished'; patch2.winner = uid; patch2.winnerName = nick; patch2.sixStreak = 0;
          var sc2 = {}; Object.keys(state.scores).forEach(function (u) { sc2[u] = state.scores[u]; });
          sc2[uid] = (sc2[uid] || 0) + 1; patch2.scores = sc2;
        } else if (state.roll === 6 && (state.sixStreak || 0) < 3) patch2.sixStreak = state.sixStreak || 1;
        else { patch2.turn = (state.turn + 1) % state.players.length; patch2.sixStreak = 0; }
        publish(patch2);
      }
      return;
    }
    if (state.game === 'quiz') {
      if (mv.type !== 'answer' || mv.q !== state.qIndex) return;
      if ((state.answers || {})[uid] !== undefined || Date.now() > (state.deadline || 0)) return;
      var q = roomQuestions()[state.qIndex || 0];
      if (!q || typeof mv.a !== 'number' || mv.a < 0 || mv.a >= q.o.length) return;
      var ans = {}; Object.keys(state.answers || {}).forEach(function (u) { ans[u] = state.answers[u]; });
      ans[uid] = mv.a;
      var scores = {}; Object.keys(state.scores).forEach(function (u) { scores[u] = state.scores[u]; });
      if (mv.a === q.a) scores[uid] = (scores[uid] || 0) + 10;
      publish({ answers: ans, scores: scores });
    }
  }
  function canMoveFor(tokens, pid, ti, r) {
    var p = tokens[pid][ti];
    if (p === -1) return r === 6;
    if (p >= 0 && p < 52) {
      var entry = ((D.ludo.homeEntry[pid] - D.ludo.start[pid]) % 52 + 52) % 52;
      return p + r <= entry;
    }
    if (p >= 100 && p < 200) return (p - 100) + r <= 5;
    return false;
  }

  /* ─────────Chat ───────── */
  function appendChat(m) {
    var box = $('#agChatList'); if (!box) return;
    if (blocked[m.u] || blocked[m.n] || (players[m.u] && blocked[players[m.u].n])) return;
    var row = el('div', 'ag-msg');
    var head = el('div', 'ag-msg-head');
    head.appendChild(el('strong', '', m.n || 'زائر'));
    head.appendChild(el('span', 'ag-muted', ' ' + fmtTime(m.ts)));
    row.appendChild(head);
    row.appendChild(el('div', 'ag-msg-body', cleanText(m.t)));
    box.appendChild(row);
    while (box.children.length > 80) box.removeChild(box.firstChild);
    box.scrollTop = box.scrollHeight;
  }

  /* ─────────Voice (mesh WebRTC, signaling عبر RTDB الموجود) ───────── */
  function speechSupported() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.RTCPeerConnection); }
  function startVoice() {
    if (!speechSupported()) { toast('المتصفح لا يدعم الميكروفون أو اتصال الصوت.'); return; }
    if (voice.on) { stopVoice(); return; }
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false })
      .then(function (stream) {
        voice.on = true; voice.stream = stream; voice.muted = false;
        $('#agVoiceBtn').textContent = 'إيقاف الصوت';
        $('#agMuteBtn').hidden = false;
        writePresence();
        syncVoicePeers();
        toast('تم تفعيل الميكروفون. يمكنك كتمه في أي وقت.');
      })
      .catch(function () { toast('لم يُسمح بالميكروفون — الدردشة الكتابية متاحة.'); });
  }
  function stopVoice() {
    if (voice.stream) voice.stream.getTracks().forEach(function (t) { t.stop(); });
    Object.keys(voice.pcs).forEach(function (u) { try { voice.pcs[u].close(); } catch (e) {} });
    Object.keys(voice.audios).forEach(function (u) { var a = voice.audios[u]; if (a && a.parentNode) a.parentNode.removeChild(a); });
    voice = { on: false, stream: null, pcs: {}, audios: {}, pendingIce: {}, muted: false };
    var b = $('#agVoiceBtn'); if (b) b.textContent = 'تفعيل الصوت';
    var m = $('#agMuteBtn'); if (m) m.hidden = true;
    writePresence();
    renderVoiceList();
  }
  function toggleMute() {
    if (!voice.stream) return;
    voice.muted = !voice.muted;
    voice.stream.getAudioTracks().forEach(function (t) { t.enabled = !voice.muted; });
    $('#agMuteBtn').textContent = voice.muted ? 'إلغاء الكتم' : 'كتم الميكروفون';
  }
  function syncVoicePeers() {
    if (!voice.on || !myUid) return;
    var uids = Object.keys(players).filter(function (u) {
      return u !== myUid && String(players[u].s || '').indexOf('voice') >= 0;
    }).slice(0, 5);
    Object.keys(voice.pcs).forEach(function (u) { if (uids.indexOf(u) < 0) closePeer(u); });
    uids.forEach(function (u) {
      if (!voice.pcs[u]) {
        var initiate = myUid < u;
        makePeer(u, initiate);
        if (initiate) createOffer(u);
      }
    });
    renderVoiceList();
  }
  function makePeer(uid, initiate) {
    var pc = new RTCPeerConnection({ iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ] });
    voice.pcs[uid] = pc;
    if (voice.stream) voice.stream.getTracks().forEach(function (t) { pc.addTrack(t, voice.stream); });
    pc.onicecandidate = function (e) {
      if (e.candidate) sendSignal(uid, 'ice', { c: e.candidate.toJSON ? e.candidate.toJSON() : { candidate: e.candidate.candidate, sdpMid: e.candidate.sdpMid, sdpMLineIndex: e.candidate.sdpMLineIndex } });
    };
    pc.ontrack = function (e) {
      var a = voice.audios[uid];
      if (!a) { a = document.createElement('audio'); a.autoplay = true; a.playsInline = true; voice.audios[uid] = a; document.body.appendChild(a); }
      a.srcObject = e.streams[0];
      var play = a.play(); if (play && play.catch) play.catch(function () {});
    };
    pc.onconnectionstatechange = function () {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') closePeer(uid);
      renderVoiceList();
    };
    return pc;
  }
  function createOffer(uid) {
    var pc = voice.pcs[uid]; if (!pc) return;
    pc.createOffer().then(function (o) { return pc.setLocalDescription(o); })
      .then(function () { sendSignal(uid, 'offer', { s: pc.localDescription }); })
      .catch(function () { toast('تعذّر بدء اتصال الصوت مع أحد الأعضاء.'); });
  }
  function sendSignal(to, type, data) { send('signal', { type: type, to: to, data: data }); }
  function onSignal(uid, type, payload) {
    if (!uid || uid === myUid || !voice.on) return;
    var env = {}, data = {};
    try { env = JSON.parse(payload || '{}'); } catch (e) { return; }
    if (env.to !== myUid) return;
    data = env.d || {};
    var pc = voice.pcs[uid] || makePeer(uid, false);
    if (type === 'offer') {
      pc.setRemoteDescription(data.s).then(function () {
        return flushIce(uid);
      }).then(function () { return pc.createAnswer(); })
        .then(function (a) { return pc.setLocalDescription(a); })
        .then(function () { sendSignal(uid, 'answer', { s: pc.localDescription }); })
        .catch(function () {});
    } else if (type === 'answer') {
      pc.setRemoteDescription(data.s).then(function () { return flushIce(uid); }).catch(function () {});
    } else if (type === 'ice') {
      if (!pc.remoteDescription) { (voice.pendingIce[uid] = voice.pendingIce[uid] || []).push(data.c); return; }
      try { pc.addIceCandidate(data.c); } catch (e) {}
    }
  }
  function flushIce(uid) {
    var pc = voice.pcs[uid], list = voice.pendingIce[uid] || [];
    voice.pendingIce[uid] = [];
    return list.reduce(function (chain, c) { return chain.then(function () { try { pc.addIceCandidate(c); } catch (e) {} }); }, Promise.resolve());
  }
  function closePeer(uid) {
    var pc = voice.pcs[uid]; if (pc) { try { pc.close(); } catch (e) {} delete voice.pcs[uid]; }
    var a = voice.audios[uid]; if (a) { if (a.parentNode) a.parentNode.removeChild(a); delete voice.audios[uid]; }
    delete voice.pendingIce[uid];
  }
  function renderVoiceList() {
    var box = $('#agVoiceList'); if (!box) return;
    box.innerHTML = '';
    if (!voice.on) { box.appendChild(el('span', 'ag-muted', 'الصوت متوقف — اضغط «تفعيل الصوت» للتحدث مع اللاعبين.')); return; }
    var active = Object.keys(players).filter(function (u) {
      return u === myUid || String(players[u].s || '').indexOf('voice') >= 0;
    });
    if (!active.length) { box.appendChild(el('span', 'ag-muted', 'لا أحد في الغرفة يستخدم الصوت حالياً.')); return; }
    active.forEach(function (u) {
      var p = players[u];
      var s = el('span', 'ag-voice-chip', (p.n || 'زائر') + (u === myUid ? ' (أنت)' : ''));
      box.appendChild(s);
    });
  }

  /* ───────── wiring ───────── */
  function wire() {
    $$('[data-game]').forEach(function (b) {
      b.onclick = function () {
        var g = b.getAttribute('data-game');
        if (myUid !== hostUid || !state || state.phase !== 'lobby') { toast('المضيف فقط يغيّر اللعبة قبل البدء.'); return; }
        publish({ game: g });
      };
    });
    $('#agCreate').onclick = createRoom;
    $('#agJoin').onclick = function () { joinRoom($('#agCode').value); };
    $('#agCode').addEventListener('keydown', function (e) { if (e.key === 'Enter') joinRoom($('#agCode').value); });
    $('#agReady').onchange = writePresence;
    $('#agStart').onclick = function () { startGame(selectedGame); };
    $('#agLeave').onclick = leaveRoom;
    $('#agCopy').onclick = function () {
      var input = $('#agShare');
      try { input.select(); document.execCommand('copy'); toast('تم نسخ رابط الغرفة.'); } catch (e) { toast('انسخ الرابط يدوياً.'); }
    };
    $('#agChatForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('#agChatInput'), text = cleanText(input.value);
      if (!text || !msgsRef) return;
      if (!canSend('chat', 700)) { toast('انتظر قليلاً قبل إرسال رسالة جديدة.'); return; }
      if (blocked[myUid]) return;
      send('chat', text); input.value = '';
    });
    $('#agVoiceBtn').onclick = startVoice;
    $('#agMuteBtn').onclick = toggleMute;
    $('#agBlockBtn').onclick = function () {
      var who = prompt('اكتب اسم العضو الذي تريد حجب رسائله (للجلسة الحالية):');
      who = cleanName(who);
      if (!who) return;
      blocked[who] = true;
      $$('.ag-msg').forEach(function (m) { if (m.querySelector('strong') && m.querySelector('strong').textContent === who) m.remove(); });
      toast('تم حجب رسائل ' + who + ' في هذه الجلسة.');
    };
    var savedNick = null;
    try { savedNick = localStorage.getItem('ag-nick'); } catch (e) {}
    if (savedNick) $('#agNick').value = savedNick.slice(0, 20);
    var q = new URLSearchParams(location.search);
    var room = q.get('room');
    if (room) {
      status('أدخل اسمك المستعار للانضمام إلى الغرفة ' + room.toUpperCase() + '.');
      $('#agCode').value = room.toUpperCase();
      if (savedNick) $('#agNick').setAttribute('data-autojoin', '1');
    }
    var g = q.get('game');
    if (g && GAME_NAMES[g]) selectedGame = g;
  }

  function start() {
    wire();
    renderSoloHosts();
    bootFirebase(function () {
      status('جاهز — أنشئ غرفة أو انضم إلى غرفة بالرمز.');
      var q = new URLSearchParams(location.search);
      if (q.get('room') && $('#agNick').value) joinRoom(q.get('room'));
    });
  }
  function renderSoloHosts() {
    ['hangman', 'riddles', 'words'].forEach(function (g) {
      var host = $('#agTry-' + g);
      if (!host) return;
      if (g === 'hangman') renderHangman(host);
      else if (g === 'riddles') renderRiddle(host);
      else renderWords(host);
    });
  }
  window.addEventListener('beforeunload', function () {
    if (presRef) { try { presRef.child(myTab).remove(); } catch (e) {} }
    stopVoice();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
