'use strict';
const chapters = window.BOOK_CHAPTERS;
const parts = window.BOOK_PARTS;
const isPreview = window.BOOK_EDITION?.kind === 'preview';
const canRead = chapter => !isPreview || chapter.readable === true;
const shortTitles = chapters.map(chapter => chapter.shortTitle);
const escapeHTML = text => text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const main = document.getElementById('main');
let activeChapter = null;
let motionOff = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentDemoTimer = null;

function chapterLink(chapter, single = false) {
  const index = chapter.number === 0 ? '序' : chapter.id === "epilogue" ? '終' : chapter.id === "afterword" ? '跋' : String(chapter.number).padStart(2,'0');
  return `<a href="#${chapter.id}" class="${single?'nav-single':'chapter-link'}${canRead(chapter)?'':' preview-locked'}" data-chapter="${chapter.id}"><span class="chapter-index">${index}</span><span class="chapter-link-title">${shortTitles[chapter.number]}</span>${canRead(chapter)?'':'<span class="preview-status">未公開</span>'}</a>`;
}
document.getElementById('contents').innerHTML = `<a href="#cover" class="nav-single" data-chapter="cover"><span class="chapter-index">◇</span><span>表紙</span></a>${chapterLink(chapters[0],true)}${parts.map(p=>`<div class="part-title"><span>PART ${p.number}</span>${p.title}</div>${chapters.filter(c=>c.number>=p.from&&c.number<=p.to).map(c=>chapterLink(c)).join('')}`).join('')}<div class="part-title"><span>EPILOGUE</span>おわりに</div>${chapterLink(chapters.find(c=>c.id==="epilogue"),true)}<div class="part-title"><span>AFTERWORD</span>あとがき</div>${chapterLink(chapters.find(c=>c.id==="afterword"),true)}`;

