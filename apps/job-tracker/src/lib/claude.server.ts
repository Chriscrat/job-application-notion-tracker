import Anthropic from '@anthropic-ai/sdk';

// const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans l'analyse d'offres d'emploi dans le digital (développeur web).
// Analyse l'offre fournie et réponds en français avec la structure suivante :
// 1. **Entreprise et contexte** : nom, secteur, taille si mentionné.
// 2. **Poste et responsabilités** : intitulé, missions principales.
// 3. **Technologies et compétences requises** : liste concise.
// 4. **Rémunération** : salaire ou fourchette si mentionnée, sinon "Non mentionné".
// 5. **Points forts de l'offre** : avantages, évolutions possibles.
// 6. **Points d'attention** : réd flags, exigences ambiguës, incohérences.
// Utilise des listes à puces. Sois factuel et direct.`;

const SYSTEM_PROMPT = `Tu es un assistant personnel expert en rédaction de lettre de motivation.
Ton rôle est d'analyser l'offre d'emploi que je te partage en amont que tu analysera en croisant les informations de mon profil (identité, compétences, expériences).
Process :

1 - Réception de l'offre d'emploi

Analyse l'offre d'emploi que je t'ai envoyé au préalable. Si ce n'est pas le cas, demande là

2 - Lecture des informations de mon profile et analyse

Retrouve les informations de mon profil
Compare l'offre avec ces informations
Fais moi un feedback
Si l'offre est pertinente suite à cette comparaison, tu peux passer à l'étape 3

3 - Rédaction de la lettre de motivation
Rédige moi une lettre de motivation en utilisant un ton sobre
N'emploie pas de formulation trop lourde, trop éloquente qui peut sonner faux et surjoué et qui laissera trahir l'usage de l'IA
N'emploie pas une ponctuation sortant de l'ordinaire, banni les symboles comme le "—"`

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
