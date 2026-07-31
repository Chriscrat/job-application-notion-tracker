import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { MOTIVES, STATUSES } from './job-types';
import { archiveJob, createJob, listJobs, updateJob, updateJobStatus } from './notion.server';
import { requireSession } from './auth.server';

const jobInputSchema = z.object({
    title: z.string().trim().min(1, 'A company and role title is required.'),
    comments: z.string().optional(),
    applicationDate: z.string().nullable().optional(),
    interviewDate: z.string().nullable().optional(),
    hrInterview: z.boolean().optional(),
    techInterview: z.boolean().optional(),
    motive: z.enum(MOTIVES).nullable().optional(),
    status: z.enum(STATUSES).optional(),
    url: z.string().url('Enter a complete URL, including https://').nullable().optional(),
});

export const getJobs = createServerFn({ method: 'GET' }).handler(async () => {
    await requireSession();
    return listJobs();
});

export const createJobEntry = createServerFn({ method: 'POST' })
    .validator(jobInputSchema)
    .handler(async ({ data }) => {
        await requireSession();
        return createJob(data);
    });

export const updateJobEntry = createServerFn({ method: 'POST' })
    .validator(z.object({ id: z.string().uuid(), job: jobInputSchema }))
    .handler(async ({ data }) => {
        await requireSession();
        return updateJob(data.id, data.job);
    });

export const updateJobEntryStatus = createServerFn({ method: 'POST' })
    .validator(z.object({ id: z.string().uuid(), status: z.enum(STATUSES) }))
    .handler(async ({ data }) => {
        await requireSession();
        return updateJobStatus(data.id, data.status);
    });

export const deleteJobEntry = createServerFn({ method: 'POST' })
    .validator(z.object({ id: z.string().uuid() }))
    .handler(async ({ data }) => {
        await requireSession();
        return archiveJob(data.id);
    });
