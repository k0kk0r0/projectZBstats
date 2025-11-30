//좀비생성함수
const zombieNames = ["TheyKnew","pants","policeman","farmer"];
function spawnZombie(_tag='random'){
    let zombieTag = '';
    const zombieInven = [];

    //옷가지
    if(Math.random()<0.2){
        zombieInven.push("TshirtGeneric-0.7-");
    }else{
        zombieInven.push("ShirtGeneric-0.7-");
    }

   
    zombieInven.push(`DigitalWatch${Math.random()<0.15?'_fancy':(Math.random()<0.5?'_red':'')}-0.3`)
    

    //좀비종류
    if(_tag=='random'){
        const rng = Math.random();
        if(rng < 0.1){
            zombieTag = "TheyKnew";
            zombieInven.push( "Zomboxivir-0.3");
        }
        else if(rng <0.3){
            zombieTag = "policeman";
            zombieInven.push("NightStick-0.2-");  

        }else if(rng<0.5){
            zombieTag = "farmer";
            zombieInven.push("Shovel-0.2-");
        }else{
            zombieTag = "pants";
            zombieInven.push("Rag-0.7");
            zombieInven.push("WaterBottle-0.1-"); 
        }
    }else{
        zombieTag = _tag;
    }
    return zombie = {tag:zombieTag, inventory:zombieInven};
}


