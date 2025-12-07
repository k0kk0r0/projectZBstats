
let mousedown = false;
let equipBool =false;
let equipSetTimeout;
let storageIndex =0; //현재 열려있는 보관함 인덱스
let storageTurn =0;
let storageVisible =true;
const maxStorageTurn = 5;
const equipIconBoxes = storageModal.querySelectorAll(".equipiconbox");
const storagePn = document.getElementById("storagePn");
const storagePnFrame = document.getElementById("storagePnFrame");
const fieldInventoryBar = document.getElementById("field-inventoryBar");
const inventoryTurnTxt = document.getElementById("inventoryTurnTxt");

const storageTag = document.getElementById('storageTag');
function addStorageTag(name, index, turn=-1){
    //<button class="text-xl font-bold p-2 border rounded bg-blue-400">📦보관함</button>
    //<button class="text-xl font-bold p-2 border rounded bg-slate-400">⚰시체</button>
    let icon ='';
    switch(name){
        case 'ground':
            icon ='🌐';
            break;
        case 'storage':
            icon ='📦';
            break;
        case 'corpse':
            icon ='⚰';
            break;
        default:
            icon ='📦';
    }
    const btn = document.createElement('button');
    btn.className = "text-xl font-bold p-2 border rounded bg-blue-400 storageBtn";
    btn.innerText = `${icon}${translations[currentLang][name]??name}${turn>0? "("+turn+")":``}`;
    btn.dataset.index = index;
    btn.addEventListener('click', ()=>{
        storageIndex = btn.dataset.index;
        renderStorageModal();
    });
    storageTag.appendChild(btn);
}

function addStorageList(name, items, turnLimit=-1){
    storage.push( {name:name, inventory:items, turn:turnLimit} );
    renderStorageModal();
}

backpackIcon.addEventListener('click', openStorageModal);
document.getElementById('Icon_storage').addEventListener('click', openStorageModal);

Object.entries(equipIcons).forEach(([key]) => {
    const target = equipIcons[key];
    target.icon.addEventListener('pointerdown', itemEquip_mouseDown);
    target.icon.addEventListener('pointerup', itemEquip_mouseUp);
});
/////////

function openStorageModal(bool){
    if(gameOver)return
    storageModal.classList.remove('hidden');
    renderStorageModal(bool);
}
function closeStorageModal(){
    closeSubOption();
    storageModal.classList.add("hidden");
}
storageModal.addEventListener("click", (e) => {
    if (e.target === storageModal) {
       closeStorageModal();
    }
});
function renderStorageTurn(){
    //아이템 신선도 감소
    for(let i =0 ; i< inventory.length ; i++){
       itemRotten(inventory[i]);
    }
    //시체 보관함 턴 감소
    for(let j =0; j< mapData.length; j++){
        const storage = mapData[j].storages;
        for(let i = 0; i< storage.length; i++){
            if(storage[i].turn>0){
                storage[i].turn--;
                if(storage[i].turn<=0){
                    //시체 사라짐
                    //log(`${translations[currentLang][storage[i].name]}의 보관 기간이 만료되어 내용물이 사라졌습니다.`, true);
                    storage.splice(i,1);
                    i--;
                }
            }
        }
    }
  
    renderStorageModal();
}
function itemRotten(item){
    if(item.subType=="food"){
        if(item.condition>0){
            item.condition--;
            if(item.condition<=0){
                item.freshDays =null;
                item.rottenDays = null;
                //item.condition = null;
                //item.maxCondition = null;
                item.path = item.path.replace("Open","").replace("Cooked","").replace("Overdone","").replace(".png", "Rotten.png");
                //console.log(item.path);
            /* if(item.path.endsWith("Open.png")){
                        
                }else{
                    //통조림이 아닌 다른 음식들
                    
                }*/
            }
        }
    }
}

