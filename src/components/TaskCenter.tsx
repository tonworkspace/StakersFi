import { FC, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { FaHeadset, FaNewspaper } from 'react-icons/fa';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  type: 'news' | 'update' | 'announcement';
}

interface SupportTicket {
  id: number;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
}

const TaskCenter: FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'news' | 'support'>('news');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 'news') {
          const { data } = await supabase
            .from('news')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
          setNews(data || []);
        } else {
          const { data } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });
          setTickets(data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, user?.id]);

  const renderNewsItem = (item: NewsItem) => (
    <div key={item.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            item.type === 'news' ? 'bg-blue-500/20' :
            item.type === 'update' ? 'bg-green-500/20' :
            'bg-yellow-500/20'
          }`}>
            <FaNewspaper className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{item.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{item.content}</p>
            <span className="text-xs text-gray-500 mt-2 block">
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSupportTicket = (ticket: SupportTicket) => (
    <div key={ticket.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            ticket.status === 'open' ? 'bg-yellow-500/20' :
            ticket.status === 'in_progress' ? 'bg-blue-500/20' :
            'bg-green-500/20'
          }`}>
            <FaHeadset className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{ticket.subject}</h3>
            <p className="text-sm text-gray-400 mt-1">{ticket.message}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {ticket.status}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(ticket.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            activeTab === 'news' ? 'bg-blue-500' : 'bg-white/5'
          }`}
        >
          <FaNewspaper className="w-4 h-4" />
          <span>News</span>
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            activeTab === 'support' ? 'bg-blue-500' : 'bg-white/5'
          }`}
        >
          <FaHeadset className="w-4 h-4" />
          <span>Support</span>
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'news' ? 
            news.map(renderNewsItem) :
            tickets.map(renderSupportTicket)
          }
        </div>
      )}
    </div>
  );
};

export default TaskCenter; 