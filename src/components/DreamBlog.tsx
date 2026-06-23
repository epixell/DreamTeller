import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BookOpen, User, MessageSquare, HelpCircle, ChevronRight } from 'lucide-react';

interface BlogPostSummary {
  id: string;
  title: string;
  titleEn: string;
  titleJa?: string;
  titleZh?: string;
  excerpt: string;
  excerptEn: string;
  excerptJa?: string;
  excerptZh?: string;
  category: string;
  categoryEn: string;
  categoryJa?: string;
  categoryZh?: string;
  coverImage: string;
  author: string;
}

interface BlogSubSection {
  id: string;
  title: string;
  titleEn: string;
  titleJa?: string;
  titleZh?: string;
  content: string;
  contentEn: string;
  contentJa?: string;
  contentZh?: string;
  isAuspicious: boolean;
  keywords: string[];
}

interface BlogPostDetail {
  id: string;
  title: string;
  titleEn: string;
  titleJa?: string;
  titleZh?: string;
  introduction: string;
  introductionEn: string;
  introductionJa?: string;
  introductionZh?: string;
  mythology: string;
  mythologyEn: string;
  mythologyJa?: string;
  mythologyZh?: string;
  sections: BlogSubSection[];
  psychology: string;
  psychologyEn: string;
  psychologyJa?: string;
  psychologyZh?: string;
  faqs: {
    question: string;
    questionEn?: string;
    questionJa?: string;
    questionZh?: string;
    answer: string;
    answerEn?: string;
    answerJa?: string;
    answerZh?: string;
  }[];
  conclusion: string;
  conclusionEn: string;
  conclusionJa?: string;
  conclusionZh?: string;
}

const getBlogVal = (obj: any, baseField: string, lang: string): string => {
  if (!obj) return '';
  if (lang === 'en') return obj[baseField + 'En'] || obj[baseField];
  if (lang === 'ja') return obj[baseField + 'Ja'] || obj[baseField + 'En'] || obj[baseField];
  if (lang === 'zh-TW') return obj[baseField + 'Zh'] || obj[baseField + 'En'] || obj[baseField];
  return obj[baseField];
};

