import confJson from '../../config/lib-config.json' with { type: 'json' };

export type AppConfig = {
    port: number;
    //database_mode: string;
    skipRoutesArr: string[];
    pathRoles: Record<string, string[]>
}

export const config: AppConfig ={...confJson}