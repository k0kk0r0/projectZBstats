//플레이어 변수 계산
function playerStat(){
    //4~-4, 무조건표시값은 100;
    if(health<=0){
        setMoodleValue('Zombie',100);
        setMoodleValue('Panic',0);
        setMoodleValue('Endurance',0);
        return null;
    }

    let panicMd = findMoodle('Panic');
    //패닉수치 계산(임시)
    if(zombies.length>2){
        const panic = Math.floor(zombies.length/3);
        const n = panic>4 ? 4:panic;
        panicMd.value = -n;
    }else{
        if(playerHasTrait("claustophobic") && currentMapData.outdoor==false){
            //밀실공포
            panicMd.value = -1;
        }
        else if(playerHasTrait("agoraphobic") && currentMapData.outdoor==true){
            //광장공포
            panicMd.value = -1;
        }else{
            panicMd.value = 0;
        } 
        //setMoodleValue('Moodle_Icon_Panic',0);
    }
    if(playerHasTrait("brave") || playerHasTrait("Desensitized")){
        //용감한, 둔감한
        //console.log("Desensitized");
        panicMd.value = 0;
    }
   
    let enduValue = 0;
    if(stamina<=75){enduValue-- };
    if(stamina<=50){enduValue--};
    if(stamina<=25){enduValue--};
    if(stamina<=10){enduValue--};
    setMoodleValue('Endurance', enduValue);


    let str = findPlayerSkill('strength').lv;
    let fit= findPlayerSkill('fitness').lv;
    let _bagWeight = 8+str;
    if(playerHasTrait("disorganized")){ _bagWeight = Math.floor((_bagWeight*0.7)*10)/10 }
    if(playerHasTrait("organized")){ _bagWeight = Math.floor((_bagWeight*1.3)*10)/10 }


    //데이터반환
    return {bagWeight:_bagWeight, strength:str, fitness:fit, panic:-panicMd.value, endurance: enduValue };
}
function addSkillXp(name, value){
    let data = findPlayerSkill(name);
    if(data !=null){
        //현자, 느린학습, 피공포증 등 적용
        let xpvalue = 1;
        if(playerHasTrait('fastlearner')){ xpvalue *= 1.3}
        if(playerHasTrait('slowlearner')){ xpvalue *= 0.7}
        if(playerHasTrait('pacifist')){
            if(name == 'Axe' || name=='ShortBlade' || name=='LongBlade' || name=='ShortBlunt' || name=='LongBlunt'){
                xpvalue *= 0.75;
            }
        }
        data.xp += Math.ceil((value*xpvalue)*10)/10;
        //console.log(xpvalue);
        while(data.xp>data.maxXp){
            if(data.lv==10){
                data.xp = data.maxXp;
                break;
            }else{
                data.lv ++;
                data.xp -= data.maxXp;
                data.maxXp = xpData[ data.lv ];
                log(`[${translations[currentLang][name]}] Level ${data.lv}로 레벨업!`);
            }
        }
       
    }else{
        return null;
    }
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
    const stat = playerStat();
    if(equipments.weapon ==null){
        if(zombies.length>0){
            //좀비가 1명 이상
            if(zombies[0].isStunning>0){
                stamina -= pushStamina;
                if(stamina<=0){
                    stamina = 0;
                }
                let damage = (stat.strength*4+ randomInt(0,stat.strength ));

                zombieIsDamaged(0, damage);
                addSkillXp( 'strength', damage);

                
                
                zombieMove(0,10);
                zombieStun(0,1);
                log(`플레이어의 밟기 공격! ${damage} 대미지`);
                return;
            }
        }
        playerPush(2);
        return;
    }
    //무기 스태미나 소모
    stamina -= equipments.weapon.stamina;
    if(stamina<=0){
        stamina = 0;
    }
    
    


    log(`플레이어의 ${translations[currentLang][equipments.weapon.name]} 무기 공격! `+ ((stat.endurance<0)? `(지침 ${-stat.endurance}단계)`:``) );
    let num = (multiHit >= zombies.length)? zombies.length : multiHit; 

    let skillLv = findPlayerSkill(equipments.weapon.subType).lv;
    for(let i =0 ; i< num; i++){
        //대미지 계산
        
        let damage = (parseFloat(equipments.weapon.damage) /2 + randomInt(0,parseFloat(equipments.weapon.damage)/2))*(skillLv+1);
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
        addSkillXp( equipments.weapon.subType, damage);
        addSkillXp( 'strength', damage);

        log( (stat.panic>0?`패닉 ${stat.panic}단계(대미지${((5-stat.panic)/5*100).toFixed(0)}%) - `:"")+ `${i+1}번째 좀비가 ${damage}의 대미지를 입었다.`);
        let rng = Math.random();
        const stunPer = 0.35 + stat.strength0*0.05;
        if(rng<= stunPer){
            //확률로 넉백
            zombies[i].isStunning = 4; //스턴 턴 횟수
            zombieMove(i,10);
            zombieStun(i,4);
            log(`근력 ${stat.strength}, ${(stunPer*100).toFixed(1)}% 확률로 넉백!`);
        }else{
            //좀비 경직을 넣을까?
            zombieMove(i,20);
        }
    }
    if(zombies.length<=0){
        //좀비가 없다
       
    }
    //Maintenance, 물건관리 작
    maintenenceCalculate( equipments.weapon);
    
    renderGameUI();
}
function playerPush(multiHit){
    const stat = playerStat();
    stamina -= pushStamina;//고정값
    if(stamina<=0){
        stamina = 0;
    }
    let num = (multiHit >= zombies.length)? zombies.length : multiHit; 
    log(`플레이어의 밀치기!`);
    for(let i =0 ; i <num ; i++){
        
        //밀치기 계산
       let rng = Math.random();
        const stunPer = 0.35 + stat.strength*0.05;
        if(rng<= stunPer){
            //확률로 넉백            
            log(`근력 ${stat.strength}, ${(stunPer*100).toFixed(1)}% 확률로 넉백!`);
            zombieMove(i,20);
            zombieStun(i,4);
        }else{
            zombieMove(i,10);
            zombieStun(i,1);//zombies[i].isStunning = 1; //한 턴 공격 못하게 미루기
            //log(`넘어트리지 못했지만 좀비가 움찔했다.`,rng)
            
        }
    }
    renderGameUI();
}

