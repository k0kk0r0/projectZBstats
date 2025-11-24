//게임매니저
//게임의 전반적인 흐름과 상태를 관리하는 스크립트

//타이머, UI 표시
const timerTxt = document.getElementById('timer');
const mapNameTxt = document.getElementById('mapName');
const zombieNumTxt = document.getElementById("zombieNum");

//체력, 스태미나 바
const healthBar = document.getElementById("healthBar");
const helathTxt = document.getElementById("healthTxt");
const staminaBar = document.getElementById("staminaBar");
const staminaTxt = document.getElementById("staminaTxt");

//장소의 상단 설비 아이콘들
const facilityNames = ["generator", "bed","sofa", "radio", "faucet","fridge","oven", "micro","storage","livestock","water"];
const facilityIcons = facilityNames.map(name =>({
    name:name,
    icon: document.getElementById(`Icon_${name}`),    
    enabledIcon: document.getElementById(`Enable_${name}`),
    enabled:false,
    visible:false,
    needs:null
 }));

 getFacilityIcon('generator').needs = {name:'fuel', amount:0};
 getFacilityIcon('radio').needs = {name:'battery', amount:10};
 getFacilityIcon('fridge').needs = {name:'generator'};
 getFacilityIcon('oven').needs = {name:'generator'};
 getFacilityIcon('micro').need= {name:'generator'};
 getFacilityIcon('faucet').needs= {name:'water', amount:10};
 //console.log(facilityIcons);

 for(let i=0;i<facilityIcons.length;i++){
    const data = facilityIcons[i];
    if(data.needs ==null){
        data.enabled=true;
    }

    data.icon.addEventListener('click', ()=>{
        if(data.needs !=null ){
            const needs = data.needs;
                stopResting();
                if(needs.name=='generator'){
                    //필요로 하는 물품이 발전기인 경우
                    if(powerEndTurn>0){
                        setFacilityEnable( data.name, !data.enabled);
                        log(`${data.name} ${(data.enabled?'작동시켰습니다.':'껐습니다.')}`);

                    }else if(getFacilityIconVisiblity(needs.name) ){
                        //발전기가 있으면
                        if(getFacilityEnable(needs.name)  ){
                            //발전기가 켜져있으면
                            setFacilityEnable( data.name, !data.enabled);
                            log(`${data.name} ${(data.enabled?'작동시켰습니다.':'껐습니다.')}`);
                        }else{
                            log(`전력 공급이 중단되었거나 발전기가 꺼져있습니다.`);
                        }
                    }
                    else{
                        //발전기가 없음
                        log(`전력 공급 혹은 발전기가 필요합니다.`);
                    }
                }else if(needs.name=='water'){
                    //물이 필요한 경우
                    if(waterEndTurn>0){
                        //물 끊기기 전
                        log(`물을 마셨습니다.`);
                    }else{
                        if(needs.amount>0){
                            needs.amount--;
                            log(`물을 마셨습니다. 남은 물: ${needs.amount}`)
                        }else{
                            log('물이 없습니다');
                        }
                    }
                }
                else if(needs.name=='fuel' || needs.name=='battery'){
                    if(needs.amount<=0){
                         //자원이 없는 경우
                        log(`${needs.name}가 필요합니다.`);
                    }else{
                        //자원이 있는 경우 작동
                        setFacilityEnable( data.name, !data.enabled);
                        log(`${data.name} ${(data.enabled?'작동시켰습니다.':'껐습니다.')}`);
                    }
                }else{
                    setFacilityEnable( data.name, !data.enabled);
                    log(`${data.name} ${(data.enabled?'작동시켰습니다.':'껐습니다.')}`);
                }
      
           
        }else{

        }
    });
 }

//게임 매니저 객체
const player = document.getElementById('player');
const playerRest = document.getElementById('playerRest');
const playerZb = document.getElementById('playerZb');
const equipWp = document.getElementById('equipWp');

