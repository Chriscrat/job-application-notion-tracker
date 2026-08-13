import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans l'analyse d'offres d'emploi dans le digital (développeur web).
Analyse l'offre fournie et réponds en français avec la structure suivante :
1. **Entreprise et contexte** : nom, secteur, taille si mentionné.
2. **Poste et responsabilités** : intitulé, missions principales.
3. **Technologies et compétences requises** : liste concise.
4. **Rémunération** : salaire ou fourchette si mentionnée, sinon "Non mentionné".
5. **Points forts de l'offre** : avantages, évolutions possibles.
6. **Points d'attention** : réd flags, exigences ambiguës, incohérences.
Utilise des listes à puces. Sois factuel et direct.`;

export async function runOfferAnalysis(offerContent: string, profileContext: string): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const apiModel = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001';

    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY is missing. Add it to your .env.local file.');
    }

    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
        model: apiModel,
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [
            {
                role: 'user',
                content: `# Profil du candidat\n\n${profileContext}\n\n# Offre d'emploi\n\n${offerContent}`,
            },
        ],
    });

    return response.content.map((block) => (block.type === 'text' ? block.text : '')).join('');
}