function playerIsDamaged(value){
    if(health>0){
        health -= value;
        playerMove(20);
    }

    //https://pzwiki.net/wiki/Health#Types_of_injuries 
    const rng = Math.random();
    const zbrng = Math.random();
    let healer =0;
    let per = 0;
    if(playerHasTrait("thickskinned")){
        //두꺼운피부 버프
        per = -0.05;
    }
    if(playerHasTrait("thinskinned")){
        //얇은 피부 패널티
        per = 0.05;
    }
    if(playerHasTrait("fasthealer")){
        //빠른회복
        healer = -5;
    }
    if(playerHasTrait("slowhealer")){
        healer = 5;
    }
    //slowhealer, fasthealer, thinskinned, thickskinned
    let defend=false;
    const clothDefendPer =0.65;
    if(equipments.armor != null){
        if(equipments.armor.condition>1){
            //방어구 장착시 상처 확률 감소
            const armorRng = Math.random();
            if( armorRng < clothDefendPer){
                defend = true;
                //의상으로 방어
                equipments.armor.condition--;
                log(`${clothDefendPer*100}% 확률로 장착한 [${translations[currentLang][equipments.armor.name]??equipments.armor.name}] 의상으로 막아냈습니다.`);
                renderGameUI();//renderEquipment()포함
                return;
            }
        }
    }
    if(rng< 0.1 +per){
        //물림
        wound.push( {tag:"bitten", heal:-1, turn:(100+healer*4)} );
        wound.push({tag:"zombie", heal:-1, turn:(100+healer*4) , turn0:(100+healer*4)}); 
        log(`${ ((0.1+per)*100).toFixed(1) }% 확률로 좀비에게 [물렸]습니다.` ,true);
    }else if(rng<0.4+per){
        //찢어진상처
        wound.push( {tag:"scratched", heal:-1, turn:randomInt(20+healer,40+healer)} );
        log(`${ ((0.4 +per)*100).toFixed(1) }% 확률로 좀비에게 [찢어진 상처]를 입었습니다.` );
        if(zbrng<0.25){
            //감염
            wound.push({tag:"zombie", heal:-1, turn:(100+healer*4) , turn0:(100+healer*4)}); 
        }
    }else{
        //긁힘
        wound.push( {tag:"lacerated", heal:-1, turn:randomInt(17+healer,25+healer)} );
        log(`${ ((0.6 +per)*100).toFixed(1) }% 확률로 좀비에게 [긁혔]습니다.`);
        if(zbrng<0.07){
            //감염
            wound.push({tag:"zombie", heal:-1, turn:(100+healer*4) , turn0:(100+healer*4)}); 
        }
    }
    
    renderGameUI();
}
function woundHealingCalculate(){
    let wndCount=0;
    for(let i=0;i<wound.length;i++){
        let data = wound[i];
        data.turn += data.heal;
        
        if(data.turn<=0){
            if( data.tag =="zombie" || data.tag =="bleach"){
                //좀비화 상태의 경우 즉시 게임오버
                health=0;
                checkGameOver();
                return;
            }
            wound.splice(i,1);
            i--;
            wndCount--;
        }
        else if(data.turn>= data.turn0){
            //치료완료
            wound.splice(i,1);
            i--;
        }else{
            //질환 도중
            if(data.tag =="zombie"){
                if(data.turn/data.turn0  <= 0.2){
                    setMoodleValue('Sick',-2);
                    setMoodleValue('Stressed',-4);
                }else  if(data.turn/data.turn0  <= 0.3){
                    setMoodleValue('Sick',-1);
                    setMoodleValue('Stressed',-3);
                }else if(data.turn/data.turn0  <= 0.5){
                    setMoodleValue('Stressed',-2);
                }else if(data.turn/data.turn0  <= 0.8){
                    setMoodleValue('Stressed',-1);
                }
            }
            if(data.tag =="bleach"){
                if(data.turn/data.turn0  <= 0.5){
                    health-= 20;
                    setMoodleValue('Sick',-2);
                }else{
                    setMoodleValue('Sick',-1);
                }
                
            }
            if(data.heal<0){
                if(data.tag=="scratched" || data.tag == "bitten"){
                    wndCount++;
                    health -=2;;
                }
                if(data.tag=="lacerated"){
                    health -=1.5;
                    wndCount++;
                }
            }
            
        }
    }
    setMoodleValue('Bleeding', wndCount>4? -4 : -wndCount);
}
function playerHealing(itemIndex){
    let bool =  playerBanding(itemIndex);
    if(bool){
        advanceTurn();
    }else{
        log(`치료할 상처가 없습니다`,true);
    }
}
function playerBanding(itemIndex){
    let bool =false;
    
    for(let i =0 ; i<wound.length; i++){
        let data = wound[i];
        if(data.heal<0){
             if(data.tag =="lacerated" || data.tag =="scratched" || data.tag=="bitten"){
                const txt = `${translations[currentLang][inventory[itemIndex].name]}을 소모하여 [${translations[currentLang][data.tag]}]에 붕대 감음.`;
                log(txt,true);
                //wound.splice(i,1);
                //i--;
                data.heal = 1;
                bool = true;
                inventory.splice(itemIndex,1);
                renderStorageModal();
                break;
            }
        }

    }
    return bool;
}
function cureWound(name){
    let bool =false;
    for(let i =0 ; i<wound.length; i++){
        let data = wound[i];
        if(data.tag == name && data.heal<0){
            //wound.splice(i,1);
            //i--;
            data.heal = 1;
            //모든 좀비화 치료
            bool = true;
        }
    }
    return bool;
}

