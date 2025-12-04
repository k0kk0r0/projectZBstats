//명령 버튼
const pushBt = document.getElementById('pushBt');
const attackBt = document.getElementById('attackBt');
const restBt = document.getElementById('restBt');
const sleepBt = document.getElementById('sleepBt');

const bandingBt = document.getElementById('bandingBt');
const atHomeBt = document.getElementById('atHomeBt');
const nextMapBt = document.getElementById('nextMapBt');
const prevMapTxt = document.getElementById('prevMapTxt');
const nextMapTxt = document.getElementById('nextMapTxt');

//메뉴창
const menuBt = document.getElementById('menuBt');
const skillBt = document.getElementById('skillBt');
const storageBt = document.getElementById('storageBt');
const inventoryBt = document.getElementById('inventoryBt');


//무기 아이콘
const weaponIcon = document.getElementById('weaponIcon');
const weaponImg = document.getElementById('weaponImg');
const weaponName = document.getElementById('weaponName');
//가방 아이콘
const backpackIcon = document.getElementById(`backpackIcon`);
const backpackImg = document.getElementById(`backpackImg`);
const backpackName = document.getElementById('backpackName');

function commandBtsVisible(value){
    const commandBts = gameModal.querySelectorAll('.commandBT');
    for(let i = 0; i<commandBts.length;i++){
        commandBts[i].classList.toggle('hidden', !value);
    }
    closeMenuModal();
}

function renderSkill(){
  const skillList = document.getElementById("skillList");
  skillList.innerHTML = ""; // 초기화

  for (const [name, data] of Object.entries(skills)) {
    // XP 비율 계산
    const percent = data.maxXp > 0 ? (data.xp / data.maxXp) * 100 : 0;

    // 스킬 하나의 HTML 구성
    const skillItem = document.createElement("div");
    skillItem.className = "relative bg-gray-200 rounded h-8 overflow-hidden";

    skillItem.innerHTML = `
      <div class="h-full bg-yellow-400 transition-all duration-300" style="width: ${percent}%;"></div>
      <span class="absolute inset-0 flex justify-between items-center px-3 text-lg font-semibold text-black">
        <span>${translations[currentLang][name]??name} (Lv.${data.lv})</span>
        <span>${data.xp} / ${data.maxXp}</span>
      </span>
    `;

    skillList.appendChild(skillItem);
  }
}
const skillmodal = document.getElementById("skillModal")
 // 모달 바깥 클릭 시 닫기
