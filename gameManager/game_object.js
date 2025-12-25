function renderObjectDiv(data){
    const id= Math.floor(Math.random()*100000);
    const div = document.createElement('div');
    div.id=`object_${id}`;
    div.className = `absolute bottom-${data.positionY} transition-all duration-100 zombieDiv`;
    div.style.left= `${data.positionX}px`;

    const img = document.createElement('img');
    img.src = `images/${data.name}.png`;
    img.className = "absolute w-full h-full";
    //img.id = `zombieImg_${id}`;
    
    
    div.appendChild(img);
    Scene.appendChild(div);

    data.div = div;
    switch(data.name){
        case "Cow":
            
            div.classList.add("z-20", "w-36", "h-36");
            data.item = {name:data.name, condition:100, maxCondition:100, path:"Base/Objects/CowSpotted_Calf.png" , type:"Animal", subType:"milk"};
        break;
        case "Tree":
            const size = randomInt(1,4);
            div.classList.add("z-20", `w-${4*(size+4)}`, `h-${8*(size+4)}`);
            data.item = {name:"Tree", convert:`Logs-${size}`, condition:5, maxCondition:5, path:"Base/Miscs/Logs.png" , type:"Tree", subType:"wood"};
        break;
    }
    div.addEventListener('click', ()=>{
        //console.log(div.id);
        objectSubMenu( data );
    });
}

function spawnObject(){
    //오브젝트 소환
    const array = currentMapData.livestockZone;
    //console.log(array);
    for(let i = 0; i < array.length; i++){
        renderObjectDiv( array[i]);
    }

}
function removeObject(data){
    for(let i =0 ; i  < currentMapData.livestockZone.length; i++){
        if(currentMapData.livestockZone[i] == data.name){
            currentMapData.livestockZone.splice(i,1);
            break;
        }
    }
    Scene.removeChild(data.div);
    //나무 제거
                            
}

function objectSubMenu(data){
    //오브젝트 서브메뉴
    if(data ==null)return
    if(delaying)return
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

    
    makeBox(`${data.name} 정보`, null,"bg-slate-300").addEventListener('click', ()=>{
        //정보 호출
        showItemModal(data.item);
        closeSubOption();
    });
    
    if( gameOver==false){
        if(data.name=="Cow"){
            //소인 경우
            const waterSource = "milk";
            const addFluidname = translating(waterSource);
            makeBox(`${addFluidname} 채우기`,true, itemColor(waterSource)).addEventListener('click', ()=>{
                closeSubOption();

            });
        }
         if(data.name=="Tree"){
            makeBox(`나무 베기`, true,"bg-blue-300").addEventListener('click', ()=>{
                closeSubOption();
                if(equipments.weapon!=null && equipments.weapon.subType =='Axe'){
                    delaying =true;
                    renderGameUI();
                    let delay =0;
                    let carpent = setInterval(()=>{
                        
                        if(delay>=4){
                            playerMove(50);
                            stat.stamina-=2;
                            delaying =false;
                            clearInterval(carpent);
                            removeObject(data);
                            
                            log(`나무를 베었습니다.`);
                            const div = data.item.convert.split(";");
                           
                            for(let n =0; n<div.length ;n++){
                                 const data= itemCommaDivide(div[n]);
                                 pushItemToInventory(storage[0].inventory , data.item.name ,  data.amount);
                            }
                            
                            advanceTurn();
                        }else{
                            delay++;
                             playerMove(50);
                             stat.stamina-=2;
                        }
                        renderGameUI();
                    }, 500);


                    
                }else{
                    log_popup(`도끼를 장착해야 합니다`);
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
