export class helper{

    public cleanNullValues(obj: any): any {
  if (obj === null || obj === undefined) return '';
  if (Array.isArray(obj)) return obj.map((v) => this.cleanNullValues(v));
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      cleaned[key] = this.cleanNullValues(obj[key]);
    }
    return cleaned;
  }
  return obj;
}
}