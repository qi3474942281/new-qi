
let relationshipMemories = JSON.parse(
localStorage.getItem('relationshipMemories') || '[]'
);

const RELATIONSHIP_TYPE_OPTIONS = ['朋友', '恋人', '家人', '同事', '合作伙伴'];

function escapeRelationshipHtml(value){
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getRelationshipTypeOptionsHtml(){
    return RELATIONSHIP_TYPE_OPTIONS
        .map(type => `<option value="${escapeRelationshipHtml(type)}"></option>`)
        .join('');
}

function createParticipantRow(name = ''){
    const row = document.createElement('div');
    row.className = 'participantRow';
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '8px';
    row.style.marginBottom = '12px';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '参与人物';
    input.className = 'participantInput';
    input.value = name;
    input.style.flex = '1';
    input.style.minWidth = '0';
    input.style.height = '55px';
    input.style.border = '1px solid #ddd';
    input.style.borderRadius = '16px';
    input.style.padding = '0 15px';
    input.style.boxSizing = 'border-box';
    input.style.fontSize = '20px';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'participantRemoveBtn';
    removeBtn.innerText = '-';
    removeBtn.title = '删除人物';
    removeBtn.onclick = function(){ removeParticipant(this); };
    removeBtn.style.width = '44px';
    removeBtn.style.height = '44px';
    removeBtn.style.border = 'none';
    removeBtn.style.borderRadius = '50%';
    removeBtn.style.background = '#fee2e2';
    removeBtn.style.color = '#dc2626';
    removeBtn.style.fontSize = '28px';
    removeBtn.style.lineHeight = '40px';
    removeBtn.style.flexShrink = '0';

    row.appendChild(input);
    row.appendChild(removeBtn);

    return row;
}

// 打开编辑器
function openRelationshipEditor(){

    let html = `
    <div id="relationshipModal"
    style="
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.5);
    z-index:999999;
    display:flex;
    align-items:center;
    justify-content:center;
    ">

        <div style="
        width:90%;
        max-width:700px;
        max-height:90vh;
        overflow:auto;
        background:white;
        border-radius:30px;
        padding:25px;
        box-sizing:border-box;
        ">

            <div style="
            font-size:42px;
            font-weight:700;
            margin-bottom:25px;
            ">
            关系网记忆
            </div>

            <datalist id="relationshipTypeOptions">
                ${getRelationshipTypeOptionsHtml()}
            </datalist>

            <div id="relationshipList"></div>

            <button onclick="addRelationshipCard()"
            style="
            width:100%;
            height:60px;
            border:none;
            border-radius:18px;
            background:black;
            color:white;
            font-size:24px;
            margin-top:20px;
            ">
            新增关系
            </button>

            <button onclick="saveRelationshipMemories()"
            style="
            width:100%;
            height:60px;
            border:none;
            border-radius:18px;
            background:#3b82f6;
            color:white;
            font-size:24px;
            margin-top:15px;
            ">
            保存关系网
            </button>

            <button onclick="
            document.getElementById('relationshipModal').remove()
            "
            style="
            width:100%;
            height:60px;
            border:none;
            border-radius:18px;
            background:#e5e5e5;
            color:black;
            font-size:24px;
            margin-top:15px;
            ">
            关闭
            </button>

        </div>

    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    renderRelationshipCards();
}

// 渲染
function renderRelationshipCards(){

    const list =
    document.getElementById('relationshipList');

    if(!list) return;

    list.innerHTML = '';

    relationshipMemories.forEach((rel,index)=>{

        const participants =
        (rel.participants && rel.participants.length ? rel.participants : ['']);

        const card = document.createElement('div');
        card.className = 'relationshipCard';
        card.style.border = '1px solid #eee';
        card.style.borderRadius = '24px';
        card.style.padding = '20px';
        card.style.marginBottom = '20px';

        card.innerHTML = `
            <div class="participantsContainer"></div>

            <input class="relationshipType"
            list="relationshipTypeOptions"
            value="${escapeRelationshipHtml(rel.relationship || '朋友')}"
            placeholder="关系类型，可选择或自定义"
            style="
            width:100%;
            height:55px;
            border:1px solid #ddd;
            border-radius:16px;
            padding:0 15px;
            font-size:18px;
            margin-bottom:15px;
            box-sizing:border-box;
            ">

            <div style="
            font-size:18px;
            margin-bottom:10px;
            ">
            熟悉度：
            <span class="familiarityValue">
            ${rel.familiarity || 50}
            </span>
            </div>

            <input
            type="range"
            min="0"
            max="100"
            value="${rel.familiarity || 50}"
            class="familiaritySlider"
            oninput="
            this.parentElement.querySelector('.familiarityValue').innerText=this.value
            "
            style="
            width:100%;
            margin-bottom:20px;
            "
            >

            <textarea
            class="relationshipMemory"
            placeholder="共同经历 / 共同记忆"
            style="
            width:100%;
            height:140px;
            border:1px solid #ddd;
            border-radius:16px;
            padding:15px;
            box-sizing:border-box;
            font-size:18px;
            resize:none;
            "
            >${escapeRelationshipHtml(rel.memory || '')}</textarea>

            <button onclick="deleteRelationship(${index})"
            style="
            margin-top:15px;
            background:#ef4444;
            color:white;
            border:none;
            border-radius:14px;
            padding:12px 20px;
            font-size:16px;
            ">
            删除关系
            </button>
        `;

        const container = card.querySelector('.participantsContainer');
        participants.forEach(name => container.appendChild(createParticipantRow(name)));

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.onclick = function(){ addParticipant(this); };
        addBtn.style.width = '100%';
        addBtn.style.height = '50px';
        addBtn.style.border = 'none';
        addBtn.style.borderRadius = '14px';
        addBtn.style.background = '#f3f4f6';
        addBtn.style.fontSize = '18px';
        addBtn.style.marginBottom = '15px';
        addBtn.innerText = '+ 新增人物';
        container.appendChild(addBtn);

        list.appendChild(card);
    });
}

// 新增关系
function addRelationshipCard(){

    relationshipMemories.push({
        participants:[''],
        relationship:'朋友',
        familiarity:50,
        memory:''
    });

    renderRelationshipCards();
}

// 新增人物
function addParticipant(btn){

    const container =
    btn.parentElement;

    container.insertBefore(createParticipantRow(''), btn);
}

// 删除人物
function removeParticipant(btn){

    const container =
    btn.closest('.participantsContainer');

    if(!container) return;

    const rows = container.querySelectorAll('.participantRow');

    if(rows.length <= 1){
        const input = rows[0]?.querySelector('.participantInput');
        if(input) input.value = '';
        return;
    }

    btn.closest('.participantRow')?.remove();
}

// 删除
function deleteRelationship(index){

    relationshipMemories.splice(index,1);

    renderRelationshipCards();
}

// 保存
function saveRelationshipMemories(){

    const cards =
    document.querySelectorAll('.relationshipCard');

    relationshipMemories = [];

    cards.forEach(card=>{

        const participants =
        [...card.querySelectorAll('.participantInput')]
        .map(i=>i.value.trim())
        .filter(v=>v);

        relationshipMemories.push({

            participants,

            relationship:
            card.querySelector('.relationshipType').value.trim() || '朋友',

            familiarity:
            Number(card.querySelector('.familiaritySlider').value),

            memory:
            card.querySelector('.relationshipMemory').value

        });

    });

    localStorage.setItem(
    'relationshipMemories',
    JSON.stringify(relationshipMemories)
    );

    alert('关系网已保存');
}

// AI读取
function getRelationshipSharedMemories(){

    return relationshipMemories.map(rel=>({

        title:
        `${rel.participants.join('、')} 的关系`,

        content:
`
参与人物：
${rel.participants.join('、')}

关系类型：
${rel.relationship}

熟悉度：
${rel.familiarity}/100

共同记忆：
${rel.memory}
`
    }));
}