export const DreamBlog: React.FC<{
  language: 'ko' | 'en' | 'ja' | 'zh-TW';
  onBackToMain: () => void;
  initialPostId?: string | null;
}> = ({ language, onBackToMain, initialPostId = null }) => {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(initialPostId);
  const [currentPost, setCurrentPost] = useState<BlogPostDetail | null>(null);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('');
  
  const [postError, setPostError] = useState<boolean>(false);
  
  const getCatAllLabel = () => {
    if (language === 'en') return 'All';
    if (language === 'ja') return 'すべて';
    if (language === 'zh-TW') return '全部';
    return '전체';
  };
  
  const [selectedCategory, setSelectedCategory] = useState<string>(getCatAllLabel());
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const observer = useRef<IntersectionObserver | null>(null);

  // Sync selectedCategory label when language changes
  useEffect(() => {
    setSelectedCategory(getCatAllLabel());
  }, [language]);

  // 1. Fetch Blog List (Index)
  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoadingList(true);
        const res = await fetch('/data/blogIndex.json');
        if (!res.ok) throw new Error('Failed to load blog index');
        const data = await res.json();
        setPosts(data);
      } catch (e) {
        console.error('Error fetching blog index:', e);
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, []);

  // 2. Fetch Detailed Post
  useEffect(() => {
    if (!selectedPostId) {
      setCurrentPost(null);
      setPostError(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);
        setPostError(false);
        const res = await fetch(`/data/blog/${selectedPostId}.json`);
        if (!res.ok) throw new Error(`Failed to load blog post: ${selectedPostId}`);
        const data = await res.json();
        setCurrentPost(data);
      } catch (e) {
        console.error('Error fetching blog detail:', e);
        setPostError(true);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [selectedPostId]);

  // 3. Set up Intersection Observer to track active header section when detailed post is loaded
  useEffect(() => {
    if (!selectedPostId || !currentPost) return;

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
    }, 150);

    return () => {
      clearTimeout(timer);
      observer.current?.disconnect();
    };
  }, [selectedPostId, currentPost]);

  const handleTocClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const getCategoriesList = () => {
    const list = new Set<string>();
    posts.forEach(p => {
      const cat = getBlogVal(p, 'category', language);
      if (cat) list.add(cat);
    });
    return [getCatAllLabel(), ...Array.from(list)];
  };

  const filteredPosts = posts.filter(post => {
    const cat = getBlogVal(post, 'category', language);
    const matchesCategory = selectedCategory === getCatAllLabel() || cat === selectedCategory;
    
    const title = getBlogVal(post, 'title', language);
    const excerpt = getBlogVal(post, 'excerpt', language);
    const matchesSearch = searchQuery.trim() === '' || 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesCategory && matchesSearch;
  });

  const getPostSummary = (id: string) => posts.find(p => p.id === id);

  return (
    <div className="blog-container fade-in">
      {/* Blog Detail View */}
      {selectedPostId && (loadingDetail ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--color-secondary)' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 242, 254, 0.1)', borderTopColor: 'var(--color-secondary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <span>
            {language === 'en' ? 'Loading post...' : 
             language === 'ja' ? '記事を読み込み中...' : 
             language === 'zh-TW' ? '正在載入文章...' : '서고에서 글을 꺼내는 중...'}
          </span>
        </div>
      ) : postError ? (
        <div className="blog-error-container glass-panel fade-in">
          <h2 className="blog-error-title font-display text-gradient-purple">
            404 Not Found
          </h2>
          <p className="blog-error-text">
            {language === 'en' 
              ? 'The requested dream interpretation post could not be found in the archive.' 
              : language === 'ja'
              ? '要求された夢占い解釈の記事はアーカイブに見つかりませんでした。'
              : language === 'zh-TW'
              ? '在封存檔中找不到所請求的解夢文章。'
              : '요청하신 꿈해몽 분석글이 기억의 서고에 존재하지 않거나, 일시적인 로딩 실패가 발생했습니다.'}
          </p>
          <button onClick={() => { setSelectedPostId(null); setPostError(false); }} className="glow-btn blog-error-btn">
            {language === 'en' ? 'Return to List' : 
             language === 'ja' ? '記事一覧に戻る' : 
             language === 'zh-TW' ? '返回列表' : '서고 목록으로 돌아가기'}
          </button>
        </div>
      ) : currentPost ? (
        <div>
          <button onClick={() => setSelectedPostId(null)} className="blog-back-btn">
            <ArrowLeft size={16} />
            <span>
              {language === 'en' ? 'Back to Library' : 
               language === 'ja' ? '書庫一覧に戻る' : 
               language === 'zh-TW' ? '返回書庫列表' : '글 목록으로 돌아가기'}
            </span>
          </button>

          <div className="blog-detail-container">
            {/* Left Content Column */}
            <article className="blog-post-content glass-panel">
              <div className="blog-post-header">
                <span className="blog-post-meta-tag">
                  {getBlogVal(getPostSummary(currentPost.id), 'category', language)}
                </span>
                <h1 className="blog-post-title font-display">
                  {getBlogVal(currentPost, 'title', language)}
                </h1>
                
                <div className="blog-post-meta-line">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={14} />
                    <span>{getPostSummary(currentPost.id)?.author || 'DreamTeller Editor'}</span>
                  </div>
                </div>
              </div>

              {getPostSummary(currentPost.id)?.coverImage && (
                <img 
                  src={getPostSummary(currentPost.id)?.coverImage} 
                  alt={getBlogVal(currentPost, 'title', language)} 
                  className="blog-hero-image"
                />
              )}

              <div className="blog-body-text">
                {/* Introduction */}
                <p id="sec-intro" style={{ fontSize: '1.1rem', color: '#fff', fontWeight: '500', lineHeight: '1.9' }}>
                  {getBlogVal(currentPost, 'introduction', language)}
                </p>

                {/* Mythology Section */}
                <h2 id="sec-myth">
                  <BookOpen size={20} style={{ marginRight: '8px' }} />
                  {language === 'en' ? "1. Mythology & Cosmic Symbolism" : 
                   language === 'ja' ? "1. 古代神話の視点と象徴的気運" : 
                   language === 'zh-TW' ? "1. 古代神話視角與象徵氣場" : "1. 고대 신화적 관점과 상징적 기운"}
                </h2>
                <p>
                  {getBlogVal(currentPost, 'mythology', language)}
                </p>

                {/* Good Directions */}
                <h2 id="sec-good">
                  <MessageSquare size={20} style={{ marginRight: '8px' }} />
                  {language === 'en' ? "2. Good Directions: Auspicious Dream Scenarios" : 
                   language === 'ja' ? "2. 良い方向へと流れる状況 (吉夢)" : 
                   language === 'zh-TW' ? "2. 向好方向發展的境況 (吉夢)" : "2. 좋은 방향으로 흘러가는 상황 (길몽)"}
                </h2>
                <ul>
                  {currentPost.sections.filter(s => s.isAuspicious).map((sec, idx) => (
                    <li key={sec.id}>
                      <strong>{idx + 1}. {getBlogVal(sec, 'title', language)}</strong>:
                      <span> {getBlogVal(sec, 'content', language)}</span>
                    </li>
                  ))}
                </ul>

                {/* Bad Directions */}
                <h2 id="sec-bad">
                  <MessageSquare size={20} style={{ marginRight: '8px' }} />
                  {language === 'en' ? "3. Bad Directions: Cautionary Dream Scenarios" : 
                   language === 'ja' ? "3. 悪い方向へと流れる状況 (凶夢/警告)" : 
                   language === 'zh-TW' ? "3. 向壞方向發展的境況 (凶夢/警告)" : "3. 나쁜 방향으로 흘러가는 상황 (흉몽/경고)"}
                </h2>
                <ul>
                  {currentPost.sections.filter(s => !s.isAuspicious).map((sec, idx) => (
                    <li key={sec.id}>
                      <strong>{idx + 1}. {getBlogVal(sec, 'title', language)}</strong>:
                      <span> {getBlogVal(sec, 'content', language)}</span>
                    </li>
                  ))}
                </ul>

                {/* Psychology Section */}
                <h2 id="sec-psychology">
                  <HelpCircle size={20} style={{ marginRight: '8px' }} />
                  {language === 'en' ? "4. Psychoanalysis: Subconscious & Archetypes" : 
                   language === 'ja' ? "4. 現代精神分析学の視点: 自己と無意識" : 
                   language === 'zh-TW' ? "4. 現代精神分析視角：自我與潛意識" : "4. 현대 정신분석학적 관점: 자아와 무의식"}
                </h2>
                <p>
                  {getBlogVal(currentPost, 'psychology', language)}
                </p>

                {/* FAQ Section */}
                <h2 id="sec-faq">
                  <HelpCircle size={20} style={{ marginRight: '8px' }} />
                  {language === 'en' ? "5. FAQ: Frequently Asked Questions" : 
                   language === 'ja' ? "5. よくある質問 (FAQ)" : 
                   language === 'zh-TW' ? "5. 常見問題 (FAQ)" : "5. 자주 묻는 질문 (FAQ)"}
                </h2>
                <div className="blog-faq-grid">
                  {currentPost.faqs.map((faq, idx) => (
                    <div key={idx} className="blog-faq-card">
                      <div className="blog-faq-q">
                        <span>Q{idx + 1}.</span>
                        <strong>{getBlogVal(faq, 'question', language)}</strong>
                      </div>
                      <p className="blog-faq-a">{getBlogVal(faq, 'answer', language)}</p>
                    </div>
                  ))}
                </div>

                {/* Conclusion */}
                <h2 id="sec-conclusion" style={{ display: 'none' }}>Conclusion</h2>
                <p style={{ marginTop: '32px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--color-secondary)', fontStyle: 'italic', lineHeight: '1.8' }}>
                  {getBlogVal(currentPost, 'conclusion', language)}
                </p>
              </div>
            </article>

            {/* Right Sticky TOC Sidebar */}
            <aside className="blog-toc-sidebar glass-panel">
              <h3 className="blog-toc-title font-display">
                {language === 'en' ? 'Table of Contents' : 
                 language === 'ja' ? '目次' : 
                 language === 'zh-TW' ? '目錄' : '이 글의 목차'}
              </h3>
              <ul className="blog-toc-list">
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-intro')}
                    className={`blog-toc-item ${activeSection === 'sec-intro' ? 'active' : ''}`}
                  >
                    {language === 'en' ? 'Introduction' : 
                     language === 'ja' ? 'はじめにと要約' : 
                     language === 'zh-TW' ? '前言與摘要' : '서론 및 요약'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-myth')}
                    className={`blog-toc-item ${activeSection === 'sec-myth' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '1. Myth & Symbolism' : 
                     language === 'ja' ? '1. 神話的視点と気運' : 
                     language === 'zh-TW' ? '1. 神話視角與氣場' : '1. 신화적 관점과 기운'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-good')}
                    className={`blog-toc-item ${activeSection === 'sec-good' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '2. Good Scenarios' : 
                     language === 'ja' ? '2. 良い方向 (吉夢)' : 
                     language === 'zh-TW' ? '2. 好方向 (吉夢)' : '2. 좋은 방향 (길몽)'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-bad')}
                    className={`blog-toc-item ${activeSection === 'sec-bad' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '3. Cautionary Scenarios' : 
                     language === 'ja' ? '3. 悪い方向 (凶夢)' : 
                     language === 'zh-TW' ? '3. 壞方向 (凶夢)' : '3. 나쁜 방향 (흉몽)'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-psychology')}
                    className={`blog-toc-item ${activeSection === 'sec-psychology' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '4. Psychoanalysis' : 
                     language === 'ja' ? '4. 現代精神分析' : 
                     language === 'zh-TW' ? '4. 現代精神分析' : '4. 현대 정신분석학'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-faq')}
                    className={`blog-toc-item ${activeSection === 'sec-faq' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '5. FAQ Section' : 
                     language === 'ja' ? '5. よくある質問 (FAQ)' : 
                     language === 'zh-TW' ? '5. 常見問題 (FAQ)' : '5. 자주 묻는 질문 (FAQ)'}
                  </button>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      ) : null)}

      {/* Blog Main Home: Grid List View */}
      {!selectedPostId && (
        <div>
          <button onClick={onBackToMain} className="blog-back-btn" style={{ marginBottom: '16px' }}>
            <ArrowLeft size={16} />
            <span>
              {language === 'en' ? 'Back to Dream Interpretation' : 
               language === 'ja' ? '夢占いポータルに戻る' : 
               language === 'zh-TW' ? '返回解夢首頁' : '해몽 포털로 돌아가기'}
            </span>
          </button>
          <div className="blog-header">
            <h1 className="font-display text-gradient-cyan" style={{ fontSize: '2rem', marginBottom: '8px' }}>
              {language === 'en' ? 'The Archive of Wisdom' : 
               language === 'ja' ? '記憶の書庫 (Dream Blog)' : 
               language === 'zh-TW' ? '記憶書庫 (Dream Blog)' : '기억의 서고 (Dream Blog)'}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {language === 'en' 
                ? 'An educational repository for dream science, ancient myths, and depth psychology.' 
                : language === 'ja'
                ? '夢の科学、古代神話、深層心理学のための教育的書庫です。'
                : language === 'zh-TW'
                ? '解夢科學、古代神話與深層心理學的知識庫。'
                : '신화적 고찰부터 무의식 심리학까지, 당신의 수면 아래 펼쳐지는 비전을 완벽히 해독하는 가이드북입니다.'}
            </p>
          </div>

          {/* Search Bar & Category tabs */}
          <div className="blog-controls-container glass-panel">
            <div className="blog-search-wrapper">
              <input 
                type="text"
                placeholder={
                  language === 'en' ? "Search dream records by title or description..." : 
                  language === 'ja' ? "書庫の記録を検索 (例: 蛇、金、死...)" : 
                  language === 'zh-TW' ? "搜尋書庫紀錄 (例如：蛇、錢、死亡...)" : "서고의 기록 검색 (예: 뱀, 돈, 죽음...)"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="blog-search-input"
              />
            </div>
            <div className="blog-category-tabs">
              {getCategoriesList().map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`blog-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loadingList ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--color-secondary)' }}>
              <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(0, 242, 254, 0.1)', borderTopColor: 'var(--color-secondary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
              <span>
                {language === 'en' ? 'Loading library index...' : 
                 language === 'ja' ? '書庫一覧を読み込み중...' : 
                 language === 'zh-TW' ? '正在載入書庫列表...' : '서고 목록을 불러오는 중...'}
              </span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '0.95rem' }} className="glass-panel">
              {language === 'en' 
                ? 'No matching dream records found in the archive.' 
                : language === 'ja'
                ? '検索条件に一致する夢占い記録が書庫に存在しません。'
                : language === 'zh-TW'
                ? '書庫中未找到符合的解夢紀錄。'
                : '검색어나 카테고리에 일치하는 해몽 기록이 서고에 존재하지 않습니다.'}
            </div>
          ) : (
            <div className="blog-grid">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id} 
                  onClick={() => setSelectedPostId(post.id)}
                  className="blog-card"
                >
                  <div className="blog-card-thumbnail">
                    <img src={post.coverImage} alt={getBlogVal(post, 'title', language)} />
                    <div className="blog-card-overlay" />
                    <span className="blog-badge">
                      {getBlogVal(post, 'category', language)}
                    </span>
                  </div>
                  
                  <div className="blog-card-content">
                    <h3 className="blog-card-title">
                      {getBlogVal(post, 'title', language)}
                    </h3>
                    <p className="blog-card-desc">
                      {getBlogVal(post, 'excerpt', language)}
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-secondary)', marginTop: 'auto', fontWeight: '600' }}>
                      <span>
                        {language === 'en' ? 'Read More' : 
                         language === 'ja' ? '詳細を読む' : 
                         language === 'zh-TW' ? '閱讀更多' : '자세히 보기'}
                      </span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
