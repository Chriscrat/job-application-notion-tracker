# @chriscrat/chatbot

Composant chatbot React avec animations Lottie, système de queue de messages, et effets typewriter.

## ✨ Features

- 🎬 **Animations Lottie** - Avatar animé avec state machine
- 📬 **Queue de messages** - Enchaînement automatique avec délais configurables
- ⌨️ **Effet typewriter** - Animation lettre par lettre pour les réponses
- 🎨 **Effets visuels** - Animations glitch, fade-in/fade-out, curseur clignotant
- 🎯 **Type-safe** - TypeScript strict
- 🎭 **Thèmes** - Support dark/light mode avec Vanilla Extract
- 🔧 **Composable** - Hooks réutilisables (`useMessageQueue`, `useTypewriter`)

## 📦 Installation

```bash
npm install @chriscrat/chatbot
```

**Dépendances peer :**
- `react` ^18.0.0 || ^19.0.0
- `react-dom` ^18.0.0 || ^19.0.0

## 🚀 Utilisation rapide

### Composant complet (avec animations Lottie)

```typescript
import { Chatbot } from '@chriscrat/chatbot';

function App() {
    return <Chatbot />;
}
```

### Utilisation du hook `useMessageQueue`

```typescript
import { useMessageQueue } from '@chriscrat/chatbot';
import type { ChatbotMessage } from '@chriscrat/chatbot';

function MyComponent() {
    const { 
        currentMessage, 
        isExiting,
        showMessage, 
        showMessages,
        skipCurrent,
        clearQueue,
        queueLength
    } = useMessageQueue({
        fadeOutDuration: 300,      // Durée du fade-out (ms)
        delayBetweenMessages: 500, // Pause entre messages (ms)
        onAnimationTrigger: (animation) => {
            // Callback pour déclencher des animations
            console.log('Animation:', animation);
        }
    });

    // Afficher un message
    const handleClick = () => {
        showMessage({
            text: 'Hello!',
            type: 'state',
            duration: 2000,           // Disparaît après 2s
            animation: 'jumpClick'    // Animation Lottie associée
        });
    };

    // Afficher une séquence
    const handleSequence = () => {
        showMessages([
            { text: 'Loading...', type: 'state', duration: 1500, animation: 'thinkClick' },
            { text: 'Processing...', type: 'state', duration: 1500, animation: 'alertClick' },
            { text: 'Done!', type: 'response', animation: 'yesClick' } // Reste affiché
        ]);
    };

    return (
        <div>
            <button onClick={handleClick}>Show Message</button>
            <button onClick={handleSequence}>Show Sequence</button>
            <button onClick={skipCurrent}>Skip Current</button>
            <button onClick={clearQueue}>Clear Queue</button>
            
            {currentMessage && (
                <div>
                    <p>{currentMessage.text}</p>
                    <small>Queue: {queueLength} messages</small>
                </div>
            )}
        </div>
    );
}
```

### Utilisation du hook `useTypewriter`

```typescript
import { useTypewriter } from '@chriscrat/chatbot';

function TypewriterText({ text }: { text: string }) {
    const { displayedText, isTyping, skipAnimation } = useTypewriter({
        text: text,
        speed: 20,      // 20ms par caractère
        enabled: true   // Active l'effet
    });

    return (
        <div onClick={skipAnimation} style={{ cursor: isTyping ? 'pointer' : 'default' }}>
            {displayedText}
            {isTyping && <span className="cursor">|</span>}
        </div>
    );
}
```

## 📋 Types

### `ChatbotMessage`

```typescript
interface ChatbotMessage {
    text: string;                              // Contenu du message
    type: 'state' | 'response';               // Type de message
    duration?: number;                         // Durée d'affichage (ms), undefined = permanent
    animation?: StateMachineAnimations;        // Animation Lottie à déclencher
}
```

### `StateMachineAnimations`

