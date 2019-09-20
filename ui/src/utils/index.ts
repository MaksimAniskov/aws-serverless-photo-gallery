export function base64encode(str: string) {
    return btoa(
        [...str].map((c, i) => {
            const code = c.charCodeAt(0);
            if (code <= 127) {
                return c;
            }
            return '\\u' + code.toString(16).padStart(4, '0');
        }).join(''));
}
