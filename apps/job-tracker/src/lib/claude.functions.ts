import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { getCandidateProfileContext } from './notion.server';
import { requireSession } from './auth.server';
import { runOfferAnalysis } from './claude.server';

const analyzeOfferSchema = z.object({
    content: z.string().trim().min(50, "Le contenu de l'offre est trop court."),
});

export const analyzeJobOffer = createServerFn({ method: 'POST' })
    .validator(analyzeOfferSchema)
    .handler(async ({ data }) => {
        await requireSession();

        const profileContext = await getCandidateProfileContext();
        const analysis = await runOfferAnalysis(data.content, profileContext);
        return { analysis };
    });
