import { useState, useEffect } from 'react';
import { getAllTasks, approveTask, rejectTask } from '../../api/services/task.service';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { Check, X, Eye } from 'lucide-react';
import { STATUS_COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

export default function ReviewSubmissions() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getAllTasks({ status: 'submitted', limit: 100 });
      setTasks(res.data.tasks);
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleApprove = async (id) => {
    try {
      await approveTask(id);
      toast.success('Task approved');
      fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error('Provide a rejection reason');
    try {
      await rejectTask(rejectModal, { rejectionReason: rejectReason });
      toast.success('Task rejected');
      setRejectModal(null);
      setRejectReason('');
      fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to reject');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Review Submissions</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : tasks.length === 0 ? (
        <Card><p className="text-gray-500 text-center py-8">No submissions to review.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <Card key={task._id}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                <Badge className={STATUS_COLORS[task.status]}>{task.status}</Badge>
              </div>
              <p className="text-sm text-gray-500 mb-2">By: {task.assignedTo?.name}</p>
              <p className="text-xs text-gray-400 mb-3">Event: {task.event?.title || '-'}</p>

              {task.submissions?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">Latest submission:</p>
                  <a
                    href={task.submissions[task.submissions.length - 1].fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline truncate block"
                  >
                    View file
                  </a>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowDetail(task)}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> Details
                </Button>
                <Button size="sm" variant="success" onClick={() => handleApprove(task._id)}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => { setRejectModal(task._id); setRejectReason(''); }}>
                  <X className="h-3.5 w-3.5 mr-1" /> Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.title || ''} size="lg">
        {showDetail && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{showDetail.description}</p>
            <p className="text-sm"><strong>Assigned to:</strong> {showDetail.assignedTo?.name}</p>
            <p className="text-sm"><strong>Deadline:</strong> {formatDate(showDetail.deadline)}</p>
            {showDetail.submissions?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">All Submissions</h4>
                <div className="space-y-2">
                  {showDetail.submissions.map((sub, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                        View file ({sub.fileType})
                      </a>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(sub.uploadedAt)}</p>
                      {sub.notes && <p className="text-xs text-gray-500 mt-1">{sub.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Submission">
        <div className="space-y-4">
          <textarea
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why this submission was rejected..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject}>Reject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
