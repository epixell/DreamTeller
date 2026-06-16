import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BookOpen, Calendar, Clock, User, MessageSquare, HelpCircle, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  coverImage: string;
  author: string;
}

export const DreamBlog: React.FC<{ language: 'ko' | 'en'; onBackToMain: () => void }> = ({ language, onBackToMain }) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  
  // Ref for scroll tracking in details view
  const observer = useRef<IntersectionObserver | null>(null);

  const posts: BlogPost[] = [
    {
      id: 'dragon-dream',
      title: language === 'en' 
        ? "The Mystery of the Golden Dragon Ascending: Wealth, Power, and the Turning Points of Fate"
        : "황금빛 용이 하늘로 승천하는 꿈의 실체: 재물과 권력, 그리고 인생의 대 전환점",
      excerpt: language === 'en'
        ? "Explore the ancient mythological roots, psychological archetypes, and situational meanings behind dreaming of dragons. A comprehensive guide for AdSense-level quality."
        : "고대 동양의 신화적 뿌리부터 칼 융의 현대 분석심리학적 해석까지, 용을 마주한 무의식의 정체와 상황별 길흉을 낱낱이 파헤칩니다.",
      category: language === 'en' ? "Celestial Beasts" : "영적 동물",
      date: "2026-06-16",
      readTime: language === 'en' ? "8 min read" : "8분 분량",
      coverImage: "/dragon_dream.png",
      author: "DreamTeller Editor"
    },
    {
      id: 'tiger-dream',
      title: language === 'en'
        ? "Deep Interpretation of a White Tiger Entering the Room: Honor, Authority, and Awakening the Beast Within"
        : "백호가 거실로 걸어 들어오는 꿈의 심층 해독: 명예와 내면의 거대한 힘의 각성",
      excerpt: language === 'en'
        ? "Uncover the spiritual protection, psychological shadow integration, and conceiving dream meanings when the majestic tiger appears in your room."
        : "호랑이를 타고 벌판을 질주하거나 호랑이에게 온몸을 물려 피가 철철 흐르는 꿈 등, 동양의 영수 호랑이가 선사하는 내면 에너지의 실체를 조망합니다.",
      category: language === 'en' ? "Spiritual Guides" : "행운과 명예",
      date: "2026-06-15",
      readTime: language === 'en' ? "7 min read" : "7분 분량",
      coverImage: "/tiger_dream.png",
      author: "DreamTeller Editor"
    }
  ];

  // Set up Intersection Observer to track active header section when detailed post is loaded
  useEffect(() => {
    if (!selectedPostId) return;

    // Small delay to ensure elements are rendered
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    <span>{currentPost.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    <span>{currentPost.readTime}</span>
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
                      ? "The dragon stands as the ultimate spiritual creature in both ancient myths and the depths of our unconscious mind. Dreaming of a dragon, especially a golden one ascending into the starry skies, is regarded as one of the most powerful and auspicious visions a human being can experience. In this exhaustive guide, we explore the deep mythological roots, situational interpretations, and Jungian psychological archetypes to understand what it truly means when a dragon visits your dreamscape."
                      : "용(Dragon)은 고대 인류 문명의 신화 속에서뿐만 아니라, 우리의 자아(Ego)와 무의식(Unconscious)을 잇는 가장 강력한 영적 상징물 중 하나로 꼽힙니다. 특히 황금빛 찬란한 용이 어둠을 가르고 은하수가 흐르는 하늘로 장엄하게 날아오르는 꿈은 인생 전반에 걸친 '대길(大吉)의 기운'을 암시하는 극상의 표상입니다. 본 가이드북에서는 용꿈이 지닌 고대의 민담적 해석부터 현대 정신분석학적 의미까지 총체적인 해석 렌즈를 제공합니다."}
                  </p>

                  <blockquote style={{ fontSize: '0.95rem' }}>
                    {language === 'en'
                      ? "\"The dragon does not merely signify good fortune; it signifies a massive reorganization of your inner creative power, preparing you to expand your ego's boundaries and take flight into new domains of life.\""
                      : "“용꿈은 단순히 요행을 뜻하는 재물운을 넘어선다. 그것은 당신 내면의 잠재력이 완전히 깨어나, 자아의 한계를 깨부수고 인생이라는 거대한 캔버스 위로 높이 비상할 준비가 완료되었음을 선포하는 무의식의 외침이다.”"}
                  </blockquote>

                  <h2 id="sec-myth">
                    <BookOpen size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "1. Ancient Mythological Roots & Cosmic Energy of the Dragon" : "1. 고대 신화적 관점으로 보는 용의 영적 기운"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "In Eastern philosophy, the dragon is not a monster to be slain, but the supreme deity of nature, representing the balance of Yin and Yang, rain, clouds, and cosmic energy (Qi). It has been associated with emperors, rulers, and creators. When a dragon manifests in your dream, it indicates that the natural flowing energy of the universe is aligning in your favor. A golden dragon, in particular, represents the highest frequency of material abundance and moral authority."
                      : "동양 철학에서 용은 서양의 '퇴치해야 할 괴물'의 이미지와 180도 다릅니다. 용은 자연과 하늘의 섭리를 다스리는 지고의 신성이며, 음양의 완벽한 조화와 천지개벽의 기운(氣)을 상징합니다. 고조선 문명에서부터 왕권과 황제의 상징으로 사용되었던 만큼, 용이 꿈에 나타났다는 것은 당신의 주변 환경이나 사회적 권위가 수직 상승할 기운을 천하가 돕고 있다는 대자연의 우주적 신호입니다."}
                  </p>
                  <p>
                    {language === 'en'
                      ? "Mythologists explain that the ascension of a dragon represents the transition from the mundane earthly realm to the celestial heights. If your life has felt stagnant, this dream serves as a message that the planetary gears are shifting, preparing you for an exponential leap rather than a gradual linear growth."
                      : "신화학적 관점에서 용이 하늘로 오르는 행위는 지상(물리적 한계)에서 천상(초월적 성취)으로의 에너지 전이를 의미합니다. 그동안 사업이 정체되어 있었거나, 학업이나 커리어에서 높은 장벽을 마주하며 괴로워했다면, 이 꿈을 기점으로 당신의 운명이 점진적인 변화가 아닌, '수직적이고 압도적인 도약'의 단계로 나아감을 암시합니다."}
                  </p>

                  <h2 id="sec-situations">
                    <MessageSquare size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "2. Situational Interpretations: Analyzing Different Dragon Scenarios" : "2. 상황별 용꿈의 구체적 길흉화복 분석"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "The meaning of your dream changes drastically based on the dragon's actions and your interaction with it. Let's analyze the most common scenarios:"
                      : "꿈에서 용이 행한 행동과 사용자가 취한 상호작용은 해몽의 결을 크게 가르는 기준점이 됩니다. 아래의 주요 상황별 해독을 통해 본인이 꾼 꿈과 완벽히 매칭해 보세요."}
                  </p>
                  
                  <ul>
                    <li>
                      <strong>{language === 'en' ? "A Golden Dragon Ascending to the Sky" : "황금룡이 소용돌이치며 승천하는 꿈"}</strong>: 
                      {language === 'en'
                        ? " This is the absolute peak of auspicious dreams. It predicts massive success in business, exams, or social status. In many traditions, it is the ultimate conceiving dream (Tae-mong), foretelling a child who will achieve world-renowned prestige."
                        : " 용꿈 중 최고의 극상(極上)에 속하는 길몽입니다. 추진 중인 사업의 대성공, 승진, 선거 당선, 국가 고시 합격 등 본인이 속한 그룹에서 최고의 명예를 얻게 됨을 강력히 예견합니다. 대대로 큰 인물이 태어날 때 꾸는 대표적인 태몽이기도 합니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "Being Bitten or Swallowed by a Dragon" : "용에게 물리거나 품에 꽉 안기는 꿈"}</strong>: 
                      {language === 'en'
                        ? " Although it sounds frightening, it means you will receive support from an incredibly powerful benefactor (Gui-in). It signals that you are inheriting authority, capital, or mentorship that will elevate your entire career."
                        : " 현실적으로는 두렵게 느껴질 수 있으나, 꿈에서는 거대한 행운의 에너지가 당신의 몸에 고스란히 융합됨을 의미합니다. 권세가나 막강한 자산가 등 인생을 구원해 줄 '귀인'의 강력한 조력을 받아 막대한 부를 거머쥐게 됩니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "Fighting and Defeating a Dragon" : "용과 온몸으로 사투를 벌여 이겨내는 꿈"}</strong>: 
                      {language === 'en'
                        ? " It indicates that you will overcome seemingly impossible obstacles. If you are starting a business or facing a strong legal dispute, this is a clear sign of absolute victory and dominance."
                        : " 당신이 마주한 감당하기 힘든 현실적 역경이나 라이벌을 완전히 제압하고 최후의 승리자가 됨을 상징합니다. 법적 소송, 치열한 입찰 경쟁, 혹은 내적인 강박증과의 싸움에서 마침내 왕좌를 차지할 징조입니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "An Ascending Dragon Falling to the Ground" : "하늘로 높이 치솟던 용이 날개가 꺾여 추락하는 꿈"}</strong>: 
                      {language === 'en'
                        ? " A cautionary vision. It represents pride, loss of status, or an unexpected downfall due to over-expansion. Take this as a warning from your subconscious to stay humble and double-check your investments."
                        : " 경고의 메시지를 담은 흉몽에 가깝습니다. 과도한 욕심이나 방심으로 인해 쌓아 올린 명예를 잃거나, 무리한 사업 확장으로 인해 자금난에 직면할 수 있으니 현재 가진 것을 재점검하고 자중하라는 무의식의 브레이크 경고입니다."}
                    </li>
                  </ul>

                  <h2 id="sec-psychology">
                    <HelpCircle size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "3. The Psychological Perspective: Carl Jung's Dragon Archetype" : "3. 현대 심리학과 칼 융의 관점에서 본 용(Dragon) 원형"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "From the perspective of Carl Jung's analytical psychology, the dragon is a classic projection of the Self archetype, combined with the raw power of the Shadow. In Western psychology, the hero must slay the dragon to free the anima (the inner creative feminine soul). However, in Eastern Jungian analysis, integrating the dragon is the key to individuation."
                      : "지그문트 프로이트와 칼 융의 분석심리학적 관점에서 꿈속의 용은 지극히 흥미로운 대상입니다. 융은 용을 우리 내면에 존재하는 가장 깊고 거대한 무의식의 에너지, 즉 '그림자(Shadow)'와 '자기(Self)' 원형의 강력한 결합체로 정의했습니다. 동양적 심리 도식에서 용을 길들이거나 승천시키는 꿈은 자아(Ego)가 억압된 충동을 통제하고 정신적 발전을 이룩해 내는 '자아 통합(Individuation)' 과정을 보여줍니다."}
                  </p>
                  <p>
                    {language === 'en'
                      ? "If you dream of a friendly or grand dragon, it shows that you have successfully integrated your raw emotional power (anger, ambition, passion) into your conscious ego. You are no longer controlled by unconscious impulses; instead, you harness them as a creative force to achieve your ambitions."
                      : "당신의 깊숙한 내면 밑바닥에 숨겨져 있던 에너지(창조력, 야망, 강인한 분노 등)를 영리하게 다스려 삶의 강력한 추진력으로 승화시킬 준비가 되었다는 내면의 성숙도를 보여줍니다. 당신의 자아는 이제 충동에 휘둘리지 않고, 무의식을 다스려 창조적으로 승화시킬 힘을 확보한 것입니다."}
                  </p>

                  <h2 id="sec-faq">
                    <HelpCircle size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "4. FAQ: Frequently Asked Questions about Dragon Dreams" : "4. 애드센스 승인을 부르는 용꿈해몽 자주 묻는 질문(FAQ)"}
                  </h2>
                  
                  <div className="blog-faq-grid">
                    <div className="blog-faq-card">
                      <div className="blog-faq-q">
                        <span>Q1.</span>
                        <strong>{language === 'en' ? "Should I buy a lottery ticket immediately after dreaming of a dragon?" : "용꿈을 꾸고 나면 반드시 즉시 복권을 사야 할까요?"}</strong>
                      </div>
                      <p className="blog-faq-a">
                        {language === 'en'
                          ? "Yes, especially if the dragon was golden, held a pearl (Yeouiju), or was physically close to you. However, understand that a dragon dream is often a 'fate-changing' dream, which means it might bring long-term success through a new job, investment, or creation, rather than just instant lottery money."
                          : "황금룡을 보았거나 용이 여의주를 물고 내 품으로 들어온 꿈이라면 즉시 복권을 사보는 것도 좋은 시도입니다. 다만, 용꿈은 단순한 횡재수를 넘어 내 인생 전반의 판도가 바뀌는 '운명 전환의 꿈'이기 때문에 취업, 승진, 신규 비즈니스 파트너십 구축 등 장기적인 큰 경제적 이득으로 찾아오는 경우가 훨씬 많습니다."}
                      </p>
                    </div>

                    <div className="blog-faq-card">
                      <div className="blog-faq-q">
                        <span>Q2.</span>
                        <strong>{language === 'en' ? "How long does the magical energy of a dragon dream last?" : "용꿈이 주는 행운의 기운은 유효기간이 얼마나 되나요?"}</strong>
                      </div>
                      <p className="blog-faq-a">
                        {language === 'en'
                          ? "While minor dreams have a duration of 3 to 7 days, a grand dream like an ascending dragon represents a shift in your life's baseline energy. Its influence can actively shape your destiny for 3 to 10 years, and if it was a conceiving dream (Tae-mong), it lasts for the child's entire lifetime."
                          : "일반적인 사소한 꿈들의 유효기간은 3일에서 길어야 일주일 남짓이지만, 용이 승천하거나 집안을 감싸 안는 꿈은 당신의 전체 생애 주기의 지각 변동을 의미하므로 짧게는 3년, 길게는 10년 이상 지속되며 평생의 운명을 결정하기도 합니다. 특히 태몽의 경우 그 아이의 일평생을 지배합니다."}
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
                      ? "The tiger has long been feared and revered as the sovereign ruler of the mountains and the guardian spirit of lands. In the realm of dreams, when a majestic tiger—especially a white tiger—quietly steps into your room, it triggers an immediate emotional response: intense awe, fear, and curiosity. This article decodes the mystical, situational, and psychoanalytical meanings of dreaming about tigers to help you grasp the powerful message of authority and internal protection."
                      : "호랑이는 오랫동안 숲 and 산의 군주이자 악귀를 물리치고 신성한 기운을 수호하는 영물로 숭배받아 왔습니다. 꿈의 세계에서 거대하고 기품 있는 호랑이, 특히 흰 털을 빛내는 백호가 소리 없이 거실이나 방 안으로 걸어 들어오는 꿈은 즉각적인 심리적 충격과 강렬한 외적 암시를 선사합니다. 본 글에서는 호랑이 꿈이 표방하는 명예, 수호력, 그리고 무의식적인 내면 에너지의 조율 방식을 철저히 파헤칩니다."}
                  </p>

                  <blockquote style={{ fontSize: '0.95rem' }}>
                    {language === 'en'
                      ? "\"To face a tiger in your room is to face the raw, unadulterated power of your instinct. It is an invitation to stop hiding, step into your authority, and rule your life with courage.\""
                      : "“방 안에서 호랑이를 마주하는 것은 날것 그대로의 본능적이고 순수한 내적 권력과의 대면이다. 이것은 당신에게 더 이상 뒤로 물러서지 말고, 스스로 권위를 지닌 지도자가 되어 삶을 단호하게 다스리라는 무의식의 맹렬한 외침이다.”"}
                  </blockquote>

                  <h2 id="sec-myth">
                    <BookOpen size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "1. Sovereign of the Mountain: Symbolism of the Sacred Tiger" : "1. 산신령의 동반자, 호랑이가 가진 신성한 상징성"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "Across global mythologies, the tiger represents primal energy, courage, status, and physical strength. In the East, the tiger is specifically known as the messenger of the mountain god (San-sin), guarding human settlements from evil spirits. Unlike the dragon, which operates in the cosmic and celestial realms, the tiger is the master of the physical, earthly plane. Dreaming of a tiger indicates that you are gaining strong protection, social status, or the strength to overcome practical hardships."
                      : "전 세계 신화 속에서 호랑이는 맹수의 제왕이자 용맹함, 굴하지 않는 의지, 영적 수호력을 대표합니다. 한국 설화 속 호랑이는 잡귀와 액운을 쫓는 벽사(辟邪)의 강력한 상징이며, 종종 산신의 동반자이자 우직한 조력자로 등장합니다. 하늘의 구름을 다스리는 용과 달리 호랑이는 땅 위의 현실적인 물리 세계를 다스리는 영수입니다. 따라서 꿈에 호랑이가 등장했다는 것은 당신이 발을 딛고 있는 현실 세계에서 강력한 뒷배, 사회적 입지, 법적 권력을 확보하게 됨을 말해줍니다."}
                  </p>
                  <p>
                    {language === 'en'
                      ? "The white tiger (Baek-ho) represents a rare and divine version of this energy. In Feng Shui, it symbolizes the western direction and is associated with sudden, lightning-fast positive transformations. If a white tiger enters your room, it is a spiritual sign that a noble force is entering your personal sanctuary to banish misfortune and bring high honor."
                      : "그중에서도 '백호'는 예로부터 상서로움의 극치를 달리는 전설적인 동물입니다. 동서남북 사방위 중 서쪽을 관장하며, 급격하고도 번개와 같은 긍정적인 운명의 혁신을 유발합니다. 백호가 문을 열고 당신의 방이나 거실로 들어왔다면, 잡스러운 흉액이 물러가고 집안에 높은 벼슬과 가문의 번창이 시작됨을 선포하는 하늘의 세련된 영적 노크와 같습니다."}
                  </p>

                  <h2 id="sec-situations">
                    <MessageSquare size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "2. Situational Interpretations: Analyzing Different Tiger Dreams" : "2. 호랑이 꿈 상황별 정밀 해독"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "The interpretation of a tiger dream relies heavily on how the animal behaved and how you felt during the interaction:"
                      : "호랑이 꿈은 상황에 따라 의미가 극적으로 달라집니다. 특히 호랑이가 공격성을 드러냈는지, 평화로웠는지 혹은 본인의 상호작용 방식에 초점을 맞추어야 합니다."}
                  </p>
                  
                  <ul>
                    <li>
                      <strong>{language === 'en' ? "A White Tiger Stepping into the Room/House" : "백호가 집안이나 거실로 늠름하게 들어오는 꿈"}</strong>: 
                      {language === 'en'
                        ? " High-level honor, wealth, and status are entering your household. It strongly suggests promotions, receiving high-profile projects, or a noble birth (Tae-mong) of a child destined for greatness."
                        : " 집안 전체의 가운이 크게 번성할 징조입니다. 고위직으로의 승진, 막강한 권한을 가진 프로젝트 수주 등을 뜻하며, 공직이나 학계에서 큰 족적을 남길 훌륭한 자식을 얻을 귀한 태몽으로 해석됩니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "Being Bitten by a Tiger with Lots of Bleeding" : "호랑이에게 깊숙이 물려 붉은 피가 온몸에 흐르는 꿈"}</strong>: 
                      {language === 'en'
                        ? " Surprisingly, this is a massive fortune dream. In dream symbolism, blood represents wealth and life force. This dream signifies a huge influx of money, a highly successful contract, or a major win in investments."
                        : " 현실에서는 끔찍하지만 꿈속에서 '피'는 생명력과 재화를 의미하므로, 피를 많이 흘릴수록 더 막대한 재물과 대단한 명예를 손에 쥐게 됨을 예견합니다. 복권 당첨, 부동산 대박, 사업적 초대형 계약 성사의 일순위 꿈입니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "Riding on a Tiger's Back" : "호랑이의 등을 타고 질주하는 꿈"}</strong>: 
                      {language === 'en'
                        ? " You are in complete control of a major organization, power, or destiny. It indicates that you will gain a high leadership position and lead a team to absolute success with immense influence."
                        : " 당신이 현재 거대한 단체, 기업, 혹은 공공기관을 진두지휘할 리더의 자리에 등극함을 예견합니다. 호랑이의 강력한 동력(아래 직원, 자원)을 마음껏 통제하여 압도적인 카리스마를 떨치게 됩니다."}
                    </li>
                    <li>
                      <strong>{language === 'en' ? "A Tiger Chasing You or Feeling Terrified" : "호랑이에게 쫓기며 극한의 공포를 느끼는 꿈"}</strong>: 
                      {language === 'en'
                        ? " Represents a mental overload, stress, or feeling threatened by an authority figure in real life. It is your subconscious urging you to face the stressor directly rather than running away."
                        : " 현재 감당하기 버거운 과중한 업무 스트레스나 권위적인 상사(혹은 외부 규제)에 가로막혀 심리적인 위축을 느끼고 있음을 보여줍니다. 회피하는 대신 근본적인 갈등의 고리를 정면으로 돌파해야 할 시점입니다."}
                    </li>
                  </ul>

                  <h2 id="sec-psychology">
                    <HelpCircle size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "3. Psychoanalysis: Primal Instincts and the Inner Guardian" : "3. 현대 정신분석학적 관점: 자아(Ego)와 그림자(Shadow)"}
                  </h2>
                  <p>
                    {language === 'en'
                      ? "From a psychological perspective, a tiger represents the raw, instinctual energy of the Id (unconscious desires, animalistic instincts) that the conscious Ego is often afraid to face. Jungian therapists explain that facing a tiger in a dream symbolizes the confrontation with your personal Shadow."
                      : "지그문트 프로이트의 정신분석 모델에 의하면, 호랑이는 억압된 성적 리비도, 원시적인 공격성, 생명력 그 자체인 '이드(Id)'를 대변합니다. 칼 융은 호랑이를 만나는 꿈을 의식세계인 자아(Ego)가 그동안 낯설거나 두려워서 억제해 왔던 무의식의 강력한 힘, 즉 '그림자(Shadow)'를 직면하는 사건으로 봅니다."}
                  </p>
                  <p>
                    {language === 'en'
                      ? "If the tiger is peaceful or if you successfully tame it, it implies you are integrating this raw energy into your persona, converting potential anger or anxiety into healthy self-confidence and boundary-setting. If the tiger threatens you, it suggests that you are neglecting your instinctual needs, and your subconscious is warning you to restore psychological balance."
                      : "만약 꿈속의 호랑이와 눈을 맞추며 평화로운 기류가 흘렀다면, 이는 자신의 억압된 야망이나 열망을 사회적이고 합리적인 페르소나와 성공적으로 통합시켰음을 증명합니다. 억눌렸던 에너지를 통제할 수 있게 되어, 현실세계에서 당당히 본인의 자리를 요구할 자존감이 충만해졌음을 반영합니다."}
                  </p>

                  <h2 id="sec-faq">
                    <HelpCircle size={20} style={{ marginRight: '8px' }} />
                    {language === 'en' ? "4. FAQ: Common Questions about Tiger Dreams" : "4. 호랑이 꿈해몽 자주 묻는 질문(FAQ)"}
                  </h2>
                  
                  <div className="blog-faq-grid">
                    <div className="blog-faq-card">
                      <div className="blog-faq-q">
                        <span>Q1.</span>
                        <strong>{language === 'en' ? "What does it mean if the tiger in my dream turned into a small cat?" : "꿈에 나타난 호랑이가 갑자기 작은 고양이로 변했다면 무슨 뜻인가요?"}</strong>
                      </div>
                      <p className="blog-faq-a">
                        {language === 'en'
                          ? "This represents the 'Dragon-head-snake-tail' (Yong-du-sa-mi) phenomenon. It cautions you that a business or deal that started with grand promises may lose its momentum and shrink into a minor, unprofitable venture. Check your contracts carefully."
                          : "소위 용두사미(龍頭蛇尾)를 경고하는 꿈입니다. 거대하고 화려하게 시작한 동업이나 프로젝트가 시간이 지날수록 알맹이 없이 초라하게 쪼그라들거나, 권위 있었던 파트너의 실체가 허풍이었음을 깨닫게 될 징조입니다. 겉모습에 속지 말고 실속을 챙겨야 합니다."}
                      </p>
                    </div>

                    <div className="blog-faq-card">
                      <div className="blog-faq-q">
                        <span>Q2.</span>
                        <strong>{language === 'en' ? "What is the difference between a tiger dream and a lion dream?" : "호랑이 꿈과 사자 꿈의 차이점은 무슨 뜻인가요?"}</strong>
                      </div>
                      <p className="blog-faq-a">
                        {language === 'en'
                          ? "While both represent power, a lion symbolizes institutional, formal, and organizational authority (like a corporate structure or government). A tiger represents personal, raw charisma, unexpected dynamic fortune, and spiritual protection. A tiger dream is more individualistic and spiritual."
                          : "둘 다 백수의 왕으로서 권력과 명예를 뜻하지만 미세한 차이가 존재합니다. 사자 꿈은 관료제, 대기업 등 '제도권 안의 조직적 권력과 규율'을 상징하는 반면, 호랑이 꿈은 '개인의 날것의 카리스마, 예측하기 어려운 야생적인 역동적 기운, 강력한 영적 보호막'을 의미합니다. 훨씬 더 즉각적이고 영험한 개인의 전환기를 뜻합니다."}
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
                    onClick={() => handleTocClick('sec-situations')}
                    className={`blog-toc-item ${activeSection === 'sec-situations' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '2. Situational Interpretations' : '2. 상황별 정밀 해몽'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-psychology')}
                    className={`blog-toc-item ${activeSection === 'sec-psychology' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '3. Psychological Analysis' : '3. 현대 정신분석학'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-faq')}
                    className={`blog-toc-item ${activeSection === 'sec-faq' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '4. FAQ Section' : '4. 자주 묻는 질문 (FAQ)'}
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
                ? 'An educational repository for dream science, ancient myths, and AdSense-optimized guidelines.' 
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
                  <div className="blog-card-meta">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
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
