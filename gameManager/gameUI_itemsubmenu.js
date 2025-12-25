
//////////////////////아이템 서브메뉴///////////////////
document.addEventListener("pointerdown", (e) => {
    point.x = e.clientX;
    point.y = e.clientY;
});
function closeSubOption(){itemSubOption.classList.add("hidden");}
function optionBoxesDivide(){
    const box = document.createElement("div");
    box.classList=`p-2 rounded bg-slate-100`;
    optionBoxes.appendChild(box);
}
function facilitySubMenu(facilityName){
    //시설물 서브메뉴
    if(facilityName ==null)return
    if(delaying)return;//딜레이 중이면 무시
    stopResting();
    itemSubOption.classList.remove("hidden");
    optionBoxes.innerHTML='';

    let textSize ='text-3xl';
    let boxSize='p-2';
    function makeBox(nameTxt, turn=false, boxColor="bg-gray-500" ){
        const box = document.createElement("button");
        const _windowRatio = windowRatio();
        
        if(_windowRatio=='phone'){
            textSize ='text-4xl';
            boxSize='p-8';
        }else if(_windowRatio=='tablet'){
            textSize ='text-4xl';
            boxSize='p-4';
        }else{
            textSize ='text-3xl';
            boxSize='p-2';
        }
        box.className = `${textSize} ${boxSize} rounded ${boxColor} ${boxColor=="bg-gray-500"?"text-white":"text-black"}`;
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


    const data = getFacility(facilityName);
    if(data.item!=null){
        makeBox("시설 정보", null,"bg-slate-300").addEventListener('click', ()=>{
            //시설 아이템 정보 호출
            showItemModal(data.item);
            closeSubOption();
        });
    }
    if(data.item!=null && gameOver==false){
        if(data.name=='faucet' || data.name=='waterSource'){
            if(data.item.condition>0){
                //물 마시기
                const drinkType = data.item.subType;
                const drinkname = translating(drinkType);
                makeBox(`${drinkname} 마시기`,true, itemColor(drinkType)).addEventListener('click', ()=>{
                    playerDrink( drinkType, data.item );
                    
                    
                    renderStorageModal();
                    //closeSubOption();
                });
            }
        }
        if(data.addStorage){
            //전용 보관함이 있는 경우
            makeBox("보관함 보기",null).addEventListener('click', ()=>{
                for(let i =0;i<storage.length; i++){
                    if(storage[i].name == data.name){
                        //이 스토리지의 경우
                        storageIndex = parseInt(i);
                        break;
                    }
                }
                storageVisible=true;
                openStorageModal();
                renderStorageModal();
                //storageIndex
            });
        }
        
        if(data.needItem =="power" || data.needItem =="battery" || data.name =="generator"){
            if( data.removable){
                if(getFacilityEnable(data.name)){
                    makeBox("전원 끄기").addEventListener('click', ()=>{
                        setFacilityEnable(data.name, false);
                        if(zombieIsAlived)advanceTurn();
                        closeSubOption();
                        if(data.name =="generator"){
                            bgLightDark(currentMapData);
                            renderFacilityIcons();
                        }
                        log_popup(`${translating(data.name)}를 껐습니다`);
                    });
                }else{
                    makeBox("전원 켜기",false,"bg-blue-300").addEventListener('click', ()=>{
                        if(data.needItem =="power" ){
                            if(getPower()){
                                setFacilityEnable(data.name, true);
                                log_popup(`${translating(data.name)}를 켰습니다`);
                                if(zombieIsAlived)advanceTurn();
                            }else{
                                log_popup(`전력 공급이 필요합니다.`);
                            }
                        }else if(data.needItem =="battery"){
                            //배터리의 경우
                            if(data.item.condition>0){
                                //배터리 잔량이 있는 경우
                                setFacilityEnable(data.name, true);
                                log_popup(`${translating(data.name)}를 켰습니다`);
                                if(zombieIsAlived)advanceTurn();
                            }else{
                                log_popup(`건전지가 없습니다.`);
                            }
                        }else if(data.name =="generator"){
                            //가솔린의 경우
                            if(data.item.condition>0){
                                //발전기사용법?
                                //가솔린 잔량이 있는 경우
                                setFacilityEnable(data.name, true);
                                log_popup(`${translating(data.name)}를 켰습니다`);
                                if(zombieIsAlived)advanceTurn();
                                bgLightDark(currentMapData);
                                renderFacilityIcons();
                            }else{
                                log_popup(`연료가 없습니다.`);
                            }
                        }
                    
                        
                        closeSubOption();
                    });
                }
            }
        }
        if(data.needItem=='battery'){
            if(data.item.condition>0){
                makeBox("배터리 제거하기",true, "bg-pink-300").addEventListener('click', ()=>{
                    const battery = findMisc("Battery");
                    battery.condition =  parseInt( data.item.condition);
                    data.item.condition = 0;
                    inventory.push( battery);
                    setFacilityEnable(data.name,false);
                    renderStorageModal();
                    closeSubOption();
                    advanceTurn();
                    log(`${data.name}에서 건전지를 제거했습니다.`);
                });
            }else{
                //배터리 장착
                makeBox("배터리 장착하기",true, "bg-green-400").addEventListener('click', ()=>{
                    const battery = findInventoryItemData('Battery');
                    if(battery==null){
                        log_popup(`배터리가 없습니다.`);
                        closeSubOption();
                    }else{
                        data.item.condition = parseInt(battery.condition);
                       // console.log(data.item);
                        battery.condition=-1;
                        setFacilityEnable(data.name,true);
                        log(`${data.name}에서 건전지를 삽입했습니다.`);
                        renderStorageModal();
                        closeSubOption();
                        advanceTurn();
                    }
                });
            }
        }
        
        if(data.name =="generator"){
            if(data.item.condition < data.item.maxCondition){
                //연료 넣기
                makeBox("연료 넣기",true, itemColor('gasoline')).addEventListener('click', ()=>{
                    closeSubOption();
                    if(data.enabled){
                        log_popup(`연료를 넣기 위해서 전원을 꺼야 합니다.`);
                    }else{
                        const gas = findInventoryItemData('gasoline');
                        if(gas==null){
                            log_popup(`연료가 없습니다.`);
                        }else{
                            let amount = 0;
                            while (true){
                                
                                if(gas.condition<=0){
                                    break;
                                }
                                if(data.item.condition>=100){
                                    break;
                                }
                                data.item.condition++;
                                gas.condition--;
                                amount++;
                            }
                            if(amount>0){
                                log(`${data.name}에 ${amount}만큼의 연료를 넣었습니다.`,true);
                                renderStorageModal();
                                advanceTurn();
                            }else{
                                log_popup(`연료가 없습니다.`);
                                
                            }
                            
                        }
                        
                    }
                });
            }
            if(data.item.maxCondition < data.item.repair){
                //발전기 내구도가 감소한 경우
                 makeBox("발전기 수리하기",true,"bg-blue-300").addEventListener('click', ()=>{
                    closeSubOption();
                    if(data.enabled){
                        log_popup(`발전기를 수리하기 위해서 전원을 꺼야 합니다.`);
                    }else{
                        const electro = findInventoryItemData('ElectronicsScrap');
                        if(electro==null){
                            log_popup(`${translating(electro.name)}가 없습니다.`);
                        }else{
                            const rv = 10;
                            data.item.maxCondition += rv;
                            if(data.item.maxCondition>data.item.repair){
                                data.item.maxCondition = data.item.repair;
                            }
                            log(`${data.name}를 ${rv}만큼 수리했습니다.`);
                            electro.subType='remove';
                            electro.condition=-1;
                            renderStorageModal();
                            advanceTurn(); 
                        }
                        
                    }
                });
            }
        }
        if(data.name=='bed' || data.name =='sofa'){
            //침대 및 소파
            makeBox("휴식하기",true).addEventListener('click', ()=>{
                startResting();
                closeSubOption();
            });
            makeBox("잠자기",true).addEventListener('click', ()=>{
                startSleeping(200);
                closeSubOption();
                
            });
            
        }

        if(data.removable){
            //장착 해제하기
            optionBoxesDivide();
            makeBox("떼어내기",true, "bg-slate-300").addEventListener('click', ()=>{
                closeSubOption();
                let bool =false;
                //console.log(data.item.needTool);
                if(data.item.needTool!=null){
                    //제거 도구가 필요한 경우
                    const wp = getWeapon();
                    if(wp != null && wp.name == data.item.needTool){
                        bool =true;
                    }else{
                        log_popup(`${translating(data.item.needTool)}를 장착해야 합니다.`);
                        return;
                    }
                }else{
                    bool=true;
                }
                if(data.needItem =='power' || data.needItem =='gasoline'){
                    //전력을 필요로 하는 시설의 경우
                    if(data.enabled){
                         log_popup(`먼저 전원을 꺼야 합니다.`);
                       return;
                    }
                    
                }
                if(bool){
                    removeFacility(data.name);
                    advanceTurn();
                }
                
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
    if(delaying)return;//딜레이 중이면 무시
    stopResting();
    itemSubOption.classList.remove("hidden");
    //console.log(point, innerWidth, innerHeight);
    
    optionBoxes.innerHTML='';
    let textSize ='text-3xl';
    let boxSize='p-2';
    function makeBox(nameTxt, turn=false, boxColor="bg-gray-500" ){
        const box = document.createElement("button");
        const _windowRatio = windowRatio();
        
        if(_windowRatio=='phone'){
            textSize ='text-4xl';
            boxSize='p-8';
        }else if(_windowRatio=='tablet'){
            textSize ='text-4xl';
            boxSize='p-4';
        }else{
            textSize ='text-3xl';
            boxSize='p-2';
        }
        box.className = `${textSize} ${boxSize} rounded ${boxColor} ${boxColor=="bg-gray-500"?"text-white":"text-black"}`;
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
        makeBox("아이템 정보", null,"bg-slate-300").addEventListener('click', ()=>{
            //아이템 정보 호출
            showItemModal(data);
            closeSubOption();
        });
    }
    if(gameOver==false ){
        
        if(dataset==null ){
            if( equipNames.includes(data.type.toLowerCase())){
                makeBox(`장착 해제`,false,`bg-pink-300`).addEventListener('click', ()=>{
                    
                    unequip(data.type.toLowerCase());
                    closeSubOption();
                    if(zombieIsAlived)advanceTurn();
                });
            }

        }else if(dataset!=null){
            if(dataset.index!=null && dataset.index<0 ){
                //디버그 패널
                makeBox(`가방에 넣기`,null,`bg-blue-300`).addEventListener('click', ()=>{
                    
                    closeSubOption();
                    inventory.push(findItem(data.name));
                    log_popup(`${translating(data.name)} 아이템을 가방에 넣었습니다.`,400);

                });
            }else{
            const item = findInventoryItem(dataset.route, dataset.index) ?? null; //아이템 미리 찾아두기, 장비창에서는 null값 리턴
            if( equipNames.includes(data.type.toLowerCase())){
            //if(data.type =='Weapon' ||data.type =='Armor' || data.type =='Accessory' || data.type=='Bag'){
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
                        if(getLight()==false){
                            log_popup(`작업을 하기에는 너무 어둡습니다.`);
                            return;
                        }
                        const needle = findInventoryItemData('Needle');
                        if(needle!=null ){
                            const thread = findInventoryItemData('Thread');
                            if(thread!=null && thread.condition>0){
                                const rag = findInventoryItemData("Rag");
                                if(rag!=null){
                                    rag.subType='remove';
                                    rag.condition=-1;
                                    
                                    
                                    thread.condition--;
                                    data.condition++;

                                    findInventoryItem(dataset.route, dataset.index).condition = data.condition;
                                    addSkillXp("Tailoring",125);
                                    advanceTurn();
                                }else{
                                    log_popup(`남은 ${translating("Rag")}이 없습니다.`);
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

            if(data.recipe != null){
                //if(data.type != 'Food'){
                    //음식의 경우 따로 처리
                    let dismentleTxt ={
                        clothing: "옷 찢기",
                        watch: "시계 분해하기",
                        canned: "캔 따기",
                        box: "상자에서 꺼내기",
                        default :"분해하기"
                    }
                    //data.subType== "clothing" || data.subType== "watch"|| data.subType== "wood"
                    if(data.recipe.length>0){
                    //의상 찢기, 분해, 캔 따기, 꺼내기
                        optionBoxesDivide();
                        makeBox(dismentleTxt[data.subType]?? dismentleTxt.default, true, "bg-pink-300").addEventListener('click', ()=>{
                            closeSubOption();
                            const recipe = findRecipes(data.recipe);
                            
                            if(getLight()==false){
                                log_popup(`작업을 하기에는 너무 어둡습니다.`);
                                return;
                            }
                            
                            if(recipe==null ){
                                log_popup(`제작 가능한 레시피가 없습니다.`);
                                return;
                            }

                            const needTool = findInventoryItemData(recipe.needTool);
                            if(recipe.needTool.length>0 && needTool==null && debug==false){
                                log_popup(`${translating(recipe.needTool)}가 없습니다.`);
                                return;
                            }
                            if(needTool!=null){
                                //툴 내구도 차감
                                 needTool.condition-=1;
                            }
                            //제작에 필요한 도구 체크완료
                            //아이템 추가
                            for(let n =0 ;n< recipe.convert.length; n++){
                                pushItemToInventory(inventory, recipe.convert[n].name, recipe.convert[n].amount);
                            }  
                            
                            
                            let matrials;
                            if(dataset.route == storage_storage.id){
                                //storage[storageIndex].inventory.splice(dataset.index,1);
                                matrials = storage[storageIndex].inventory[dataset.index];
                            }else{
                                //inventory.splice(dataset.index,1);
                                matrials = inventory[dataset.index];
                            }
                            //console.log( Number.isNaN(matrials.condition) );
                            if(Number.isNaN(matrials.condition)){
                                //삭제할 것
                                matrials.subType='remove';
                                matrials.condition=-1;
                            }else{
                                if( matrials.condition>0 ){
                                    matrials.condition -= recipe.original[0].amount;
                                    if(matrials.condition<=0){
                                        matrials.subType='remove';
                                        matrials.condition=-1;
                                    }
                                }else{
                                    matrials.subType='remove';
                                    matrials.condition=-1;
                                }
                            }
                            removeMatrialItem();
                            renderStorageModal();
                            advanceTurn();
                            
                            
                        });
                    }
                //}
            }
            if(data.type =="FluidContainer"){
                //액체류 마시기, 채우기, 비우기
            
                if(item.condition>0){
                    const split = data.subType.split(';');
                    const drinkType = (split.length>1? split[0]  : data.subType);
                    const drinkname = translating( (split.length>1)?"혼합액":data.subType );
                    makeBox(`${drinkname} 마시기`,true, itemColor(drinkType)).addEventListener('click', ()=>{
                        playerDrink( data.subType.split(';')[0], item );
                        
                        renderStorageModal();
                        //closeSubOption();
                    });
                    
                }
                if(item.condition < item.maxCondition){

                    let waterSource =null;
                    const faucet = getFacility("faucet");
                    const gaspump = getFacility("gaspump");
                    if(getFacilityEnable("faucet")){
                        waterSource = 'water';
                    }else if( getFacilityEnable("waterSource")){
                        waterSource = 'taintedWater';
                    }else if( getFacilityEnable("gaspump")){
                        waterSource = 'gasoline';
                    }

                    // console.log(waterSource);
                    if(waterSource!=null){
                        const addFluidname = translating(waterSource);
                        makeBox(`${addFluidname} 채우기`,true, itemColor(waterSource)).addEventListener('click', ()=>{
                            closeSubOption();
                            if(faucet!=null){
                                if(waterEndTurn>0){
                                    item.condition = item.maxCondition;
                                    advanceTurn();
                                    log(`${translating(faucet.name)}으로 ${translating(waterSource)}을 채웠습니다.`,true);
                                }else{
                                    //물이 끊긴 경우 수전의 물 사용
                                    if(faucet.item.condition>0){
                                        while( true ){
                                            //
                                            if(parseFloat(faucet.item.condition)<=0 || item.condition>= item.maxCondition){
                                                advanceTurn();
                                                log(`${translating(faucet.name)}으로 ${translating(waterSource)}을 채웠습니다.`,true);
                                                break;
                                            }else{
                                                item.condition++;
                                                faucet.item.condition--;
                                            }
                                        }
                                    }else{
                                        log_popup(`${translating(faucet.name)}에 ${translating(waterSource)}이 없습니다.`);
                                        return;
                                    }
                                    
                                }
                                
                            }
                            if(gaspump!=null){
                                if(getPower()){
                                    //전력이 들어와 있는 경우
                                    if(gaspump.item.condition>0){
                                        while( true ){
                                            //
                                            if(parseFloat(gaspump.item.condition)<=0 || item.condition>= item.maxCondition){
                                                advanceTurn();
                                                log(`${translating(gaspump.name)}으로 ${translating(waterSource)}을 채웠습니다.`,true);
                                                break;
                                            }else{
                                                item.condition++;
                                                gaspump.item.condition--;
                                            }
                                        }
                                    }else{
                                        log_popup(`${translating(gaspump.name)}에 ${translating(waterSource)}이 없습니다.`);
                                    }
                                }else{
                                    log_popup(`전력 공급이 필요합니다.`);
                                    return;
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
                    optionBoxesDivide();
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
                /*
                if(data.type == "Food"){
                    if(data.foodStatus==-1){
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
                    
                }*/
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
                                log(`${translating(data.name)} 아이템을 사용했습니다`, true);
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
                        closeSubOption();
                        let bool =false;
                        const facilItem = facilityItem(item.name);
                        console.log(facilItem);
                        if(facilItem.item.needTool!=null){
                            //설치 도구가 필요한 경우
                            const wp = getWeapon();
                            if(wp != null && wp.name == facilItem.item.needTool){
                                bool =true;
                            }else{
                                log_popup(`${translating(facilItem.item.needTool)}를 장착해야 합니다.`);
                                return;
                            }
                        }else{
                            //currentMapData.thisFacilities.push(facilityItem(data.name));
                            bool =true;
                        }
                        if(bool){
                            if(currentMapData.thisFacilities.find(n => n.name==facilItem.name)!=null){
                                log_popup(`이미 설치한 시설입니다`);
                                return;
                            }
                            addFacility(facilItem, item);
                            inventory.splice( dataset.index,1);
                            
                            advanceTurn();
                            closeStorageModal();
                        }
                        
                    });
                    //건전지 넣기
                    if(item.needItem=='battery'){
                        if(item.condition>0){
                            makeBox("배터리 제거하기",true, "bg-pink-300").addEventListener('click', ()=>{
                                const battery = findMisc("Battery");
                                battery.condition =  parseInt( item.condition);
                                item.condition = 0;
                                inventory.push( battery);
                                renderStorageModal();
                                closeSubOption();
                                advanceTurn();
                                log(`${item.name}에서 건전지를 제거했습니다.`);
                            });
                        }else{
                            //배터리 장착
                            makeBox("배터리 장착하기",true, "bg-green-400").addEventListener('click', ()=>{
                                const battery = findInventoryItemData('Battery');
                                if(battery==null){
                                    log_popup(`배터리가 없습니다.`);
                                    closeSubOption();
                                }else{
                                    item.condition = parseInt(battery.condition);
                                    console.log(data);
                                    battery.condition=-1;
                                    log(`${item.name}에서 건전지를 삽입했습니다.`);
                                    advanceTurn();
                                    renderStorageModal();
                                    closeSubOption();
                                }
                            });
                        }
                    }

                }
                makeBox(`${storage[storageIndex].name=="ground"?"바닥에 버리기":`${translating(storage[storageIndex].name)}에 넣기`}`).addEventListener('click', ()=>{
                    
                    itemMove(data, dataset);
                    closeSubOption();
                    if(zombieIsAlived)advanceTurn();
                });
                
            
                
            }
            else if(dataset.route == storage_storage.id){
                //보관함에 있을 때
                makeBox(`가방에 넣기`).addEventListener('click', ()=>{
                    itemMove(data, dataset);
                    console.log(data);
                    closeSubOption();
                    if(zombieIsAlived)advanceTurn();
                });
            }
        }
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