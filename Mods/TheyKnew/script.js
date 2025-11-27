// Mods/TheyKnew/script.js 내용
async function main(dataPath) {

    dataload(dataPath);
    console.log('이 모드가 로드되었습니다.');
    // 여기서 실제 모드 로직을 구현합니다.
}

async function dataload(dataPath){
    const datas = await loadCSVData(dataPath);
    
    for(let i =0 ;i< datas.length;i++){
         miscDatas.push(datas[i]);
         //console.log(datas[i]);
    }
   
}
function addItems(){
    return "Zomboxivir,CannedCornedBeef";
}
function healZomboxivir(name){
    if(name=='Zomboxivir'){
        return "zombie";
    }
    return null;
}

// 반드시 main 함수를 반환해야 합니다.
return {
    main: main,
    cureWound :healZomboxivir,
    addItems: addItems,
}