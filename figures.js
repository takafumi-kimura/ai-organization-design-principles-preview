'use strict';
const figureNotes = {
  "1": [
    "THE FEEDBACK LOOP",
    "小さく作り、すぐに評価する。"
  ]
};
const selfSimilarityLevels = [
  {
    "title": "ソフトウェア",
    "generated": "要求に沿う小さなコード変更",
    "evaluated": "要求への適合と、既存機能への影響",
    "observed": "変更した版をテストし、統合後の結果を追う。",
    "contract": "成果物と評価条件を、変更の版に結び付ける。"
  },
  {
    "title": "評価システム",
    "generated": "評価観点や入力契約の変更案",
    "evaluated": "見逃し・誤検知・実行費用の変化",
    "observed": "固定した評価セットで比較し、採用後の実績を追う。",
    "contract": "成果物は評価の定義。判断の妥当性を確かめる条件を置く。"
  },
  {
    "title": "マネジメント",
    "generated": "モデル配置や仕事の分割の変更案",
    "evaluated": "品質を保ったうえでの再試行・費用・待ち時間の改善",
    "observed": "限定した試行と観測期間で効果を確かめる。",
    "contract": "成果物はAI組織への介入案。変更する権限と評価条件を外側で固定する。"
  }
];
const scenarioCopy = {
  "pass": [
    "テストとすべての必須評価を通過した変更が、次の工程へ進みます。",
    "PASS → 次の工程への経路を表示中"
  ],
  "fail": [
    "例：保存に失敗しても何も表示されない。実装AIがエラー表示を追加し、修正版で保存失敗時の振る舞いを再評価します。",
    "指摘を返し、修正して、同じ基準で再評価する流れを表示中"
  ],
  "input": [
    "証拠や要件が足りなければ人間へ補完を依頼し、入力を検証してから再開します。",
    "NEEDS_INPUT → 入力補完を待つ経路を表示中"
  ],
  "escalate": [
    "修正上限に達したら、検証済みの次のモデル構成へ切り替えます。すべての構成で上限に達したら停止し、人間のEMへ送ります。",
    "修正上限 → 次のモデル構成 → 上限で人間のEMへ"
  ]
};
const scenarioSteps = {
  "pass": [
    [
      "implement",
      "01 / 実装AIが小さな変更を作成"
    ],
    [
      "evaluate",
      "02 / テストと全必須評価を確認：ゲートPASS"
    ],
    [
      "output",
      "03 / 品質基準を通過し、次の工程へ"
    ]
  ],
  "fail": [
    [
      "implement",
      "01 / 実装AIが保存機能を作成"
    ],
    [
      "evaluate",
      "02 / 評価AIが「保存失敗時にエラー表示がない」と証拠付きで指摘：FAIL"
    ],
    [
      "feedback",
      "03 / ワークフローが評価結果を検証し、指摘と根拠を実装AIへ渡す"
    ],
    [
      "implement",
      "04 / 実装AIがエラー表示を追加"
    ],
    [
      "evaluate",
      "05 / ワークフローが修正版を同じ評価ゲートへ戻す。テストと全必須評価を通過：PASS"
    ],
    [
      "output",
      "06 / コードが次の工程へ進める"
    ]
  ],
  "input": [
    [
      "implement",
      "01 / 実装AIが変更を作成"
    ],
    [
      "evaluate",
      "02 / 評価に必要な証拠が不足：NEEDS_INPUT"
    ],
    [
      "escalate",
      "03 / 人間へ補完を依頼。入力を検証するまで待機"
    ]
  ],
  "escalate": [
    [
      "implement",
      "01 / 修正してもFAILが続き、この構成の上限へ"
    ],
    [
      "escalate",
      "02 / ハーネスが検証済みの次の構成へ切り替え"
    ],
    [
      "implement",
      "03 / 同じ評価基準で修正と再評価を続ける"
    ],
    [
      "escalate",
      "04 / すべての構成の上限に達したら停止し、人間のEMへ"
    ]
  ]
};
let scenario = 'fail'; let demoStep = -1;
function figureFrame(number, body, caption, className='') {
  const note=figureNotes[number];
  return `<figure class="book-figure ${className}"><header class="figure-header"><span>FIG. ${String(number>=4?number+1:number).padStart(2,'0')}</span><span>${note[0]}</span></header><h2>${note[1]}</h2>${body}<figcaption>${caption}</figcaption></figure>`;
}
function pipelineFigure(number) {
  return figureFrame(number,`
    <div class="figure-controls" role="group" aria-label="処理分岐のシナリオ">
      <button data-scenario="pass" aria-pressed="false">PASS <span>次へ進む</span></button>
      <button data-scenario="fail" aria-pressed="true">FAIL <span>修正する</span></button>
      <button data-scenario="input" aria-pressed="false">NEEDS_INPUT <span>入力を補う</span></button>
      <button data-scenario="escalate" aria-pressed="false">ESCALATE <span>構成を切り替える</span></button>
    </div>
    <div class="pipeline" data-route="fail">
      <div class="pipe-main">
        <div class="pipe-node" data-node="implement"><span class="node-icon">&lt;/&gt;</span><strong>実装AI</strong><small>IMPLEMENT</small></div>
        <div class="pipe-connector"><i></i><span>変更</span></div>
        <div class="pipe-node" data-node="evaluate"><span class="node-icon">✓</span><strong>評価ゲート</strong><small>TEST + EVALUATE</small></div>
        <div class="pipe-connector output-connector"><i></i><span>PASS</span></div>
        <div class="pipe-node" data-node="output"><span class="node-icon">↗</span><strong>次の工程</strong><small>NEXT STAGE</small></div>
      </div>
      <div class="pipe-return" aria-hidden="true"><span class="return-head"></span><span class="return-particle"></span></div>
      <section class="pipe-feedback" aria-label="FAIL時の差し戻し">
        <h3><span>FAIL</span> 指摘を返して、修正する</h3>
        <ol class="feedback-steps">
          <li><b>評価AI</b><span>不合格の理由と、その根拠を返す。</span></li>
          <li data-node="feedback"><b>ワークフロー</b><span>結果を検証し、指摘を実装AIへ渡す。</span></li>
          <li><b>実装AI</b><span>指摘をもとに、修正版を生成する。</span></li>
        </ol>
        <p class="feedback-recheck">修正版はワークフローが同じ評価ゲートへ戻し、テストとすべての必須評価をやり直す。</p>
      </section>
      <div class="pipe-escalation"><span>修正上限</span><span class="mini-connector">→</span><b>次のモデル構成</b><span class="mini-connector">→</span><b>人間のEM</b></div>
    </div>
    <div class="simulation-trace"><div><span class="trace-label">SCENARIO / 動作例</span><p id="scenario-description">${scenarioCopy.fail[0]}</p></div><button class="replay-button" id="replay-button" aria-label="選択したシナリオを再生">↻ <span>再生する</span></button></div>
    <div class="simulation-status" id="simulation-status" role="status" aria-live="polite">${scenarioCopy.fail[1]}</div>
  `,'評価ゲートでは、テストとすべての必須評価をコードが確認します。AIが生成と評価を担い、遷移・差し戻し・構成の切り替えはハーネスが制御します。','dark-figure pipeline-figure');
}
function selfSimilarityDetail(level) {
  const item=selfSimilarityLevels[level];
  return `<p class="similarity-contract">${escapeHTML(item.contract)}</p><dl><div><dt>生成するもの</dt><dd>${escapeHTML(item.generated)}</dd></div><div><dt>評価すること</dt><dd>${escapeHTML(item.evaluated)}</dd></div><div><dt>結果の観測</dt><dd>${escapeHTML(item.observed)}</dd></div></dl>`;
}
function selfSimilarityFigure(level=0, label='P1') {
  return `<figure class="book-figure dark-figure similarity-figure"><header class="figure-header"><span>FIG. ${label}</span><span>SELF-SIMILARITY</span></header><h2>対象が変わっても、循環の形を保つ。</h2><p class="similarity-intro">各層を選ぶと、生成・評価する対象の違いを確認できます。</p><div class="similarity-levels" role="group" aria-label="自己相似な構造を持つ三つの層">${selfSimilarityLevels.map((item,index)=>`<button class="similarity-level" data-similarity-level="${index}" aria-pressed="${index===level}" aria-controls="similarity-detail"><span class="similarity-name"><small>0${index+1}</small><b>${escapeHTML(item.title)}</b></span><span class="similarity-cycle"><span class="similarity-ai">生成<small>AI</small></span><span class="similarity-arrow" aria-hidden="true">→</span><span class="similarity-ai">評価<small>AI</small></span><span class="similarity-arrow" aria-hidden="true">→</span><span class="similarity-control">適用・観測<small>CODE</small></span></span><span class="similarity-return">↶ 結果を、次の改善へ</span></button>`).join('')}</div><div class="similarity-detail" id="similarity-detail" aria-live="polite" aria-atomic="true">${selfSimilarityDetail(level)}</div><figcaption>本書における自己相似性の応用です。各層の外側のハーネスが契約・通過条件を検証し、採用・停止・記録を制御します。循環の形を保ちながら、評価条件と観測期間を対象に合わせて変えます。</figcaption></figure>`;
}
function bindSelfSimilarity() {
  document.querySelectorAll('[data-similarity-level]').forEach(button=>button.addEventListener('click',()=>{
    const level=Number(button.dataset.similarityLevel);
    if(!selfSimilarityLevels[level])return;
    document.querySelectorAll('[data-similarity-level]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    document.getElementById('similarity-detail').innerHTML=selfSimilarityDetail(level);
  }));
}
function setScenario(value) {
  clearTimeout(currentDemoTimer);scenario=value;demoStep=-1;
  document.querySelector('.pipeline').dataset.route=value;
  const feedback=document.querySelector('.pipe-feedback');
  if(feedback)feedback.hidden=value!=='fail';
  document.querySelectorAll('[data-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scenario===value)));
  document.querySelectorAll('[data-node]').forEach(n=>n.classList.remove('running'));
  const escalation=document.querySelector('.pipe-escalation');
  escalation?.classList.remove('running');
  if(escalation)escalation.innerHTML=value==='input'?'<span>NEEDS_INPUT</span><span class="mini-connector">→</span><b>人間のEM</b><span class="mini-connector">→</span><b>入力補完</b>':'<span>修正上限</span><span class="mini-connector">→</span><b>次のモデル構成</b><span class="mini-connector">→</span><b>人間のEM</b>';
  document.getElementById('scenario-description').textContent=scenarioCopy[value][0];
  document.getElementById('simulation-status').textContent=scenarioCopy[value][1];
  document.getElementById('replay-button').innerHTML='↻ <span>再生する</span>';
}
function advanceDemo() {
  const steps=scenarioSteps[scenario];
  demoStep++;
  if(demoStep>=steps.length){document.getElementById('replay-button').innerHTML='↻ <span>もう一度</span>';demoStep=-1;return;}
  const [node,message]=steps[demoStep];
  if(node==='output')document.querySelector('.pipeline').dataset.route='pass';
  document.querySelectorAll('[data-node]').forEach(n=>n.classList.toggle('running',n.dataset.node===node));
  document.querySelector('.pipe-escalation').classList.toggle('running',node==='escalate');
  document.getElementById('simulation-status').textContent=message;
  if(!motionOff)currentDemoTimer=setTimeout(advanceDemo,1600);
}
function bindPipeline() {
  document.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click',()=>setScenario(b.dataset.scenario)));
  if(document.getElementById('replay-button')){scenario='fail';demoStep=-1;document.getElementById('replay-button').addEventListener('click',()=>{clearTimeout(currentDemoTimer);if(demoStep<0||!motionOff){demoStep=-1;document.querySelector('.pipeline').dataset.route=scenario;}document.getElementById('replay-button').innerHTML=motionOff?'→ <span>次のステップ</span>':'↻ <span>最初から</span>';advanceDemo();});}
}
function chapterFigure(number) { return number === 0 ? selfSimilarityFigure() : number === 1 ? pipelineFigure(1) : ""; }
function bindFigures() { bindSelfSimilarity(); bindPipeline(); }