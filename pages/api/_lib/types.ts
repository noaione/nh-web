export type FileType = "png" | "jpeg";

export interface TemplatingProps {
    image: string;
    page?: number;
    downloadMode?: boolean;
    width: number;
    height: number;
    title: string;
}
