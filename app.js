const LANGUAGES = {
  ja:{name:"日本語",flag:"🇯🇵",locale:"ja-JP",questions:[
    {text:"病院",reading:"びょういん",meaning:"hospital",category:"長音・撥音",accept:["病院","びょういん"]},
    {text:"切手を買った",reading:"きってをかった",meaning:"I bought a stamp.",category:"促音",accept:["切手を買った","きってをかった"]},
    {text:"新宿で写真を撮る",reading:"しんじゅくでしゃしんをとる",meaning:"Take a photo in Shinjuku.",category:"拗音・撥音",accept:["新宿で写真を撮る","しんじゅくでしゃしんをとる"]},
    {text:"新聞",reading:"しんぶん",meaning:"newspaper",category:"撥音の変化",accept:["新聞","しんぶん"]},
    {text:"美容院",reading:"びよういん",meaning:"hair salon",category:"長音との聞き分け",accept:["美容院","びよういん"]},
    {text:"旅行の予定",reading:"りょこうのよてい",meaning:"travel plans",category:"拗音・長音",accept:["旅行の予定","りょこうのよてい"]}]},
  en:{name:"English",flag:"🇺🇸",locale:"en-US",questions:[
    {text:"Three free trees",reading:"/θriː friː triːz/",meaning:"3本の自由な木",category:"TH / F / T",accept:["three free trees"]},
    {text:"Really rural",reading:"/ˈrɪəli ˈrʊrəl/",meaning:"本当に田舎の",category:"R / L",accept:["really rural"]},
    {text:"World wide web",reading:"/wɜːrld waɪd web/",meaning:"ワールド・ワイド・ウェブ",category:"子音連続",accept:["world wide web"]},
    {text:"She sells seashells",reading:"/ʃiː selz ˈsiːʃelz/",meaning:"彼女は貝殻を売る",category:"S / SH",accept:["she sells seashells"]},
    {text:"A cup of coffee",reading:"/ə kʌp əv ˈkɔːfi/",meaning:"一杯のコーヒー",category:"弱形・リズム",accept:["a cup of coffee","cup of coffee"]}]},
  lo:{name:"ພາສາລາວ",flag:"🇱🇦",locale:"lo-LA",questions:[
    {text:"ສະບາຍດີ",reading:"sabaidee",meaning:"こんにちは",category:"声調・母音",accept:["ສະບາຍດີ","sabaidee","sabai dee"]},
    {text:"ຂອບໃຈ",reading:"khop chai",meaning:"ありがとう",category:"有気音",accept:["ຂອບໃຈ","khop chai","khob chai"]},
    {text:"ແຊບຫຼາຍ",reading:"saep lai",meaning:"とてもおいしい",category:"声調・末子音",accept:["ແຊບຫຼາຍ","saep lai","sep lai"]},
    {text:"ເຈົ້າຊື່ຫຍັງ",reading:"chao seu nyang",meaning:"お名前は何ですか",category:"声調",accept:["ເຈົ້າຊື່ຫຍັງ","chao seu nyang"]},
    {text:"ພົບກັນໃໝ່",reading:"phop kan mai",meaning:"また会いましょう",category:"子音・声調",accept:["ພົບກັນໃໝ່","phop kan mai"]}]},
  es:{name:"Español cubano",flag:"🇨🇺",locale:"es-CU",questions:[
    {text:"¿Qué bolá?",reading:"ke bo-LA",meaning:"調子はどう？",category:"キューバ表現",accept:["qué bolá","que bola","qué bola"]},
    {text:"Vamos pa' la casa",reading:"BA-mos pa la KA-sa",meaning:"家に帰ろう",category:"音の省略",accept:["vamos pa la casa","vamos para la casa"]},
    {text:"Está buenísimo",reading:"es-TA bwe-NI-si-mo",meaning:"すごくおいしい",category:"強勢",accept:["está buenísimo","esta buenisimo"]},
    {text:"Mucho gusto",reading:"MU-cho GUS-to",meaning:"はじめまして",category:"母音・リズム",accept:["mucho gusto"]},
    {text:"Nos vemos mañana",reading:"nos BE-mos ma-NYA-na",meaning:"また明日",category:"Ñ・リズム",accept:["nos vemos mañana","nos vemos manana"]}]},
  ms:{name:"Bahasa Melayu",flag:"🇲🇾",locale:"ms-MY",questions:[
    {text:"Selamat pagi",reading:"sə-LA-mat PA-gi",meaning:"おはよう",category:"母音・リズム",accept:["selamat pagi"]},
    {text:"Terima kasih",reading:"tə-RI-ma KA-seh",meaning:"ありがとう",category:"母音",accept:["terima kasih"]},
    {text:"Sedap sekali",reading:"sə-DAP sə-KA-li",meaning:"とてもおいしい",category:"末子音",accept:["sedap sekali"]},
    {text:"Apa khabar?",reading:"A-pa KHA-bar",meaning:"お元気ですか",category:"摩擦音",accept:["apa khabar","apa kabar"]},
    {text:"Jumpa lagi",reading:"JUM-pa LA-gi",meaning:"また会いましょう",category:"子音・リズム",accept:["jumpa lagi"]}]}
};

