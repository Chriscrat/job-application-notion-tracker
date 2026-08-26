import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { useMemo, useState, type SubmitEvent } from 'react';

import { Chatbot } from '../../../../packages/chatbot/src/index';

import { createJobTrackerCommands } from '../lib/chatbot-commands';
import { createJobEntry, deleteJobEntry, getJobs, updateJobEntry, updateJobEntryStatus } from '../lib/jobs.functions';
import { getSession, login, logout } from '../lib/auth.functions';
import { MOTIVES, STATUSES, type Job, type JobInput, type JobMotive, type JobStatus } from '../lib/job-types';

const STATUS_META: Record<JobStatus, { short: string; tone: string }> = {
    'In wait': { short: 'Waiting', tone: 'waiting' },
    Accepted: { short: 'Accepted', tone: 'accepted' },
    'No answer': { short: 'Ghosted', tone: 'ghosted' },
    Refused: { short: 'Closed', tone: 'refused' },
    'HR interview': { short: 'HR interview', tone: 'hr' },
    'Tech Interview': { short: 'Tech interview', tone: 'tech' },
    Network: { short: 'Network', tone: 'network' },
};

const statusColumns: JobStatus[] = ['In wait', 'HR interview', 'Tech Interview', 'Accepted', 'No answer', 'Refused', 'Network'];

const emptyJob: JobInput = {
    title: '',
    comments: '',
    applicationDate: new Date().toISOString().slice(0, 10),
    interviewDate: null,
    hrInterview: false,
    techInterview: false,
    motive: 'To complete',
    status: 'In wait',
    url: null,
};

function toDateInput(value: string | null | undefined) {
    return value ? value.slice(0, 10) : '';
}

function jobToInput(job: Job): JobInput {
    return {
        title: job.title,
        comments: job.comments,
        applicationDate: toDateInput(job.applicationDate),
        interviewDate: toDateInput(job.interviewDate),
        hrInterview: job.hrInterview,
        techInterview: job.techInterview,
        motive: job.motive ?? 'To complete',
        status: job.status,
        url: job.url,
    };
}

function dateLabel(date: string | null) {
    if (!date) return 'No date';
    return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(new Date(date));
}

function isFollowUpDue(message: string) {
    return /today|relance|follow.?up|jour/i.test(message);
}