function renderZombieDiv(zombie){
    const id= Math.floor(Math.random()*100000);
    const div = document.createElement('div');
    div.id=`zombie_${id}`;
    div.className = "absolute bottom-4 right-0 w-24 h-32 z-20 transition-all duration-100 zombieDiv";

    const img = document.createElement('img');
    img.src = `images/zb_${ zombie.tag}.png`;
    img.className = "absolute w-full h-full";
    //img.id = `zombieImg_${id}`;
    
    
    div.appendChild(img);
    Scene.appendChild(div);
    zombie.div = div;
    zombie.img = img;
    zombie.id = id;
    zombie.hp = randomInt(40,60);
    zombie.isAnimating = false;
    zombie.isStunning = 0;

    zombies.push( zombie);
}
function spawnZombies(){
    for(let i =0; i< currentMapData.zombies.length; i++){
        renderZombieDiv(currentMapData.zombies[i]);
    }
   renderZombie();
}
//대미지 숫자 표시
function createDamageNumber(num, position){
    const div = document.createElement("span");
    div.className = "absolute font-bold text-red-600 text-4xl text-bold w-32 h-32 z-50 transition-all duration-100";
    div.style="-webkit-text-stroke: 1px black;";
    div.style.bottom = `20px`;
    div.style.right = `${parseFloat(position)-40}px`;
    div.innerText = num;
    Scene.appendChild(div);
    setTimeout(() => {
        if(gameOver)return;
        Scene.removeChild(div);
    },  400);
    //console.log(parseFloat(position)-40);
}
function renderZombie(){
    if(gameOver)return;
    //좀비 동작 표시
     zombies = currentMapData.zombies;

    for(let i =0; i< zombies.length; i++){
        zombies[i].div.style.right= `${(300-i*60)}px`;
        zombies[i].div.classList.remove(stunClass);
        //zombieMove(i);
        
        if(zombies[i].isStunning>0){
            //스턴 된 경우
            if(zombies[i].img.classList.contains(stunClass)){

            }else{
                zombies[i].img.classList.add(stunClass, "top-7");
            }
        }else{
            zombies[i].img.classList.remove(stunClass,"top-7");
        }

        
        if(zombies[i].hp <=0){
            //체력 감소 시 좀비 숨김, 좀비 사망
            const div = zombies[i].div;
            const zombieInven = zombies[i].inventory;
            zombies[i].img.classList.add(stunClass, "top-7");
            setTimeout(() => {
                if(gameOver) return;
                zombieDropItem(zombieInven);
                Scene.removeChild(div);
                
                
            },  1200);

            
            zombieKillCount++;
            //currentMapData.zombies.splice(i,1);
            zombies.splice(i,1);
            i--;
            
           
        }else{

        }
    }
    
}
function callZombies(num, addPer=0){
    //좀비소환
    //stack.zombieSpawn++;
    const rng = Math.random();
    let per = 0.05 + zombies.length*0.01 + addPer + stack.zombieSpawn* 0.01;
    let txt =""
    if(playerHasTrait("conspicuous")){
        //넘치는존재감
        txt = "<넘치는 존재감>으로 ";
        per = per*2;
    }
    if(playerHasTrait("inconspicuous")){
        //부족한존재감
        txt = "<부족한 존재감>에도 불구하고 ";
        per = per/2;
    }

    if(rng <= per){
        closeStorageModal();
        let zombieData = spawnZombie();
        let nextzombies =[];
        if(mapNum>0){
            if(mapData[mapNum+1]!=null ){
                nextzombies= mapData[mapNum+1].zombies;
                
            }
            if(nextzombies.length<=0 && mapData[mapNum-1]!=null){
                nextzombies= mapData[mapNum-1].zombies;

            }
            if(nextzombies.length>0){
                //다음 맵 좀비 끌어오기
                
                const zn= randomInt(0, nextzombies.length);
                zombieData = nextzombies[zn];
                nextzombies.splice(zn,1);
                //console.log(`다음 맵 ${zn}번째 좀비 끌어오기`);
            }
        }
        log(`${txt}주변의 좀비가 이끌려 나타났습니다.`, `${rng.toFixed(8)} < ${per.toFixed(3)}`);
        renderZombieDiv(zombieData) ;
        renderZombie();
        stopResting();
        stack.zombieSpawn = 0;
    }
}
function clearZombies(){
    
    Scene.querySelectorAll(`.zombieDiv`).forEach( (element) => {
        Scene.removeChild(element);
    } );
    zombies=[];
}
function zombieAttack( timedelay=300){
    if(zombies.length>0){
        const attackNum = 2;
        const num = (attackNum > zombies.length)? zombies.length: attackNum;
        //console.log(num);
        if(delaying==false){
            delaying = true;
            stopResting();
        }
        for(let i =0; i< num; i++){
            if(zombies[i].hp > 0 && zombies[i].isStunning <= 0 ){
                timedelay += 200;
                setTimeout(() => {
                    if(gameOver)return;
                    log(`좀비${i}의 공격!`);
                    zombieMove(i,-45);
                    playerIsDamaged( 1);
                    //TurnEnd();
                },  timedelay);
            }
        }
         setTimeout(() => { 
            if(gameOver)return;
            delaying = false;
            zombieSwapping();
            TurnEnd();
        }, timedelay);
        //console.log(timedelay);
    }
}
function zombieSwapping(){
    if(zombies.length>1){
        // isStunning 값을 기준으로 오름차순 정렬, 순서변경
        let swap =false;
        for(let i =0 ; i <zombies.length ; i++){
            if(zombies[i].isStunning>0){
                swap=true;
            }
        }
        if(swap){
            log(`뒤에 있던 좀비가 넘어진 좀비를 밟고 지나왔다`);
            zombies.sort((a, b) => a.isStunning - b.isStunning);
        }
    }
}
//좀비 움직임
function zombieMove(index , distance=20) {
    if(gameOver)return;
    if(zombies[index]==null){return};
    //if(zombies[index].hp<=0){return};
    if (zombies[index].isAnimating) return; // 이미 움직이면 무시
    
    zombies[index].isAnimating = true;

    // 현재 위치 가져오기
    const startPos = parseFloat(zombies[index].div.style.right) || 0;
    const targetPos = startPos - distance; // 이동 목표
    const duration = 200; // 이동 시간(ms)
    const startTime = performance.now();

    // 오른쪽으로 이동
    function moveRight(time) {
        if(gameOver)return;
        if(zombies[index] ==null)return;
        const elapsed = time - startTime;
        if (elapsed < duration) {
            const progress = elapsed / duration; // 0 ~ 1
            const currentPos = startPos + (targetPos - startPos) * progress*5;
            zombies[index].div.style.right = currentPos + "px";
            requestAnimationFrame(moveRight);
        } else {
            zombies[index].div.style.right = targetPos + "px";
            // 원위치로 돌아오기 시작 (왕복)
            requestAnimationFrame(() => moveLeft(performance.now()));
        }
    }

    // 왼쪽으로 돌아오기
    function moveLeft(start) {
         if(gameOver)return;
        if(zombies[index] ==null)return;
        const elapsed = performance.now() - start;
        const leftDuration = 200; // 돌아오는 시간
        if (elapsed < leftDuration) {
            const progress = elapsed / leftDuration;
            const currentPos = targetPos - (targetPos - startPos) * progress;
            zombies[index].div.style.right = currentPos + "px";
            requestAnimationFrame(() => moveLeft(start));
        } else {
            zombies[index].div.style.right = startPos + "px"; // 원위치 고정
            zombies[index].isAnimating = false;
        }
    }

    requestAnimationFrame(moveRight);
}

//좀비 스턴계수 추가
function zombieStun(index, stunValue) {
    if(zombies[index]==null){return};
    if(zombies[index].hp<0){return};
    if(zombies[index].isStunning < stunValue){
        zombies[index].isStunning = stunValue;
    }
}
function zombieIsDamaged(index, value){
    if(zombies[index].hp>0){
        zombies[index].hp -= value;
        createDamageNumber(value, zombies[index].div.style.right);
    }
}
//좀비 아이템드롭
function zombieDropItem( zombieInven){
    //아이템드롭
    
    let dropItem = [];
    if(zombieInven.length>0){
        for(let i =0 ;i < zombieInven.length;i++){
            const dropitem = zombieInven[i].split('-');
            if(Math.random() < parseFloat(dropitem[1])){
                let item = findItem(dropitem[0]);
                if(item!=null){
                    if(dropitem[2]!=null){
                        item.condition = randomInt(1,item.maxCondition);
                    }
                    dropItem.push(item );
                }
                
            }
        }
       
    }
    addStorageList('corpse', dropItem, 50);
    renderStorageModal();
}