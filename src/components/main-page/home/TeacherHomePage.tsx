import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import {
  getUserLessonsLite,
  getLikedLessonIds,
  likeLesson,
  unlikeLesson,
  getTotalLikes,
  getTotalHistory,
  getWordBank,
  type LessonLite,
  type Word,
  deleteLesson,
  deleteReadyLesson
} from '../../../services/lessonService.ts';
import { getFolders, type Folder } from '../../../services/folderService.ts';
import { getWordSetsCount } from '../../../services/wordSetService.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { useUpgradePrompt } from '../../../contexts/UpgradePromptContext.tsx';
import { useOnboarding } from '../../../contexts/OnboardingContext.tsx';
import { globalLessonMonitoring } from '../../../services/globalLessonMonitoring.ts';
import { lessonMonitoringService } from '../../../services/lessonMonitoringService.ts';
import { paddleService } from '../../../services/paddleService.ts';
import { fetchYouTubeTitle } from '../../../utils/youtube.ts';
import LessonBuilderButton from '../lesson-builder/LessonBuilderButton.tsx';
import MyLessonsExpanded from './MyLessonsExpanded.tsx';
import HistoryPopup from './HistoryPopup.tsx';
import FavoritesPopup from './FavoritesPopup.tsx';
import FolderPopup from './FolderPopup.tsx';
import CollectionsPopup from './CollectionsPopup.tsx';
import AddToFolderModal from './AddToFolderModal.tsx';
import HomeLessonCard from './HomeLessonCard.tsx';
import WordSetsPopup from './WordSetsPopup.tsx';
import BuilderNotification from './BuilderNotification.tsx';
import ConfirmModal from './ConfirmModal.tsx';

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

const studentProgressStub = [
  { id: 1, name: 'Student 1', lessons: 0, icon: '/assets/home/student-stub/stub1.webp' },
  { id: 2, name: 'Student 2', lessons: 0, icon: '/assets/home/student-stub/stub2.webp' },
  { id: 3, name: 'Student 3', lessons: 0, icon: '/assets/home/student-stub/stub3.webp' },

];

const TeacherHomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { openUpgradePrompt } = useUpgradePrompt();
  const { openOnboarding } = useOnboarding();

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

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const PAGE_SIZE = 12;

  const [historyCount, setHistoryCount] = useState(0);
  const [isExpandedOpen, setIsExpandedOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isWordSetsOpen, setIsWordSetsOpen] = useState(false);
  const [wordSetsInitialCreate, setWordSetsInitialCreate] = useState(false);

  const [likedLessonIds, setLikedLessonIds] = useState<Set<string>>(new Set());
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [wordSetsCount, setWordSetsCount] = useState(0);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [isFolderManagementOpen, setIsFolderManagementOpen] = useState(false);
  const [activeFolderPopup, setActiveFolderPopup] = useState<{ id: number, name: string } | null>(null);
  const [addToFolderModal, setAddToFolderModal] = useState<{ lessonId: string } | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<LessonLite | null>(null);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'error', lessonId?: string } | null>(null);

  const [wordBankWords, setWordBankWords] = useState<Word[]>([]);
  const [isWordBankLoading, setIsWordBankLoading] = useState(false);
  const [wordBankPage, setWordBankPage] = useState(0);
  const [hasMoreWords, setHasMoreWords] = useState(true);
  const [isFetchingMoreWords, setIsFetchingMoreWords] = useState(false);
  const scrollObserverRef = useRef<HTMLDivElement>(null);

  const lessonsGridRef = useRef<HTMLDivElement>(null);

  const fetchLessons = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      setPage(0);
      setHasMore(true);
      const data = await getUserLessonsLite({ page: 0, size: PAGE_SIZE, sort: '-createdAt', email: user.email });
      setUserLessons(data);

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
      fetchLessons();
    };

    const handleBuildingStarted = (e: any) => {
      const lessonName = e.detail?.name || 'New Lesson';
      const lessonId = e.detail?.lessonId;
      setNotification({
        message: `Building lesson "${lessonName}"...`,
        type: 'info',
        lessonId
      });
      // Building notification stays for 60 seconds (matching Figma)
      setTimeout(() => setNotification(null), 60000);
    };

    window.addEventListener('lessonCreated', handleLessonCreated);
    window.addEventListener('lessonBuildingStarted', handleBuildingStarted);
    return () => {
      window.removeEventListener('lessonCreated', handleLessonCreated);
      window.removeEventListener('lessonBuildingStarted', handleBuildingStarted);
    };
  }, [user?.email]);

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

  useEffect(() => {
    const lessonsToFetch = userLessons.filter(l => !l.you_tube_title && l.youtube_url);
    if (lessonsToFetch.length === 0) return;

    const fetchTitles = async () => {
      let updated = false;
      const newLessons = await Promise.all(userLessons.map(async (l) => {
        if (!l.you_tube_title && l.youtube_url) {
          try {
            const title = await fetchYouTubeTitle(l.youtube_url);
            if (title) {
              updated = true;
              return { ...l, you_tube_title: title };
            }
          } catch (e) {
            // ignore
          }
        }
        return l;
      }));

      if (updated) {
        setUserLessons(newLessons);
      }
    };

    fetchTitles();
  }, [userLessons]);

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

  useEffect(() => {
    globalLessonMonitoring.setSilentMode(true);
    const unsubscribe = globalLessonMonitoring.subscribe((lessonId, lessonName) => {
      (async () => {
        if (!user?.email) return;
        try {
          const data = await getUserLessonsLite({ page: 0, size: PAGE_SIZE, sort: '-createdAt', email: user.email });
          setUserLessons(data);
          setPage(0);
          setHasMore(data.length === PAGE_SIZE);

          const total = await getTotalHistory();
          setHistoryCount(total);

          // Use the lessonName from the monitor for immediate feedback.
          // Check the status from fetched data to distinguish between success and error.
          const completedLesson = data.find(l => l.id === lessonId);
          const isError = completedLesson?.status === 'ERROR';

          setNotification({
            message: isError 
              ? `Failed to create lesson "${lessonName || 'Untitled'}".`
              : `Lesson "${lessonName || 'Untitled'}" is ready!`,
            type: isError ? 'error' : 'success'
          });

          // Auto hide after 10 seconds
          setTimeout(() => setNotification(null), 10000);
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
    if (scrollLeft + clientWidth >= scrollWidth - 200) {
      loadMoreLessons();
    }
  };

  const handleToggleLike = async (lessonId: string) => {
    const isLiked = likedLessonIds.has(lessonId);
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
      setLikedLessonIds(prev => {
        const revertSet = new Set(prev);
        if (isLiked) revertSet.add(lessonId);
        else revertSet.delete(lessonId);
        return revertSet;
      });
      setFavoritesCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  const handleStopLesson = async (lessonId: string) => {
    try {
      await deleteLesson(lessonId);
      // Refresh lessons
      fetchLessons();
    } catch (e) {
      console.error('Failed to stop lesson', e);
      alert('Failed to stop lesson generation. Please try again.');
    }
  };

  const handleConfirmDeleteLesson = async () => {
    if (!lessonToDelete || isDeletingLesson) return;

    const lessonId = lessonToDelete.id;
    try {
      setIsDeletingLesson(true);
      await deleteReadyLesson(lessonId);
      setUserLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
      setLikedLessonIds(prev => {
        const next = new Set(prev);
        if (next.delete(lessonId)) {
          setFavoritesCount(count => Math.max(0, count - 1));
        }
        return next;
      });
      setHistoryCount(count => Math.max(0, count - 1));
      setLessonToDelete(null);
      refreshFolders();
    } catch (e) {
      console.error('Failed to delete lesson', e);
      alert('Failed to delete lesson. Please try again.');
    } finally {
      setIsDeletingLesson(false);
    }
  };

  const handleLessonScroll = (direction: 'left' | 'right') => {
    if (lessonsGridRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = lessonsGridRef.current;
      const scrollAmount = 336;
      const newScrollLeft = scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);

      lessonsGridRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

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
    if (plan === 'SMART') {
      priceId = import.meta.env.VITE_PADDLE_PRICE_100_MINS_START;
    } else {
      priceId = import.meta.env.VITE_PADDLE_PRICE_100_MINS_PLUS;
    }
    if (priceId) {
      paddleService.openCheckout(priceId, user.id, user.email);
    } else {
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

  const collectionsGridRef = useRef<HTMLDivElement>(null);

  const handleCollectionScroll = (direction: 'left' | 'right') => {
    if (collectionsGridRef.current) {
      const scrollAmount = 300;
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
    <div className="dashboard-page teacher-homepage-layout">
      <header className="dashboard-header">
        <h1>Hello, {firstName}</h1>
        <div className="header-controls">
          {notification && (
            <BuilderNotification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
              onUndo={() => {
                if (notification.lessonId) {
                  handleStopLesson(notification.lessonId);
                }
                setNotification(null);
              }}
            />
          )}
          <LessonBuilderButton />
        </div>
      </header>

      <main className="dashboard-main-content">

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
                    onDelete={() => setLessonToDelete(lesson)}
                    onStop={() => handleStopLesson(lesson.id)}
                    isLiked={likedLessonIds.has(lesson.id)}
                    showDelete
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

        {isHistoryOpen && (
          <HistoryPopup
            onClose={() => setIsHistoryOpen(false)}
            likedLessonIds={likedLessonIds}
            onToggleLike={(e, id) => handleToggleLike(id)}
            onAddToFolder={(lessonId) => setAddToFolderModal({ lessonId })}
          />
        )}

        {isFavoritesOpen && (
          <FavoritesPopup
            onClose={() => {
              setIsFavoritesOpen(false);
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
        )}

        {isFolderManagementOpen && (
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
        )}

        {isWordSetsOpen && (
          <WordSetsPopup
            onClose={() => setIsWordSetsOpen(false)}
            onSetsUpdated={refreshFolders}
            initialCreateMode={wordSetsInitialCreate}
          />
        )}

        {activeFolderPopup && (
          <FolderPopup
            folderId={activeFolderPopup.id}
            folderName={activeFolderPopup.name}
            onClose={() => setActiveFolderPopup(null)}
            likedLessonIds={likedLessonIds}
            onToggleLike={(e, id) => handleToggleLike(id)}
            onAddToFolder={(lessonId) => setAddToFolderModal({ lessonId })}
            onFolderUpdated={refreshFolders}
          />
        )}

        {addToFolderModal && (
          <AddToFolderModal
            lessonId={addToFolderModal.lessonId}
            onClose={() => setAddToFolderModal(null)}
            onFoldersUpdated={refreshFolders}
          />
        )}

        {lessonToDelete && (
          <ConfirmModal
            title="Do you want to delete this lesson?"
            secondaryText="Go back"
            primaryText={isDeletingLesson ? 'Deleting...' : 'Delete'}
            variant="danger"
            onSecondary={() => {
              if (!isDeletingLesson) setLessonToDelete(null);
            }}
            onPrimary={handleConfirmDeleteLesson}
          />
        )}

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

        <section className="student-progress-section">
          <div className="student-progress-container locked">
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
              {studentProgressStub.map((student) => (
                <div key={student.id} className="student-card">
                  <div className="student-info">
                    <h3>{student.name}</h3>
                    <p className="student-lessons">{student.lessons} lessons</p>
                  </div>
                  <div className="student-icon">
                    <img src={student.icon} alt={student.name} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main >

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

        <div className={`word-bank-section ${user?.permissions && !user.permissions.can_use_collections ? 'locked' : ''}`}>
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

export default TeacherHomePage;
