"use strict";
// สูตรโหราศาสตร์ทั้งหมดด้านล่างใช้ BigInt: ไม่มี float และไม่มีเลขทศนิยม.
const CIRCLE = 21600n, RASI = 1800n, DAY_MINUTES = 1440n;
const MONTHS = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const RASI_NAMES = ["เมษ","พฤษภ","เมถุน","กรกฎ","สิงห์","กันย์","ตุลย์","พิจิก","ธนู","มังกร","กุมภ์","มีน"];
const PLANETS = [["อาทิตย์","☀","#E56B24"],["จันทร์","☾","#5C7594"],["อังคาร","♂","#C94B45"],["พุธ","☿","#4189B8"],["พฤหัส","♃","#C78619"],["ศุกร์","♀","#C04473"],["เสาร์","♄","#7456A5"],["ราหู","☊","#3E5264"],["เกตุ","☋","#008D79"],["มฤตยู","♅","#388E59"]];
const $ = id => document.getElementById(id);
const state = (() => { const now = new Date(); return { year:now.getFullYear()+543, month:now.getMonth()+1, day:now.getDate() }; })();

const mod = x => ((x % CIRCLE) + CIRCLE) % CIRCLE;
const part = (minutes, multiplier) => BigInt(minutes) * multiplier / DAY_MINUTES;
function pos(x) { x=mod(x); const r=x/RASI, rem=x%RASI; return {rasi:Number(r), degree:Number(rem/60n), lipda:Number(rem%60n)}; }
function arc(angle) { angle=mod(angle); if(angle<=5400n)return [angle,-1n,5400n-angle,1n]; if(angle<=10800n)return [10800n-angle,-1n,angle-5400n,-1n]; if(angle<=16200n)return [angle-10800n,1n,16200n-angle,-1n]; return [21600n-angle,1n,angle-16200n,1n]; }
function phuj(x,t) { const i=Number(x/RASI), rem=x%RASI, base=t[i], next=t[i+1]??base; return ((rem*(next-base)+base*RASI)*60n)/RASI; }
function ko(x,t) { const i=Number(x/RASI), rem=x%RASI, base=t[i], next=t[i+1]??base; return (rem*(next-base)+base*RASI+900n)/RASI; }
function sun(h,minutes) { const raw=h*800n+part(minutes,800n)-373n, meanMotion=raw%292207n; let [r,rem1]=[meanMotion/24350n,meanMotion%24350n], [o,rem2]=[rem1/811n,rem1%811n], l=rem2/14n-3n; if(l<0n)l+=60n; const mean=r*RASI+o*60n+l, [p,sign]=arc(mean-4800n), table=[0n,35n,67n,94n,116n,129n,134n], i=Number(p/900n), correction=table[i]+(p%900n)*(table[i+1]-table[i])/900n; return {...pos(mean+correction*sign),mean,kam:raw%292207n}; }
function moon(h,meanSun,minutes) { const mas=h*703n+650n+part(minutes,703n), score=mas%20760n, dithi=score/692n, avaman=score%692n, mean=mod(dithi*720n+(104n*avaman)/100n-40n+meanSun), uch=((((h-621n)%3232n)*DAY_MINUTES+BigInt(minutes))*CIRCLE)/(3232n*DAY_MINUTES)+2n, [p,sign]=arc(mean-uch), table=[0n,77n,148n,209n,256n,286n,296n], i=Number(p/900n), correction=table[i]+(p%900n)*(table[i+1]-table[i])/900n; return pos(mean+correction*sign); }
function solve(mean,firstRef,monBase,secondRef,baseChet,payatNum,payatDen,roundSing=false) { const table=[0n,244n,427n,488n]; let [p,sign,k,signK]=arc(firstRef), mchet=baseChet+(ko(k,table)/2n)*signK, mon=mod(monBase+(phuj(p,table)*60n/mchet)*sign); let [p2,sign2,k2,signK2]=arc(mon-secondRef), sp=phuj(p2,table), sing=roundSing?((sp+30n)/60n)/3n:(2n*(sp/60n)+1n)/6n, schet=sing+(payatNum===null?payatDen:(mchet*payatNum)/payatDen)+ko(k2,table)*signK2; return pos(mon+(sp*60n/schet)*sign2); }
function calculate(year,month,day,hour,minute) { const g=year-543, target=Date.UTC(g,month-1,day); if(new Date(target).getUTCDate()!==day)throw new Error("วันที่ไม่ถูกต้อง"); let cs=BigInt(year-1181), song=Date.UTC(g,3,16); if(target<song){song=Date.UTC(g-1,3,16);cs-=1n;} const sur=BigInt(Math.floor((target-song)/86400000)), seed=292207n*cs+373n, hor=seed/800n+sur, mins=hour*60+minute, s=sun(hor,mins), m=moon(hor,s.mean,mins), ravi=mod(s.mean-23n), kam=(cs-(s.kam<364n?611n:610n))*CIRCLE+ravi;
  const marsMean=mod(kam/2n+(kam*16n)/505n+5420n), mercuryMean=mod((kam*7n)/46n+kam*4n+10642n), jupiterMean=mod(kam/12n+kam/1032n+14297n), venusMean=mod((kam*5n)/3n-(kam*10n)/243n+10944n), saturnMean=mod(kam/30n+(kam*6n)/10000n+11944n), uranusMean=mod(kam/84n+kam/7224n+16277n);
  const rahu=pos(15150n-mod(kam/20n+kam/265n)), ketu=pos(CIRCLE-((((hor-344n)%679n)*DAY_MINUTES+BigInt(mins))*CIRCLE)/(679n*DAY_MINUTES));
  return {cs,hor, planets:{"อาทิตย์":s,"จันทร์":m,"อังคาร":solve(marsMean,marsMean-7620n,marsMean,ravi,2700n,4n,15n),"พุธ":solve(mercuryMean,ravi-13200n,ravi,mercuryMean,6000n,null,1260n,true),"พฤหัส":solve(jupiterMean,jupiterMean-10320n,jupiterMean,ravi,5520n,3n,7n),"ศุกร์":solve(venusMean,ravi-4800n,ravi,venusMean,19200n,null,660n),"เสาร์":solve(saturnMean,saturnMean-14820n,saturnMean,ravi,3780n,7n,6n),"ราหู":rahu,"เกตุ":ketu,"มฤตยู":solve(uranusMean,uranusMean-7440n,uranusMean,ravi,38640n,3n,7n)}}; }

