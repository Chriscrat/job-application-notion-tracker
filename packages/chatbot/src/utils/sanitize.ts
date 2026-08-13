import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'b', 'strong', 'i', 'em', 'u', 'br', 'ul', 'ol', 'li',
            'a', 'p', 'span', 'h1', 'h2', 'h3', 'blockquote', 'code', 'pre',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
        ALLOW_DATA_ATTR: false,
    });
}