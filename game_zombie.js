//좀비생성함수
function spawnZombie(num){
    zombies.push( {  hp: 40, isAnimating: false ,isStunning:0}) ;
}
function spawnZombies(num, min=0){
    const rng = randomInt(0,num);
    for(let i =0 ; i <rng+min; i++){
        spawnZombie(i);
    }
    for(let i =0; i< zombies.length; i++){
        if(i<zombieElements.length){
            zombieElements[i].style.right =(200- 60*i)+ "px";
            zombieElements[i].classList.remove('hidden');
            zombieElements[i].classList.remove(stunClass);
            zombieMove(i);
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
        log(`${txt}주변의 좀비가 이끌려 나타났습니다.`, `${rng.toFixed(8)} < ${per.toFixed(3)}`);
        spawnZombie(num,1);
        stopResting();
        stack.zombieSpawn = 0;
    }
}
function zombieAttack( timedelay=600){
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
                setTimeout(() => {
                    if(gameOver)return;
                    log(`좀비${i}의 공격!`);
                    zombieMove(i,-45);
                    playerIsDamaged( 5);
                    //TurnEnd();
                },  timedelay +i*250);
            }
        }
         setTimeout(() => { 
            if(gameOver)return;
            delaying = false;
            zombieSwapping();
            TurnEnd();
        }, timedelay+400+num*200);
        
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
    if(zombies[index].hp<0){return};
    if (zombies[index].isAnimating) return; // 이미 움직이면 무시
    if(index>= zombieElements.length){return};
    zombies[index].isAnimating = true;

    // 현재 위치 가져오기
    const startPos = parseFloat(zombieElements[index].style.right) || 0;
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
            zombieElements[index].style.right = currentPos + "px";
            requestAnimationFrame(moveRight);
        } else {
            zombieElements[index].style.right = targetPos + "px";
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
            zombieElements[index].style.right = currentPos + "px";
            requestAnimationFrame(() => moveLeft(start));
        } else {
            zombieElements[index].style.right = startPos + "px"; // 원위치 고정
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
    }
}
