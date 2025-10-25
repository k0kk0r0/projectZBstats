//플레이어 변수 계산
function playerStat(){
    //4~-4, 무조건표시값은 100;
    if(health<=0){
        setMoodleValue('Moodle_Icon_Zombie',100);
        setMoodleValue('Moodle_Icon_Panic',0);
        setMoodleValue('Moodle_Icon_Endurance',0);
        return;
    }

    let panicMd = findMoodle('Moodle_Icon_Panic');
    //패닉수치 계산(임시)
    if(zombies.length>2){
        const panic = Math.floor(zombies.length/3);
        const n = panic>4 ? 4:panic;
        panicMd.value = -n;
    }else{
        if(findPlayerTrait("claustophobic") !=null && currentMapData.outdoor==false){
            //밀실공포
            panicMd.value = -1;
        }
        else if(findPlayerTrait("agoraphobic")!=null && currentMapData.outdoor==true){
            //광장공포
            panicMd.value = -1;
        }else{
            panicMd.value = 0;
        } 
        //setMoodleValue('Moodle_Icon_Panic',0);
    }
    
   
    let enduValue = 0;
    if(stamina<=75){enduValue-- };
    if(stamina<=50){enduValue--};
    if(stamina<=25){enduValue--};
    if(stamina<=10){enduValue--};
    setMoodleValue('Moodle_Icon_Endurance', enduValue);


    let str = findPlayerTrait("strength");
    let fit= findPlayerTrait("fitness");
    //데이터반환
    return {strength:str.lv, fitness:fit.lv, panic:-panicMd.value, endurance: enduValue, zombie:0};
}


//캐릭터움직임
function playerMove(distance=40) {
  if (isAnimating) return; // 이미 동작 중이면 무시
  isAnimating = true;

  const startPos = basePos;          // 시작 위치
  const targetPos = basePos + distance;    // 이동 목표 위치
  const startTime = performance.now();

  function chaMoveAnimate(time) {
    const elapsed = time - startTime;
    const duration = 200; // 1초

    if (elapsed < duration) {
      const progress = elapsed / duration; // 0 ~ 1
      const currentPos = startPos + (targetPos - startPos) * (1-progress) *5;
      player.style.left = currentPos + "px";
      requestAnimationFrame(chaMoveAnimate);
    } else {
      player.style.left = targetPos + "px";
      isAnimating = false;
    }
  }
  requestAnimationFrame(chaMoveAnimate);
}

function stopResting(){
    if(!isResting) return;
    isResting = false;
    clearInterval(interval );
    interval = null;
    renderGameUI();
    log("휴식 끝");
}
function playerAttack(multiHit){
    
    //무기 스태미나 소모
    stamina -= weapon.stamina;
    if(stamina<=0){
        stamina = 0;
    }
    
    const stat = playerStat();


    log(`${translations[currentLang][weapon.name]}으로 공격! `+ ((stat.endurance<0)? `(지침 ${-stat.endurance}단계)`:``) );
    let num = (multiHit >= zombies.length)? zombies.length : multiHit; 
    for(let i =0 ; i< num; i++){
        //대미지 계산
        let damage = weapon.damage/2 + randomInt(0,weapon.damage/2);
        if(zombies[i].isStunning>0){
            damage = damage*2;
        }
        //패닉
        if(stat.panic>0){
            damage =  damage * (5-stat.panic)/5 ;
        }
        //스태미나 고갈(Endurance)
        if(stat.endurance==-1){ damage * 0.5}
        if(stat.endurance==-2){damage *0.2}
        if(stat.endurance==-3){damage*0.1}
        if(stat.endurance==-4){damage*0.05}

        //대미지 최종 정수화
        damage = Math.ceil(damage);
        // zombies[i].hp -= damage;
        zombieIsDamaged(i, damage);
        damageTxt[i].textContent = `-${damage}`;
        damageTxt[i].classList.remove('hidden');
        setTimeout(() => {
            damageTxt[i].classList.add('hidden');
        }, 300);

        log( (stat.panic>0?`패닉 ${stat.panic}단계(대미지${((5-stat.panic)/5*100).toFixed(0)}%) - `:"")+ `${i+1}번째 좀비가 ${damage}의 대미지를 입었다.`);
        let rng = Math.random();
        const stunPer = 0.35 + stat.strength0*0.05;
        if(rng<= stunPer){
            //확률로 넉백
            zombies[i].isStunning = 4; //스턴 턴 횟수
            zombieMove(i,10);
            zombieStun(i,4);
            log(`근력 ${stat.strength}, ${(stunPer*100).toFixed(1)}% 확률로 넉백!`, rng);
        }else{
            //좀비 경직을 넣을까?
            zombieMove(i,20);
        }
    }
    if(zombies.length<=0){
        //좀비가 없다
       
    }
    
    renderGameUI();
}
function playerPush(multiHit){
    const stat = playerStat();
    stamina -= 5;//고정값?
    if(stamina<=0){
        stamina = 0;
    }
    let num = (multiHit >= zombies.length)? zombies.length : multiHit; 
    log(`밀치기!`);
    for(let i =0 ; i <num ; i++){
        
        //밀치기 계산
       let rng = Math.random();
        const stunPer = 0.35 + stat.strength*0.05;
        if(rng<= stunPer){
            //확률로 넉백            
            log(`근력 ${stat.strength}, ${(stunPer*100).toFixed(1)}% 확률로 넉백!`, rng);
            zombieMove(i,20);
            zombieStun(i,4);
        }else{
            zombieMove(i,10);
            zombieStun(i,1);//zombies[i].isStunning = 1; //한 턴 공격 못하게 미루기
            log(`넘어트리지 못했지만 좀비가 움찔했다.`,rng)
            
        }
    }
    renderGameUI();
}

function playerIsDamaged(value){
    if(health>0){
        health -= value;
        playerMove(20);
    }
    renderGameUI();
}