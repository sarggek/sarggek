/* page3.js
   Firestore-based live cypher:
   - anonymous auth
   - rappers registration
   - audience registration
   - start/auto cycles (5 hours)
   - votes stored under cycles/{cycleId}/votes
   - each user can vote once per rapper per cycle
   - live leaderboard from votes snapshot
   - history recorded at finalize
*/

// CONFIG: change here for quick testing
const CYCLE_DURATION_MS = 1 * 60 * 1000; // 1 minute for testing


// Firestore refs
const metaDocRef = db.collection('meta').doc('currentCycle');
const rappersRef = db.collection('rappers');
const cyclesRef = db.collection('cycles');
const historyRef = db.collection('history');

// DOM
const btnRapper = document.getElementById('btnRapper');
const btnAudience = document.getElementById('btnAudience');
const rapperForm = document.getElementById('rapperForm');
const audienceForm = document.getElementById('audienceForm');
const startCycleBtn = document.getElementById('startCycleBtn');
const cycleInfo = document.getElementById('cycleInfo');
const rapperListDiv = document.getElementById('rapperList');
const leaderboardList = document.getElementById('leaderboardList');
const prevWinnerBox = document.getElementById('prevWinnerBox');
const prevWinnerName = document.getElementById('prevWinnerName');
const prevWinnerDate = document.getElementById('prevWinnerDate');

let currentUid = null;
let currentCycle = null;
let userVotes = {}; // { rapperId: score } for current cycle
let totals = {};    // { rapperId: total }

// --------------- AUTH (anonymous) ---------------
auth.signInAnonymously().catch(console.error);
auth.onAuthStateChanged(user => {
  if (!user) return;
  currentUid = user.uid;
  console.log('signed in uid:', currentUid);
  // load initial data and listeners
  attachMetaListener();
  attachRappersListener();
  attachHistoryListener();
});

// --------------- UI role toggles ---------------
btnRapper.addEventListener('click', ()=> {
  rapperForm.classList.remove('hidden');
  audienceForm.classList.add('hidden');
});
btnAudience.addEventListener('click', ()=> {
  audienceForm.classList.remove('hidden');
  rapperForm.classList.add('hidden');
});

