import type { ChatbotAction } from '@chriscrat/chatbot';
import { analyzeJobOffer } from './claude.functions';

export function createJobTrackerCommands(): ChatbotAction[] {
    return [
        {
            id: 'analyze-offer',
            label: 'Analyser une offre',
            description: 'Analyse détaillée d\'une offre d\'emploi avec Claude',
            inputs: [
                {
                    name: 'content',
                    label: "Contenu de l'offre :",
                    type: 'textarea',
                    placeholder: "Collez ici le contenu de l'offre d'emploi (annonce, description…)",
                    required: true,
                    maxLength: 12000,
                    validation: (value) => (value.trim().length < 50 ? 'Le contenu doit faire au moins 50 caractères.' : null),
                },
            ],
            onExecute: async ({ content }, { showMessage }) => {
                try {
                    // const { analysis } = await analyzeJobOffer({ data: { content } });
                    const result  = await analyzeJobOffer({ data: { content } });
                    showMessage({
                        text: `<h2>Résultat de l'analyse</h2><br/><br/>${result}`,
                        type: 'response',
                        allowHtml: true,
                        animation: 'working',
                    });
                } catch (error) {
                    console.error(error);
                    showMessage({
                        text: "L'analyse a échoué. Vérifie que la clé API Claude est configurée, puis réessaie.",
                        type: 'state',
                        duration: 4000,
                        animation: 'angry',
                    });
                }
            },
        },
    ];
}
