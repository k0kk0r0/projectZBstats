

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
const playerStatBt = document.getElementById("playerStatBt");
const craftBt = document.getElementById("craftBt");
const storageBt = document.getElementById('storageBt');
const inventoryBt = document.getElementById('inventoryBt');
const skillBt = document.getElementById('skillBt');

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
///////////////////////////////////////////////////////////////////
function windowRatio(){
    if(window.innerWidth/window.innerHeight<0.65){
        return 'phone'
    }else if(window.innerWidth/window.innerHeight<0.9){
        return 'tablet'
    }else{
        return 'desktop'  
    }
}
//////////////////////////////////////////////////////////////////
//하단 턴 넘김
const turnModal = document.getElementById("turnModal");
const Bt_stop = document.getElementById("Bt_stop");
const Bt_turn = document.getElementById("Bt_turn");
Bt_stop.addEventListener('click', ()=>{
    stopResting();
});
Bt_turn.addEventListener('click', ()=>{
    advanceTurn();
});
function turnPanelVisible(value=false){
    if(gameOver){return}
    turnModal.classList.toggle('hidden', !value);
}
/////////////////////// 시설물 관리 ////////////////////////////////
//장소의 상단 설비 아이콘들
const facilityNames = ["generator", "gaspump","bed","sofa", "radio","rainCollectorBarrel", "faucet","fridge","oven", "micro","storage","livestock","waterSource"];
const facilityIcons = facilityNames.map(name =>{
    const icon = document.getElementById(`Icon_${name}`);

    icon.addEventListener('click', (e)=>{
        //상부 시설물 아이콘 버튼
        //console.log(name);
        closeMenuModal();
        switch (name){
            case "storage":
                storageVisible=true;
                openStorageModal();
            break;
            default:
                //나머지 항목들은 서브메뉴 호출
                facilitySubMenu(name);
            break;
        }

    });
    return {
        name: name,
        icon: icon,
        img: document.getElementById(`Img_${name}`), 
        enabledIcon: document.getElementById(`Enable_${name}`),
    }
 });
 function getLight(){
    let light;
    if(currentMapData.outdoor){
        //실외의 경우
        if( hour>=8 && hour < 20 ){
            //낮 시간대
            light = true;
        }else{
            light =false;
        }
    }else{
        //실내의 경우
        
        if( getPower()){
            //발전기가 켜져 있으면
            light = true;
        }else{
            if( hour>=8 && hour < 20 ){
                //낮 시간대
                light = true;
            }else{
                //밤 시간대
                light = false;
            }
        }
    }
    return light;
 }
 function getPower(){
    let power =false;
    
    if(powerEndTurn>0){
       power =true;
    }else{
        //맵데이터에서 활성화 된 발전기 찾기
        for(let m = mapNum-1; m<= mapNum+1; m++){
            const generator = mapData[m].thisFacilities.find(n => n.name=='generator');
            if(generator!=null){
                if(generator.enabled){
                    //발전기가 활성화 되어있는 경우
                    power = true;
                    //console.log(`${m}번째 맵 ${generator} 가동 중`);
                    break;
                }
            }
            
        }
    }
    return power;
 }
