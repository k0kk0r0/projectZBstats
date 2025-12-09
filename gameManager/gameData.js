
//아이템리스트
let weaponDatas = []; //무기리스트
let clothDatas = []; //의상리스트
let mapDatas = [];//맵리스트
let miscDatas = [];//기타 아이템 리스트
let foodDatas = [];
let modDatas = [];//모드 데이터

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
    
    mapDatas = await loadItemDatas("mapDatas.csv");
    weaponDatas = await loadItemDatas("items/weapons.csv");
    miscDatas = await loadItemDatas("items/miscs.csv");
    foodDatas = await loadItemDatas("items/foods.csv");
    clothDatas = await loadItemDatas("items/cloths.csv"); 
    
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
    let data0 ={
        path: data.path.toString(),
        name: data.name.toString(),
        type: data.type.toString(),
        subType: data.subType.toString(),
        condition: parseInt(data.condition),
        maxCondition: parseInt(data.condition),
        convert: data.convert.toString(),
        weight: parseFloat(data.weight)
    }
    return data0;
}
function findMisc(itemName ){
    //기타 아이템 데이터 검색 및 가공해서 반환
    const data = miscDatas.find(w => w.name === itemName);
    if(data==null){ return null }
    let data0 ={
        path: data.path.toString(),
        name: data.name.toString(),
        type: data.type.toString(),
        subType: data.subType.toString(),
        condition: parseInt(data.condition),
        maxCondition: parseInt(data.condition),
        convert: data.convert.toString(),
        weight: parseFloat(data.weight),
        count: parseInt(data.count)??0,
        info: data.info.toString()
    }
    return data0;
}
function findFood(itemName ){
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
function facilityItem(facilityName){
    //시설 추가
    const obj = {
        name: facilityName,
        enabled:true,
        item:{name:facilityName, type:'Furniture', condition:1, path:'Base/default.png'},
        needItem:null,
        removable:true,
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
            obj.item = {name:facilityName, type:'FluidContainer', subType:'taintedWater', condition:1, path:'Base/default.png'};
            obj.item.info = translations[currentLang].taintedWaterInfo;
        break;
        case "faucet":
            obj.needItem ='water';
            obj.item = {name:facilityName, type:'FluidContainer',subType:'water', condition:10, maxCondition:10, path:'Base/default.png'};
             obj.item.weight = 10;
        break;
        case "radio":
            obj.needItem = 'battery';
            obj.item = {name:facilityName, type:'Furniture', condition:10, maxCondition:10, path:'Base/default.png'};
            obj.item.info ='아직 라디오 건전지는 닳지 않습니다.';
            obj.item.weight = 2;
        break;
        case "bed":
            obj.item.info ='잠을 잘 수 있습니다(속도만 빠름)';
             obj.item.weight = 40;
        break;
        case "sofa":
            obj.item.info ='잠을 잘 수 있습니다(속도만 빠름)';
             obj.item.weight = 20;
        break;
        case "fridge":
            obj.needItem = 'power';
            obj.enabled=true;
            obj.item.info ='음식물이 상하는 속도가 1/2로 감소합니다';
             obj.item.weight = 40;
        break;
        case "oven":
            obj.needItem = 'power';
            obj.enabled=false;
            obj.item.info ='아직 구현되지 않았습니다.';
             obj.item.weight = 20;
        break;
        case "micro":
            obj.needItem = 'power';
            obj.enabled=false;
            obj.item.info ='아직 구현되지 않았습니다.';
             obj.item.weight = 10;
        break;
        default:
            
        break;
    }
    return obj;
}
function findMapData(itemName){
    //맵 데이터 검색 및 가공해서 반환
    const data = mapDatas.find(d => d.name === itemName);
    let dropItemsArray=[];
    const dropTable = data.dropItems.split(";");
    for(let i =0;i<dropTable.length ; i++){
        _dropitem = dropTable[i].split("-");
        let rng = Math.random();
        if(rng < parseFloat(_dropitem[1])){
           // console.log(`${item[0]} (${(rng*100).toFixed(2)})`);
           let item = findItem( _dropitem[0]);
           if(_dropitem[2]!=null){
                item.condition = randomInt(1, item.maxCondition);
           }
            dropItemsArray.push( item);
        }
    }
    const facils = data.thisFacilities.length>0? data.thisFacilities.split(";") : [];
    facils.push('storage','livestock');//항상 추가)
    const facilityArray =[];
    for(let i =0 ; i<facils.length;i++){
        const facilityName = facils[i];
        facilityArray.push(facilityItem(facilityName));
    }
    let data0 ={
        name: data.name,
        outdoor: JSON.parse(data.outdoor),
        zombies:[],
        src: data.src,
        thisFacilities: facilityArray,
        storages:[{name:(JSON.parse(data.outdoor)?"ground":"storage"), inventory:dropItemsArray}]
    }
    for(let i =0; i< parseInt( data.zombieNum) ;i++){
        data0.zombies.push( spawnZombie( 'random') );
    }
    return data0
}