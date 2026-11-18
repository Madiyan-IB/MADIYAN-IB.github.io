/* Browser-only concept demos. All listings, records, plates and images are fictional.
   These examples are not original project source code or real model/database outputs. */
(() => {
  'use strict';
  const demo = document.body.dataset.demo;
  const $ = (selector) => document.querySelector(selector);
  const fmt = (n) => new Intl.NumberFormat('en-US').format(n);

  // TASK NEST: a client-side two-role UI with sample listings and request preview.
  if (demo === 'task-nest') {
    const categoryIcons = { Design: '◈', Technology: '⌘', Home: '◇' };
    const listings = [
      { id: 1, title: 'Website development', provider: 'Alex Morgan (sample)', category: 'Technology', price: 120 },
      { id: 2, title: 'Brand identity design', provider: 'Taylor Park (sample)', category: 'Design', price: 85 },
      { id: 3, title: 'Home maintenance', provider: 'Jordan Lee (sample)', category: 'Home', price: 60 },
      { id: 4, title: 'UI/UX consultation', provider: 'Casey Reed (sample)', category: 'Design', price: 95 },
      { id: 5, title: 'Computer setup & support', provider: 'Robin Shah (sample)', category: 'Technology', price: 55 }
    ];
    let nextId = 6;
    let bookingListing = null;
    const customerTab = $('#market-customer-tab');
    const vendorTab = $('#market-vendor-tab');
    const customerPanel = $('#market-customer-panel');
    const vendorPanel = $('#market-vendor-panel');
    const cards = $('#market-cards');
    const filter = $('#market-filter');
    const search = $('#market-search');
    const dialog = $('#market-booking-dialog');
    const form = $('#market-booking-form');
    function switchRole(vendor) {
      customerTab.setAttribute('aria-pressed', String(!vendor));
      vendorTab.setAttribute('aria-pressed', String(vendor));
      customerPanel.hidden = vendor;
      vendorPanel.hidden = !vendor;
      if (vendor) renderVendor(); else renderListings();
    }
    customerTab.addEventListener('click', () => switchRole(false));
    vendorTab.addEventListener('click', () => switchRole(true));
    function renderListings() {
      const q = search.value.trim().toLowerCase();
      const selected = filter.value;
      const matches = listings.filter(s =>
        (selected === 'all' || s.category === selected) &&
        (!q || `${s.title} ${s.provider} ${s.category}`.toLowerCase().includes(q))
      );
      $('#market-results').textContent = `${matches.length} sample service${matches.length === 1 ? '' : 's'} found`;
      cards.replaceChildren();
      if (!matches.length) {
        const msg = document.createElement('div'); msg.className = 'empty-results';
        msg.textContent = 'No matching sample listings. Try another category or search term.';
        cards.append(msg); return;
      }
      matches.forEach(s => {
        const card = document.createElement('article'); card.className = 'market-card';
        const thumb = document.createElement('div'); thumb.className = 'market-thumb';
        const glyph = document.createElement('strong'); glyph.textContent = categoryIcons[s.category] || '✧';
        glyph.style.cssText = 'font-size:53px;color:var(--accent);font-weight:400';
        const sampleLabel = document.createElement('span'); sampleLabel.textContent = s.category;
        thumb.append(glyph, sampleLabel);
        const body = document.createElement('div'); body.className = 'market-card-body';
        const title = document.createElement('h4'); title.textContent = s.title;
        const provider = document.createElement('p'); provider.textContent = s.provider;
        const bottom = document.createElement('div'); bottom.className = 'market-card-bottom';
        const price = document.createElement('span'); price.className = 'market-price'; price.textContent = '$' + s.price + ' / example';
        const book = document.createElement('button'); book.type = 'button'; book.className = 'demo-button primary'; book.textContent = 'Request →';
        book.addEventListener('click', () => openBooking(s));
        bottom.append(price,book); body.append(title,provider,bottom);card.append(thumb,body);cards.append(card);
      });
    }
    function renderVendor() {
      $('#vendor-count').textContent = String(listings.length);
      const list = $('#market-vendor-items'); list.replaceChildren();
      listings.slice(-3).reverse().forEach(s => {
        const row = document.createElement('div'); row.className = 'market-vendor-item';
        const title = document.createElement('span'); title.textContent = s.title;
        const caption = document.createElement('small'); caption.textContent = `${s.category} · $${s.price} · Sample`;
        row.append(title,caption); list.append(row);
      });
    }
    $('#market-vendor-form').addEventListener('submit', event => {
      event.preventDefault();
      const f = event.currentTarget;
      if (!f.reportValidity()) return;
      const title = String(f.elements.title.value).trim();
      const category = f.elements.category.value;
      const price = Number(f.elements.price.value);
      if (title.length < 3 || !Number.isFinite(price) || price < 1 || price > 9999) return;
      listings.push({ id: nextId++, title, provider: 'You (demo)', category, price });
      f.reset(); renderVendor();
      const notice = $('#market-vendor-items'); notice.setAttribute('aria-label', 'Demo listing added');
    });
    search.addEventListener('input', renderListings);
    filter.addEventListener('change', renderListings);
    function openBooking(s) {
      bookingListing = s;
      $('#market-booking-service').textContent = `${s.title} · $${s.price} example price. This request is only a preview.`;
      $('#market-booking-result').hidden = true;
      $('#market-booking-confirm').disabled = false;
      form.reset();
      const date = new Date();
      const local = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      $('#market-date').min = local;
      $('#market-date').value = local;
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    }
    const closeBooking = () => { if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); };
    $('#market-booking-close').addEventListener('click', closeBooking);
    $('#market-booking-cancel').addEventListener('click', closeBooking);
    dialog.addEventListener('click', event => { if (event.target === dialog) closeBooking(); });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity() || !bookingListing) return;
      const result = $('#market-booking-result');
      result.textContent = `Demo preview ready for ${bookingListing.title} on ${$('#market-date').value}. No booking was sent or saved.`;
      result.hidden = false;
      $('#market-booking-confirm').disabled = true;
    });
    renderListings();
  }

  // Common drawing primitives for the two synthetic computer-vision demos.
  function roundRect(ctx,x,y,w,h,r,fill,stroke,lineWidth=1) {
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);
    if (fill) {ctx.fillStyle=fill;ctx.fill();}
    if (stroke) {ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}
  }
  function drawSceneGrid(ctx,w,h) {
    ctx.fillStyle='#0c1623';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#a4bed20c';ctx.lineWidth=1;
    for(let x=0;x<w;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=0;y<h;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  }
  function canvasPill(ctx,text,x,y,color='#cfdefa') {
    ctx.font='13px ui-monospace,SFMono-Regular,Consolas,monospace';
    const width=ctx.measureText(text).width+18;
    roundRect(ctx,x,y-21,width,24,4,'#09121de8','#8999b24a');
    ctx.fillStyle=color;ctx.fillText(text,x+9,y-5);
  }

  // VEHICLE TRACKING: deterministic annotated animation; no inference.
  if (demo === 'vehicle-tracking') {
    const canvas = $('#traffic-canvas');const ctx=canvas.getContext('2d');
    const slider=$('#traffic-range'); const frameOutput=$('#traffic-frame');
    const play=$('#traffic-play');const target=$('#traffic-target');
    const boxes=$('#traffic-boxes'), plates=$('#traffic-plates');
    const cars=[
      {id:17,plate:'KHU-2047',x:-80,y:125,speed:4.8,color:'#95a7f5'},
      {id:24,plate:'MNI-3812',x:340,y:217,speed:3.0,color:'#f0b478'},
      {id:31,plate:'KHI-9021',x:775,y:318,speed:-3.3,color:'#66c3a6'},
      {id:42,plate:'—',x:160,y:318,speed:-3.8,color:'#93a0ae'},
      {id:56,plate:'—',x:590,y:122,speed:4.1,color:'#bb9fce'}
    ];
    let frame=Number(slider.value); let timer=null;
    function carPosition(c) {return ((c.x+c.speed*frame+120)%1120+1120)%1120-120;}
    function drawCar(c) {
      const x=carPosition(c), y=c.y, selected=Number(target.value)===c.id;
      ctx.save();ctx.translate(x,y);
      roundRect(ctx,-3,-4,104,51,10,'#09111da0');
      roundRect(ctx,0,0,96,44,8,c.color,'#f0f4ff4d',1.5);
      roundRect(ctx,30,6,32,32,5,'#15273cc2');
      ctx.fillStyle='#d6f5ffaf';ctx.fillRect(25,4,3,36);
      ctx.fillStyle='#fff3cd';ctx.fillRect(90,5,5,8);ctx.fillRect(90,32,5,8);
      ctx.fillStyle='#ff525d';ctx.fillRect(1,5,4,7);ctx.fillRect(1,32,4,7);
      ctx.restore();
      if (boxes.checked) {
        ctx.setLineDash([6,4]);ctx.strokeStyle=selected?'#c7d2fe':'#88a2bb';ctx.lineWidth=selected?3:1.4;
        ctx.strokeRect(x-7,y-7,110,58);ctx.setLineDash([]);
        canvasPill(ctx,`ID ${c.id}${selected?' · TARGET':''}`,x-6,y-15,selected?'#cbd5ff':'#b2c1d8');
      }
      if (plates.checked && c.plate!=='—') {
        ctx.font='12px ui-monospace,monospace';ctx.fillStyle=selected?'#eff1ff':'#bac9dd';
        ctx.fillText(c.plate,x+2,y+72);
      }
    }
    function render() {
      slider.value=String(frame);
      frameOutput.textContent=`${String(frame).padStart(3,'0')} / 180`;
      $('#traffic-plate').textContent=cars.find(c=>c.id===Number(target.value))?.plate||'—';
      $('#traffic-status').textContent='Synthetic track · ID retained across frames';
      ctx.clearRect(0,0,900,480);drawSceneGrid(ctx,900,480);
      ctx.fillStyle='#283342';ctx.fillRect(0,70,900,335);
      ctx.strokeStyle='#e9d6a25a';ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(0,82);ctx.lineTo(900,82);ctx.moveTo(0,393);ctx.lineTo(900,393);ctx.stroke();
      ctx.setLineDash([29,26]);ctx.strokeStyle='#dce8f175';ctx.lineWidth=3;
      for(const y of [186,287]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(900,y);ctx.stroke();}
      ctx.setLineDash([]);
      // Subtle crosswalk adds visual context without implying genuine footage.
      ctx.fillStyle='#e0e8f014';for(let n=0;n<10;n++)ctx.fillRect(775+n*12,72,5,333);
      cars.forEach(drawCar);
      ctx.font='13px ui-monospace,monospace';ctx.fillStyle='#adbad07d';ctx.fillText('SYNTHETIC SCENE · NOT REAL FOOTAGE',25,452);
    }
    function stop(){if(timer!==null){clearInterval(timer);timer=null;}play.textContent='▶ Play';play.setAttribute('aria-pressed','false');}
    function step(){frame=(frame+1)%181;render();if(frame===180)stop();}
    play.addEventListener('click',()=>{
      if(timer!==null){stop();return;}
      if(frame===180)frame=0;
      timer=setInterval(step,85);play.textContent='Ⅱ Pause';play.setAttribute('aria-pressed','true');render();
    });
    $('#traffic-step').addEventListener('click',()=>{stop();step();});
    slider.addEventListener('input',()=>{frame=Number(slider.value);render();});
    [target,boxes,plates].forEach(el=>el.addEventListener('change',render));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    render();
  }

  // SQL: run two deterministic JavaScript lookup methods on generated toy data.
  if (demo === 'sql-optimization') {
    const regions=['West','East','North','South'];
    const customers=Array.from({length:24},(_,i)=>({id:i+1,name:`Customer ${String(i+1).padStart(2,'0')}`,region:regions[(i*7+1)%4]}));
    let optimized=false;
    const nestedButton=$('#sql-nested'),indexButton=$('#sql-join');
    const regionSelect=$('#sql-region'),rowsSelect=$('#sql-rows');
    const nestedQuery=(region)=>`-- Concept: scanning for a matching customer\nSELECT o.id, c.name, o.amount\nFROM orders AS o, customers AS c\nWHERE o.customer_id = c.id\n  AND c.region = '${region}';\n-- Actual query plans depend on the database`;
    const indexQuery=(region)=>`-- Concept: keyed customer lookup / JOIN\nCREATE INDEX idx_customers_id\n  ON customers(id);\n\nSELECT o.id, c.name, o.amount\nFROM orders AS o\nJOIN customers AS c ON c.id = o.customer_id\nWHERE c.region = '${region}';`;
    function escapeHTML(s){return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
    function sqlMarkup(s) {
      return escapeHTML(s).replace(/\b(SELECT|FROM|WHERE|AND|JOIN|ON|AS|CREATE|INDEX)\b/g,'<span class="sql-keyword">$1</span>').replace(/&#39;(.*?)&#39;/g,'<span class="sql-string">&#39;$1&#39;</span>');
    }
    function compute(rows,region){
      const nested=[]; let nestedOps=0;
      for(const o of rows){
        for(const c of customers){nestedOps++;if(c.id===o.customer_id){if(c.region===region)nested.push({ ...o,name:c.name,region:c.region });break;}}
      }
      const lookupIndex = new Map();let indexOps=0;
      for(const c of customers){lookupIndex.set(c.id,c);indexOps++;}
      const indexed=[];
      for(const o of rows){indexOps++;const c=lookupIndex.get(o.customer_id);if(c?.region===region)indexed.push({ ...o,name:c.name,region:c.region });}
      return {nested,nestedOps,indexed,indexOps};
    }
    function run(){
      const n=Number(rowsSelect.value), region=regionSelect.value;
      const rows=Array.from({length:n},(_,i)=>({id:`ORD-${String(i+1).padStart(4,'0')}`,customer_id:((i*13+Math.floor(i/7))%24)+1,amount:35+((i*17+5)%315)}));
      const data=compute(rows,region);
      if(JSON.stringify(data.nested)!==JSON.stringify(data.indexed))throw Error('Demo lookup strategies diverged.');
      nestedButton.setAttribute('aria-pressed',String(!optimized));indexButton.setAttribute('aria-pressed',String(optimized));
      $('#sql-mode-label').textContent=optimized?'keyed join example':'nested scan example';
      $('#sql-code').innerHTML=sqlMarkup(optimized?indexQuery(region):nestedQuery(region));
      const count=optimized?data.indexOps:data.nestedOps;
      $('#sql-operations').textContent=fmt(count);
      $('#sql-explanation').textContent=optimized?'Builds a small lookup map, then makes one lookup per order.':'Searches customer records row by row until the matching customer is found.';
      $('#sql-ops-nested').textContent=fmt(data.nestedOps);
      $('#sql-ops-index').textContent=fmt(data.indexOps);
      $('#sql-bar-nested').style.width='100%';
      $('#sql-bar-index').style.width=`${Math.max(2,data.indexOps/data.nestedOps*100)}%`;
      const body=$('#sql-records');body.replaceChildren();
      data.nested.slice(0,6).forEach(o=>{
        const tr=document.createElement('tr');
        [o.id,o.name,o.region,`$${o.amount}`].forEach(t=>{const td=document.createElement('td');td.textContent=t;tr.append(td);});body.append(tr);
      });
      $('#sql-result-count').textContent=`${data.nested.length} results · showing ${Math.min(6,data.nested.length)}`;
    }
    nestedButton.addEventListener('click',()=>{optimized=false;run();});
    indexButton.addEventListener('click',()=>{optimized=true;run();});
    $('#sql-run').addEventListener('click',run);
    [regionSelect,rowsSelect].forEach(el=>el.addEventListener('change',run));
    run();
  }

  // OBJECT TRACKING: deterministic trajectories with scripted track IDs.
  if (demo === 'object-tracking') {
    const canvas=$('#tracker-canvas');const ctx=canvas.getContext('2d');
    const slider=$('#tracker-range'),play=$('#tracker-play'),target=$('#tracker-target');
    const boxes=$('#tracker-boxes'),trails=$('#tracker-trails');
    let frame=Number(slider.value),timer=null;
    const objects=[
      {id:1,color:'#a8b7fa',pos:(f)=>({x:80+f*4.55,y:145+23*Math.sin(f/17)})},
      {id:2,color:'#f1b67b',pos:(f)=>({x:760-f*4.2,y:260+32*Math.sin(f/21+1.2)})},
      {id:3,color:'#7bd4b2',pos:(f)=>({x:120+f*3.85,y:385-f*1.4+18*Math.sin(f/12+0.5)})}
    ];
    const occluded=(pos)=>pos.x>378&&pos.x<493&&pos.y>67&&pos.y<411;
    function render(){
      slider.value=String(frame);$('#tracker-frame').textContent=`${String(frame).padStart(3,'0')} / 160`;
      ctx.clearRect(0,0,850,465);drawSceneGrid(ctx,850,465);
      roundRect(ctx,45,66,760,346,14,'#142337','#465a7548');
      ctx.setLineDash([13,10]);ctx.strokeStyle='#8394ad48';ctx.lineWidth=2;
      [165,306].forEach(y=>{ctx.beginPath();ctx.moveTo(52,y);ctx.lineTo(795,y);ctx.stroke();});ctx.setLineDash([]);
      const highlighted=Number(target.value);let visible=0;
      // Draw a short history of frame locations to show association paths.
      objects.forEach(obj=>{
        if(!trails.checked)return;
        ctx.beginPath();let drawing=false;
        for(let k=Math.max(0,frame-23);k<=frame;k++){
          const p=obj.pos(k);
          if(p.x<50||p.x>805||occluded(p)){drawing=false;continue;}
          if(!drawing){ctx.moveTo(p.x,p.y);drawing=true;}else ctx.lineTo(p.x,p.y);
        }
        ctx.strokeStyle=obj.id===highlighted?'#c9d3ff9e':obj.color+'67';ctx.lineWidth=obj.id===highlighted?3.5:2;ctx.stroke();
      });
      objects.forEach(obj=>{
        const pos=obj.pos(frame);if(occluded(pos))return;
        if(pos.x<45||pos.x>810)return;
        visible++;
        const chosen=obj.id===highlighted;
        ctx.save();ctx.translate(pos.x,pos.y);
        ctx.shadowColor=obj.color;ctx.shadowBlur=chosen?23:9;
        roundRect(ctx,-21,-18,42,36,10,obj.color,'#f1f5ff8c');ctx.shadowBlur=0;
        roundRect(ctx,-10,-9,20,18,5,'#102033b0');
        ctx.restore();
        if(boxes.checked){
          ctx.strokeStyle=chosen?'#eef0ff':'#89a2ae';ctx.lineWidth=chosen?3:1.5;
          ctx.strokeRect(pos.x-29,pos.y-26,58,52);
          canvasPill(ctx,`ID #0${obj.id}`,pos.x-28,pos.y-34,chosen?'#e5e8ff':'#cad6e6');
        }
      });
      // Draw a semi-opaque physical obstruction over the simulation.
      ctx.fillStyle='#63758b67';ctx.fillRect(378,68,115,343);
      ctx.strokeStyle='#9aabbcaa';ctx.setLineDash([5,6]);ctx.strokeRect(378,68,115,343);ctx.setLineDash([]);
      canvasPill(ctx,'OCCLUSION ZONE',379,103,'#e6edf7');
      ctx.font='12px ui-monospace,monospace';ctx.fillStyle='#adbad0a8';ctx.fillText('ILLUSTRATIVE TRACKS · NOT MODEL INFERENCE',22,450);
      const selected=objects.find(o=>o.id===highlighted);
      const behind=occluded(selected.pos(frame));
      $('#tracker-status').textContent=behind?'Temporarily occluded':frame>0?'Matched · simulated':'Initialized';
      $('#tracker-count').textContent=`${visible} / 3`;
      $('#tracker-age').textContent=`${frame} frame${frame===1?'':'s'}`;
    }
    function stop(){if(timer!==null){clearInterval(timer);timer=null;}play.textContent='▶ Play';play.setAttribute('aria-pressed','false');}
    function step(){frame=(frame+1)%161;render();if(frame===160)stop();}
    play.addEventListener('click',()=>{if(timer!==null){stop();return;}if(frame===160)frame=0;timer=setInterval(step,90);play.textContent='Ⅱ Pause';play.setAttribute('aria-pressed','true');render();});
    $('#tracker-step').addEventListener('click',()=>{stop();step();});
    slider.addEventListener('input',()=>{frame=Number(slider.value);render();});
    [target,boxes,trails].forEach(el=>el.addEventListener('change',render));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    render();
  }
})();