// submit forms
rapperForm.addEventListener('submit', async e => {
  e.preventDefault();
  const stageName = document.getElementById('stageName').value.trim();
  const realName = document.getElementById('realName').value.trim();
  const phone = document.getElementById('rPhone').value.trim();
  const email = document.getElementById('rEmail').value.trim();
  if(!stageName) return alert('Stage name required');
  try {
    await rappersRef.doc(currentUid).set({
      stageName,
      realName,
      phone,
      email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('users').doc(currentUid).set({ role:'rapper', stageName, realName, phone, email, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    rapperForm.reset();
    rapperForm.classList.add('hidden');
    alert('Saved — you are added to rapper list');
  } catch(err){ console.error(err); alert('Error saving rapper'); }
});

audienceForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('aName').value.trim();
  const phone = document.getElementById('aPhone').value.trim();
  const email = document.getElementById('aEmail').value.trim();
  if(!name) return alert('Name required');
  try {
    await db.collection('users').doc(currentUid).set({ role:'audience', name, phone, email, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    audienceForm.reset();
    audienceForm.classList.add('hidden');
    alert('Saved — you joined as audience');
  } catch(err){ console.error(err); alert('Error saving audience'); }
});

// --------------- START CYCLE ---------------
startCycleBtn.addEventListener('click', async ()=> {
  try {
    await db.runTransaction(async tx => {
      const metaSnap = await tx.get(metaDocRef);
      const meta = metaSnap.exists ? metaSnap.data() : null;
      if(meta && meta.active) throw new Error('Active cypher already running');
      const newId = 'c_' + Date.now();
      const now = Date.now();
      const end = now + CYCLE_DURATION_MS;
      tx.set(metaDocRef, { id: newId, startAt: now, endAt: end, active: true, finalized: false });
      tx.set(cyclesRef.doc(newId), { id: newId, startAt: now, endAt: end, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    });
    alert('Cypher started');
  } catch(err){
    if(err.message.includes('Active cypher')) alert('A cypher is already active');
    else { console.error(err); alert('Could not start cypher'); }
  }
});

// --------------- LISTENERS ---------------

function attachMetaListener(){
  metaDocRef.onSnapshot(snap => {
    const data = snap.exists ? snap.data() : null;
    currentCycle = data;
    if(!data || !data.active){
      cycleInfo.textContent = 'No active cypher';
      startCycleBtn.disabled = false;
      // clear listeners for votes
      userVotes = {};
      totals = {};
      renderRappers();
      renderLeaderboard();
      return;
    }
    startCycleBtn.disabled = true;
    // attach votes listener for this cycle
    attachVotesListener(data.id);
    updateCycleCountdown(data.endAt);
  });
}

let votesUnsub = null;
function attachVotesListener(cycleId){
  if(votesUnsub) votesUnsub(); // detach previous
  const votesCollection = cyclesRef.doc(cycleId).collection('votes');
  votesUnsub = votesCollection.onSnapshot(snap => {
    // recompute totals from votes snapshot
    totals = {};
    snap.forEach(doc => {
      const v = doc.data();
      if(!v || !v.rapperId) return;
      totals[v.rapperId] = (totals[v.rapperId] || 0) + (v.score || 0);
    });
    // read user votes for current uid quickly from snapshot
    userVotes = {};
    snap.forEach(doc => {
      const v = doc.data();
      if(v.uid === currentUid) userVotes[v.rapperId] = v.score;
    });
    renderRappers();
    renderLeaderboard();
  });
}

// listen rappers list
function attachRappersListener(){
  rappersRef.onSnapshot(snap => {
    // build local rappersData map
    const map = {};
    snap.forEach(doc => map[doc.id] = doc.data());
    window._rappersData = map;
    renderRappers();
    renderLeaderboard();
  });
}

// show latest history winner
function attachHistoryListener(){
  historyRef.orderBy('ts','desc').limit(1).onSnapshot(snap => {
    if(snap.empty){ prevWinnerBox.classList.add('hidden'); return; }
    const last = snap.docs[0].data();
    prevWinnerName.textContent = `${last.stageName} (${last.total})`;
    prevWinnerDate.textContent = `— ${new Date(last.ts).toLocaleString()}`;
    prevWinnerBox.classList.remove('hidden');
  });
}

// --------------- RENDER UI ---------------

function renderRappers(){
  const map = window._rappersData || {};
  // create array sorted by totals desc
  const arr = Object.keys(map).map(id => {
    return { id, stageName: map[id].stageName || 'Unnamed', total: totals[id] || 0 };
  }).sort((a,b)=> (b.total - a.total) || a.stageName.localeCompare(b.stageName));

  rapperListDiv.innerHTML = '';
  arr.forEach(r => {
    const box = document.createElement('div');
    box.className = 'rapper-box';

    const meta = document.createElement('div'); meta.className = 'rapper-meta';
    const title = document.createElement('div'); title.className = 'stage-name'; title.textContent = r.stageName;
    const sc = document.createElement('div'); sc.className = 'score'; sc.textContent = `Score: ${r.total}`;
    meta.appendChild(title); meta.appendChild(sc);

    const controls = document.createElement('div'); controls.className = 'vote-controls';
    // create 1..10 buttons
    for(let i=1;i<=10;i++){
      const b = document.createElement('button');
      b.className = 'vote-btn';
      b.textContent = i;
      b.dataset.rid = r.id;
      b.dataset.score = i;
      // disable if no active cycle
      if(!currentCycle || !currentCycle.active){ b.disabled = true; }
      else {
        // if user has already voted for this rapper in this cycle
        if(userVotes && userVotes[r.id] !== undefined){
          b.disabled = true;
          if(Number(userVotes[r.id]) === i) b.classList.add('voted');
        } else {
          b.addEventListener('click', ()=> handleVote(r.id, i, b, controls));
        }
      }
      controls.appendChild(b);
    }

    box.appendChild(meta);
    box.appendChild(controls);
    rapperListDiv.appendChild(box);
  });
}

function renderLeaderboard(){
  leaderboardList.innerHTML = '';
  const map = window._rappersData || {};
  const arr = Object.keys(map).map(id => ({ id, stageName: map[id].stageName || 'Unnamed', total: totals[id] || 0 }))
                  .sort((a,b)=> b.total - a.total);
  arr.forEach(r => {
    const li = document.createElement('li');
    li.textContent = `${r.stageName} — ${r.total}`;
    leaderboardList.appendChild(li);
  });
}

// --------------- VOTING ---------------
async function handleVote(rapperId, score, buttonEl, controlsEl){
  if(!currentCycle || !currentCycle.id || !currentUid) return alert('Wait — cycle/auth initializing');
  const cycleId = currentCycle.id;
  // quick client check
  if(userVotes && userVotes[rapperId] !== undefined) return alert('You already voted this rapper this cycle');

  try {
    const voteDocId = `${currentUid}_${rapperId}`;
    const voteRef = cyclesRef.doc(cycleId).collection('votes').doc(voteDocId);
    // write vote
    await voteRef.set({
      uid: currentUid,
      rapperId,
      score,
      ts: firebase.firestore.FieldValue.serverTimestamp()
    });
    // UI immediate feedback — disable buttons and mark voted
    Array.from(controlsEl.querySelectorAll('.vote-btn')).forEach(b=> { b.disabled = true; b.classList.remove('voted'); });
    buttonEl.classList.add('voted');
    // totals will update when snapshot triggers
  } catch(err){
    console.error(err);
    alert('Vote failed');
  }
}

// --------------- Cycle countdown & finalize ---------------
let countdownTimer = null;
function updateCycleCountdown(endAt){
  if(countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(()=> {
    const now = Date.now();
    const diff = endAt - now;
    if(diff <= 0){ clearInterval(countdownTimer); cycleInfo.textContent = 'Finalizing...'; finalizeCycle(); return; }
    const hrs = Math.floor(diff / (3600*1000));
    const mins = Math.floor((diff % (3600*1000)) / (60*1000));
    const secs = Math.floor((diff % (60*1000)) / 1000);
    cycleInfo.textContent = `Cypher live — time left: ${hrs}h ${mins}m ${secs}s`;
  }, 1000);
}

async function finalizeCycle(){
  try {
    // run transaction-ish: compute winner, push to history, deactivate current meta
    const metaSnap = await metaDocRef.get();
    if(!metaSnap.exists) return;
    const meta = metaSnap.data();
    const cycleId = meta.id;
    // read votes
    const votesSnap = await cyclesRef.doc(cycleId).collection('votes').get();
    const tally = {}; // { rapperId: total }
    votesSnap.forEach(d => {
      const v = d.data();
      tally[v.rapperId] = (tally[v.rapperId] || 0) + (v.score || 0);
    });
    // determine winner
    let winnerId = null, winnerTotal = -1;
    for(const rid in tally){
      if(tally[rid] > winnerTotal){ winnerTotal = tally[rid]; winnerId = rid; }
    }
    let stageName = null;
    if(winnerId){
      const rSnap = await rappersRef.doc(winnerId).get();
      stageName = rSnap.exists ? rSnap.data().stageName : 'Unknown';
    }
    // push to history
    await historyRef.add({ cycleId, winnerId: winnerId || null, stageName: stageName || null, total: winnerTotal || 0, ts: Date.now() });
    // mark meta inactive
    await metaDocRef.update({ active:false, finalized:true });
    // create new cycle automatically (optional): start immediate next cycle
    const newId = 'c_' + Date.now();
    await metaDocRef.set({ id:newId, startAt:Date.now(), endAt: Date.now() + CYCLE_DURATION_MS, active:true, finalized:false });
    await cyclesRef.doc(newId).set({ id:newId, startAt:Date.now(), endAt: Date.now() + CYCLE_DURATION_MS, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    // done
  } catch(err){
    console.error('Finalize error', err);
  }
}
