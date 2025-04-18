
// import React, { useState } from 'react';
// import Sidebar from './Sidebar';
// import Header from './Header';
// import { cn } from '@/lib/utils';
// import { useIsMobile } from '@/hooks/use-mobile';

// interface LayoutProps {
//   children: React.ReactNode;
// }

// const Layout: React.FC<LayoutProps> = ({ children }) => {
//   const isMobile = useIsMobile();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

//   const toggleMobileSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   return (
//     <div className="min-h-screen flex">
//       <div 
//         className={cn(
//           "fixed inset-0 z-40 transition-opacity bg-background/80 backdrop-blur-sm md:hidden",
//           isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
//         )}
//         onClick={() => setIsSidebarOpen(false)}
//       />
      
//       <div 
//         className={cn(
//           "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:relative md:z-0",
//           isSidebarOpen ? "translate-x-0" : "-translate-x-full"
//         )}
//       >
//         <Sidebar />
//       </div>
      
//       <div className="flex-1 flex flex-col min-h-screen">
//         <div className="sticky top-0 z-30">
//           <Header toggleMobileSidebar={toggleMobileSidebar} />
//         </div>
//         <main className="flex-1 p-4 md:p-6 overflow-y-auto">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;



import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const toggleMobileSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex">
      {/* Overlay for mobile */}
      <div 
        className={cn(
          "fixed inset-0 z-40 transition-opacity bg-background/80 backdrop-blur-sm md:hidden",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      {/* Sidebar - now fixed positioned */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar />
      </div>
      
      {/* Main content area with margin for sidebar */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <div className="sticky top-0 z-30">
          <Header toggleMobileSidebar={toggleMobileSidebar} />
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;