//상단설비 호출 함수
function getFacility(name){
    return currentMapData.thisFacilities.find(n => n.name==name);
}
function getFacilityIcon(name) {
    return facilityIcons.find(m => m.name == name);
}
function getFacilityEnable(name){
    const facility = getFacility(name);
    if(facility==null){return false}
    return facility.enabled;
}
function setFacilityEnable(name, value){
    const icon = getFacility(name);
    icon.enabled = value;
    renderFacilityIcons();
}
function addFacility(facilItem, item=null){
    if(currentMapData.thisFacilities.find(n => n.name==facilItem.name)!=null){
        log_popup(`이미 설치한 시설입니다`);
        return;
    }


    if(facilItem.needItem=='water'){
        if(waterEndTurn>0){
            //물이 끊기지 않은 경우
            facilItem.item.condition = facilItem.item.maxCondition;
        }else{
            //아무것도 없는 경우
            facilItem.item.condition = 0;
        }
    }
    if(facilItem.needItem=='battery' || facilItem.needItem=='gasoline'){
        facilItem.item.condition = parseInt(item.condition);
    }
    if(facilItem.item.condition<=0){
        facilItem.enabled=false;
    }
    
    currentMapData.thisFacilities.push(facilItem);
    if(facilItem.addStorage){
        addStorageList( facilItem.name, [] );
    }
    log_popup(`${translating(facilItem.name)}를 설치했습니다.`);
}
function removeFacility(name){
    //시설에 포함된 보관함이 있으면?
    for(let i =0 ; i < storage.length; i++){
        if(storage[i].name == name){
            //스토리지에 딸린 인벤토리이면
            const itemlist = storage[i].inventory;
           // console.log(`보관함 ${name}} 삭제 - ${itemlist.length}개 이동`);
            for(let n = 0; n< itemlist.length; n++){
                storage[0].inventory.push( itemlist[n]);
            }
            storage.splice(i,1);
            break;
        }
    }


    //시설을 제거하고 인벤토리에 아이템 넣기
    let item =getFacility(name).item ;
    if(item.subType=='water'){
         item.condition=0;
    }
   
    item.type ='Furniture';
    inventory.push(item );
    for(let i =0 ; i < currentMapData.thisFacilities.length; i++){
        if(currentMapData.thisFacilities[i].name == name){
            currentMapData.thisFacilities.splice(i,1);
            break;
        }
    }
    log_popup(`${translating(item.name)}를 떼어냈습니다.`);
    renderFacilityIcons();
}
function renderFacilityIcons(){
    let power = getPower();
    let water = false;
    if(waterEndTurn>0){
        water =true;
    }

    for(let i=0; i<facilityNames.length; i++){
        const facilityIcon= getFacilityIcon( facilityNames[i] );
        facilityIcon.icon.classList.add('hidden');

        
    }
    for(let i =0 ; i < currentMapData.thisFacilities.length; i++){
        const facildata = currentMapData.thisFacilities[i];
        const facilityIcon = getFacilityIcon( facildata.name);
        //console.log(facildata);
        
        if(facildata.needItem=='power'){
            if(power==false){
                facildata.enabled = power;
                //console.log( facildata.name, power);
            }
            if(facildata.removable==false){
                //붙박이 시설물의 경우 무조건 켜지기
                facildata.enabled= power;
            }
        }
        if(facildata.needItem=='water'){
            if(waterEndTurn>0){
            //물이 끊기지 않은 경우
                facildata.item.condition = facildata.item.maxCondition;
            }else if(getFacilityEnable("rainCollectorBarrel")){
                //빗물받이통이 있는 경우
                let rainCollectorBarrel = getFacility("rainCollectorBarrel").item;
                while (true){
                    if(facildata.item.condition>=facildata.item.maxCondition){
                        break;
                    }
                    if(rainCollectorBarrel.condition<=0){
                        break;
                    }
                    facildata.item.condition++;
                    rainCollectorBarrel.condition--;
                // console.log(data.condition, matrial.condition);
                }
            }else{
                //아무것도 없는 경우
                //facildata.item.condition = 0;
            }
        }
        //실사 아이템으로 변경 표시
        /*
        if(facildata.item !=null){
            if(facildata.item.path == "Base/default.png"){
                facilityIcon.img.src = facildata.defalutPath;
            }else{
                facilityIcon.img.src = facildata.item.path;
            }
        }
            */
        facilityIcon.icon.classList.remove('hidden');
        facilityIcon.enabledIcon.classList.toggle('hidden', facildata.enabled);
       
        
    }
}


////////////////////////////////////////////////////////////////////

