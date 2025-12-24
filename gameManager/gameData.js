
//아이템리스트
let mapDatas = [];//맵리스트
let weaponDatas = []; //무기리스트
let clothDatas = []; //의상리스트
let miscDatas = [];//기타 아이템 리스트
let foodDatas = [];
let modDatas = [];//모드 데이터

let recipes= [];//레시피

// PapaParse를 이용해 CSV 파일을 불러오는 함수 (기존 함수 재활용)
function loadCSVData(link) {
    return new Promise((resolve) => {
        Papa.parse(link, {
            download: true,
            header: true,
            complete: function(results) {
                // PapaParse의 결과 중 실제 데이터만 resolve
                resolve(results.data);
            }
        });
    });
}

// 일반 텍스트 파일(예: script.js)의 내용을 불러오는 함수
async function loadTextFile(link) {
    const response = await fetch(link);
    if (!response.ok) {
        throw new Error(`파일 로드 실패: ${response.statusText} (${link})`);
    }
    return response.text();
}
async function loadModFiles(modName) {
    const basePath = `Mods/${modName}`;
    const scriptPath = `${basePath}/script.js`;
    const dataPath = `${basePath}/data.csv`;

    const [scriptContent, csvData] = await Promise.all([
        loadTextFile(scriptPath), // 1. script.js 텍스트 로드
        loadCSVData(dataPath)     // 2. data.csv 데이터 로드
    ]);

    // 3. 📌 스크립트 텍스트를 실행하여 모듈 API 객체를 얻습니다. (중요)
    const modAPI = new Function(scriptContent)(); 

    // 4. 모듈 API와 다른 데이터를 함께 반환합니다.
    return {
        api: modAPI, // 실행 가능한 함수(main, itemsubmenu 등)가 담긴 객체
        data: csvData,
        // ... (필요한 다른 데이터)
    };
}
//데이터 호출
function loadItemDatas( link ) {
  return new Promise((resolve) => {
    Papa.parse(link, {
      download: true,
      header: true,
      complete: function(results) {
        resolve(results.data);
      }
    });
  });
}
async function init() {
    
    mapDatas = await loadItemDatas("Data/mapDatas.csv");
    weaponDatas = await loadItemDatas("Data/weapons.csv");
    miscDatas = await loadItemDatas("Data/miscs.csv");
    foodDatas = await loadItemDatas("Data/foods_raw.csv");
    clothDatas = await loadItemDatas("Data/cloths.csv"); 
    recipes = await loadItemDatas("Data/recipes.csv");
    
    const modData = await loadModFiles('TheyKnew');

    // 2. 📌 modData.api를 통해 main 함수에 접근하여 호출합니다.
    if (modData.api && modData.api.main) {
        // main 함수에 필요한 dataPath를 인수로 전달하여 호출
        await modData.api.main(`Mods/TheyKnew/data.csv`); 
        modDatas.push(modData);
    } else {
        console.error('모듈 API 또는 main 함수를 찾을 수 없습니다.');
    }
}
init();
function findItem(itemName){
    let item = findWeapon(itemName);
    if(item!=null){ return item }
    
    item = findMisc(itemName);
    if(item!=null){ return item }
    
    item = findFood(itemName);
    if(item!=null){ return item}

    item = findCloth(itemName);
    if(item!=null){ return item}


    return null;
}
function findRecipes(itemName ){
    //무기데이터 검색 및 가공해서 반환
    const data = recipes.find(w => w.name === itemName);
    if(data==null){ return null }

    const originalList = [];
    const _list0 =data.original.split(";");
    for(let n = 0; n< _list0.length;n++){
        const item = _list0[n].split("-");
        originalList.push({name:item[0], amount:item[1]} )
    }

    const convertList = [];
    const _list =data.convert.split(";");
    for(let n = 0; n< _list.length;n++){
        const item = _list[n].split("-");
        convertList.push({name:item[0], amount:item[1]} )
    }
    let data0 ={
        visible : JSON.parse(data.visible),
        name:data.name.toString(),
        type: data.type.toString(),
        original: originalList,
        convert: convertList,
        needTool: data.needTool,
    }
    return data0;
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
        damage: parseFloat(data.damage),
        damageMax: parseFloat(data.damage),
        cri: parseFloat(data.cri),
        criXp: parseFloat(data.criXp),
        weight: parseFloat(data.weight)
    }
    return data0;
}
function findCloth(itemName ){
    //의상 데이터 검색 및 가공해서 반환
    const data = clothDatas.find(w => w.name === itemName);
    if(data==null){ return null }

    //option, Encumbrance
    data.encumbrance=null;
    data.capacity=null;

    const rawdata = data.option.split(";");
    for(let i =0; i<rawdata.length;i++){
        const _data = {
            name:rawdata[i].split(":")[0],
            value:rawdata[i].split(":")[1],
        }
        //console.log(_data);
        switch(_data.name){
            case 'encumbrance':
                data[_data.name] = parseFloat(_data.value);
                break;
            default:
                data[_data.name] = parseInt( _data.value);
            break;
        }
    }

    let data0 ={
        path: data.path.toString(),
        name: data.name.toString(),
        type: data.type.toString(),
        subType: data.subType.toString(),
        condition: parseInt(data.condition),
        maxCondition: parseInt(data.condition),
        recipe: data.recipe.toString(),
        weight: parseFloat(data.weight),
        info: data.info.toString(),

        //option
        encumbrance: parseFloat(data.encumbrance),
        capacity: parseInt(data.capacity)
    }
    return data0;
}
function findMisc(itemName ){
    //기타 아이템 데이터 검색 및 가공해서 반환
    const data = miscDatas.find(w => w.name === itemName);
    if(data==null){ return null }

    
    data.needItem = null;
    data.needTool = null;
    data.repair =null;
    data._condition=null;
    const rawdata = data.option.split(";");
    for(let i =0; i<rawdata.length;i++){
        const _data = {
            name:rawdata[i].split(":")[0],
            value:rawdata[i].split(":")[1],
        }
        if(_data.name.length>0){
            switch(_data.name){ 
                case `repair`:
                    data.repair = parseInt(_data.value);
                    break;
                case `_condition`:
                    data._condition = parseInt(_data.value);
                    break;
                default:
                    data[_data.name] = ( _data.value).toString();
                break;
            }
        }
    }
    let data0 ={
        path: data.path.toString(),
        name: data.name.toString(),
        type: data.type.toString(),
        subType: data.subType.toString(),
        condition: data._condition ??parseInt(data.condition),
        maxCondition: parseInt(data.condition),
        recipe: data.recipe.toString(),
        weight: parseFloat(data.weight),
        info: data.info.toString(),

        needItem: data.needItem,
        needTool: data.needTool,
        repair: data.repair??null
        
    }
    return data0;
}
const foodStatusTxt=["", "신선한 ","신선하지 않은 ","상한 ","타버린 "]; //캔(-1) 기본값(0)
function findFood_old(itemName ){
    //음식 아이템 데이터 검색 및 가공해서 반환
    const data = foodDatas.find(w => w.name === itemName);
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

        
        cookable:JSON.parse(data.cookable),
        freshDays: parseInt(data.freshDays*24),
        rottenDays: parseInt(data.rottenDays*24),
        cookTime: parseInt( data.cookTime ),

        foodStatus: parseInt(data.foodStatus), 
        hunger: `;${data.hunger};`.toString(),// ;로 나눔, kcal 총량, 섭취 시 1/4로 나눔

        poisoning: parseFloat(data.poisoning),
        recipe: data.recipe.toString(),
        convert: data.convert.toString(),
        div:4,
        maxDiv:4,
        weightDiv: parseFloat(data.weight/4),
        info: data.info.toString()
    }
    return data0;
}
function findFood(itemName ){
    //음식 아이템 데이터 검색 및 가공해서 반환
    const data = foodDatas.find(w => w.name === itemName);
    const xp = 24*6; //24시간*6턴
    if(data==null){ return null }
    data.cookable= false;
    data.recipe ='';
    data.convert ='';
    data.needItem='';
    data.poisoning=0;
    const rawdata = data.option.split(";");
    for(let i =0; i<rawdata.length;i++){
        const _data = {
            name:rawdata[i].split(":")[0],
            value:rawdata[i].split(":")[1],
        }
        //console.log(_data);
        switch(_data.name){
            case 'cookable':
                data.cookable = JSON.parse(_data.value);
                break;
            case 'poisoning':
                data.poisoning = parseFloat(_data.value);
                break;
            case 'recipe':
                data.recipe = _data.value.toString();
                break;
            case `convert`:
                data.convert = _data.value.toString();
                break;
            case `needItem`:
                data.needItem = _data.value.toString();
                break;
            default:
                data[_data.name] = parseInt( _data.value);
            break;
        }
    }

    let data0 ={
        path: data.path.toString(),
        name: data.name.toString(),
        type: data.type.toString(),
        subType: data.subType.toString(),
        condition: parseInt( data.rottenDays!=null? (data.freshDays!=null? data.freshDays*xp: data.rottenDays*xp): data.condition ),
        maxCondition: parseInt( data.rottenDays!=null? (data.freshDays!=null? data.freshDays*xp : data.rottenDays*xp ): data.condition  ),
        weight: parseFloat(data.weight),

        foodStatus: parseInt(data.foodStatus), 
        hunger: `;${data.hunger};`.toString(),// ;로 나눔, kcal 총량, 섭취 시 1/4로 나눔

        //옵션값들 모음
        cookable:JSON.parse(data.cookable)??null,
        freshDays: parseInt(data.freshDays*24)??null,
        rottenDays: parseInt(data.rottenDays*24)??null,
        cookTime: parseInt( data.cookTime )??null,
        poisoning: parseFloat(data.poisoning)??null,
        recipe: data.recipe.toString()??'',
        convert: data.convert.toString()??'',
        needItem: data.needItem.toString()??'',
        //내장상수들, div:분할
        div:4,
        maxDiv:4,
        weightDiv: parseFloat(data.weight/4),
        info: data.info.toString()
    }
    return data0;
}
function facilityItem(facilityName){
    //시설 추가
    const obj = {
        name: facilityName,
        enabled:true,
        item:{name:facilityName, type:'Furniture', condition:1, path:'Base/default.png'},
        needItem:null,
        removable:true,
        addStorage:false,
        defalutPath:'Base/default.png'
    }
    switch (obj.name){
        //["generator", "bed","sofa", "radio", "faucet","fridge","oven", "micro","storage","livestock","water"];
        case "storage":
            obj.removable=false;
        break;
            case "livestock":
            obj.removable=false;
            obj.item.info ='아직 구현되지 않았습니다.';
        break;
        case "waterSource":
            obj.removable=false;
            obj.item = {name:facilityName, type:'FluidContainer', subType:'taintedWater', condition:10000, path:'Base/default.png'};
            obj.item.info = translating("taintedWaterInfo");
        break;
        case "gaspump":
            obj.removable=false;
            obj.needItem = 'power';
            obj.item = {name:facilityName, type:'FluidContainer', subType:'gasoline', needItem:'power',condition:1000, maxCondition:1000};
            obj.item.info ='전기가 있다면 기름을 뽑아낼 수 있습니다.';
            obj.item.path="Base/Furniture/PumpGas2Go.png";
        break;
        case "generator":
            obj.needItem = 'gasoline';
            obj.item = findMisc(obj.name);
            obj.item.condition = randomInt(0,obj.item.maxCondition);
            obj.enabled=false;
        break;
        case "rainCollectorBarrel":
            obj.needItem ='taintedWater';
            obj.item = findMisc(obj.name);
            obj.item.type = "FluidContainer";
            obj.item.condition=0;
        break;
        
        case "faucet":
            obj.needItem ='water';
             obj.item =findMisc(obj.name);
             obj.item.type = 'FluidContainer';
             obj.item.subType ='water';
             obj.item.condition = 0;
            // obj.item.path="Base/Furniture/Fixtures_sinks_01_9.png";
        break;
        case "radio":
            obj.needItem = 'battery';
            obj.item = findMisc(obj.name);
            obj.item.condition = randomInt(0,obj.item.maxCondition);
             //{name:facilityName, type:'Furniture', needItem:'battery', condition:randomInt(0,50), maxCondition:50, path:'Base/default.png'};
            //obj.item.needItem = 'battery';
        break;
        case "bed":
            obj.item = findMisc("bed");
            obj.item.info ='잠을 잘 수 있습니다(속도만 빠름)';
        break;
        case "sofa":
            obj.item = findMisc("sofa");
            obj.item.info ='잠을 잘 수 있습니다(속도만 빠름)';
        break;
        case "fridge":
            obj.needItem = 'power';
            obj.enabled=true;
            obj.item = findMisc("fridge");
            obj.addStorage=true;
        break;
        case "oven":
            obj.needItem = 'power';
            obj.enabled=false;
            obj.item = findMisc("oven");
            obj.addStorage=true;
        break;
        case "micro":
            obj.needItem = 'power';
            obj.enabled=false;
            obj.item.info ='조리 가능한 음식을 요리하거나 오염된 물을 정화할 수 있습니다.;(철제 음식 재료를 넣으면 불이 날 예정입니다.)';
            obj.item.weight = 10;
            obj.item.path = 'Base/Furniture/Appliances_cooking_01_28.png';
            obj.addStorage=true;
            //addStorageList(facilityName, [], -1, 1);
        break;
        default:
            
        break;
    }
    return obj;
}
function findMapData(itemName){
    //맵 데이터 검색 및 가공해서 반환
    const data = mapDatas.find(d => d.name === itemName);
    let storageArray = [];
   
    const facils = data.thisFacilities.length>0? data.thisFacilities.split(";") : [];
    facils.push('storage','livestock');//항상 추가
    const facilityArray =[];
    for(let i =0 ; i<facils.length;i++){
        const _value = facils[i].split("-");
        const facilityName = _value[0];
        let make =true;
        let rng = parseFloat(_value[1])??1;
        if(_value[1]==null){
            rng = 1;
        }
        if(Math.random() <= rng){
            //생성
            make=true;
        }else{
            make =false;
        }
        
        if(make){
            const item = facilityItem(facilityName);
            facilityArray.push(item);
            if(item.addStorage){
                storageArray.push( {name:facilityName, inventory:[] });
            }
        }
        
    }

     let dropItemsArray=[];
    const dropTable = data.dropItems.split(";");
    for(let i =0;i<dropTable.length ; i++){
        _dropitem = dropTable[i].split("-");
        let rng = Math.random();
        if(rng < parseFloat(_dropitem[1])){
           // console.log(`${item[0]} (${(rng*100).toFixed(2)})`);
           let item = findItem( _dropitem[0]);
           if(_dropitem[2]!=null){
             const amount = parseInt(_dropitem[2])??-1;
           // console.log(amount);
           //아이템 추가 시 condition 지정...
            if(amount>=0){
                item.condition = amount;
                //console.log(item.condition);
            }else{
                item.condition = randomInt(1, item.maxCondition);
            }
                
           }
           if(item.subType=='food' || item.subType=='water'){
                for(let n=0 ;n<storageArray.length; n++){
                    if(storageArray[n].name == 'fridge'){
                        //신선한 음식은 냉장고에 넣기
                        storageArray[n].inventory.push( item );
                        break;
                    }
                }
           }else{
               dropItemsArray.push( item);
           }
            
        }
    }
    storageArray.splice(0,0, {name:(JSON.parse(data.outdoor)?"ground":"storage"), inventory:dropItemsArray} );


    const LivestockZone = [];
    const LivestockZoneArray= data.LivestockZone.split(";");
    for(let i =0; i< LivestockZoneArray.length ; i++){
        _obj = LivestockZoneArray[i].split("-");
        let rng = Math.random();
        if(rng< parseFloat(_obj[1])){
            //동물, 나무 등 등장
            LivestockZone.push({name: _obj[0] , positionX:(130+ i*120+ randomInt(20,40)) ,positionY:(randomInt(5,20))});
        }
    }
    let data0 ={
        name: data.name,
        outdoor: JSON.parse(data.outdoor),
        zombies:[],
        src: data.src,
        thisFacilities: facilityArray,
        storages:storageArray,
        farmZone: [],
        livestockZone : LivestockZone
    }
    for(let i =0; i< parseInt( data.zombieNum) ;i++){
        data0.zombies.push( spawnZombie( 'random') );
    }
    return data0
}
function randomMapData(){
    let item = [];
    if(currentMapData.name =="road"){
        //현재 길거리에 있을 때에만
        const rng = Math.random();
        if(rng<0.15){
            item.push( findMapData('store_tool'));
        }else if(rng<0.3){
            item.push( findMapData('gas'));
            item.push( findMapData('store_gas'));
        }else if(rng<0.45){
            item.push(  findMapData("livestock"));
        }else if(rng<0.65){
            item.push(  findMapData("river"));
            item.push(  findMapData("house"));
            //item.push(  findMapData('road'));
        }else{
            item.push(  findMapData('road'));
        }
    }else{
        item.push(  findMapData('road'));
    }
    return item;
}

function randomDropTable(array){
    return array[randomInt(0,array.length)];
}