import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BookOpen, User, MessageSquare, HelpCircle, ChevronRight } from 'lucide-react';

interface BlogPostSummary {
  id: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  category: string;
  categoryEn: string;
  coverImage: string;
  author: string;
}

interface BlogSubSection {
  id: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  isAuspicious: boolean;
  keywords: string[];
}

interface BlogPostDetail {
  id: string;
  title: string;
  titleEn: string;
  introduction: string;
  introductionEn: string;
  mythology: string;
  mythologyEn: string;
  sections: BlogSubSection[];
  psychology: string;
  psychologyEn: string;
  faqs: { question: string; answer: string }[];
  conclusion: string;
  conclusionEn: string;
}

export const DreamBlog: React.FC<{
  language: 'ko' | 'en';
  onBackToMain: () => void;
  initialPostId?: string | null;
}> = ({ language, onBackToMain, initialPostId = null }) => {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(initialPostId);
  const [currentPost, setCurrentPost] = useState<BlogPostDetail | null>(null);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('');
  
  const observer = useRef<IntersectionObserver | null>(null);

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
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);
        const res = await fetch(`/data/blog/${selectedPostId}.json`);
        if (!res.ok) throw new Error(`Failed to load blog post: ${selectedPostId}`);
        const data = await res.json();
        setCurrentPost(data);
      } catch (e) {
        console.error('Error fetching blog detail:', e);
        setSelectedPostId(null);
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

  const getPostSummary = (id: string) => posts.find(p => p.id === id);

  return (
    <div className="blog-container fade-in">
      {/* Blog Detail View */}
      {selectedPostId && (loadingDetail ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--color-secondary)' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 242, 254, 0.1)', borderTopColor: 'var(--color-secondary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <span>{language === 'en' ? 'Loading post...' : '서고에서 글을 꺼내는 중...'}</span>
        </div>
      ) : currentPost ? (
        <div>
          <button onClick={() => setSelectedPostId(null)} className="blog-back-btn">
            <ArrowLeft size={16} />
            <span>{language === 'en' ? 'Back to Library' : '글 목록으로 돌아가기'}</span>
          </button>

          <div className="blog-detail-container">
            {/* Left Content Column */}
            <article className="blog-post-content glass-panel">
              <div className="blog-post-header">
                <span className="blog-post-meta-tag">
                  {language === 'en' 
                    ? (getPostSummary(currentPost.id)?.categoryEn || getPostSummary(currentPost.id)?.category) 
                    : getPostSummary(currentPost.id)?.category}
                </span>
                <h1 className="blog-post-title font-display">
                  {language === 'en' ? currentPost.titleEn : currentPost.title}
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
                  alt={language === 'en' ? currentPost.titleEn : currentPost.title} 
                  className="blog-hero-image"
                />
              )}

              <div className="blog-body-text">
                {/* Introduction */}
                <p id="sec-intro" style={{ fontSize: '1.1rem', color: '#fff', fontWeight: '500', lineHeight: '1.9' }}>
                  {language === 'en' ? currentPost.introductionEn : currentPost.introduction}
                </p>

                {/* Mythology Section */}
                <h2 id="sec-myth">
                  <BookOpen size={20} style={{ marginRight: '8px' }} />
                  {language === 'en' ? "1. Mythology & Cosmic Symbolism" : "1. 고대 신화적 관점과 상징적 기운"}
                </h2>
                <p>
                  {language === 'en' ? currentPost.mythologyEn : currentPost.mythology}
                </p>

                {/* Good Directions */}
                <h2 id="sec-good">
                  <MessageSquare size={20} style={{ marginRight: '8px' }} />
                  {language === 'en' ? "2. Good Directions: Auspicious Dream Scenarios" : "2. 좋은 방향으로 흘러가는 상황 (길몽)"}
                </h2>
                <ul>
                  {currentPost.sections.filter(s => s.isAuspicious).map((sec, idx) => (
                    <li key={sec.id}>
                      <strong>{idx + 1}. {language === 'en' ? sec.titleEn : sec.title}</strong>:
                      <span> {language === 'en' ? sec.contentEn : sec.content}</span>
                    </li>
                  ))}
                </ul>

                {/* Bad Directions */}
                <h2 id="sec-bad">
                  <MessageSquare size={20} style={{ marginRight: '8px' }} />
                  {language === 'en' ? "3. Bad Directions: Cautionary Dream Scenarios" : "3. 나쁜 방향으로 흘러가는 상황 (흉몽/경고)"}
                </h2>
                <ul>
                  {currentPost.sections.filter(s => !s.isAuspicious).map((sec, idx) => (
                    <li key={sec.id}>
                      <strong>{idx + 1}. {language === 'en' ? sec.titleEn : sec.title}</strong>:
                      <span> {language === 'en' ? sec.contentEn : sec.content}</span>
                    </li>
                  ))}
                </ul>

                {/* Psychology Section */}
                <h2 id="sec-psychology">
                  <HelpCircle size={20} style={{ marginRight: '8px' }} />
                  {language === 'en' ? "4. Psychoanalysis: Subconscious & Archetypes" : "4. 현대 정신분석학적 관점: 자아와 무의식"}
                </h2>
                <p>
                  {language === 'en' ? currentPost.psychologyEn : currentPost.psychology}
                </p>

                {/* FAQ Section */}
                <h2 id="sec-faq">
                  <HelpCircle size={20} style={{ marginRight: '8px' }} />
                  {language === 'en' ? "5. FAQ: Frequently Asked Questions" : "5. 자주 묻는 질문 (FAQ)"}
                </h2>
                <div className="blog-faq-grid">
                  {currentPost.faqs.map((faq, idx) => (
                    <div key={idx} className="blog-faq-card">
                      <div className="blog-faq-q">
                        <span>Q{idx + 1}.</span>
                        <strong>{faq.question}</strong>
                      </div>
                      <p className="blog-faq-a">{faq.answer}</p>
                    </div>
                  ))}
                </div>

                {/* Conclusion */}
                <h2 id="sec-conclusion" style={{ display: 'none' }}>Conclusion</h2>
                <p style={{ marginTop: '32px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--color-secondary)', fontStyle: 'italic', lineHeight: '1.8' }}>
                  {language === 'en' ? currentPost.conclusionEn : currentPost.conclusion}
                </p>
              </div>
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
                    {language === 'en' ? '1. Myth & Symbolism' : '1. 신화적 관점과 기운'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-good')}
                    className={`blog-toc-item ${activeSection === 'sec-good' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '2. Good Scenarios' : '2. 좋은 방향 (길몽)'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-bad')}
                    className={`blog-toc-item ${activeSection === 'sec-bad' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '3. Cautionary Scenarios' : '3. 나쁜 방향 (흉몽)'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleTocClick('sec-psychology')}
                    className={`blog-toc-item ${activeSection === 'sec-psychology' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '4. Psychoanalysis' : '4. 현대 정신분석학'}
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
      ) : null)}

      {/* Blog Main Home: Grid List View */}
      {!selectedPostId && (
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

          {loadingList ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--color-secondary)' }}>
              <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(0, 242, 254, 0.1)', borderTopColor: 'var(--color-secondary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
              <span>{language === 'en' ? 'Loading library index...' : '서고 목록을 불러오는 중...'}</span>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  onClick={() => setSelectedPostId(post.id)}
                  className="blog-card"
                >
                  <div className="blog-card-thumbnail">
                    <img src={post.coverImage} alt={language === 'en' ? post.titleEn : post.title} />
                    <div className="blog-card-overlay" />
                    <span className="blog-badge">
                      {language === 'en' ? post.categoryEn : post.category}
                    </span>
                  </div>
                  
                  <div className="blog-card-content">
                    <h3 className="blog-card-title">
                      {language === 'en' ? post.titleEn : post.title}
                    </h3>
                    <p className="blog-card-desc">
                      {language === 'en' ? post.excerptEn : post.excerpt}
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-secondary)', marginTop: 'auto', fontWeight: '600' }}>
                      <span>{language === 'en' ? 'Read More' : '자세히 보기'}</span>
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