function pad(n){return String(n).padStart(2,"0");}
function renderCalendar(){ const cal=$("calendar"); cal.textContent=""; const g=state.year-543, first=new Date(Date.UTC(g,state.month-1,1)).getUTCDay(), days=new Date(Date.UTC(g,state.month,0)).getUTCDate(), today=new Date(); for(let i=0;i<first;i++){const e=document.createElement("span");e.className="day empty";cal.append(e);} for(let d=1;d<=days;d++){const b=document.createElement("button");b.className="day"+(d===state.day?" selected":"")+(today.getFullYear()===g&&today.getMonth()+1===state.month&&today.getDate()===d?" is-today":"");b.textContent=d;b.onclick=()=>{state.day=d;render();};cal.append(b);} }

function thaiPlanetNumber(index) {
  return ["๑","๒","๓","๔","๕","๖","๗","๘","๙","๐"][index];
}

function planetRasiIndex(p) {
  return p.rasi;
}

function makePlanetMarker(name, index, planet) {
  const marker = document.createElement("div");
  marker.className = "planet-marker";

  const number = document.createElement("span");
  number.className = "planet-number";
  number.textContent = ["๑","๒","๓","๔","๕","๖","๗","๘","๙","๐"][index];

  // แสดงเฉพาะเลขดาว และใช้สีประจำดาว
  marker.style.setProperty("--planet-color", PLANETS[index][2]);

  // tooltip ยังเก็บชื่อดาวไว้เวลาเอาเมาส์ชี้
  marker.title = `${number.textContent} ${name}`;

  marker.appendChild(number);
  return marker;
}


function renderZodiacImage(planets) {
  const layer = $("planetLayer");
  layer.textContent = "";

  /*
   * RASI CELL + PLANET SKEWER + RINGS
   *
   * The calculation tells us only WHICH RASI the planet occupies.
   * The real degree/lipda is displayed in the table, not plotted here.
   *
   * Each rasi has a safe "skewer" running from its outer area toward
   * the center. Ring 1 is nearest the outside, then Ring 2, Ring 3...
   *
   * The coordinates below are deliberately defined per rasi because
   * the Thai chart cells are not equal 30-degree circular sectors.
   */
  const byRasi = Array.from({ length: 12 }, () => []);

  PLANETS.forEach(([name, symbol, color], index) => {
    const p = planets[name];
    if (!p || !Number.isInteger(p.rasi)) return;

    byRasi[p.rasi].push({
      name,
      index,
      p,
      color
    });
  });

  /*
   * Safe lane for each rasi.
   *
   * outer = position for Ring 1
   * inner = direction toward the center for subsequent rings
   *
   * Coordinates are in the SVG/viewBox coordinate system (700 x 700),
   * then converted to percentages so the overlay scales with the image.
   *
   * These are layout coordinates only. They have NO astronomical meaning.
   */
  const lanes = [
    { outer:[350,155], inner:[350,245] }, // เมษ
    { outer:[225,175], inner:[275,255] }, // พฤษภ
    { outer:[150,255], inner:[245,275] }, // เมถุน
    { outer:[155,350], inner:[245,350] }, // กรกฎ
    { outer:[150,445], inner:[245,425] }, // สิงห์
    { outer:[225,525], inner:[275,445] }, // กันย์
    { outer:[350,545], inner:[350,455] }, // ตุลย์
    { outer:[475,525], inner:[425,445] }, // พิจิก
    { outer:[550,445], inner:[455,425] }, // ธนู
    { outer:[545,350], inner:[455,350] }, // มังกร
    { outer:[550,255], inner:[455,275] }, // กุมภ์
    { outer:[475,175], inner:[425,255] }  // มีน
  ];

  /*
   * Ring positions:
   * 1 = outermost
   * 2 = one step inward
   * 3 = one more step inward...
   *
   * We intentionally keep every ring away from the boundary lines.
   */
  // ระยะของดาวแต่ละวงจากขอบนอกเข้าหาศูนย์กลาง
// วงที่ 1 ขยับออกด้านนอกเล็กน้อยจากตำแหน่งเดิม
// ขยับดาวทุกวงออกจากศูนย์กลางเท่า ๆ กัน
// วงที่ 1 → 0.00 → -0.12
// วงที่ 2 → 0.34 →  0.22
// วงที่ 3 → 0.68 →  0.56
// วงที่ 4 → 0.86 →  0.74
// วงที่ 5 → 0.94 →  0.82
const ringT = [-0.12, 0.22, 0.56, 0.74, 0.82];

  byRasi.forEach((items, rasiIndex) => {
    if (!items.length) return;

    const lane = lanes[rasiIndex];

    items.forEach((item, i) => {
      const t = ringT[Math.min(i, ringT.length - 1)];

      const x = lane.outer[0] + (lane.inner[0] - lane.outer[0]) * t;
      const y = lane.outer[1] + (lane.inner[1] - lane.outer[1]) * t;

      const marker = makePlanetMarker(item.name, item.index, item.p);

      marker.style.left = `${(x / 700) * 100}%`;
      marker.style.top = `${(y / 700) * 100}%`;
      marker.style.setProperty("--planet-color", item.color);
      marker.dataset.ring = String(i + 1);

      layer.appendChild(marker);
    });
  });
}

