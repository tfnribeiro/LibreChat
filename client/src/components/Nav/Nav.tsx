import { useCallback, useEffect, useState, useMemo, memo, lazy, Suspense, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { useMediaQuery } from '@librechat/client';
import { PermissionTypes, Permissions } from 'librechat-data-provider';
import type { ConversationListResponse } from 'librechat-data-provider';
import type { InfiniteQueryObserverResult } from '@tanstack/react-query';
import {
  useLocalize,
  useHasAccess,
  useAuthContext,
  useLocalStorage,
  useNavScrolling,
} from '~/hooks';
import { useConversationsInfiniteQuery, useKnowledgeBasesQuery  } from '~/data-provider';
import { Conversations } from '~/components/Conversations';
import SearchBar from './SearchBar';
import NewChat from './NewChat';
import { cn } from '~/utils';
import NewKnowledgeBase from './NewKnowledgeBase';
import store from '~/store';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

const BookmarkNav = lazy(() => import('./Bookmarks/BookmarkNav'));
const AccountSettings = lazy(() => import('./AccountSettings'));
const AgentMarketplaceButton = lazy(() => import('./AgentMarketplaceButton'));

const NAV_WIDTH_DESKTOP = '260px';
const NAV_WIDTH_MOBILE = '320px';

const NavMask = memo(
  ({ navVisible, toggleNavVisible }: { navVisible: boolean; toggleNavVisible: () => void }) => (
    <div
      id="mobile-nav-mask-toggle"
      role="button"
      tabIndex={0}
      className={`nav-mask transition-opacity duration-200 ease-in-out ${navVisible ? 'active opacity-100' : 'opacity-0'}`}
      onClick={toggleNavVisible}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          toggleNavVisible();
        }
      }}
      aria-label="Toggle navigation"
    />
  ),
);

const MemoNewChat = memo(NewChat);

