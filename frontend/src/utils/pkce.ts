// Keep the verifier in memory as requested. It only lives for a single page session.
let currentCodeVerifier: string | null = null;

function dec2hex(dec: number): string {
    return dec.toString(16).padStart(2, "0");
}

function generateRandomString(): string {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join('');
}

function sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a: ArrayBuffer): string {
    // Convert ArrayBuffer to Uint8Array safely, then to string
    const bytes = new Uint8Array(a);
    let str = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function generatePkceChallenge(): Promise<{ verifier: string, challenge: string }> {
    const verifier = generateRandomString();
    const hashed = await sha256(verifier);
    const challenge = base64urlencode(hashed);
    
    // Store in memory
    currentCodeVerifier = verifier;
    
    return { verifier, challenge };
}

export function getCodeVerifier(): string | null {
    return currentCodeVerifier;
}

export function clearCodeVerifier(): void {
    currentCodeVerifier = null;
}
