
//////////////////////아이템 서브메뉴///////////////////
document.addEventListener("pointerdown", (e) => {
    point.x = e.clientX;
    point.y = e.clientY;
});
function closeSubOption(){itemSubOption.classList.add("hidden");}
function facilitySubMenu(facilityName){
    //시설물 서브메뉴
    if(facilityName ==null)return
    itemSubOption.classList.remove("hidden");
    optionBoxes.innerHTML='';
    function makeBox(nameTxt, turn=false, boxColor="bg-gray-500" ){
        const box = document.createElement("button");
        box.className = `text-3xl p-2 rounded ${boxColor} ${boxColor=="bg-gray-500"?"text-white":"text-black"}`;
        if(turn ==null){
            box.innerText = nameTxt;
        }else{
             if(turn==false){
                turn = zombies.length>0? true : false;
                if(storageTurn>=maxStorageTurn){
                    turn=true;
                }
            }
            if(turn){
                box.innerText = `${nameTxt} (턴 넘김)`;
            }else{
                box.innerText = nameTxt;
            }
        }
        optionBoxes.appendChild(box);
        return box;
    }
    
    const data = getFacility(facilityName);
    if(data.item!=null){
        makeBox("시설 정보", null).addEventListener('click', ()=>{
            //시설 아이템 정보 호출
            showItemModal(data.item);
            closeSubOption();
        });

        if(facilityName=='faucet' || facilityName=='waterSource'){
            if(data.item.condition>0){
                //물 마시기
                const drinkType = data.item.subType;
                    const drinkname = translations[currentLang][ drinkType ] ?? drinkType;
                makeBox(`${drinkname} 마시기`,true, itemColor(drinkType)).addEventListener('click', ()=>{
                    if(waterEndTurn>0){
                        playerDrink( drinkType, {condition:1});
                    }else{
                        playerDrink( drinkType, data.item );
                    }
                    
                    
                    renderStorageModal();
                    //closeSubOption();
                });
            }
        }
        
    if(data.needItem =="power" || data.needItem =="battery"){
            if(getFacilityEnable(facilityName)){
                makeBox("전원 끄기",true).addEventListener('click', ()=>{
                    setFacilityEnable(facilityName, false);
                    closeSubOption();
                });
            }else{
                makeBox("전원 켜기",true).addEventListener('click', ()=>{
                    if(getPower()){
                        setFacilityEnable(facilityName, true);
                    }else{
                        log_popup(`전력 공급이 없습니다.`);
                    }
                    
                    closeSubOption();
                });
            }
        }
        if(facilityName=='bed' || facilityName =='sofa'){
            //침대 및 소파
            makeBox("휴식하기",true).addEventListener('click', ()=>{
                startResting();
                closeSubOption();
            });
            makeBox("잠자기",true).addEventListener('click', ()=>{
                startResting(200);
                closeSubOption();
            });
            
        }

        if(data.removable){
            //장착 해제하기
            makeBox("떼어내기",true, "bg-slate-300").addEventListener('click', ()=>{
                closeSubOption();
                
                if(facilityName=='faucet'){
                    if(getWeapon()!=null){
                        if(getWeapon().name=='PipeWrench'){

                        }else{
                            log_popup(`파이프렌치를 장착해야 합니다.`);
                            //return;
                        }
                    }else{
                        log_popup(`파이프렌치를 장착해야 합니다.`);
                        //return;
                    }
                }
                if(facilityName=='bed' || facilityName=='sofa'){
                    if(getWeapon()!=null){
                        if(getWeapon().name=='Hammer'){

                        }else{
                            log_popup(`망치를 장착해야 합니다.`);
                            //return;
                        }
                    }else{
                        log_popup(`망치를 장착해야 합니다.`);
                        //return;
                    }
                    
                    
                }
                removeFacility(facilityName);
                advanceTurn();
                
            });
        }
    }
    //크기조절
    
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    optionBoxes.style.left = innerWidth;
    optionBoxes.style.top = innerHeight;
    setTimeout(() =>{
        const space = 30;
        const width = optionBoxes.offsetWidth;
        const height = optionBoxes.offsetHeight;
        optionBoxes.style.left = `${point.x + width> innerWidth*0.9? point.x-width-space:point.x+space}px`;
        optionBoxes.style.top = `${point.y+height> innerHeight*0.9? point.y-height-space:point.y-space}px`;
    },10 );
}