function renderStorageModal(){
    closeSubOption();
    removeMatrialItem();

    //턴넘김 바
    fieldInventoryBar.style.width = `${storageTurn/maxStorageTurn*100}%`;
    inventoryTurnTxt.innerText =`다음 턴까지 ${maxStorageTurn-storageTurn}회 남음`
    if(storageTurn>=maxStorageTurn){
        advanceTurn();
    }
    storage_player.innerHTML = '';
    storage_storage.innerHTML = '';
    storageTag.innerHTML ='';

    storagePn.classList.toggle(`hidden`, !storageVisible);
    if(storageVisible){
        storagePnFrame.classList.remove('grid-cols-1','grid-rows-1');
        storagePnFrame.classList.add('lg:grid-cols-2','sm:grid-cols-1','lg:grid-rows-1','sm:grid-rows-2');
        
    }else{
        storagePnFrame.classList.remove('lg:grid-cols-2','sm:grid-cols-1','lg:grid-rows-1','sm:grid-rows-2');
        storagePnFrame.classList.add('grid-cols-1','grid-rows-1');
    }
    
    for(let i =0; i< storage.length; i++){
        addStorageTag( storage[i].name , i, storage[i].turn );
    }

    //스토리지 인덱스선택
    storageTag.querySelectorAll('.storageBtn').forEach( (btn) => {
        if(btn.dataset.index == storageIndex){
            btn.classList.remove('bg-slate-400');
            btn.classList.add('bg-blue-400');
        }else{
            btn.classList.remove('bg-blue-400');
            btn.classList.add('bg-slate-400');
        }
    });
    const playerstat = playerStat() ?? {bagWeight:20};
    let weight ={
       storage:0,
       inventory:0,
       bagWeight:playerstat.bagWeight
    }

    let boxSize='';
    let fontSize ='';
    ///////////////가변 크기
   // console.log(window.innerWidth/window.innerHeight);
    if(window.innerWidth/window.innerHeight<0.65){
        boxSize = `w-28 h-28`;
        fontSize='text-2xl';
        storage_storage.className ="p-2 overflow-y-auto grid gap-2 grid-cols-[repeat(auto-fill,minmax(128px,0fr))]";
        storage_player.className ="p-2 overflow-y-auto grid gap-2 grid-cols-[repeat(auto-fill,minmax(128px,0fr))]";  
    }else if(window.innerWidth/window.innerHeight<0.9){
        boxSize = `w-24 h-24`;
        fontSize='text-lg';
        storage_storage.className ="p-2 overflow-y-auto grid gap-2 grid-cols-[repeat(auto-fill,minmax(96px,0fr))]";
        storage_player.className ="p-2 overflow-y-auto grid gap-2 grid-cols-[repeat(auto-fill,minmax(96px,0fr))]";  
    }else{
        boxSize='w-16 h-16';
        fontSize='text-md';
        storage_storage.className ="p-2 overflow-y-auto grid gap-4 grid-cols-[repeat(auto-fill,minmax(60px,0fr))]";
        storage_player.className ="p-2 overflow-y-auto grid gap-4 grid-cols-[repeat(auto-fill,minmax(60px,0fr))]";  
    }
    for(let n =0 ;n<equipIconBoxes.length; n++){
        equipIconBoxes[n].className=`equipiconbox relative overflow-hidden p-4 bg-white rounded flex items-center justify-center ${boxSize}`;
    }

    for(let i =0;i<inventory.length; i++){
        addInventoryItem( inventory[i], storage_player, i, boxSize, fontSize);
        weight.inventory += parseFloat( inventory[i].weight );
        if(inventory[i].type=="FluidContainer"){
            //액체의 경우, 무게 추가
            weight.inventory += parseFloat(inventory[i].condition)/10;
        }
    }
    if(storageIndex>storage.length-1){storageIndex = storage.length-1};
    const _storageInventory = storage[storageIndex].inventory;
    for(let i =0;i<_storageInventory.length; i++){
        addInventoryItem( _storageInventory[i], storage_storage, i , boxSize, fontSize);
        weight.storage += parseFloat(_storageInventory[i].weight);
        if(_storageInventory[i].type=="FluidContainer"){
            //액체의 경우, 무게 추가
            weight.storage += parseFloat(_storageInventory[i].condition)/10;
        }
    }
    //무게 더하기
    if(equipments.weapon!=null){ weight.inventory+= parseFloat(equipments.weapon.weight)*0.3}
    
    storage_weightTxt.innerText = `${weight.storage.toFixed(2)}/50`;
    inventory_weightTxt.innerText = `${weight.inventory.toFixed(2)}/${weight.bagWeight}`;
    renderEquipment();
}
function addInventoryItem(data , route, index, boxSize = 'w-16 h-16', fontSize=`text-md`){
    //
    if(data ==null){
        return;
    }
    
    const div = document.createElement('div');
    div.id = `item_${data}`;
    div.className = `relative flex bg-white rounded aspect-square ${boxSize}`;
    div.dataset.data = JSON.stringify(data);
    div.dataset.route = route.id;
    div.dataset.index = index;

    const namespan = document.createElement('span');
    namespan.className = `absolute bottom-0 left-0 right-0 ${fontSize} text-white bg-black/50 text-center truncate rounded-b z-50`;
    namespan.innerText = translations[currentLang][data.name]??data.name;
    div.appendChild(namespan);

    // 내구도 배경 박스
    const box = document.createElement('div');
    box.className = "absolute inset-0 rounded-b z-0"; // 투명 배경
    div.appendChild(box);

    // 예: data.condition / data.maxCondition 으로 비율 계산
    const ratio = Math.max(0, Math.min(1, data.condition / data.maxCondition || 0));
    // 내구도 게이지 바
    const durabilityBar = document.createElement('div');
    
    durabilityBar.className = `absolute bottom-0 left-0 right-0 rounded-b transition-all duration-300`;
    if(data.type=="Weapon" || data.type =="Armor"){
        //무기, 방어구 등인 경우...
        durabilityBar.classList.add( `${ data.maxCondition>1 ? itemRatioColor(ratio) : "bg-white-500" }` );
        durabilityBar.style.height = `${ratio * 100}%`;
    }
    if(data.type=="FluidContainer"){
        //액체류의 경우
        
        durabilityBar.classList.add(itemColor(data.subType));
        durabilityBar.style.height = `${ratio * 100}%`;
    }
    if(data.subType=='food'){
        //음식의 경우
        const freshratio =(data.rottenDays-data.freshDays)/data.rottenDays;
        durabilityBar.classList.add(itemRatioColor(ratio, freshratio ));
        durabilityBar.style.height=`${data.div/data.maxDiv*100}%`;
        /*
        if(data.condition<=0){
            durabilityBar.style.height = `100%`;
        }else{
            //50%까지는 감소
           durabilityBar.style.height = `${ ratio> freshratio ? ratio * 100: 100}%`;
        }
           */
    }
    if(data.subType=='matrial'){
        durabilityBar.classList.add( `${ data.maxCondition>1 ? itemRatioColor(ratio) : "bg-white-500" }` );
        durabilityBar.style.height = `${ratio * 100}%`;
    }
    if(data.count !=null){
        if(data.count>0){
            //숫자를 세는 경우
            const namespan2 = document.createElement('span');
            namespan2.className = `absolute top-0 right-0 ${fontSize} px-1 text-black text-bold text-center truncate z-50`;
            namespan2.innerText = data.count;
            div.appendChild(namespan2);
        }
        
    }
    //div.dataset.durabilityId = `durability_${index}`;
   // durabilityBar.id = div.dataset.durabilityId;
    box.appendChild(durabilityBar);

    const img = document.createElement('img');
    img.src = data.path;
    img.className = "absolute w-full h-full object-contain p-2 z-50";
    box.appendChild(img);

    //div.addEventListener('click', itemMove);
    div.addEventListener('pointerdown', itemMove_mouseDown);
    div.addEventListener('pointerup', itemMove_mouseUp);
    route.appendChild(div);
}

