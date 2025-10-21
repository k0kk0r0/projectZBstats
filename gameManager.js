//게임매니저
//게임의 전반적인 흐름과 상태를 관리하는 스크립트

//타이머, UI 표시
const timerTxt = document.getElementById('timer');
const mapNameTxt = document.getElementById('mapName');
const zombieNumTxt = document.getElementById("zombieNum");

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
const facilityIconsList = [generatorIcon, generatorOffIcon, bedIcon, sofaIcon, faucetIcon, frigeIcon, ovenIcon, microIcon, storageIcon];

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


//명령 버튼
const pushBt = document.getElementById('pushBt');
const attackBt = document.getElementById('attackBt');
const restBt = document.getElementById('restBt');
const sleepBt = document.getElementById('sleepBt');
const atHomeBt = document.getElementById('atHomeBt');
const nextMapBt = document.getElementById('nextMapBt');

//무기 아이콘
const weaponImg = document.getElementById('weaponImg');
const weaponName = document.getElementById('weaponName');
//가방 아이콘
const backpackIcon = document.getElementById(`backpackIcon`);
const backpackImg = document.getElementById(`backpackImg`);
const backpackName = document.getElementById('backpackName');

//로그텍스트 추가
const logtxt = document.getElementById("logText");

//버튼함수
pushBt.addEventListener('click', () => {
    //캐릭터 밀치기(좀비 넘어트리기)
    if(delaying) return; //딜레이 중이면 무시
    stopResting();
    if(!isAnimating){
        //console.log(parseInt(weapon.multiHit)+1);
        playerPush(parseInt(weapon.multiHit)+1); //무기 멀티타격보다 1명더 넘어트리기
    }
    
    characterMove();
    advanceTurn();
});
attackBt.addEventListener('click', () => {
    //캐릭터 공격
    if(delaying) return;//딜레이 중이면 무시
    stopResting();
    if(!isAnimating){
        playerAttack(weapon.multiHit);
        
    }
    characterMove();
    advanceTurn();
});