const $=id=>document.getElementById(id); let state={},mediaRecorder,chunks=[],recognition,recognitionHasResult=false,recognitionError='',recognitionWaitTimer;
function init(){
  $("languageChoices").innerHTML=Object.entries(LANGUAGES).map(([k,v])=>`<label class="language-choice"><input type="checkbox" value="${k}" ${k==='ja'||k==='en'?'checked':''}><span>${v.flag} ${v.name}</span></label>`).join('');
  $("startButton").onclick=start; $("listenButton").onclick=speak; $("recordButton").onclick=record;
  $("nextButton").onclick=nextTurn; $("manualButton").onclick=()=>$("manualDialog").showModal();
  $("manualScore").oninput=e=>$("manualOutput").textContent=e.target.value+'点';
  $("cancelManual").onclick=()=>$("manualDialog").close(); $("saveManual").onclick=()=>{scoreRound(+$('manualScore').value,"手動採点");$("manualDialog").close()};
  $("statsButton").onclick=showStats; $("closeStats").onclick=()=>$("statsDialog").close();
  $("clearStats").onclick=()=>{if(confirm('保存した成績をすべて消去しますか？')){localStorage.removeItem('pronunciationBattleStats');showStats(true)}};
  $("rematchButton").onclick=()=>show('setupScreen'); if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
}
function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id))}
function start(){
  const langs=[...document.querySelectorAll('#languageChoices input:checked')].map(x=>x.value); if(!langs.length)return alert('言語を1つ以上選んでください。');
  const rounds=+$("roundCount").value; const pool=langs.flatMap(lang=>LANGUAGES[lang].questions.map(q=>({...q,lang}))).sort(()=>Math.random()-.5);
  const total=rounds*2,questions=[];for(let i=0;i<total;i++)questions.push(pool[i%pool.length]);
  state={players:[$("player1").value||'プレイヤー1',$("player2").value||'プレイヤー2'],scores:[0,0],questions,turn:0,history:[]};
  $("name1").textContent=state.players[0];$("name2").textContent=state.players[1];show('battleScreen');renderQuestion();
}
function renderQuestion(){
  const q=state.questions[state.turn],lang=LANGUAGES[q.lang],p=state.turn%2;
  $("turnBadge").textContent=`${state.players[p]}の番`;$("progress").textContent=`${state.turn+1} / ${state.questions.length}`;
  $("languageLabel").textContent=`${lang.flag} ${lang.name}`;$("categoryLabel").textContent=q.category;
  $("prompt").textContent=q.text;$("reading").textContent=q.reading;$("meaning").textContent=q.meaning;
  $("score1").textContent=state.scores[0];$("score2").textContent=state.scores[1];
  $("resultCard").hidden=true;$("nextButton").hidden=true;$("recordButton").disabled=false;$("recordStatus").textContent='ボタンを押して、表示された言葉を発音してください';$("playback").hidden=true;
}
function speak(){const q=state.questions[state.turn],u=new SpeechSynthesisUtterance(q.text);u.lang=LANGUAGES[q.lang].locale;u.rate=.82;speechSynthesis.cancel();speechSynthesis.speak(u)}
async function record(){
  if(mediaRecorder?.state==='recording'){
    $("recordStatus").textContent='録音を終了しました。音声を認識しています…';
    mediaRecorder.stop();
    try{recognition?.stop()}catch(e){}
    clearTimeout(recognitionWaitTimer);
    recognitionWaitTimer=setTimeout(()=>{
      if(!recognitionHasResult && $("resultCard").hidden){
        const detail=recognitionError?`（${recognitionError}）`:'';
        $("recordStatus").textContent=`自動認識の結果を取得できませんでした${detail}。もう一度試すか、下の「手動採点」を使用してください。`;
        $("recordButton").disabled=false;
      }
    },3500);
    return;
  }
  try{
    recognitionHasResult=false;recognitionError='';clearTimeout(recognitionWaitTimer);
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];mediaRecorder=new MediaRecorder(stream);
    mediaRecorder.ondataavailable=e=>chunks.push(e.data);mediaRecorder.onstop=()=>{const blob=new Blob(chunks,{type:mediaRecorder.mimeType});$("playback").src=URL.createObjectURL(blob);$("playback").hidden=false;stream.getTracks().forEach(t=>t.stop());$("recordButton").classList.remove('recording')};
    mediaRecorder.start();$("recordButton").classList.add('recording');$("recordStatus").textContent='録音中…もう一度押すと終了';startRecognition();setTimeout(()=>{if(mediaRecorder?.state==='recording'){mediaRecorder.stop();recognition?.stop()}},7000);
  }catch(e){alert('マイクを利用できません。ブラウザのマイク許可を確認してください。')}
}
function startRecognition(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$("recordStatus").textContent='このブラウザは自動認識に未対応です。録音後、手動採点してください。';return}
  const q=state.questions[state.turn];recognition=new SR();recognition.lang=LANGUAGES[q.lang].locale;recognition.interimResults=false;recognition.maxAlternatives=5;
  recognition.onresult=e=>{recognitionHasResult=true;clearTimeout(recognitionWaitTimer);const heard=Array.from(e.results[0]).map(x=>x.transcript);const score=Math.max(...heard.flatMap(h=>q.accept.map(a=>similarity(h,a))));scoreRound(Math.round(score*100),heard[0])};
  recognition.onerror=e=>{recognitionError=e.error||'認識エラー';};
  recognition.onend=()=>{
    if(!recognitionHasResult && mediaRecorder?.state!=='recording'){
      clearTimeout(recognitionWaitTimer);
      const detail=recognitionError?`（${recognitionError}）`:'';
      $("recordStatus").textContent=`自動認識の結果を取得できませんでした${detail}。もう一度試すか、下の「手動採点」を使用してください。`;
      $("recordButton").disabled=false;
    }
  };
  try{recognition.start()}catch(e){recognitionError='音声認識を開始できません';$("recordStatus").textContent='音声認識を開始できませんでした。再読み込みしてお試しください。'}
}
function normalize(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\s.,!?¿'’\-]/g,'')}
function similarity(a,b){a=normalize(a);b=normalize(b);if(a===b)return 1;const m=a.length,n=b.length,d=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return Math.max(0,1-d[m][n]/Math.max(m,n,1))}
function scoreRound(score,heard){
  if(!$("resultCard").hidden)return; const p=state.turn%2,q=state.questions[state.turn];state.scores[p]+=score;state.history.push({player:state.players[p],score,lang:q.lang,category:q.category,text:q.text});
  $("roundScore").textContent=score;$("scoreRing").style.setProperty('--score',score+'%');$("feedbackTitle").textContent=score>=90?'すばらしい！':score>=70?'いい発音！':score>=50?'あと少し！':'もう一度練習しよう';
  $("recognizedText").textContent=`認識：${heard}`;$("feedback").textContent=score<70?`練習ポイント：${q.category}`:'しっかり伝わる発音です。';$("resultCard").hidden=false;$("nextButton").hidden=false;$("recordButton").disabled=true;$("score"+(p+1)).textContent=state.scores[p];
}
function nextTurn(){state.turn++;state.turn>=state.questions.length?finish():renderQuestion()}
function finish(){
  const [a,b]=state.scores;$("winnerText").textContent=a===b?'引き分け！':`${state.players[a>b?0:1]}の勝利！`;
  $("finalScores").innerHTML=state.players.map((p,i)=>`<div><strong>${p}</strong><span>${state.scores[i]}</span>点</div>`).join('');
  const weak=state.history.filter(x=>x.score<70);$("weakSummary").innerHTML=`<h3>今回の練習ポイント</h3>${weak.length?weak.map(x=>`<p>${LANGUAGES[x.lang].flag} ${x.text} — ${x.category}（${x.score}点）</p>`).join(''):'<p>70点未満の項目はありません。見事です！</p>'}`;
  saveStats();show('finishScreen');
}
function saveStats(){const s=JSON.parse(localStorage.getItem('pronunciationBattleStats')||'{"battles":0,"attempts":0,"total":0,"weak":{}}');s.battles++;state.history.forEach(x=>{s.attempts++;s.total+=x.score;if(x.score<70){const k=`${x.lang}|${x.category}`;s.weak[k]=(s.weak[k]||0)+1}});localStorage.setItem('pronunciationBattleStats',JSON.stringify(s))}
function showStats(alreadyOpen=false){const s=JSON.parse(localStorage.getItem('pronunciationBattleStats')||'{"battles":0,"attempts":0,"total":0,"weak":{}}');const weak=Object.entries(s.weak).sort((a,b)=>b[1]-a[1]).slice(0,5);$("statsContent").innerHTML=`<div class="stat-row"><span>対戦回数</span><strong>${s.battles}回</strong></div><div class="stat-row"><span>挑戦回数</span><strong>${s.attempts}回</strong></div><div class="stat-row"><span>平均点</span><strong>${s.attempts?Math.round(s.total/s.attempts):0}点</strong></div><h3>苦手な発音</h3>${weak.length?weak.map(([k,v])=>{const [l,c]=k.split('|');return `<div class="stat-row"><span>${LANGUAGES[l].flag} ${c}</span><strong>${v}回</strong></div>`}).join(''):'<p>まだ記録がありません。</p>'}`;if(!alreadyOpen)$("statsDialog").showModal()}
init();
