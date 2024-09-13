
export class PanelOption
{
    routerLink?: string;
    label: string;
    image: string;
    children?: any[];
    opened?: boolean;
    active?: boolean;
    isParent?: boolean;
    arrowImg: string;
    expanded?: boolean = false;
    visibility?: boolean = true; 
}
