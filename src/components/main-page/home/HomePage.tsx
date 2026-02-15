import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Footer from '../../footer/Footer.tsx';
import {
  getUserLessonsLite,
  getHistory,
  getLikedLessonIds,
  likeLesson,
  unlikeLesson,
  getTotalLikes,
  getTotalHistory,
  getWordBank,
  type LessonLite,
  type HistoryResponse,
  type Word
} from '../../../services/lessonService.ts';
import { getFolders, type Folder } from '../../../services/folderService.ts';
import { getWordSetsCount } from '../../../services/wordSetService.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { useUpgradePrompt } from '../../../contexts/UpgradePromptContext.tsx';
import { useOnboarding } from '../../../contexts/OnboardingContext.tsx';
import { globalLessonMonitoring } from '../../../services/globalLessonMonitoring.ts';
import { lessonMonitoringService } from '../../../services/lessonMonitoringService.ts';
import { paddleService } from '../../../services/paddleService.ts';
import { extractYouTubeId } from '../../../utils/youtube.ts';
import { capitalizeFirstLetter } from '../../../utils/text.ts';
import LessonBuilderButton from '../lesson-builder/LessonBuilderButton.tsx';
import MyLessonsExpanded from './MyLessonsExpanded.tsx';
import HistoryPopup from './HistoryPopup.tsx';
import FavoritesPopup from './FavoritesPopup.tsx';
import FolderPopup from './FolderPopup.tsx';
import CollectionsPopup from './CollectionsPopup.tsx';
import AddToFolderModal from './AddToFolderModal.tsx';
import HomeLessonCard from './HomeLessonCard.tsx';
import WordSetsPopup from './WordSetsPopup.tsx';
import ShareLessonModal from './ShareLessonModal.tsx';

// Assets
const iconHistory = "/assets/home/book.svg";
const iconFavoritesCollection = "/assets/home/favorite-collection.svg";
const iconWordSets = "/assets/home/star.svg";
const iconNavLeft = "/assets/home/expand-left.svg";
const iconNavRight = "/assets/home/expand-right.svg";
const iconExpand = "/assets/home/fullscreen.svg";
const iconFlag = "/assets/home/flag.svg";
const iconUser = "/assets/user.svg";
const iconReduce = "/assets/home/reduce.svg";