export function JobTrackerDashboard() {
    const queryClient = useQueryClient();
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<JobStatus | 'All'>('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [form, setForm] = useState<JobInput>(emptyJob);
    const chatbotCommands = useMemo(() => createJobTrackerCommands(), []);

    const sessionQuery = useQuery({ queryKey: ['session'], queryFn: () => getSession() });
    const jobsQuery = useQuery({
        queryKey: ['jobs'],
        queryFn: () => getJobs(),
        enabled: sessionQuery.data?.authenticated === true,
    });
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['jobs'] });
    const createMutation = useMutation({ mutationFn: createJobEntry, onSuccess: invalidate });
    const updateMutation = useMutation({ mutationFn: updateJobEntry, onSuccess: invalidate });
    const statusMutation = useMutation({
        mutationFn: updateJobEntryStatus,
        onMutate: async ({ data }) => {
            await queryClient.cancelQueries({ queryKey: ['jobs'] });
            const previousJobs = queryClient.getQueryData<Job[]>(['jobs']);
            queryClient.setQueryData<Job[]>(['jobs'], (current) =>
                current?.map((job) => (job.id === data.id ? { ...job, status: data.status } : job)),
            );
            return { previousJobs };
        },
        onError: (_error, _variables, context) => {
            queryClient.setQueryData(['jobs'], context?.previousJobs);
        },
        onSettled: invalidate,
    });
    const deleteMutation = useMutation({ mutationFn: deleteJobEntry, onSuccess: invalidate });
    const logoutMutation = useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            queryClient.setQueryData(['session'], { authenticated: false });
            queryClient.removeQueries({ queryKey: ['jobs'] });
        },
    });

    const jobs = jobsQuery.data ?? [];
    const filteredJobs = useMemo(
        () =>
            jobs.filter(
                (job) => (statusFilter === 'All' || job.status === statusFilter) && job.title.toLowerCase().includes(query.toLowerCase()),
            ),
        [jobs, query, statusFilter],
    );
    const interviews = jobs.filter((job) => job.interviewDate).length;
    const followUps = jobs.filter((job) => job.followUpMessage && isFollowUpDue(job.followUpMessage)).length;
    const active = jobs.filter((job) => !['Accepted', 'Refused'].includes(job.status)).length;
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    function updateStatus(id: string, status: JobStatus) {
        const currentStatus = queryClient.getQueryData<Job[]>(['jobs'])?.find((job) => job.id === id)?.status;
        if (currentStatus !== status) statusMutation.mutate({ data: { id, status } });
    }

    function handleDragEnd({ active, over }: DragEndEvent) {
        if (!over || typeof active.id !== 'string' || typeof over.id !== 'string') return;
        if ((STATUSES as readonly string[]).includes(over.id)) {
            updateStatus(active.id, over.id as JobStatus);
        }
    }

    function openCreateForm() {
        setEditingJob(null);
        setForm(emptyJob);
        setIsFormOpen(true);
    }

    function openEditForm(job: Job) {
        setEditingJob(job);
        setForm(jobToInput(job));
        setIsFormOpen(true);
    }

    async function submitForm(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const payload = {
            ...form,
            applicationDate: form.applicationDate || null,
            interviewDate: form.interviewDate || null,
            url: form.url || null,
        };
        if (editingJob) {
            await updateMutation.mutateAsync({ data: { id: editingJob.id, job: payload } });
        } else {
            await createMutation.mutateAsync({ data: payload });
        }
        setIsFormOpen(false);
    }

    function changeForm<Key extends keyof JobInput>(key: Key, value: JobInput[Key]) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    if (sessionQuery.isLoading) {
        return <main className="loading-shell">Securing your job desk…</main>;
    }

    if (sessionQuery.error) {
        return (
            <main className="setup-shell">
                <div className="setup-card">
                    <span className="eyebrow">Authentication setup needed</span>
                    <h1>Your private desk needs its credentials.</h1>
                    <pre>{String(sessionQuery.error instanceof Error ? sessionQuery.error.message : sessionQuery.error)}</pre>
                </div>
            </main>
        );
    }

    if (!sessionQuery.data?.authenticated) {
        return <LoginScreen onAuthenticated={() => sessionQuery.refetch()} />;
    }

    if (jobsQuery.isLoading) {
        return <main className="loading-shell">Loading your application desk…</main>;
    }

    if (jobsQuery.error) {
        return (
            <main className="setup-shell">
                <div className="setup-card">
                    <span className="eyebrow">Notion connection needed</span>
                    <h1>Your job desk is ready.</h1>
                    <p>
                        Add your Notion token and data-source ID to <code>.env.local</code>, then restart the development server.
                    </p>
                    <pre>{String(jobsQuery.error instanceof Error ? jobsQuery.error.message : jobsQuery.error)}</pre>
                </div>
            </main>
        );
    }

    return (
        <main className="app-shell">
            <header className="topbar">
                <a
                    className="brand"
                    href="/"
                    aria-label="Job desk home"
                >
                    <span className="brand-mark">J</span>
                    <span>Job desk</span>
                </a>
                <div className="topbar-actions">
                    <span className="sync-dot">Live from Notion</span>
                    <button className="button button-quiet sign-out" onClick={() => logoutMutation.mutate()} type="button">
                        Sign out
                    </button>
                    <button
                        className="button button-primary"
                        onClick={openCreateForm}
                        type="button"
                    >
                        <span>+</span> Add opportunity
                    </button>
                </div>
            </header>

            <section className="hero">
                <div>
                    <p className="eyebrow">Your personal pipeline</p>
                    <h1>Keep the right conversations moving.</h1>
                    <p className="hero-copy">A calm, tactical view of every application, interview, and next move.</p>
                </div>
                <p className="date-stamp">
                    {new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}
                </p>
            </section>

            <section
                className="metrics"
                aria-label="Application statistics"
            >
                <Metric
                    label="Active pipeline"
                    value={active}
                    note="applications in motion"
                    accent="orange"
                />
                <Metric
                    label="Follow-ups"
                    value={followUps}
                    note="need a nudge"
                    accent="pink"
                />
                <Metric
                    label="Interviews"
                    value={interviews}
                    note="scheduled so far"
                    accent="blue"
                />
                <Metric
                    label="Accepted"
                    value={jobs.filter((job) => job.status === 'Accepted').length}
                    note="great work"
                    accent="green"
                />
            </section>

            <section className="workspace">
                <div className="toolbar">
                    <div className="search-wrap">
                        <span aria-hidden="true">⌕</span>
                        <input
                            aria-label="Search applications"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search company or role"
                        />
                    </div>
                    <div
                        className="filter-row"
                        aria-label="Status filters"
                    >
                        <button
                            className={statusFilter === 'All' ? 'filter active' : 'filter'}
                            onClick={() => setStatusFilter('All')}
                            type="button"
                        >
                            All <span>{jobs.length}</span>
                        </button>
                        {(['In wait', 'HR interview', 'Tech Interview', 'No answer'] as JobStatus[]).map((status) => (
                            <button
                                className={statusFilter === status ? 'filter active' : 'filter'}
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                type="button"
                            >
                                {STATUS_META[status].short}
                            </button>
                        ))}
                    </div>
                </div>

                <DndContext
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                >
                    <div
                        className="board"
                        aria-label="Applications by status"
                    >
                        {statusColumns.map((status) => (
                            <StatusColumn
                                key={status}
                                status={status}
                                jobs={filteredJobs.filter((job) => job.status === status)}
                                isUpdating={statusMutation.isPending}
                                onDelete={(job) => {
                                    if (window.confirm(`Delete "${job.title}" from Notion?`)) {
                                        deleteMutation.mutate({ data: { id: job.id } });
                                    }
                                }}
                                onEdit={openEditForm}
                                onStatusChange={(job, nextStatus) => updateStatus(job.id, nextStatus)}
                            />
                        ))}
                    </div>
                </DndContext>
            </section>

            {isFormOpen && (
                <div
                    className="modal-backdrop"
                    role="presentation"
                >
                    <form
                        className="job-form"
                        onSubmit={submitForm}
                    >
                        <div className="form-heading">
                            <div>
                                <p className="eyebrow">{editingJob ? 'Edit opportunity' : 'New opportunity'}</p>
                                <h2>{editingJob ? 'Refine the record' : 'Add it to the desk'}</h2>
                            </div>
                            <button
                                className="icon-button"
                                onClick={() => setIsFormOpen(false)}
                                type="button"
                                aria-label="Close form"
                            >
                                ×
                            </button>
                        </div>
                        <label>
                            Company & role
                            <input
                                autoFocus
                                required
                                value={form.title}
                                onChange={(event) => changeForm('title', event.target.value)}
                                placeholder="e.g. Acme — Senior Frontend Engineer"
                            />
                        </label>
                        <div className="form-grid">
                            <label>
                                Status
                                <select
                                    value={form.status}
                                    onChange={(event) => changeForm('status', event.target.value as JobStatus)}
                                >
                                    {STATUSES.map((status) => (
                                        <option key={status}>{status}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Applied on
                                <input
                                    type="date"
                                    value={toDateInput(form.applicationDate)}
                                    onChange={(event) => changeForm('applicationDate', event.target.value || null)}
                                />
                            </label>
                            <label>
                                Interview date
                                <input
                                    type="date"
                                    value={toDateInput(form.interviewDate)}
                                    onChange={(event) => changeForm('interviewDate', event.target.value || null)}
                                />
                            </label>
                            <label>
                                Outcome
                                <select
                                    value={form.motive ?? ''}
                                    onChange={(event) => changeForm('motive', (event.target.value as JobMotive) || null)}
                                >
                                    <option value="">Not set</option>
                                    {MOTIVES.map((motive) => (
                                        <option key={motive}>{motive}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <label>
                            Job-offer URL
                            <input
                                type="url"
                                value={form.url ?? ''}
                                onChange={(event) => changeForm('url', event.target.value || null)}
                                placeholder="https://…"
                            />
                        </label>
                        <label>
                            Notes
                            <textarea
                                value={form.comments ?? ''}
                                onChange={(event) => changeForm('comments', event.target.value)}
                                placeholder="Context, contacts, prep notes…"
                                rows={4}
                            />
                        </label>
                        <div className="checkbox-row">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={form.hrInterview ?? false}
                                    onChange={(event) => changeForm('hrInterview', event.target.checked)}
                                />{' '}
                                HR interview done
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={form.techInterview ?? false}
                                    onChange={(event) => changeForm('techInterview', event.target.checked)}
                                />{' '}
                                Technical interview done
                            </label>
                        </div>
                        <div className="form-actions">
                            <button
                                className="button button-quiet"
                                onClick={() => setIsFormOpen(false)}
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                className="button button-primary"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                type="submit"
                            >
                                {editingJob ? 'Save changes' : 'Create opportunity'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <div className='chatbot'>
                <Chatbot
                    commands={chatbotCommands}
                    persistMessages
                    appId="job-tracker"
                />
            </div>
        </main>
    );
}

function Metric({ label, value, note, accent }: { label: string; value: number; note: string; accent: string }) {
    return (
        <article className={`metric-card ${accent}`}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{note}</span>
        </article>
    );
}

function LoginScreen({ onAuthenticated }: { onAuthenticated: () => Promise<unknown> }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const loginMutation = useMutation({ mutationFn: login });

    async function submit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const result = await loginMutation.mutateAsync({ data: { username, password } });
        if (result.authenticated) await onAuthenticated();
    }

    return (
        <main className="login-shell">
            <section className="login-card">
                <div className="login-mark">J</div>
                <p className="eyebrow">Private job desk</p>
                <h1>Welcome back.</h1>
                <p className="login-copy">Your applications stay behind this private door.</p>
                <form onSubmit={submit} className="login-form">
                    <label>
                        Username
                        <input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
                    </label>
                    <label>
                        Password
                        <input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                    </label>
                    {loginMutation.data && !loginMutation.data.authenticated && <p className="login-error">Incorrect username or password.</p>}
                    {loginMutation.error && <p className="login-error">Unable to sign in. Please try again.</p>}
                    <button className="button button-primary login-button" disabled={loginMutation.isPending} type="submit">
                        {loginMutation.isPending ? 'Signing in…' : 'Unlock job desk'}
                    </button>
                </form>
            </section>
        </main>
    );
}

function StatusColumn({
    status,
    jobs,
    isUpdating,
    onDelete,
    onEdit,
    onStatusChange,
}: {
    status: JobStatus;
    jobs: Job[];
    isUpdating: boolean;
    onDelete: (job: Job) => void;
    onEdit: (job: Job) => void;
    onStatusChange: (job: Job, status: JobStatus) => void;
}) {
    const { isOver, setNodeRef } = useDroppable({ id: status });

    return (
        <section
            ref={setNodeRef}
            className={`board-column ${STATUS_META[status].tone} ${isOver ? 'drop-target' : ''}`}
        >
            <header className="column-header">
                <div>
                    <span className="status-orb" /> {STATUS_META[status].short}
                </div>
                <span>{jobs.length}</span>
            </header>
            <div className="cards">
                {jobs.map((job) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        isUpdating={isUpdating}
                        onDelete={() => onDelete(job)}
                        onEdit={() => onEdit(job)}
                        onStatusChange={(nextStatus) => onStatusChange(job, nextStatus)}
                    />
                ))}
                {jobs.length === 0 && <p className="empty-column">Drop an opportunity here</p>}
            </div>
        </section>
    );
}

function JobCard({
    job,
    onEdit,
    onDelete,
    onStatusChange,
    isUpdating,
}: {
    job: Job;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: (status: JobStatus) => void;
    isUpdating: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: job.id });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

    return (
        <article
            ref={setNodeRef}
            style={style}
            className={`job-card ${isDragging ? 'dragging' : ''}`}
        >
            <button
                className="drag-handle"
                type="button"
                aria-label={`Drag ${job.title}`}
                {...listeners}
                {...attributes}
            >
                ⠿
            </button>
            <div className="card-menu">
                <button
                    type="button"
                    onClick={onEdit}
                    aria-label={`Edit ${job.title}`}
                >
                    •••
                </button>
            </div>
            <h3>{job.title}</h3>
            <div className="card-details">
                {job.interviewDate && (
                    <span>
                        ◷ Interview <span className="badge">{dateLabel(job.interviewDate)}</span>
                    </span>
                )}
                {job.followUpMessage && (
                    <span className={isFollowUpDue(job.followUpMessage) ? 'follow-up due' : 'follow-up'}>↗ {job.followUpMessage}</span>
                )}
                {(job.hrInterview || job.techInterview) && (
                    <span>
                        ◉ {job.hrInterview ? 'HR' : ''}
                        {job.hrInterview && job.techInterview ? ' + ' : ''}
                        {job.techInterview ? 'Tech' : ''}
                    </span>
                )}
            </div>
            <div className="card-footer">
                {job.url ? (
                    <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Offer ↗
                    </a>
                ) : (
                    <span>Applied {dateLabel(job.applicationDate)}</span>
                )}
                <select
                    aria-label={`Change ${job.title} status`}
                    disabled={isUpdating}
                    value={job.status}
                    onChange={(event) => onStatusChange(event.target.value as JobStatus)}
                >
                    {STATUSES.map((status) => (
                        <option key={status}>{status}</option>
                    ))}
                </select>
            </div>
            <button
                className="delete-link"
                onClick={onDelete}
                type="button"
            >
                Delete
            </button>
        </article>
    );
}
