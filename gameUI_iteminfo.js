
 // 모달 요소
  const itemModal = document.getElementById('itemModal');
  //const itemModalClose = document.getElementById('itemModalClose');
  //const itemModalClose2 = document.getElementById('itemModalClose2');

  // 필드 참조
  const itemModalImgTag = document.getElementById('itemModalImgTag');
  const itemName = document.getElementById('itemName');
  const itemType = document.getElementById('itemType');
  const itemLink = document.getElementById('itemLink');

  const itemModalSubmenu = document.getElementById("itemModalSubmenu");
  const field_info = document.getElementById("field_info");
  const field_condition = document.getElementById('field-condition');
  const field_conditionText = document.getElementById('field-conditionText');
  const field_conditionBar = document.getElementById('field-conditionBar');
  const field_conditionLowerChance = document.getElementById('field-conditionLowerChance');

  function showItemModal(item) {
    // item: { name,type,subType,multiHit,condition,conditionLowerChance,stamina,damage,weight, path? }
    const _pathsplit =item.path.replace(".png","").split('/');
    const _itempath = `${item.path.startsWith("Base")? "":"[Mod]"}${_pathsplit[0]}.${_pathsplit[_pathsplit.length-1] }`;
    let _itemname = translations[currentLang][item.name] ?? item.name;
    itemName.textContent = `${item.subType =='food' ?( item.condition>0 ? (item.condition/item.maxCondition >(item.rottenDays-item.freshDays)/item.rottenDays?'신선한 ':'신선하지 않은 ') :'' ) :''}
      ${(_itempath.endsWith("Cooked")?"요리된 ": (_itempath.endsWith("Overdone")? "타버린 ":(_itempath.endsWith("Rotten")?"상한 ":"")))}${_itemname}${_itempath.endsWith("Open")?"(열림)": ""}`;
    itemType.textContent = `${item.type ?? '-'} / ${(item.subType.split(';').length>1? `${item.subType.split(';')[0]} 혼합액`: item.subType ) ?? '-'}`;

    itemLink.textContent = `${_itempath}`;
    //field_type.textContent = item.type ?? '-';
    //field_subType.textContent = item.subType ?? '-';
    itemModalSubmenu.innerHTML = '';
    function makeDiv(fieldName, value){
        if(value ==null){return}
        const div1 = document.createElement("div");
        div1.className = "text-gray-600 text-xl";
        div1.innerText = fieldName;
        itemModalSubmenu.appendChild(div1);

        const div2 = document.createElement("div");
        div2.className = "font-medium text-xl";
        div2.innerText = value;
        itemModalSubmenu.appendChild(div2);

        //col-3 일 경우
        //const div3 = document.createElement("div");
        //itemModalSubmenu.appendChild(div3);
    }
    makeDiv('MultiHit', item.multiHit);
    makeDiv('Stamina', item.stamina);
    makeDiv('Damage', item.damage);
    makeDiv('FreshDays', item.freshDays? (item.freshDays<0? "보존식품" : `${(item.freshDays/24)}일`) : null);
    makeDiv('RottenDays', item.rottenDays? `${(item.rottenDays/24)}일` : null );
    makeDiv('Weight', (( item.type=="FluidContainer"? parseFloat(item.weight)+parseFloat(item.condition)/10 :item.weight ) ?? '-') + '' );

    const info = item.info!=null? item.info.replace(";",`\n`): "";
    field_info.textContent = (info ?? ''); //아이템 설명

    // condition (숫자 가정: 0..100)
    if(item.maxCondition>1){
        //수용량이 있는 경우
         field_condition.classList.remove("hidden");
        const cond = (typeof item.condition === 'number') ? item.condition : parseFloat(item.condition) || 0;
        const cond0 = (typeof item.condition === 'number') ? item.maxCondition : parseFloat(item.maxCondition) || 0;
        const ratio = Math.ceil(cond/cond0*100);
        
        field_conditionBar.style.width = `${ratio}%`;
        field_conditionBar.className ="h-full transition-all";
        field_conditionLowerChance.textContent ='';

        if(item.type=="Weapon" ){ //무기, 방어구 등등...
            const MaintenanceLv = parseFloat(findPlayerSkill("Maintenance").lv);
            const weaponLv = parseFloat(findPlayerSkill(item.subType).lv);
            const per = 1/( item.conditionLowerChance + Math.floor( Math.floor(   MaintenanceLv + ( weaponLv/2)  )/2 )*2 ) ;
            field_conditionLowerChance.textContent = item.conditionLowerChance? (`하락확률 : ${(per*100).toFixed(1)}%` ) : '';
            field_conditionBar.classList.add( itemRatioColor(cond/cond0) );
            field_conditionText.textContent = `${cond}/${cond0} (${ratio}%)`;
        }
        if(item.type=='Armor'){
            //const MaintenanceLv = parseFloat(findPlayerSkill("Maintenance").lv);
            //const armorLv = parseFloat(findPlayerSkill(item.subType).lv);
            field_conditionText.textContent = `구멍 ${cond0-cond}개, (${ratio}%)`;
            field_conditionBar.classList.add ( itemRatioColor(cond/cond0) );
        }
        else if(item.type=='FluidContainer'){
            //액체류의 경우
            field_conditionText.textContent = `${cond/10}/${cond0/10}L (${ratio}%)`;
            field_conditionBar.classList.add(itemColor(item.subType));
        }else if(item.subType=='food'){
            //신선도가 있는 음식의 경우
            field_conditionBar.classList.add( itemRatioColor(cond/cond0 , (item.rottenDays-item.freshDays)/item.rottenDays)  );
            field_conditionText.textContent = `신선도 ${cond}/${cond0} (${ratio}%)`;
        }else{
            field_conditionBar.classList.add("bg-yellow-400");
        }
    }else{
        //표시 안하기
        field_condition.classList.add("hidden");
    }
    
    
    // 이미지 (선택적)
    if (item.path) {
      itemModalImgTag.src = item.path;
      itemModalImgTag.classList.remove('hidden');
    } else {
      itemModalImgTag.src = '';
      itemModalImgTag.classList.add('hidden');
    }

    // 보이기
    itemModal.classList.remove('hidden');
    // optional: focus for accessibility
    itemModal.querySelector('button')?.focus();
  }

  function hideItemModal() {
    itemModal.classList.add('hidden');
  }

  // 닫기 버튼 바인딩
  //itemModalClose.addEventListener('click', hideItemModal);
  //itemModalClose2.addEventListener('click', hideItemModal);
  // 배경 클릭으로 닫기 (모달 외부)
  itemModal.addEventListener('pointerdown', (e) => {
    if (e.target === itemModal) hideItemModal();
  });

  // 예시: 사용법
  // const sampleItem = { name:'빗자루', type:'Tool', subType:'Blunt', multiHit:1, condition:72, conditionLowerChance:0.2, stamina:6, damage:4, weight:2, path:'images/Pushbroom.png' };
  // showItemModal(sampleItem);