import {jwtDecode} from 'jwt-decode';

interface JwtPayload {
    sub: string;
    exp: number;
    roles?: string[];
}

export const getTokenPayload = (): JwtPayload | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        return jwtDecode<JwtPayload>(token);
    } catch (error) {
        console.error('Failed to decode token', error);
        return null;
    }
};

export const isAdmin = (): boolean => {
    const payload = getTokenPayload();
    return payload?.roles?.includes('ROLE_ADMIN') || false;
};

export const isThisDevice = (deviceId: number): boolean => {
    const deviceIdStr = localStorage.getItem('deviceId');
    if (!deviceIdStr) return false;
    return deviceId === Number(deviceIdStr);
};
