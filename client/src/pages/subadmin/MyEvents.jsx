import { useState, useEffect } from 'react';
import { getAllEvents } from '../../api/services/event.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { PHASE_COLORS, PHASE_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getAllEvents({ limit: 100 });
        setEvents(res.data.events);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Events</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : events.length === 0 ? (
        <Card><p className="text-gray-500 text-center py-8">No events found for your club.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event._id}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                <Badge className={PHASE_COLORS[event.phase]}>{PHASE_LABELS[event.phase]}</Badge>
              </div>
              <p className="text-sm text-gray-500 line-clamp-3 mb-3">{event.description}</p>
              <p className="text-xs text-gray-400">Created {formatDate(event.createdAt)}</p>
              {event.isFinalized && <Badge className="mt-2 bg-green-100 text-green-800">Finalized</Badge>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
