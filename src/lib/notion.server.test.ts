import { describe, expect, it } from 'vitest';

import { pageToJob, toJobStatus } from './notion.server';

describe('pageToJob', () => {
    it.each([
        ['En attente', 'In wait'],
        ['Accepté', 'Accepted'],
        ['Sans réponse', 'No answer'],
        ['Refusée', 'Refused'],
        ['Entretien RH', 'HR interview'],
        ['Entretien technique', 'Tech Interview'],
        ['Réseau', 'Network'],
    ] as const)('maps %s to the %s application column', (notionStatus, appStatus) => {
        expect(toJobStatus(notionStatus)).toBe(appStatus);
    });

    it('maps the configured Notion property names into an application', () => {
        const job = pageToJob({
            object: 'page',
            id: '345a3eb9-3278-4d6b-958e-b7d0a1e605af',
            created_time: '2026-07-01T00:00:00.000Z',
            last_edited_time: '2026-07-08T00:00:00.000Z',
            archived: false,
            in_trash: false,
            url: 'https://notion.so/example',
            parent: { type: 'data_source_id', data_source_id: 'source-id', database_id: 'database-id' },
            properties: {
                Titre: {
                    id: 'title',
                    type: 'title',
                    title: [
                        {
                            type: 'text',
                            text: { content: 'Acme — Senior Engineer', link: null },
                            plain_text: 'Acme — Senior Engineer',
                            annotations: {
                                bold: false,
                                italic: false,
                                strikethrough: false,
                                underline: false,
                                code: false,
                                color: 'default',
                            },
                            href: null,
                        },
                    ],
                },
                Commentaires: {
                    id: 'notes',
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: { content: 'Warm introduction.', link: null },
                            plain_text: 'Warm introduction.',
                            annotations: {
                                bold: false,
                                italic: false,
                                strikethrough: false,
                                underline: false,
                                code: false,
                                color: 'default',
                            },
                            href: null,
                        },
                    ],
                },
                'Date candidature': { id: 'applied', type: 'date', date: { start: '2026-07-01', end: null, time_zone: null } },
                'Date entretien': { id: 'interview', type: 'date', date: { start: '2026-07-12', end: null, time_zone: null } },
                'Entretien RH ?': { id: 'hr', type: 'checkbox', checkbox: true },
                'Entretien tech ?': { id: 'tech', type: 'checkbox', checkbox: false },
                Motif: { id: 'motive', type: 'select', select: { id: 'option', name: 'To complete', color: 'default' } },
                Statut: { id: 'status', type: 'select', select: { id: 'option', name: 'HR interview', color: 'default' } },
                'Nbr de relance': { id: 'count', type: 'number', number: 2 },
                URL: { id: 'url', type: 'url', url: 'https://acme.test/jobs/1' },
                '📲 Entretiens': { id: 'relation', type: 'relation', relation: [{ id: 'linked-page' }], has_more: false },
                'Compte a rebours relance': { id: 'formula', type: 'formula', formula: { type: 'string', string: 'Follow up today' } },
            },
        } as never);

        expect(job).toMatchObject({
            title: 'Acme — Senior Engineer',
            comments: 'Warm introduction.',
            status: 'HR interview',
            followUpCount: 2,
            hrInterview: true,
            followUpMessage: 'Follow up today',
            interviewRelationCount: 1,
        });
    });
});
