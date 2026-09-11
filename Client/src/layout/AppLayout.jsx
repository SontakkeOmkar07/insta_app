import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MobileNavbar } from '../components/layout/MobileNavbar';
import { StoryViewer } from '../components/stories/StoryViewer';
import { CreatePostModal } from '../components/posts/CreatePostModel';
import { CreateStoryModal } from '../components/stories/CreateStoryModal';
import { Toast } from '../components/common/Toast';
import { AppRoutes } from '../routes/AppRoutes';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';

export const AppLayout = () => {
  const location = useLocation();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans antialiased selection:bg-sky-500 selection:text-white">
      {!isAuthPage && (
        <>
          {/* Desktop Left Sidebar */}
          <Sidebar onCreatePostClick={() => setIsCreatePostOpen(true)} />

          {/* Mobile Top Header */}
          <Header onCreatePostClick={() => setIsCreatePostOpen(true)} />
        </>
      )}

      {/* Main Viewport Content */}
      <div
        className={
          !isAuthPage
            ? 'min-w-0 md:pl-16 xl:pl-64 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0'
            : 'min-w-0'
        }
      >
        <AppRoutes onCreateStoryClick={() => setIsCreateStoryOpen(true)} />
      </div>

      {!isAuthPage && (
        <>
          {/* Mobile Bottom Navigation */}
          <MobileNavbar onCreatePostClick={() => setIsCreatePostOpen(true)} />
        </>
      )}

      {/* Global Modals & Overlays */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />

      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
      />

      <StoryViewer />
      <Toast />
    </div>
  );
};
