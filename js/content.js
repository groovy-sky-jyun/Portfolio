// 포트폴리오 내용 데이터. 디자인과 분리되어 있어 내용 수정은 이 파일만 고치면 된다.
window.PORTFOLIO = {
  owner: {
    name: "최정윤",
    role: "Game Client Programmer",
    tagline: "사람이 신경쓸 일을 줄여주는 개발자",
    sub: "규칙은 문서가 아니라 구조로",
    github: "https://github.com/groovy-sky-jyun",
  },
  projects: [
    {
      id: "eclipse",
      title: "Eclipse",
      tone: "eclipse",
      genre: "3페이즈 보스 전투",
      engine: "UE 5.7",
      stack: ["UE 5.7", "C++", "Behavior Tree", "DataTable"],
      period: "2026.04 – 09",
      team: "1인 개발",
      cover: "media/thumbs/boss-ai.jpg",
      hero: { type: "video", src: "media/clips/boss-ai.mp4", poster: "media/posters/boss-ai.jpg", note: "임시 영상: 전체 플레이 영상으로 교체 예정" },
      summary: "보스 체력 비율에 따라 페이즈가 바뀌는 보스 전투. 공격 6종을 전수 조사해 소프트락과 순간이동의 공통 원인을 찾고, 같은 실수가 구조적으로 나오지 않게 바꿨다.",
      stats: [["986 → 125", "EnemyBoss.cpp 줄 수"], ["9곳 → 0", "종료 통보 누락"], ["4함수 → 0", "회수 불가 타이머"]],
      archLead: "인터페이스로 피격을 받고, 보스는 판단을 컴포넌트에, 실행을 공격 객체에 맡긴다",
      arch: [
        ["Interface", "공격을 주는 쪽과 받는 쪽이 서로를 모른다"],
        ["BaseCharacter", "피격 파이프라인은 override final, 파생 클래스는 훅만 채운다"],
        ["EnemyBase", "Enemy가 공통으로 가지는 기능만 관리한다"],
        ["Component", "PhaseComponent와 AttackComponent가 서로를 모른다"],
        ["AttackBase", "상태 전환 private, 워치독 타이머"],
      ],
      features: ["3페이즈 보스 전투와 Behavior Tree 전투 루프", "DataTable 기반 공격 풀과 난이도 수치", "코드 수정 없는 콤보 연계 테이블", "스태거 게이지와 그로기", "전투 경기장과 카메라 방향 보정"],
      groups: [
        {
          title: "보스 전투",
          lead: "판단은 컴포넌트에, 실행은 공격 객체에 맡긴 보스 구조",
          items: [
            {
              id: "refactor",
              title: "보스 공격 구조 리팩토링",
              summary: "986줄 보스 클래스의 역할을 나누고, 공격 순서를 구조로 고정했다.",
              tags: ["Strategy", "Template Method", "워치독"],
              thumbStat: "986 → 125",
              sections: [
                { t: "stats", items: [["986 → 125", "EnemyBoss.cpp 줄 수"], ["9곳 → 0", "종료 통보 누락"], ["4함수 → 0", "회수 불가 타이머"], ["+3종", "리팩토링 후 추가한 공격"]] },
                { t: "text", h: "문제: 보스가 공격과 관련된 모든 역할을 담당했다", p: "AEnemyBoss.cpp 986줄 안, 공격 6종 전수 조사" },
                {
                  t: "table",
                  cls: "audit",
                  head: ["", "Blood Bolt", "Shadow Crash", "Dark Sweep", "Lunar Beam", "Wraith Drop", "Eclipse Veil", "합계", "증상"],
                  rows: [
                    ["종료 통보 누락 (조기 리턴)", "3곳", "1곳", "1곳", "1곳", "3곳", "—", "9곳", "소프트락"],
                    ["지역 FTimerHandle (취소 불가)", "—", "2함수", "1함수", "—", "—", "1함수", "4함수", "순간이동"],
                  ],
                },
                {
                  t: "grid",
                  items: [
                    { t: "flow", h: "소프트락: 보스가 다음 패턴으로 넘어가지 않는다", steps: [["BT 디버거", "액션 실행 태스크가 InProgress에서 정지"], ["로그", "망령이 살아있으면 종료 로그가 없다"], ["원인", "조기 리턴에서 종료 통보 누락"]] },
                    { t: "flow", h: "순간이동: 스태거·사망 뒤에도 공격 경로를 따라 이동", steps: [["로그", "공격이 끊긴 뒤에도 콜백이 계속 출력"], ["코드", "for문 안 지역 변수 FTimerHandle로 움직임 예약"], ["원인", "지역 변수라 타이머 예약을 취소할 수 없다"]] },
                  ],
                },
                { t: "callout", p: "공통 원인은 종료 통보와 타이머 회수를 공격 함수마다 사람이 신경 써 작성해야 하는 구조였다. 각각 고치기는 쉽다. 하지만 7번째 공격을 작성하는 사람이 같은 규칙을 기억해야 한다." },
                { t: "text", h: "해결: 역할을 나누고, 순서를 구조로 잠그다", p: "교체는 Strategy, 순서는 Template Method, 남는 누락은 워치독. 파생 클래스에는 종료 통보·타이머 해제 코드가 없다." },
                { t: "life", items: [["Begin()", "상태 Startup · 워치독 예약", true], ["OnStartup()", "파생이 채움"], ["OnActive()", "파생이 채움"], ["OnRecovery()", "파생이 채움"], ["Finish()", "타이머 일괄 회수 · 종료 통보", true]] },
                {
                  t: "grid",
                  items: [
                    { t: "code", h: "공격 클래스 교체 (Strategy)", code: "// BossAttackComponent.h\n// 데이터 테이블에서 선택된 공격\nTSubclassOf<UBossAttackBase> PendingAttackClass;\n// 실행 중인 공격\nTObjectPtr<UBossAttackBase> CurrentAttack;\n\n// BossAttackComponent.cpp — ExecuteAttack()\n// 컴포넌트는 어떤 공격인지 모른 채 공통 타입으로 받는다.\nCurrentAttack = NewObject<UBossAttackBase>(\n    this, PendingAttackClass);\nCurrentAttack->Begin(Boss);" },
                    { t: "list", h: "역할 분리", items: ["AEnemyBoss 125줄", "UBossPhaseComponent: 페이즈 · 스태거", "UBossAttackComponent: 공격 선택 · 실행 · 취소", "UBossAttackBase 파생 3종: 공격 1종에 클래스 1개", "워치독: MaxDuration을 초과하면 통보가 없어도 Cancel() → Finish()"] },
                  ],
                },
              ],
            },
            {
              id: "phase",
              title: "3페이즈 보스 전투",
              summary: "보스 체력 비율에 따라 변하는 페이즈와 데이터로 고르는 공격 풀.",
              tags: ["Behavior Tree", "DataTable"],
              thumb: "media/thumbs/boss-ai.jpg",
              sections: [
                { t: "clip", src: "media/clips/boss-ai.mp4", poster: "media/posters/boss-ai.jpg", ar: "1920/720", oy: "46.7%", cap: "Behavior Tree 전투 루프: 공격 선택 - 실행 - 딜 타임 - 이동을 반복한다." },
                { t: "table", head: ["공격", "유형", "설명"], rows: [["Silent Slash", "장거리 참격 3연타", "플레이어 위치를 예측하여 참격을 날린다."], ["Discord Dive", "급강하", "날아오른 뒤 일정 시간이 지나면 급강하한다."], ["Resonant Wave", "공격 확산", "도넛 모양으로 점차 크기가 커진다."]] },
                { t: "img", src: "media/img/attack-pool.jpg", cap: "DataTable (공격 풀)" },
              ],
            },
            {
              id: "tuning",
              title: "전투 판정과 난이도 수치",
              summary: "수치로 판정은 정확하게, 난이도는 조절하기 쉽게.",
              tags: ["Blueprint", "TMap"],
              thumb: "media/thumbs/damage-table.jpg",
              sections: [
                {
                  t: "grid",
                  items: [
                    { t: "img", src: "media/img/boss-bp.jpg", cap: "보스 Attack BP. 상승 0.7초, 체공 1.2초, 낙하 0.4초, 판정 반경 190-280" },
                    { t: "img", src: "media/img/damage-table.jpg", cap: "보스 Attack Damage Table" },
                  ],
                },
                { t: "list", h: "보스 Attack BP", items: ["Details > Settings: 상승, 체공, 낙하 시간과 판정 반경", "Details > Attack: 예열 및 시작 시간, 후딜, 최대 실행 지속 시간(끝나지 않는 오류 방지)"] },
                { t: "code", h: "AttackComponent에서 따로 보관하는 이유", code: "// BossAttackComponent\nTMap<TSubclassOf<UBossAttackBase>, FCombatDamage>\n\n// FCombatDamage{Damage, HitIntensity}는 Player에게 넘겨줘야 할 값이기 때문" },
              ],
            },
            {
              id: "stagger",
              title: "스태거 게이지 · 그로기",
              summary: "상태를 바꾸는 통로는 하나. BT와 UI는 그 상태를 따라간다.",
              tags: ["Blackboard", "Delegate"],
              thumb: "media/thumbs/stagger.jpg",
              sections: [
                { t: "clip", src: "media/clips/stagger.mp4", poster: "media/posters/stagger.jpg", ar: "1440/544", oy: "37.3%", cap: "스태거 게이지가 차면 그로기 상태로 전환된다." },
                {
                  t: "grid",
                  items: [
                    { t: "code", h: "AEnemyBoss::OnDamaged", code: "// 플레이어가 호출\nAddStagger(Phase, StaggerDamage);\n\n// 실행 중인 공격 중지\nCancelCurrent();" },
                    { t: "code", h: "UBossGroggyComponent", code: "float CurrentStagger = 0.f;\nbool bIsGroggy = false;\n\n// FBossPhaseData: 그로기 유지시간\nfloat GroggyDuration = 4.f;" },
                    { t: "code", h: "[BT] Blackboard", code: "Boss->BB->SetValueAsBool(\n    ABossAIController::BB_bIsGroggy, bNewGroggy);" },
                    { t: "code", h: "[UI] StaggerBarWidget", code: "// 델리게이트 구독 (스태거 게이지 변화)\nGroggyComp->OnStaggerChangedDelegate" },
                  ],
                },
              ],
            },
          ],
        },
        {
          title: "플레이어 전투",
          lead: "공격 타이밍과 연계를 코드 밖으로 꺼낸 전투 시스템",
          items: [
            {
              id: "attack",
              title: "플레이어 공격 구조",
              summary: "코드 수정 없이 공격 타이밍과 콤보 연계를 변경한다.",
              tags: ["AnimNotify", "FGameplayTag"],
              thumb: "media/thumbs/notify.jpg",
              sections: [
                { t: "img", src: "media/img/notify.jpg", cap: "몽타주에 배치한 Notify" },
                { t: "list", h: "Notify", items: ["Hit Window (Notify State): 검에 닿는 적에게 데미지를 주는 구간", "Input Window (Notify State): 다음 공격을 입력받는 구간. 연계 공격은 Input Window가 끝나는 지점에 다음 공격이 실행된다.", "Restart Point (Notify): 연계가 아닌 새로운 공격을 이어서 할 때 플레이되는 구간"] },
                { t: "grid", items: [{ t: "img", src: "media/img/transition-a.jpg", cap: "연계 테이블 1" }, { t: "img", src: "media/img/transition-b.jpg", cap: "연계 테이블 2" }] },
                { t: "text", h: "연계 테이블", p: "Parent Step - Input(FGameplayTag) - Child Step. Parent Step을 비워두면 첫 타 공격을 뜻한다. 다양한 연계 스킬을 쉽게 추가하거나 삭제할 수 있다." },
              ],
            },
            {
              id: "combo",
              title: "공격 연계와 판정",
              summary: "약공격, 특수 스킬, 궁극기의 연계와 검 궤적 기반 HitBox.",
              tags: ["Combo", "HitBox"],
              thumb: "media/thumbs/combo-live.jpg",
              hoverClip: "media/clips/combo-live.mp4",
              sections: [
                { t: "grid", items: [
                  { t: "clip", src: "media/clips/combo-types.mp4", poster: "media/posters/combo-types.jpg", ar: "1440/936", cap: "플레이어 공격 종류 모음" },
                  { t: "clip", src: "media/clips/combo-live.mp4", poster: "media/posters/combo-live.jpg", ar: "1440/952", cap: "플레이어 공격 플레이 영상" },
                ] },
                { t: "clip", src: "media/clips/hitbox.mp4", poster: "media/posters/hitbox.jpg", ar: "1440/960", oy: "46.7%", cap: "HitBox. 녹색 디버그 선은 검의 궤적, 검과 적이 닿으면 빨간색 디버그 선" },
                { t: "list", h: "공격 종류", items: ["약공격. 연계: 약-약-약-강", "특수 스킬 E. 연계: E-E", "특수 스킬 Q", "궁극기 R"] },
              ],
            },
            {
              id: "reaction",
              title: "HitReaction · 궁극기 무적",
              summary: "피격 반응은 데이터로 매핑, 무적은 애니메이션에서 설정한다.",
              tags: ["TMap", "Montage"],
              thumb: "media/thumbs/hit-reaction.jpg",
              hoverClip: "media/clips/hit-reaction.mp4",
              sections: [
                { t: "grid", items: [
                  { t: "clip", src: "media/clips/hit-reaction.mp4", poster: "media/posters/hit-reaction.jpg", ar: "1440/952", cap: "보스 공격 강도에 따른 플레이어 피격 반응" },
                  { t: "clip", src: "media/clips/ult.mp4", poster: "media/posters/ult.jpg", ar: "1440/952", cap: "궁극기 무적" },
                ] },
                { t: "code", h: "PlayerCharacter", code: "// 보스의 공격 강도와 플레이어 피격 반응 매핑\nTMap<EHitIntensity, EHitReaction> HitReactionData;" },
                { t: "img", src: "media/img/ult-montage.jpg", cap: "궁극기 몽타주" },
                { t: "list", h: "궁극기는 Startup - Active 상태에서 무적", items: ["startup: InputWindow 전 구간", "active: InputWindow 구간", "recovery: InputWindow 후 구간"] },
              ],
            },
            {
              id: "arena",
              title: "경기장 · 카메라 회전",
              summary: "전투가 시작되면 벗어날 수 없는 경기장과 공격 시 카메라 방향 보정.",
              tags: ["Movement", "Camera"],
              thumb: "media/thumbs/camera.jpg",
              hoverClip: "media/clips/camera.mp4",
              sections: [
                { t: "grid", items: [
                  { t: "clip", src: "media/clips/arena.mp4", poster: "media/posters/arena.jpg", ar: "1440/824", cap: "빨간 선: 경계선(전투가 시작되면 나가지 못한다). 녹색 선: 전투 시작 감지 영역" },
                  { t: "clip", src: "media/clips/camera.mp4", poster: "media/posters/camera.jpg", ar: "1440/936", cap: "플레이어가 공격을 할 때마다 보정" },
                ] },
                { t: "grid", items: [
                  { t: "code", h: "경기장 경계", code: "// 1. 경계면 위로 위치 보정\nPlayer->SetActorLocation(Clamped, true);\n\n// 2. 바깥으로 향하는 속도 성분만 제거\nconst float OutwardSpeed = FVector::DotProduct(\n    Movement->Velocity, OutwardDir);\nif (OutwardSpeed > 0.f)\n    Movement->Velocity -= OutwardDir * OutwardSpeed;" },
                  { t: "code", h: "카메라 회전", code: "const FRotator Current = Controller->GetControlRotation();\nconst FRotator Target(\n    Current.Pitch, CameraAssistTargetYaw, Current.Roll);\nconst FRotator NewRotation = FMath::RInterpTo(\n    Current, Target, DeltaSeconds, CameraAssistSpeed);\nController->SetControlRotation(NewRotation);" },
                ] },
                { t: "list", h: "카메라 보정 순서", items: ["플레이어 몸 방향을 보스 방향으로 회전", "보스가 이미 화면 안쪽이면 카메라 보정 없음", "보정이 되었을 때 보스를 화면 정면으로 바라보지 않도록 보정 방향을 대각선으로 설정", "카메라와 보스의 각도가 클 경우 카메라 회전으로 방향 보정"] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "miro",
      title: "Miiroooooooo",
      tone: "miro",
      genre: "랜덤 미로 탈출",
      engine: "UE 5.4",
      stack: ["UE 5.4", "C++", "ISM", "DFS"],
      period: "2024.10 – 2025.05",
      team: "1인 개발",
      github: "https://github.com/groovy-sky-jyun/Miiroooooooo",
      cover: "media/thumbs/miro-start.jpg",
      hero: { type: "image", src: "media/img/miro-start.jpg", note: "전체 플레이 영상 준비 필요" },
      summary: "랜덤으로 생성되는 미로를 탈출하는 게임. 셀마다 벽 액터를 스폰하던 구조를 비트마스크 셀과 Instanced Static Mesh 일괄 배치로 바꿨다.",
      stats: [["319줄", "역할이 섞여 있던 기존 생성 클래스"], ["uint8", "셀 하나의 데이터"]],
      archLead: "Widget · Interface · Component · Item",
      arch: [
        ["Widget", "HUD가 인벤토리 델리게이트를 구독해 바뀐 슬롯만 갱신"],
        ["Interface", "상호작용·피해는 BlueprintNativeEvent, 상대 클래스를 모른 채 호출"],
        ["Component", "인벤토리 슬롯 · 타이머 · 체력을 캐릭터에서 분리"],
        ["Item", "데이터는 ItemDataAsset, 에셋 생성만으로 아이템 추가"],
      ],
      features: ["비트마스크 셀 기반 랜덤 미로 생성", "ISM 일괄 배치", "인벤토리 5슬롯과 아이템 파생 5종", "함정 4종"],
      groups: [
        {
          title: "미로 생성",
          lead: "알고리즘과 표현을 분리한 미로 생성 구조",
          items: [
            {
              id: "maze",
              title: "미로 생성 방법 변경",
              summary: "셀마다 벽 액터 스폰에서 비트마스크 셀 + ISM 일괄 배치로.",
              tags: ["ISM", "Bitmask", "DFS"],
              thumb: "media/thumbs/maze-manager.jpg",
              sections: [
                { t: "grid", items: [
                  { t: "card", badge: "BEFORE", h: "AMazeGenerator + AWall 액터", items: ["셀 하나: AWall 액터 하나 스폰", "벽 방향을 FString(\"Front\"…)으로 비교", "알고리즘 · 난이도 · 생성을 한 클래스가 담당한다. (319줄)"] },
                  { t: "card", badge: "AFTER", strong: true, h: "UBaseMazeGenerator + AMazeManager(ISM)", items: ["셀: uint8 하나. 비트가 1이면 그 방향의 벽이 뚫렸다는 뜻 (Up 0x01 · Down 0x02 · Left 0x04 · Right 0x08)", "생성기를 TSubclassOf로 교체: 알고리즘과 표현 분리", "기존의 벽 액터를 인스턴스로 변경"] },
                ] },
                { t: "grid", items: [
                  { t: "img", src: "media/img/wall-mesh.jpg", cap: "BP_Wall" },
                  { t: "img", src: "media/img/maze-manager.jpg", cap: "BP_MazeManager" },
                ] },
                { t: "text", h: "중복 벽 없이 배치", p: "이웃한 두 셀은 같은 벽을 공유한다. 네 방향을 다 세우면 안쪽 벽이 두 겹이 되므로, 셀마다 Down · Right만 세우고 맨 윗줄과 맨 왼쪽 줄만 따로 추가한다." },
                { t: "grid", items: [
                  { t: "code", h: "MazeManager.cpp", code: "// 비트가 안 섰으면 벽이 있다\nif ((Map[i] & Down) == 0) Add(아래 벽);\nif ((Map[i] & Right) == 0) Add(오른쪽 벽);\n// 루프 뒤 한 번에\nISMC_Wall->AddInstances(WallTransforms, false);" },
                  { t: "code", h: "MazeGenerator_DFS.cpp", code: "// 양쪽 셀의 비트를 함께 세운다\n// 한쪽만 세우면 벽이 반쪽만 사라짐\nif (Next == Cur - Width) {\n    Map[Cur] |= Up;\n    Map[Next] |= Down;\n}\n// 반복 DFS: Stack + IsVisited\n// 방향 = 인덱스 증분\n// 상 -W 하 +W 좌 -1 우 +1" },
                ] },
              ],
            },
          ],
        },
        {
          title: "게임플레이",
          lead: "첫 프로젝트에서 엔진 기능을 넓게 익힌 것들",
          items: [
            {
              id: "ui",
              title: "UI",
              summary: "델리게이트 구독으로 바뀐 슬롯만 갱신, 매 프레임 조회 없음.",
              tags: ["BindWidget", "Delegate"],
              thumb: "media/thumbs/miro-start.jpg",
              sections: [
                { t: "img", src: "media/img/miro-start.jpg", cap: "게임 시작 전 화면" },
                { t: "list", h: "UI", items: ["BindWidget 참조 + 델리게이트 구독으로 바뀐 인덱스의 슬롯만 갱신, 매 프레임 조회 없음", "BlueprintNativeEvent로 호출은 C++, 구현은 Blueprint"] },
              ],
            },
            {
              id: "item",
              title: "아이템",
              summary: "ItemDataAsset + PickupItem으로 만든 인벤토리 5슬롯.",
              tags: ["DataAsset", "LineTrace"],
              thumb: "media/thumbs/miro-spray.jpg",
              sections: [
                { t: "img", src: "media/img/miro-spray.jpg", cap: "스프레이 아이템" },
                { t: "list", h: "아이템", items: ["인벤토리 5슬롯. ItemDataAsset + PickupItem(IInteractionInterface)", "수류탄: PredictProjectilePath로 궤적 표시", "스프레이: 전방 300 LineTrace로 벽이 감지될 때 데칼 스폰"] },
              ],
            },
            {
              id: "trap",
              title: "함정",
              summary: "ABaseTrap 파생 4종과 물리 시뮬레이션으로 무너지는 벽.",
              tags: ["Physics", "Interface"],
              thumb: "media/thumbs/miro-trap.jpg",
              sections: [
                { t: "img", src: "media/img/miro-trap.jpg", cap: "무너지는 함정" },
                { t: "list", h: "함정", items: ["ABaseTrap 4종: CollapsingWall · WallTrap · RisingSpikes · CollapsingTrap", "CollapsingWall: 누적 타격 10회 → 메시 9개 물리 시뮬레이션 + AddImpulseAtLocation", "데미지는 HitTarget → DamageComponent → IIDamagable::Execute_TakeDamage"] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "folk",
      title: "Folk Village",
      tone: "folk",
      genre: "2D 픽셀 소셜 네트워크 게임",
      engine: "Unity",
      stack: ["Unity", "C#", "Photon", "PHP", "MySQL"],
      period: "2023.09 – 12",
      team: "1인 개발",
      github: "https://github.com/groovy-sky-jyun/FolkVillage",
      cover: "media/thumbs/folk-map.jpg",
      hero: { type: "image", src: "media/img/folk-map.jpg", note: "전체 플레이 영상 준비 필요" },
      summary: "멀티 채팅과 음성, 가상 휴대폰, 상점과 집 꾸미기를 갖춘 2D 픽셀 소셜 게임. 실시간 데이터는 Photon Cloud로, 기록으로 남아야 하는 데이터는 PHP와 MySQL로 나눴다.",
      stats: [["22개", "PHP 엔드포인트"], ["10명", "룸 최대 인원"]],
      archLead: "실시간 데이터는 Photon Cloud, 기록으로 남아야 하는 데이터는 UnityWebRequest → PHP → MySQL",
      arch: [
        ["Photon Cloud", "위치 · 채팅 · 말풍선 · 좌우반전 · 음성"],
        ["PHP + MySQL", "계정 · 친구 · 문자 · 선물 · 코인"],
        ["로컬 JSON", "아이템 목록 · 보유 · 배치 좌표"],
      ],
      features: ["채널 생성과 전체 음성·텍스트 채팅", "로그인, 친구, 문자, 선물을 담은 가상 휴대폰", "상점과 Drag & Drop 집 꾸미기", "아바타 부위별 교체", "Aseprite 픽셀 캐릭터와 욕설 필터"],
      groups: [
        {
          title: "네트워크 · 서버",
          lead: "데이터 성격에 따라 동기화 경로를 나눴다",
          items: [
            {
              id: "route",
              title: "데이터 경로 설계",
              summary: "데이터마다 경로와 방식을 고른 이유.",
              tags: ["Photon", "PHP", "MySQL"],
              thumb: "media/thumbs/folk-signup.jpg",
              sections: [
                { t: "table", head: ["데이터", "경로", "방식", "이유"], rows: [
                  ["좌우반전 · 말풍선", "Photon PUN2", "RPC AllBuffered / IPunObservable", "저장이 불필요하지만, 늦게 들어온 사람도 봐야 하므로 Buffered 사용"],
                  ["텍스트 채팅", "Photon PUN2", "RPC OthersBuffered + 본인 직접 호출", "본인이 입력한 텍스트가 중복되지 않게 하기 위함"],
                  ["음성", "Photon Voice2", "Recorder → Speaker", "Photon PUN2와 룸을 공유해 접속 관리를 따로 하지 않음"],
                  ["계정 · 친구 · 문자 · 선물 · 코인", "PHP → MySQL", "WWWForm POST, 코루틴", "상대가 접속 중이 아니어도 기록이 남아야 함"],
                  ["아이템 카탈로그 · 배치", "로컬 JSON", "JsonUtility + [ContextMenu]", "코드 수정 없이 목록 추가"],
                ] },
                { t: "list", h: "엔드포인트와 테이블 설계", items: ["PHP 22개는 userInfo 6 · phoneFriend 8 · phoneMessage 6 · heart 2", "친구 수락 = friendlist 양방향 2행 + 대화방 1행. 키는 user1 > user2 정규 순서라 (A,B) = (B,A)"] },
              ],
            },
            {
              id: "network",
              title: "네트워크 동기화",
              summary: "채널, 음성, 채팅, 좌우반전을 용도별 수단으로 구현.",
              tags: ["PUN2", "Voice2", "RPC"],
              thumb: "media/thumbs/folk-bubble.jpg",
              sections: [
                { t: "grid", items: [
                  { t: "img", src: "media/img/folk-bubble.jpg", cap: "근처 플레이어에게만 보이는 말풍선" },
                  { t: "img", src: "media/img/folk-bubble-views.jpg", cap: "거리에 따른 말풍선 표시: A / B / C 시점" },
                ] },
                { t: "grid", items: [
                  { t: "list", h: "채널 생성 (Photon PUN2)", items: ["JoinOrCreateRoom(\"World1\", MaxPlayers 10): 없으면 만들고 있으면 입장", "OnJoinedRoom → Instantiate(\"Player\")", "입장·퇴장 콜백에서 참여자 목록·시스템 메시지 갱신"] },
                  { t: "list", h: "음성 채팅 (Photon Voice2)", items: ["플레이어 프리팹에 PhotonVoiceView · Recorder · Speaker", "캐릭터 생성 순간부터 같은 룸 접속자와 대화", "Recorder(마이크) → Voice 서버 → 상대 Speaker"] },
                  { t: "list", h: "텍스트 채팅 (PunRPC)", items: ["전체 채팅: RPC(OthersBuffered) + 본인 직접 호출", "말풍선: AllBuffered, 3초 뒤 닫힘. 거리 4 초과면 숨김", "전송 직전 욕설 필터 (JSON 사전 50여 개)"] },
                  { t: "list", h: "좌우반전 동기화 (PunRPC)", items: ["Walk 애니메이션은 오른쪽만, 왼쪽은 flipX", "FlipXRPC(AllBuffered): 늦게 입장해도 현재 방향을 본다", "InputField 포커스 중엔 이동 무시 → 채팅 중 오조작 방지"] },
                ] },
              ],
            },
            {
              id: "backend",
              title: "가상 휴대폰 백엔드",
              summary: "로그인, 친구, 문자, 선물을 UnityWebRequest → PHP → MySQL로.",
              tags: ["UnityWebRequest", "PHP"],
              thumb: "media/thumbs/folk-friend.jpg",
              sections: [
                { t: "grid", cols: 3, items: [
                  { t: "img", src: "media/img/folk-friend-search.jpg", cap: "친구 검색" },
                  { t: "img", src: "media/img/folk-friend-request.jpg", cap: "친구 알림 신청" },
                  { t: "img", src: "media/img/folk-friend-list.jpg", cap: "친구 목록" },
                ] },
                { t: "grid", items: [
                  { t: "list", h: "로그인 / 회원가입", items: ["회원가입 → userinfo INSERT", "로그인: id 조회 → pw 일치 시 닉네임 반환 → PlayerPrefs 저장 → MainMap", "그 닉네임을 Photon NickName으로 사용"] },
                  { t: "list", h: "친구", items: ["검색 → 신청(applyfriend). 상대는 미수락 행을 조회해 알림 배지 on/off", "친구 수락 = are_we_friend 갱신 + friendlist 양방향 2행 + messagelist 1행", "대화방 키는 user1 > user2 정규 순서를 지킨다."] },
                  { t: "list", h: "문자 메시지", items: ["메시지 전송: messagerecord INSERT + message_count 갱신 (순서 보장)", "메시지 목록: 상대별 마지막 문자, read_check = 0이면 안읽음 알림", "대화창을 열어둔 동안 새 문자를 가져와 읽음 처리"] },
                  { t: "list", h: "선물 (재화)", items: ["하트 전송: send_gift = 1 + 문자 내역에 특정 문자열 → 버튼 비활성화", "받는 쪽은 그 문자열을 선물 프리팹으로 표시", "수락 시 코인 +5, accept_gift = 1로 중복 차단"] },
                ] },
                { t: "grid", cols: 3, items: [
                  { t: "img", src: "media/img/folk-gift-before.jpg", cap: "선물 보내기 전 아이콘 활성화" },
                  { t: "img", src: "media/img/folk-gift-window.jpg", cap: "선물 보내기 메시지 창" },
                  { t: "img", src: "media/img/folk-unread.jpg", cap: "메시지 안읽음 알림" },
                ] },
              ],
            },
          ],
        },
        {
          title: "클라이언트",
          lead: "목록은 JSON이 정의한다",
          items: [
            {
              id: "shop",
              title: "아이템 목록 · 구매",
              summary: "JSON 목록과 Recyclable Scroll Rect로 만든 상점과 인벤토리.",
              tags: ["JSON", "Scroll Rect"],
              thumb: "media/thumbs/folk-shop.jpg",
              sections: [
                { t: "img", src: "media/img/folk-shop.jpg", cap: "상점: 가지고 있지 않은 아이템만 활성화" },
                { t: "grid", items: [
                  { t: "list", h: "아이템 데이터 목록", items: ["JSON 목록: type · name · sprite_name · have · price · x · y · width · height", "Itemhave: false → 상점에 생성", "Itemhave: true → 인벤토리에 생성"] },
                  { t: "list", h: "아이템 구매", items: ["구매 → minusCoin → coinUpdate.php → 재조회로 HUD 갱신", "이미 구매한 아이템은 상점에서 사라지고 인벤토리에 나타남 (중복 구매 불가)", "선물로 코인(+5)을 얻을 수 있다."] },
                ] },
              ],
            },
            {
              id: "decorate",
              title: "집 꾸미기 · 아바타",
              summary: "Drag & Drop으로 배치하고, 좌표를 저장해 재실행 시 복원한다.",
              tags: ["Drag & Drop", "UI"],
              thumb: "media/thumbs/folk-decorate.jpg",
              sections: [
                { t: "grid", cols: 3, items: [
                  { t: "img", src: "media/img/folk-decorate.jpg", cap: "집 꾸미기 화면" },
                  { t: "img", src: "media/img/folk-placed.jpg", cap: "배치 후 (좌표 저장)" },
                  { t: "img", src: "media/img/folk-avatar.jpg", cap: "아바타 커스텀" },
                ] },
                { t: "list", h: "Drag & Drop", items: ["IBeginDrag / IDrag / IEndDrag. 드래그 중 인벤토리 패널 숨김", "ScreenPointToLocalPointInRectangle로 캔버스 로컬 좌표 (해상도 독립)", "드롭 시 좌표 저장 → 재실행 시 복원", "아바타는 선택된 부위별 스프라이트 교체"] },
              ],
            },
          ],
        },
      ],
    },
  ],
};