function organizationArt() {
  return `<div class="cover-art"><div class="art-topline"><span>FIG. 00 — AI TEAM AS CODE</span><span class="art-tag">CONCEPT MODEL</span></div><svg viewBox="0 0 380 355" role="img" aria-label="一つのAIチームの基本構造。人間のEMが設計するハーネスの内側で、AIが生成と評価を担い、状態遷移、記録、評価ゲートをコードが制御する。"><g fill="none" stroke="#718b53" stroke-width="1"><path d="M190 57V103M157 196H223M284 230V264H96V230M190 283V315"/><rect x="18" y="103" width="344" height="180" rx="2" stroke="#8aaa62"/><path d="M190 134V151H96V162M190 151H284V162"/><path d="M362 126H373V330H257" stroke-dasharray="3 5" opacity=".5"/></g><g fill="none" stroke="#c7f77b" stroke-width="2"><path class="signal" d="M190 57V125H96V196H284V265H96V230"/><path class="signal delay" d="M284 230V264H190V330H256"/></g><circle class="pulse-ring" cx="190" cy="33" r="25" fill="none" stroke="#acdc6e"/><circle cx="190" cy="33" r="23" fill="#2e4029" stroke="#89a860"/><g stroke="#d6eabb" fill="none" stroke-width="1.3"><circle cx="190" cy="28" r="5"/><path d="M180 43c0-12 20-12 20 0"/></g><text x="190" y="79" text-anchor="middle" fill="#e4ecd9" font-size="11" font-family="sans-serif">Engineering Manager</text><rect x="78" y="93" width="224" height="22" fill="#1c261e"/><text x="190" y="108" text-anchor="middle" fill="#c7e7a5" font-family="monospace" font-size="12">DETERMINISTIC HARNESS</text><text x="190" y="128" text-anchor="middle" fill="#849f6a" font-family="monospace" font-size="9">WORKFLOW · POLICY · STATE</text><rect x="35" y="162" width="122" height="68" rx="2" fill="#2b3e23" stroke="#8dae65"/><rect x="223" y="162" width="122" height="68" rx="2" fill="#2b3e23" stroke="#8dae65"/><text x="96" y="184" text-anchor="middle" fill="#a9cb86" font-family="monospace" font-size="9">01 / GENERATE</text><text x="96" y="207" text-anchor="middle" fill="#f0f6e7" font-family="sans-serif" font-size="17">生成</text><text x="284" y="184" text-anchor="middle" fill="#a9cb86" font-family="monospace" font-size="9">02 / EVALUATE</text><text x="284" y="207" text-anchor="middle" fill="#f0f6e7" font-family="sans-serif" font-size="17">評価</text><text x="190" y="183" text-anchor="middle" fill="#9db784" font-size="8" font-family="sans-serif">コードが遷移</text><rect x="88" y="256" width="204" height="16" fill="#1c261e"/><text x="190" y="267" text-anchor="middle" fill="#a8bd93" font-family="monospace" font-size="9">FEEDBACK · OBSERVABILITY</text><text x="239" y="302" text-anchor="middle" fill="#91ab77" font-family="monospace" font-size="8">QUALITY GATE</text><rect x="123" y="315" width="134" height="30" rx="2" fill="#273b21" stroke="#67884e"/><text x="190" y="334" text-anchor="middle" fill="#c7f77b" font-size="10" font-family="monospace">VERIFIED OUTPUT</text></svg><div class="art-footer"><span>GENERATE + EVALUATE</span><span>CODE CONTROLS THE FLOW</span></div></div>`;
}
function renderCover() {
  const prologue = chapters.find(chapter => chapter.id === 'prologue');
  const overview = [
    {
      id: prologue.id,
      label: 'PROLOGUE / 序章',
      title: prologue.title,
      description: 'AIを使い込んだ先の課題から、目指す開発の姿と、本書を貫く生成・評価・改善の循環を見渡す。',
      chapters: [prologue],
      range: '序章を読む',
    },
    ...parts.map(part => ({
      id: chapters.find(chapter => chapter.number === part.from).id,
      label: `PART ${part.number}`,
      title: part.title,
      description: part.description,
      chapters: chapters.filter(chapter => chapter.number >= part.from && chapter.number <= part.to),
      range: `CHAPTER ${String(part.from).padStart(2, '0')}—${String(part.to).padStart(2, '0')}`,
    })),
    ...[
      { id: 'epilogue', label: 'EPILOGUE / 終章', description: '異なる業務ドメインのAIチームを結び、その集合体としてAI組織を設計する。', range: '終章を読む' },
      { id: 'afterword', label: 'AFTERWORD / あとがき', description: 'AIチームを育て、束ねる仕事にも同じ循環を適用し、人間の役割を問い直す。', range: 'あとがきを読む' },
    ].map(entry => {
      const chapter = chapters.find(chapter => chapter.id === entry.id);
      return { ...entry, title: chapter.title, chapters: [chapter] };
    }),
  ];
  return `<section class="cover"><div class="cover-eyebrow">試し読み｜序章・第1章・第2章を公開</div><div class="cover-grid"><div class="cover-copy"><h1>AIチームの<span class="title-second">設計原則</span></h1><p class="cover-subtitle">決定論的なワークフローで<br>マネジメントをコーディングする</p><p class="cover-tagline">生成と評価をAIへ。</p><p class="cover-intro">不確実性を制御し、<br>改善し続けるAIチームをつくる。</p><a href="#prologue" class="read-button">序章から読む <span class="arrow">↗</span></a><a href="#toc" class="cover-contents-link">全章の目次を見る ↗</a><div class="cover-meta"><span>4 PARTS</span><i></i><span>${parts.reduce((count,p)=>count+p.to-p.from+1,0)} CHAPTERS</span><i></i><span>TRIAL EDITION</span></div></div>${organizationArt()}</div><div class="cover-bottom"><p>AIに渡すのは、生成と評価だけ。</p><span>DETERMINISTIC HARNESS. AT EVERY AI CALL.</span></div></section><section class="part-overview" aria-label="本の構成"><div class="section-kicker">EXPLORE THE BOOK <span>本書の構成</span></div><ol class="part-cards" role="list">${overview.map(entry=>`<li><article class="part-card"><span>${entry.label}</span><div class="part-card-copy"><h2><a href="#${entry.id}">${escapeHTML(entry.title)}</a></h2><p>${escapeHTML(entry.description)}</p></div><footer><a class="part-start-link" href="#${entry.id}" aria-label="${escapeHTML(entry.title)}から読む"><span>${entry.range}</span><span aria-hidden="true">↗</span></a></footer>${entry.chapters?`<ol class="part-chapter-list" role="list">${entry.chapters.map(chapter=>`<li><a class="part-chapter-link" href="#${chapter.id}"><span class="part-chapter-number">${chapter.id==='prologue'?'序章':chapter.id==='epilogue'?'終章':chapter.id==='afterword'?'あとがき':`第${chapter.number}章`}</span><span class="part-chapter-title">${escapeHTML(chapter.title)}</span>${isPreview?`<small class="part-chapter-status ${canRead(chapter)?'is-readable':'is-unavailable'}">${canRead(chapter)?'試し読み':'本文未公開'}</small>`:''}<span class="part-chapter-arrow" aria-hidden="true">↗</span></a></li>`).join('')}</ol>`:''}</article></li>`).join('')}</ol></section>`;
}
function inline(text) {return escapeHTML(text).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>');}
const keyPassages = [
  "答えてほしい謎がある。\n人間とAI、どこに違いがあるのだろう。",
  "生成と評価をAIへ。フィードバックを結ぶ制御は、決定論的なワークフローへ。",
  "本書で設計する基本単位は、AIチームである。",
  "要件の承認後からPreview環境への反映までは、開発者のHITLを正常系に含めない。",
  "要求を伝え、提案を承認したら、次に触れるのは動くソフトウェアである。",
  "少数精鋭という目標は、最初から変わっていない。",
  "XPの原理を、AIとハーネスからなるチーム全体の振る舞いにする。",
  "AIチームの持続可能性は、指示を足せることだけでなく、根拠を持って減らせることにも支えられる。"
];
function highlightPython(code) {
  const tokens = /#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\bai\.(?:generate|evaluate)\b|\b(?:def|class|if|else|elif|for|in|not|and|or|is|return|raise|try|except|finally|with|as|from|import|lambda|continue|pass|True|False|None)\b|\b\d+(?:_\d+)*(?:\.\d+)?\b/g;
  let html='', position=0;
  for(const match of code.matchAll(tokens)) {
    html += escapeHTML(code.slice(position,match.index));
    const value=match[0];
    const kind=value.startsWith('#')?'comment':/^["']/.test(value)?'string':value.startsWith('ai.')?'ai':/^\d/.test(value)?'number':'keyword';
    html += `<span class="syntax-${kind}">${escapeHTML(value)}</span>`;
    position=match.index+value.length;
  }
  return html+escapeHTML(code.slice(position));
}
// 図は対応する説明のまとまりに置き、段落数の変化で文脈を分断しない。
const figureAnchors = {
  "0": "### この本で作りたいもの",
  "1": "### 修正の循環を、回数のあるループにする"
};
function prose(body, number) {
  const blocks=body.split(/(```[\s\S]*?```)/).flatMap((part,index)=>index%2?[part]:part.split(/\n\s*\n/)).map(block=>block.trim()).filter(Boolean);
  const insertAt = blocks.findIndex(block=>block===figureAnchors[number]);
  return blocks.map((block,index)=>{
    const figure=index===insertAt?chapterFigure(number):'';
    const codeBlock=block.match(/^```([a-z]*)\n([\s\S]*?)\n```$/);
    if(codeBlock){const python=codeBlock[1]==='python';return `${figure}<div class="prose-code${python?' python-code':''}"><span>${python?'PYTHON / 疑似コード':escapeHTML(codeBlock[1].toUpperCase()||'CODE')}${python?'<small class="code-legend">AIを呼ぶ箇所を強調</small>':''}</span><pre tabindex="0" aria-label="${python?'Python疑似コード':escapeHTML(codeBlock[1].toUpperCase()||'コード')+'の例'}"><code>${python?highlightPython(codeBlock[2]):escapeHTML(codeBlock[2])}</code></pre></div>`;}
    if(/^### /.test(block)) return `${figure}<h2>${inline(block.slice(4))}</h2>${block==='### ハーネスは指示書ではなく、インフラまで含む'?sandboxFigure():block==='### 共通の文脈を先頭へ、今回の評価観点を末尾へ'?promptCacheFigure():block==='### 変更された依存だけを、更新の起点にする'?lineageFigure():block==='### 条件を変えて、費用の差を確かめる'?modelCostFigure():block==='### AI組織は、異なる業務ドメインのAIチームを結ぶ'?teamCompositionFigure():''}`;
    if(/^\| /.test(block)){const rows=block.split('\n').filter(row=>!/^\|\s*---/.test(row)).map(row=>row.split('|').slice(1,-1).map(cell=>cell.trim()));return `${figure}<div class="prose-table-wrap" tabindex="0" role="region" aria-label="比較表。横にスクロールできます"><table><thead><tr>${rows[0].map(cell=>`<th scope="col">${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${inline(cell)}</th>`:`<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
    if (/^\* /.test(block)) return `${figure}<ul>${block.split('\n').map(l=>`<li>${inline(l.replace(/^\* /,''))}</li>`).join('')}</ul>`;
    if (/^\d+\. /.test(block)) return `${figure}<ol>${block.split('\n').map(l=>`<li>${inline(l.replace(/^\d+\. /,''))}</li>`).join('')}</ol>`;
    const className=keyPassages.includes(block)?'key-passage':block.includes(' → ')?'flow-line':block.length<28?'short-paragraph':'';
    return `${figure}<p${className?` class="${className}"`:''}>${inline(block).replace(/\n/g,'<br>')}</p>`;
  }).join('');
}
function renderChapter(chapter) {
  if (!canRead(chapter)) return renderUnavailable(chapter);
  const part = parts.find(p=>chapter.number>=p.from&&chapter.number<=p.to);
  const label = chapter.number===0?'PROLOGUE':chapter.id==="epilogue"?'EPILOGUE':chapter.id==="afterword"?'AFTERWORD':`CHAPTER ${String(chapter.number).padStart(2,'0')}`;
  const prev = chapters[chapter.number-1];
  const next = chapters[chapter.number+1];
  return `<article class="chapter-page"><header class="chapter-heading"><div class="chapter-eyebrow"><b>${label}</b><span>${part?`PART ${part.number} / ${part.title}`:chapter.number===0?'はじめに':chapter.id==='afterword'?'あとがき':'おわりに'}</span></div><h1>${escapeHTML(chapter.title)}</h1><div class="chapter-description">${part?part.english:'SOFTWARE-DEFINED ENGINEERING ORGANIZATION'} <span aria-hidden="true">&nbsp; / &nbsp;</span> 読了目安 ${chapter.minutes}分</div></header><div class="chapter-body"><div class="prose">${prose(chapter.body,chapter.sourceNumber)}</div>${isPreview&&chapter.id===window.BOOK_EDITION.lastReadableId?previewEnding():''}</div><nav class="chapter-navigation" aria-label="前後の章"><a href="#${prev?prev.id:'cover'}"><span>← ${prev?'PREVIOUS CHAPTER':'BOOK COVER'}</span><strong>${prev?shortTitles[prev.number]:'表紙に戻る'}</strong></a><a href="#${next?next.id:'cover'}"><span>${next?isPreview&&!canRead(next)?'CHAPTER PREVIEW':'NEXT CHAPTER':'BACK TO COVER'} →</span><strong>${next?shortTitles[next.number]:'AIチームの設計原則'}</strong></a></nav></article>`;
}
function previewEnding() {
  return `<section class="preview-note" aria-label="試し読みの終わり"><span class="preview-kicker">THE NEXT CHAPTER</span><h2>ここから、AIチームを動かす設計へ。</h2><p>ここまでで、AIチームを設計する理由と、その基本構造を見てきました。</p><p>ここからは、それを実行可能な仕組みにします。生成と評価を包むハーネスを設計し、仕事の入出力を定義し、評価の有効性をデータで確かめます。蓄積した記録を使い、評価観点の追加・修正・廃止まで、改善の循環へ組み込んでいきます。</p><p>そして最後には、AIチームを設計し、マネジメントする仕事そのものにも、同じ原則を適用します。</p><p class="preview-scope">試し読みはここまでです。全章の目次から、この先の構成をご覧いただけます。</p><a href="#toc" class="preview-text-link">この先の目次を見る <span aria-hidden="true">↗</span></a></section>`;
}
function renderUnavailable(chapter) {
  const label=chapter.id==='epilogue'?'終章':chapter.id==='afterword'?'あとがき':`第${chapter.number}章`;
  return `<article class="chapter-page preview-unavailable"><header class="chapter-heading"><div class="chapter-eyebrow"><b>${label}</b><span>本文は未公開</span></div><h1>${escapeHTML(chapter.title)}</h1></header><div class="chapter-body"><section class="preview-note"><span class="preview-kicker">BEYOND THE PREVIEW</span><h2>この続きは、本編で。</h2><p>この章の本文は、試し読みの公開範囲に含まれていません。現在は序章・第1章・第2章をお読みいただけます。</p>${chapter.id==='chapter-03'?'<p>第3章では、生成と評価をつなぐワークフローと、その実行を支える権限・隔離環境を具体化します。</p>':''}<div class="preview-actions"><a href="#prologue" class="read-button">試し読みを始める <span class="arrow">↗</span></a><a href="#toc" class="preview-text-link">全章の目次を見る</a></div></section></div></article>`;
}
function renderContents() {
  const rows=items=>`<ol class="preview-toc-list">${items.map(c=>`<li><a href="#${c.id}"><span class="preview-toc-number">${c.number===0?'序章':c.id==='epilogue'?'終章':c.id==='afterword'?'跋':String(c.number).padStart(2,'0')}</span><span>${escapeHTML(c.title)}</span><small class="${canRead(c)?'available':'unavailable'}">${canRead(c)?'試し読み':'本文未公開'}</small><span aria-hidden="true">↗</span></a></li>`).join('')}</ol>`;
  return `<article class="chapter-page preview-contents"><header class="chapter-heading"><div class="chapter-eyebrow"><b>CONTENTS</b><span>4部・17章 ＋ 序章・終章・あとがき</span></div><h1>本書の目次</h1><p class="chapter-description">序章・第1章・第2章を公開しています。</p></header>${rows([chapters[0]])}${parts.map(p=>`<section class="preview-toc-part"><h2><span>PART ${p.number}</span>${escapeHTML(p.title)}</h2>${rows(chapters.filter(c=>c.number>=p.from&&c.number<=p.to))}</section>`).join('')}${rows(chapters.filter(c=>['epilogue','afterword'].includes(c.id)))}</article>`;
}
function render() {
  clearTimeout(currentDemoTimer);
  const id = location.hash.slice(1)||'cover';
  if(id==='main'){main.focus({preventScroll:true});return;}
  const chapter = chapters.find(c=>c.id===id);
  const isContents = isPreview && id === 'toc';
  activeChapter = chapter||null;
  main.innerHTML = chapter?renderChapter(chapter):isContents?renderContents():renderCover();
  bindFigures();
  main.classList.remove('page-enter');
  requestAnimationFrame(()=>main.classList.add('page-enter'));
  document.getElementById('current-label').textContent = chapter?chapter.number===0?'序章':chapter.id==="epilogue"?'終章':chapter.id==="afterword"?'あとがき':`第${chapter.number}章`:isContents?'目次':'表紙';
  document.title = (chapter?`${shortTitles[chapter.number]}｜AIチームの設計原則`:isContents?'目次｜AIチームの設計原則':'AIチームの設計原則｜決定論的なワークフローでマネジメントをコーディングする')+(isPreview?'｜試し読み':'');
  document.querySelectorAll('[data-chapter]').forEach(a=>{const selected=a.dataset.chapter===(chapter?chapter.id:isContents?'toc':'cover');a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  closeMenu();
  window.scrollTo({top:0,behavior:'instant'});
  updateProgress();
}
function updateProgress() {
  const available = document.documentElement.scrollHeight-window.innerHeight;
  document.getElementById('reading-progress').style.width = activeChapter&&available>0?`${Math.min(100,window.scrollY/available*100)}%`:'0%';
}
const menuButton=document.getElementById('menu-button');
const sidebar=document.getElementById('sidebar');
const shade=document.getElementById('sidebar-shade');
function closeMenu(){sidebar.classList.remove('is-open');sidebar.inert=window.matchMedia('(max-width:900px)').matches;shade.hidden=true;menuButton.setAttribute('aria-expanded','false');document.body.style.overflow='';}
menuButton.addEventListener('click',()=>{const open=!sidebar.classList.contains('is-open');sidebar.inert=!open;sidebar.classList.toggle('is-open',open);shade.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':'';if(open)sidebar.querySelector('a.active')?.focus();});
sidebar.addEventListener('click',event=>{if(event.target.closest('a')?.getAttribute('href')===location.hash){closeMenu();main.focus({preventScroll:true});}});
shade.addEventListener('click',closeMenu);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&sidebar.classList.contains('is-open')){closeMenu();menuButton.focus();}if(event.key==='Tab'&&sidebar.classList.contains('is-open')){const links=[...sidebar.querySelectorAll('a')];if(event.shiftKey&&document.activeElement===links[0]){event.preventDefault();links.at(-1).focus();}else if(!event.shiftKey&&document.activeElement===links.at(-1)){event.preventDefault();links[0].focus();}}});
document.getElementById('type-button').addEventListener('click',event=>{const enlarged=document.body.classList.toggle('large-type');event.currentTarget.setAttribute('aria-pressed',String(enlarged));event.currentTarget.setAttribute('aria-label',enlarged?'文字を標準サイズに戻す':'文字を大きくする');});
function updateMotion(){document.documentElement.classList.toggle('motion-off',motionOff);const button=document.getElementById('motion-button');button.setAttribute('aria-pressed',String(motionOff));button.setAttribute('aria-label',motionOff?'図解の動きを再開する':'図解の動きを止める');button.querySelector('.motion-symbol').textContent=motionOff?'▷':'Ⅱ';button.querySelector('.motion-label').textContent=motionOff?'MOTION OFF':'MOTION ON';}
document.getElementById('motion-button').addEventListener('click',()=>{motionOff=!motionOff;updateMotion();if(motionOff){clearTimeout(currentDemoTimer);if(demoStep>=0&&document.getElementById('replay-button'))document.getElementById('replay-button').innerHTML='→ <span>次のステップ</span>';}else if(demoStep>=0&&document.getElementById('replay-button'))advanceDemo();});
window.addEventListener('hashchange',()=>{render();main.focus({preventScroll:true});});
window.addEventListener('scroll',updateProgress,{passive:true});
window.addEventListener('resize',()=>{updateProgress();if(!window.matchMedia('(max-width:900px)').matches)closeMenu();else if(!sidebar.classList.contains('is-open'))sidebar.inert=true;});
updateMotion();
render();
