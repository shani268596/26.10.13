/**
 * MemoryQ - 기본 제공 프리셋 문제 데이터
 * 한국사, 일반상식/헌법, IT/정보처리기사 문제 세트 (5지선다 & OX)
 */

var PRESET_DECKS = [
  {
    id: 'preset-history',
    title: '🇰🇷 한국사 핵심 기출 암기 노트',
    category: '한국사',
    description: '시험에 빈출되는 삼국~근현대사 핵심 개념 5지선다 & OX 퀴즈',
    createdAt: '2026-10-13',
    questions: [
      {
        id: 'hist-ox-1',
        type: 'ox',
        question: '조선 세종 때 집현전 학사들과 함께 훈민정음을 창제하고 1446년에 반포하였다.',
        answer: 'O',
        explanation: '세종대왕은 1443년에 훈민정음을 창제하고, 1446년(세종 28년)에 정인지, 신숙주 등 집현전 학사들의 해례본과 함께 정식 반포하였습니다.',
        tags: ['조선시대', '세종']
      },
      {
        id: 'hist-ox-2',
        type: 'ox',
        question: '신라 진흥왕은 백제 성왕과 연합하여 한강 하류를 차지한 후 백제에 돌려주었다.',
        answer: 'X',
        explanation: '진흥왕은 백제 성왕과 연합하여 한강 유역을 공격한 뒤, 백제가 차지했던 한강 하류 지역마저 독차지(배신)하여 나제동맹이 결렬되고 관산성 전투가 일어났습니다.',
        tags: ['삼국시대', '신라']
      },
      {
        id: 'hist-ox-3',
        type: 'ox',
        question: '고려 광종은 노비안검법을 실시하여 호족의 경제적·군사적 기반을 약화시켰다.',
        answer: 'O',
        explanation: '고려 4대 광종은 억울하게 노비가 된 자들을 양인으로 해방시키는 노비안검법(956년)을 실시하여 왕권을 강화하고 호족 세력을 약화시켰습니다.',
        tags: ['고려시대', '광종']
      },
      {
        id: 'hist-ox-4',
        type: 'ox',
        question: '대한제국은 1897년 환구단에서 고종이 황제 즉위식을 거행하며 건원절이라는 독자적 연호를 사용하였다.',
        answer: 'X',
        explanation: '대한제국 수립 당시 고종이 선포한 독자적 연호는 "광무(光武)"입니다. 건원(建元)은 신라 법흥왕 때 사용된 우리나라 최초의 연호입니다.',
        tags: ['근현대사', '대한제국']
      },
      {
        id: 'hist-ox-5',
        type: 'ox',
        question: '임진왜란 당시 이순신 장군은 명량 해전에서 13척의 배로 133척의 왜선을 격파하였다.',
        answer: 'O',
        explanation: '1597년 정유재란 당시 이순신 장군은 명량(울돌목)에서 13척의 전선으로 133척의 왜군 함대를 대파하는 기적적인 승리를 거두었습니다.',
        tags: ['조선시대', '임진왜란']
      },
      {
        id: 'hist-5-1',
        type: 'choice5',
        question: '다음 중 삼국통일 과정의 사건들을 시대 순으로 바르게 나열한 것은?',
        options: [
          '백제 멸망 → 고구려 멸망 → 매소성 전투 → 기벌포 전투 → 나당 전쟁 발발',
          '백제 멸망 → 고구려 멸망 → 나당 전쟁 발발 → 매소성 전투 → 기벌포 전투',
          '고구려 멸망 → 백제 멸망 → 매소성 전투 → 기벌포 전투 → 나당 전쟁 발발',
          '백제 멸망 → 나당 전쟁 발발 → 고구려 멸망 → 매소성 전투 → 기벌포 전투',
          '나당 전쟁 발발 → 백제 멸망 → 고구려 멸망 → 기벌포 전투 → 매소성 전투'
        ],
        answerIndex: 1, // 0-indexed (2번째 보기)
        explanation: '순서: 백제 멸망(660) → 고구려 멸망(668) → 나당 연합 분열 및 전쟁 발발(670) → 매소성 전투 승리(675) → 기벌포 해전 승리(676 삼국통일 완성).',
        tags: ['삼국시대', '통일신라']
      },
      {
        id: 'hist-5-2',
        type: 'choice5',
        question: '조선 후기 대동법(大同法)에 대한 설명으로 가장 옳은 것은?',
        options: [
          '토지 1결당 미곡 4두를 징수하는 영정법의 일환이었다.',
          '군포 부담을 2필에서 1필로 줄여 백성의 군역 부담을 덜어주었다.',
          '가호(집) 단위로 부과하던 특산물 공납을 토지 결수에 따라 쌀, 베, 동전 등으로 통일 징수하였다.',
          '전분 6등법과 연분 9등법에 기초하여 세금을 세분화하여 책정하였다.',
          '흥선대원군이 양반에게도 군포를 징수하도록 한 제도이다.'
        ],
        answerIndex: 2,
        explanation: '대동법은 방납의 폐단을 막기 위해 가호 단위로 내던 공물(토산물)을 토지 결수에 따라 쌀(1결당 12두), 동전, 삼베 등으로 납부하게 한 개혁 제도입니다. (1번은 영정법, 2번은 균역법, 4번은 세종의 공법, 5번은 호포제)',
        tags: ['조선후기', '수취제도']
      },
      {
        id: 'hist-5-3',
        type: 'choice5',
        question: '1919년 3·1 운동의 직접적인 영향 및 결과로 옳지 않은 것은?',
        options: [
          '대한민국 임시정부가 중국 상하이에 수립되는 계기가 되었다.',
          '일제의 통치 방식이 무단 통치에서 이른바 문화 통치로 전환되었다.',
          '중국의 5·4 운동 등 아시아 반제국주의 민족 운동에 큰 영향을 주었다.',
          '신간회가 결성되어 민족유일당 운동이 전국적으로 확산되었다.',
          '국내외 항일 무장 독립운동이 본격화되고 독립군 부대가 정비되었다.'
        ],
        answerIndex: 3,
        explanation: '신간회는 1927년 비타협적 민족주의자와 사회주의 세력이 연대하여 창립한 좌우합작 단체로, 3·1 운동(1919년)의 직접적인 직후 결과가 아닙니다.',
        tags: ['일제강점기', '독립운동']
      }
    ]
  },
  {
    id: 'preset-common-sense',
    title: '⚖️ 헌법·법률 및 일반상식 필수 퀴즈',
    category: '상식/법률',
    description: '공무원, 대기업 인적성, NCS 시험에 자주 출제되는 법률·상식 문항',
    createdAt: '2026-10-13',
    questions: [
      {
        id: 'law-ox-1',
        type: 'ox',
        question: '대한민국 헌법 제1조 제2항은 "대한민국의 주권은 국민에게 있고, 모든 권력은 국민으로부터 나온다"이다.',
        answer: 'O',
        explanation: '헌법 제1조 1항은 "대한민국은 민주공화국이다", 2항은 "대한민국의 주권은 국민에게 있고, 모든 권력은 국민으로부터 나온다"로 규정되어 있습니다.',
        tags: ['헌법', '기본권']
      },
      {
        id: 'law-ox-2',
        type: 'ox',
        question: '형법상 만 14세 미만인 형사미성년자의 행위는 죄가 되지 아니하여 어떠한 경우에도 처벌되지 않는다.',
        answer: 'O',
        explanation: '형법 제9조에 따라 만 14세 미만인 자의 행위는 벌하지 않습니다. (단, 소년법에 따른 보호처분 대상인 촉법소년 규정은 별도 적용)',
        tags: ['형법', '형사미성년자']
      },
      {
        id: 'law-ox-3',
        type: 'ox',
        question: '민법상 계약은 반드시 서면(계약서)으로 작성해야만 법적 효력이 발생한다.',
        answer: 'X',
        explanation: '민법상 계약은 청약과 승낙이라는 의사표시의 합치만으로 성립하는 낙성·불요식 계약이 원칙이므로, 구두 계약도 유효하게 성립합니다.',
        tags: ['민법', '계약법']
      },
      {
        id: 'law-5-1',
        type: 'choice5',
        question: '다음 중 대한민국 헌법에 명시된 국민의 4대 기본 의무에 해당하지 않는 것은?',
        options: [
          '국방의 의무',
          '납세의 의무',
          '교육을 받게 할 의무 (자녀 교육 의무)',
          '근로의 의무',
          '투표의 의무 (선거권 행사 의무)'
        ],
        answerIndex: 4,
        explanation: '헌법상 국민의 기본 4대 의무는 국방, 납세, 교육(자녀에게 초등교육 및 법률이 정하는 교육을 받게 할 의무), 근로의 의무입니다. 투표(참정권)는 권리이며 헌법상 강제 의무가 아닙니다.',
        tags: ['헌법', '기본의무']
      },
      {
        id: 'law-5-2',
        type: 'choice5',
        question: '물가가 지속적으로 상승하면서 동시에 경기 침체가 함께 발생하는 경제 현상을 가리키는 용어는?',
        options: [
          '디플레이션(Deflation)',
          '스태그플레이션(Stagflation)',
          '인플레이션(Inflation)',
          '리플레이션(Reflation)',
          '애그플레이션(Agflation)'
        ],
        answerIndex: 1,
        explanation: '경기 침체를 뜻하는 스태그네이션(Stagnation)과 물가 상승을 뜻하는 인플레이션(Inflation)의 합성어로 스태그플레이션(Stagflation)이라고 합니다.',
        tags: ['경제상식', '용어']
      }
    ]
  },
  {
    id: 'preset-cs-it',
    title: '💻 IT · 컴퓨터 일반 & 정보처리기사 핵심',
    category: 'IT/자격증',
    description: '컴퓨터 구조, 네트워크, 데이터베이스, 소프트웨어 공학 빈출 퀴즈',
    createdAt: '2026-10-13',
    questions: [
      {
        id: 'it-ox-1',
        type: 'ox',
        question: 'HTTP 상태 코드 404는 클라이언트가 요청한 리소스를 서버에서 찾을 수 없음을 의미한다.',
        answer: 'O',
        explanation: 'HTTP 404 Not Found는 요청한 웹 페이지나 자원이 서버에 존재하지 않을 때 반환되는 표준 클라이언트 에러 코드입니다.',
        tags: ['네트워크', 'HTTP']
      },
      {
        id: 'it-ox-2',
        type: 'ox',
        question: '관계형 데이터베이스(RDB)의 기본키(Primary Key)는 중복값은 허용하지 않으나 NULL 값은 허용한다.',
        answer: 'X',
        explanation: '기본키(Primary Key)는 개체 무결성 제약조건에 의해 "중복 불가(Unique)" 및 "NULL 값 불가(Not Null)" 조건을 모두 만족해야 합니다.',
        tags: ['데이터베이스', '무결성']
      },
      {
        id: 'it-ox-3',
        type: 'ox',
        question: '스택(Stack)은 선입선출(FIFO, First In First Out) 방식으로 동작하는 자료구조이다.',
        answer: 'X',
        explanation: '스택(Stack)은 후입선출(LIFO, Last In First Out) 방식이며, 선입선출(FIFO)은 큐(Queue)의 동작 방식입니다.',
        tags: ['자료구조', '스택/큐']
      },
      {
        id: 'it-5-1',
        type: 'choice5',
        question: '객체지향 프로그래밍(OOP)의 4대 핵심 특징에 포함되지 않는 것은?',
        options: [
          '캡슐화 (Encapsulation)',
          '상속성 (Inheritance)',
          '다형성 (Polymorphism)',
          '추상화 (Abstraction)',
          '정규화 (Normalization)'
        ],
        answerIndex: 4,
        explanation: '정규화(Normalization)는 데이터베이스 설계에서 데이터 중복을 최소화하기 위한 과정이며, 객체지향 4대 특징은 캡슐화, 상속, 다형성, 추상화입니다.',
        tags: ['소프트웨어공학', 'OOP']
      },
      {
        id: 'it-5-2',
        type: 'choice5',
        question: 'OSI 7계층 참조 모델 중 IP 주소를 바탕으로 패킷 전송 경로를 설정(라우팅)하는 계층은?',
        options: [
          '물리 계층 (Physical Layer)',
          '데이터 링크 계층 (Data Link Layer)',
          '네트워크 계층 (Network Layer)',
          '전송 계층 (Transport Layer)',
          '세션 계층 (Session Layer)'
        ],
        answerIndex: 2,
        explanation: '네트워크 계층(Network Layer, 3계층)은 패킷의 최적 경로 선택(라우팅) 및 논리 주소(IP) 지정을 담당합니다. (라우터가 작동하는 계층)',
        tags: ['네트워크', 'OSI 7계층']
      }
    ]
  },
  {
    id: 'preset-english-voca',
    title: '🇬🇧 수능·공무원·TOEIC 핵심 영단어 & 어법',
    category: '영어',
    description: '시험에 빈출되는 고급 어휘 및 필수 문법 혼동 포인트 5지선다 & OX 퀴즈',
    createdAt: '2026-10-13',
    questions: [
      {
        id: 'eng-ox-1',
        type: 'ox',
        question: '단어 "reluctant"는 "열망하는, 간절히 바라는"의 의미를 갖는다.',
        answer: 'X',
        explanation: 'reluctant는 "꺼리는, 마지못해 하는"의 의미입니다. "열망하는"은 eager, keen, avid 등의 단어를 씁니다.',
        tags: ['영어어휘', '반의어']
      },
      {
        id: 'eng-ox-2',
        type: 'ox',
        question: '"Despite"는 전치사이므로 뒤에 절(주어+동사)이 아닌 명사(구)가 와야 한다.',
        answer: 'O',
        explanation: 'despite와 in spite of는 전치사이므로 뒤에 명사 또는 동명사가 오며, 접속사인 although, even though 뒤에 주어+동사 절이 옵니다.',
        tags: ['영어문법', '전치사접속사']
      },
      {
        id: 'eng-ox-3',
        type: 'ox',
        question: '"comprehensive"는 "이해력이 풍부한"의 뜻이고, "포괄적인, 종합적인"의 뜻은 "comprehensible"이다.',
        answer: 'X',
        explanation: '반대입니다! comprehensive가 "포괄적인, 종합적인"이고, comprehensible이 "이해할 수 있는"을 의미합니다. 시험에 자주 혼동 출제되는 대표적 어휘입니다.',
        tags: ['혼동어휘', '형용사']
      },
      {
        id: 'eng-5-1',
        type: 'choice5',
        question: '다음 빈칸에 들어갈 단어로 가장 적절한 것은?\n"The committee decided to _______ the decision until the next meeting."',
        options: [
          'postpone (연기하다)',
          'accelerate (가속하다)',
          'abolish (폐지하다)',
          'commence (시작하다)',
          'distort (왜곡하다)'
        ],
        answerIndex: 0,
        explanation: '문맥상 "위원회는 다음 회의까지 결정을 연기하기로(postpone) 결정했다"가 가장 자연스럽습니다. postpone = put off = defer.',
        tags: ['영어독해', '어휘']
      },
      {
        id: 'eng-5-2',
        type: 'choice5',
        question: '단어 "lucrative"와 가장 가까운 의미(동의어)를 지닌 단어는?',
        options: [
          'hazardous (위험한)',
          'profitable (수익성이 좋은)',
          'tedious (지루한)',
          'ambiguous (모호한)',
          'frugal (검소한)'
        ],
        answerIndex: 1,
        explanation: 'lucrative는 "수익성이 좋은, 돈벌이가 되는"이라는 뜻으로 profitable과 유의어입니다.',
        tags: ['동의어', '고급어휘']
      }
    ]
  }
];

if (typeof window !== 'undefined') {
  window.PRESET_DECKS = PRESET_DECKS;
}