//무들 아이콘
const moodleNames = ["Tired", "Endurance", "Panic", "Sick", "Stressed", "Bleeding", "Zombie"];
const moodles = moodleNames.map(name => ({
  name: name,
  icon: document.getElementById(`Moodle_Icon_${name}`),
  bar: document.getElementById(`pgBar_${name}`),
  value: 0
}));

//명령 버튼
const pushBt = document.getElementById('pushBt');
const attackBt = document.getElementById('attackBt');
const restBt = document.getElementById('restBt');
const sleepBt = document.getElementById('sleepBt');

const skillBt = document.getElementById('skillBt');
const bandingBt = document.getElementById('bandingBt');
const atHomeBt = document.getElementById('atHomeBt');
const nextMapBt = document.getElementById('nextMapBt');
const prevMapTxt = document.getElementById('prevMapTxt');
const nextMapTxt = document.getElementById('nextMapTxt');



//무기 아이콘
const weaponIcon = document.getElementById('weaponIcon');
const weaponImg = document.getElementById('weaponImg');
const weaponName = document.getElementById('weaponName');
//가방 아이콘
const backpackIcon = document.getElementById(`backpackIcon`);
const backpackImg = document.getElementById(`backpackImg`);
const backpackName = document.getElementById('backpackName');

const commandBts = [pushBt,attackBt,restBt,skillBt,bandingBt, atHomeBt,nextMapBt, backpackIcon]; //, weaponIcon

//로그텍스트 추가
const logtxt = document.getElementById("logText");


//배경
const Scene = document.getElementById("Scene");
const bg = document.getElementById('mainBg');

//아이템리스트
let weaponDatas = []; //무기리스트
let mapDatas = [];//맵리스트
let miscs = [];//기타 아이템 리스트
let foods = [];

//게임 상태 변수
//턴 진행 함수
let debug = true;
let delaying = false;
let gameOver =false;

let interval = null;
const basePos = 100; // 기본 위치 (기준점)
player.style.left = `${basePos}px`;
let position = basePos;
let isAnimating = false; // 중복 클릭 방지용
let isResting = false; //휴식 상태 여부

let hour= 7; //게임 시간 (시간단위)
let min = 0; //게임 시간 (분단위)
let day = 1; //현재 날짜
let waterEndTurn;
let powerEndTurn;
let mapData = [];
let currentMapData;
let mapNum = 0;
let stack = {};
//좀비 스텟
let zombies = [];
const stunClass = 'rotate-90';