function itemsubMenu(data, dataset){
    if(data ==null)return
    itemSubOption.classList.remove("hidden");
    //console.log(point, innerWidth, innerHeight);
    
    optionBoxes.innerHTML='';
    function makeBox(nameTxt,turn=false, boxColor="bg-gray-500" ){
        const box = document.createElement("button");
        box.className = `text-3xl p-2 rounded ${boxColor} ${boxColor=="bg-gray-500"?"text-white":"text-black"}`;
        if(turn ==null){
            box.innerText = nameTxt;
        }else{
             if(turn==false){
                turn = zombies.length>0? true : false;
                if(storageTurn>=maxStorageTurn){
                    turn=true;
                }
            }
            if(turn){
                box.innerText = `${nameTxt} (턴 넘김)`;
            }else{
                box.innerText = nameTxt;
            }
        }
       
        optionBoxes.appendChild(box);
        return box;
    }
    let zombieIsAlived = zombies.length>0? true : false;
    if(storageTurn>=maxStorageTurn){
        zombieIsAlived=true;
    }

    if(data!=null){
        makeBox("아이템 정보", null).addEventListener('click', ()=>{
            //아이템 정보 호출
            showItemModal(data);
            closeSubOption();
        });
    }
    

    if(dataset==null){
        if(data.type =='Weapon' ||data.type =='Armor' || data.type =='Accessory'){
            makeBox(`장착 해제`,false,`bg-blue-400`).addEventListener('click', ()=>{
                
                unequip(data.type.toLowerCase());
                closeSubOption();
                if(zombieIsAlived)advanceTurn();
            });
        }

    }else if(dataset!=null){
        const item = findInventoryItem(dataset.route, dataset.index) ?? null; //아이템 미리 찾아두기, 장비창에서는 null값 리턴
        if(data.type =='Weapon' ||data.type =='Armor' || data.type =='Accessory'){
            makeBox(`장착하기`,false,`bg-blue-400`).addEventListener('click', ()=>{
                
                setEquipment(data, dataset);
                closeSubOption();
                if(zombieIsAlived)advanceTurn();
            });
           
        }
        if(data.type=='Armor'){
            //방어구인 경우
            if(data.condition< data.maxCondition*2){
                makeBox(`${data.condition>=data.maxCondition?'옷 덧대기':'옷 수선하기'}`,true).addEventListener('click', ()=>{
                    const needle = findInventoryItemData('Needle');
                    if(needle!=null ){
                        const thread = findInventoryItemData('Thread');
                        if(thread!=null && thread.condition>0){
                            const rag = findInventoryItemData("Rag");
                            if(rag!=null){
                                rag.subType='matrial';
                                rag.condition=0;
                                
                                
                                thread.condition--;
                                data.condition++;

                                findInventoryItem(dataset.route, dataset.index).condition = data.condition;
                                addSkillXp("Tailoring",125);
                                advanceTurn();
                            }else{
                                log_popup(`남은 ${translations[currentLang].Rag}이 없습니다.`);
                            }
                        }else{
                            log_popup(`남은 실이 없습니다.`);
                        }
                    }else{
                        //바늘이 없는 경우
                        log_popup(`바늘이 없습니다.`);
                    }
                    
                    closeSubOption();
                    renderStorageModal();

                });
            }
            }

        if(data.convert != null){
            if(data.type != 'food'){
                //음식의 경우 따로 처리
                let dismentleTxt ={
                    clothing: "옷 찢기",
                    watch: "시계 분해하기",
                    default :"분해하기"
                 }
                  if(data.subType== "clothing" || data.subType== "watch"){
                //의상 찢기, 분해
                
                    makeBox(dismentleTxt[data.subType]?? dismentleTxt.default, true, "bg-slate-300").addEventListener('click', ()=>{
                        inventory.push( findItem(data.convert) );
                        //pushItemToInventory(inventory, data.convert);
                        if(dataset.route == storage_storage.id){
                            storage[storageIndex].inventory.splice(dataset.index,1);
                        }else{
                            inventory.splice(dataset.index,1);
                        }
                        
                        renderStorageModal();
                        advanceTurn();
                        
                        closeSubOption();
                    });
                }
            }
        }
        if(data.type =="FluidContainer"){
            //액체류 마시기, 채우기, 비우기
           
            if(item.condition>0){
                const drinkType = (data.subType.split(';').length>1? `${translations[currentLang][ data.subType.split(';')[0]] } 혼합액` : data.subType);
                 const drinkname = translations[currentLang][ drinkType ] ?? drinkType;
                makeBox(`${drinkname} 마시기`,true, itemColor(drinkType)).addEventListener('click', ()=>{
                    playerDrink( data.subType.split(';')[0], item );
                    
                    renderStorageModal();
                    //closeSubOption();
                });
                
            }
            if(item.condition < item.maxCondition){

                let waterSource =null;
                const faucet = getFacility("faucet");
                if(getFacilityEnable("faucet")){
                    waterSource = 'water';
                }else if( getFacilityEnable("waterSource")){
                    waterSource = 'taintedWater';
                }

                // console.log(waterSource);
                if(waterSource!=null){
                    const addFluidname = translations[currentLang][waterSource] ?? waterSource;
                    makeBox(`${addFluidname} 채우기`,true, itemColor(waterSource)).addEventListener('click', ()=>{
                        if(faucet!=null){
                            if(waterEndTurn>0){
                                item.condition = item.maxCondition;
                                advanceTurn();
                                log(`${translations[currentLang][faucet.name]??faucet.name}으로 물을 채웠습니다.`,true);
                            }else{
                                //물이 끊긴 경우 수전의 물 사용
                                if(faucet.item.condition>0){
                                    while( true ){
                                        //
                                        if(parseFloat(faucet.item.condition)<=0 || item.condition>= item.maxCondition){
                                            advanceTurn();
                                            log(`${translations[currentLang][faucet.name]??faucet.name}으로 물을 채웠습니다.`,true);
                                            break;
                                        }else{
                                            item.condition++;
                                            faucet.item.condition--;
                                        }
                                    }
                                }else{
                                    log_popup(`${translations[currentLang][faucet.name]??faucet.name}에 물이 없습니다.`);
                                }
                                
                            }
                            
                        }
                        if(waterSource=='taintedWater'){
                            //강물이 있는 경우
                            item.condition = item.maxCondition;
                            advanceTurn();
                        }

                    
                        if(item.subType=='empty'){
                            //비어있는 경우
                            item.subType = waterSource;
                        }else{
                            const subTypeArray = item.subType.split(';');
                            
                            if(subTypeArray.includes(waterSource)){
                                //갖고 있는경우 추가로 더하진 않음...
                            }else{
                                item.subType = subTypeArray[0] == 'water'? item.subType=waterSource : `${item.subType};${waterSource}`;
                            }
                        }
                        renderStorageModal();
                        //closeSubOption();
                    });
                }
            }
            if(item.condition>0){
                 makeBox(`비우기`,true, "bg-slate-300").addEventListener('click', ()=>{
                    item.condition = 0;
                    item.subType = 'empty';
                    item.info = '';
                    advanceTurn();
                    renderStorageModal();
                    //closeSubOption();
                });
           }
           

        }
        if(dataset.route == storage_player.id){
            //플레이어 가방에 있을 때
            

            
            if(data.subType =="bandage"){
                makeBox(`붕대 감기`,true, "bg-slate-300").addEventListener('click', ()=>{
                    playerHealing(dataset.index);
                    closeSubOption();
                }); 
            }
            if(data.subType == "canned"){
                //캔 따기
                makeBox("캔 따기",true, "bg-slate-300").addEventListener('click', ()=>{
                    //playerHealing(dataset.index);
                    const opendItem = findItem(`${data.name}Open`);
                    opendItem.name = data.name;
                    inventory.push(opendItem);
                    inventory.splice( dataset.index,1);
                    closeSubOption();
                    advanceTurn();
                    renderStorageModal();
                }); 
            }
            if(data.subType == "food"){
                //먹기
                //const item = inventory[dataset.index];
                if(item.div>0){
                    makeBox("1/4 먹기",true, "bg-slate-300").addEventListener('click', ()=>{
                        playerEatFood(item, 1);
                        closeSubOption();
                        renderStorageModal();
                    }); 
                    if(item.div>=2){
                        makeBox("1/2 먹기",true, "bg-slate-300").addEventListener('click', ()=>{
                            playerEatFood(item, 2);
                            closeSubOption();
                            renderStorageModal();
                        }); 
                    }
                }
                
            }
            
            
            if(data.subType =="consume"){
                

                //if(data.name =="Zomboxivir"){
                   
                //}
                
            }
           
            //////////////////모드데이터////////////////////////////////////
            if(modDatas.length>0){
                //console.log(modDatas);
                for(let i = 0 ; i < modDatas.length; i++){
                    const string =modDatas[i].api.cureWound(data.name);
                        if(string!=null){
                        makeBox("사용하기",true, "bg-slate-300").addEventListener('click', ()=>{
                            cureWound(string);
                            log(`${translations[currentLang][data.name]??data.name} 아이템을 사용했습니다`, true);
                            inventory.splice(dataset.index,1);
                            renderStorageModal();
                            advanceTurn();
                            
                            closeSubOption();
                        }); 
                    }
                }
            }

            //////////////////////////////////////////////////////////////
            
            if(item.type=='Furniture'){
                //가구의 경우
                makeBox('설치하기', true, "bg-slate-300").addEventListener('click', ()=>{
                    //currentMapData.thisFacilities.push(facilityItem(data.name));
                    addFacility(data.name);
                    inventory.splice( dataset.index,1);
                    closeSubOption();
                    advanceTurn();
                });
            }
            makeBox(`${storage[storageIndex].name=="ground"?"바닥에 버리기":`${translations[currentLang][storage[storageIndex].name]??storage[storageIndex].name}에 넣기`}`).addEventListener('click', ()=>{
                
                itemMove(data, dataset);
                closeSubOption();
                if(zombieIsAlived)advanceTurn();
            });
            
           
            
        }
        else if(dataset.route == storage_storage.id){
            //보관함에 있을 때
            makeBox(`가방에 넣기`).addEventListener('click', ()=>{
                itemMove(data, dataset);
                closeSubOption();
                if(zombieIsAlived)advanceTurn();
            });
        }
    }
    //크기조절
    
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    optionBoxes.style.left = innerWidth;
    optionBoxes.style.top = innerHeight;
    setTimeout(() =>{
        const space = 30;
        const width = optionBoxes.offsetWidth;
        const height = optionBoxes.offsetHeight;
        optionBoxes.style.left = `${point.x + width> innerWidth*0.9? point.x-width-space:point.x+space}px`;
        optionBoxes.style.top = `${point.y+height> innerHeight*0.9? point.y-height-space:point.y-space}px`;
    },10 );
}