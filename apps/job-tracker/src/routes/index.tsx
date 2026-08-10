import { createFileRoute } from '@tanstack/react-router';
import { JobTrackerDashboard } from '../components/job-tracker-dashboard';

export const Route = createFileRoute('/')({ component: JobTrackerDashboard });