//플레이어 데이터
const equipments = {
  weapon: null,
  hat: null,
  armor: null,
  pants: null,
  shoes: null,
  accessory: null
};
let backpack;
let inventory ;
let storage;
let stamina;
let health;
let wound = [];//상처 배열
let skills = {};
let job;
let zombieKillCount;
let traits =[]; 
const xpData = [100, 200,500,800,1200,1500, 2000,3500,5000,7500,10000 ];
const pushStamina= 4;
function setPlayerTrait(){
    //선택한 플레이어 데이터 수집
    let data = getSelectedItemList();

    skills = {};
    skills.strength = {lv:5, xp:0, maxXp: xpData[5]};
    skills.fitness = {lv:5, xp:0, maxXp:xpData[5]};
    skills.Maintenance = {lv:0, xp:0, maxXp:xpData[0]};
    skills.Axe = {lv:0, xp:0, maxXp: xpData[0]};
    skills.ShortBlade = {lv:0, xp:0, maxXp: xpData[0]};
    skills.LongBlade = {lv:0, xp:0, maxXp: xpData[0]};
    skills.ShortBlunt = {lv:0, xp:0, maxXp: xpData[0]};
    skills.LongBlunt = {lv:0, xp:0, maxXp: xpData[0]};


    for(let i =0 ; i< data.length; i++){
        let value = data[i].value;
       if(data[i].name =="strength"){
            skills.strength = {lv:value, xp:0, maxXp: xpData[value]};
       } 
       else if(data[i].name =="fitness") {
            skills.fitness = {lv:value, xp:0, maxXp:xpData[value]};
       }
       else if(data[i].name =="Profession"){
            job = {name:value, src:data[i].imgsrc};
       }
       else if(data[i].name=="Trait"){
            traits.push( {name:value} );
            
       }else{
            if(value>0){
                skills[data[i].name] = {lv:value , xp:0, maxXp:xpData[value]};
            }else{
                //변수0, 둔감함 같은 경우
                traits.push( {name:data[i].name} );
            }
            
       }
    }
    //console.log(data);
    //console.log(traits);
}
function findPlayerTrait(name) {
  return traits.find(v=> v.name === name);
}
function playerHasTrait(name){
    if(findPlayerTrait(name) != null){
        return true;
    }else{
        return false;
    }
}
function findPlayerSkill(name){
    return skills[name];
}
function playerHasSkill(name){
    if(findPlayerSkill(name) !=null){return true}
    else{return false}
}
//물건관리 계산
function maintenenceCalculate(item){
    //물건관리 계산
    // lossChance = 1 / (ConditionLowerChanceOneIn + floor(  floor(    MaintenanceLevel + (WeaponLevel/2)   )/2    )*2)
    
    const lowerChance = parseFloat(item.conditionLowerChance);
    const MaintenanceLv = parseFloat(findPlayerSkill("Maintenance").lv);
    const weaponLv = parseFloat(findPlayerSkill(item.subType).lv);
    const base = ( lowerChance + Math.floor( Math.floor(   MaintenanceLv + ( weaponLv/2)  )/2 )*2 ) ;
    const per = 1 / base ;
    //console.log(per, base);
    if(Math.random() <= per){
        //감소
        addSkillXp("Maintenance", Math.floor(base*1.2)); //내구도 감소 시 1.2배
        item.condition--;
        log(`${(per*100).toFixed(1)}% 확률로 아이템 내구도 감소! (${item.condition}/${item.maxCondition})`);
    }else{
        addSkillXp("Maintenance", Math.floor(base));
    }
    
}


