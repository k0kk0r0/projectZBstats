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
      <span class="absolute inset-0 flex justify-between items-center px-3 text-sm font-semibold text-black">
        <span>${translations[currentLang][name]} (Lv.${data.lv})</span>
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

//버튼함수
pushBt.addEventListener('click', () => {
    //캐릭터 밀치기(좀비 넘어트리기)
     if(gameOver)return;
    if(delaying) return; //딜레이 중이면 무시
    stopResting();
    if(!isAnimating){    
         if(weapon!=null){
            playerPush(parseInt(weapon.multiHit)+1); //무기 멀티타격보다 1명더 넘어트리기
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
        if(weapon!=null){
            playerAttack(weapon.multiHit);  
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
skillBt.addEventListener('click', ()=>{
    //스킬 창 열기
    openSkillModal();
});
nextMapBt.addEventListener('click',() =>{
     if(gameOver)return;
    if(delaying)return;//딜레이 중이면 무시
    //다음 맵 이동
    stopResting();
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
     advanceTurn();
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
    stopResting();
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
        log(`붕대 혹은 찢어진 천이 없습니다.`);
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

const equipNames = ["weapon", "hat", "armor", "pants", "shoes"];
const equipIcons = {};
equipNames.forEach(name => {
  equipIcons[name] = {
    icon: document.getElementById(`equipIcon_${name}`),
    nameTxt: document.getElementById(`equipName_${name}`)
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
function closeSubOption(){itemSubOption.classList.add("hidden");}
function itemsubMenu(data, dataset){
    itemSubOption.classList.remove("hidden");
    optionBoxes.style.left = `${point.x+20}px`;
    optionBoxes.style.top = `${point.y-40}px`;
    optionBoxes.innerHTML='';
    function makeBox(nameTxt){
        const box = document.createElement("button");
        box.className = "bg-gray-500 text-3xl p-2 rounded text-white";
        //box.id = `option${i}`;
        box.innerText = nameTxt;
        optionBoxes.appendChild(box);
        return box;
    }
    makeBox("아이템 정보").addEventListener('click', ()=>{
        //아이템 정보 호출
        showItemModal(data)
        closeSubOption();
    });

    if(dataset!=null){
        if(data.type =='Weapon'){
            makeBox("장착하기").addEventListener('click', ()=>{
                setEquipment(data, dataset);
                closeSubOption();
            });
        }  
        if(dataset.route == storage_player.id){
            //플레이어 가방에 있을 때

            if(data.subType =="bandage"){
                makeBox("붕대 감기").addEventListener('click', ()=>{
                    playerHealing(dataset.index);
                    closeSubOption();
                }); 
            }

            makeBox("보관함에 넣기").addEventListener('click', ()=>{
                itemMove(data, dataset);
                closeSubOption();
            }); 
        }
    }
}
document.addEventListener("pointerdown", (e) => {
    point.x = e.clientX;
    point.y = e.clientY;
});

storageModal.addEventListener("click", (e) => {
    if (e.target === storageModal) {
       closeStorageModal();
    }
});
function closeStorageModal(){
    storageModal.classList.add("hidden");
}
backpackIcon.addEventListener('click', openStorageModal);
document.getElementById('Icon_storage').addEventListener('click', openStorageModal);
function openStorageModal(){
    storageModal.classList.remove('hidden');
    renderStorageModal();
}
function renderStorageModal(){
    storage_player.innerHTML = '';
    storage_storage.innerHTML = '';
    let weight ={
       storage:0,
       inventory:0,
       bagWeight:playerStat().bagWeight
    }
    for(let i =0;i<inventory.length; i++){
        addInventoryItem( inventory[i], storage_player, i);
        weight.inventory+= parseFloat(inventory[i].weight);
    }
    for(let i =0;i<currentMapData.dropItems.length; i++){
        addInventoryItem( currentMapData.dropItems[i], storage_storage, i);
        weight.storage+= parseFloat(currentMapData.dropItems[i].weight);
    }
    //무게 더하기
    if(weapon!=null){ weight.inventory+= parseFloat(weapon.weight)*0.3}
    
    storage_weightTxt.innerText = `${weight.storage.toFixed(1)}/50`;
    inventory_weightTxt.innerText = `${weight.inventory.toFixed(1)}/${weight.bagWeight}`;
    renderEquipment();
}
function addInventoryItem(data , route, index){
    //
    const div = document.createElement('div');
    div.id = `item_${data}`;
    div.className = "relative w-24 lg:w-16 h-24 lg:h-16 bg-white rounded aspect-square";
    div.dataset.data = JSON.stringify(data);
    div.dataset.route = route.id;
    div.dataset.index = index;

    const img = document.createElement('img');
    img.src = data.path;
    img.className = "w-full h-full object-contain p-2";
    div.appendChild(img);
    
    const namespan = document.createElement('span');
    namespan.className = "absolute bottom-0 left-0 right-0 text-md text-white bg-black/80 text-center rounded-b z-50";
    namespan.innerText = translations[currentLang][data.name];
    div.appendChild(namespan);

    //div.addEventListener('click', itemMove);
    div.addEventListener('pointerdown', itemMove_mouseDown);
    div.addEventListener('pointerup', itemMove_mouseUp);
    route.appendChild(div);
}
let mousedown = false;
let equipBool =false;
let equipSetTimeout;
function itemMove_mouseDown(e){
    if(mousedown==false){
        mousedown =true;
         const dataset = e.currentTarget.dataset;
        const data = JSON.parse( dataset.data);
        equipBool=false;
        //if(dataset.route == storage_player.id){
            equipSetTimeout = setTimeout(() => {

                equipBool = true;
                equipSetTimeout = null;
                
                //setEquipment(data,dataset);
                itemsubMenu(data, dataset);
            }, 250); // 0.25초 누르면 장비
        //}
    }    
}
function itemMove_mouseUp(e){
    if(mousedown){
        mousedown=false;
        clearInterval(equipSetTimeout);
        const dataset = e.currentTarget.dataset;
        const data = JSON.parse( dataset.data);
        if(equipBool ){
            //200ms 이상 장기 터치일 때 
            equipBool=false;
            return;
        }else{
            //짧은 터치
           itemMove(data, dataset);
        }
        equipBool=false;
    }else{
        return;
    }
}
function itemMove(data, dataset){
     if(dataset.route == storage_player.id){
        //가방으로 이동
        currentMapData.dropItems.push( data);
        inventory.splice(dataset.index,1);
        renderStorageModal();
    }
    else if(dataset.route == storage_storage.id ){
        //인벤으로 이동
        inventory.push( data);
        currentMapData.dropItems.splice(dataset.index,1);
        renderStorageModal();
    }
}
function setEquipment(data, dataset){
    if(data.type =='Weapon'){
        //무기인 경우
        if(weapon!=null){
            inventory.push(weapon);
            weapon = null;

        }
        if(weapon==null){
            weapon = data;
            if(dataset.route == storage_player.id ){
                inventory.splice(dataset.index,1);
            }else{
                currentMapData.dropItems.splice(dataset.index,1);
            }
            
        }
    }
    renderStorageModal();
}
//////////////////장비창 정보 표시
function itemEquip_mouseDown(e){
    const id = e.currentTarget.id;
    let data = null;
    if(id == equipIcons.weapon.icon.id){
        data = weapon;
    }

    if(mousedown==false){
        mousedown =true;
        equipBool=false;
        //if(dataset.route == storage_player.id){
            equipSetTimeout = setTimeout(() => {

                equipBool = true;
                equipSetTimeout = null;
                
                //setEquipment(data,dataset);
                itemsubMenu(data, null);
            }, 250); // 0.25초 누르면 장비
        //}
    }    
}
function itemEquip_mouseUp(e){
    const id = e.currentTarget.id;
    if(mousedown){
        mousedown=false;
        clearInterval(equipSetTimeout);
        if(equipBool ){
            //200ms 이상 장기 터치일 때 
            equipBool=false;
            return;
        }else{
            //짧은 터치
            if(id == equipIcons.weapon.icon.id){
                inventory.push(weapon);
                weapon = null;
            
            }
            renderStorageModal();
        }
        equipBool=false;
    }else{
        return;
    }
}
/*
equipIcons.weapon.icon.addEventListener('click', ()=>{
    if(weapon!=null){
        inventory.push(weapon);
        weapon = null;
        renderStorageModal();
    }
});
*/
equipIcons.weapon.icon.addEventListener('pointerdown', itemEquip_mouseDown);
equipIcons.weapon.icon.addEventListener('pointerup', itemEquip_mouseUp);


function renderEquipment(){

    //플레이어가 들고있는 무기 랜더링
    if(weapon!=null){
        
        equipWp.src = weapon.path;
        equipWp.classList.remove("rotate-90", 'rotate-180',"-rotate-90");
        if(weapon.rotate>0){ 
            if(weapon.rotate<=180){
                equipWp.classList.add('rotate-'+weapon.rotate); 
            }else{
                equipWp.classList.add('-rotate-'+(weapon.rotate-180)); 
            }
            
        }
        weaponImg.src = weapon.path;
        weaponName.textContent = translations[currentLang][weapon.name];

        //storageModal 안의 장비창
        equipIcons.weapon.icon.src = weapon.path;
         equipIcons.weapon.nameTxt.innerText =  translations[currentLang][weapon.name];
    }
    if(weapon == null){
        equipWp.src = 'icons/default.png';
        weaponImg.src = 'icons/default.png';
        weaponName.textContent ='';

        equipIcons.weapon.icon.src = 'icons/default.png';
        equipIcons.weapon.nameTxt.innerText='⚔무기';
    }
    
}
//
 // 모달 요소
  const itemModal = document.getElementById('itemModal');
  //const itemModalClose = document.getElementById('itemModalClose');
  //const itemModalClose2 = document.getElementById('itemModalClose2');

  // 필드 참조
  const itemModalImgTag = document.getElementById('itemModalImgTag');
  const itemName = document.getElementById('itemName');
  const itemType = document.getElementById('itemType');
  const field_type = document.getElementById('field-type');
  const field_subType = document.getElementById('field-subType');
  const field_multiHit = document.getElementById('field-multiHit');
  const field_stamina = document.getElementById('field-stamina');
  const field_damage = document.getElementById('field-damage');
  const field_weight = document.getElementById('field-weight');
  const field_conditionText = document.getElementById('field-conditionText');
  const field_conditionBar = document.getElementById('field-conditionBar');
  const field_conditionLowerChance = document.getElementById('field-conditionLowerChance');

  function showItemModal(item) {
    // item: { name,type,subType,multiHit,condition,conditionLowerChance,stamina,damage,weight, path? }
    itemName.textContent = translations[currentLang][item.name] ?? 'Unknown';
    itemType.textContent = `${item.type ?? '-'} / ${item.subType ?? '-'}`;
    field_type.textContent = item.type ?? '-';
    field_subType.textContent = item.subType ?? '-';
    field_multiHit.textContent = (item.multiHit ?? '-') + '';
    field_stamina.textContent = (item.stamina ?? '-') + '';
    field_damage.textContent = (item.damage ?? '-') + '';
    field_weight.textContent = (item.weight ?? '-') + '';

    // condition (숫자 가정: 0..100)
    const cond = (typeof item.condition === 'number') ? item.condition : parseFloat(item.condition) || 0;
    const cond0 = (typeof item.condition === 'number') ? item.maxCondition : parseFloat(item.maxCondition) || 0;
    const pct = Math.ceil(cond/cond0*100);
    field_conditionText.textContent = `${cond}/${cond0} (${pct}%)`;
    field_conditionBar.style.width = pct + '%';
    // lossChance = 1 / (ConditionLowerChanceOneIn + floor(  floor(    MaintenanceLevel + (WeaponLevel/2)   )/2    )*2)
    
    field_conditionLowerChance.textContent = (`1 / (${item.conditionLowerChance} + (물건관리 +(무기레벨/2) )` ?? '-') + '';

    // 이미지 (선택적)
    if (item.path) {
      itemModalImgTag.src = item.path;
      itemModalImgTag.classList.remove('hidden');
    } else {
      itemModalImgTag.src = '';
      itemModalImgTag.classList.add('hidden');
    }

    // 보이기
    itemModal.classList.remove('hidden');
    // optional: focus for accessibility
    itemModal.querySelector('button')?.focus();
  }

  function hideItemModal() {
    itemModal.classList.add('hidden');
  }

  // 닫기 버튼 바인딩
  //itemModalClose.addEventListener('click', hideItemModal);
  //itemModalClose2.addEventListener('click', hideItemModal);
  // 배경 클릭으로 닫기 (모달 외부)
  itemModal.addEventListener('pointerdown', (e) => {
    if (e.target === itemModal) hideItemModal();
  });

  // 예시: 사용법
  // const sampleItem = { name:'빗자루', type:'Tool', subType:'Blunt', multiHit:1, condition:72, conditionLowerChance:0.2, stamina:6, damage:4, weight:2, path:'images/Pushbroom.png' };
  // showItemModal(sampleItem);