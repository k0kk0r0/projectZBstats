///////////////////////////////////////////////////////////////////////////////////////////
const recipeTag = document.getElementById("recipeTag");
const recipeList = document.getElementById("recipeList");
let recipeIndex = 'all';
let makeInterval =null;
function addRecipeTag(name){
    //<button class="text-xl font-bold p-2 border rounded bg-blue-400">📦보관함</button>
    //<button class="text-xl font-bold p-2 border rounded bg-slate-400">⚰시체</button>
    let icon ='';
    switch(name){
        case 'carpentry':
            icon ='🪵';
            break;
        case 'misc':
            icon ='🔩';
            break;
        case 'furniture':
            icon ='📦';
            break;
        case 'trap':
            icon ='🪤';
            break;
        case 'cloth':
            icon='🧣';
            break;
        default:
            icon ='🌐';
            break;
    }
    const btn = document.createElement('button');
    btn.className = "text-xl font-bold p-2 border rounded recipeTagBtn";
    btn.innerText = `${icon}${translating(name)}`;
    btn.dataset.name = name;
    btn.addEventListener('click', ()=>{
        recipeIndex = btn.dataset.name;
        renderCraftModal();
        clearInterval(makeInterval);
        makeInterval=null;
    });
    recipeTag.appendChild(btn);
}
function renderCraftModal(){
    //제작 레시피 창 
    recipeList.innerHTML='';
    recipeTag.innerHTML='';
    const list=['all', 'misc', 'carpentry', 'furniture'];
    for(let i =0 ;i <list.length; i++){
        addRecipeTag( list[i]);
    }

    function makeBox(data){
        // HTML 구성 아이템
        
        
        const originalItemList =[];
        const convertItemList = [];
        let origin='';
        for(let n =0; n < data.original.length; n++){
           
            const item =findItem(data.original[n].name);
            item.amount = parseInt( data.original[n].amount);
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
            item.amount = parseInt( data.convert[n].amount);
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
        if(data.needTool.length>0){
            const needTool = findItem(data.needTool);
            needItemIcon =`<img class="w-8 h-8" src=${needTool.path}>`;
        }
        
        const item = document.createElement("div");
        item.dataset.type = data.type;

        item.className = "relative bg-gray-200 rounded h-12 overflow-hidden recipeList";

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
             const indexArray=[];
            if(makeInterval==null){

                for(let i =0 ; i< originalItemList.length; i++){
                    const needItem = originalItemList[i];
                    let num = 0;
                    for(let n = 0; n< inventory.length; n++){
                       // if((inventory[n].name).startsWith(needItem.name)){
                         if((inventory[n].name).split("_")[0]==(needItem.name)){
                            if(Number.isNaN(inventory[n].condition)){
                                indexArray.push(n); 
                                num++;
                            }else{
                                
                                for(let a=num; a <needItem.amount;a++){
                                    if(inventory[n].condition - num> 0){
                                        indexArray.push(n); 
                                        num++;
                                    }else{
                                        
                                    }
                                    
                                }
                            }
                            
                            if(num>=needItem.amount){
                                break;
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
                //console.log(indexArray);
                const needTool = findInventoryItemData(data.needTool);
                if(data.needTool.length>0 && needTool==null){
                    log_popup(`${translating(data.needTool)} 도구가 없습니다`);
                    if(!debug)return;    
                }
                
                makeInterval = setInterval(()=>{
                    progress+=4;
                    //console.log(progress);
                    pgbar.classList.remove('hidden');
                    pgbar.style.width = `${progress}%`;
                    if(progress>=120){
                        make();
                        pgbar.classList.add('hidden');
                        pgbar.style.width = `0%`;
                        clearInterval(makeInterval);
                        makeInterval =null;
                    }
                },50);

                
                function make(){
                    for(let n = 0 ;n <indexArray.length ;n++){
                        const item = inventory[indexArray[n]];
                        console.log(item.name, indexArray[n]);
                        if(Number.isNaN(item.condition)){
                            //갯수가 아예 없는 경우
                            item.subType = 'remove';
                            item.condition = -1;
                        }else{
                            //갯수 1개 차감
                            item.condition--;
                            if(item.condition<=0){
                                item.subType='remove';
                                item.condition = -1;
                            }
                        }
                    }
                    if(needTool!=null){
                        //툴 내구도 차감
                        needTool.condition-=1;
                    }
                    
                    
                    /*
                   for(let n =0 ;n<matrials.length;n++){
                        for(let i =0 ; i< originalItemList.length; i++){
                            const needItem = originalItemList[i];
                        // console.log(matrials[n]);
                            if(needItem.name == matrials[n].name){
                                 console.log(needItem.name);
                                if(Number.isNaN(matrials[n].condition)){
                                    //갯수가 없는 아이템의 경우 바로삭제
                                    
                                
                                    matrials[n].subType='matrial';
                                    matrials[n].condition=-1;
                                    break;
                                }else{
                                    if( matrials[n].condition- needItem.amount >= 0 ){
                                        matrials[n].condition -= needItem.amount;
                                        if(matrials[n].condition<=0){
                                            matrials[n].subType='matrial';
                                        }
                                        break;
                                    }
                                }
                            }                             
                             
                        }
                   }
                    */
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
            //console.log(data.type);
        }
        
    }
    const recipeDivList = recipeList.querySelectorAll(".recipeList");
    for(let n =0 ; n < recipeDivList.length; n++){
        if(recipeIndex=='all'){
            //모두 표시
            recipeDivList[n].classList.remove('hidden');
        }else{
            if(recipeDivList[n].dataset.type == recipeIndex){
                //같은 타입의 경우
                recipeDivList[n].classList.remove('hidden');
            }else{
                recipeDivList[n].classList.add('hidden');
            }
        }
    }

    const recipeTagBtn = recipeTag.querySelectorAll(".recipeTagBtn");
    for(let n =0 ; n < recipeTagBtn.length; n++){
        if(recipeTagBtn[n].dataset.name == recipeIndex){
            //선택된 상태라면
            recipeTagBtn[n].classList.remove('bg-slate-400');
            recipeTagBtn[n].classList.add('bg-blue-500');
        }else{
            recipeTagBtn[n].classList.add('bg-slate-400');
            recipeTagBtn[n].classList.remove('bg-blue-500');
        }
    }
}