//무기 데이터 호출
function loadWeapons() {
  return new Promise((resolve) => {
    Papa.parse("weapons.csv", {
      download: true,
      header: true,
      complete: function(results) {
        resolve(results.data);
      }
    });
  });
}
//기타 아이템 호출
function loadMiscs() {
  return new Promise((resolve) => {
    Papa.parse("miscs.csv", {
      download: true,
      header: true,
      complete: function(results) {
        resolve(results.data);
      }
    });
  });
}
//음식 아이템 호출
function loadFoods() {
  return new Promise((resolve) => {
    Papa.parse("foods.csv", {
      download: true,
      header: true,
      complete: function(results) {
        resolve(results.data);
      }
    });
  });
}
//맵 데이터 호출
function loadMapDatas(){
    return new Promise((resolve) => {
        Papa.parse("mapDatas.csv",{
            download: true,
            header: true,
            complete: function(results){
                resolve(results.data);
            }
        });
    });
}
async function init() {
  weaponDatas = await loadWeapons();
  mapDatas = await loadMapDatas();
  miscsData = await loadMiscs();
  foodsData = await loadFoods();
}
init();
function findItem(itemName){
    let item = findWeapon(itemName);
    if(item!=null){ return item }
    
    item = findMisc(itemName);
    if(item!=null){ return item }
    
    item = findFood(itemName);
    if(item!=null){ return item}

    return null;
}
function findWeapon(itemName ){
    //무기데이터 검색 및 가공해서 반환
    const data = weaponDatas.find(w => w.name === itemName);
    if(data==null){ return null }
    let data0 ={
        path: data.path.toString(),
        rotate: parseInt(data.rotate),
        name: data.name.toString(),
        type: data.type.toString(),
        subType: data.subType.toString(),
        multiHit: parseInt(data.multiHit),
        condition: parseInt(data.condition),
        maxCondition: parseInt(data.condition),
        conditionLowerChance: parseInt(data.conditionLowerChance),
        stamina: parseInt(data.stamina),
        damage: parseInt(data.damage),
        weight: parseFloat(data.weight)
    }
    return data0;
}
function findMisc(itemName ){
    //기타 아이템 데이터 검색 및 가공해서 반환
    const data = miscsData.find(w => w.name === itemName);
    if(data==null){ return null }
    let data0 ={
        path: data.path.toString(),
        name: data.name.toString(),
        type: data.type.toString(),
        subType: data.subType.toString(),
        condition: parseInt(data.condition),
        maxCondition: parseInt(data.condition),
        weight: parseFloat(data.weight),
        info: data.info.toString()
    }
    return data0;
}
function findFood(itemName ){
    //음식 아이템 데이터 검색 및 가공해서 반환
    const data = foodsData.find(w => w.name === itemName);
    const xp = 24*6; //24시간*6턴
    if(data==null){ return null }
    let data0 ={
        path: data.path.toString(),
        name: data.name.toString(),
        type: data.type.toString(),
        subType: data.subType.toString(),
        condition: parseInt( data.rottenDays!=null? (data.freshDays!=null? data.freshDays*xp: data.rottenDays*xp): data.condition ),
        maxCondition: parseInt( data.rottenDays!=null? (data.freshDays!=null? data.freshDays*xp : data.rottenDays*xp ): data.condition  ),
        weight: parseFloat(data.weight),
        freshDays: parseInt(data.freshDays*24),
        rottenDays: parseInt(data.rottenDays*24),
        cookTime: parseInt( data.cookTime ),
        hunger: parseInt(data.hunger),
        convert: data.convert.toString(),
        div:4,
        maxDiv:4,
        weightDiv: parseFloat(data.weight/4),
        info: data.info.toString()
    }
    return data0;
}

function setWeapon( itemName= "random"){
    
    if(itemName === "random"){
        equipments.weapon = findWeapon(weaponDatas[ randomInt(0, weaponDatas.length) ].name);
    }else{
        equipments.weapon = findWeapon(itemName); 
    }
    renderEquipment();
}

