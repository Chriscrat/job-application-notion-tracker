export const STATUSES = ['In wait', 'Accepted', 'No answer', 'Refused', 'HR interview', 'Tech Interview', 'Network'] as const;

export const MOTIVES = [
    'To complete',
    'No offers',
    'Refused by me',
    'Too much candidates',
    'No answer',
    'Not senior enough',
    'Inappropriate',
] as const;

export type JobStatus = (typeof STATUSES)[number];
export type JobMotive = (typeof MOTIVES)[number];

export type Job = {
    id: string;
    title: string;
    comments: string;
    followUpMessage: string;
    applicationDate: string | null;
    interviewDate: string | null;
    lastEditedTime: string;
    hrInterview: boolean;
    techInterview: boolean;
    motive: JobMotive | null;
    followUpCount: number;
    status: JobStatus;
    url: string | null;
    interviewRelationCount: number;
};

export type JobInput = {
    title: string;
    comments?: string;
    applicationDate?: string | null;
    interviewDate?: string | null;
    hrInterview?: boolean;
    techInterview?: boolean;
    motive?: JobMotive | null;
    status?: JobStatus;
    url?: string | null;
};
