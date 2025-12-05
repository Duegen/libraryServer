import confJson from '../../config/lib-config.json' with { type: 'json' };

export type AppConfig = {
    port: number;
    database_mode: string;
    default_roles: string[],
    supervisor_roles: string[] ,
    supervisor_access: number,
    access_roles: Record<string, number>,
    status_roles: Record<string, number>,
    skipRoutesArr: string[];
    pathRoles: Record<string, string[]>,
    get_books_info_level: number,
    pick_book_access: string[],
    edit_account_access: string[],
}

export const config: AppConfig = {...confJson};
export const rolesList = [...Object.keys(config.access_roles), ...Object.keys(config.status_roles)];