skillmodal.addEventListener("click", (e) => {
    if (e.target === skillmodal) {
        skillmodal.classList.add("hidden");
    }
});
function openSkillModal(){
    renderSkill();
    skillmodal.classList.remove('hidden');
}
const menuModal = document.getElementById("menuModal");
function openMenuModal(){
    menuModal.classList.remove('hidden');
}
function closeMenuModal(){
    menuModal.classList.add('hidden');
}
menuModal.addEventListener("click", (e) => {
    if (e.target === menuModal) {
        closeMenuModal();
    }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//버튼함수
menuBt.addEventListener('click', () => {
    //메뉴 창 열기
    openMenuModal();
});

skillBt.addEventListener('click', ()=>{
    //스킬 창 열기
    openSkillModal();
    closeMenuModal();
});
storageBt.addEventListener('click', ()=>{
    //인벤토리와 보관함 창 열기
    openStorageModal();
    closeMenuModal();
});
inventoryBt.addEventListener('click', ()=>{
    //인벤토리 창 열기
    openStorageModal(false);
    closeMenuModal();
});


pushBt.addEventListener('click', () => {
    //캐릭터 밀치기(좀비 넘어트리기)
     if(gameOver)return;
    if(delaying) return; //딜레이 중이면 무시
    stopResting();
    if(!isAnimating){    
         if(equipments.weapon!=null){
            playerPush(parseInt(equipments.weapon.multiHit)+1); //무기 멀티타격보다 1명더 넘어트리기
        }else{
            //무기가 없는 경우
            playerPush(2);
        }
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
        if(equipments.weapon!=null){
            playerAttack(equipments.weapon.multiHit);  
        }else{
            //무기가 없는 경우
            playerAttack(1);
        }
          
    }
    
    playerMove();
    advanceTurn();
    callZombies(1);//좀비추가
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
     mapData[mapNum].zombieNum = zombies.length; //지금 맵의 좀비 수를 맵데이터에 저장
    stopResting();
    mapNum++;
    let rng = Math.random();
    if(mapNum==mapData.length-1){
        if(currentMapData.name =="road"){
            //현재 길거리에 있을 때에만
            if(rng<0.15){
                mapData.push( findMapData('store_tool'));
            }else if(rng<0.35){
                mapData.push( findMapData("livestock"));
            }else if(rng<0.7){
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
     advanceTurn();
     setTimeout(() => { 
        if(gameOver)return;
        mapSetting(mapData[mapNum]);
        delaying=false;
        renderGameUI();
        log(`${translations[currentLang][currentMapData.name]}으로 이동했다. - 진행도[${mapNum+1}/${mapData.length}]`);
     },timedelay);
    
    //TurnEnd();
    
    
})
atHomeBt.addEventListener('click', ()=>{
     if(gameOver)return;
    if(delaying)return;//딜레이 중이면 무시
    stopResting();
    //이전 맵 이동
    mapData[mapNum].zombieNum = zombies.length; //지금 맵의 좀비를 맵데이터에 저장

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
     advanceTurn();
     setTimeout(() => { 
        if(gameOver)return;
        mapSetting(mapData[mapNum]);
        delaying=false;
        renderGameUI();
        log(`${translations[currentLang][currentMapData.name]}으로 돌아왔다. - 진행도[${mapNum+1}/${mapData.length}]`);
     },timedelay);
    
    //TurnEnd();

})
//치료버튼
bandingBt.addEventListener('click', ()=>{
    if(gameOver)return;
    if(delaying) return; //딜레이 중이면 무시
    
    const itemIndex = getInventoryItemIndexType("bandage","subType");
    if(itemIndex<0){
        //아이템이 없음
        log(`붕대 혹은 찢어진 천이 없습니다.`,);
        return;
    }
    playerHealing(itemIndex);
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//아이템 선택 시 상세메뉴
const point= {x:0, y:0};
const itemSubOption = document.getElementById("itemSubOption");
const optionBoxes = document.getElementById("optionBoxes");
//스토리지
const storageModal = document.getElementById("storageModal");
const storage_player = document.getElementById("storage_player");
const storage_storage = document.getElementById("storage_storage");
const storage_weightTxt = document.getElementById("storage_weightTxt");
const inventory_weightTxt = document.getElementById("inventory_weightTxt");

const equipNames = ["weapon", "hat", "armor", "pants", "shoes", "accessory"];
const equipIcons = {};
equipNames.forEach(name => {
  equipIcons[name] = {
    icon: document.getElementById(`equipIcon_${name}`),
    nameTxt: document.getElementById(`equipName_${name}`),
    conditionBar : document.getElementById(`equipIcon_${name}_bar`)
  };
});
 // 모달 바깥 클릭 시 닫기
 /*
 //인벤토리
const inventoryModal = document.getElementById("inventoryModal");
const inventory_player = document.getElementById("inventory_player");

function openInventoryModal(){
    inventoryModal.classList.remove('hidden');
    renderInventoryModal();
}
function renderInventoryModal(){
    inventory_player.innerHTML = '';
    //storage_storage.innerHTML = '';
    for(let i =0;i<inventory.length; i++){
        addInventoryItem( inventory[i], inventory_player, i);
    }
    
}
    inventoryModal.addEventListener("click", (e) => {
    if (e.target === inventoryModal) {
        inventoryModal.classList.add("hidden");
    }
});
    */
function getInventoryItemType(type, typename="subType"){
    const item = inventory.find( (item) => item[typename]=== type );
    return item;
}
function getInventoryItemIndexType(type, typename="subType"){
    return inventory.findIndex( (item) => item[typename]=== type );
}
itemSubOption.addEventListener("pointerdown", (e) =>{
    if (e.target === itemSubOption) {
        closeSubOption();
    }
});
function findInventoryItem(route, index){
    //스토리지, 가방 등에서 아이템 찾기
    let item =null;
    if(route!=null){
        if(route == storage_player.id){
            item = inventory[index];
        }
        if(route == storage_storage.id){
            item = storage[storageIndex].inventory[index];
        }
    }
    return item;
}
function findInventoryItemData(itemname){
    for(let i = 0 ; i <inventory.length;i++){
        if(inventory[i].name == itemname){
            return inventory[i];
        }
    }
    return null;
}

function itemRatioColor(value, number = 0.5){
    return (value > number? "bg-green-400" : value > 0.25 ? "bg-yellow-200" : "bg-red-200");
}
function itemColor(subType){
    switch(subType.split(';')[0]){
        case "water":
            return "bg-cyan-300";

        case "bleach":
            return "bg-lime-200";
        
        case "taintedWater":
            return "bg-emerald-300";
    }
    return 
}


function setEquipment(data, dataset){
    for(let i =0 ;i < equipNames.length ;i++){
        const key = equipNames[i];
        if(data.type.toLowerCase() === key){
            
            //타입이 같은 경우
            if(equipments[key]!=null){
                inventory.push(equipments[key]);
                equipments[key]= null;
                
            }
            if(equipments[key]==null){
                equipments[key] = data;
                if(dataset.route == storage_player.id ){
                    inventory.splice(dataset.index,1);
                }else if(dataset.route == storage_storage.id ){
                    storage[storageIndex].inventory.splice(dataset.index,1);
                }
            }
            break;
        }
    }
    renderStorageModal();
}