function getWeapon(){
    return equipments.weapon;
}
function findMapData(itemName){
    //맵 데이터 검색 및 가공해서 반환
    const data = mapDatas.find(d => d.name === itemName);
    let dropItemsArray=[];
    const dropTable = data.dropItems.split(";");
    for(let i =0;i<dropTable.length ; i++){
        item = dropTable[i].split("-");
        let rng = Math.random();
        if(rng < parseFloat(item[1])){
           // console.log(`${item[0]} (${(rng*100).toFixed(2)})`);
            dropItemsArray.push( findItem( item[0]) );
        }
    }

    let data0 ={
        name: data.name,
        outdoor: JSON.parse(data.outdoor),
        zombies:[],
        src: data.src,
        thisFacilities: data.thisFacilities.split(";"),
        storages:[{name:(JSON.parse(data.outdoor)?"ground":"storage"), inventory:dropItemsArray}]
    }
    data0.thisFacilities.push('storage','livestock');//항상 추가
    for(let i =0; i< parseInt( data.zombieNum) ;i++){
        data0.zombies.push( spawnZombie( 'random') );
    }
    return data0
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//게임 초기화 함수
//ResetAllGame(); //나중에 버튼으로 추가
async function ResetAllGame(){
    hour= 7; //게임 시간 (시간단위)
    min = 0; //게임 시간 (분단위)
    day = 1; //현재 날짜

    log_popup();//감추기
    powerEndTurn = randomInt(0,14*6);
    waterEndTurn = randomInt(0,14*6);
   
    
    gameOver=false;
    isResting = false;
    delaying = false;    

    
    equipments.weapon =null;
    equipments.armor = null;
    equipments.hat =null;
    equipments.pants = null;
    equipments.shoes = null;
    equipments.accessory = findItem("DigitalWatch");
    //console.log(equipments.accessory);
    backpack = {name:"backpack", path:"Base/Backpacks/SheetSlingBag.png"};
    storage = [];
    inventory = [];
    wound = [];
    health = 100;
    stamina = 100;
    zombieKillCount=0;
     setPlayerTrait();

    //맵 이동 함수
    currentMapData=null;
    
    zombies=[];
    mapData = [];
    mapData.push( findMapData('river'));
    mapData.push( findMapData('house'));
    mapNum = 1;
    mapData[mapNum].zombieNum = 0;
    mapSetting(mapData[mapNum]);
    
    stack = {
        weather:"sunny",
        nextWeather:"rain",
        prevWeather:"sunny",
        weatherTime:randomInt(5,10),

        zombieSpawn:0
    };
    for(let i=0;i<moodles.length;i++){
        moodles[i].value =0;
    }

    //playerMove();
    resetAllMoodleValue();
    //resetFacilityIcons();

    //renderGameUI();
    setWeapon("random");
    commandBtsVisible(true);
    //보너스
    inventory.push( findItem("Zomboxivir"));
    //준비완료
    logtxt.innerHTML='';
    log(translations[currentLang].ment);
    log_popup(translations[currentLang].ment,1200);

    radioAction(0);
    renderGameUI();
}
//맵 이동 갱신
function mapSetting(data) {
   
    
    if(playerHasTrait("conspicuous")){
        //넘치는존재감
        txt = "<넘치는 존재감>으로";
        log(`${txt} 좀비가 더 이끌려 왔습니다`)
    }
    if(playerHasTrait("inconspicuous")){
        //부족한존재감
        txt = "<부족한 존재감>으로";
        log(`${txt} 좀비가 덜 이끌려 왔습니다`)
    }
    
    currentMapData = data;
    clearInterval(interval );
    interval = null;
    let txt='';

    clearZombies();
    spawnZombies(); //좀비소환
    bgLightDark( currentMapData );

    //맵 아이템
    storageIndex=0;
    storage = currentMapData.storages;
    renderStorageModal();
    renderGameUI();
}
//날씨변경
function changeweather(){
    stack.weatherTime--;
    if(stack.weatherTime<=0){
        let txt ="";
        let txt0="";
        if(stack.weather != stack.nextWeather){
            if(stack.weather =="rain"){    txt0 = '비가 그치고'  }
            if(stack.weather =="windy"){    txt0 = '바람이 그치고'  }
            if(stack.weather =="sunny"){    txt0 = '맑은 날씨가 끝나고'  }
            //날씨변경 시 알림
            if(stack.nextWeather=="rain"){  txt="비가 옵니다."  }
            if(stack.nextWeather=="windy"){ txt="바람이 붑니다."   }
            if(stack.nextWeather=="sunny"){ txt="날씨가 잔잔해졌습니다."  }
            
            log(`${txt0} ${txt}`);
        }
        stack.weather = stack.nextWeather;
        const rng = Math.random();
         if(rng < 0.3){
            stack.nextWeather = "rain";
            stack.weatherTime = randomInt(4,20);
            
        }else if(rng < 0.7){
            stack.nextWeather = "windy";
            stack.weatherTime = randomInt(2,8);
            
        }else{
            stack.nextWeather = "sunny";
            stack.weatherTime = randomInt(10,10);
           
        }
    }
}
function radioAction(num){
    //라디오 작동
    let txt = '';
    if(getFacilityEnable('radio')){
        if(num==0){ 
            log(`pzzz.. ABS 비상방송...pzzz... 날씨는... <${translations[currentLang][stack.weather]}> pzzz...`);
        }
        if(num==10){
            log(`pzzz... 앞으로 ${stack.weatherTime}턴 동안 ...날씨가 지속된 후... pzzz... <${translations[currentLang][stack.nextWeather]}>.. pzzz...`)
        }
        if(num==20){
            if(powerEndTurn>0){
                 log(`pzzz... 비상전력 시스템...pzz... ${powerEndTurn}턴 뒤... pzzz... 전력 끊김... pzzz...`)
            }
           
        }
    }    
}

//배경 밤낮
function bgLightDark(data){
    let editsrc =data.src;
    let src = data.src;
    let dark = false;
    if(data.outdoor){
        //실외의 경우
        if( hour>=8 && hour < 20 ){
            //낮 시간대
            dark = false;
        }else{
            dark =true;
        }
    }else{
        //실내의 경우
        if( getFacilityEnable("generator") || powerEndTurn>0){
            //발전기가 켜져 있으면
            dark = false;
        }else{
            dark = true;
        }
    }
    if(!dark){
        if(src.includes("_dark")){
            editsrc = src.replace("_dark","_light");
        }
    }else{
        if(src.includes("_light")){
            editsrc = src.replace("_light","_dark");
        }
    }
    bg.src = editsrc;
}
function log(text, popup=false) {
  const p = document.createElement("p"); // 한 줄씩 추가
  p.textContent = `${hour}:${min.toString().padStart(2, '0') } : ` + text ;
  p.className = "text-white text-left text-lg"; // Tailwind 스타일 적용
  logtxt.appendChild( p);
  // 자동 스크롤: 맨 아래로
  requestAnimationFrame(() => {
    logtxt.scrollTop = logtxt.scrollHeight;
  });
  if(popup){
    log_popup(text, text.length>12? 1400:800);
  }
}
const infoModal = document.getElementById('infoModal');//팝업창
const infoModalTxt = document.getElementById('infoModalTxt');
function log_popup(text ='', timedelay = 0){
    if(text.length>0){
        infoModal.classList.remove('hidden');
        infoModalTxt.innerText = text;
        if(timedelay>0){
            setTimeout(() => { 
                //감추기
                infoModal.classList.add('hidden');
            },timedelay);
        }else if(timedelay<0){
            //음수 바로 감추기
            infoModal.classList.add('hidden');
        }
    }else{
        //내용이 없으면 바로 감추기;
        infoModal.classList.add('hidden');
    }
}


//난수생성함수
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function advanceTurn() {
     if(gameOver)return;
    //좀비반격
    if(zombies.length>0){
        closeStorageModal();
        zombieAttack();
    }
    for(let i =0;i<zombies.length;i++){
        //스턴계수 감소,
        if(zombies[i].isStunning>0){
            zombies[i].isStunning --;
        }
    }
    renderGameUI();
    setTimeout(() => {
         if(gameOver)return;
        TurnEnd();
    },  200);
    
}

function TurnEnd() {
    if(gameOver)return;
    if(!delaying) {
        //좀비소환
            callZombies(1);
        //스텟 회복
        stamina++;
        if(stamina>100){stamina=100}
        if(health>100){health=100}

        changeweather();//날씨변경
        
        woundHealingCalculate(); //부상계산

        //물, 전기끊김
        if(powerEndTurn>0){
            powerEndTurn--;
            if(powerEndTurn<=0){
                log(`⚡쿠궁! 전기가 끊겼습니다⚡`, true);
                bgLightDark(currentMapData);
                resetFacilityIcons();//
                stopResting();
            }
        }
        if(waterEndTurn>0){
            waterEndTurn--;
            if(waterEndTurn<=0){
                //log(`물이 끊겼습니다.`); //물은 언제 끊겼는지 몰루

            }
        }
        
        
        min += 10; //15분씩 증가
        // 분이 60이 넘으면 시간 증가
        
        if(min >= 60) {
            min = 0;
            hour++;
            
            bgLightDark(currentMapData);
        }
        if(hour >= 24) {
            hour = 0;
            day++;
        }
        
        if(min<= 20){
            radioAction(min);
        }
    }
    
   // log_popup();//감추기
   renderStorageTurn();//아이템부패처리
   renderGameUI();
}

function findMoodle(_moodleName){
    return moodles.find(m => m.name == _moodleName);
}
function setMoodleValue(_moodleName, _value){
    let moodle = findMoodle(_moodleName);
    moodle.value = _value;
    return moodle;
}
function getMoodleValue(_moodleName){
    return findMoodle(_moodleName).value;
}
function resetAllMoodleValue(){
    for(let i =0 ;i <moodles.length; i++){
        moodles[i].value=0;
    }
    renderMoodles();
}
function renderPlayer(){
    //플레이어 동작
     if(gameOver){
        player.classList.toggle('hidden', true);
        playerRest.classList.toggle('hidden', true);
        playerZb.classList.toggle('hidden', false);
        return;
     }else{
         player.classList.toggle('hidden', isResting);
        playerRest.classList.toggle('hidden', !isResting);
        playerZb.classList.toggle('hidden', true);
     }
   
}

function renderMoodles(){
    //무들표시
    for(let i = 0; i < moodles.length;i++){
        if(moodles[i].value==0){
            moodles[i].icon.classList.add('hidden');
        }else{
            moodles[i].icon.classList.remove('hidden');
            moodles[i].bar.src = `uxicons/pgbar${moodles[i].value}.png`;
        }
    }
}
function renderGameUI(){
    //플레이어 스텟 
    playerStat();
    healthBar.style.width = ( health )+"%";
    helathTxt.textContent = parseInt(health) +"/100";
    staminaBar.style.width = ( stamina )+"%";
    staminaTxt.textContent = parseInt(stamina) +"/100";


    //시설 표시
    for(let i=0; i<facilityNames.length; i++){
        const data= getFacilityIcon( facilityNames[i] );
        let found = currentMapData.thisFacilities.find(item => item.includes(data.name)); 
        if (found) {
            if (found.endsWith("_off")) {
                //console.log(data.name + "는 꺼져 있습니다.");
                 setFacilityIconVisiblity(data.name, true);
                 setFacilityEnable(data.name, false);
            } else if (found.endsWith("_on")) {
                //console.log(data.name + "는 켜져 있습니다.");
                 setFacilityIconVisiblity(data.name, true);
                 setFacilityEnable(data.name, true);
            } else {
                setFacilityIconVisiblity(data.name, true);
                setFacilityEnable(data.name, true);
            }
        }else{
            //못 찾은 경우
            setFacilityIconVisiblity(data.name, false);
            setFacilityEnable(data.name, false);
        }

    }
    //console.log(currentMapData.thisFacilities);
    renderMoodles();
    renderZombie();
    renderEquipment();
    if(delaying){
         //log_popup('턴 넘기는 중...',800);
    }
    //타이머 표시
    let timeTxt = 'Day ?';
    if(equipments.accessory!=null){
        //손목시계 착용하고 있는 경우
        if(equipments.accessory.subType== "watch"){
            timeTxt = `Day ${day}, ${hour}:${min.toString().padStart(2, '0') }`;
        }
    }
    
    timerTxt.textContent = `${timeTxt} ${delaying? " (대기중...)": isResting? " (휴식중...)": ""}`;     ;
    //맵이름
    mapNameTxt.textContent = `${translations[currentLang].Louisville} : ${translations[currentLang][currentMapData.name]}[${mapNum+1}/${mapData.length}]`;
    
    if(mapNum-1> -1 ){
         prevMapTxt.innerText = translations[currentLang][mapData[mapNum-1].name];
         atHomeBt.classList.remove('hidden');
    }else{
        atHomeBt.classList.add('hidden');
    }
    if(mapNum+1 < mapData.length){
        nextMapTxt.innerText = translations[currentLang][mapData[mapNum+1].name];
        nextMapBt.classList.remove('hidden');
    }else{
        if(mapNum+1 == mapData.length){
            nextMapTxt.innerText = translations[currentLang].nextMap;
            nextMapBt.classList.remove('hidden');
        }else{
            nextMapBt.classList.add('hidden');
        }
        
    }
   
    
    
    //남은좀비수
    if(zombies.length>0){
        zombieNumTxt.textContent =`${translations[currentLang].remainZombie} : ${zombies.length}`
        zombieNumTxt.classList.remove('hidden');
    }else{
        zombieNumTxt.classList.add('hidden');
    }   
    renderPlayer();
    //플레이어 사망, 게임오버 검사
    checkGameOver();
}
function checkGameOver(){
    if(!gameOver && health<=0){
        resetAllMoodleValue();
        playerStat();
        stopResting();
        commandBtsVisible(false);
        interval =null;
        gameOver =true;
        delaying= true;
        //게임오버
        clearInterval(interval );
        renderPlayer();
        renderMoodles();
        const _hour = hour-7;
        log(`=== 게임오버 ===`);
        log(`당신은 ${day-1}일, ${ (_hour<0? _hour+17:_hour ) }시간 동안 생존하였습니다.`);
        log(`당신은 생존하는 동안 ${zombieKillCount} 마리의 좀비를 처치하였습니다.`);
    }
}
function commandBtsVisible(value){
    for(let i = 0; i<commandBts.length;i++){
        commandBts[i].classList.toggle('hidden', !value);
    }
}


//상단설비 호출 함수
function getFacilityIcon(name) {
    return facilityIcons.find(m => m.name == name);
}
function getFacilityIconVisiblity(name){
    return getFacilityIcon(name).visible;
}
function setFacilityIconVisiblity(name, value) {
    const icon = getFacilityIcon(name).icon;
    icon.classList.toggle('hidden', !value);
    icon.visible = value;
}
function getFacilityEnable(name){
    const enabled = getFacilityIcon(name).enabled;
    if(enabled==true){
        return true;
    }else {
        return false;
    }
}
function setFacilityEnable(name, value){
    const icon = getFacilityIcon(name);
    if(value==null){
        icon.enabledIcon.classList.toggle( 'hidden', true);
        icon.value =null;
    }
    else{
       
        icon.enabled = value;
        let index = currentMapData.thisFacilities.findIndex(item => item.includes(name));

        if(value==false){
            //작동중단
            icon.enabledIcon.classList.toggle( 'hidden', false);
            if (index !== -1) {
                currentMapData.thisFacilities[index] = currentMapData.thisFacilities[index].replace('_on', '_off');
            }
        }else{
            icon.enabledIcon.classList.toggle( 'hidden', true);
            if (index !== -1) {
                currentMapData.thisFacilities[index] = currentMapData.thisFacilities[index].replace('_off', '_on');
            }   
        }
        //console.log(currentMapData.thisFacilities);
            
        
    }
}
function resetFacilityIcons(){
    for(let i=0;i<facilityIcons.length;i++){
        const data = facilityIcons[i];
        if(data.needs !=null){
            if(data.needs.name=='generator'){
                  if(powerEndTurn>0 || getFacilityEnable('generator')){
                    //전력공급중이거나 generator 가 있다면
                    setFacilityEnable(data.name, true);

                }else{
                    if(data.needs !=null){
                        if(data.needs.name=='generator'){
                            //발전기가 필요한 경우 전원 내리기
                            if(getFacilityEnable('generator') ==false){
                                //발전기가 꺼져있는 경우
                                setFacilityEnable(data.name, false);
                            }
                        }
                    }
                }
            }
            else if(data.needs.name=='water'){
                if(waterEndTurn>0){
                    //물이 안 끊긴 경우, (빗물받이통?)
                    setFacilityEnable(data.name, true);
                }else{
                    setFacilityEnable(data.name, false);
                }
            }
        }
      
    }
    
}