function renderSkill(){
  const skillList = document.getElementById("skillList");
  skillList.innerHTML = ""; // 초기화

  for (const [name, data] of Object.entries(skills)) {
        // XP 비율 계산
        const percent = data.maxXp > 0 ? (data.xp / data.maxXp) * 100 : 0;

        // 스킬 하나의 HTML 구성
        const item = document.createElement("div");
        item.className = "relative bg-gray-200 rounded h-8 overflow-hidden";

        item.innerHTML = `
        <div class="h-full bg-yellow-400 transition-all duration-300" style="width: ${percent}%;"></div>
        <span class="absolute inset-0 flex justify-between items-center px-3 text-lg font-semibold text-black">
            <span>${translating(name)} (Lv.${data.lv})</span>
            <span>${data.xp} / ${data.maxXp}</span>
        </span>
        `;

        skillList.appendChild(item);
  }
}
///////////////////////////////////////////////////////////////////////////////////////////
function renderCraftModal(){
    //제작 레시피 창 
    const recipeList = document.getElementById("recipeList");
    recipeList.innerHTML='';
    function makeBox(data, size=100, color='bg-gray-200'){
        // HTML 구성 아이템
        
        
        const originalItemList =[];
        const convertItemList = [];
        let origin='';
        for(let n =0; n < data.original.length; n++){
           
            const item =findItem(data.original[n].name);
            item.amount = data.original[n].amount;
            if(item!=null){
                originalItemList.push( item );
                origin +=
                    `<img class="w-8 h-8" src=${item.path}>
                    <span>x${item.amount}</span>
                  `;
                  //  <span>${translating(item.name)}</span>
            }
        }

        let result='';
        for(let n =0; n < data.convert.length; n++){
           
            const item =findItem(data.convert[n].name);
            item.amount = data.convert[n].amount;
            if(item!=null){
                convertItemList.push( item );
                result +=
                    `<img class="w-8 h-8" src=${item.path}>
                    <span>x${item.amount}</span>
                    <span>${translating(item.name)}</span>
                    `;
            }
        }
        
        let needItemIcon=`<img class="w-8 h-8" src="icons/default.png">`;
        if(data.needItem.length>0){
            const needItem = findItem(data.needItem);
            needItemIcon =`<img class="w-8 h-8" src=${needItem.path}>`;
        }
        
        const item = document.createElement("div");
        item.className = "relative bg-gray-200 rounded h-10 overflow-hidden";

        item.innerHTML = `
        <div class="progressBar h-full bg-green-500 duration-100" style="width: ${0}%;"></div>
        <span class="absolute inset-0 grid grid-cols-[2fr_1fr_3fr] justify-between items-center px-3 text-lg font-semibold text-black">
         
            <div class="items-center flex gap-2 ">
                ${origin}
                
            </div>
            <div class="justify-center flex">
            ${needItemIcon}
                <span>➡</span>
            </div>
            <div class="items-center flex gap-2 ">
                ${result}
            </div>
        </span>
        `;
        
        item.addEventListener('click',()=>{
            //originalItemList, convertItemList
             let progress=0;
             const pgbar = item.querySelector(".progressBar");
             let matrials = [];
            if(makeInterval==null){
                matrials=[];
                
                for(let i =0 ; i< originalItemList.length; i++){
                    const needItem = originalItemList[i];
                    let num = 0;
                    for(let n = 0; n< inventory.length; n++){
                        if(inventory[n].name == needItem.name){
                            if(num < needItem.amount){
                                if(inventory[n].condition>0){
                                    if(inventory[n].condition - needItem.amount>=0){
                                        //필요 아이템 하나의 양이 사용량 만큼 있는 아이템의 경우
                                        matrials.push(inventory[n]);
                                        num = needItem.amount;
                                        break;
                                    }else{

                                    }
                                }else{
                                    //필요 아이템 하나씩 추가
                                    matrials.push(inventory[n]);
                                    num++;
                                }
                            }
                            
                            
                        }
                    }
                    
                    if(num == needItem.amount){
                        //console.log(`${needItem.name} : ${matrials.lenght}`);
                    }else{
                        log_popup(`${translating(needItem.name)} 아이템이 ${needItem.amount-num}개 만큼 부족합니다`);
                        if(!debug) return;
                        //return;
                    }
                    
                }
                



                if(data.needItem.length>0){
                    if(findInventoryItemData(data.needItem)==null){
                        log_popup(`${translating(data.needItem)} 도구가 없습니다`);
                        if(!debug)return;
                    }
                }
                
                
                makeInterval = setInterval(()=>{
                    progress+=4;
                    //console.log(progress);
                    pgbar.classList.remove('hidden');
                    pgbar.style.width = `${progress}%`;
                    if(progress>=140){
                        make();
                        pgbar.classList.add('hidden');
                        pgbar.style.width = `0%`;
                        clearInterval(makeInterval);
                        makeInterval =null;
                    }
                },50);
                function make(){
                   
                    for(let i =0 ; i< originalItemList.length; i++){
                        const needItem = originalItemList[i];
                        for(let n =0 ;n<matrials.length;n++){
                           // console.log(matrials[n]);
                            if(needItem.name == matrials[n].name){
                                if( matrials[n].condition- needItem.amount >= 0 ){
                                    matrials[n].condition -= needItem.amount;
                                    if(matrials[n].condition<=0){
                                        matrials[n].subType='matrial';
                                    }
                                }else{
                                    
                                    matrials[n].subType='matrial';
                                    matrials[n].condition=0;
                                }
                            }         
                        }
                    }
                    
                    //아이템 추가하기
                    for(let n=0; n<convertItemList.length;n++){
                        let num = 0;
                        while (true){
                            num++;
                            pushItemToInventory(inventory,convertItemList[n].name);
                            if(num>=convertItemList[n].amount ){
                                break;
                            }
                        }
                        
                        
                    }
                    removeMatrialItem();
                    renderStorageModal();
                    advanceTurn(); 
                    log(`제작이 완료되었습니다`, true);
                }
            }else{
                pgbar.style.width = `0%`;
                clearInterval(makeInterval);
                makeInterval =null;
            }
            
            
        });
        recipeList.appendChild(item);
    }
    for(let n = 0 ; n <recipes.length; n++){
        const data=findRecipes(recipes[n].name);
       // console.log(data);
        if(data.visible){
            makeBox(data);
        }
        
    }
}
///////////////////////////////////////////////////////////////////////////////////////////
function renderPlayerStat(){
    //플레이어 스텟 표시
    const statList = document.getElementById("statList");
    statList.innerHTML='';//초기화

    makeBox(translating('hungry'),`${stat.hunger.toFixed(0)}/100`, stat.hunger, itemColor("food"));
    makeBox(translating('thirsty'),`${stat.thirst.toFixed(0)}/100`,stat.thirst, itemColor("water"));

    makeStat("Stressed", stat.stressed, "bg-red-300");
    makeStat("Sick", stat.sick, "bg-green-200");
    //makeStat("fatique", stat.Fatique, "bg-slate-400");

    for(let i =0 ;i <wound.length; i++){
        const data = wound[i];
        const percent = data.turn > 0 ? (data.turn / data.turn0) * 100 : 0;
        //wound.push({tag:"zombie", heal:-1, turn:(100+healer*4) , turn0:(100+healer*4)}); 
        makeBox( `${translating(data.tag)} ${data.heal>0?'(치료 중)':''}`,
            `${data.turn} / ${data.turn0}`, percent, (data.heal>0)?"bg-green-300":"bg-pink-300");
    }
    function makeStat(name ,stat, color){
        if(stat>0){
            makeBox(translating(name),`${stat.toFixed(0)}/100`,stat, color);
        }
        
    }
    function makeBox(name, subName, size, color='bg-yellow-400'){
        // HTML 구성 아이템
        const item = document.createElement("div");
        item.className = "relative bg-gray-200 rounded h-8 overflow-hidden";

        item.innerHTML = `
        <div class="h-full ${color} transition-all duration-300" style="width: ${size}%;"></div>
        <span class="absolute inset-0 flex justify-between items-center px-3 text-lg font-semibold text-black">
            <span>${name}</span>
            <span>${subName}</span>
        </span>
        `;

        statList.appendChild(item);
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

const playerStatModal = document.getElementById("playerStatModal");
playerStatModal.addEventListener("click", (e) => {
    if (e.target === playerStatModal) {
        playerStatModal.classList.add("hidden");
        turnPanelVisible(false);
    }
});
function openPlayerStatModal(){
    renderPlayerStat();
    turnPanelVisible(true);
    playerStatModal.classList.remove('hidden');
}
let makeInterval =null;
const craftModal = document.getElementById("craftModal");
craftModal.addEventListener("click", (e) => {
    if (e.target === craftModal) {
        craftModal.classList.add("hidden");
        if(makeInterval!=null){
            clearInterval(makeInterval);
            makeInterval =null;
        }
    }
});
function openCraftModal(){
    renderCraftModal();
    craftModal.classList.remove('hidden');
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//버튼함수
menuBt.addEventListener('click', () => {
    //메뉴 창 열기
    if(delaying)return;//딜레이 중이면 무시
    openMenuModal();
});
playerStatBt.addEventListener('click', ()=>{
    //플레이어 스텟 창 열기
    if(delaying)return;//딜레이 중이면 무시
    openPlayerStatModal();
    closeMenuModal();
});
skillBt.addEventListener('click', ()=>{
    //스킬 창 열기
    if(delaying)return;//딜레이 중이면 무시
    openSkillModal();
    closeMenuModal();
});
storageBt.addEventListener('click', ()=>{
    //인벤토리와 보관함 창 열기
    if(delaying)return;//딜레이 중이면 무시
    storageVisible=true;
    openStorageModal();
    closeMenuModal();
});
inventoryBt.addEventListener('click', ()=>{
    //인벤토리 창 열기
    if(delaying)return;//딜레이 중이면 무시
    storageVisible=false;
    openStorageModal();
    closeMenuModal();
});
craftBt.addEventListener('click', ()=>{
    //제작 창 열기
    if(delaying)return;//딜레이 중이면 무시
    openCraftModal();
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
    startResting();
});
nextMapBt.addEventListener('click',() =>{
     if(gameOver)return;
    if(delaying)return;//딜레이 중이면 무시
    //다음 맵 이동
     mapData[mapNum].zombieNum = zombies.length; //지금 맵의 좀비 수를 맵데이터에 저장
    stopResting();
    mapNum++;
    
    if(mapNum==mapData.length-1){
        const items = randomMapData();
        for(let n =0; n< items.length; n++){
            mapData.push(items[n]);  
        }
           
    }else{
       
    }

    delaying=true;
    let timedelay = 200;
    const runRng =Math.random();
    if( runRng > playerStat().fitness*0.1){
        //플레이어 체력
        if(zombies.length>0){
            timedelay = 900;
            
        }
        advanceTurn();
    }else{
        if(zombies.length>0){
            log(`${((1-runRng)*100).toFixed(1)}% 확률로 도망치기 성공`);
        }
    }
    playerMove();
     

     setTimeout(() => { 
        if(gameOver)return;
        mapSetting(mapData[mapNum]);
        delaying=false;
        renderGameUI();
        log(`${translating(currentMapData.name)}으로 이동했다. - 진행도[${mapNum+1}/${mapData.length}]`);
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
    if(mapNum == 0){
        const items = randomMapData();
        for(let n =0; n< items.length; n++){
           // mapData.push(items[n]); 
            mapData.splice(0,0,items[n]);   
            mapNum++;   
        }
        
    }else{
       
    }
    

    delaying=true;
    let timedelay = 200;
    const runRng =Math.random();
    if( runRng > playerStat().fitness*0.1){
        //플레이어 체력
        if(zombies.length>0){
            timedelay = 900;
            
        }
        advanceTurn();
    }else{
        if(zombies.length>0){
          log(`${((1-runRng)*100).toFixed(1)}% 확률로 도망치기 성공`);
        }
    }
    playerMove();

     setTimeout(() => { 
        if(gameOver)return;
        mapSetting(mapData[mapNum]);
        delaying=false;
        renderGameUI();
        log(`${translating(currentMapData.name)}으로 이동했다. - 진행도[${mapNum+1}/${mapData.length}]`);
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
        log_popup(`붕대 혹은 찢어진 천이 없습니다.`);
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
    for(let i = 0 ; i <inventory.length;i++){
        if(inventory[i].subType == itemname){
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
        case "food":
            return "bg-green-300";
        case "water":
            return "bg-cyan-300";
        case "bleach":
            return "bg-lime-200";
        case "taintedWater":
            return "bg-emerald-300";
        case "gasoline":
            return "bg-amber-500";
        case "milk":
            return "bg-neutral-300";
    }
    return 
}

function unequip(key){
     //짧은 터치, 장비해제
    const data =equipments[key];
    if(data!=null){
       // console.log(storageTurn);
       storageTurn++;
        inventory.push( data );
        equipments[key] = null;
    }
    renderStorageModal();
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
                storageTurn++;
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




