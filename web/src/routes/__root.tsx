import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '../components/sidebar';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

const queryClient = new QueryClient();

const RootLayout = () => (
    <QueryClientProvider client={queryClient}>
        <div className='h-screen bg-zinc-900'>
            <PanelGroup direction="horizontal">
                <Panel defaultSize={20} minSize={15} maxSize={40}>
                    <Sidebar />
                </Panel>

                <PanelResizeHandle className='w-px bg-zinc-800 hover:bg-zinc-600 transition-colors duration-150' />

                <Panel defaultSize={80} minSize={60} maxSize={85}>
                    <Outlet />
                </Panel>
            </PanelGroup>
        </div>

    </QueryClientProvider>
)

export const Route = createRootRoute({ component: RootLayout })
