import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BookOpen, User, MessageSquare, HelpCircle, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  author: string;
}

export const DreamBlog: React.FC<{ language: 'ko' | 'en'; onBackToMain: () => void }> = ({ language, onBackToMain }) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  
  const observer = useRef<IntersectionObserver | null>(null);

  const posts: BlogPost[] = [
    {
      id: 'dragon-dream',
      title: language === 'en' 
        ? "All About Dragon Dreams - In-Depth Analysis"
        : "용 꿈의 모든 것 - 용 꿈 심층분석",
      excerpt: language === 'en'
        ? "Explore the ancient mythological roots, psychological archetypes, and situational meanings of dragon dreams, structured into positive guides and warning signals."
        : "용이 소용돌이치며 오르는 찬란한 길조와 하늘에서 추락하는 나쁜 징조 등, 영험한 천상의 야수 용꿈의 정체와 대처법을 상세히 분석합니다.",
      category: language === 'en' ? "Celestial Beasts" : "영적 동물",
      coverImage: "/dragon_dream.png",
      author: "DreamTeller Editor"
    },
    {
      id: 'tiger-dream',
      title: language === 'en'
        ? "All About Tiger Dreams - In-Depth Analysis"
        : "호랑이 꿈의 모든 것 - 호랑이 꿈 심층분석",
      excerpt: language === 'en'
        ? "Uncover the spiritual protection, psychological shadow integration, and situational meanings of tiger dreams, categorized into lucky signs and cautionary warnings."
        : "방으로 걸어 들어오는 백호의 상서로운 길조부터 고양이로 변하거나 가문을 이탈하는 불길한 경고까지, 숲의 제왕이 선사하는 내면 에너지를 총정리합니다.",
      category: language === 'en' ? "Spiritual Guides" : "행운과 명예",
      coverImage: "/tiger_dream.png",
      author: "DreamTeller Editor"
    }
  ];

  // Set up Intersection Observer to track active header section when detailed post is loaded
  useEffect(() => {
    if (!selectedPostId) return;

    const timer = setTimeout(() => {
      const headings = document.querySelectorAll('.blog-body-text h2, .blog-body-text h3');
      
      observer.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
      );

      headings.forEach((heading) => observer.current?.observe(heading));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.current?.disconnect();
    };
  }, [selectedPostId]);

  const handleTocClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const currentPost = posts.find(p => p.id === selectedPostId);

  return (
    <div className="blog-container fade-in">
      {/* Blog Detail View */}
      {selectedPostId && currentPost ? (
        <div>
          <button onClick={() => setSelectedPostId(null)} className="blog-back-btn">
            <ArrowLeft size={16} />
            <span>{language === 'en' ? 'Back to Library' : '글 목록으로 돌아가기'}</span>
          </button>

          <div className="blog-detail-container">
            {/* Left Content Column */}
            <article className="blog-post-content glass-panel">
              <div className="blog-post-header">
                <span className="blog-post-meta-tag">{currentPost.category}</span>
                <h1 className="blog-post-title font-display">{currentPost.title}</h1>
                
                <div className="blog-post-meta-line">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={14} />
                    <span>{currentPost.author}</span>
                  </div>
                </div>
              </div>

              <img 
                src={currentPost.coverImage} 
                alt={currentPost.title} 
                className="blog-hero-image"
              />

              {/* POST 1: DRAGON DREAM CONTENT */}
              {selectedPostId === 'dragon-dream' && (
                <div className="blog-body-text">
                  <p id="sec-intro" style={{ fontSize: '1.1rem', color: '#fff', fontWeight: '500', lineHeight: '1.9' }}>
                    {language === 'en'
                      ? "The dragon stands as the ultimate spiritual creature in both ancient myths and the depths of our unconscious mind. Dreaming of a dragon is regarded as one of the most powerful and auspicious visions. However, not all dragon dreams bring absolute fortune; the outcome shifts dramatically depending on the flow of the dream. In this guide, we break down dragon dreams into Good Directions and Bad Directions, backed by mythology and psychology."
                      : "용(Dragon)은 무의식의 가장 깊은 곳을 대변하는 천상의 영수이자 절대적인 기운의 표상입니다. 흔히 용꿈이라고 하면 무조건적인 일확천금의 상징으로 이해되지만, 꿈에서 흘러가는 상황의 전개에 따라 극단적인 길흉화복으로 분기됩니다. 본 가이드북에서는 용꿈의 상징적 에너지와 함께, 실제 인생에 긍정적인 파동을 미치는 '좋은 방향(길몽)'과 조심스러운 경고를 뜻하는 '나쁜 방향(흉몽/경고)'으로 상황을 명확히 분류해 해석해 드립니다."}
                  </p>

                  <blockquote style={{ fontSize: '0.95rem' }}>
                    {language === 'en'
                      ? "\"To dream of a dragon is to confront the latent fire within. When steered towards the light, it brings great fortune; when neglected or broken, it warns of an impending shift in fate.\""
                      : "“용꿈을 꾸는 것은 가슴속에 잠재된 불꽃과 대면하는 일이다. 그것이 빛을 향해 치솟으면 위대한 행운이 되며, 날개가 꺾이거나 시들면 내면의 균형을 재조정하라는 경고가 된다.”"}
                  </blockquote>

                  <h2 id="sec-myth">
                    <BookOpen size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "1. Mythology & The Double-Edged Qi of the Dragon" : "1. 고대 신화적 관점으로 보는 용의 영적 기운"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "In Eastern philosophy, the dragon represents the absolute zenith of Qi (cosmic energy). It controls the clouds, oceans, and winds. Because the dragon is a mythical chimera constructed from various creatures, it represents the unification of disparate elements. Thus, a dragon dream signals that elements in your waking life are combining to create a massive transformation. However, because it carries such a high charge of energy, any disruption or injury to the dragon in your dream warns of a significant energetic imbalance."
                      : "동양 철학에서 용은 대우주의 양기(陽氣)가 최고조에 달했을 때 실체화되는 상상 속의 신수입니다. 동양 신화에서 용은 날씨와 바다, 비구름을 다스리며 왕이나 황제의 권위로 칭송받았습니다. 용은 뱀의 몸, 잉어의 비늘, 호랑이의 발바닥 등 수많은 동물의 정수가 하나로 합쳐진 개체이므로 무의식 속 여러 생각과 현실적 조건들이 조화를 이루어 대격변을 선사한다는 의미를 지닙니다. 하지만 기운이 지나치게 강한 동물인 만큼, 꿈에서 용이 상처를 입거나 부정적인 조우를 겪게 되는 것은 인생의 지각 변동을 조심하라는 두 개의 날을 가지고 있습니다."}
                  </p>

                  <h2 id="sec-good">
                    <MessageSquare size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "2. Good Directions: Auspicious Dragon Dreams and Luck" : "2. 좋은 방향으로 흘러가는 용꿈 (대길의 길몽)"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "Auspicous dragon dreams are characterized by clean movement, bright colors, and feelings of awe. These dreams signal a dramatic rise in status, wealth, or health:"
                      : "좋은 기운을 품은 용꿈은 밝은 빛, 힘찬 움직임, 그리고 경외감을 느끼는 정서가 주를 이룹니다. 이 꿈들은 사회적 권력의 확대, 재물운의 대폭 상승, 명예 획득 등을 강력하게 증명합니다."}
                  </p>
                  
                  <ul>
                    <li>
                      <strong>{language === 'en' ? "2.1 The Golden Dragon Ascending with a Pearl" : "2.1 황금룡이 여의주를 물고 힘차게 승천하는 꿈"}</strong>: 
                      {language === 'en'
                        ? " The absolute peak of all dreams. It predicts supreme success in career, business, or exams. If it is a conceiving dream (Tae-mong), it predicts the birth of a child destined for national or global prestige."
                        : " 모든 해몽 중 으뜸에 해당하는 꿈입니다. 여의주(깨달음과 핵심 권능)를 물고 비상하는 모습은 본인이 주도하는 프로젝트의 초대박 성공, 시험 합격, 정계나 교단에서의 최고의 당선을 나타냅니다. 큰 권세를 떨칠 아이가 태어날 태몽으로도 유명합니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "2.2 Being Bitten or Swallowed by a Dragon" : "2.2 용에게 직접 물리거나 품에 가득 안기는 꿈"}</strong>: 
                      {language === 'en'
                        ? " This indicates that you will gain powerful support from a highly influential mentor or institution. It represents inheriting authority or capital that elevates your lifestyle."
                        : " 현실에 대입하면 놀라운 일이나, 용이라는 상서로운 우주적 권위와 에너지가 내 몸속에 직접 융합되는 표상입니다. 막강한 귀인의 지지를 받거나, 상속이나 투자를 통해 막대한 상업적 자산을 물려받아 신분이 업그레이드됨을 뜻합니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "2.3 Riding on a Dragon's Back to Fly Through the Sky" : "2.3 용의 등에 걸터앉아 은하수와 넓은 하늘을 비행하는 꿈"}</strong>: 
                      {language === 'en'
                        ? " Signals a rapid and stable advancement. You are in complete control of your destiny, riding the wind of favorable circumstances. Highly favorable for investors and leaders."
                        : " 날개를 단 듯이 신속하고도 안정적으로 지위가 향상될 징조입니다. 우호적인 외부 환경을 타고 자신의 운명을 완전하게 제어하고 있음을 의미합니다. 지도자나 투자가에게 있어 사업의 무한 질주를 뜻합니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "2.4 The Dragon Breathing Fire Upon Your Body" : "2.4 용이 내 머리나 온몸 위로 거대한 불꽃을 뿜는 꿈"}</strong>: 
                      {language === 'en'
                        ? " Fire represents purifying progress and explosive growth. It indicates that your works, creations, or business ventures will catch fire metaphorically, gaining massive popularity and financial success."
                        : " 불꽃은 무의식의 정화와 폭발적인 발전을 표방합니다. 당신이 공들여 창작한 작품, 개발한 제품, 혹은 설립한 스타트업이 세간의 뜨거운 대중적 찬사를 받고 큰 재물을 모으게 됨을 상징합니다."}
                    </li>
                  </ul>

                  <h2 id="sec-bad">
                    <MessageSquare size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "3. Bad Directions: Cautionary Dragon Dreams and Warnings" : "3. 나쁜 방향으로 흘러가는 용꿈 (주의와 경고의 흉몽)"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "Warning dragon dreams involve stagnation, downfall, or injury. These signify that you are over-expanding, ignoring inner conflicts, or facing an impending decline in fortune:"
                      : "경고나 흉운을 의미하는 용꿈은 주로 추락, 부상, 혹은 갇히거나 어둠 속에서 방황하는 연출이 많습니다. 이는 욕망의 폭발로 인한 파멸, 건강의 악화, 계약이나 지위 상실의 강력한 징후이므로 극도의 안정이 필요합니다."}
                  </p>

                  <ul>
                    <li>
                      <strong>{language === 'en' ? "3.1 An Ascending Dragon Falling to the Earth" : "3.1 하늘로 높이 날아가던 용이 돌연 지상으로 추락하는 꿈"}</strong>: 
                      {language === 'en'
                        ? " Represents a sudden collapse in social status or project failure. It warns that pride and lack of planning will result in a heavy fall. Take a step back and check your foundations."
                        : " 자신이 오랜 시간 공들여 쌓아 올린 사회적 지위나 커리어가 한순간의 실수로 땅바닥으로 굴러 떨어질 수 있음을 의미합니다. 오만함과 부실한 계획성이 낳을 참패를 막기 위해 스스로 기초를 재점검해야 합니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "3.2 Fighting a Dragon and Losing, or Being Threatended" : "3.2 용과 목숨 걸고 싸웠으나 패배하거나 용이 날카롭게 위협하는 꿈"}</strong>: 
                      {language === 'en'
                        ? " You are struggling against a force that is far greater than your current capability. It suggests that you must stop forcing legal or business battles and seek reconciliation."
                        : " 본인의 현재 능력치나 역량을 아득히 넘어서는 무리한 환경적 규제나 법률 소송, 혹은 대자본과의 무모한 경쟁을 벌여 정신이 갉아 먹히고 있음을 나타냅니다. 고집을 부리기보다는 한발 물러서야 안전합니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "3.3 Losing the Mystic Dragon Pearl to Someone Else" : "3.3 빛나던 여의주를 다른 사람에게 강탈당하거나 길가에 떨어뜨려 잃어버리는 꿈"}</strong>: 
                      {language === 'en'
                        ? " The pearl represents your core advantage, intellectual property, or critical capital. This dream warns you of copyright theft, investment loss, or betrayals from business partners."
                        : " 여의주는 인생의 주도권을 장악하는 지적재산권, 독점 기술, 혹은 핵심 투자 자금을 의미합니다. 이를 잃어버리는 표상은 동업자에게 기술을 뺏기거나, 사기 투자 계약에 휘말려 가문의 자본이 누수됨을 강력하게 경고합니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "3.4 Seeing a Dragon with Damaged Scales or Bleeding Wounds" : "3.4 용의 비늘이 전부 벗겨져 흉측하게 변했거나 피투성이 상처를 입은 꿈"}</strong>: 
                      {language === 'en'
                        ? " The scales of a dragon protect its body. Damaged scales reflect a weakened immune system, health problems, or damage to your personal reputation. You need rest and recovery."
                        : " 용의 비늘은 신성을 수호하는 갑옷과 같습니다. 비늘이 벗겨지고 상처 입은 용의 모습을 관찰하는 꿈은 본인의 육체적 면역계 붕괴, 중병의 발생 혹은 신용도 저하를 뜻하므로 당장 충분한 휴식과 마음 치료가 필요함을 뜻합니다."}
                    </li>
                  </ul>

                  <h2 id="sec-psychology">
                    <HelpCircle size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "4. The Psychological Perspective: Carl Jung's Dragon Archetype" : "4. 현대 분석심리학(칼 융)의 눈으로 바라본 용 원형"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "From the perspective of Carl Jung's analytical psychology, the dragon is a projection of the Self archetype combined with the raw power of the Shadow. Slashing the dragon (in Western myth) represents slaying the overbearing parent or unconscious control to establish the Ego. However, integrating and riding the dragon (in Eastern myth) represents the ultimate achievement of Individuation—where the Ego and the deep Unconscious flow in perfect harmony."
                      : "칼 구스타프 융의 정신의학 모델에 따르면, 꿈속의 용은 인류 공통의 '집단 무의식(Collective Unconscious)'에서 비롯된 '자기(Self)' 원형의 가장 강력한 화신입니다. 동서양을 막론하고 용을 제어하거나 합일되는 꿈은, 자아(Ego)가 그동안 두렵고 어두워서 차마 대면하지 못했던 무의식의 영역(그림자)을 온전하게 흡수하여 고도의 인격적 발달을 성취하는 자아 통합의 역동적인 드라마를 그려냅니다."}
                  </p>

                  <h2 id="sec-faq">
                    <HelpCircle size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "5. FAQ: Frequently Asked Questions about Dragon Dreams" : "5. 용 꿈해몽 자주 묻는 질문 (FAQ)"}
                  </h2>
                  
                  <div className="blog-faq-grid">
                    <div className="blog-faq-card">
                      <div className="blog-faq-q">
                        <span>Q1.</span>
                        <strong>{language === 'en' ? "Do all positive dragon dreams guarantee winning the lottery?" : "좋은 용꿈을 꾸면 정말 무조건 복권에 당첨되나요?"}</strong>
                      </div>
                      <p className="blog-faq-a">
                        {language === 'en'
                          ? "While they represent a massive surge in wealth, a dragon dream is fundamentally a 'life path transition' dream. This means the fortune usually manifests as a long-term business success, major investment profit, or career promotion, rather than just simple instant scratch-card cash."
                          : "대길의 행운을 상징하는 것은 맞으나, 복권과 같은 일시적 횡재보다 가문의 기둥이 바로 서는 장기적인 사업적 성공이나 핵심 자산의 우상향 등 삶의 레벨 전체가 한 차원 상승하는 행운으로 다가오는 경우가 훨씬 보편적입니다."}
                      </p>
                    </div>

                    <div className="blog-faq-card">
                      <div className="blog-faq-q">
                        <span>Q2.</span>
                        <strong>{language === 'en' ? "How long does the influence of a dragon dream last?" : "용꿈의 기운은 현실에서 얼마나 오래 지속되나요?"}</strong>
                      </div>
                      <p className="blog-faq-a">
                        {language === 'en'
                          ? "Minor dreams fade in 3 to 7 days, but a dragon dream represents a structural shift in your destiny. Its energetic effects can last from 3 to 10 years, and if it functions as a conceiving dream (Tae-mong), it defines the core path of the child's entire lifetime."
                          : "보통의 일상적인 개꿈이나 심리몽은 3일 이내에 휘발되지만, 용이 온몸을 휘감거나 승천하는 거대한 비전은 최소 3년에서 10년이라는 긴 주기에 걸쳐 당신의 현실 운명을 비호합니다. 특히 태몽의 영향력은 일평생 지속됩니다."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* POST 2: TIGER DREAM CONTENT */}
              {selectedPostId === 'tiger-dream' && (
                <div className="blog-body-text">
                  <p id="sec-intro" style={{ fontSize: '1.1rem', color: '#fff', fontWeight: '500', lineHeight: '1.9' }}>
                    {language === 'en'
                      ? "The tiger has long been feared and revered as the sovereign ruler of the mountains and the guardian spirit of lands. In the realm of dreams, the tiger represents status, physical power, and primal instinct. However, just like the dragon, the tiger carries a double-edged sword. Whether your tiger dream brings protective fortune (Good Direction) or psychological threat (Bad Direction) depends entirely on the context. Let's explore these pathways."
                      : "호랑이는 전통적으로 백수의 제왕이자 산신령을 호위하는 영물로, 인간에게 두려움과 경외심을 동시에 선사하는 영수입니다. 꿈속의 호랑이는 사회적 명예, 카리스마 넘치는 지배력, 날것 그대로의 본능적 에너지를 상징합니다. 하지만 호랑이 꿈 또한 전개 방향에 따라 대길의 조력자가 되기도 하고, 파괴적인 위협이 되기도 합니다. 호랑이 꿈이 던지는 '좋은 방향'과 '나쁜 방향'의 갈래를 상세히 파헤칩니다."}
                  </p>

                  <blockquote style={{ fontSize: '0.95rem' }}>
                    {language === 'en'
                      ? "\"The tiger in your room is the animal shadow of your soul. Tame it, and you walk with the stride of a king; fear it, and you run from your own power.\""
                      : "“방 안에서 호랑이를 마주하는 것은 영혼 속에 깃든 야수성과 대면하는 일이다. 길들이면 군주의 발걸음으로 당당해지고, 두려워 회피하면 본연의 힘으로부터 도망치는 꼴이다.”"}
                  </blockquote>

                  <h2 id="sec-myth">
                    <BookOpen size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "1. Sovereign of the Mountain: Symbolism of the Sacred Tiger" : "1. 산신령의 동반자, 호랑이가 가진 신성한 상징성"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "Unlike the dragon which represents abstract celestial energy, the tiger represents concrete physical and earthly power. In Eastern shamanism, the tiger serves as a protector deity that expels bad luck (Byeok-sa). When a tiger dream takes a positive path, it means that this shield of protection is active around you, granting you authority in the material world. When it takes a negative path, it points to internal anxiety or conflicts with physical reality."
                      : "하늘의 구름을 일으키는 용이 우주적이고 추상적인 기운을 뜻한다면, 대지를 호령하는 호랑이는 물질 세계에서의 '현실적인 권력'과 '강인한 육체적 생명력'을 상징합니다. 고조선 문명부터 한국 민담에 이르기까지 호랑이는 산신령의 비호 아래 액운을 막는 벽사의 대명사였습니다. 호랑이 꿈이 긍정적으로 흐르면 현실 세계의 귀인과 세력 장악을 의미하며, 부정적으로 전개되면 감당하기 힘든 스트레스나 내재적 불안을 경고합니다."}
                  </p>

                  <h2 id="sec-good">
                    <MessageSquare size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "2. Good Directions: Auspicious Tiger Dreams and Power" : "2. 좋은 방향으로 흘러가는 호랑이 꿈 (대길의 길몽)"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "Auspicious tiger dreams show the beast behaving peacefully, entering your home, or combining its strength with yours. These dreams signal leadership, wealth, and spiritual protection:"
                      : "상서롭고 운이 좋은 호랑이 꿈은 주로 호랑이가 온화한 행동을 취하거나, 집안을 호위하거나, 당신과 우호적인 연대를 맺는 모습으로 나타납니다. 지위 상승, 엄청난 횡재, 수호력의 활성화를 의미합니다."}
                  </p>
                  
                  <ul>
                    <li>
                      <strong>{language === 'en' ? "2.1 A White Tiger Stepping into the Room/House" : "2.1 백호가 품에 안기거나 집안이나 거실로 늠름하게 들어오는 꿈"}</strong>: 
                      {language === 'en'
                        ? " The white tiger is a holy messenger. Its presence in your home signals that massive honor, nobility, and status are settling into your life. It is also a rare Tae-mong (conceiving dream) for a child who will achieve national leadership."
                        : " 백호는 사신(四神) 중 하나인 서쪽의 수호신입니다. 늠름한 백호가 제 발로 집안으로 걸어 들어오거나 품에 폭 안기는 꿈은 가문의 가운이 폭발적으로 상승하며 고관대작에 오를 귀인을 만날 징조입니다. 명예와 권력을 쥐어잡을 귀한 아이의 태몽이기도 합니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "2.2 Being Bitten by a Tiger with Lots of Bleeding" : "2.2 호랑이에게 깊숙이 물려 붉은 피가 온몸에 흐르는 꿈"}</strong>: 
                      {language === 'en'
                        ? " Paradoxically, this is an elite fortune dream. In dream logic, blood represents the flow of life force and wealth. Getting bitten and bleeding heavily predicts a massive financial breakthrough or investment victory."
                        : " 현실에선 끔찍하지만 해몽학에선 대길몽입니다. 붉은 피(생명력과 재화)가 온몸을 적시는 것은 거대한 투자 성공, 복권 당첨, 부동산 급등 등으로 인한 막대한 현금 자산의 유입을 예측합니다. 상처가 깊고 피가 철철 흐를수록 그 액수가 비례해 올라갑니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "2.3 Riding on a Tiger's Back to Run Across the Earth" : "2.3 호랑이의 등을 타고 드넓은 대지나 산맥을 질주하는 꿈"}</strong>: 
                      {language === 'en'
                        ? " This implies you are commanding a large organization or a powerful force. It shows that you have the capability to lead projects, employees, or political teams to absolute success."
                        : " 야생의 맹수를 제어하고 타고 달리는 것은 거대 조직의 의장이나 단체의 통솔자가 됨을 뜻합니다. 막강한 동력(인적 자원, 외부 투자금)을 내 손아귀에 쥐고 마음껏 조종하며 목표한 야망을 순식간에 돌파하게 됩니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "2.4 Holding and Petting a Baby Tiger Cub" : "2.4 새끼 호랑이를 안아 들고 귀엽게 쓰다듬는 꿈"}</strong>: 
                      {language === 'en'
                        ? " Baby tigers represent seeds of power or future assets. This dream signifies starting a promising business, discovering a highly talented subordinate, or a warm conceiving dream."
                        : " 새끼 호랑이는 미래의 자산이나 영리한 인재를 의미합니다. 신규 벤처 사업의 훌륭한 파트너를 영입하거나, 회사에 충성도 높은 실력 있는 부하 직원을 두게 될 징조입니다. 귀엽고 다정한 기운이 넘쳐나는 대표적인 태몽이기도 합니다."}
                    </li>
                  </ul>

                  <h2 id="sec-bad">
                    <MessageSquare size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "3. Bad Directions: Cautionary Tiger Dreams and Warnings" : "3. 나쁜 방향으로 흘러가는 호랑이 꿈 (주의와 경고의 흉몽)"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "Warning tiger dreams are characterized by terror, escape, degradation, or hostlity. These indicate that you are feeling overwhelmed, losing your status, or suffering from inner anxiety:"
                      : "흉조를 띤 호랑이 꿈은 주로 쫓김, 상처, 고양이로의 변신, 이탈 등의 형태로 나타납니다. 본인의 나약해진 멘탈 상태, 가문의 권세 상실, 혹은 주변인들과의 심각한 갈등 조짐을 나타내므로 처신에 매우 조심해야 합니다."}
                  </p>
                  
                  <ul>
                    <li>
                      <strong>{language === 'en' ? "3.1 Being Chased by a Tiger in Extreme Terror" : "3.1 호랑이에게 쫓기며 극도의 공포와 무력감에 휩싸이는 꿈"}</strong>: 
                      {language === 'en'
                        ? " Indicates you are suffering from immense pressure, or you are running away from an authoritarian figure or challenge. It warns you to confront the stressor directly."
                        : " 현재 감당하기 힘든 회사 내 과중한 업무 압박, 혹은 폭력적인 상사나 가부장적인 권위자에게 짓눌려 마음의 고통을 겪고 있음을 뜻합니다. 도망치는 것만으로는 문제가 해결되지 않음을 알려주는 심리적 적신호입니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "3.2 A Majestic Tiger Suddenly Turning into a Cat" : "3.2 늠름하던 호랑이가 갑자기 나약한 고양이로 변해버리는 꿈"}</strong>: 
                      {language === 'en'
                        ? " A classic warning of anti-climax. A business or investment that started with grand promises will lose all its power, resulting in a small, unprofitable outcome. Watch out for over-inflated deals."
                        : " 시작은 창대했으나 끝은 초라하게 오그라드는 용두사미(龍頭蛇尾) 형국의 경고입니다. 거창하게 출범한 비즈니스의 알맹이가 텅 빈 사기성이었음을 뒤늦게 발견하거나, 명예롭던 파트너의 몰락을 겪게 될 수 있어 계약을 멈추어야 합니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "3.3 A Tiger Leaving Your House or Vanishing" : "3.3 집안에 들어왔던 호랑이가 문 밖으로 도망치거나 돌연 사라지는 꿈"}</strong>: 
                      {language === 'en'
                        ? " The tiger represents the luck and authority protecting your family. If it escapes, it signifies a loss of capital, keys of power, or the departure of a crucial family member."
                        : " 호랑이는 가문을 비호하는 수호신이자 대길의 권세입니다. 호랑이가 도망치는 것은 내 인생의 핵심 파워, 투자 자본의 증발, 혹은 가문의 핵심 기둥이자 의지가 되는 귀한 조력자가 나를 떠나 손해를 입게 됨을 예시합니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "3.4 An Injured Tiger Growling Hostilely at You" : "3.4 덫에 걸렸거나 상처 입은 호랑이가 나를 향해 이빨을 드러내며 으르렁거리는 꿈"}</strong>: 
                      {language === 'en'
                        ? " Indicates conflicts with powerful figures. You might face lawsuits, workplace disputes, or backlash from parents. It warns you to mend relations and avoid aggressive words."
                        : " 상처 입은 권위 있는 사람이나 세력과의 충돌을 의미합니다. 직장 내 상사와의 심각한 트러블, 관공서와의 소송, 혹은 가문 내 유산 분쟁 등으로 인해 곤욕을 치를 수 있으니 당분간 언행을 극도로 조심해야 합니다."}
                    </li>
                  </ul>

                  <h2 id="sec-psychology">
                    <HelpCircle size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "4. Psychoanalysis: Primal Instincts and the Inner Guardian" : "4. 현대 정신분석학적 관점: 자아(Ego)와 그림자(Shadow)"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "From a psychological perspective, a tiger represents the raw, instinctual energy of the Id (unconscious desires, animalistic instincts) that the conscious Ego is often afraid to face. Jungian therapists explain that facing a tiger in a dream symbolizes the confrontation with your personal Shadow."
                      : "지그문트 프로이트의 정신분석 모델에 의하면, 호랑이는 억압된 성적 리비도, 원시적인 공격성, 생명력 그 자체인 '이드(Id)'를 대변합니다. 칼 융은 호랑이를 만나는 꿈을 의식세계인 자아(Ego)가 그동안 두렵고 어두워서 차마 대면하지 못했던 무의식의 강력한 힘, 즉 '그림자(Shadow)'를 직면하는 사건으로 봅니다."}
                  </p>
                  <p>
                    {language === 'en'
                      ? "If the tiger is peaceful or if you successfully tame it, it implies you are integrating this raw energy into your persona, converting potential anger or anxiety into healthy self-confidence and boundary-setting. If the tiger threatens you, it suggests that you are neglecting your instinctual needs, and your subconscious is warning you to restore psychological balance."
                      : "만약 꿈속의 호랑이와 눈을 맞추며 평화로운 기류가 흘렀다면, 이는 자신의 억압된 야망이나 열망을 사회적이고 합리적인 페르소나와 성공적으로 통합시켰음을 증명합니다. 억눌렸던 에너지를 통제할 수 있게 되어, 현실세계에서 당당히 본인의 자리를 요구할 자존감이 충만해졌음을 반영합니다."}
                  </p>

                  <h2 id="sec-faq">
                    <HelpCircle size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "5. FAQ: Common Questions about Tiger Dreams" : "5. 호랑이 꿈해몽 자주 묻는 질문 (FAQ)"}
                  </h2>
                  
                  <div className="blog-faq-grid">
                    <div className="blog-faq-card">
                      <div className="blog-faq-q">
                        <span>Q1.</span>
                        <strong>{language === 'en' ? "What if the tiger in my dream was friendly but still scary?" : "꿈에 나타난 호랑이가 다정하게 굴었지만 여전히 무서웠다면요?"}</strong>
                      </div>
                      <p className="blog-faq-a">
                        {language === 'en'
                          ? "This represents the birth of a major power that you are not yet fully ready to handle. While it is fundamentally a positive sign, your mind is experiencing fear because the scope of the upcoming luck is much larger than your current capacity. Stay calm and accept the change."
                          : "나를 향해 올 좋은 기운이나 강력한 권세의 크기가 본인이 평소에 담을 수 있는 그릇보다 훨씬 크기 때문에 자아가 압도감을 느끼는 경우입니다. 근본적으로는 길몽이니 두려워하지 말고 기운을 당당하게 받으셔도 좋습니다."}
                      </p>
                    </div>

                    <div className="blog-faq-card">
                      <div className="blog-faq-q">
                        <span>Q2.</span>
                        <strong>{language === 'en' ? "What does it mean if a tiger fights a dragon or another beast?" : "호랑이가 용이나 다른 맹수와 치열하게 싸우는 꿈은 무엇을 뜻하나요?"}</strong>
                      </div>
                      <p className="blog-faq-a">
                        {language === 'en'
                          ? "This symbolizes a clash between two major forces. In business or politics, it indicates a fierce power struggle. In personal psychology, it shows a conflict between your intellect (represented by the dragon) and your raw instinct (represented by the tiger). A resolution is near."
                          : "현실에서는 두 개의 큰 세력, 혹은 직장 내 강력한 두 리더 사이에 대규모 알력 다툼이나 권력 투쟁이 벌어져 본인이 그 사이에 낄 수 있음을 의미합니다. 개인 심리로 대입하면 자신의 이성(용)과 야생적 본능(호랑이)이 팽팽한 내적 갈등을 벌이고 있음을 보여줍니다."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </article>

            {/* Right Sticky TOC Sidebar */}
            <aside className="blog-toc-sidebar glass-panel">
              <h3 className="blog-toc-title font-display">
                {language === 'en' ? 'Table of Contents' : '이 글의 목차'}
              </h3>
              <ul className="blog-toc-list">
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-intro')}
                    className={`blog-toc-item ${activeSection === 'sec-intro' ? 'active' : ''}`}
                  >
                    {language === 'en' ? 'Introduction' : '서론 및 요약'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-myth')}
                    className={`blog-toc-item ${activeSection === 'sec-myth' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '1. Mythological Symbolism' : '1. 신화적 관점과 기운'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-good')}
                    className={`blog-toc-item ${activeSection === 'sec-good' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '2. Good Directions (Lucky)' : '2. 좋은 방향 (길몽)'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-bad')}
                    className={`blog-toc-item ${activeSection === 'sec-bad' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '3. Bad Directions (Cautionary)' : '3. 나쁜 방향 (흉몽)'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-psychology')}
                    className={`blog-toc-item ${activeSection === 'sec-psychology' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '4. Psychological Analysis' : '4. 현대 정신분석학'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-faq')}
                    className={`blog-toc-item ${activeSection === 'sec-faq' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '5. FAQ Section' : '5. 자주 묻는 질문 (FAQ)'}
                  </button>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      ) : (
        /* Blog Main Home: Grid List View */
        <div>
          <button onClick={onBackToMain} className="blog-back-btn" style={{ marginBottom: '16px' }}>
            <ArrowLeft size={16} />
            <span>{language === 'en' ? 'Back to Dream Interpretation' : '해몽 포털로 돌아가기'}</span>
          </button>
          <div className="blog-header">
            <h1 className="font-display text-gradient-cyan" style={{ fontSize: '2rem', marginBottom: '8px' }}>
              {language === 'en' ? 'The Archive of Wisdom' : '기억의 서고 (Dream Blog)'}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {language === 'en' 
                ? 'An educational repository for dream science, ancient myths, and depth psychology.' 
                : '신화적 고찰부터 무의식 심리학까지, 당신의 수면 아래 펼쳐지는 비전을 완벽히 해독하는 가이드북입니다.'}
            </p>
          </div>

          <div className="blog-grid">
            {posts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => setSelectedPostId(post.id)}
                className="blog-card"
              >
                <div className="blog-card-thumbnail">
                  <img src={post.coverImage} alt={post.title} />
                  <div className="blog-card-overlay" />
                  <span className="blog-badge">{post.category}</span>
                </div>
                
                <div className="blog-card-content">
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-desc">{post.excerpt}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-secondary)', marginTop: 'auto', fontWeight: '600' }}>
                    <span>{language === 'en' ? 'Read More' : '자세히 보기'}</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