/*
 * Render the real calculated result.
 * No test/demo rasi values are used.
 */
function renderResults() {
  const [hour, minute] = $("time").value.split(":").map(Number);
  const result = calculate(state.year, state.month, state.day, hour, minute);

  $("selectedDate").textContent =
    `${state.day} ${MONTHS[state.month - 1]} ${state.year}`;
  $("timeNote").textContent =
    `เวลา ${pad(hour)}:${pad(minute)} น.`;
  $("calculationNote").textContent =
    `จ.ศ. ${result.cs.toString()} · หรคุณ ${result.hor.toString()}`;
  $("zodiacDate").textContent =
    `${state.day} ${MONTHS[state.month - 1]} ${state.year}`;
  $("zodiacTime").textContent =
    `เวลา ${pad(hour)}:${pad(minute)} น.`;
  $("calendarTitle").textContent =
    `${MONTHS[state.month - 1]} ${state.year}`;

  renderZodiacImage(result.planets);
  renderPlanetTable(result.planets);
}

function render() {
  $("month").value = state.month;
  $("year").value = state.year;
  renderCalendar();
  renderResults();
}

function renderPlanetTable(planets) {
  const body = $("planetTableBody");
  body.textContent = "";

  PLANETS.forEach(([name, symbol, color], index) => {
    const p = planets[name];
    const row = document.createElement("tr");

    const numberCell = document.createElement("td");
    numberCell.className = "number-cell";
    numberCell.textContent = thaiPlanetNumber(index);

    const planetCell = document.createElement("td");
    planetCell.className = "planet-name-cell";
    planetCell.textContent = `ดาว${name}`;

    const rasiCell = document.createElement("td");
    rasiCell.className = "rasi-cell";
    rasiCell.textContent = RASI_NAMES[p.rasi];

    const degreeCell = document.createElement("td");
    degreeCell.className = "degree-cell";
    degreeCell.textContent = pad(p.degree);

    const minuteCell = document.createElement("td");
    minuteCell.className = "minute-cell";
    minuteCell.textContent = pad(p.lipda);

    row.append(numberCell, planetCell, rasiCell, degreeCell, minuteCell);
    body.appendChild(row);
  });
}

function render() {
  $("month").value = state.month;
  $("year").value = state.year;
  renderCalendar();
  renderResults();
}

function changeMonth(delta) {
  state.month += delta;
  if (state.month === 0) {
    state.month = 12;
    state.year--;
  }
  if (state.month === 13) {
    state.month = 1;
    state.year++;
  }
  state.day = 1;
  render();
}

MONTHS.forEach((name, index) => {
  $("month").add(new Option(name, index + 1));
});

$("previousMonth").onclick = () => changeMonth(-1);
$("nextMonth").onclick = () => changeMonth(1);

$("month").onchange = e => {
  state.month = Number(e.target.value);
  state.day = 1;
  render();
};

$("year").onchange = e => {
  state.year = Number(e.target.value);
  state.day = 1;
  render();
};

$("time").onchange = renderResults;

$("today").onclick = () => {
  const n = new Date();
  Object.assign(state, {
    year: n.getFullYear() + 543,
    month: n.getMonth() + 1,
    day: n.getDate()
  });
  render();
};


render();
