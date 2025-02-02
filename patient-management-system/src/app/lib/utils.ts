// birthDate: 1985-08-21T00:00:00.000Z,

export function calcAge(birthDate: Date): number {
    const diff_ms = Date.now() - birthDate.getTime();
    const age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970);
}