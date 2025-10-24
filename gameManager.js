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
const generatorIcon = document.getElementById('generatorOn');
const generatorOffIcon = document.getElementById('generatorOff');
const bedIcon = document.getElementById('bed');
const sofaIcon = document.getElementById('sofa');
const faucetIcon = document.getElementById('faucet');
const frigeIcon = document.getElementById('fridge');
const ovenIcon = document.getElementById('oven');
const microIcon = document.getElementById('micro');
const storageIcon = document.getElementById('storage'); 
const livestockIcon = document.getElementById("livestock");
const facilityIconsList = [generatorIcon, generatorOffIcon, bedIcon, sofaIcon, faucetIcon, frigeIcon, ovenIcon, microIcon, storageIcon,livestockIcon];

//게임 매니저 객체
const player = document.getElementById('player');
const playerRest = document.getElementById('playerRest');
const equipWp = document.getElementById('equipWp');
const zombie0 = document.getElementById('zombie0');
const zombie1 = document.getElementById('zombie1');
const zombie2 = document.getElementById('zombie2');
const zombieElements = [zombie0,zombie1,zombie2];
const damage0 = document.getElementById('damage0');
const damage1 = document.getElementById('damage1');
const damage2 = document.getElementById('damage2');
const damageTxt = [damage0, damage1, damage2];

//무들 아이콘
const Moodle_Tired = document.getElementById("Moodle_Icon_Tired");
const Moodle_Endurance= document.getElementById("Moodle_Icon_Endurance");
const Moodle_Panic = document.getElementById("Moodle_Icon_Panic");
const Moodle_Sick = document.getElementById("Moodle_Icon_Sick");
const Moodle_Stressed = document.getElementById("Moodle_Icon_Stressed");
const Moodle_Zombie = document.getElementById("Moodle_Icon_Zombie");

const bar_Tired = document.getElementById("pgBar_Tired");
const bar_Endurance= document.getElementById("pgBar_Endurance");
const bar_Panic = document.getElementById("pgBar_Panic");
const bar_Sick = document.getElementById("pgBar_Sick");
const bar_Stressed = document.getElementById("pgBar_Stressed");
const bar_Zombie = document.getElementById("pgBar_Zombie");
const moodles = [
    {icon:Moodle_Tired,bar:bar_Tired , value:0 },
    {icon:Moodle_Endurance , bar:bar_Endurance , value:0 },
    {icon:Moodle_Panic , bar:bar_Panic , value:0 },
    {icon:Moodle_Sick , bar:bar_Sick , value:0 },
    {icon:Moodle_Stressed , bar:bar_Stressed , value:0 },
    {icon:Moodle_Zombie, bar:bar_Zombie, value:0}
];
//명령 버튼
const pushBt = document.getElementById('pushBt');
const attackBt = document.getElementById('attackBt');
const restBt = document.getElementById('restBt');
const sleepBt = document.getElementById('sleepBt');
const atHomeBt = document.getElementById('atHomeBt');
const nextMapBt = document.getElementById('nextMapBt');


//무기 아이콘
const weaponIcon = document.getElementById('weaponIcon');
const weaponImg = document.getElementById('weaponImg');
const weaponName = document.getElementById('weaponName');
//가방 아이콘
const backpackIcon = document.getElementById(`backpackIcon`);
const backpackImg = document.getElementById(`backpackImg`);
const backpackName = document.getElementById('backpackName');

const commandBts = [pushBt,attackBt,restBt,sleepBt,atHomeBt,nextMapBt, backpackIcon]; //, weaponIcon

//로그텍스트 추가
const logtxt = document.getElementById("logText");