//마시기
function playerDrink( fluidType , item ){
    //fluidType 은 water, gas, bleach 등등
    if(item==null){
        return
    }
    if(item.condition>0){
        item.condition--;
         if(fluidType=="bleach"){
            //락스
            wound.push({tag:fluidType, heal:-1, turn:20 , turn0:20}); 
            log(`끔찍한 선택을 했군요... 락스를 마셨습니다.`,true);
            closeStorageModal();
        }else if(fluidType =="water"){
            //물 섭취
            log(`물을 마셨습니다.(${item.condition}/${item.maxCondition})`,true );
        }
    }else{
        log(`통이 비어있습니다.`,true);
    }
   
}
//먹기
function playerEatFood(item, div=1){
    if(item==null){
        return
    }
    //배고픔 해결
    item.div -= div;
    item.weight = Math.round((item.weight-item.weightDiv*div)*100)/100;
    log(`${translations[currentLang][item.name]??item.name} 음식을 섭취했습니다.(${item.div}/${item.maxDiv})`,true );
    if(item.div<=0){
        for(let i =0 ;i<inventory.length ; i++){  
            if(inventory[i] == item){
                inventory[i] = findItem( item.convert );
                if(inventory[i] == null){
                    inventory.splice(i,1);
                }
                break;
               
                
            }
        }
    }

}