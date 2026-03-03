import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, submitTask } from '../../api/services/task.service';
import { uploadFile } from '../../api/services/upload.service';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import FileUpload from '../../components/common/FileUpload';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

export default function SubmitTask() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await getTaskById(taskId);
        setTask(res.data.task);
      } catch (err) {
        toast.error('Failed to load task');
        navigate('/volunteer/tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');

    setSubmitting(true);
    try {
      // Upload file to Cloudinary
      const uploadRes = await uploadFile(file);
      const { url, publicId, fileType } = uploadRes.data;

      // Submit task with file URL
      await submitTask(taskId, { fileUrl: url, publicId, fileType, notes });
      toast.success('Task submitted successfully!');
      navigate('/volunteer/tasks');
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!task) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/volunteer/tasks')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to tasks
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit Task</h1>

      {/* Task Info */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">{task.title}</h2>
          <Badge className={STATUS_COLORS[task.status]}>{task.status}</Badge>
        </div>
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>Deadline: {formatDate(task.deadline)}</span>
          <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
        </div>
        {task.rejectionReason && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700"><strong>Previous rejection:</strong> {task.rejectionReason}</p>
          </div>
        )}
      </Card>

      {/* Previous Submissions */}
      {task.submissions?.length > 0 && (
        <Card className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Previous Submissions</h3>
          <div className="space-y-2">
            {task.submissions.map((sub, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline truncate">
                  Submission #{i + 1}
                </a>
                <span className="text-xs text-gray-400">{formatDate(sub.uploadedAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Submit Form */}
      <Card>
        <h3 className="font-medium text-gray-900 mb-4">New Submission</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUpload
            onFileSelect={setFile}
            accept={{
              'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
              'application/pdf': ['.pdf'],
              'application/msword': ['.doc'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            }}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your submission..."
            />
          </div>
          <Button type="submit" loading={submitting} className="w-full">
            Submit Task
          </Button>
        </form>
      </Card>
    </div>
  );
}