```typescript
type StateMachineAnimations = 
    | 'yesClick'
    | 'noClick'
    | 'alertClick'
    | 'thinkClick'
    | 'jumpClick'
    | 'yesComplete'
    | 'noComplete'
    | 'alertComplete'
    | 'thinkingComplete'
    | 'jumpComplete';
```

## 🎨 Styles

Le package utilise **Vanilla Extract** pour le CSS. Les styles sont automatiquement inclus lors de l'import.

### Thèmes disponibles

```typescript
import { darkTheme, lightTheme } from '@chriscrat/chatbot/theme';

// Appliquer un thème
<div className={darkTheme}>
    <Chatbot />
</div>
```

## 🎯 Exemples avancés

### Séquence d'onboarding

```typescript
const { showMessages } = useMessageQueue({
    delayBetweenMessages: 800
});

useEffect(() => {
    if (isFirstVisit) {
        showMessages([
            { text: 'Welcome!', type: 'state', duration: 2000, animation: 'jumpClick' },
            { text: 'Let me show you around...', type: 'state', duration: 2000, animation: 'thinkClick' },
            { text: 'Click on the avatar to start!', type: 'response', animation: 'yesClick' }
        ]);
    }
}, [isFirstVisit]);
```

### Interaction avec API

```typescript
const handleApiCall = async () => {
    // Message de chargement
    showMessage({ 
        text: 'Fetching data...', 
        type: 'state', 
        duration: 1000,
        animation: 'alertClick' 
    });
    
    try {
        const response = await fetch('/api/chat');
        const data = await response.json();
        
        // Afficher la réponse (reste affichée)
        showMessage({ 
            text: data.message, 
            type: 'response',
            animation: 'yesClick'
        });
    } catch (error) {
        showMessage({ 
            text: 'Error occurred', 
            type: 'state', 
            duration: 3000,
            animation: 'noClick'
        });
    }
};
```

### Fermer un message au clic

```typescript
const handleAvatarClick = () => {
    // Si un message permanent est affiché, le fermer
    if (currentMessage && !currentMessage.duration) {
        skipCurrent();
        return;
    }
    
    // Sinon, afficher un nouveau message
    showMessage({
        text: 'Hello!',
        type: 'state',
        duration: 2000
    });
};
```

## 🎬 Configuration des animations

### Timeline d'exécution

Avec `delayBetweenMessages: 500` :

```
T=0ms     : Message 1 apparaît (fade-in 300ms)
T=2000ms  : Message 1 duration terminée
T=2300ms  : Message 1 fade-out terminé
T=2800ms  : Message 2 apparaît (pause de 500ms)
T=...     : Cycle se répète
```

### Durées recommandées

| Cas d'usage | `fadeOutDuration` | `delayBetweenMessages` | `duration` |
|-------------|-------------------|------------------------|------------|
| Notifications rapides | 200ms | 0-100ms | 1000-2000ms |
| Chatbot standard | 300ms | 300-500ms | 2000-3000ms |
| Storytelling | 500ms | 800-1000ms | 3000-5000ms |

## 📦 Exports disponibles

```typescript
// Composants
export { Chatbot } from '@chriscrat/chatbot';
export { ChatbotBubble } from '@chriscrat/chatbot';

// Hooks
export { useMessageQueue } from '@chriscrat/chatbot';
export { useTypewriter } from '@chriscrat/chatbot';

// Types
export type { 
    ChatbotMessage, 
    ChatbotMessageType,
    ChatbotBubbleProps,
    StateMachineAnimations
} from '@chriscrat/chatbot';
```

## 🛠️ Développement

```bash
# Builder le package
npm run build

# Mode watch
npm run dev

# Type checking
npm run typecheck
```

## 📄 License

MIT © Chriscrat

## 🔗 Repository

[GitHub - notion-job-tracker/packages/chatbot](https://github.com/chriscrat/notion-job-tracker/tree/main/packages/chatbot)
