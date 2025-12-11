//플레이어 변수 계산
function playerStat(){
    //4~-4, 무조건표시값은 100;
    if(stat.health<=0){
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
    if(stat.stamina<=75){enduValue-- };
    if(stat.stamina<=50){enduValue--};
    if(stat.stamina<=25){enduValue--};
    if(stat.stamina<=10){enduValue--};
    setMoodleValue('Endurance', enduValue);


    let str = findPlayerSkill('strength').lv;
    let fit= findPlayerSkill('fitness').lv;
    let _bagWeight = 8+str;
    if(playerHasTrait("disorganized")){ _bagWeight = Math.floor((_bagWeight*0.7)*10)/10 }
    if(playerHasTrait("organized")){ _bagWeight = Math.floor((_bagWeight*1.3)*10)/10 }


    //데이터반환
    return {bagWeight:_bagWeight, strength:str, fitness:fit, stressed:getMoodleValue("Stressed"), panic:-panicMd.value, endurance: enduValue };
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
                log(`[${translating(name)}] Level ${data.lv}로 레벨업!`);
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
function startResting(timer=400){
    //휴식 및 턴 넘기기
     if(gameOver)return;
    if(delaying) return; //딜레이 중이면 무시
    if(isResting){
        stopResting();
        return;
    }
    isResting = true;
    log("휴식중...");
    renderGameUI();
    interval =  setInterval(() => {
        //스태미나, 체력 회복
        if(stat.stamina<100 || stat.health < 100){
             stat.stamina += 10;
             stat.health += 2;
            if(stat.stamina>=100)stat.stamina=100;
            if(stat.health>=100)stat.health=100;
            if(stat.stamina>=100 && stat.health>=100){
                //회복하다가 한 번 멈춤
                stopResting();
            }
        }
        
       
        advanceTurn();
        renderGameUI();
    },timer); 
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
    const playerstat = playerStat();
    stat.thirst-=0.5;
    if(equipments.weapon ==null){
        if(zombies.length>0){
            //좀비가 1명 이상
            if(zombies[0].isStunning>0){
                stat.stamina -= pushStamina;
                if(stat.stamina<=0){
                    stat.stamina = 0;
                }
                let damage = (playerstat.strength*4+ randomInt(0,playerstat.strength ));

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
    stat.stamina -= equipments.weapon.stamina;
    if(stat.stamina<=0){
        stat.stamina = 0;
    }
    
    


    log(`플레이어의 ${translating(equipments.weapon.name)} 무기 공격! `+ ((playerstat.endurance<0)? `(지침 ${-playerstat.endurance}단계)`:``) );
    let num = (multiHit >= zombies.length)? zombies.length : multiHit; 

    let skillLv = findPlayerSkill(equipments.weapon.subType).lv;
    for(let i =0 ; i< num; i++){
        /*
        피해량을 계산하는 방법은 먼저 위키에 명시된 값에서 피해량을 빼는 것입니다. 
        이 범위 내의 값은 무작위로 선택됩니다. 그 다음 보너스/페널티가 곱셈적으로 적용됩니다.
* 체중 부족(20%) 또는 매우 체중 부족에 따른 페널티(40%)
[V] 공황 및 스트레스 페널티(스트레스 또는 공황 단계당 10%)
* 낮은 지구력과 피로에 따른 페널티(레벨은 5%, 10%, 20%, 50%)
[V] 무기 유형별 기술 레벨 인자. (레벨당 30% + 10%입니다)
* 무기 유형에 따른 두 번째 기술 보너스는 3레벨에서 10%, 7레벨에 20%로 증가합니다.
* 피해량이 사거리 감소하지 않는 무기(예: 휘두르는 무기)는 사거리 상한선에 해당하는 보너스가 있고, 가까이 있을 경우 페널티가 있습니다. 
이 효과는 최대 사거리에서 100% 피해 보너스에서 가까이 있을 때 페널티로 선형적으로 적용됩니다. 
(즉: 피해량은 2*거리/최대 사거리를 곱한 상태에서 바닥은 0.3입니다)

* 이 값은 위키에 언급된 힘 보너스/페널티 비율로 곱합니다
[V] 강한 경우 40%, 약한 경우 40% 추가 보너스가 >=9 또는 <=1일 때.
[V] 바닥에 있는 좀비를 공격하면 50% 피해 보너스가 있습니다.
* 양손 무기를 한 손에 사용할 경우 50% 페널티가 있습니다.
* 최근에 좀비를 4번 이상 공격한 경우, 피해량이 300%로 배가되며, 이후 공격할 때마다 150%씩 증가합니다.
* 좀비를 향해 시선을 돌릴 경우 50% 피해 보너스가 있습니다. (>90도 각도와는 다릅니다)
[V] 치명타는 무기에 명시된 비율로 발생하며, 이 비율에 대한 보너스는 무기의 숙련도에 따라 적용됩니다. 이 경우 피해량에 무기 명시된 양이 배됩니다.

마지막으로 이 값에 근접 무기는 22.5, 총은 105를 곱합니다.
*/
        //대미지 계산
        let _cri = equipments.weapon.cri;
        let _criXp = equipments.weapon.criXp;
        const _damage = equipments.weapon.damage;
        const _maxDamage = equipments.weapon.damageMax;

        let debuf = [];
        let damage = 22.5 *(_damage + Math.random()*(_maxDamage-_damage));

        //무기 대미지
        damage *= (skillLv*0.3 +1.1);
        
        if(Math.random() < _cri){
            //크리티컬 터짐
            damage = damage*_criXp;
            ; debuf.push(["critical", _criXp*100]);

        }else if(zombies[i].isStunning>0){
            //넉백된 경우
            damage *= 1.5;
            ; debuf.push(["zombieKnockback", +150]);
        }
        //강함, 약함
        if(playerstat.strength>=9){
            damage*= 1.4;
            debuf.push(["Strong", +40]);
        }else if(playerstat.strength<=1){
            damage *= 0.6;
            debuf.push(["Weak", -40]);
        }
        //패닉, 스트레스
        if(playerstat.panic>0){
            damage *= (10-playerstat.panic)/10 ;
            debuf.push(["panic", playerstat.panic*-10]);
        }
        if(playerstat.stressed>0){
            damage *= (10-playerstat.stressed)/10;
            debuf.push(["stressed", playerstat.stressed*-10]);
        }
        //스태미나 고갈(Endurance)
        if(playerstat.endurance==-1){ damage *= 0.95; debuf.push(["endurance", -5]);}
        if(playerstat.endurance==-2){damage *=0.9; debuf.push(["endurance", -10]);}
        if(playerstat.endurance==-3){damage *=0.8; debuf.push(["endurance", -20]);}
        if(playerstat.endurance==-4){damage *=0.5; debuf.push(["endurance", -50]);}
        //피로(fatique))
        /*
        if(playerstat.endurance==-1){ damage *= 0.95; debuf.push(["endurance", -5]);}
        if(playerstat.endurance==-2){damage *=0.9; debuf.push(["endurance", -10]);}
        if(playerstat.endurance==-3){damage *=0.8; debuf.push(["endurance", -20]);}
        if(playerstat.endurance==-4){damage *=0.5; debuf.push(["endurance", -50]);}
        */
        if(damage>355){
            //임시 리미트
            damage =355;
        }
        //대미지 최종 정수화
        damage = Math.ceil(damage);
        // zombies[i].hp -= damage;
        zombieIsDamaged(i, damage);
        addSkillXp( equipments.weapon.subType, damage);
        addSkillXp( 'strength', damage);

        let debuftxt ="";
        for(let n =0; n< debuf.length; n++){
            debuftxt += `${translating(debuf[n][0])}: ${debuf[n][1]>0?"+":''}${debuf[n][1]}% `;

        }
        log( `${i+1}번째 좀비가 ${damage}의 대미지를 입었다. ${debuftxt.length>0?`\n`:''} ${debuftxt}`);
        let rng = Math.random();
        const stunPer = 0.35 + playerstat.strength*0.05;
        if(rng<= stunPer){
            //확률로 넉백
            zombies[i].isStunning = 4; //스턴 턴 횟수
            zombieMove(i,10);
            zombieStun(i,4);
            log(`근력 ${playerstat.strength}, ${(stunPer*100).toFixed(1)}% 확률로 넉백!`);
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
    const playerstat = playerStat();
    stat.stamina -= pushStamina;//고정값
    if(stat.stamina<=0){
        stat.stamina = 0;
    }
    let num = (multiHit >= zombies.length)? zombies.length : multiHit; 
    log(`플레이어의 밀치기!`);
    for(let i =0 ; i <num ; i++){
        
        //밀치기 계산
       let rng = Math.random();
        const stunPer = 0.35 + playerstat.strength*0.05;
        if(rng<= stunPer){
            //확률로 넉백            
            log(`근력 ${playerstat.strength}, ${(stunPer*100).toFixed(1)}% 확률로 넉백!`);
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
    if(stat.health>0){
        stat.health -= value;
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
    let clothDefendPer =0.65;
    if(equipments.armor != null){
        if(equipments.armor.condition>1){
            const addRag = equipments.armor.condition - equipments.armor.maxCondition;
            if(addRag>0){
                //덧댄 천이 있다면?
                clothDefendPer += addRag*0.1;
            }
            //방어구 장착시 상처 확률 감소
            const armorRng = Math.random();
            if( armorRng < clothDefendPer){
                defend = true;
                //의상으로 방어
                equipments.armor.condition--;
                log(`${clothDefendPer*100}% 확률로 장착한 [${translating(equipments.armor.name)}] 의상으로 막아냈습니다.`);
                renderGameUI();//renderEquipment()포함
                return;
            }
        }
    }
    if(rng< 0.1 +per){
        //물림
        pushWound("bitten", (100+healer*4));
        pushWound("zombie", (100+healer*4));
        log(`${ ((0.1+per)*100).toFixed(1) }% 확률로 좀비에게 [물렸]습니다.` ,true);
    }else if(rng<0.4+per){
        //찢어진상처
        pushWound("scratched", randomInt(20+healer,40+healer) );
        log(`${ ((0.4 +per)*100).toFixed(1) }% 확률로 좀비에게 [찢어진 상처]를 입었습니다.` );
        if(zbrng<0.25){
            //감염
            pushWound("zombie", (100+healer*4));
        }
    }else{
        //긁힘
        pushWound("lacerated", randomInt(17+healer,25+healer) );
        log(`${ ((0.6 +per)*100).toFixed(1) }% 확률로 좀비에게 [긁혔]습니다.`);
        if(zbrng<0.07){
            //감염
            pushWound("zombie", (100+healer*4));

        }
    }
    
    renderGameUI();
}
function pushWound(_tag, _turn){
    wound.push({tag:_tag, heal:-1, turn:_turn , turn0:_turn}); 
}
function woundHealingCalculate(){
    let wndCount=0;
    for(let i=0;i<wound.length;i++){
        let data = wound[i];
        if(data.tag=='zombie'){
            data.turn += data.heal;
        }else{
            data.turn --;
        }
        
        
        if(data.turn<=0){
            if( data.tag =="zombie" || data.tag =="bleach"){
                //좀비화 상태의 경우 즉시 게임오버
                stat.health=0;
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
                if(data.turn/data.turn0  <= 0.5){
                    //setMoodleValue('Stressed',-2);
                    stat.sick -= data.heal*3;
                }
                if(data.turn/data.turn0  <= 0.9){
                    //setMoodleValue('Stressed',-1);
                    stat.stressed -= data.heal;
                }
            }
            if(data.tag =="bleach"){
                if(data.turn/data.turn0  <= 0.5){
                    stat.health-= 20;
                    stat.sick +=10;
                    
                }else{
                    //setMoodleValue('Sick',-1);
                    stat.sick=25;
                }
                
            }
            if(data.tag =="foodPoisoning"){
                stat.health-= 3;
                stat.sick +=2;
            }
            if(data.heal<0){
                if(data.tag=="scratched" || data.tag == "bitten"){
                    wndCount++;
                    stat.health -=2;;
                }
                if(data.tag=="lacerated"){
                    stat.health -=1.5;
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
        log_popup(`치료할 상처가 없습니다`);
    }
}
function playerBanding(itemIndex){
    let bool =false;
    
    for(let i =0 ; i<wound.length; i++){
        let data = wound[i];
        if(data.heal<0){
             if(data.tag =="lacerated" || data.tag =="scratched" || data.tag=="bitten"){
                const txt = `${translating(inventory[itemIndex].name)}을 소모하여 [${translating(data.tag)}]에 붕대 감음.`;
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
        while (true){
            if(item.condition<=0){
                break;
            }
            if(stat.thirst>100){
                stat.thirst=100;
                break;
            }
            stat.thirst+=10;
            item.condition--;
        }
        if(fluidType=='bleach'){
            //락스
            pushWound(fluidType, 20);
            log(`끔찍한 선택을 했군요... 락스를 마셨습니다.`,true);
            closeStorageModal();

        }else{
            log(`${translating(fluidType)}을 마셨습니다.${item.maxCondition!=null? '('+item.condition+'/'+item.maxCondition+')':''}`,true );
            if(fluidType=='taintedWater'){
                //
                pushWound('foodPoisoning', 20);
            }
        }
        advanceTurn();
    }else{
        log_popup(`통이 비어있습니다.`);
    }
}
//먹기
function playerEatFood(item, div=1){
    if(item==null){
        return
    }
    //배고픔 해결
    const kcal = item.hunger.split(";")[ item.foodStatus>0? item.foodStatus: 1] /4; //음식 회복량/4
    stat.hunger+= div*kcal;
    if(stat.hunger>200){stat.hunger=200;}
    item.div -= div;
    item.weight = Math.round((item.weight-item.weightDiv*div)*100)/100;

    log(`${translating(item.name)} 음식을 섭취했습니다.(${item.div}/${item.maxDiv})`,true );

    if(Math.random()< item.poisoning){
        //독
        pushWound('foodPoisoning', 20);
        log(`우욱... 속이 안좋은데?... ${item.poisoning*100}% 확률로 식중독에 걸렸습니다.`,true);
    }
    
    if(item.div<=0){
        for(let i =0 ;i<inventory.length ; i++){  
            if(inventory[i] == item){
                if(item.convert.length>0){
                    inventory[i] = findItem( item.convert );
                }else{
                    inventory[i]=null;
                }
                
                if(inventory[i] == null){
                    inventory.splice(i,1);
                }
                break;
               
                
            }
        }
    }
    advanceTurn();
}