//버튼함수
pushBt.addEventListener('click', () => {
    //캐릭터 밀치기(좀비 넘어트리기)
     if(gameOver)return;
    if(delaying) return; //딜레이 중이면 무시
    stopResting();
    if(!isAnimating){
        //console.log(parseInt(weapon.multiHit)+1);
        playerPush(parseInt(weapon.multiHit)+1); //무기 멀티타격보다 1명더 넘어트리기
    }
    
    playerMove();
    advanceTurn();
});
attackBt.addEventListener('click', () => {
    //캐릭터 공격
     if(gameOver)return;
    if(delaying) return;//딜레이 중이면 무시
    stopResting();
    if(!isAnimating){
        playerAttack(weapon.multiHit);    
    }
    
    playerMove();
    advanceTurn();
    callZombies(1,0.02);//좀비추가
});

restBt.addEventListener('click', () => {
    //휴식 및 턴 넘기기
     if(gameOver)return;
    if(delaying) return; //딜레이 중이면 무시
    if(isResting){
        stopResting();
        return;
    }
    isResting = true;
    log("휴식중...");
    renderGameUI();
    interval =  setInterval(() => {
        //스태미나, 체력 회복
        if(stamina<100 || health < 100){
             stamina += 10;
             health += 5;
            if(stamina>=100)stamina=100;
            if(health>=100)health=100;
            if(stamina>=100 && health>=100){
                //회복하다가 한 번 멈춤
                stopResting();
            }
        }
        
       
        advanceTurn();
        renderGameUI();
    },400); 
});
nextMapBt.addEventListener('click',() =>{
     if(gameOver)return;
    if(delaying)return;//딜레이 중이면 무시
    //다음 맵 이동
    mapNum++;
    let rng = Math.random();
    if(mapNum==mapData.length){
        if(currentMapData.name =="road"){
            //현재 길거리에 있을 때에만
            if(rng<0.15){
                mapData.push( findMapData('store_tool'));
            }else if(rng<0.35){
                mapData.push( findMapData("livestock"));
            }else if(rng<0.6){
                mapData.push( findMapData("house"));
            }else{
                mapData.push( findMapData('road'));
            }
        }else{
             mapData.push( findMapData('road'));
        }
       
        
    }else{
        rng =0;
    }
    let timedelay = 0;
    if(zombies.length>0){
        timedelay = 900;
        delaying=true;
        renderGameUI();
    }
     zombieAttack(0); //맵 이동 시 좀비 공격
     setTimeout(() => { 
        if(gameOver)return;
        mapSetting(mapData[mapNum]);
        delaying=false;
        renderGameUI();
        log(`${translations[currentLang][currentMapData.name]}으로 이동했다. - 진행도[${mapNum+1}/${mapData.length}]`,rng);
     },timedelay);
    
    //TurnEnd();
    
    
})
atHomeBt.addEventListener('click', ()=>{
     if(gameOver)return;
    if(delaying)return;//딜레이 중이면 무시
    //이전 맵 이동
    mapNum--;
    if(mapNum<0){
        mapNum=0
        return;
    }

    let timedelay = 0;
    if(zombies.length>0){
        timedelay = 900;
        delaying=true;
        renderGameUI();
    }
     zombieAttack(0); //맵 이동 시 좀비 공격
     setTimeout(() => { 
        if(gameOver)return;
        mapSetting(mapData[mapNum]);
        delaying=false;
        renderGameUI();
        log(`${translations[currentLang][currentMapData.name]}으로 돌아왔다. - 진행도[${mapNum+1}/${mapData.length}]`);
     },timedelay);
    
    //TurnEnd();
    
    
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//배경
const bg = document.getElementById('mainBg');

//아이템리스트
let weaponsData = []; //무기리스트
let mapDatas = [];//맵리스트

//게임 상태 변수
//턴 진행 함수
let debug = true;
let delaying = false;
let gameOver =false;

let interval = null;
let basePos = 60; // 기본 위치 (기준점)
player.style.left = basePos + "px";
let position = basePos;
let isAnimating = false; // 중복 클릭 방지용
let isResting = false; //휴식 상태 여부

let hour= 7; //게임 시간 (시간단위)
let min = 0; //게임 시간 (분단위)
let day = 1; //현재 날짜
let mapData = [];
let currentMapData;
let mapNum = 0;
//좀비 스텟
let zombies = [];
const stunClass = 'rotate-90';


//플레이어 데이터
let weapon;
let backpack = {name:"backpack", path:"backpacks/SheetSlingBag.png"};
let stamina;
let health;
let zombieKillCount;

weaponImg.addEventListener('click', ()=>{ 
   changeWeapon();
});


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
  weaponsData = await loadWeapons();
  mapDatas = await loadMapDatas();
}
init();

function findWeapon(itemName ){
    //무기데이터 검색 및 가공해서 반환
    const data = weaponsData.find(w => w.name === itemName);
    let data0 ={
        path: data.path.toString(),
        rotate: parseInt(data.rotate),
        name: data.name.toString(),
        multiHit: parseInt(data.multiHit),
        durability: parseInt(data.durability),
        stamina: parseInt(data.stamina),
        damage: parseInt(data.damage)
    }
    return data0;
}
function changeWeapon( itemName= "random"){
    
    if(itemName === "random"){
        weapon = weaponsData[ randomInt(0, weaponsData.length) ];
    }else{
        weapon = findWeapon(itemName); 
    }
    weaponImg.src = weapon.path;
    equipWp.src = weapon.path;
    equipWp.classList.remove("rotate-90", 'rotate-180',"-rotate-90");
    if(weapon.rotate>0){ 
        if(weapon.rotate<=180){
            equipWp.classList.add('rotate-'+weapon.rotate); 
        }else{
            equipWp.classList.add('-rotate-'+(weapon.rotate-180)); 
        }
        
    }
    weaponName.textContent = translations[currentLang][weapon.name];
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
            console.log(`${item[0]} (${(rng*100).toFixed(2)})`);
            dropItemsArray.push(item[0]);
        }
    }

    let data0 ={
        name: data.name,
        outdoor: JSON.parse(data.outdoor),
        zombieNum: parseInt( data.zombieNum),
        src: data.src,
        thisFacilities: data.thisFacilities.split(";"),
        dropItems:dropItemsArray
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

    zombies = [];

    currentMapData=null;
    mapNum=0;
    mapData = [];
    mapData.push( findMapData('house'));
    
    gameOver=false;
    isResting = false;
    delaying = false;    
    weapon =null;
    health = 100;
    stamina = 100;
    zombieKillCount=0;

    //맵 이동 함수
    mapData[0].zombieNum = 1; //난이도 하락
    mapSetting(mapData[0]);

    playerMove();
    renderGameUI();
    changeWeapon();
    commandBtsVisible(true);
    
    //준비완료
    logtxt.innerHTML='';
    log(translations[currentLang].ment);
}
//맵 이동 갱신
function mapSetting(data) {
    currentMapData = data;
    clearInterval(interval );
    interval = null;
    spawnZombies(currentMapData.zombieNum); //좀비소환
    bgLightDark( currentMapData );
    //맵 보관함 아이템 출력(임시)
    if(currentMapData.dropItems.length>0){
        console.log(currentMapData.dropItems);
    }
   renderGameUI();
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
        if(  data.thisFacilities.includes("generatorOn")){
            //발전기가 있으면
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
function log(text, value=0) {
  const p = document.createElement("p"); // 한 줄씩 추가
  p.textContent = `${hour}:${min.toString().padStart(2, '0') } : ` + text + (debug? (value>0? `  (${value})`:"" ) :"");
  p.className = "text-white text-left text-md"; // Tailwind 스타일 적용
  logtxt.appendChild( p);
  // 자동 스크롤: 맨 아래로
  requestAnimationFrame(() => {
    logtxt.scrollTop = logtxt.scrollHeight;
  });
  
}

//난수생성함수
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function advanceTurn() {
     if(gameOver)return;
    //좀비반격
    zombieAttack();
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
        
        //스텟 회복
        stamina++;
        if(stamina>100){stamina=100}
        if(health>100){health=100}
        min += 10; //15분씩 증가
        // 분이 60이 넘으면 시간 증가
        if(min >= 60) {
            min = 0;
            hour++;
            //좀비소환
            callZombies(1);
            bgLightDark(currentMapData);
        }
        if(hour >= 24) {
            hour = 0;
            day++;
        }
    }
    

    renderGameUI();
}

function findMoodle(_moodleName){
    return moodles.find(m => m.icon.id == _moodleName);
}
function setMoodleValue(_moodleName, _value){
    let moodle = findMoodle(_moodleName);
    moodle.value = _value;
    return moodle;
}
function getMoodleValue(_moodleName){
    return findMoodle(_moodleName).value;
}
function renderPlayer(){
    //플레이어 동작
     if(gameOver){
        player.classList.toggle('hidden', true);
        playerRest.classList.toggle('hidden', true);
     }
    player.classList.toggle('hidden', isResting);
    playerRest.classList.toggle('hidden', !isResting);
}
function renderZombie(){
    if(gameOver)return;
    //좀비 동작 표시
    for(let i =0; i< zombies.length; i++){
        if(i>=zombieElements.length){
            break;
        }
        if(zombies[i].isStunning>0){
            //스턴 된 경우
            if(zombieElements[i].classList.contains(stunClass)){
                //넘어짐이 있는 경우
            }else{
                zombieElements[i].classList.add(stunClass);
            }
        }else{
            zombieElements[i].classList.remove(stunClass);
        }
        if(zombies[i].hp <=0){
            //체력 감소 시 좀비 숨김, 좀비 사망
            zombieKillCount++;
            zombies.splice(i,1);
            i--;
        }else{

        }
    }
    //좀비 엘리먼트 표시, 좀비 배열이 줄면 뒤부터 감추기
    for(let i =0 ; i <zombieElements.length; i++){
        if(i<zombies.length){
             zombieElements[i].classList.remove('hidden');
        }else{
             zombieElements[i].classList.add('hidden');
        }
    }
}
function renderMooldes(){
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
    for(let i=0; i<facilityIconsList.length; i++){
        const icon = facilityIconsList[i];
        if(currentMapData.thisFacilities.includes(icon.id)){
            setFacilityIconVisibility(icon.id, true);
        }else{
            setFacilityIconVisibility(icon.id, false);
        }
    }
    renderMooldes();
    renderZombie();

    //타이머 표시
    timerTxt.textContent = `Day ${day}, ${hour}:${min.toString().padStart(2, '0') } ${delaying? " (대기중...)": isResting? " (휴식중...)": ""}`;     ;
    //맵이름
    mapNameTxt.textContent = `${translations[currentLang].WestPoint} : ${translations[currentLang][currentMapData.name]}[${mapNum+1}/${mapData.length}]`;
    //남은좀비수
    if(zombies.length>0){
        zombieNumTxt.textContent =`${translations[currentLang].remainZombie} : ${zombies.length}`
        zombieNumTxt.classList.remove('hidden');
    }else{
        zombieNumTxt.classList.add('hidden');
    }   
    renderPlayer();
    //플레이어 사망, 게임오버
    checkGameOver();
}
function checkGameOver(){
    if(!gameOver && health<=0){
        playerStat();
        stopResting();
        commandBtsVisible(false);
        interval =null;
        gameOver =true;
        delaying= true;
        //게임오버
        renderPlayer();
        renderMooldes();
        log(`= 게임오버 =`);
        log(`당신은 ${day}일, ${hour}시간 동안 생존하였습니다.`);
        log(`당신은 생존하는 동안 ${zombieKillCount} 마리의 좀비를 처치하였습니다.`);
    }
}
function commandBtsVisible(value){
    for(let i = 0; i<commandBts.length;i++){
        commandBts[i].classList.toggle('hidden', !value);
    }
}


//상단설비 호출 함수
function getFacilityIcons(name) {
    return facilityIconsList.find(icon => icon.id === name);
}
function setFacilityIconVisibility(name, visible) {
    const icon = getFacilityIcons(name);
    icon.classList.toggle('hidden', !visible);
}