///장착아이템 랜더링
function renderEquipment(){
    Object.entries(equipIcons).forEach(([key]) => {
        const data =equipments[key];
        if(data!=null){
            if(data.condition<=0){
                log(`와장창!! ${translations[currentLang][data.name]}가 파괴되었습니다.`, true);
                equipments[key] =null;
            }
        }
    });
    //플레이어가 들고있는 무기 랜더링
    if(equipments.weapon!=null){
        
        equipWp.src = equipments.weapon.path;
        equipWp.classList.remove("rotate-90", 'rotate-180',"-rotate-90");
        if(equipments.weapon.rotate>0){ 
            if(equipments.weapon.rotate<=180){
                equipWp.classList.add('rotate-'+equipments.weapon.rotate); 
            }else{
                equipWp.classList.add('-rotate-'+(equipments.weapon.rotate-180)); 
            }
            
        }
        weaponImg.src = equipments.weapon.path;
        weaponName.textContent = translations[currentLang][equipments.weapon.name]; }
    else if(equipments.weapon == null){
        equipWp.src = 'icons/default.png'; //들고있는 무기아이콘
        weaponImg.src = 'icons/default.png';
        weaponName.textContent ='';

    }
    const string ={
        weapon:'⚔무기',
        hat:'🎩모자',
        armor:'👚방어구',
        pants:'👖바지',
        shoes:'👟신발',
        accessory: `💍장신구`
    }
    Object.entries(equipIcons).forEach(([key]) => {
        const data =equipments[key];
        const target = equipIcons[key];
        if(data!=null){
            const ratio = data.condition/data.maxCondition;
            target.icon.src = data.path;
            target.nameTxt.innerText = translations[currentLang][data.name]??data.name;
            target.conditionBar.style.height =`${(ratio*100)}%`;
            target.conditionBar.classList.remove("bg-green-300", "bg-yellow-200", "bg-red-200");
            if(data.type=="FluidContainer"){
                target.conditionBar.classList.add(itemColor(data.subType));
            }
            else if(data.type =="Weapon" || data.type =="Armor"){
                target.conditionBar.classList.add(itemRatioColor(ratio));
            }else{
                //색 없음
                //target.conditionBar.classList.add("bg-white-600");
            }
            
        }else{
            //장비가 안 된 경우 초기화
            target.icon.src = 'icons/default.png';
            target.nameTxt.innerText = string[key];
            target.conditionBar.style.height = '0%';
        }
    });
    
}
//
function itemMove(data, dataset){
    storageTurn++;
     if(dataset.route == storage_player.id){
        //가방으로 이동
        storage[storageIndex].inventory.push( data);
        inventory.splice(dataset.index,1);
        renderStorageModal();
    }
    else if(dataset.route == storage_storage.id ){
        //인벤으로 이동
        inventory.push( data);
        storage[storageIndex].inventory.splice(dataset.index,1);
        renderStorageModal();
    }
}
//////////////////아이템 정보 표시 및 서브메뉴 액션
const storage_quickEquipChkInput = document.getElementById('storage_quickEquipChkInput');
function itemMove_mouseDown(e){
    if(mousedown==false){
        mousedown =true;
         const dataset = e.currentTarget.dataset;
        const data = JSON.parse( dataset.data);

        equipBool = true;
        //즉시 서브메뉴 호출
        if(storage_quickEquipChkInput.checked==false){
            equipSetTimeout = null;
            point.x = e.clientX;
            point.y = e.clientY;
            //setEquipment(data,dataset);
            itemsubMenu(data, dataset);
            return;
        }
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
            if(zombies.length>0){return}//좀비가 있는 경우
           itemMove(data, dataset);
        }
        equipBool=false;
    }else{
        return;
    }
}
//////////////////장비창 정보 표시
function itemEquip_mouseDown(e){
     const key = e.currentTarget.id.split('_')[1];
    let data = equipments[key];
    /*
    if(id == equipIcons.weapon.icon.id){
        data = equipments.weapon;
    }
        Object.entries(equipIcons).forEach(([key]) => {
        const _data =equipments[key];
        const target = equipIcons[key];
        if(_data!=null){
            if(id == target.icon.id ){
                data = _data;
            }
        }
        
     });
    */
     
    if(storage_quickEquipChkInput.checked==false){
        
        point.x = e.clientX;
        point.y = e.clientY;
        itemsubMenu(data, null);
        return;
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
    const key = e.currentTarget.id.split('_')[1];
    if(mousedown){
        mousedown=false;
        clearInterval(equipSetTimeout);
        if(equipBool ){
            //200ms 이상 장기 터치일 때 
            equipBool=false;
            return;
        }else{
            //짧은 터치, 장비해제
            
            if(zombies.length>0){return}//좀비가 있는 경우
            unequip(key);
        }
        equipBool=false;
    }else{
        return;
    }
}


function pushItemToInventory(_inventory, itemName){
    //당장은 안 쓰는 함수임..갯수구현 힘듬.
    //inventory.push( findItem(data.convert) );
    const item = findItem(itemName);
    if(item.count !=null){
        if(item.count>0){
            //숫자를 세는 경우
            for(let i = 0; i<_inventory.length;i++){
                if(_inventory[i].name == item.name){
                    _inventory[i].count++;
                    return;
                }
            }
            _inventory.push( item );
        }else{
            _inventory.push( item );
        }
    }else{
        _inventory.push( item );
    }
    
}

function changeItemCondition(data, matrial, repeat){
    while (true){
        
        if(data.condition>=data.maxCondition){
            break;
        }
        if(matrial.condition<=0){
            break;
        }
        if(repeat<=0){
            break;
        }
        repeat--;
        data.condition++;
        matrial.condition--;
       // console.log(data.condition, matrial.condition);
    }
    return data;
}
function removeMatrialItem(subtype="matrial"){
    for(let i =0;i<inventory.length;i++){
        if(inventory[i].subType==subtype){
            if(inventory[i].condition<=0){
                inventory.splice(i,1);
                i--;
            }
        }
        if(inventory[i].count!=null){
            if(inventory[i].count<=0){
                inventory.splice(i,1);
                i--;
            }
        }
    }
}