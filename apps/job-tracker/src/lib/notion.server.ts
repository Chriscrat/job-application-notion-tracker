import { Client } from '@notionhq/client';
import type { PageObjectResponse, BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import { MOTIVES, STATUSES, type Job, type JobInput, type JobMotive, type JobStatus } from './job-types';

function getNotionClient() {
    const auth = process.env.NOTION_TOKEN;
    if (!auth) {
        throw new Error('NOTION_TOKEN is missing. Add it to your .env.local file.');
    }
    return new Client({ auth });
}

function getApplicationsDataSourceId() {
    const dataSourceId = process.env.NOTION_APPLICATIONS_DATA_SOURCE_ID;
    if (!dataSourceId) {
        throw new Error('NOTION_APPLICATIONS_DATA_SOURCE_ID is missing. Add the copied Notion data source ID to .env.local.');
    }
    return dataSourceId;
}

function getProfilePageId() {
    const id = process.env.NOTION_PROFILE_PAGE_ID;
    if (!id) {
        throw new Error('NOTION_PROFILE_PAGE_ID is missing. Add it to your .env.local file.');
    }
    return id;
}

function getSkillsDataSourceId() {
    const id = process.env.NOTION_SKILLS_DATA_SOURCE_ID;
    if (!id) {
        throw new Error('NOTION_SKILLS_DATA_SOURCE_ID is missing. Add it to your .env.local file.');
    }
    return id;
}

function getExperiencePageId() {
    const id = process.env.NOTION_EXPERIENCE_PAGE_ID;
    if (!id) {
        throw new Error('NOTION_EXPERIENCE_PAGE_ID is missing. Add it to your .env.local file.');
    }
    return id;
}

const text = (property: PageObjectResponse['properties'][string]) =>
    property?.type === 'rich_text' ? property.rich_text.map((item) => item.plain_text).join('') : '';

const title = (property: PageObjectResponse['properties'][string]) =>
    property?.type === 'title' ? property.title.map((item) => item.plain_text).join('') : 'Untitled opportunity';

const select = (property: PageObjectResponse['properties'][string]) => (property?.type === 'select' ? (property.select?.name ?? '') : '');

const isStatus = (value: string | null): value is JobStatus => value !== null && (STATUSES as readonly string[]).includes(value);

const statusAliases: Record<JobStatus, readonly string[]> = {
    'In wait': ['in wait', 'waiting', 'en attente', 'attente', 'en cours', 'en attente de reponse'],
    Accepted: ['accepted', 'accepte', 'acceptee'],
    'No answer': ['no answer', 'sans reponse', 'pas de reponse', 'aucune reponse'],
    Refused: ['refused', 'refuse', 'refusee', 'rejected'],
    'HR interview': ['hr interview', 'entretien rh', 'interview rh', 'entretien hr'],
    'Tech Interview': ['tech interview', 'technical interview', 'entretien technique', 'interview technique', 'entretien tech'],
    Network: ['network', 'reseau', 'reseautage'],
};

const statusToNotionName: Record<JobStatus, string> = {
    'In wait': 'En attente',
    Accepted: 'Accepté',
    'No answer': 'Sans réponse',
    Refused: 'Refusé',
    'HR interview': 'Entretien RH',
    'Tech Interview': 'Entretien technique',
    Network: 'Réseau',
};

function normalize(value: string) {
    return value
        .trim()
        .toLocaleLowerCase('fr')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export function toJobStatus(value: string | null): JobStatus | null {
    if (!value) return null;
    if (isStatus(value)) return value;
    const normalized = normalize(value);
    return STATUSES.find((status) => statusAliases[status].some((alias) => alias === normalized)) ?? null;
}

const isMotive = (value: string | null): value is JobMotive => value !== null && (MOTIVES as readonly string[]).includes(value);

export function pageToJob(page: PageObjectResponse): Job {
    const properties = page.properties;
    const statusValue = properties['Statut']?.type === 'select' ? (properties['Statut'].select?.name ?? null) : null;
    const motiveValue = properties['Motif']?.type === 'select' ? (properties['Motif'].select?.name ?? null) : null;
    const applicationDate = properties['Date candidature']?.type === 'date' ? (properties['Date candidature'].date?.start ?? null) : null;
    const interviewDate = properties['Date entretien']?.type === 'date' ? (properties['Date entretien'].date?.start ?? null) : null;

    return {
        id: page.id,
        title: title(properties['Titre']),
        comments: text(properties['Commentaires']),
        followUpMessage:
            properties['Compte a rebours relance']?.type === 'formula' && properties['Compte a rebours relance'].formula.type === 'string'
                ? (properties['Compte a rebours relance'].formula.string ?? '')
                : '',
        applicationDate,
        interviewDate,
        lastEditedTime: page.last_edited_time,
        hrInterview: properties['Entretien RH ?']?.type === 'checkbox' ? properties['Entretien RH ?'].checkbox : false,
        techInterview: properties['Entretien tech ?']?.type === 'checkbox' ? properties['Entretien tech ?'].checkbox : false,
        motive: isMotive(motiveValue) ? motiveValue : null,
        followUpCount: properties['Nbr de relance']?.type === 'number' ? (properties['Nbr de relance'].number ?? 0) : 0,
        status: toJobStatus(statusValue) ?? 'In wait',
        url: properties['URL']?.type === 'url' ? properties['URL'].url : null,
        interviewRelationCount: properties['📲 Entretiens']?.type === 'relation' ? properties['📲 Entretiens'].relation.length : 0,
    };
}

function jobProperties(input: JobInput, notionStatusName: string) {
    return {
        Titre: { title: [{ text: { content: input.title } }] },
        Commentaires: {
            rich_text: input.comments ? [{ text: { content: input.comments } }] : [],
        },
        'Date candidature': { date: input.applicationDate ? { start: input.applicationDate } : null },
        'Date entretien': { date: input.interviewDate ? { start: input.interviewDate } : null },
        'Entretien RH ?': { checkbox: input.hrInterview ?? false },
        'Entretien tech ?': { checkbox: input.techInterview ?? false },
        Motif: { select: input.motive ? { name: input.motive } : null },
        Statut: { select: { name: notionStatusName } },
        URL: { url: input.url || null },
    };
}

export async function listJobs() {
    const notion = getNotionClient();
    const results: PageObjectResponse[] = [];
    let startCursor: string | undefined;

    do {
        const response = await notion.dataSources.query({
            data_source_id: getApplicationsDataSourceId(),
            page_size: 100,
            start_cursor: startCursor,
            sorts: [{ property: 'Date candidature', direction: 'descending' }],
        });
        results.push(...response.results.filter((result): result is PageObjectResponse => result.object === 'page'));
        startCursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
    } while (startCursor);

    return results.map(pageToJob);
}

async function notionStatusName(notion: Client, status: JobStatus) {
    const dataSource = await notion.dataSources.retrieve({ data_source_id: getApplicationsDataSourceId() });
    const statusProperty = dataSource.properties['Statut'];
    if (statusProperty?.type === 'select') {
        const matchingOption = statusProperty.select.options.find((option) => toJobStatus(option.name) === status);
        if (matchingOption) return matchingOption.name;
    }
    return statusToNotionName[status];
}

export async function createJob(input: JobInput) {
    const notion = getNotionClient();
    const status = input.status ?? 'In wait';
    await notion.pages.create({
        parent: { type: 'data_source_id', data_source_id: getApplicationsDataSourceId() },
        properties: jobProperties(input, await notionStatusName(notion, status)),
    });
}

export async function updateJob(id: string, input: JobInput) {
    const notion = getNotionClient();
    const status = input.status ?? 'In wait';
    await notion.pages.update({
        page_id: id,
        properties: jobProperties(input, await notionStatusName(notion, status)),
    });
}

export async function updateJobStatus(id: string, status: JobStatus) {
    const notion = getNotionClient();
    await notion.pages.update({
        page_id: id,
        properties: { Statut: { select: { name: await notionStatusName(notion, status) } } },
    });
}

export async function archiveJob(id: string) {
    const notion = getNotionClient();
    await notion.pages.update({ page_id: id, in_trash: true });
}

type RichText = ReadonlyArray<{ plain_text: string }>;

const richText = (items: RichText) => items.map((item) => item.plain_text).join('');

function blockToLine(block: BlockObjectResponse): string {
    switch (block.type) {
        case 'paragraph':
            return richText(block.paragraph.rich_text);
        case 'heading_1':
            return `# ${richText(block.heading_1.rich_text)}`;
        case 'heading_2':
            return `## ${richText(block.heading_2.rich_text)}`;
        case 'heading_3':
            return `### ${richText(block.heading_3.rich_text)}`;
        case 'bulleted_list_item':
            return `- ${richText(block.bulleted_list_item.rich_text)}`;
        case 'numbered_list_item':
            return `- ${richText(block.numbered_list_item.rich_text)}`;
        case 'quote':
            return `> ${richText(block.quote.rich_text)}`;
        case 'callout':
            return richText(block.callout.rich_text);
        case 'to_do':
            return `- [${block.to_do.checked ? 'x' : ' '}] ${richText(block.to_do.rich_text)}`;
        default:
            return '';
    }
}

export async function getPageText(pageId: string): Promise<string> {
    const notion = getNotionClient();
    const lines: string[] = [];
    let startCursor: string | undefined;

    do {
        const response = await notion.blocks.children.list({
            block_id: pageId,
            start_cursor: startCursor,
            page_size: 100,
        });
        for (const block of response.results) {
            if (!('type' in block)) continue;
            lines.push(blockToLine(block));
        }
        startCursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
    } while (startCursor);

    return lines.filter(Boolean).join('\n');
}

interface Skill {
    stack: string;
    type: string;
    scope: string;
    mastery: string;
    comments: string;
}

async function getSkills(): Promise<Skill[]> {
    const notion = getNotionClient();
    const results: PageObjectResponse[] = [];
    let startCursor: string | undefined;

    do {
        const response = await notion.dataSources.query({
            data_source_id: getSkillsDataSourceId(),
            page_size: 100,
            start_cursor: startCursor,
        });
        results.push(...response.results.filter((result): result is PageObjectResponse => result.object === 'page'));
        startCursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
    } while (startCursor);

    return results.map((page) => ({
        stack: title(page.properties['Stack']),
        type: select(page.properties['Type']),
        scope: select(page.properties['Scope']),
        mastery: select(page.properties['Mastery']),
        comments: text(page.properties['Comments']),
    }));
}

export async function getCandidateProfileContext(): Promise<string> {
    const [profileText, skills, experienceText] = await Promise.all([
        getPageText(getProfilePageId()),
        getSkills(),
        getPageText(getExperiencePageId()),
    ]);

    const skillsText = skills
        .map((skill) => `- ${skill.stack} (${skill.type}, ${skill.scope}, ${skill.mastery}): ${skill.comments}`)
        .join('\n');

    return ['## Profil', profileText, '## Compétences', skillsText, '## Expérience', experienceText].join('\n\n');
}
