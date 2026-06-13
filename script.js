const API_URL =
  "https://script.google.com/macros/s/AKfycbwepn9ybkMA6BPSqobW1009eCdxxdbfRv_1yuesYqormK3F1Rr74Rp6m_fN7CKiCud5/exec";

const KEY =
  "HYOJONGGAENG_PAJU_USER";

const ACTION_KEY =
  "HYOJONGGAENG_PAJU_ACTION";

const DATE_KEY =
  "HYOJONGGAENG_PAJU_ACTION_DATE";

const STORE_LAT = 37.7916;
const STORE_LNG = 126.6955;

window.onload = () => {

  resetDailyIfNeeded();

  const saved =
    JSON.parse(localStorage.getItem(KEY));

  if(saved){
    showMain(saved);
  }
};

function todayKey(){

  const d = new Date();

  const y = d.getFullYear();

  const m =
    String(d.getMonth()+1)
      .padStart(2,"0");

  const day =
    String(d.getDate())
      .padStart(2,"0");

  return `${y}-${m}-${day}`;
}

function resetDailyIfNeeded(){

  const savedDate =
    localStorage.getItem(DATE_KEY);

  const today =
    todayKey();

  if(savedDate && savedDate !== today){

    localStorage.removeItem(ACTION_KEY);
    localStorage.removeItem(DATE_KEY);
  }
}

async function register(){

  const name =
    document.getElementById("name").value.trim();

  const phone =
    document.getElementById("phone").value.trim();

  const regMsg =
    document.getElementById("regMsg");

  if(!name || !phone){
    regMsg.innerText = "이름과 전화번호를 입력하세요";
    return;
  }

  regMsg.innerText = "직원 등록중...";

  await fetch(API_URL,{
    method:"POST",
    mode:"no-cors",
    headers:{
      "Content-Type":"text/plain;charset=utf-8"
    },
    body:JSON.stringify({
      action:"registerEmployee",
      name:name,
      phone:phone,
      userAgent:navigator.userAgent
    })
  });

  const user = { name, phone };

  localStorage.setItem(KEY, JSON.stringify(user));

  regMsg.innerText = "직원 등록 완료";

  showMain(user);
}

function showMain(user){

  document.getElementById("register")
    .style.display = "none";

  document.getElementById("main")
    .style.display = "block";

  document.getElementById("userName")
    .innerText =
      user.name + "님";

  updateBtn();
}

function updateBtn(){

  resetDailyIfNeeded();

  const last =
    localStorage.getItem(ACTION_KEY);

  const inBtn =
    document.getElementById("inBtn");

  const outBtn =
    document.getElementById("outBtn");

  const msg =
    document.getElementById("msg");

  if(!last){

    inBtn.disabled = false;
    outBtn.disabled = true;

    msg.innerText = "";

    return;
  }

  if(last === "출근"){

    inBtn.disabled = true;
    outBtn.disabled = false;

    msg.innerText =
      "출근 완료 · 퇴근 가능";

    return;
  }

  if(last === "퇴근"){

    inBtn.disabled = true;
    outBtn.disabled = true;

    msg.innerText =
      "오늘 출퇴근 완료";
  }
}

function getLocation(){

  return new Promise((resolve)=>{

    if(!navigator.geolocation){

      resolve({
        latitude:"",
        longitude:"",
        distance:""
      });

      return;
    }

    navigator.geolocation.getCurrentPosition(

      (position)=>{

        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        const distance =
          Math.round(
            calculateDistanceMeters(
              lat,
              lng,
              STORE_LAT,
              STORE_LNG
            )
          ) + "m";

        resolve({
          latitude:lat,
          longitude:lng,
          distance:distance
        });
      },

      ()=>{

        resolve({
          latitude:"",
          longitude:"",
          distance:"위치권한없음"
        });
      },

      {
        enableHighAccuracy:true,
        timeout:8000,
        maximumAge:0
      }
    );
  });
}

async function send(type){

  const user =
    JSON.parse(localStorage.getItem(KEY));

  const msg =
    document.getElementById("msg");

  const inBtn =
    document.getElementById("inBtn");

  const outBtn =
    document.getElementById("outBtn");

  if(!user){

    msg.innerText =
      "직원 정보를 다시 등록해주세요";

    return;
  }

  msg.innerText =
    "위치 확인중...";

  if(type === "출근"){
    inBtn.innerText = "출근 처리중...";
  }

  if(type === "퇴근"){
    outBtn.innerText = "퇴근 처리중...";
  }

  inBtn.disabled = true;
  outBtn.disabled = true;

  const location =
    await getLocation();

  msg.innerText =
    type + " 처리중...";

  try{

    await fetch(API_URL,{

      method:"POST",

      mode:"no-cors",

      headers:{
        "Content-Type":
          "text/plain;charset=utf-8"
      },

      body:JSON.stringify({

        name:user.name,

        phone:user.phone,

        type:type,

        store:
          "한국의집 효종갱 신세계파주프리미엄아울렛점",

        timestamp:
          new Date().toISOString(),

        latitude:
          location.latitude,

        longitude:
          location.longitude,

        distance:
          location.distance,

        userAgent:
          navigator.userAgent
      })
    });

    localStorage.setItem(
      ACTION_KEY,
      type
    );

    localStorage.setItem(
      DATE_KEY,
      todayKey()
    );

    msg.innerText =
      type + " 완료되었습니다";

  }catch(e){

    msg.innerText =
      "오류가 발생했습니다";
  }

  inBtn.innerText = "출근";
  outBtn.innerText = "퇴근";

  updateBtn();
}

function calculateDistanceMeters(
  lat1,
  lng1,
  lat2,
  lng2
){

  const R = 6371000;

  const dLat =
    toRad(lat2 - lat1);

  const dLng =
    toRad(lng2 - lng1);

  const a =
    Math.sin(dLat/2) *
    Math.sin(dLat/2) +

    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *

    Math.sin(dLng/2) *
    Math.sin(dLng/2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1-a)
    );

  return R * c;
}

function toRad(value){
  return value * Math.PI / 180;
}

function reset(){

  if(
    !confirm(
      "직원 정보를 다시 등록하시겠습니까?"
    )
  ){
    return;
  }

  localStorage.removeItem(KEY);
  localStorage.removeItem(ACTION_KEY);
  localStorage.removeItem(DATE_KEY);

  location.reload();
}