const Nav = memo(
  ({
    navVisible,
    setNavVisible,
  }: {
    navVisible: boolean;
    setNavVisible: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    const localize = useLocalize();
    const { isAuthenticated } = useAuthContext();
    const params = useParams();
    const navigate = useNavigate();
    const [navWidth, setNavWidth] = useState(NAV_WIDTH_DESKTOP);
    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const [newUser, setNewUser] = useLocalStorage('newUser', true);
    const [showLoading, setShowLoading] = useState(false);
    const [tags, setTags] = useState<string[]>([]);

    const hasAccessToBookmarks = useHasAccess({
      permissionType: PermissionTypes.BOOKMARKS,
      permission: Permissions.USE,
    });

    const search = useRecoilValue(store.search);

    const { data, fetchNextPage, isFetchingNextPage, isLoading, isFetching, refetch } =
      useConversationsInfiniteQuery(
        {
          tags: tags.length === 0 ? undefined : tags,
          search: search.debouncedQuery || undefined,
        },
        {
          enabled: isAuthenticated,
          staleTime: 30000,
          cacheTime: 300000,
        },
      );

    const computedHasNextPage = useMemo(() => {
      if (data?.pages && data.pages.length > 0) {
        const lastPage: ConversationListResponse = data.pages[data.pages.length - 1];
        return lastPage.nextCursor !== null;
      }
      return false;
    }, [data?.pages]);

    const outerContainerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<any>(null);

    const { moveToTop } = useNavScrolling<ConversationListResponse>({
      setShowLoading,
      fetchNextPage: async (options?) => {
        if (computedHasNextPage) {
          return fetchNextPage(options);
        }
        return Promise.resolve(
          {} as InfiniteQueryObserverResult<ConversationListResponse, unknown>,
        );
      },
      isFetchingNext: isFetchingNextPage,
    });


    const conversations = useMemo(() => {
      return data ? data.pages.flatMap((page) => page.conversations) : [];
    }, [data]);

    const { data: kbs = [] } = useKnowledgeBasesQuery({ enabled: isAuthenticated })

    // Track active knowledge base from URL
    const activeKBId = params.kbId || '';
    
    const mappedKBs = useMemo(() => {
      return kbs.map((kb) => ({ id: kb.slug || kb._id, name: kb.name, conversations: [] }));
    }, [kbs]);

    const toggleNavVisible = useCallback(() => {
      setNavVisible((prev: boolean) => {
        localStorage.setItem('navVisible', JSON.stringify(!prev));
        return !prev;
      });
      if (newUser) {
        setNewUser(false);
      }
    }, [newUser, setNavVisible, setNewUser]);

    const itemToggleNav = useCallback(() => {
      if (isSmallScreen) {
        toggleNavVisible();
      }
    }, [isSmallScreen, toggleNavVisible]);

    useEffect(() => {
      if (isSmallScreen) {
        const savedNavVisible = localStorage.getItem('navVisible');
        if (savedNavVisible === null) {
          toggleNavVisible();
        }
        setNavWidth(NAV_WIDTH_MOBILE);
      } else {
        setNavWidth(NAV_WIDTH_DESKTOP);
      }
    }, [isSmallScreen, toggleNavVisible]);

    useEffect(() => {
      refetch();
    }, [tags, refetch]);

    const loadMoreConversations = useCallback(() => {
      if (isFetchingNextPage || !computedHasNextPage) {
        return;
      }

      fetchNextPage();
    }, [isFetchingNextPage, computedHasNextPage, fetchNextPage]);

    const subHeaders = useMemo(
      () => search.enabled === true && <SearchBar isSmallScreen={isSmallScreen} />,
      [search.enabled, isSmallScreen],
    );

    const headerButtons = useMemo(
      () => (
        <>
          <NewKnowledgeBase toggleNav={toggleNavVisible} isSmallScreen={isSmallScreen} />
          <Suspense fallback={null}>
            <AgentMarketplaceButton isSmallScreen={isSmallScreen} toggleNav={toggleNavVisible} />
          </Suspense>
          {hasAccessToBookmarks && (
            <>
              <div className="mt-1.5" />
              <Suspense fallback={null}>
                <BookmarkNav tags={tags} setTags={setTags} isSmallScreen={isSmallScreen} />
              </Suspense>
            </>
          )}
        </>
      ),
      [hasAccessToBookmarks, tags, isSmallScreen, toggleNavVisible],
    );

    const [isSearchLoading, setIsSearchLoading] = useState(
      !!search.query && (search.isTyping || isLoading || isFetching),
    );

    useEffect(() => {
      if (search.isTyping) {
        setIsSearchLoading(true);
      } else if (!isLoading && !isFetching) {
        setIsSearchLoading(false);
      } else if (!!search.query && (isLoading || isFetching)) {
        setIsSearchLoading(true);
      }
    }, [search.query, search.isTyping, isLoading, isFetching]);

    return (
      <>
        <div
          data-testid="nav"
          className={cn(
            'nav active max-w-[320px] flex-shrink-0 transform overflow-x-hidden bg-surface-primary-alt transition-all duration-200 ease-in-out',
            'md:max-w-[260px]',
          )}
          style={{
            width: navVisible ? navWidth : '0px',
            transform: navVisible ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          <div className="h-full w-[320px] md:w-[260px]">
            <div className="flex h-full flex-col">
              <div
                className={`flex h-full flex-col transition-opacity duration-200 ease-in-out ${navVisible ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="flex h-full flex-col">
                  <nav
                    id="chat-history-nav"
                    aria-label={localize('com_ui_chat_history')}
                    className="flex h-full flex-col px-2 pb-3.5 md:px-3"
                  >
                    <div className="flex flex-1 flex-col" ref={outerContainerRef}>
                      <MemoNewChat
                        subHeaders={subHeaders}
                        toggleNav={toggleNavVisible}
                        headerButtons={headerButtons}
                        isSmallScreen={isSmallScreen}
                      />
                      {mappedKBs.length > 0 && (
                        <div className="mb-2" data-testid="knowledgebase-nav">
                          {mappedKBs.map((kb) => {
                            // Check if this KB is the active one based on URL params
                            const isActive = activeKBId === kb.id;
                            return (
                              <details key={kb.id} className="px-2">
                                <summary
                                  className={`cursor-pointer list-none text-sm font-medium text-text-primary ${isActive ? "bg-surface-active" : ""}`}
                                  onClick={() => navigate(`/knowledge-bases/${encodeURIComponent(kb.id)}/c`)}
                                >
                                  {kb.name}
                                </summary>
                                <ul className="ml-4 mt-1 space-y-1 text-sm text-text-secondary">
                                  {kb.conversations.map((c) => (
                                    <li key={c.id}>
                                      <Link to={`/knowledge-bases/${encodeURIComponent(kb.id)}/c/${c.id}`}>{c.title}</Link>
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            );
                          })}
                        </div>
                      )}
                      {/*<Conversations
                        conversations={conversations}
                        moveToTop={moveToTop}
                        toggleNav={itemToggleNav}
                        containerRef={listRef}
                        loadMoreConversations={loadMoreConversations}
                        isLoading={isFetchingNextPage || showLoading || isLoading}
                        isSearchLoading={isSearchLoading}
                      />*/}
                    </div>
                    <Suspense fallback={null}>
                      <AccountSettings />
                    </Suspense>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isSmallScreen && <NavMask navVisible={navVisible} toggleNavVisible={toggleNavVisible} />}
      </>
    );
  },
);

Nav.displayName = 'Nav';

export default Nav;