restBt.addEventListener('click', () => {
    //휴식 및 턴 넘기기
    if(delaying) return; //딜레이 중이면 무시
    if(isResting){
        stopResting();
        return;
    }
    isResting = !isResting;
    log("휴식중...");
    interval =  setInterval(() => {
        advanceTurn();
    },400); 
});
nextMapBt.addEventListener('click',() =>{
    if(delaying)return;//딜레이 중이면 무시
    //다음 맵 이동
    mapNum++;
    let rng = Math.random();
    if(mapNum==mapData.length){
        if(currentMapData.name =="road"){
            //현재 길거리에 있을 때에만
            if(rng<0.2){
                mapData.push( findMapData('store_tool'));
            }else if(rng<0.5){
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
    mapSetting(mapData[mapNum]);
    TurnEnd();
    renderGameUI();    
    log(`${translations[currentLang][currentMapData.name]}으로 이동했다. - 진행도[${mapNum+1}/${mapData.length}]`,rng);
    
})
atHomeBt.addEventListener('click', ()=>{
    if(delaying)return;//딜레이 중이면 무시
    //이전 맵 이동
    mapNum--;
    if(mapNum<0){
        mapNum=0
        return;
    }
    mapSetting(mapData[mapNum]);
    TurnEnd();
    renderGameUI();
    log(`${translations[currentLang][currentMapData.name]}으로 돌아왔다. - 진행도[${mapNum+1}/${mapData.length}]`);
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
    currentMapData=null;
    mapData = [];
    mapData.push( findMapData('house'));
    
    isResting = false;
    delaying = false;    
    weapon =null;

    //맵 이동 함수
    mapData[0].zombieNum = 1; //난이도 하락
    mapSetting(mapData[0]);

    characterMove();
    renderGameUI();
    changeWeapon();
    
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
    //맵 보관함 아이템 출력
    if(currentMapData.dropItems.length>0){
        console.log(currentMapData.dropItems);
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
//좀비생성함수
function spawnZombie(num){
    zombies.push( { id:num, hp: 40, isAnimating: false ,isStunning:0}) ;
}
function spawnZombies(num){
    const rng = randomInt(0,num);
    for(let i =0 ; i <rng; i++){
        spawnZombie(i);
    }
    for(let i =0; i< zombies.length; i++){
        if(i<zombieElements.length){
            zombieElements[i].style.right =(200- 60*i)+ "px";
            zombieElements[i].classList.remove('hidden');
            zombieElements[i].classList.remove(stunClass);
        }
    }
}
function advanceTurn() {
    //좀비반격
    zombieAttack();
    for(let i =0;i<zombies.length;i++){
        //스턴계수 감소,
        if(zombies[i].isStunning>0){
            zombies[i].isStunning --;
        }
    }
    
    TurnEnd();
}
function zombieAttack(){
    if(zombies.length>0){
        const attackNum = 2;
        const num = (attackNum > zombies.length)? zombies.length: attackNum;
        //console.log(num);
        if(delaying==false){
            delaying = true;
            stopResting();
        }
        for(let i =0; i< num; i++){
            if(zombies[i].hp > 0 && zombies[i].isStunning <= 0 ){
                setTimeout(() => {
                    log(`좀비${i}의 공격!`);
                    moveZombie(i,-45);
                    //TurnEnd();
                }, 600 +i*250);
            }
        }
         setTimeout(() => { 
            delaying = false;
            // isStunning 값을 기준으로 오름차순 정렬
            zombies.sort((a, b) => a.isStunning - b.isStunning);
            TurnEnd();
        }, 1000+num*200);
        
    }
}
function TurnEnd() {
    if(!delaying) {
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
    }
    renderGameUI();
}

function renderGameUI(){
    
    //시설 표시
    for(let i=0; i<facilityIconsList.length; i++){
        const icon = facilityIconsList[i];
        if(currentMapData.thisFacilities.includes(icon.id)){
            setFacilityIconVisibility(icon.id, true);
        }else{
            setFacilityIconVisibility(icon.id, false);
        }
    }
    //플레이어 동작
    player.classList.toggle('hidden', isResting);
    playerRest.classList.toggle('hidden', !isResting);

    //좀비 표시
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
            //체력 감소 시 좀비 숨김
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
    
    //필드이동표시
    if(zombies.length>0){
        nextMapBt.classList.add('hidden');
        atHomeBt.classList.add('hidden');
    }else{
        nextMapBt.classList.remove('hidden');
        atHomeBt.classList.remove('hidden');        
    }

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
   
}


//상단설비 호출 함수
function getFacilityIcons(name) {
    return facilityIconsList.find(icon => icon.id === name);
}
function setFacilityIconVisibility(name, visible) {
    const icon = getFacilityIcons(name);
    icon.classList.toggle('hidden', !visible);
}

//캐릭터움직임
function characterMove(distance=40) {
  if (isAnimating) return; // 이미 동작 중이면 무시
  isAnimating = true;

  const startPos = basePos;          // 시작 위치
  const targetPos = basePos + distance;    // 이동 목표 위치
  const startTime = performance.now();

  function chaMoveAnimate(time) {
    const elapsed = time - startTime;
    const duration = 200; // 1초

    if (elapsed < duration) {
      const progress = elapsed / duration; // 0 ~ 1
      const currentPos = startPos + (targetPos - startPos) * (1-progress) *5;
      player.style.left = currentPos + "px";
      requestAnimationFrame(chaMoveAnimate);
    } else {
      player.style.left = targetPos + "px";
      isAnimating = false;
    }
  }
  requestAnimationFrame(chaMoveAnimate);
}

function stopResting(){
    if(!isResting) return;
    isResting = false;
    clearInterval(interval );
    interval = null;
    renderGameUI();
    log("휴식 끝");
}
function playerAttack(multiHit){
    let num = (multiHit >= zombies.length)? zombies.length : multiHit; 
    log(`${translations[currentLang][weapon.name]}으로 공격! `);
    for(let i =0 ; i< num; i++){
        //대미지 계산
        let damage = Math.ceil( weapon.damage/2 + randomInt(0,weapon.damage/2) );
        if(zombies[i].isStunning>0){
            damage = damage*2;
        }
        zombies[i].hp -= damage;
        damageTxt[i].textContent = `-${damage}`;
        damageTxt[i].classList.remove('hidden');
        setTimeout(() => {
            damageTxt[i].classList.add('hidden');
        }, 300);

        log(`${i+1}번째 좀비가 ${damage}의 대미지를 입었다.`);
        let rng = Math.random();
        const stunPer = 0.3;
        if(rng<= stunPer){
            //확률로 넉백
            zombies[i].isStunning = 3;
            moveZombie(i,10);
            log(`${(stunPer*100).toFixed(1)}% 확률로 넉백!`, rng);
        }else{
            //좀비 경직을 넣을까?
            moveZombie(i,20);
        }
    }
    if(zombies.length<=0){
        //좀비가 없다
       
    }
}
function playerPush(multiHit){
    let num = (multiHit >= zombies.length)? zombies.length : multiHit; 
    log(`밀치기!`);
    for(let i =0 ; i <num ; i++){
        
        //밀치기 계산
       let rng = Math.random();
        const stunPer = 0.65;
        if(rng<= stunPer){
            //확률로 넉백            
            zombies[i].isStunning = 3;
            log(`${(stunPer*100).toFixed(1)}% 확률로 넉백!`,rng);
            moveZombie(i,20);
        }else{
            zombies[i].isStunning = 1; //한 턴 공격 못하게 미루기
            log(`넘어트리지 못했지만 좀비가 움찔했다.`,rng)
            moveZombie(i,10);
        }
    }
}
//좀비 움직임
function moveZombie(i , distance=20) {
    if(zombies[i]==null){return};
    if(zombies[i].hp<0){return};
    if (zombies[i].isAnimating) return; // 이미 움직이면 무시
    if(i>= zombieElements.length){return};
    zombies[i].isAnimating = true;

    // 현재 위치 가져오기
    const startPos = parseFloat(zombieElements[i].style.right) || 0;
    const targetPos = startPos - distance; // 이동 목표
    const duration = 200; // 이동 시간(ms)
    const startTime = performance.now();

    // 오른쪽으로 이동
    function moveRight(time) {
        if(zombies[i] ==null)return;
        const elapsed = time - startTime;
        if (elapsed < duration) {
            const progress = elapsed / duration; // 0 ~ 1
            const currentPos = startPos + (targetPos - startPos) * progress*5;
            zombieElements[i].style.right = currentPos + "px";
            requestAnimationFrame(moveRight);
        } else {
            zombieElements[i].style.right = targetPos + "px";
            // 원위치로 돌아오기 시작 (왕복)
            requestAnimationFrame(() => moveLeft(performance.now()));
        }
    }

    // 왼쪽으로 돌아오기
    function moveLeft(start) {
        if(zombies[i] ==null)return;
        const elapsed = performance.now() - start;
        const leftDuration = 200; // 돌아오는 시간
        if (elapsed < leftDuration) {
            const progress = elapsed / leftDuration;
            const currentPos = targetPos - (targetPos - startPos) * progress;
            zombieElements[i].style.right = currentPos + "px";
            requestAnimationFrame(() => moveLeft(start));
        } else {
            zombieElements[i].style.right = startPos + "px"; // 원위치 고정
            zombies[i].isAnimating = false;
        }
    }

    requestAnimationFrame(moveRight);
}

// 특정 좀비만 움직이도록
function ZombieStun(num) {
    moveZombie(num);
}