import StudentHomePage from './StudentHomePage.tsx'; // Import the new component

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();

  // Condition to checking if user is student
  // Assuming role is stored in user object as 'role' or similar, 
  // key might be 'role' or 'user_role'. AuthContext says 'role?: string'.
  // Backend Enum is 'STUDENT', 'TEACHER', 'USER'.
  if (user?.role === 'STUDENT') {
    return <StudentHomePage />;
  }

  const navigate = useNavigate();
  // ... rest of the component
  const { openUpgradePrompt } = useUpgradePrompt();
  const { openOnboarding } = useOnboarding();
  // Get first name from user name (e.g. "Alexander Smith" -> "Alexander"), fallback to "dear"
  const firstName = user?.name ? user.name.split(' ')[0] : 'dear';
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatPlanName = (plan?: string) => {
    if (!plan) return 'No plan';
    return plan.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const minutesLeft = user?.lesson_builder_minutes ?? 0;
  const [isProfileCollapsed, setIsProfileCollapsed] = useState(false);

  const [userLessons, setUserLessons] = useState<LessonLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State for My Lessons
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const PAGE_SIZE = 12;

  // History Data
  const [historyCount, setHistoryCount] = useState(0);

  const [isExpandedOpen, setIsExpandedOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isWordSetsOpen, setIsWordSetsOpen] = useState(false);
  const [wordSetsInitialCreate, setWordSetsInitialCreate] = useState(false);

  // Likes State
  const [likedLessonIds, setLikedLessonIds] = useState<Set<string>>(new Set());
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [wordSetsCount, setWordSetsCount] = useState(0);

  // Folders State
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isFolderManagementOpen, setIsFolderManagementOpen] = useState(false);
  const [activeFolderPopup, setActiveFolderPopup] = useState<{ id: number, name: string } | null>(null);
  const [addToFolderModal, setAddToFolderModal] = useState<{ lessonId: string } | null>(null);
  const [shareLessonModal, setShareLessonModal] = useState<{ lessonId: string } | null>(null);

  // Word Bank State
  const [wordBankWords, setWordBankWords] = useState<Word[]>([]);
  const [isWordBankLoading, setIsWordBankLoading] = useState(false);
  const [wordBankPage, setWordBankPage] = useState(0);
  const [hasMoreWords, setHasMoreWords] = useState(true);
  const [isFetchingMoreWords, setIsFetchingMoreWords] = useState(false);
  const scrollObserverRef = useRef<HTMLDivElement>(null);

  const lessonsGridRef = useRef<HTMLDivElement>(null);
  const lessonsScrollObserverRef = useRef<HTMLDivElement>(null);

  const fetchLessons = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      // Reset pagination state when user changes or first load
      setPage(0);
      setHasMore(true);
      const data = await getUserLessonsLite({ page: 0, size: PAGE_SIZE, sort: '-createdAt', email: user.email });
      setUserLessons(data);

      // Start monitoring for processing lessons
      data.forEach(lesson => {
        if ((lesson.status === 'PROCESSING' || lesson.status === 'PENDING') && !lessonMonitoringService.isMonitoring(lesson.id)) {
          globalLessonMonitoring.startMonitoring(lesson.id, lesson.lesson_topic || 'Untitled');
        }
      });

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();

    const handleLessonCreated = () => {
      console.log('HomePage: Lesson created, refreshing lessons grid...');
      fetchLessons();
    };

    window.addEventListener('lessonCreated', handleLessonCreated);
    return () => window.removeEventListener('lessonCreated', handleLessonCreated);
  }, [user?.email]);

  // Fetch History, Likes, Folders, and Word Sets count
  useEffect(() => {
    if (!user?.email) return;

    const fetchData = async () => {
      try {
        const historyTotal = await getTotalHistory();
        setHistoryCount(historyTotal);

        const likedIds = await getLikedLessonIds();
        setLikedLessonIds(new Set(likedIds));

        const likesTotal = await getTotalLikes();
        setFavoritesCount(likesTotal);

        const folderData = await getFolders();
        setFolders(folderData);

        const setsCount = await getWordSetsCount();
        setWordSetsCount(setsCount);
      } catch (e) {
        console.error('Failed to fetch summary data', e);
      }
    };

    fetchData();
  }, [user?.email]);

  // Fetch Word Bank separately
  useEffect(() => {
    if (!user?.email) return;

    const fetchInitialWordBank = async () => {
      try {
        setIsWordBankLoading(true);
        const data = await getWordBank({ page: 0, size: 20 });
        setWordBankWords(data.content);
        setHasMoreWords(!data.last);
        setWordBankPage(0);
      } catch (e) {
        console.error('Failed to fetch word bank', e);
      } finally {
        setIsWordBankLoading(false);
      }
    };

    fetchInitialWordBank();
  }, [user?.email]);

  // Handle infinite scroll loading
  useEffect(() => {
    if (!user?.email || wordBankPage === 0) return;

    async function loadMore() {
      try {
        setIsFetchingMoreWords(true);
        const data = await getWordBank({ page: wordBankPage, size: 20 });
        setWordBankWords(prev => [...prev, ...data.content]);
        setHasMoreWords(!data.last);
      } catch (e) {
        console.error('Failed to load more words', e);
      } finally {
        setIsFetchingMoreWords(false);
      }
    }
    loadMore();
  }, [wordBankPage, user?.email]);

  // Observer effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreWords && !isFetchingMoreWords && !isWordBankLoading) {
          setWordBankPage(p => p + 1);
        }
      },
      { threshold: 0.1, root: null }
    );

    const currentTarget = scrollObserverRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasMoreWords, isFetchingMoreWords, isWordBankLoading]);

  // Subscribe to monitoring updates
  useEffect(() => {
    globalLessonMonitoring.setSilentMode(true);
    const unsubscribe = globalLessonMonitoring.subscribe((lessonId) => {
      console.log('HomePage: Lesson ready, refreshing...', lessonId);
      // Refresh only history count and user lessons as those are mostly affected
      (async () => {
        if (!user?.email) return;
        try {
          // Re-fetch initial page to see updated statuses
          const data = await getUserLessonsLite({ page: 0, size: PAGE_SIZE, sort: '-createdAt', email: user.email });
          setUserLessons(data);
          setPage(0);
          setHasMore(data.length === PAGE_SIZE);

          const total = await getTotalHistory();
          setHistoryCount(total);
        } catch (e) {
          console.error('Failed to refresh after monitoring', e);
        }
      })();
    });
    return () => {
      unsubscribe();
      globalLessonMonitoring.setSilentMode(false);
    };
  }, [user?.email, PAGE_SIZE]);

  const loadMoreLessons = async () => {
    if (isFetchingMore || !hasMore || !user?.email) return;

    try {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      const data = await getUserLessonsLite({
        page: nextPage,
        size: PAGE_SIZE,
        sort: '-createdAt',
        email: user.email
      });

      if (data.length > 0) {
        // Start monitoring for any new processing lessons
        data.forEach(lesson => {
          if ((lesson.status === 'PROCESSING' || lesson.status === 'PENDING') && !lessonMonitoringService.isMonitoring(lesson.id)) {
            globalLessonMonitoring.startMonitoring(lesson.id, lesson.lesson_topic || 'Untitled');
          }
        });

        setUserLessons(prev => [...prev, ...data]);
        setPage(nextPage);
      }

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to fetch more lessons:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleLessonsGridScroll = () => {
    if (!lessonsGridRef.current || isFetchingMore || !hasMore) return;

    const { scrollLeft, scrollWidth, clientWidth } = lessonsGridRef.current;
    // Trigger when user scrolls within 200px of the end
    if (scrollLeft + clientWidth >= scrollWidth - 200) {
      loadMoreLessons();
    }
  };

  const handleToggleLike = async (lessonId: string) => {
    const isLiked = likedLessonIds.has(lessonId);

    // Optimistic Update
    const newSet = new Set(likedLessonIds);
    if (isLiked) {
      newSet.delete(lessonId);
      setFavoritesCount(prev => Math.max(0, prev - 1));
    } else {
      newSet.add(lessonId);
      setFavoritesCount(prev => prev + 1);
    }
    setLikedLessonIds(newSet);

    try {
      if (isLiked) {
        await unlikeLesson(lessonId);
      } else {
        await likeLesson(lessonId);
      }
    } catch (e) {
      console.error('Failed to toggle like', e);
      // Revert on failure (optional, but good practice)
      setLikedLessonIds(prev => {
        const revertSet = new Set(prev);
        if (isLiked) revertSet.add(lessonId);
        else revertSet.delete(lessonId);
        return revertSet;
      });
      setFavoritesCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };



  const handleLessonScroll = (direction: 'left' | 'right') => {
    if (lessonsGridRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = lessonsGridRef.current;
      const scrollAmount = 336; // 320px card + 16px gap
      const newScrollLeft = scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);

      lessonsGridRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      // If scrolling right and getting near the end, try to load more
      if (direction === 'right' && newScrollLeft + clientWidth >= scrollWidth - 400) {
        loadMoreLessons();
      }
    }
  };

  const handleLessonClick = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  const handleAddMinutes = () => {
    if (!user) return;

    const plan = (user.plan || '').toUpperCase();
    let priceId = '';

    // If user is on SMART (Start) plan, use the Start price, 
    // otherwise (PLUS, PRO, etc.) use the Plus/Pro price.
    if (plan === 'SMART') {
      priceId = import.meta.env.VITE_PADDLE_PRICE_100_MINS_START;
    } else {
      priceId = import.meta.env.VITE_PADDLE_PRICE_100_MINS_PLUS;
    }

    if (priceId) {
      paddleService.openCheckout(priceId, user.id, user.email);
    } else {
      console.error('Add Minutes: Price ID not configured for plan', plan);
      alert('This option is temporarily unavailable. Please try again later.');
    }
  };

  const handleCollectionClick = (id: string, folderId?: number) => {
    setActiveCollection(id);
    if (id === 'history') {
      setIsHistoryOpen(true);
    } else if (id === 'favourites') {
      setIsFavoritesOpen(true);
    } else if (id.startsWith('folder-') && folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        setActiveFolderPopup({ id: folderId, name: folder.name });
      }
    } else if (id === 'wordsets') {
      setWordSetsInitialCreate(false);
      setIsWordSetsOpen(true);
    }
  };

  const refreshFolders = async () => {
    try {
      const data = await getFolders();
      setFolders(data);
      const count = await getWordSetsCount();
      setWordSetsCount(count);
    } catch (e) {
      console.error('Failed to refresh folders/sets', e);
    }
  };

  // Removed sample word bank data

  const collectionsGridRef = useRef<HTMLDivElement>(null);

  const handleCollectionScroll = (direction: 'left' | 'right') => {
    if (collectionsGridRef.current) {
      const scrollAmount = 300; // Adjust scroll amount as needed
      const newScrollLeft = collectionsGridRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      collectionsGridRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const collections = [
    { id: 'history', name: 'History', count: historyCount, icon: iconHistory },
    { id: 'favourites', name: 'Favourites', count: favoritesCount, icon: iconFavoritesCollection },
    { id: 'wordsets', name: 'Word sets', count: wordSetsCount, icon: iconWordSets },
    ...folders.map(f => ({
      id: `folder-${f.id}`,
      name: f.name,
      count: f.lesson_count,
      icon: iconFlag,
      folderId: f.id
    }))
  ];

  return (
    <div className="dashboard-page">
      {/* Main Content */}
      <main className="dashboard-main-content">
        {/* Header */}
        <header className="dashboard-header">
          <h1>Hello, {firstName}</h1>
          <div className="header-controls">
            <LessonBuilderButton />
          </div>
        </header>

        {/* My Lessons Section */}
        <section className="my-lessons-section">

          <div className="my-lessons-container">
            <div className="section-header">
              <h2>My lessons</h2>
              <div className="section-controls">
                <button className="nav-arrow" onClick={() => handleLessonScroll('left')}>
                  <img src={iconNavLeft} alt="Previous" />
                </button>
                <button className="nav-arrow" onClick={() => handleLessonScroll('right')}>
                  <img src={iconNavRight} alt="Next" />
                </button>
                <button className="expand-btn" onClick={() => setIsExpandedOpen(true)}>
                  <img src={iconExpand} alt="Expand" />
                </button>
              </div>
            </div>
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : userLessons.length === 0 ? (
              <div className="empty-state">You haven't created any lessons yet.</div>
            ) : (
              <div
                className="home-lessons-grid"
                ref={lessonsGridRef}
                onScroll={handleLessonsGridScroll}
              >
                {userLessons.map((lesson) => (
                  <HomeLessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onClick={() => handleLessonClick(lesson.id)}
                    onAddToFolder={() => setAddToFolderModal({ lessonId: lesson.id })}
                    onAddToFavorite={() => handleToggleLike(lesson.id)}
                    isLiked={likedLessonIds.has(lesson.id)}
                  />
                ))}
                {isFetchingMore && (
                  <div className="lesson-loading-more">
                    <div className="loader-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {isExpandedOpen && (
          <MyLessonsExpanded
            onClose={() => setIsExpandedOpen(false)}
            likedLessonIds={likedLessonIds}
            onToggleLike={handleToggleLike}
            onAddToFolder={(lessonId) => setAddToFolderModal({ lessonId })}
          />
        )}

        {
          isHistoryOpen && (
            <HistoryPopup
              onClose={() => setIsHistoryOpen(false)}
              likedLessonIds={likedLessonIds}
              onToggleLike={(e, id) => handleToggleLike(id)}
              onAddToFolder={(lessonId) => setAddToFolderModal({ lessonId })}
            />
          )
        }

        {
          isFavoritesOpen && (
            <FavoritesPopup
              onClose={() => {
                setIsFavoritesOpen(false);
                // Refresh likes on close in case user removed some inside popup
                // Or we can rely on state if we lift more, but simple re-fetch is safter
                async function refreshLikes() {
                  const ids = await getLikedLessonIds();
                  setLikedLessonIds(new Set(ids));
                  const total = await getTotalLikes();
                  setFavoritesCount(total);
                }
                refreshLikes();
              }}
              onAddToFolder={(lessonId) => setAddToFolderModal({ lessonId })}
            />
          )
        }

        {
          isFolderManagementOpen && (
            <CollectionsPopup
              onClose={() => setIsFolderManagementOpen(false)}
              onOpenCollection={(id: string, folderId?: number) => {
                setIsFolderManagementOpen(false);
                if (id === 'history') {
                  setIsHistoryOpen(true);
                } else if (id === 'favourites') {
                  setIsFavoritesOpen(true);
                } else if (id.startsWith('folder-') && folderId) {
                  const folder = folders.find(f => f.id === folderId);
                  if (folder) {
                    setActiveFolderPopup({ id: folderId, name: folder.name });
                  }
                } else if (id === 'wordsets') {
                  setIsFolderManagementOpen(false);
                  setWordSetsInitialCreate(false);
                  setIsWordSetsOpen(true);
                }
              }}
              historyCount={historyCount}
              favoritesCount={favoritesCount}
              wordSetsCount={wordSetsCount}
              onFoldersUpdated={refreshFolders}
            />
          )
        }


        {/* WordSetsPopup restored for create flow from sidebar */}
        {
          isWordSetsOpen && (
            <WordSetsPopup
              onClose={() => setIsWordSetsOpen(false)}
              onSetsUpdated={refreshFolders}
              initialCreateMode={wordSetsInitialCreate}
            />
          )
        }


        {
          activeFolderPopup && (
            <FolderPopup
              folderId={activeFolderPopup.id}
              folderName={activeFolderPopup.name}
              onClose={() => setActiveFolderPopup(null)}
              likedLessonIds={likedLessonIds}
              onToggleLike={(e, id) => handleToggleLike(id)}
              onAddToFolder={(lessonId) => setAddToFolderModal({ lessonId })}
              onFolderUpdated={refreshFolders}
            />
          )
        }

        {
          addToFolderModal && (
            <AddToFolderModal
              lessonId={addToFolderModal.lessonId}
              onClose={() => setAddToFolderModal(null)}
              onFoldersUpdated={refreshFolders}
            />
          )
        }




        {/* Collections Section */}
        <section className="collections-section">
          <div className={`collections-container ${user?.permissions && !user.permissions.can_use_collections ? 'locked' : ''}`}>
            <div className="section-header">
              <h2>Collections</h2>
              <div className="section-controls">
                <button className="nav-arrow" onClick={() => handleCollectionScroll('left')}>
                  <img src={iconNavLeft} alt="Previous" />
                </button>
                <button className="nav-arrow" onClick={() => handleCollectionScroll('right')}>
                  <img src={iconNavRight} alt="Next" />
                </button>
                <button className="expand-btn" onClick={() => {
                  if (user?.permissions?.can_use_collections !== false) {
                    setIsFolderManagementOpen(true);
                  }
                }}>
                  <img src={iconExpand} alt="Expand" />
                </button>
              </div>
            </div>
            <div className="collections-content" ref={collectionsGridRef}>
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`collection-item ${activeCollection === collection.id ? 'active' : ''}`}
                  onClick={() => {
                    if (user?.permissions?.can_use_collections !== false) {
                      handleCollectionClick(collection.id, (collection as any).folderId);
                    }
                  }}
                >
                  <div className="collection-icon">
                    <img src={collection.icon} alt={collection.name} />
                  </div>
                  <div className="collection-info">
                    <h3>{collection.name}</h3>
                    <p>{collection.count} {collection.id === 'wordsets' ? 'sets' : 'lessons'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Student Progress Section */}
        <section className="student-progress-section">
          <div className="student-progress-container">
            <div className="section-header">
              <div className="header-title-group">
                <h2>Student progress</h2>
                <span className="coming-soon">Coming soon</span>
              </div>
              <div className="section-controls">
                <button className="nav-arrow">
                  <img src={iconNavLeft} alt="Previous" />
                </button>
                <button className="nav-arrow">
                  <img src={iconNavRight} alt="Next" />
                </button>
                <button className="expand-btn">
                  <img src={iconExpand} alt="Expand" />
                </button>
              </div>
            </div>
            <div className="students-grid">
              {[1, 2, 3, 4, 5, 6].map((student) => (
                <div key={student} className="student-card">
                  <p>Student {student}</p>
                  <p className="student-lessons">0 lessons</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main >

      {/* Right Sidebar - Word Bank */}
      {/* Right Sidebar - Word Bank */}
      <aside className="sidebar-right">
        {isProfileCollapsed ? (
          <div className={`user-profile collapsed ${user?.plan?.toUpperCase() === 'OPEN_LIBRARY' ? 'open-library' : ''}`}>
            {user?.plan?.toUpperCase() !== 'OPEN_LIBRARY' && (
              <div className="collapsed-info">
                <span className="minutes-number">{minutesLeft}</span>
                <span className="minutes-label">Minutes left</span>
              </div>
            )}
            <span className="user-plan-label">{formatPlanName(user?.plan)}</span>
            <button className="expand-profile-btn" onClick={() => setIsProfileCollapsed(false)}>
              <img src={iconExpand} alt="Expand" />
            </button>
          </div>
        ) : (
          <div className={`user-profile ${user?.plan?.toUpperCase() === 'OPEN_LIBRARY' ? 'open-library' : ''}`}>
            {user?.plan?.toUpperCase() === 'OPEN_LIBRARY' ? (
              <>
                <div className="open-library-container">
                  <div className="plan-box">
                    <span className="plan-title">Open Library</span>
                    <button className="upgrade-link-btn" onClick={() => openOnboarding(true)}>Upgrade</button>
                  </div>
                  <div className="profile-actions-box">
                    <div className="profile-info-group">
                      <button
                        className="profile-icon-btn"
                        onClick={() => paddleService.openCustomerPortal(user?.paddle_customer_id)}
                      >
                        <img src={iconUser} alt="Profile" />
                      </button>
                      <span className="profile-label">Profile</span>
                    </div>
                    <button className="home-logout-btn" onClick={handleLogout}>Log out</button>
                  </div>
                  <button className="collapse-btn absolute" onClick={() => setIsProfileCollapsed(true)}>
                    <img src={iconReduce} alt="Collapse" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="user-profile-top">
                  <div className="minutes-widget">
                    <div className="minutes-info">
                      <span className="minutes-number">{minutesLeft}</span>
                      <span className="minutes-label">Minutes left</span>
                    </div>
                    <span className="user-plan-label">{formatPlanName(user?.plan)}</span>
                  </div>
                  <div className="profile-widget">
                    <button
                      className="profile-icon-btn"
                      onClick={() => paddleService.openCustomerPortal(user?.paddle_customer_id)}
                    >
                      <img src={iconUser} alt="Profile" />
                    </button>
                    <span className="profile-label">Profile</span>
                    <div className="window-controls">
                      <button className="collapse-btn" onClick={() => setIsProfileCollapsed(true)}>
                        <img src={iconReduce} alt="Collapse" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="user-profile-actions">
                  <button className="add-minutes-btn" onClick={handleAddMinutes}>Add minutes</button>
                  <button className="upgrade-btn" onClick={() => openOnboarding(true)}>Upgrade</button>
                  <button className="home-logout-btn" onClick={handleLogout}>Log out</button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="word-bank-section">
          <div className="word-bank-title">
            <h2>Word Bank</h2>
            <button className="create-set-btn" onClick={() => {
              setWordSetsInitialCreate(true);
              setIsWordSetsOpen(true);
            }}>Create custom set</button>
          </div>
          <div className="word-bank-list">
            {isWordBankLoading ? (
              <div className="word-bank-loading">Loading...</div>
            ) : wordBankWords.length === 0 ? (
              <div className="word-bank-empty">Your Word Bank is empty.</div>
            ) : (
              <>
                {wordBankWords.map((word) => (
                  <div key={word.id} className="vocab-sidebar-card">
                    <div className="vocab-sidebar-content">
                      <h3>{word.term} — {word.translation}</h3>
                      <div className="time-code">
                        <span
                          className="time-link"
                          onClick={() => navigate(`/lesson/${word.lesson_id}`)}
                          title="Open lesson"
                        >
                          View lesson
                        </span>
                      </div>
                      <p className="quote">«{word.quote}»</p>
                      <p className="explanation">{word.translated_explanation}</p>
                      {word.another_example && <p className="example">{word.another_example}</p>}
                    </div>
                  </div>
                ))}

                {/* Scroll Sentinel */}
                <div ref={scrollObserverRef} className="word-bank-sentinel">
                  {isFetchingMoreWords && <div className="fetching-more-loader">Loading more...</div>}
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </div >
  );
};

export default HomePage;