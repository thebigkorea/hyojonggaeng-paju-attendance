const API_URL="https://script.google.com/macros/s/AKfycbwepn9ybkMA6BPSqobW1009eCdxxdbfRv_1yuesYqormK3F1Rr74Rp6m_fN7CKiCud5/exec";
const KEY="HYOJONGGAENG_PAJU_USER";
const ACTION_KEY="HYOJONGGAENG_PAJU_ACTION";
const DATE_KEY="HYOJONGGAENG_PAJU_ACTION_DATE";
const IN_TIME_KEY="HYOJONGGAENG_PAJU_IN_TIME";
const OUT_TIME_KEY="HYOJONGGAENG_PAJU_OUT_TIME";
const STORE_LAT=37.7696, STORE_LNG=126.6965;

const QUOTES=[
"지금 해야 할 일에 집중하는 것이 가장 빠른 길입니다.","작은 친절 하나가 좋은 하루를 만듭니다.","오늘의 성실함이 내일의 신뢰가 됩니다.",
"밝은 인사는 좋은 서비스의 시작입니다.","서두르지 않아도 정확하게 하면 됩니다.","서로 돕는 하루는 일이 한결 가벼워집니다.",
"좋은 음식에는 정성과 마음이 함께 담깁니다.","기본을 지키는 힘이 결국 차이를 만듭니다.","한 번 더 살피는 습관이 실수를 줄입니다.",
"오늘도 맡은 자리에서 최선을 다해 주세요.","고객의 미소는 우리의 작은 배려에서 시작됩니다.","차분하게 하나씩 하면 어려운 일도 풀립니다.",
"좋은 팀은 서로의 빈자리를 자연스럽게 채웁니다.","정돈된 시작이 편안한 하루를 만듭니다.","오늘의 노력은 분명 좋은 결과로 돌아옵니다.",
"따뜻한 말 한마디가 분위기를 바꿉니다.","익숙한 일일수록 한 번 더 확인해 주세요.","함께 웃을 수 있는 하루를 만들어 봅시다.",
"성실함은 눈에 띄지 않아도 결국 드러납니다.","오늘도 안전하고 기분 좋은 하루 보내세요."
];

window.onload=()=>{
  resetDailyIfNeeded();
  const p=document.getElementById("phone");
  if(p) p.oninput=function(){this.value=formatPhone(this.value)};
  const saved=JSON.parse(localStorage.getItem(KEY)||"null");
  if(saved) showMain(saved);
};

function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function nowHHMM(){const d=new Date();return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;}
function formatPhone(v){const n=String(v||"").replace(/\D/g,"").slice(0,11);if(n.length<=3)return n;if(n.length<=7)return n.slice(0,3)+"-"+n.slice(3);return n.slice(0,3)+"-"+n.slice(3,7)+"-"+n.slice(7);}
function resetDailyIfNeeded(){const s=localStorage.getItem(DATE_KEY);if(s&&s!==todayKey()){localStorage.removeItem(ACTION_KEY);localStorage.removeItem(DATE_KEY);localStorage.removeItem(IN_TIME_KEY);localStorage.removeItem(OUT_TIME_KEY);}}
function dayOfYear(){const n=new Date(),s=new Date(n.getFullYear(),0,0);return Math.floor((n-s)/86400000);}

async function register(){
  const name=document.getElementById("name").value.trim();
  const phone=document.getElementById("phone").value.trim();
  const regMsg=document.getElementById("regMsg");
  if(!name||!phone){regMsg.innerText="이름과 전화번호를 입력하세요.";return;}
  regMsg.innerText="직원 등록중...";
  try{
    await fetch(API_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"registerEmployee",name,phone,userAgent:navigator.userAgent})});
    const user={name,phone};localStorage.setItem(KEY,JSON.stringify(user));regMsg.innerText="직원 등록 완료";showMain(user);
  }catch(e){regMsg.innerText="등록하지 못했습니다. 다시 시도해주세요.";}
}

function showMain(user){
  document.getElementById("register").style.display="none";
  document.getElementById("main").style.display="block";
  document.getElementById("userName").innerText=user.name;
  document.getElementById("userPhone").innerText="· "+formatPhone(user.phone);
  document.getElementById("quoteText").innerText=QUOTES[(dayOfYear()-1)%QUOTES.length];
  updateClock();setInterval(updateClock,30000);updateBtn();renderTimes();
}
function updateClock(){const d=new Date();document.getElementById("clock").innerText=`${d.getMonth()+1}월 ${d.getDate()}일 (${["일","월","화","수","목","금","토"][d.getDay()]}) · ${d.getHours()<12?"오전":"오후"} ${String(d.getHours()%12||12).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;}
function renderTimes(){document.getElementById("inTime").innerText=localStorage.getItem(IN_TIME_KEY)||"--:--";document.getElementById("outTime").innerText=localStorage.getItem(OUT_TIME_KEY)||"--:--";}

function updateBtn(){
  resetDailyIfNeeded();
  const last=localStorage.getItem(ACTION_KEY),i=document.getElementById("inBtn"),o=document.getElementById("outBtn"),m=document.getElementById("msg");
  if(!last){i.disabled=false;o.disabled=true;m.innerText="아직 출근 전입니다.";return;}
  if(last==="출근"){i.disabled=true;o.disabled=false;m.innerText="✓ "+(localStorage.getItem(IN_TIME_KEY)||"")+" 출근 완료";return;}
  i.disabled=true;o.disabled=true;m.innerText="✓ "+(localStorage.getItem(OUT_TIME_KEY)||"")+" 퇴근 완료";
}

function getLocation(){return new Promise(resolve=>{if(!navigator.geolocation)return resolve({latitude:"",longitude:"",distance:""});navigator.geolocation.getCurrentPosition(p=>{const lat=p.coords.latitude,lng=p.coords.longitude;resolve({latitude:lat,longitude:lng,distance:Math.round(calculateDistanceMeters(lat,lng,STORE_LAT,STORE_LNG))+"m"});},()=>resolve({latitude:"",longitude:"",distance:"위치권한없음"}),{enableHighAccuracy:false,timeout:5000,maximumAge:60000});});}

function send(type){
  const user=JSON.parse(localStorage.getItem(KEY)||"null");if(!user)return;
  const t=nowHHMM();
  localStorage.setItem(ACTION_KEY,type);localStorage.setItem(DATE_KEY,todayKey());localStorage.setItem(type==="출근"?IN_TIME_KEY:OUT_TIME_KEY,t);
  updateBtn();renderTimes();document.getElementById("msg").innerText="✓ "+t+" "+type+" 완료";

  getLocation().then(loc=>fetch(API_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"recordAttendance",name:user.name,phone:user.phone,type,store:"한국의집 효종갱 신세계파주프리미엄아울렛점",timestamp:new Date().toISOString(),latitude:loc.latitude,longitude:loc.longitude,distance:loc.distance,userAgent:navigator.userAgent})})).catch(e=>console.warn("백그라운드 저장 확인 실패",e));
}

function calculateDistanceMeters(lat1,lng1,lat2,lng2){const R=6371000,dLat=toRad(lat2-lat1),dLng=toRad(lng2-lng1),a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
function toRad(v){return v*Math.PI/180;}
function reset(){if(!confirm("직원 정보를 다시 등록하시겠습니까?"))return;[KEY,ACTION_KEY,DATE_KEY,IN_TIME_KEY,OUT_TIME_KEY].forEach(k=>localStorage.removeItem(k));location.reload();}
