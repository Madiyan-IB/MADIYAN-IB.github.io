/* Three portfolio interactive demos. No external requests, models or credentials.
   All synthetic data and toy calculations are disclosed in the page UI. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

  // Progressive enhancement: all seven cards are available without JavaScript.
  const filters = [...document.querySelectorAll('[data-project-filter]')];
  const cards = [...document.querySelectorAll('[data-project-group]')];
  filters.forEach(button => button.addEventListener('click', () => {
    const group = button.dataset.projectFilter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    cards.forEach(card => {
      card.hidden = group !== 'all' && card.dataset.projectGroup !== group;
      if (!card.hidden) count += 1;
    });
    const description = group === 'all' ? 'all 7 projects' : `${count} ${group === 'vision' ? 'computer vision' : group === 'systems' ? 'AI systems' : 'software and data'} projects`;
    if ($('project-count')) $('project-count').textContent = `Showing ${description}`;
  }));

  // TrafficFlow demo: toy association over synthetic vehicle observations, not a trained tracker.
  if ($('mot-baseline')) {
    const canvases = [$('mot-baseline'), $('mot-improved')];
    const contexts = canvases.map(canvas => canvas.getContext('2d'));
    if (!contexts.every(Boolean)) return;
    let frame = 45, playing = false, lastTick = 0, request = null;
    let scenario = 'crossing';
    const total = 120;
    const objectColors = ['#a7b5ff', '#64d5b4', '#f3bb77'];

    // Ground-truth IDs are used for drawing/evaluation only, never the matching cost.
    function observations(f) {
      const items = [
        {truth: 0, x: 90 + 4.3*f, y: 166 + Math.sin(f/9)*2, feature: 0.1 + Math.sin(f)*0.018},
        {truth: 1, x: 610 - 4.3*f, y: 166 + Math.cos(f/8)*2, feature: 0.9 + Math.cos(f)*0.018},
        {truth: 2, x: 120 + 3.7*f, y: 284 + Math.sin(f/15)*12, feature: 0.5 + Math.sin(f/3)*0.018}
      ];
      return items.filter(item => !(scenario === 'occlusion' && item.truth === 0 && f >= 54 && f <= 62));
    }
    function simulate(useAppearance) {
      let tracks = [], nextId = 1, switches = 0;
      const priorTruthAssignment = new Map(), history = [];
      for (let f = 0; f <= total; f += 1) {
        const detections = observations(f);
        // Baseline forgets a missed object; the extension keeps a short track buffer.
        tracks = tracks.filter(t => f - t.last <= (useAppearance ? 14 : 1));
        const candidates = [];
        tracks.forEach(track => detections.forEach((det, di) => {
          const elapsed = f - track.last;
          const px = track.x + (useAppearance ? track.vx*elapsed : 0);
          const py = track.y + (useAppearance ? track.vy*elapsed : 0);
          const spatial = Math.hypot(px-det.x, py-det.y);
          const cost = spatial + (useAppearance ? 150*Math.abs(track.feature-det.feature) : 0);
          if (spatial < (useAppearance ? 80 : 48) && cost < 90) candidates.push({track, det, di, cost});
        }));
        candidates.sort((a,b) => a.cost-b.cost || a.track.id-b.track.id || a.di-b.di);
        const usedTracks = new Set(), usedDetections = new Set(), assignments = [];
        for (const pair of candidates) {
          if (usedTracks.has(pair.track.id) || usedDetections.has(pair.di)) continue;
          usedTracks.add(pair.track.id); usedDetections.add(pair.di);
          assignments.push({track:pair.track, det:pair.det});
        }
        detections.forEach((det, di) => {
          if (usedDetections.has(di)) return;
          const track = {id:nextId++, x:det.x, y:det.y, vx:0, vy:0, feature:det.feature, last:f, trail:[]};
          tracks.push(track); assignments.push({track, det});
        });
        const snapshot = [];
        for (const {track,det} of assignments) {
          const dt = f-track.last;
          if (dt > 0) { track.vx=(det.x-track.x)/dt; track.vy=(det.y-track.y)/dt; }
          track.x=det.x; track.y=det.y; track.feature=det.feature; track.last=f;
          track.trail.push([det.x,det.y]); track.trail=track.trail.slice(-22);
          const previous = priorTruthAssignment.get(det.truth);
          if (previous !== undefined && previous !== track.id) switches += 1;
          priorTruthAssignment.set(det.truth, track.id);
          snapshot.push({x:det.x,y:det.y,id:track.id,truth:det.truth,trail:track.trail.map(point=>[...point])});
        }
        history.push({items:snapshot,switches});
      }
      return history;
    }
    let histories = [simulate(false),simulate(true)];
    function draw(ctx, state) {
      ctx.clearRect(0,0,700,360);
      ctx.fillStyle='#101b2d';ctx.fillRect(0,0,700,360);
      ctx.strokeStyle='#233247';ctx.lineWidth=1;
      for(let x=0;x<=700;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,360);ctx.stroke();}
      for(let y=10;y<=360;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(700,y);ctx.stroke();}
      ctx.fillStyle='#b7c6dd';ctx.font='12px monospace';ctx.fillText('SYNTHETIC CCTV  ·  VEHICLE FLOW',19,27);
      ctx.textAlign='right';ctx.fillStyle='#8395ad';ctx.fillText(`FRAME ${String(frame).padStart(3,'0')}`,680,27);ctx.textAlign='left';
      ctx.strokeStyle='#54d5b488';ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(350,33);ctx.lineTo(350,331);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#72d8bd';ctx.font='10px monospace';ctx.fillText('COUNTING LINE',357,45);
      if (scenario==='occlusion') {
        ctx.fillStyle='#4a587044';ctx.fillRect(300,91,80,119);
        ctx.strokeStyle='#77879e';ctx.setLineDash([5,5]);ctx.strokeRect(300,91,80,119);ctx.setLineDash([]);
        ctx.font='10px monospace';ctx.fillStyle='#aebcd0';ctx.fillText('MISSING DETECTIONS',285,80);
      }
      for (const item of state.items) {
        const hue = (item.id*73+165)%360;
        if ($('mot-trails').checked && item.trail.length>1) {
          ctx.strokeStyle=`hsl(${hue} 70% 70% / 0.5)`;ctx.lineWidth=2;ctx.beginPath();
          item.trail.forEach(([x,y],index)=>index===0?ctx.moveTo(x,y):ctx.lineTo(x,y));ctx.stroke();
        }
        ctx.fillStyle=objectColors[item.truth];
        ctx.fillRect(item.x-23,item.y-11,46,25); // vehicle body
        ctx.fillStyle='#d4eeff';ctx.fillRect(item.x-12,item.y-6,17,12); // windscreen
        ctx.fillStyle='#0b1522';ctx.fillRect(item.x-17,item.y-17,11,5);ctx.fillRect(item.x+7,item.y-17,11,5); // wheels
        ctx.strokeStyle=`hsl(${hue} 75% 74%)`;ctx.lineWidth=2;ctx.strokeRect(item.x-26,item.y-20,52,39);
        ctx.fillStyle='#091322e6';ctx.fillRect(item.x-25,item.y-49,70,18);
        ctx.fillStyle=`hsl(${hue} 75% 80%)`;ctx.font='11px monospace';ctx.fillText(`ID ${String(item.id).padStart(2,'0')}`,item.x-19,item.y-36);
      }
      ctx.fillStyle='#91a4bf';ctx.font='10px monospace';ctx.fillText('Vehicle colors: scripted tracks   ·   labels: assigned tracking IDs',19,342);
    }
    function render() {
      histories.forEach((history,index)=>draw(contexts[index],history[frame]));
      $('mot-base-switches').textContent=histories[0][frame].switches;
      $('mot-good-switches').textContent=histories[1][frame].switches;
      $('mot-base-visible').textContent=histories[0][frame].items.length;
      $('mot-good-visible').textContent=histories[1][frame].items.length;
      // Counts below come from scripted ground-truth paths, not a learned tracker.
      const right = (90+4.3*frame >= 350 ? 1 : 0)+(120+3.7*frame>=350 ? 1 : 0);
      const left = 610-4.3*frame <=350 ? 1 : 0;
      if($('traffic-east'))$('traffic-east').textContent=right;
      if($('traffic-west'))$('traffic-west').textContent=left;
      $('mot-range').value=frame;
      $('mot-frame').textContent=`${String(frame).padStart(3,'0')} / 120`;
    }
    function stop() {
      playing=false; if(request!==null) cancelAnimationFrame(request);request=null;
      $('mot-play').textContent='Play sequence';$('mot-play').setAttribute('aria-pressed','false');
    }
    function tick(now) {
      if(!playing)return;
      if(now-lastTick>=70){frame+=1;lastTick=now;render();if(frame>=total){stop();return;}}
      request=requestAnimationFrame(tick);
    }
    $('mot-play').addEventListener('click',()=>{
      if(playing){stop();return;}if(frame>=total)frame=0;
      playing=true;lastTick=performance.now();$('mot-play').textContent='Pause';$('mot-play').setAttribute('aria-pressed','true');request=requestAnimationFrame(tick);
    });
    $('mot-range').addEventListener('input',()=>{stop();frame=clamp(Number($('mot-range').value),0,total);render();});
    $('mot-reset').addEventListener('click',()=>{stop();frame=0;render();});
    $('mot-trails').addEventListener('change',render);
    $('mot-scenario').addEventListener('change',()=>{
      stop();scenario=$('mot-scenario').value;histories=[simulate(false),simulate(true)];frame=45;render();
      $('mot-explanation').textContent=scenario==='occlusion'
        ? 'One scripted vehicle disappears in frames 54–62. Observe the toy tracker IDs and scripted directional crossings; all counts are illustrative.'
        : 'Traffic vehicles cross the virtual line near frame 61. Compare tracking continuity as vehicles move in opposite directions.';
    });
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    render();
  }

  // CropGuard: leaf disease API contract mock with local validation; never a real diagnosis.
  if ($('api-body')) {
    const base={model_version:'cropguard-demo-v1',image_id:'sample-tomato-001',confidence:0.5};
    const examples=[
      {label:'tomato_early_blight',score:0.94,bbox:[68,92,131,265]},
      {label:'tomato_leaf_spot',score:0.78,bbox:[270,84,328,261]},
      {label:'leaf_discoloration',score:0.42,bbox:[377,172,530,296]}
    ];
    let requestId=0;
    function preset() {
      const name=$('api-preset').value;
      const body={...base};
      if(name==='strict')body.confidence=0.9;
      if(name==='invalid')body.confidence=1.4;
      if(name==='model')body.model_version='unknown-model';
      $('api-body').value=name==='malformed'?'{ "confidence": 0.5, ':JSON.stringify(body,null,2);
    }
    function output(code,payload,steps) {
      const labels={200:'OK',400:'Bad request',404:'Not found',422:'Validation error'};
      $('api-status').textContent=`${code} ${labels[code]} · simulated`;
      $('api-status').dataset.kind=code===200?'success':'error';
      $('api-result').textContent=JSON.stringify({simulation:true,request_id:`local-demo-${String(++requestId).padStart(3,'0')}`,...payload},null,2);
      $('api-trace').replaceChildren(...steps.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
    }
    function run() {
      let body;
      try{body=JSON.parse($('api-body').value);}catch(_){output(400,{error:'invalid_json',detail:'The request body must be valid JSON.'},['Parse JSON → rejected','No model or network request executed']);return;}
      if(!body || typeof body!=='object' || Array.isArray(body)){output(422,{error:'validation_error',detail:'The request must be a JSON object.'},['Parse JSON → passed','Validate object → rejected']);return;}
      const errors=[];
      if(typeof body.confidence!=='number' || !Number.isFinite(body.confidence) || body.confidence<0 || body.confidence>1)errors.push('confidence must be a number between 0 and 1');
      if(typeof body.model_version!=='string' || !body.model_version.trim())errors.push('model_version must be a non-empty string');
      if(typeof body.image_id!=='string' || !body.image_id.trim())errors.push('image_id must be a non-empty string');
      const unknown=Object.keys(body).filter(key=>!Object.hasOwn(base,key));
      if(unknown.length)errors.push(`unknown fields: ${unknown.join(', ')}`);
      if(errors.length){output(422,{error:'validation_error',detail:errors},['Parse JSON → passed','Validate schema → rejected','No example inference performed']);return;}
      if(body.model_version!==base.model_version){output(404,{error:'unknown_model',detail:'Only the illustrative cropguard-demo-v1 version is bundled.'},['Parse JSON → passed','Validate schema → passed','Look up example model → not found']);return;}
      if(body.image_id!==base.image_id){output(404,{error:'unknown_image',detail:'Only sample-tomato-001 is bundled in this simulator.'},['Parse JSON → passed','Validate schema → passed','Look up sample leaf → not found']);return;}
      const detections=examples.filter(item=>item.score>=body.confidence);
      output(200,{model_version:body.model_version,image_id:body.image_id,source:'fictional_leaf_detections',detections,count:detections.length},['Parse JSON → passed','Validate schema → passed','Use bundled example detections (not model inference)',`Apply confidence filter → ${detections.length} detections`,'Serialize example response → complete']);
    }
    $('api-preset').addEventListener('change',preset);
    $('api-run').addEventListener('click',run);
    $('api-reset').addEventListener('click',()=>{
      requestId=0;$('api-preset').value='valid';preset();$('api-status').textContent='Not run';delete $('api-status').dataset.kind;
      $('api-result').textContent='Choose a preset and run the local simulation.';
      const li=document.createElement('li');li.textContent='Awaiting a request';$('api-trace').replaceChildren(li);
    });
    preset();
  }

  // PROJECT 5: lexical retrieval over fictional corpus. All output uses textContent.
  if ($('rag-form')) {
    const corpus=[
      {id:'pump-1',doc:'Pump Maintenance Handbook',page:4,section:'Vibration check',text:'Unusual pump vibration may indicate worn bearings, imbalance, or loose foundations. Record vibration readings at the same operating load and compare them with the equipment baseline before scheduling inspection.'},
      {id:'pump-2',doc:'Pump Maintenance Handbook',page:7,section:'Isolation procedure',text:'Before opening the sample pump assembly, stop the motor, isolate electrical energy, release stored pressure, and verify the system is safe. Follow the site-specific lockout procedure and manufacturer instructions.'},
      {id:'sensor-1',doc:'Sensor Commissioning Guide',page:2,section:'Calibration',text:'Calibrate a pressure sensor against a known reference at multiple measurement points. Record the reference, measured value, temperature, and any zero offset. Document calibration drift and repeat failed checks.'},
      {id:'sensor-2',doc:'Sensor Commissioning Guide',page:5,section:'Signal troubleshooting',text:'For missing telemetry, inspect power, cabling, communication configuration, and time synchronization. Compare the local sensor display with the transmitted measurement before replacing equipment.'},
      {id:'field-1',doc:'Field Inspection Checklist',page:1,section:'Site observations',text:'During a routine site inspection, record the asset ID, location, date, conditions, photos, vibration or leakage observations, and any corrective action. Escalate hazards through the responsible engineer.'},
      {id:'field-2',doc:'Field Inspection Checklist',page:3,section:'Review and evidence',text:'Each reported issue should link to dated field evidence and the referenced maintenance procedure. Unresolved issues need a follow-up owner and next inspection date. Do not infer instructions that are absent from the manual.'}
    ];
    const stopWords=new Set('a an and are as at be by can could did do does for from had has have how i in is it me of on or our should that the their there these this to was were what when where which who why will with would you your'.split(' '));
    function tokens(text){return new Set((text.toLowerCase().match(/[a-z0-9]+/g)||[]).filter(word=>!stopWords.has(word)));}
    const library=$('rag-documents');
    [...new Set(corpus.map(item=>item.doc))].forEach(name=>{
      const card=document.createElement('div');card.className='rag-doc-card';
      const title=document.createElement('strong');title.textContent=name;
      const detail=document.createElement('small');detail.textContent='2 excerpts · Fictional sample manual';card.append(title,detail);library.append(card);
    });
    const dialog=$('rag-source-dialog');let lastSourceButton=null;
    function showSource(item,button){
      $('rag-source-title').textContent=item.doc;
      $('rag-source-meta').textContent=`Page ${item.page} · ${item.section} · ${item.id}`;
      $('rag-source-text').textContent=item.text;lastSourceButton=button;
      if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
    }
    function closeSource(){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');lastSourceButton?.focus();}
    $('rag-close-source').addEventListener('click',closeSource);
    dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeSource();}});
    function search(){
      const query=tokens($('rag-question').value.slice(0,500));
      const k=clamp(Number($('rag-k').value)||2,1,3);
      const scored=corpus.map(item=>{const content=tokens(item.text+' '+item.section);const overlap=[...query].filter(t=>content.has(t)).length;return {item,score:query.size?overlap/query.size:0};}).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.item.id.localeCompare(b.item.id)).slice(0,k);
      const answer=$('rag-answer');answer.replaceChildren();
      $('rag-match-count').textContent=scored.length?`${scored.length} EXCERPT${scored.length===1?'':'S'}`:'NO MATCH';
      if(!scored.length){
        const empty=document.createElement('div');empty.className='rag-empty';const title=document.createElement('strong');title.textContent=query.size?'No matching evidence in these notes.':'Enter a specific search question.';
        const detail=document.createElement('p');detail.textContent=query.size?'The sample manuals contain no matching evidence. No answer has been generated. Try questions about pump vibration, sensor calibration or field inspections.':'Use terms such as pump vibration, calibration, or maintenance checklist.';empty.append(title,detail);answer.append(empty);return;
      }
      scored.forEach(({item,score},index)=>{
        const article=document.createElement('article');article.className='retrieved-excerpt';
        const text=document.createElement('p');text.textContent=item.text;
        const meta=document.createElement('div');meta.className='excerpt-meta';
        const source=document.createElement('button');source.type='button';source.className='source-chip';source.textContent=`[${index+1}] ${item.doc} · p. ${item.page}`;source.setAttribute('aria-label',`Read source excerpt ${index+1}: ${item.doc}, page ${item.page}`);source.addEventListener('click',()=>showSource(item,source));
        const scoreText=document.createElement('small');scoreText.textContent=`Word overlap: ${Math.round(score*100)}%`;
        meta.append(source,scoreText);article.append(text,meta);answer.append(article);
      });
    }
    $('rag-form').addEventListener('submit',event=>{event.preventDefault();search();});
    $('rag-k').addEventListener('change',search);
    document.querySelectorAll('[data-rag-query]').forEach(button=>button.addEventListener('click',()=>{$('rag-question').value=button.dataset.ragQuery;search();}));
    search();
  }
})();
